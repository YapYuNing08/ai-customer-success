"""Customer list + detail endpoints — served from Postgres."""
from datetime import date
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import repository
from app.db.session import get_db
from app.models import Customer, CustomerCreate, CustomerSummary, HealthStats

router = APIRouter(prefix="/customers", tags=["customers"])

# Fresh-account baseline for new signups. Deliberately NOT live-scored: the
# Telco model equates near-zero tenure with churn (a day-0 signup scores ~0.62
# churn / "high" risk), which misrepresents a customer who just completed
# onboarding. Scores converge to model output once ml/train.py re-scores.
_NEW_SIGNUP_HEALTH = 85.0
_NEW_SIGNUP_CHURN = 0.08
_NEW_SIGNUP_ACTION = "Monitor onboarding progress; schedule a 14-day adoption check-in."


@router.get("", response_model=list[CustomerSummary])
def list_customers(
    limit: int = Query(100, ge=1, le=7100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """Highest-risk customers first — the dashboard opens on the accounts
    that need attention."""
    return repository.list_customers(db, limit=limit, offset=offset)


@router.post("", response_model=Customer, status_code=201)
def create_customer(req: CustomerCreate, db: Session = Depends(get_db)):
    """Persist a signup from the onboarding wizard with fresh-account scores."""
    values = {
        "customer_id": f"NEW-{uuid4().hex[:8].upper()}",
        "name": req.name,
        "subscription_plan": req.subscription_plan,
        "health_score": _NEW_SIGNUP_HEALTH,
        "churn_probability": _NEW_SIGNUP_CHURN,
        "risk_tier": "low",
        "recommended_action": _NEW_SIGNUP_ACTION,
        "monthly_usage_pct": req.monthly_usage_pct,
        "shap_reasons": [],  # SHAP is precomputed at train time; none for live signups
        "signup_date": date.today(),
        "login_frequency": req.login_frequency,
        "feature_usage": req.feature_usage,
        "payment_status": req.payment_status,
        "support_ticket_count": req.support_ticket_count,
        "feedback_score": req.feedback_score,
        "churn_status": 0,
        "monthly_charges": req.monthly_charges,
        "contract": req.contract,
    }
    return repository.create_customer(db, values)


# NOTE: must be registered before /{customer_id} so "stats" isn't matched as an id.
@router.get("/stats", response_model=HealthStats)
def customer_stats(db: Session = Depends(get_db)):
    """Health-band distribution over the full customer population."""
    return repository.get_stats(db)


@router.get("/{customer_id}", response_model=Customer)
def get_customer(customer_id: str, db: Session = Depends(get_db)):
    cust = repository.get_customer(db, customer_id)
    if cust is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return cust
