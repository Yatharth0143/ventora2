from fastapi import APIRouter, Depends, HTTPException
from app.middleware.auth_middleware import get_current_user
from app.services import audit_engine, hash_chain_service

router = APIRouter(prefix="/api/audit", tags=["audit"])


@router.post("/{deck_id}/run")
async def run_deck_audit(deck_id: str, current_user: dict = Depends(get_current_user)):
    findings = await audit_engine.run_audit(deck_id)
    return {
        "deck_id": deck_id,
        "findings_count": len(findings),
        "status": "completed",
        "findings": findings
    }


@router.get("/{deck_id}/findings")
async def get_deck_findings(deck_id: str, current_user: dict = Depends(get_current_user)):
    user_tier = current_user.get("tier", "free")
    result = await audit_engine.get_findings(deck_id, user_tier=user_tier)
    return result


@router.get("/{deck_id}/fit")
async def get_fit_table(deck_id: str, current_user: dict = Depends(get_current_user)):
    fit = await audit_engine.compute_fit_table(deck_id)
    return fit

