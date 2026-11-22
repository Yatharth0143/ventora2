from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from app.middleware.auth_middleware import get_current_user
from app.services import market_analysis_service, deck_service
from app.database import db

router = APIRouter(prefix="/api/market-analysis", tags=["market-analysis"])


class CustomAnalysisRequest(BaseModel):
    title: str
    text: str
    sector: Optional[str] = None


@router.post("/{deck_id}/run")
async def run_analysis(deck_id: str, current_user: dict = Depends(get_current_user)):
    """Run full market intelligence analysis for a pitch deck. Accessible to both founders and investors."""
    try:
        result = await market_analysis_service.run_market_analysis(deck_id, current_user)
        return {"success": True, "analysis": result}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Market analysis failed: {str(e)}")


@router.get("/{deck_id}")
async def get_analysis(deck_id: str, current_user: dict = Depends(get_current_user)):
    """Get saved market analysis or run a new one if not yet analyzed."""
    analysis = await market_analysis_service.get_market_analysis(deck_id)
    if not analysis:
        # Auto-run if not yet analyzed
        try:
            analysis = await market_analysis_service.run_market_analysis(deck_id, current_user)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))

    return {"success": True, "analysis": analysis}


@router.post("/custom/analyze")
async def analyze_custom_pitch(req: CustomAnalysisRequest, current_user: dict = Depends(get_current_user)):
    """Allow quick market analysis by pasting pitch deck copy or summary text directly."""
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Pitch text cannot be empty")

    fallback = market_analysis_service.generate_fallback_market_analysis(req.title, req.text)
    if req.sector:
        fallback["sector"] = req.sector

    return {"success": True, "analysis": fallback}


@router.get("/")
async def list_recent_analyses(current_user: dict = Depends(get_current_user)):
    """List recently analyzed decks with their market scores and verdicts."""
    cursor = db.get_db().market_analyses.find({}).sort("created_at", -1).limit(20)
    items = []
    async for doc in cursor:
        items.append({
            "deck_id": doc.get("deck_id"),
            "deck_title": doc.get("deck_title"),
            "sector": doc.get("sector"),
            "market_status": doc.get("market_availability", {}).get("status"),
            "readiness_score": doc.get("market_availability", {}).get("market_readiness_score"),
            "verdict": doc.get("strategic_verdict", {}).get("verdict_code"),
            "tam_india": doc.get("market_size", {}).get("national_india", {}).get("tam"),
            "tam_global": doc.get("market_size", {}).get("global", {}).get("tam"),
            "created_at": doc.get("created_at"),
        })
    return {"analyses": items}
