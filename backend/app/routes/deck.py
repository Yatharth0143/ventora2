from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from typing import Optional
from app.middleware.auth_middleware import get_current_user
from app.services import deck_service, cloudinary_service, hash_chain_service
from bson import ObjectId
from app.database import db

router = APIRouter(prefix="/api/deck", tags=["deck"])


@router.post("/upload")
async def upload_deck(
    file: UploadFile = File(...),
    title: str = Form(...),
    language: str = Form("en"),
    description: Optional[str] = Form(""),
    tags: Optional[str] = Form(""),
    video: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    # Upload PDF to Cloudinary
    cloud_res = cloudinary_service.upload_deck(contents, file.filename)

    # Upload optional pitch video
    video_url = ""
    video_public_id = ""
    thumbnail_url = ""
    if video and video.filename:
        try:
            video_bytes = await video.read()
            if video_bytes:
                video_res = cloudinary_service.upload_video(video_bytes, video.filename)
                video_url = video_res.get("secure_url") or video_res.get("url", "")
                video_public_id = video_res.get("public_id", "")
                thumbnail_url = video_res.get("thumbnail_url", "")
        except Exception as ve:
            print(f"Video upload warning: {ve}")

    # Parse tags from comma-separated string
    tag_list = [t.strip().lower() for t in tags.split(",") if t.strip()] if tags else []

    # Save initial record
    deck_doc = await deck_service.save_deck(
        founder_id=current_user["_id"],
        title=title,
        file_url=cloud_res.get("secure_url") or cloud_res.get("url"),
        public_id=cloud_res.get("public_id"),
        filename=file.filename,
        language=language,
        description=description or "",
        video_url=video_url,
        video_public_id=video_public_id,
        thumbnail_url=thumbnail_url,
        tags=tag_list,
    )

    # Parse PDF contents
    raw_text = ""
    sections = []
    try:
        raw_text, page_texts = deck_service.parse_deck_text(contents)
        sections = deck_service.build_sections(page_texts)
        auto_sectors = deck_service.auto_detect_sectors(raw_text)
        auto_tags = deck_service.auto_generate_tags(raw_text, title)
        combined_tags = list(set(tag_list + auto_tags))

        await deck_service.update_deck(deck_doc["_id"], {
            "raw_text": raw_text,
            "sections": sections,
            "sectors": auto_sectors,
            "tags": combined_tags,
            "status": "parsed",
            "has_video": bool(video_url),
        })
        deck_doc["raw_text"] = raw_text
        deck_doc["sections"] = sections
        deck_doc["sectors"] = auto_sectors
        deck_doc["tags"] = combined_tags
        deck_doc["status"] = "parsed"
        deck_doc["has_video"] = bool(video_url)
    except Exception as e:
        raw_text = f"Startup: {title}\nSummary pitch presentation file uploaded."
        auto_sectors = deck_service.auto_detect_sectors(title)
        auto_tags = deck_service.auto_generate_tags(title, title)
        combined_tags = list(set(tag_list + auto_tags))
        await deck_service.update_deck(deck_doc["_id"], {
            "raw_text": raw_text,
            "sectors": auto_sectors,
            "tags": combined_tags,
            "status": "uploaded",
            "has_video": bool(video_url),
        })
        deck_doc["raw_text"] = raw_text
        deck_doc["sectors"] = auto_sectors
        deck_doc["tags"] = combined_tags
        deck_doc["has_video"] = bool(video_url)

    # Log to tamper-evident hash chain
    await hash_chain_service.append_event(
        event_type="deck_upload",
        payload={"deck_id": deck_doc["_id"], "title": title, "filename": file.filename, "has_video": bool(video_url)},
        user_id=current_user["_id"]
    )

    return {"deck": deck_doc}


@router.get("/list")
async def list_decks(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") in ["investor", "admin"]:
        cursor = db.get_db().decks.find({"is_garbage_idea": {"$ne": True}}).sort("created_at", -1)
        decks = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            decks.append(doc)
        return {"decks": decks}

    decks = await deck_service.list_user_decks(current_user["_id"])
    return {"decks": decks}


@router.get("/{deck_id}")
async def get_deck_detail(deck_id: str, current_user: dict = Depends(get_current_user)):
    deck = await deck_service.get_deck(deck_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    await deck_service.increment_views(deck_id)

    # Log view to hash chain
    await hash_chain_service.append_event(
        event_type="deck_view",
        payload={"deck_id": deck_id, "title": deck.get("title")},
        user_id=current_user["_id"]
    )

    return {"deck": deck}
