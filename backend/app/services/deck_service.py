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

        # Extract sentence quotes
        sentences = [s.strip() for s in re.split(r'[.!?]+', txt) if len(s.strip()) > 15]

        sections.append({
            "title": title,
            "content": txt,
            "page_number": p_num,
            "quotes": sentences[:10],
        })
    return sections


async def save_deck(founder_id: str, title: str, file_url: str, public_id: str, filename: str, language: str = "en") -> dict:
    deck_doc = {
        "founder_id": str(founder_id),
        "title": title,
        "file_url": file_url,
        "cloudinary_public_id": public_id,
        "original_filename": filename,
        "language": language,
        "sections": [],
        "raw_text": "",
        "status": "uploaded",
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

