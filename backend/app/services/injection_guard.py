import re

INJECTION_PATTERNS = [
    r"ignore\s+(all\s+|any\s+)?(previous|above|prior)\s+(instructions|prompts|rules)",
    r"you\s+are\s+now",
    r"act\s+as\s+",
    r"pretend\s+to\s+be",
    r"new\s+instruction",
    r"system\s+prompt",
    r"disregard\s+(all\s+)?(previous|prior)",
    r"override\s+(all\s+)?rules",
    r"jailbreak",
    r"DAN\s+mode",
    r"do\s+anything\s+now",
    r"forget\s+(everything|all|your)",
]

COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in INJECTION_PATTERNS]


def sanitize_text(text: str) -> tuple[str, list[str]]:
    """Scan text for injection attempts, redact them, and return sanitized text and detections."""
    detected = []
    sanitized = text

    for pattern in COMPILED_PATTERNS:
        matches = pattern.findall(sanitized)
        if matches:
            detected.append(pattern.pattern)
            sanitized = pattern.sub("[REDACTED_PROMPT_INJECTION_ATTEMPT]", sanitized)

    return sanitized, detected


def is_safe_finding(finding: dict, stripped_patterns: list[str]) -> bool:
    """Return False if finding cites or relies on redacted prompts."""
    quotes = finding.get("quotes", [])
    for q in quotes:
        q_text = q.get("text", "") if isinstance(q, dict) else getattr(q, "text", "")
        if "[REDACTED_PROMPT_INJECTION_ATTEMPT]" in q_text:
            return False
        for p in stripped_patterns:
            if re.search(p, q_text, re.IGNORECASE):
                return False
    return True

