from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from bson import ObjectId
from app.middleware.auth_middleware import get_current_user
from app.database import db

router = APIRouter(prefix="/api/feed", tags=["feed"])


class CommentRequest(BaseModel):
    text: str


@router.get("")
async def get_investor_feed(
    tag: Optional[str] = None,
    filter_type: Optional[str] = Query("for-you", alias="filter"), # "for-you", "video-only", "all"
    current_user: dict = Depends(get_current_user)
):
    """
    Instagram-style personalized pitch deck feed.
    Matches investor preferences (e.g. software, ai, hardware, fintech, technology)
    and formats as an engaging feed with video player, slide preview, and audit highlights.
    """
    user_prefs = [p.lower() for p in (current_user.get("preferences") or [])]
    user_id_str = str(current_user["_id"])

    # Base query: non-garbage ideas
    query = {"is_garbage_idea": {"$ne": True}}

    if filter_type == "video-only":
        query["has_video"] = True

    if tag and tag.lower() != "all":
        query["tags"] = {"$in": [tag.lower()]}

    # Retrieve decks
    cursor = db.get_db().decks.find(query).sort("created_at", -1).limit(50)
    decks = []
    async for d in cursor:
        d["_id"] = str(d["_id"])
        decks.append(d)

    # Fetch founder profiles for all decks
    founder_ids = list({ObjectId(d["founder_id"]) for d in decks if ObjectId.is_valid(d.get("founder_id", ""))})
    founders_cursor = db.get_db().users.find({"_id": {"$in": founder_ids}})
    founder_map = {}
    async for f in founders_cursor:
        founder_map[str(f["_id"])] = {
            "name": f.get("name", "Founder"),
            "email": f.get("email", ""),
            "picture": f.get("picture", ""),
            "role": f.get("role", "founder"),
            "tier": f.get("tier", "free"),
            "verified": f.get("verified", False),
            "linkedin_url": f.get("linkedin_url", ""),
            "sector": f.get("sector", "")
        }

    # Fetch likes and saves by current user
    user_likes = set()
    user_saves = set()
    likes_cursor = db.get_db().deck_likes.find({"user_id": user_id_str})
    async for lk in likes_cursor:
        user_likes.add(str(lk["deck_id"]))

    saves_cursor = db.get_db().deck_saves.find({"user_id": user_id_str})
    async for sv in saves_cursor:
        user_saves.add(str(sv["deck_id"]))

    # Score and enrich items
    enriched_feed = []
    for d in decks:
        d_id = d["_id"]
        d_tags = [t.lower() for t in (d.get("tags") or [])]

        # Calculate preference relevance match score
        match_count = sum(1 for p in user_prefs if p in d_tags)
        preference_matched = match_count > 0 or not user_prefs

        # Interaction counts
        likes_count = await db.get_db().deck_likes.count_documents({"deck_id": d_id})
        saves_count = await db.get_db().deck_saves.count_documents({"deck_id": d_id})
        
        # Recent comments
        comments_cursor = db.get_db().deck_comments.find({"deck_id": d_id}).sort("created_at", -1).limit(5)
        comments = []
        async for c in comments_cursor:
            comments.append({
                "id": str(c["_id"]),
                "user_name": c.get("user_name", "Investor"),
                "user_picture": c.get("user_picture", ""),
                "text": c.get("text", ""),
                "created_at": c.get("created_at")
            })

        founder = founder_map.get(str(d.get("founder_id")), {
            "name": "Founder",
            "picture": "",
            "verified": False,
            "role": "founder"
        })

        feed_item = {
            "id": d_id,
            "deck_id": d_id,
            "title": d.get("title", "Pitch Deck"),
            "founder": founder,
            "founder_id": d.get("founder_id"),
            "created_at": d.get("created_at"),
            "file_url": d.get("file_url", ""),
            "has_video": d.get("has_video", False),
            "video_url": d.get("video_url", ""),
            "video_thumbnail_url": d.get("video_thumbnail_url", ""),
            "video_duration": d.get("video_duration", 0),
            "tags": d.get("tags") or ["software", "technology"],
            "slides_count": len(d.get("sections") or []),
            "sections_preview": [s.get("title", "") for s in (d.get("sections") or [])[:5]],
            "raw_text_summary": (d.get("raw_text") or "")[:280],
            "language": d.get("language", "en"),
            "market_verdict": d.get("market_verdict") or "HIGH_GROWTH",
            "market_readiness_score": d.get("market_readiness_score", 84),
            "match_count": match_count,
            "preference_matched": preference_matched,
            "is_liked": d_id in user_likes,
            "likes_count": likes_count,
            "is_saved": d_id in user_saves,
            "saves_count": saves_count,
            "comments_count": len(comments),
            "comments": comments
        }
        enriched_feed.append(feed_item)

    # Sort algorithm: preference matches first, then video pitches, then newest
    if filter_type == "for-you" and user_prefs:
        enriched_feed.sort(key=lambda x: (x["match_count"] * 10 + (3 if x["has_video"] else 0)), reverse=True)

    return {
        "feed": enriched_feed,
        "user_preferences": user_prefs,
        "count": len(enriched_feed)
    }


@router.post("/{deck_id}/like")
async def toggle_like(deck_id: str, current_user: dict = Depends(get_current_user)):
    """Like or unlike a pitch deck in the feed."""
    user_id_str = str(current_user["_id"])
    existing = await db.get_db().deck_likes.find_one({"deck_id": deck_id, "user_id": user_id_str})

    if existing:
        await db.get_db().deck_likes.delete_one({"_id": existing["_id"]})
        liked = False
    else:
        await db.get_db().deck_likes.insert_one({
            "deck_id": deck_id,
            "user_id": user_id_str,
            "created_at": datetime.utcnow()
        })
        liked = True

    likes_count = await db.get_db().deck_likes.count_documents({"deck_id": deck_id})
    return {"liked": liked, "likes_count": likes_count}


@router.post("/{deck_id}/save")
async def toggle_save(deck_id: str, current_user: dict = Depends(get_current_user)):
    """Bookmark / save a pitch deck for review."""
    user_id_str = str(current_user["_id"])
    existing = await db.get_db().deck_saves.find_one({"deck_id": deck_id, "user_id": user_id_str})

    if existing:
        await db.get_db().deck_saves.delete_one({"_id": existing["_id"]})
        saved = False
    else:
        await db.get_db().deck_saves.insert_one({
            "deck_id": deck_id,
            "user_id": user_id_str,
            "created_at": datetime.utcnow()
        })
        saved = True

    saves_count = await db.get_db().deck_saves.count_documents({"deck_id": deck_id})
    return {"saved": saved, "saves_count": saves_count}


@router.post("/{deck_id}/comment")
async def add_comment(deck_id: str, req: CommentRequest, current_user: dict = Depends(get_current_user)):
    """Add a question or quick note on a pitch deck in the feed."""
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Comment cannot be empty")

    comment_doc = {
        "deck_id": deck_id,
        "user_id": str(current_user["_id"]),
        "user_name": current_user.get("name", "Investor"),
        "user_picture": current_user.get("picture", ""),
        "user_role": current_user.get("role", "investor"),
        "text": req.text.strip(),
        "created_at": datetime.utcnow()
    }
    res = await db.get_db().deck_comments.insert_one(comment_doc)
    comment_doc["id"] = str(res.inserted_id)
    if "_id" in comment_doc:
        del comment_doc["_id"]

    return {"comment": comment_doc}
