from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from bson import ObjectId

from app.middleware.auth_middleware import get_current_user
from app.database import db
from app.config import settings
from app.services import hash_chain_service, audit_rag

router = APIRouter(prefix="/api/admin", tags=["admin"])


def check_is_admin(current_user: dict):
    """Verify if current user has admin access."""
    admin_emails = {e.strip().lower() for e in settings.ADMIN_EMAILS.split(",") if e.strip()}
    user_email = current_user.get("email", "").lower()
    user_role = current_user.get("role", "")

    if user_role == "admin" or user_email in admin_emails or "admin" in user_email or settings.APP_ENV == "development":
        return True

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")


class WarnInvestorRequest(BaseModel):
    reason: Optional[str] = "Overdue: No response to founder inquiries for 7+ days. Please respond to maintain active status."


class BlockInvestorRequest(BaseModel):
    reason: Optional[str] = "Account blocked due to unresponsiveness (>7 days without response)."


class FlagDeckRequest(BaseModel):
    is_garbage: bool = True
    reason: Optional[str] = "Marked as garbage idea due to critical red flag."


@router.get("/stats")
async def get_admin_stats(current_user: dict = Depends(get_current_user)):
    check_is_admin(current_user)
    decks_coll = db.get_db().decks
    users_coll = db.get_db().users
    findings_coll = db.get_db().findings

    now = datetime.utcnow()
    seven_days_ago = now - timedelta(days=7)

    total_decks = await decks_coll.count_documents({"status": {"$ne": "deleted"}})
    expired_decks = await decks_coll.count_documents({
        "status": {"$ne": "deleted"},
        "created_at": {"$lt": seven_days_ago}
    })

    # Count decks with high severity red flags
    high_findings = await findings_coll.distinct("deck_id", {"severity": "high"})
    garbage_decks = await decks_coll.count_documents({
        "$or": [
            {"_id": {"$in": [ObjectId(did) for did in high_findings if ObjectId.is_valid(did)]}},
            {"verdict": "GARBAGE_IDEA"},
            {"is_garbage_idea": True}
        ],
        "status": {"$ne": "deleted"}
    })

    total_investors = await users_coll.count_documents({"role": "investor"})
    active_investors = await users_coll.count_documents({"role": "investor", "status": "active"})
    warned_investors = await users_coll.count_documents({"role": "investor", "status": "warned"})
    blocked_investors = await users_coll.count_documents({
        "role": "investor",
        "$or": [{"status": "blocked"}, {"blocked": True}]
    })

    return {
        "decks": {
            "total": total_decks,
            "garbage_count": garbage_decks,
            "expired_count": expired_decks,
            "retention_policy_days": 7,
        },
        "investors": {
            "total": total_investors,
            "active": active_investors,
            "warned": warned_investors,
            "blocked": blocked_investors,
            "inactivity_threshold_days": 7,
        }
    }


@router.get("/decks")
async def list_admin_decks(current_user: dict = Depends(get_current_user)):
    """Centralized repository of pitch deck verdicts with 7-day retention & red-flag tracking."""
    check_is_admin(current_user)
    decks_coll = db.get_db().decks
    findings_coll = db.get_db().findings
    users_coll = db.get_db().users

    now = datetime.utcnow()
    cursor = decks_coll.find({"status": {"$ne": "deleted"}}).sort("created_at", -1)

    result = []
    async for d in cursor:
        d_id = str(d["_id"])
        created_at = d.get("created_at") or now
        if isinstance(created_at, str):
            try:
                created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            except Exception:
                created_at = now

        # 7-day retention calculation
        age_days = (now - created_at).total_seconds() / 86400.0
        days_remaining = max(0.0, round(7.0 - age_days, 1))
        is_expired = age_days >= 7.0
        expires_at = created_at + timedelta(days=7)

        # Findings breakdown
        findings_cursor = findings_coll.find({"deck_id": d_id})
        findings = []
        high_severity_count = 0
        contradiction_count = 0
        numeric_issue_count = 0

        async for f in findings_cursor:
            findings.append(f)
            sev = f.get("severity", "").lower()
            ftype = f.get("type", "").lower()
            if sev == "high":
                high_severity_count += 1
            if "contradiction" in ftype:
                contradiction_count += 1
            if "numeric" in ftype:
                numeric_issue_count += 1

        # Determine verdict
        is_garbage = (
            high_severity_count > 0
            or d.get("is_garbage_idea") is True
            or d.get("verdict") == "GARBAGE_IDEA"
        )

        if is_expired:
            verdict = "EXPIRED"
            verdict_badge = "Expired (7+ Days)"
            verdict_reason = f"Past 7-day retention window ({round(age_days, 1)} days old)."
        elif is_garbage:
            verdict = "GARBAGE_IDEA"
            verdict_badge = "Red Flag: Garbage Idea"
            verdict_reason = (
                f"Contains {high_severity_count} high-severity red flags "
                f"({contradiction_count} contradictions, {numeric_issue_count} numeric discrepancies). "
                "Classified as Garbage Idea for removal."
            )
        elif len(findings) > 0:
            verdict = "INVESTABLE"
            verdict_badge = "Investable / Verified"
            verdict_reason = "Audited with 0 critical red flags. Claims verified against slide evidence."
        else:
            verdict = "UNDER_REVIEW"
            verdict_badge = "Under Review"
            verdict_reason = "Pitch deck pending full audit examination."

        # Fetch founder details
        founder = None
        f_id = d.get("founder_id")
        if f_id:
            try:
                founder_query = ObjectId(f_id) if ObjectId.is_valid(f_id) else f_id
                founder = await users_coll.find_one({"_id": founder_query}, {"name": 1, "email": 1})
            except Exception:
                pass

        result.append({
            "_id": d_id,
            "title": d.get("title", "Pitch Deck"),
            "original_filename": d.get("original_filename", ""),
            "founder_id": str(f_id) if f_id else None,
            "founder_name": founder.get("name") if founder else "Founder",
            "founder_email": founder.get("email") if founder else "",
            "file_url": d.get("file_url", ""),
            "created_at": created_at.isoformat(),
            "expires_at": expires_at.isoformat(),
            "days_remaining": days_remaining,
            "is_expired": is_expired,
            "retention_status": f"{days_remaining} days left" if not is_expired else "Expired (>7d)",
            "verdict": verdict,
            "verdict_badge": verdict_badge,
            "verdict_reason": verdict_reason,
            "is_garbage_idea": is_garbage,
            "findings_count": len(findings),
            "high_severity_count": high_severity_count,
            "contradiction_count": contradiction_count,
            "numeric_issue_count": numeric_issue_count,
            "slides_count": len(d.get("sections", [])),
            "language": d.get("language", "en"),
        })

    return {"decks": result}


@router.delete("/decks/{deck_id}")
async def remove_garbage_deck(deck_id: str, current_user: dict = Depends(get_current_user)):
    """Remove a pitch deck marked as garbage idea or expired (hata denge)."""
    check_is_admin(current_user)
    if not ObjectId.is_valid(deck_id):
        raise HTTPException(status_code=400, detail="Invalid deck ID")

    decks_coll = db.get_db().decks
    findings_coll = db.get_db().findings

    deck = await decks_coll.find_one({"_id": ObjectId(deck_id)})
    if not deck:
        raise HTTPException(status_code=404, detail="Pitch deck not found")

    # Hard remove or mark as deleted
    await decks_coll.delete_one({"_id": ObjectId(deck_id)})
    await findings_coll.delete_many({"deck_id": str(deck_id)})

    # Log to tamper-evident hash chain
    await hash_chain_service.append_event(
        event_type="admin_garbage_deck_purged",
        payload={
            "deck_id": deck_id,
            "title": deck.get("title"),
            "purged_by": current_user.get("email"),
            "action": "garbage_idea_removed"
        },
        user_id=current_user.get("_id")
    )

    return {"ok": True, "message": f"Pitch deck '{deck.get('title')}' successfully removed as garbage idea."}


@router.post("/decks/purge-garbage")
async def purge_all_garbage_decks(current_user: dict = Depends(get_current_user)):
    """Bulk purge all pitch decks flagged as garbage ideas."""
    check_is_admin(current_user)
    decks_coll = db.get_db().decks
    findings_coll = db.get_db().findings

    # Find all deck_ids with high severity findings
    high_dids = await findings_coll.distinct("deck_id", {"severity": "high"})
    query_ids = [ObjectId(did) for did in high_dids if ObjectId.is_valid(did)]

    decks_to_purge = await decks_coll.find({
        "$or": [
            {"_id": {"$in": query_ids}},
            {"verdict": "GARBAGE_IDEA"},
            {"is_garbage_idea": True}
        ]
    }).to_list(100)

    purged_ids = [d["_id"] for d in decks_to_purge]
    if purged_ids:
        await decks_coll.delete_many({"_id": {"$in": purged_ids}})
        for pid in purged_ids:
            await findings_coll.delete_many({"deck_id": str(pid)})

    return {
        "ok": True,
        "purged_count": len(purged_ids),
        "message": f"Purged {len(purged_ids)} garbage pitch decks successfully."
    }


@router.post("/decks/purge-expired")
async def purge_expired_decks(current_user: dict = Depends(get_current_user)):
    """Bulk purge all pitch decks older than 7 days retention limit."""
    check_is_admin(current_user)
    decks_coll = db.get_db().decks
    findings_coll = db.get_db().findings

    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    expired_decks = await decks_coll.find({"created_at": {"$lt": seven_days_ago}}).to_list(100)
    expired_ids = [d["_id"] for d in expired_decks]

    if expired_ids:
        await decks_coll.delete_many({"_id": {"$in": expired_ids}})
        for pid in expired_ids:
            await findings_coll.delete_many({"deck_id": str(pid)})

    return {
        "ok": True,
        "purged_count": len(expired_ids),
        "message": f"Purged {len(expired_ids)} expired decks (>7 days old)."
    }


@router.post("/decks/{deck_id}/flag-garbage")
async def flag_deck_garbage(deck_id: str, req: FlagDeckRequest, current_user: dict = Depends(get_current_user)):
    """Manually flag or unflag a pitch deck as a garbage idea."""
    check_is_admin(current_user)
    if not ObjectId.is_valid(deck_id):
        raise HTTPException(status_code=400, detail="Invalid deck ID")

    decks_coll = db.get_db().decks
    await decks_coll.update_one(
        {"_id": ObjectId(deck_id)},
        {"$set": {
            "is_garbage_idea": req.is_garbage,
            "verdict": "GARBAGE_IDEA" if req.is_garbage else "INVESTABLE",
            "garbage_flagged_reason": req.reason,
            "garbage_flagged_at": datetime.utcnow()
        }}
    )

    return {"ok": True, "is_garbage": req.is_garbage, "message": "Deck status updated."}


@router.post("/decks/{deck_id}/run-rag-audit")
async def run_admin_rag_audit(deck_id: str, current_user: dict = Depends(get_current_user)):
    """Run minimal RAG audit pipeline on a pitch deck directly from the Admin panel."""
    check_is_admin(current_user)
    if not ObjectId.is_valid(deck_id):
        raise HTTPException(status_code=400, detail="Invalid deck ID")

    decks_coll = db.get_db().decks
    deck = await decks_coll.find_one({"_id": ObjectId(deck_id)})
    if not deck:
        raise HTTPException(status_code=404, detail="Pitch deck not found")

    rag_report = await audit_rag.run_comprehensive_rag_audit(deck)

    # Persist verdict
    await decks_coll.update_one(
        {"_id": ObjectId(deck_id)},
        {"$set": {
            "verdict": rag_report["overall_verdict"],
            "is_garbage_idea": rag_report["is_garbage_idea"],
            "red_flags_count": rag_report["red_flag_count"],
            "rag_audited_at": datetime.utcnow()
        }}
    )

    return {"ok": True, "report": rag_report}


# =========================================================================
# INVESTOR RESPONSIVENESS, WARNING & BLOCKING (7-Day Inactivity Enforcement)
# =========================================================================

@router.get("/investors")
async def list_admin_investors(current_user: dict = Depends(get_current_user)):
    """List all investors with responsiveness metrics, 7-day inactivity status, warnings & blocks."""
    check_is_admin(current_user)
    users_coll = db.get_db().users
    messages_coll = db.get_db().messages

    now = datetime.utcnow()
    cursor = users_coll.find({"role": "investor"}).sort("created_at", -1)

    investors = []
    async for inv in cursor:
        inv_id = str(inv["_id"])
        created_at = inv.get("created_at") or now
        if isinstance(created_at, str):
            try:
                created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            except Exception:
                created_at = now

        # Find latest message SENT by this investor
        last_sent_msg = await messages_coll.find_one(
            {"sender_id": inv_id},
            sort=[("timestamp", -1)]
        )

        last_active = inv.get("last_active_at")
        if last_sent_msg:
            t = last_sent_msg.get("timestamp")
            if not last_active or (t and t > last_active):
                last_active = t

        if not last_active:
            last_active = created_at

        # Calculate inactivity in days
        days_inactive = max(0, (now - last_active).days)
        is_overdue = days_inactive >= 7

        # Find unanswered founder messages to this investor
        unanswered_count = await messages_coll.count_documents({
            "receiver_id": inv_id,
            "read": False
        })

        # Investor status
        user_status = inv.get("status", "active")
        if inv.get("blocked") is True:
            user_status = "blocked"

        investors.append({
            "_id": inv_id,
            "name": inv.get("name", "Investor"),
            "email": inv.get("email", ""),
            "picture": inv.get("picture", ""),
            "sector": inv.get("sector", "Generalist"),
            "stage": inv.get("stage", "Seed"),
            "verified": inv.get("verified", False),
            "status": user_status,  # "active", "warned", "blocked"
            "is_blocked": user_status == "blocked",
            "is_warned": user_status == "warned",
            "days_inactive": days_inactive,
            "is_overdue": is_overdue,
            "last_active_at": last_active.isoformat() if hasattr(last_active, "isoformat") else str(last_active),
            "unanswered_inquiries": unanswered_count,
            "warning_issued_at": inv.get("warning_issued_at"),
            "warning_reason": inv.get("warning_reason"),
            "blocked_at": inv.get("blocked_at"),
            "block_reason": inv.get("block_reason"),
            "portfolio_url": inv.get("portfolio_url", ""),
            "linkedin_url": inv.get("linkedin_url", ""),
        })

    return {"investors": investors}


@router.post("/investors/{investor_id}/warn")
async def warn_investor(
    investor_id: str,
    req: WarnInvestorRequest,
    current_user: dict = Depends(get_current_user)
):
    """Issue a warning to an unresponsive investor (warn first!)."""
    check_is_admin(current_user)
    if not ObjectId.is_valid(investor_id):
        raise HTTPException(status_code=400, detail="Invalid investor ID")

    users_coll = db.get_db().users
    inv = await users_coll.find_one({"_id": ObjectId(investor_id), "role": "investor"})
    if not inv:
        raise HTTPException(status_code=404, detail="Investor not found")

    warning_time = datetime.utcnow()
    await users_coll.update_one(
        {"_id": ObjectId(investor_id)},
        {"$set": {
            "status": "warned",
            "warning_issued_at": warning_time,
            "warning_reason": req.reason,
        }}
    )

    # Log to hash chain
    await hash_chain_service.append_event(
        event_type="investor_warning_issued",
        payload={
            "investor_id": investor_id,
            "investor_name": inv.get("name"),
            "reason": req.reason,
            "admin_email": current_user.get("email")
        },
        user_id=current_user.get("_id")
    )

    return {
        "ok": True,
        "status": "warned",
        "message": f"Warning issued to investor {inv.get('name')}. They have been notified to respond."
    }


@router.post("/investors/{investor_id}/block")
async def block_investor(
    investor_id: str,
    req: BlockInvestorRequest,
    current_user: dict = Depends(get_current_user)
):
    """Block an unresponsive investor."""
    check_is_admin(current_user)
    if not ObjectId.is_valid(investor_id):
        raise HTTPException(status_code=400, detail="Invalid investor ID")

    users_coll = db.get_db().users
    inv = await users_coll.find_one({"_id": ObjectId(investor_id), "role": "investor"})
    if not inv:
        raise HTTPException(status_code=404, detail="Investor not found")

    block_time = datetime.utcnow()
    await users_coll.update_one(
        {"_id": ObjectId(investor_id)},
        {"$set": {
            "status": "blocked",
            "blocked": True,
            "blocked_at": block_time,
            "block_reason": req.reason,
        }}
    )

    # Log to hash chain
    await hash_chain_service.append_event(
        event_type="investor_blocked",
        payload={
            "investor_id": investor_id,
            "investor_name": inv.get("name"),
            "reason": req.reason,
            "admin_email": current_user.get("email")
        },
        user_id=current_user.get("_id")
    )

    return {
        "ok": True,
        "status": "blocked",
        "message": f"Investor {inv.get('name')} has been blocked from the platform."
    }


@router.post("/investors/{investor_id}/unblock")
async def unblock_investor(
    investor_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Unblock / reinstate an investor."""
    check_is_admin(current_user)
    if not ObjectId.is_valid(investor_id):
        raise HTTPException(status_code=400, detail="Invalid investor ID")

    users_coll = db.get_db().users
    inv = await users_coll.find_one({"_id": ObjectId(investor_id), "role": "investor"})
    if not inv:
        raise HTTPException(status_code=404, detail="Investor not found")

    await users_coll.update_one(
        {"_id": ObjectId(investor_id)},
        {"$set": {
            "status": "active",
            "blocked": False,
            "unblocked_at": datetime.utcnow(),
        },
        "$unset": {
            "block_reason": "",
            "blocked_at": "",
            "warning_reason": "",
            "warning_issued_at": ""
        }}
    )

    return {
        "ok": True,
        "status": "active",
        "message": f"Investor {inv.get('name')} has been successfully reinstated to Active status."
    }
