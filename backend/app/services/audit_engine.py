from datetime import datetime
from bson import ObjectId
from app.database import db
from app.services import (
    sarvam_service,
    bhashini_service,
    quote_validator,
    numeric_checker,
    injection_guard,
    hash_chain_service,
)
from app.models.finding import FindingType, Severity


async def run_audit(deck_id: str) -> list[dict]:
    decks_coll = db.get_db().decks
    findings_coll = db.get_db().findings

    deck = await decks_coll.find_one({"_id": ObjectId(deck_id)})
    if not deck:
        return []

    raw_text = deck.get("raw_text", "")
    sections = deck.get("sections", [])
    lang = deck.get("language", "en")

    # Step 1: Prompt Injection Guardrail
    sanitized_text, stripped_patterns = injection_guard.sanitize_text(raw_text)

    # Step 2: Language translation if non-English
    text_for_ai = sanitized_text
    is_translated = False
    if lang in ["hi", "bn", "mr", "ta", "te"]:
        text_for_ai = await bhashini_service.translate_text(sanitized_text, lang, "en")
        is_translated = True

    # Step 3: Run AI analysis via Sarvam
    raw_findings = await sarvam_service.parse_deck_with_ai(text_for_ai, language=lang)

    # Step 4: Strict Trust Layer Validation (USP 2)
    # Findings are ONLY emitted if quotes literally exist in source text
    validated_findings = []

    # Clear previous findings for this deck
    await findings_coll.delete_many({"deck_id": str(deck_id)})

    for rf in raw_findings:
        # Check injection safety
        if not injection_guard.is_safe_finding(rf, stripped_patterns):
            continue

        # Check quotes against source text
        is_valid = quote_validator.validate_finding(rf, sanitized_text, sections)
        if not is_valid:
            # Drop hallucinated findings immediately!
            continue

        # If language is Hindi and finding is in English, translate back if desired
        f_title = rf.get("title", "")
        f_desc = rf.get("description", "")
        if lang == "hi" and is_translated:
            f_title = await bhashini_service.translate_text(f_title, "en", "hi")
            f_desc = await bhashini_service.translate_text(f_desc, "en", "hi")

        finding_doc = {
            "deck_id": str(deck_id),
            "type": rf.get("type", FindingType.CONTRADICTION.value),
            "severity": rf.get("severity", Severity.MEDIUM.value),
            "title": f_title,
            "description": f_desc,
            "quotes": rf.get("quotes", []),
            "numeric_claim": rf.get("numeric_claim"),
            "is_translated": is_translated,
            "original_text": rf.get("quotes", [{}])[0].get("text", "") if is_translated else "",
            "created_at": datetime.utcnow(),
        }

        res = await findings_coll.insert_one(finding_doc)
        finding_doc["_id"] = str(res.inserted_id)
        validated_findings.append(finding_doc)

    # Update deck status
    await decks_coll.update_one(
        {"_id": ObjectId(deck_id)},
        {"$set": {"status": "audited"}}
    )

    # Step 5: Append to tamper-evident hash chain
    await hash_chain_service.append_event(
        event_type="audit_run",
        payload={"deck_id": str(deck_id), "findings_count": len(validated_findings)},
        user_id=deck.get("founder_id", ""),
    )

    return validated_findings


async def get_findings(deck_id: str, user_tier: str = "free") -> dict:
    """Freemium gate: returns first 3 findings for free tier, all for Pro."""
    findings_coll = db.get_db().findings
    cursor = findings_coll.find({"deck_id": str(deck_id)}).sort("created_at", 1)

    all_findings = []
    async for f in cursor:
        f["_id"] = str(f["_id"])
        all_findings.append(f)

    total = len(all_findings)

    if user_tier == "pro":
        return {
            "findings": all_findings,
            "total": total,
            "shown": total,
            "gated": False,
        }

    # Free tier: gate at exactly 3 findings
    free_limit = 3
    shown_findings = all_findings[:free_limit]
    locked_count = max(0, total - free_limit)

    return {
        "findings": shown_findings,
        "total": total,
        "shown": len(shown_findings),
        "locked_count": locked_count,
        "gated": locked_count > 0,
    }



async def compute_fit_table(deck_id: str) -> dict:
    """Build evidence-based fit indicators from actual parsed deck text."""

    if not ObjectId.is_valid(deck_id):
        raise ValueError("Invalid deck ID")

    deck = await db.get_db().decks.find_one({"_id": ObjectId(deck_id)})

    if not deck:
        raise ValueError("Deck not found")

    raw_text = deck.get("raw_text", "")
    text = raw_text.lower()

    sections = deck.get("sections", [])

    def find_evidence(keywords):
        for section in sections:
            content = section.get("content", "")
            if any(word in content.lower() for word in keywords):
                return {
                    "source_field": section.get("title", "Deck text"),
                    "source_page": section.get("page_number"),
                }
        return None

    checks = [
        {
            "category": "Sector Fit",
            "keywords": ["fintech", "payment", "banking", "finance", "consumer", "enterprise", "b2b"],
            "value": "Sector-related evidence found",
        },
        {
            "category": "Stage Alignment",
            "keywords": ["pre-seed", "pre seed", "seed", "series a", "prototype", "early stage"],
            "value": "Funding stage evidence found",
        },
        {
            "category": "Capital Efficiency",
            "keywords": ["runway", "burn rate", "monthly burn", "cash flow", "capital efficiency"],
            "value": "Financial evidence found",
        },
        {
            "category": "Traction Verification",
            "keywords": ["customers", "revenue", "users", "pilot", "traction", "mrr", "arr"],
            "value": "Traction evidence found",
        },
    ]

    cells = []

    for check in checks:
        evidence = find_evidence(check["keywords"])

        cells.append({
            "category": check["category"],
            "value": check["value"] if evidence else "Not found in deck",
            "source_field": evidence["source_field"] if evidence else None,
            "source_page": evidence["source_page"] if evidence else None,
            "status": "Evidence found" if evidence else "Needs evidence",
        })

    return {
        "deck_id": str(deck_id),
        "fit_table": cells,
        "formula": "Indicators are based on keyword evidence in parsed deck text; they do not independently verify claims."
    }
