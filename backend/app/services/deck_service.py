import re
import io
from datetime import datetime
from bson import ObjectId
from PyPDF2 import PdfReader
from app.database import db

COMMON_HEADINGS = [
    "Problem", "Solution", "Market Opportunity", "Market Size",
    "Product", "Traction", "Business Model", "Revenue",
    "Financials", "Competition", "Team", "The Ask", "Fundraising"
]

TAG_KEYWORDS = {
    "software": ["software", "saas", "platform", "app", "web app", "mobile app", "cloud", "devtools"],
    "ai": ["ai", "artificial intelligence", "machine learning", "ml", "deep learning", "llm", "nlp", "computer vision", "neural", "genai", "generative"],
    "hardware": ["hardware", "iot", "device", "sensor", "chip", "semiconductor", "embedded", "robotics", "drone"],
    "fintech": ["fintech", "upi", "payment", "lending", "credit", "neobank", "insurance", "insurtech", "banking", "wallet", "defi", "blockchain", "invoice"],
    "healthcare": ["health", "healthcare", "healthtech", "medtech", "pharma", "biotech", "telemedicine", "diagnostics", "clinical", "patient", "hospital", "wellness"],
    "healthtech": ["health", "medtech", "pharma", "biotech", "telemedicine", "diagnostics", "clinical", "patient", "hospital", "wellness"],
    "edtech": ["edtech", "education", "learning", "student", "school", "course", "tutoring", "upskilling", "lms"],
    "d2c": ["d2c", "consumer", "brand", "ecommerce", "e-commerce", "retail", "cpg", "fmcg", "fashion"],
    "cleantech": ["cleantech", "climate", "solar", "renewable", "ev", "electric vehicle", "sustainability", "carbon", "green"],
    "agritech": ["agritech", "agriculture", "farm", "crop", "rural", "farmer", "agri"],
    "logistics": ["logistics", "supply chain", "warehouse", "freight", "delivery", "fulfillment", "fleet"],
    "deeptech": ["deeptech", "quantum", "space", "aerospace", "material science", "nanotechnology"],
    "b2b": ["b2b", "enterprise", "business", "smb", "sme", "corporate"],
    "marketplace": ["marketplace", "aggregator", "platform economy", "two-sided"],
    "proptech": ["proptech", "real estate", "property", "construction", "housing"],
}

SECTOR_KEYWORDS = TAG_KEYWORDS


def auto_detect_sectors(text: str) -> list[str]:
    """Auto-detect sectors from deck text using keyword matching."""
    text_lower = text.lower()
    detected = []
    for sector, keywords in TAG_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                detected.append(sector)
                break
    return detected[:5]


def auto_detect_tags(raw_text: str, title: str = "") -> list[str]:
    """Auto-detect sector/interest tags from pitch deck text."""
    combined = (title + " " + raw_text).lower()
    detected = []
    for tag, keywords in TAG_KEYWORDS.items():
        for kw in keywords:
            if kw in combined:
                detected.append(tag)
                break
    return detected[:8]


def auto_generate_tags(text: str, title: str) -> list[str]:
    return auto_detect_tags(text, title)


def parse_deck_text(file_bytes: bytes) -> tuple[str, list[dict]]:
    """Extract raw text and page-by-page text."""
    reader = PdfReader(io.BytesIO(file_bytes))
    page_texts = []
    full_text_list = []

    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        clean_page_text = text.strip()
        page_texts.append({"page_number": i + 1, "text": clean_page_text})
        full_text_list.append(clean_page_text)

    raw_text = "\n\n".join(full_text_list)
    return raw_text, page_texts


def build_sections(page_texts: list[dict]) -> list[dict]:
    """Group pages into logical sections with quotes."""
    sections = []
    for item in page_texts:
        p_num = item["page_number"]
        txt = item["text"]
        lines = [line.strip() for line in txt.split("\n") if line.strip()]
        title = lines[0] if lines else f"Page {p_num}"

        for heading in COMMON_HEADINGS:
            if heading.lower() in txt.lower():
                title = heading
                break

        sentences = [s.strip() for s in re.split(r'[.!?]+', txt) if len(s.strip()) > 15]

        sections.append({
            "title": title,
            "content": txt,
            "page_number": p_num,
            "quotes": sentences[:10],
        })
    return sections


async def save_deck(founder_id: str, title: str, file_url: str, public_id: str, filename: str, language: str = "en", description: str = "", video_url: str = "", video_public_id: str = "", thumbnail_url: str = "", video_data: dict = None, tags: list = None) -> dict:
    founder_name = "Founder"
    founder_picture = ""
    try:
        founder = await db.get_db().users.find_one({"_id": ObjectId(founder_id)})
        if founder:
            founder_name = founder.get("name", "Founder")
            founder_picture = founder.get("picture", "")
    except Exception:
        pass

    final_video_url = video_url or (video_data.get("secure_url") if video_data else "")
    final_video_id = video_public_id or (video_data.get("public_id") if video_data else "")
    final_thumb_url = thumbnail_url or (video_data.get("thumbnail_url") if video_data else "")

    deck_doc = {
        "founder_id": str(founder_id),
        "founder_name": founder_name,
        "founder_picture": founder_picture,
        "title": title,
        "description": description or f"Pitch deck presentation for {title}.",
        "file_url": file_url,
        "video_url": final_video_url or "",
        "video_public_id": final_video_id or "",
        "thumbnail_url": final_thumb_url or "",
        "has_video": bool(final_video_url),
        "cloudinary_public_id": public_id,
        "original_filename": filename,
        "language": language,
        "tags": tags or [],
        "sectors": [],
        "stage": "Seed",
        "sections": [],
        "raw_text": "",
        "status": "uploaded",
        "likes": [],
        "bookmarks": [],
        "views": 1,
        "is_garbage_idea": False,
        "created_at": datetime.utcnow(),
    }

    res = await db.get_db().decks.insert_one(deck_doc)
    deck_doc["_id"] = str(res.inserted_id)
    return deck_doc


async def get_deck(deck_id: str) -> dict | None:
    try:
        doc = await db.get_db().decks.find_one({"_id": ObjectId(deck_id)})
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc
    except Exception:
        return None


async def list_user_decks(founder_id: str) -> list[dict]:
    cursor = db.get_db().decks.find({"founder_id": str(founder_id)}).sort("created_at", -1)
    decks = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        decks.append(doc)
    return decks


async def update_deck(deck_id: str, update_fields: dict) -> dict | None:
    try:
        await db.get_db().decks.update_one({"_id": ObjectId(deck_id)}, {"$set": update_fields})
        return await get_deck(deck_id)
    except Exception:
        return None


async def get_feed(filters: dict = None, sort_by: str = "smart", skip: int = 0, limit: int = 30, user_id: str = None) -> list[dict]:
    """Get social feed of pitch decks with keyword/tag search and intelligent ranking."""
    query = {"is_garbage_idea": {"$ne": True}}

    if filters:
        conditions = []
        if filters.get("search"):
            st = filters["search"].strip()
            regex = {"$regex": st, "$options": "i"}
            conditions.append({
                "$or": [
                    {"title": regex},
                    {"description": regex},
                    {"tags": regex},
                    {"sectors": regex},
                    {"founder_name": regex},
                    {"raw_text": regex},
                ]
            })
        if filters.get("tags"):
            tag_regexes = [{"tags": {"$regex": f"^{re.escape(t.strip())}$", "$options": "i"}} for t in filters["tags"]]
            conditions.append({"$or": tag_regexes})
        if filters.get("sectors"):
            sector_regexes = [{"sectors": {"$regex": f"^{re.escape(s.strip())}$", "$options": "i"}} for s in filters["sectors"]]
            conditions.append({"$or": sector_regexes})
        if filters.get("has_video"):
            conditions.append({"video_url": {"$nin": ["", None]}})

        if conditions:
            query["$and"] = conditions

    if sort_by == "trending":
        sort_spec = [("views", -1), ("created_at", -1)]
    elif sort_by == "latest":
        sort_spec = [("created_at", -1)]
    elif sort_by == "popular":
        sort_spec = [("views", -1)]
    elif sort_by == "videos":
        sort_spec = [("video_url", -1), ("created_at", -1)]
    else:
        sort_spec = [("created_at", -1)]

    cursor = db.get_db().decks.find(query).sort(sort_spec).skip(skip).limit(limit)
    
    decks = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        doc_likes = doc.get("likes", [])
        doc_bookmarks = doc.get("bookmarks", [])
        doc["likes_count"] = len(doc_likes)
        doc["bookmarks_count"] = len(doc_bookmarks)
        doc["is_liked"] = str(user_id) in [str(x) for x in doc_likes] if user_id else False
        doc["is_bookmarked"] = str(user_id) in [str(x) for x in doc_bookmarks] if user_id else False
        
        if not doc.get("tags"):
            detected = auto_detect_sectors(doc.get("raw_text", "") + " " + doc.get("title", ""))
            doc["tags"] = detected or ["software", "seed"]
        if not doc.get("description"):
            doc["description"] = f"{doc.get('title', 'Innovative Startup')} is building next-generation technology for the Indian market."
        if not doc.get("founder_name"):
            doc["founder_name"] = "Startup Founder"

        decks.append(doc)
    
    if sort_by == "smart":
        def score_deck(d):
            score = 0
            if d.get("video_url"):
                score += 30
            score += d.get("likes_count", 0) * 10
            score += min(d.get("views", 0), 50)
            score += min(len(d.get("sections", [])), 20)
            return score
        decks.sort(key=score_deck, reverse=True)

    return decks


async def toggle_like(deck_id: str, user_id: str) -> dict:
    deck = await db.get_db().decks.find_one({"_id": ObjectId(deck_id)})
    if not deck:
        return {"error": "Deck not found"}
    
    likes = [str(x) for x in deck.get("likes", [])]
    uid_str = str(user_id)
    if uid_str in likes:
        likes.remove(uid_str)
        action = "unliked"
    else:
        likes.append(uid_str)
        action = "liked"
    
    await db.get_db().decks.update_one(
        {"_id": ObjectId(deck_id)},
        {"$set": {"likes": likes}}
    )
    return {"action": action, "likes_count": len(likes)}


async def toggle_bookmark(deck_id: str, user_id: str) -> dict:
    deck = await db.get_db().decks.find_one({"_id": ObjectId(deck_id)})
    if not deck:
        return {"error": "Deck not found"}
    
    bookmarks = [str(x) for x in deck.get("bookmarks", [])]
    uid_str = str(user_id)
    if uid_str in bookmarks:
        bookmarks.remove(uid_str)
        action = "removed"
    else:
        bookmarks.append(uid_str)
        action = "bookmarked"
    
    await db.get_db().decks.update_one(
        {"_id": ObjectId(deck_id)},
        {"$set": {"bookmarks": bookmarks}}
    )
    return {"action": action, "bookmarks_count": len(bookmarks)}


async def increment_views(deck_id: str) -> None:
    try:
        await db.get_db().decks.update_one(
            {"_id": ObjectId(deck_id)},
            {"$inc": {"views": 1}}
        )
    except Exception:
        pass
