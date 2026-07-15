"""What-if simulator endpoint.

Placeholder heuristic until the trained model is wired in: nudges churn and
health in plausible directions based on the levers the user changes.
"""
from fastapi import APIRouter, HTTPException

from app import data
from app.models import SimulationRequest, SimulationResult

router = APIRouter(prefix="/customers", tags=["simulate"])

# Rough signed sensitivities (churn-probability delta per lever move).
# Positive lever value => lower churn, except support tickets / past_due.
_SENSITIVITY = {
    "login_frequency": -0.03,
    "feature_usage": -0.25,
    "monthly_usage_pct": -0.004,
    "support_ticket_count": 0.02,
    "feedback_score": -0.03,
}


def _clamp(x: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, x))


@router.post("/{customer_id}/simulate", response_model=SimulationResult)
def simulate(customer_id: str, req: SimulationRequest):
    cust = data.get_customer(customer_id)
    if cust is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    baseline_churn = cust["churn_probability"]
    baseline_health = cust["health_score"]

    changed = req.model_dump(exclude_none=True)
    churn = baseline_churn
    for field, value in changed.items():
        if field in _SENSITIVITY:
            churn += _SENSITIVITY[field] * float(value)
        elif field == "payment_status":
            churn += -0.15 if value == "active" else 0.15

    churn = _clamp(churn)
    # Health moves roughly inverse to churn for the placeholder.
    health = _clamp(baseline_health + (baseline_churn - churn) * 100, 0.0, 100.0)

    return {
        "customer_id": customer_id,
        "baseline_churn_probability": round(baseline_churn, 4),
        "simulated_churn_probability": round(churn, 4),
        "baseline_health_score": round(baseline_health, 2),
        "simulated_health_score": round(health, 2),
        "delta_churn": round(churn - baseline_churn, 4),
        "delta_health": round(health - baseline_health, 2),
        "changed_fields": changed,
    }
