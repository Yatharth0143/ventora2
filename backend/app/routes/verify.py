from fastapi import APIRouter
from app.services import hash_chain_service

router = APIRouter(prefix="/api/verify", tags=["verify"])


@router.get("/chain")
async def verify_chain():
    """Public endpoint to verify the tamper-evident hash chain from genesis."""
    res = await hash_chain_service.verify_chain()
    return res


@router.get("/entry/{entry_id}")
async def verify_entry(entry_id: str):
    """Public endpoint to verify an individual block in the chain."""
    res = await hash_chain_service.verify_single(entry_id)
    return res

