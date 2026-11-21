import re
from typing import Optional
from app.models.finding import NumericClaim

CONVERSION_MAP = {
    "lakh": 1e5,
    "lac": 1e5,
    "lakhs": 1e5,
    "lacs": 1e5,
    "crore": 1e7,
    "cr": 1e7,
    "crores": 1e7,
    "million": 1e6,
    "mn": 1e6,
    "m": 1e6,
    "billion": 1e9,
    "bn": 1e9,
    "b": 1e9,
    "k": 1e3,
    "thousand": 1e3,
}

CURRENCY_TO_INR = {
    "$": 83.0,
    "usd": 83.0,
    "dollar": 83.0,
    "dollars": 83.0,
    "rs": 1.0,
    "inr": 1.0,
    "₹": 1.0,
    "rupees": 1.0,
}


def normalize_value(text: str) -> tuple[Optional[float], str]:
    """Parse string like '₹5 crore' or '$2.5M' into (normalized_inr_value, raw_unit)."""
    clean_text = text.lower().replace(",", "")

    # Look for currency
    curr_rate = 1.0
    for curr_symbol, rate in CURRENCY_TO_INR.items():
        if curr_symbol in clean_text:
            curr_rate = rate
            break

    # Look for number and multiplier
    pattern = r"([0-9]+(?:\.[0-9]+)?)\s*([a-z]+)?"
    match = re.search(pattern, clean_text)
    if not match:
        return None, ""

    num = float(match.group(1))
    unit = match.group(2) or ""

    multiplier = 1.0
    for key, mult in CONVERSION_MAP.items():
        if key in unit or unit == key:
            multiplier = mult
            break

    total_inr = num * multiplier * curr_rate
    return total_inr, f"{num} {unit}".strip()


def check_numeric_claim(claim_1_text: str, claim_2_text: str) -> Optional[NumericClaim]:
    val1, unit1 = normalize_value(claim_1_text)
    val2, unit2 = normalize_value(claim_2_text)

    if val1 is None or val2 is None:
        return None

    # Check for discrepancy > 15%
    if val1 > 0 and val2 > 0:
        diff = abs(val1 - val2)
        pct = diff / max(val1, val2)
        if pct > 0.15:
            discrepancy_msg = f"Value 1 ({claim_1_text} = ~₹{val1:,.0f}) contradicts Value 2 ({claim_2_text} = ~₹{val2:,.0f}) by {pct*100:.1f}%"
            return NumericClaim(
                claimed_value=val1,
                claimed_unit=unit1,
                normalized_value_inr=val1,
                compared_value=val2,
                compared_unit=unit2,
                compared_normalized_inr=val2,
                discrepancy=discrepancy_msg,
            )
    return None

