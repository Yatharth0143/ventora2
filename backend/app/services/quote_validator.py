import re
import difflib


def normalize_whitespace(text: str) -> str:
    return re.sub(r'\s+', ' ', text).strip().lower()


def find_quote_in_text(quote_text: str, full_text: str) -> bool:
    """Verify quote exists in text either by exact substring or fuzzy matching (>= 0.8 ratio)."""
    norm_q = normalize_whitespace(quote_text)
    norm_full = normalize_whitespace(full_text)

    if not norm_q:
        return False

    # Exact substring
    if norm_q in norm_full:
        return True

    # Check chunks of full text for fuzzy match
    q_len = len(norm_q)
    words = norm_full.split()
    q_words = norm_q.split()
    window_size = max(len(q_words) + 4, 10)

    for i in range(0, max(1, len(words) - window_size + 1), max(1, window_size // 2)):
        chunk = " ".join(words[i:i + window_size])
        ratio = difflib.SequenceMatcher(None, norm_q, chunk).ratio()
        if ratio >= 0.8:
            return True

    return False


def validate_finding(finding: dict, raw_text: str, sections: list[dict]) -> bool:
    """Validate that every quote in the finding exists in the raw text and has valid page ref."""
    quotes = finding.get("quotes", [])
    if not quotes and finding.get("type") != "numeric_inconsistency":
        return False

    total_pages = len(sections) if sections else 100

    for q in quotes:
        q_text = q.get("text", "") if isinstance(q, dict) else getattr(q, "text", "")
        p_num = q.get("page_number", 1) if isinstance(q, dict) else getattr(q, "page_number", 1)

        if not q_text or len(q_text.strip()) < 5:
            return False

        if p_num > total_pages + 2 or p_num < 1:
            return False

        # Check section specific text if available, otherwise check raw text
        section_text = ""
        for sec in sections:
            if sec.get("page_number") == p_num:
                section_text += " " + sec.get("content", "")

        matched = find_quote_in_text(q_text, section_text) if section_text else find_quote_in_text(q_text, raw_text)
        if not matched and not find_quote_in_text(q_text, raw_text):
            return False

    return True

