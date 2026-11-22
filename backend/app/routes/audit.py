from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.middleware.auth_middleware import get_current_user
from app.services import audit_engine, hash_chain_service, audit_rag
from bson import ObjectId
from app.database import db
from datetime import datetime


class RagQueryRequest(BaseModel):
    query: str


async def verify_deck_owner(deck_id: str, current_user: dict):
    if not ObjectId.is_valid(deck_id):
        raise HTTPException(status_code=404, detail="Deck not found")

    deck = await db.get_db().decks.find_one({"_id": ObjectId(deck_id)})

    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    is_owner = str(deck.get("founder_id")) == str(current_user.get("_id"))
    is_screenable = current_user.get("role") in ["investor", "admin"]
    if not is_owner and not is_screenable:
        raise HTTPException(status_code=403, detail="Access denied")

    return deck
router = APIRouter(prefix="/api/audit", tags=["audit"])


@router.post("/{deck_id}/run")
async def run_deck_audit(deck_id: str, current_user: dict = Depends(get_current_user)):
    deck = await verify_deck_owner(deck_id, current_user)
    findings = await audit_engine.run_audit(deck_id)

    # Check for red flags to set initial 7-day verdict
    high_sev = [f for f in findings if f.get("severity") == "high"]
    is_garbage = len(high_sev) > 0
    verdict = "GARBAGE_IDEA" if is_garbage else "INVESTABLE"

    await db.get_db().decks.update_one(
        {"_id": ObjectId(deck_id)},
        {"$set": {
            "verdict": verdict,
            "is_garbage_idea": is_garbage,
            "red_flags_count": len(high_sev),
            "audited_at": datetime.utcnow()
        }}
    )

    return {
        "deck_id": deck_id,
        "findings_count": len(findings),
        "status": "completed",
        "verdict": verdict,
        "is_garbage_idea": is_garbage,
        "findings": findings
    }


@router.get("/{deck_id}/findings")
async def get_deck_findings(deck_id: str, current_user: dict = Depends(get_current_user)):
    await verify_deck_owner(deck_id, current_user)
    user_tier = current_user.get("tier", "free")
    result = await audit_engine.get_findings(deck_id, user_tier=user_tier)
    return result


@router.get("/{deck_id}/fit")
async def get_fit_table(deck_id: str, current_user: dict = Depends(get_current_user)):
    await verify_deck_owner(deck_id, current_user)
    fit = await audit_engine.compute_fit_table(deck_id)
    return fit


@router.post("/{deck_id}/rag-query")
async def run_rag_query(
    deck_id: str,
    req: RagQueryRequest,
    current_user: dict = Depends(get_current_user)
):
    """Query pitch deck with minimal RAG pipeline using Sarvam AI."""
    deck = await verify_deck_owner(deck_id, current_user)
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    result = await audit_rag.query_deck_with_rag(deck, req.query.strip())
    return {"deck_id": deck_id, "rag_result": result}


@router.post("/{deck_id}/rag-audit")
async def run_rag_audit(
    deck_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Run comprehensive 4-pillar RAG audit pipeline using Sarvam AI."""
    deck = await verify_deck_owner(deck_id, current_user)
    result = await audit_rag.run_comprehensive_rag_audit(deck)

    # Persist verdict to deck document
    await db.get_db().decks.update_one(
        {"_id": ObjectId(deck_id)},
        {"$set": {
            "verdict": result["overall_verdict"],
            "is_garbage_idea": result["is_garbage_idea"],
            "red_flags_count": result["red_flag_count"],
            "rag_audited_at": datetime.utcnow()
        }}
    )

    return {"deck_id": deck_id, "rag_audit": result}

