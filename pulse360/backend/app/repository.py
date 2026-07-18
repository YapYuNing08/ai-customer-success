"""DB-backed customer reads, with the in-memory placeholder as fallback.

Every function returns plain dicts shaped to the API contract. If Postgres is
unreachable (conference Wi-Fi, expired pooler, ...) we fall back to
app/data.py so the demo never 500s. Dicts may carry extra keys (raw signal
columns for /simulate) — FastAPI's response_model filters them out.
"""
from itertools import zip_longest
from typing import List, Optional

from sqlalchemy import func, select
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


def _stats_from_counts(critical: int, at_risk: int, healthy: int, avg_health: float) -> dict:
    total = critical + at_risk + healthy
    pct = lambda n: round(n / total * 100, 1) if total else 0.0  # noqa: E731
    return {
        "total_customers": total,
        "healthy_count": healthy,
        "at_risk_count": at_risk,
        "critical_count": critical,
        "healthy_pct": pct(healthy),
        "at_risk_pct": pct(at_risk),
        "critical_pct": pct(critical),
        "avg_health_score": round(avg_health, 1),
    }


def get_stats(db: Session) -> dict:
    """Health-band counts over the FULL table (the list endpoint is a
    band-balanced sample, so the dashboard must not aggregate from it)."""
    try:
        # _HEALTH_BANDS order: critical, at-risk, healthy.
        critical, at_risk, healthy = (
            db.execute(select(func.count()).select_from(Customer).where(cond)).scalar() or 0
            for cond in _HEALTH_BANDS
        )
        avg_health = db.execute(select(func.avg(Customer.health_score))).scalar() or 0.0
        return _stats_from_counts(critical, at_risk, healthy, float(avg_health))
    except SQLAlchemyError:
        rows = data.list_customers()
        scores = [r.get("health_score") or 0.0 for r in rows]
        critical = sum(1 for s in scores if s <= 40)
        at_risk = sum(1 for s in scores if 40 < s <= 70)
        healthy = sum(1 for s in scores if s > 70)
        avg_health = sum(scores) / len(scores) if scores else 0.0
        return _stats_from_counts(critical, at_risk, healthy, avg_health)


def get_customer(db: Session, customer_id: str) -> Optional[dict]:
    try:
        row = db.get(Customer, customer_id)
        return _row_to_dict(row) if row else None
    except SQLAlchemyError:
        return data.get_customer(customer_id)
