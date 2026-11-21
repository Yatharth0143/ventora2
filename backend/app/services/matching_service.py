from app.services import graph_service
from app.database import db


def compute_fit_score(founder: dict, investor: dict) -> float:
    score = 0.5  # Baseline

    f_sector = (founder.get("sector") or "").lower()
    i_sector = (investor.get("sector") or "").lower()
    if f_sector and i_sector and (f_sector in i_sector or i_sector in f_sector):
        score += 0.3

    f_stage = (founder.get("stage") or "").lower()
    i_stage = (investor.get("stage") or "").lower()
    if f_stage and i_stage and (f_stage in i_stage or i_stage in f_stage):
        score += 0.2

    return min(round(score, 2), 0.98)


async def rank_investors(founder_id: str, investors: list[dict]) -> list[dict]:
    founder = await db.get_db().users.find_one({"_id": founder_id}) or {}

    non_conflicted = []
    conflicted = []

    for inv in investors:
        inv_id = str(inv.get("_id") or inv.get("id"))
        fit = compute_fit_score(founder, inv)

        # Check graph conflict
        conflict_res = await graph_service.check_conflict(founder_id, inv_id)
        has_conflict = conflict_res.get("has_conflict")

        enhanced_inv = dict(inv)
        enhanced_inv["fit_score"] = fit
        enhanced_inv["conflict_info"] = conflict_res
        enhanced_inv["has_conflict"] = has_conflict

        if has_conflict is True:
            conflicted.append(enhanced_inv)
        else:
            non_conflicted.append(enhanced_inv)

    # Sort non-conflicted by fit_score descending
    non_conflicted.sort(key=lambda x: x["fit_score"], reverse=True)
    # Sort conflicted by fit_score descending
    conflicted.sort(key=lambda x: x["fit_score"], reverse=True)

    # Core USP 4: Conflicted investors are strictly ranked last
    return non_conflicted + conflicted

