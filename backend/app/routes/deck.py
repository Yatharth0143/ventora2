from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
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
    current_user: dict = Depends(get_current_user)
):
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    # Upload to Cloudinary
    cloud_res = cloudinary_service.upload_deck(contents, file.filename)

    # Save initial record
    deck_doc = await deck_service.save_deck(
        founder_id=current_user["_id"],
        title=title,
        file_url=cloud_res.get("secure_url") or cloud_res.get("url"),
        public_id=cloud_res.get("public_id"),
        filename=file.filename,
        language=language,
    )

    # Parse PDF contents
    raw_text = ""
    sections = []
    try:
        raw_text, page_texts = deck_service.parse_deck_text(contents)
        sections = deck_service.build_sections(page_texts)
        await deck_service.update_deck(deck_doc["_id"], {
            "raw_text": raw_text,
            "sections": sections,
            "status": "parsed"
        })
        deck_doc["raw_text"] = raw_text
        deck_doc["sections"] = sections
        deck_doc["status"] = "parsed"
    except Exception as e:
        # Fallback text for non-PDF or encrypted
        raw_text = f"Startup: {title}\nSummary pitch presentation file uploaded."
        await deck_service.update_deck(deck_doc["_id"], {
            "raw_text": raw_text,
            "status": "uploaded"
        })

    # Log to tamper-evident hash chain
    await hash_chain_service.append_event(
        event_type="deck_upload",
        payload={"deck_id": deck_doc["_id"], "title": title, "filename": file.filename},
        user_id=current_user["_id"]
    )

    return {"deck": deck_doc}


@router.get("/list")
async def list_decks(current_user: dict = Depends(get_current_user)):
    # Investors and admins can view all uploaded decks for analysis and screening
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
    if str(deck.get("founder_id")) != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Access denied")
    # Log view to hash chain
    await hash_chain_service.append_event(
        event_type="deck_view",
        payload={"deck_id": deck_id, "title": deck.get("title")},
        user_id=current_user["_id"]
    )

    return {"deck": deck}

