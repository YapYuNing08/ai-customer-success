"""Gemini-powered narrative for what-if simulation results.

The numbers are ALWAYS computed by the deterministic XGBoost pipeline — Gemini
only turns an already-computed result into a short plain-language retention
plan. Any failure (no key, timeout, quota, bad response) falls back to a
deterministic template, so the live demo never blocks on the API.
"""
import logging

import requests

from app.config import GEMINI_API_KEY

logger = logging.getLogger("uvicorn.error")

_GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.5-flash:generateContent"
)
_TIMEOUT = 8.0

_FIELD_LABELS = {
    "login_frequency": "logins per day",
    "feature_usage": "share of features used",
    "monthly_usage_pct": "monthly usage %",
    "support_ticket_count": "open support tickets",
    "feedback_score": "feedback score (out of 10)",
    "payment_status": "payment status",
}


def _build_prompt(cust: dict, sim: dict) -> str:
    changes = []
    for field, new_value in sim["changed_fields"].items():
        old_value = cust.get(field)
        label = _FIELD_LABELS.get(field, field)
        if old_value is not None and old_value != new_value:
            changes.append(f"- {label}: {old_value} -> {new_value}")
    changes_text = "\n".join(changes) if changes else "- no changes (baseline run)"

    revenue = sim.get("projected_annual_revenue_saved")
    revenue_line = (
        f"Projected 12-month revenue impact: ${revenue:,.0f}.\n" if revenue is not None else ""
    )

    return (
        "You are a customer-success advisor. A churn-prediction model simulated "
        "changes for one subscription customer.\n"
        f"Customer: {cust['name']}, {cust['subscription_plan']} plan"
        + (f", pays ${cust['monthly_charges']:.0f}/month" if cust.get("monthly_charges") else "")
        + ".\n"
        f"Risk of leaving: {sim['baseline_churn_probability']:.0%} -> "
        f"{sim['simulated_churn_probability']:.0%}. "
        f"Health score: {sim['baseline_health_score']:.0f} -> "
        f"{sim['simulated_health_score']:.0f} (out of 100).\n"
        f"Simulated changes:\n{changes_text}\n"
        f"{revenue_line}"
        "Write 2-3 short sentences for a customer success manager: what this "
        "scenario means for the account and the single most impactful next step. "
        "Plain language, no jargon, no markdown, no bullet points."
    )


def _fallback_narrative(cust: dict, sim: dict) -> str:
    churn_pts = round(-sim["delta_churn"] * 100)
    revenue = sim.get("projected_annual_revenue_saved")
    money = f" and protects about ${abs(revenue):,.0f} of revenue over the next year" if revenue else ""

    if churn_pts > 0:
        return (
            f"These changes cut {cust['name']}'s risk of leaving by {churn_pts} "
            f"percentage points{money}. Prioritize the changed items above — the "
            "model says they move this account the most."
        )
    if churn_pts < 0:
        money_risk = (
            f" and puts about ${abs(revenue):,.0f} of yearly revenue at risk" if revenue else ""
        )
        return (
            f"Careful — this scenario raises {cust['name']}'s risk of leaving by "
            f"{abs(churn_pts)} percentage points{money_risk}. Avoid letting these "
            "signals slip in real life."
        )
    return (
        f"This scenario barely moves {cust['name']}'s risk of leaving. Try larger "
        "changes to the sliders — especially payment status and support tickets — "
        "to find what actually shifts this account."
    )


def narrate(cust: dict, sim: dict) -> tuple[str, str]:
    """Return (narrative, source) where source is 'gemini' or 'fallback'."""
    if GEMINI_API_KEY:
        try:
            resp = requests.post(
                _GEMINI_URL,
                headers={"x-goog-api-key": GEMINI_API_KEY},
                json={
                    "contents": [{"parts": [{"text": _build_prompt(cust, sim)}]}],
                    "generationConfig": {
                        "temperature": 0.4,
                        "maxOutputTokens": 256,
                        # 2.5-flash is a thinking model: without this it can
                        # spend the whole token budget on hidden reasoning and
                        # return no text. Zero thinking = fast demo latency.
                        "thinkingConfig": {"thinkingBudget": 0},
                    },
                },
                timeout=_TIMEOUT,
            )
            resp.raise_for_status()
            parts = resp.json()["candidates"][0]["content"]["parts"]
            text = " ".join(p.get("text", "") for p in parts).strip()
            if text:
                return text, "gemini"
            logger.warning("Gemini returned no text (finishReason=%s); using fallback",
                           resp.json()["candidates"][0].get("finishReason"))
        except Exception as exc:  # any failure -> deterministic fallback
            logger.warning("Gemini narrative failed (%s); using fallback", exc)
    else:
        logger.warning("GEMINI_API_KEY not set; narrative uses fallback")
    return _fallback_narrative(cust, sim), "fallback"
