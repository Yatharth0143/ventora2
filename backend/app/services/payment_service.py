import uuid
from datetime import datetime
from bson import ObjectId
from app.database import db
from app.services import hash_chain_service
from app.models.payment import PaymentStatus


async def process_subscription(user_id: str, plan: str = "founder_pro", card_info: dict = None) -> dict:
    card_info = card_info or {}
    card_number = card_info.get("card_number", "4111111111111111").replace(" ", "")

    # Validation
    if card_number.startswith("0000"):
        status = PaymentStatus.FAILED.value
        error_msg = "Card declined: Simulated failure for 0000 test card"
    else:
        status = PaymentStatus.SUCCESS.value
        error_msg = ""

    tx_id = f"MOCK_TXN_{uuid.uuid4().hex[:10].upper()}"

    payment_doc = {
        "user_id": str(user_id),
        "amount": 999.0 if plan == "founder_pro" else 4999.0,
        "currency": "INR",
        "status": status,
        "plan": plan,
        "mock_transaction_id": tx_id,
        "created_at": datetime.utcnow(),
    }

    res = await db.get_db().payments.insert_one(payment_doc)
    payment_doc["_id"] = str(res.inserted_id)

    tier_updated = False
    if status == PaymentStatus.SUCCESS.value:
        await db.get_db().users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"tier": "pro"}}
        )
        tier_updated = True

        # Log to hash chain
        await hash_chain_service.append_event(
            event_type="payment",
            payload={"payment_id": payment_doc["_id"], "amount": payment_doc["amount"], "plan": plan, "tx_id": tx_id},
            user_id=user_id,
        )

    return {
        "payment": payment_doc,
        "tier_updated": tier_updated,
        "new_tier": "pro" if tier_updated else "free",
        "error": error_msg,
    }


async def get_subscription_status(user_id: str) -> dict:
    user = await db.get_db().users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return {"tier": "free", "active": False}

    last_payment = await db.get_db().payments.find_one(
        {"user_id": str(user_id), "status": PaymentStatus.SUCCESS.value},
        sort=[("created_at", -1)]
    )

    if last_payment:
        last_payment["_id"] = str(last_payment["_id"])

    return {
        "tier": user.get("tier", "free"),
        "active": user.get("tier") == "pro",
        "last_payment": last_payment,
    }


async def cancel_subscription(user_id: str) -> dict:
    await db.get_db().users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"tier": "free"}}
    )
    return {"tier": "free", "active": False, "message": "Subscription cancelled"}

