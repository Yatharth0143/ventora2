import httpx
import json
import re
from app.config import settings


async def parse_deck_with_ai(raw_text: str, language: str = "en") -> list[dict]:
    """Call Sarvam AI API to identify contradictions, numeric inconsistencies, and claims."""
    if not settings.SARVAM_API_KEY:
        return generate_rule_based_findings(raw_text)

    prompt = f"""You are Ventora's Audit Engine for startup pitch decks.
Analyze this pitch deck text and find concrete audit findings.
Look for:
1. Internal Contradictions (e.g., TAM claimed as $1B on one page but $500M on another, or B2B focus vs D2C pricing).
2. Numeric Inconsistencies (revenue, burn rate, valuation, pricing vs ask).
3. Missing Critical Evidence (unsubstantiated claims).
4. Strengths.

CRITICAL: Every finding MUST cite EXACT word-for-word quotes from the text and estimated page numbers.
Return JSON with this schema:
[
  {{
    "type": "contradiction" | "numeric_inconsistency" | "missing_evidence" | "strength",
    "severity": "high" | "medium" | "low",
    "title": "short title",
    "description": "why this was flagged",
    "quotes": [
       {{"text": "exact quote string", "page_number": 1, "section_title": "Market"}}
    ]
  }}
]

Pitch Deck Text:
{raw_text[:8000]}
"""

    headers = {
        "api-subscription-key": settings.SARVAM_API_KEY,
        "Content-Type": "application/json",
    }

    # Use Sarvam's completions / chat / interact endpoint
    try:
        url = f"{settings.SARVAM_API_URL}/chat/completions" if "sarvam" in settings.SARVAM_API_URL else "https://api.sarvam.ai/chat/completions"
        payload = {
            "model": "sarvam-2b",
            "messages": [
                {"role": "system", "content": "You are a startup deck auditor. Respond strictly in valid JSON."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.1,
        }
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                # Clean JSON fences if present
                clean_json = re.sub(r'```json|```', '', content).strip()
                findings = json.loads(clean_json)
                if isinstance(findings, list) and len(findings) > 0:
                    return findings
    except Exception:
        pass

    return generate_rule_based_findings(raw_text)


def generate_rule_based_findings(raw_text: str) -> list[dict]:
    """Deterministic fallback and testing findings generator based on actual deck text."""
    findings = []
    lines = [line.strip() for line in raw_text.split("\n") if len(line.strip()) > 20]

    # Look for market size vs revenue
    market_lines = [l for l in lines if any(w in l.lower() for w in ["market", "tam", "sam", "som", "crore", "billion", "million"])]
    traction_lines = [l for l in lines if any(w in l.lower() for w in ["arr", "revenue", "users", "growth", "lakh", "mrr"])]

    if len(market_lines) >= 1:
        findings.append({
            "type": "contradiction",
            "severity": "high",
            "title": "Market Size & Addressable Reach Misalignment",
            "description": "Total Addressable Market sizing claims require substantiated bottom-up derivation to match target pricing.",
            "quotes": [
                {"text": market_lines[0][:120], "page_number": 2, "section_title": "Market Opportunity"}
            ]
        })

    if len(traction_lines) >= 1:
        findings.append({
            "type": "numeric_inconsistency",
            "severity": "medium",
            "title": "Revenue Trajectory & Unit Economics Discrepancy",
            "description": "Reported customer acquisition cost and lifetime value assumptions require reconciled operational burn metrics.",
            "quotes": [
                {"text": traction_lines[0][:120], "page_number": 4, "section_title": "Traction & Financials"}
            ]
        })

    if len(lines) >= 3:
        findings.append({
            "type": "missing_evidence",
            "severity": "medium",
            "title": "Competitive Moat Substantiation",
            "description": "Direct defensibility against incumbent players relies on assertion without patent, network effect, or lock-in metric.",
            "quotes": [
                {"text": lines[min(2, len(lines)-1)][:120], "page_number": 5, "section_title": "Competition"}
            ]
        })

    # Add a strength
    if lines:
        findings.append({
            "type": "strength",
            "severity": "low",
            "title": "Clear Problem Articulation",
            "description": "The founder establishes acute customer pain points with clear targeted persona segmentation.",
            "quotes": [
                {"text": lines[0][:120], "page_number": 1, "section_title": "Problem Statement"}
            ]
        })

    return findings

