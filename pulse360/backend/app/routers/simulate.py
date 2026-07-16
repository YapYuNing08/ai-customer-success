"""What-if simulator endpoint.

Runs the trained XGBoost model on the customer's real feature vector with the
requested overrides applied, and recomputes the composite health score with
the exact normalization bounds captured at train time. Falls back to a simple
heuristic only when no trained artifacts exist (or the DB row lacks raw
signals), so the demo never breaks.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import repository
from app.db.session import get_db
from app.ml import explainer
from app.models import SimulationRequest, SimulationResult

router = APIRouter(prefix="/customers", tags=["simulate"])

# Heuristic fallback: rough signed sensitivities (churn delta per lever move).
_SENSITIVITY = {
    "login_frequency": -0.03,
    "feature_usage": -0.25,
    "monthly_usage_pct": -0.004,
    "support_ticket_count": 0.02,
    "feedback_score": -0.03,
}

_RAW_SIGNALS = (
    "login_frequency", "feature_usage", "monthly_usage_pct",
    "support_ticket_count", "feedback_score", "payment_status",
)


def _clamp(x: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, x))


def _simulate_with_model(cust: dict, changed: dict) -> dict:
    baseline_feats = explainer.build_feature_dict(cust, {})
    simulated_feats = explainer.build_feature_dict(cust, changed)

    # Recompute the baseline through the model too, so the delta is
    # internally consistent (model vs. model, not stored-value vs. model).
    return {
        "baseline_churn": explainer.predict_churn(baseline_feats),
        "simulated_churn": explainer.predict_churn(simulated_feats),
        "baseline_health": explainer.compute_health_score(baseline_feats),
        "simulated_health": explainer.compute_health_score(simulated_feats),
    }


def _simulate_heuristic(cust: dict, changed: dict) -> dict:
    baseline_churn = cust["churn_probability"]
    churn = baseline_churn
    for field, value in changed.items():
        if field in _SENSITIVITY:
            churn += _SENSITIVITY[field] * float(value)
        elif field == "payment_status":
            churn += -0.15 if value == "active" else 0.15
    churn = _clamp(churn)
    baseline_health = cust["health_score"]
    return {
        "baseline_churn": baseline_churn,
        "simulated_churn": churn,
        "baseline_health": baseline_health,
        "simulated_health": _clamp(
            baseline_health + (baseline_churn - churn) * 100, 0.0, 100.0
        ),
    }


@router.post("/{customer_id}/simulate", response_model=SimulationResult)
def simulate(customer_id: str, req: SimulationRequest, db: Session = Depends(get_db)):
    cust = repository.get_customer(db, customer_id)
    if cust is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    changed = req.model_dump(exclude_none=True)

    has_signals = all(cust.get(f) is not None for f in _RAW_SIGNALS)
    if explainer.load_artifacts() and has_signals:
        result = _simulate_with_model(cust, changed)
    else:
        result = _simulate_heuristic(cust, changed)

    return {
        "customer_id": customer_id,
        "baseline_churn_probability": round(result["baseline_churn"], 4),
        "simulated_churn_probability": round(result["simulated_churn"], 4),
        "baseline_health_score": round(result["baseline_health"], 2),
        "simulated_health_score": round(result["simulated_health"], 2),
        "delta_churn": round(result["simulated_churn"] - result["baseline_churn"], 4),
        "delta_health": round(result["simulated_health"] - result["baseline_health"], 2),
        "changed_fields": changed,
    }
