"""DB-backed customer reads, with the in-memory placeholder as fallback.

Every function returns plain dicts shaped to the API contract. If Postgres is
unreachable (conference Wi-Fi, expired pooler, ...) we fall back to
app/data.py so the demo never 500s. Dicts may carry extra keys (raw signal
columns for /simulate) — FastAPI's response_model filters them out.
"""
from itertools import zip_longest
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app import data
from app.db.models import Customer


def _row_to_dict(row: Customer) -> dict:
    return {
        # contract fields
        "customer_id": row.customer_id,
        "name": row.name,
        "subscription_plan": row.subscription_plan,
        "health_score": row.health_score if row.health_score is not None else 0.0,
        "churn_probability": row.churn_probability if row.churn_probability is not None else 0.0,
        "risk_tier": row.risk_tier or "low",
        "shap_reasons": row.shap_reasons or [],
        "recommended_action": row.recommended_action or "",
        "monthly_usage_pct": row.monthly_usage_pct if row.monthly_usage_pct is not None else 0.0,
        "payment_status": row.payment_status,
        # raw signals for /simulate (filtered out of responses by pydantic)
        "signup_date": row.signup_date,
        "login_frequency": row.login_frequency,
        "feature_usage": row.feature_usage,
        "support_ticket_count": row.support_ticket_count,
        "feedback_score": row.feedback_score,
        "monthly_charges": row.monthly_charges,
        "contract": row.contract,
    }


# Health bands matching the frontend badges: healthy >70, at-risk 40-70, critical <=40.
_HEALTH_BANDS = [
    (Customer.health_score <= 40) | (Customer.health_score.is_(None)),  # critical
    (Customer.health_score > 40) & (Customer.health_score <= 70),       # at risk
    Customer.health_score > 70,                                          # healthy
]


def list_customers(db: Session, limit: int = 100, offset: int = 0) -> List[dict]:
    """Even mix across the three health bands, interleaved critical/at-risk/healthy.

    Within each band the highest churn risk comes first, so any visible slice
    of the table shows a balanced but still demo-interesting selection.
    """
    try:
        share, remainder = divmod(limit, len(_HEALTH_BANDS))
        bands = []
        for i, cond in enumerate(_HEALTH_BANDS):
            stmt = (
                select(Customer)
                .where(cond)
                .order_by(Customer.churn_probability.desc().nulls_last())
                .limit(share + (1 if i < remainder else 0))
                .offset(offset)
            )
            bands.append([_row_to_dict(r) for r in db.execute(stmt).scalars()])
        # Round-robin merge so the mix is visible at the top of the table too.
        merged = []
        for group in zip_longest(*bands):
            merged.extend(r for r in group if r is not None)
        return merged
    except SQLAlchemyError:
        return data.list_customers()[offset : offset + limit]


def get_customer(db: Session, customer_id: str) -> Optional[dict]:
    try:
        row = db.get(Customer, customer_id)
        return _row_to_dict(row) if row else None
    except SQLAlchemyError:
        return data.get_customer(customer_id)
