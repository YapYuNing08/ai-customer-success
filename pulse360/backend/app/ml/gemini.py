"""Gemini copilot — STUB ONLY.

Wiring for GEMINI_API_KEY is in place, but no live calls are made yet. The
day-7 plan is: build a real prompt from the customer's health signals + SHAP
reasons, call Gemini, and fall back to a cached/templated response on error.
"""
from app.config import GEMINI_API_KEY


def generate_copilot_summary(customer: dict) -> dict:
    """Return a copilot narrative for a customer.

    Currently returns a deterministic templated fallback. Replace the body with
    a real google-generativeai call once the copilot day arrives.
    """
    top_reason = None
    if customer.get("shap_reasons"):
        top_reason = max(
            customer["shap_reasons"], key=lambda r: abs(r["contribution"])
        )["feature"]

    fallback = (
        f"{customer['name']} is in the '{customer['risk_tier']}' risk tier with a "
        f"churn probability of {customer['churn_probability']:.0%}. "
        + (f"The strongest signal is '{top_reason}'. " if top_reason else "")
        + f"Suggested next step: {customer.get('recommended_action', 'review the account')}."
    )

    return {
        "customer_id": customer["customer_id"],
        "summary": fallback,
        "source": "fallback",  # becomes "gemini" once live calls are wired
        "api_key_configured": bool(GEMINI_API_KEY),
    }
