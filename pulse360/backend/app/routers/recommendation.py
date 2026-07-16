"""Recommendation endpoint — Next Best Action, precomputed at train time.

The action itself comes from the rules lookup in ml/train.py (keyed on
health band x top SHAP driver) and is stored on the customer row, so this
endpoint is a single read: deterministic and fast for live judging.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import repository
from app.db.session import get_db
from app.models import Recommendation

router = APIRouter(prefix="/customers", tags=["recommendation"])


@router.get("/{customer_id}/recommendation", response_model=Recommendation)
def get_recommendation(customer_id: str, db: Session = Depends(get_db)):
    cust = repository.get_customer(db, customer_id)
    if cust is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    reasons = cust["shap_reasons"]
    if reasons:
        top = max(reasons, key=lambda r: r["contribution"])["feature"]
        rationale = f"Primary churn driver: {top}. Risk tier: {cust['risk_tier']}."
    else:
        rationale = f"Risk tier: {cust['risk_tier']}."

    return {
        "customer_id": customer_id,
        "recommended_action": cust["recommended_action"],
        "rationale": rationale,
        "priority": cust["risk_tier"],
        "shap_reasons": reasons,
    }
