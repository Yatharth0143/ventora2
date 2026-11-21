import hashlib
import json
from datetime import datetime
from bson import ObjectId
from app.database import db
from app.models.hash_chain import HashChainEntry, EventType


def compute_hash(previous_hash: str, payload: dict, timestamp_str: str) -> str:
    content = f"{previous_hash}|{json.dumps(payload, sort_keys=True, default=str)}|{timestamp_str}"
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


async def append_event(event_type: str, payload: dict, user_id: str = "") -> dict:
    chain_coll = db.get_db().hash_chain

    # Get latest entry
    last_entry = await chain_coll.find().sort("timestamp", -1).limit(1).to_list(1)
    previous_hash = last_entry[0]["hash"] if last_entry else "GENESIS_VENTORA_TRUST_LAYER"

    ts = datetime.utcnow()
    current_hash = compute_hash(previous_hash, payload, ts.isoformat())

    entry = {
        "event_type": event_type,
        "payload": payload,
        "hash": current_hash,
        "previous_hash": previous_hash,
        "timestamp": ts,
        "user_id": str(user_id),
    }

    res = await chain_coll.insert_one(entry)
    entry["_id"] = str(res.inserted_id)
    return entry


async def verify_chain() -> dict:
    chain_coll = db.get_db().hash_chain
    cursor = chain_coll.find().sort("timestamp", 1)

    expected_prev = "GENESIS_VENTORA_TRUST_LAYER"
    index = 0
    total = 0

    async for entry in cursor:
        total += 1
        entry_prev = entry.get("previous_hash")
        entry_hash = entry.get("hash")
        entry_payload = entry.get("payload", {})
        ts_str = entry.get("timestamp").isoformat() if isinstance(entry.get("timestamp"), datetime) else str(entry.get("timestamp"))

        # Verify chaining
        if entry_prev != expected_prev:
            return {"valid": False, "total_entries": total, "broken_at": index, "reason": "Hash chain break: previous_hash mismatch"}

        # Verify hash integrity
        calculated_hash = compute_hash(entry_prev, entry_payload, ts_str)
        if calculated_hash != entry_hash:
            return {"valid": False, "total_entries": total, "broken_at": index, "reason": "Hash tampering detected: hash mismatch"}

        expected_prev = entry_hash
        index += 1

    return {"valid": True, "total_entries": total, "broken_at": None, "reason": "All blocks intact and tamper-free"}


async def verify_single(entry_id: str) -> dict:
    try:
        chain_coll = db.get_db().hash_chain
        entry = await chain_coll.find_one({"_id": ObjectId(entry_id)})
        if not entry:
            return {"valid": False, "entry": None, "reason": "Entry not found"}

        entry["_id"] = str(entry["_id"])
        ts_str = entry["timestamp"].isoformat() if isinstance(entry["timestamp"], datetime) else str(entry["timestamp"])
        calc_hash = compute_hash(entry["previous_hash"], entry["payload"], ts_str)

        return {
            "valid": calc_hash == entry["hash"],
            "entry": entry,
            "calculated_hash": calc_hash,
        }
    except Exception as e:
        return {"valid": False, "entry": None, "reason": str(e)}

