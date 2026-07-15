"""Recommendation endpoint — the rules/ML explanation layer."""
from fastapi import APIRouter, HTTPException

from app import data
from app.ml import explainer
from app.models import Recommendation

router = APIRouter(prefix="/customers", tags=["recommendation"])


@router.get("/{customer_id}/recommendation", response_model=Recommendation)
def get_recommendation(customer_id: str):
    cust = data.get_customer(customer_id)
    if cust is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    reasons = explainer.explain_customer(customer_id) or cust["shap_reasons"]
    top = max(reasons, key=lambda r: abs(r["contribution"]))["feature"]

    return {
        "customer_id": customer_id,
        "recommended_action": cust["recommended_action"],
        "rationale": f"Primary driver: {top}. Risk tier: {cust['risk_tier']}.",
        "priority": cust["risk_tier"],
        "shap_reasons": reasons,
    }
