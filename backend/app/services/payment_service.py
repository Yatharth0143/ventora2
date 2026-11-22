import uuid
from datetime import datetime, timedelta 
from bson import ObjectId
from app.database import db
from app.services import hash_chain_service
from app.models.payment import PaymentStatus



async def process_subscription(user_id: str, plan: str = "founder_pro", card_info: dict = None) -> dict:
    card_info = card_info or {}
    card_number = str(card_info.get("card_number") or "").replace(" ", "")

    if plan != "founder_pro":
        return {"success": False, "error": "Invalid subscription plan"}

    if card_number.startswith("0000"):
        status = PaymentStatus.FAILED.value
        error_msg = "Card declined: Simulated failure"
    else:
        status = PaymentStatus.SUCCESS.value
        error_msg = ""

    now = datetime.utcnow()
    expires_at = now + timedelta(days=30)
    tx_id = f"MOCK_TXN_{uuid.uuid4().hex[:10].upper()}"

    payment_doc = {
        "user_id": str(user_id),
        "amount": 999.0,
        "currency": "INR",
        "status": status,
        "plan": plan,
        "mock_transaction_id": tx_id,
        "created_at": now,
        "expires_at": expires_at if status == "success" else None,
    }

    res = await db.get_db().payments.insert_one(payment_doc)
    payment_doc["_id"] = str(res.inserted_id)

    if status == "success":
        await db.get_db().users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "tier": "pro",
                "subscription_expires_at": expires_at,
                "subscription_cancelled_at": None,
            }}
        )

        await hash_chain_service.append_event(
            event_type="payment",
            payload={
                "payment_id": payment_doc["_id"],
                "amount": 999.0,
                "plan": plan,
                "tx_id": tx_id,
            },
            user_id=user_id,
        )

    return {
        "success": status == "success",
        "payment": payment_doc,
        "tier_updated": status == "success",
        "new_tier": "pro" if status == "success" else "free",
        "error": error_msg,
    }


async def get_subscription_status(user_id: str) -> dict:
    user = await db.get_db().users.find_one({"_id": ObjectId(user_id)})

    if not user:
        return {"tier": "free", "active": False}

    last_payment = await db.get_db().payments.find_one(
        {"user_id": str(user_id), "status": "success"},
        sort=[("created_at", -1)]
    )

    expires_at = user.get("subscription_expires_at")
    cancelled_at = user.get("subscription_cancelled_at")

    active = bool(
        last_payment
        and expires_at
        and expires_at > datetime.utcnow()
        and not cancelled_at
    )

    if not active and user.get("tier") == "pro" and (expires_at or cancelled_at):
        await db.get_db().users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"tier": "free"}}
        )

    if last_payment:
        last_payment["_id"] = str(last_payment["_id"])

    return {
        "tier": "pro" if active else "free",
        "active": active,
        "plan": "founder_pro" if active else None,
        "amount": 999 if active else None,
        "expires_at": expires_at,
        "last_payment": last_payment,
    }


async def cancel_subscription(user_id: str) -> dict:
    await db.get_db().users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {
            "tier": "free",
            "subscription_cancelled_at": datetime.utcnow(),
        }}
    )

    return {
        "tier": "free",
        "active": False,
        "message": "Mock subscription cancelled",
    }

async def cancel_subscription(user_id: str) -> dict:
    await db.get_db().users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"tier": "free"}}
    )
    return {"tier": "free", "active": False, "message": "Subscription cancelled"}

