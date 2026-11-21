from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException, status
from app.database import db
from app.services import hash_chain_service


async def send_message(sender_id: str, receiver_id: str, text: str, sender: dict) -> dict:
    users_coll = db.get_db().users
    receiver = await users_coll.find_one({"_id": ObjectId(receiver_id)})
    if not receiver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipient not found")

    sender_tier = sender.get("tier", "free")
    sender_role = sender.get("role", "founder")
    receiver_role = receiver.get("role", "founder")
    receiver_verified = receiver.get("verified", False)

    # Trust Gating Rule 1: Founder must be Pro to initiate/chat with investors
    if sender_role == "founder" and sender_tier != "pro":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Upgrade to Founder Pro (₹999/mo) to message investors.",
        )

    # Trust Gating Rule 2: Cannot chat with unverified investors
    if receiver_role == "investor" and not receiver_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This investor is not yet verified. Only verified investors can receive messages.",
        )

    msg_doc = {
        "sender_id": str(sender_id),
        "receiver_id": str(receiver_id),
        "text": text,
        "timestamp": datetime.utcnow(),
        "read": False,
    }
    res = await db.get_db().messages.insert_one(msg_doc)
    msg_doc["_id"] = str(res.inserted_id)

    # Log to tamper-evident hash chain
    await hash_chain_service.append_event(
        event_type="chat_message",
        payload={"message_id": msg_doc["_id"], "sender_id": str(sender_id), "receiver_id": str(receiver_id)},
        user_id=sender_id,
    )

    return msg_doc


async def get_history(user_id: str, other_user_id: str, limit: int = 100) -> list[dict]:
    query = {
        "$or": [
            {"sender_id": str(user_id), "receiver_id": str(other_user_id)},
            {"sender_id": str(other_user_id), "receiver_id": str(user_id)},
        ]
    }
    cursor = db.get_db().messages.find(query).sort("timestamp", 1).limit(limit)
    messages = []
    async for m in cursor:
        m["_id"] = str(m["_id"])
        messages.append(m)

    # Mark incoming as read
    await db.get_db().messages.update_many(
        {"sender_id": str(other_user_id), "receiver_id": str(user_id), "read": False},
        {"$set": {"read": True}}
    )

    return messages


async def get_conversations(user_id: str) -> list[dict]:
    messages_coll = db.get_db().messages
    users_coll = db.get_db().users

    # Find all unique user IDs messaged with
    cursor = messages_coll.find({
        "$or": [{"sender_id": str(user_id)}, {"receiver_id": str(user_id)}]
    }).sort("timestamp", -1)

    partner_ids = set()
    latest_msgs = {}
    async for m in cursor:
        partner_id = m["receiver_id"] if m["sender_id"] == str(user_id) else m["sender_id"]
        if partner_id not in partner_ids:
            partner_ids.add(partner_id)
            latest_msgs[partner_id] = m

    convos = []
    for pid in partner_ids:
        try:
            partner = await users_coll.find_one({"_id": ObjectId(pid)})
            if partner:
                last_m = latest_msgs[pid]
                convos.append({
                    "user_id": str(partner["_id"]),
                    "user_name": partner.get("name", "User"),
                    "user_picture": partner.get("picture", ""),
                    "user_role": partner.get("role", "founder"),
                    "user_verified": partner.get("verified", False),
                    "last_message": last_m.get("text", ""),
                    "last_timestamp": last_m.get("timestamp"),
                    "unread_count": await messages_coll.count_documents({
                        "sender_id": pid, "receiver_id": str(user_id), "read": False
                    })
                })
        except Exception:
            continue

    return convos

