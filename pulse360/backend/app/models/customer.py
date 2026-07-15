"""Pydantic schemas — the API contract shared with the frontend.

Field names here MUST match what the Stitch-exported UI expects.
"""
from typing import List, Literal, Optional

from pydantic import BaseModel

RiskTier = Literal["low", "medium", "high"]


class ShapReason(BaseModel):
    feature: str
    contribution: float  # signed; positive pushes churn up, negative pushes it down


class CustomerSummary(BaseModel):
    """Lightweight shape for the customers list view."""

    customer_id: str
    name: str
    subscription_plan: str
    health_score: float
    churn_probability: float
    risk_tier: RiskTier
    monthly_usage_pct: float


class Customer(BaseModel):
    """Full customer detail matching the frontend contract."""

    customer_id: str
    name: str
    subscription_plan: str
    health_score: float
    churn_probability: float
    risk_tier: RiskTier
    shap_reasons: List[ShapReason]
    recommended_action: str
    monthly_usage_pct: float


class Recommendation(BaseModel):
    customer_id: str
    recommended_action: str
    rationale: str
    priority: RiskTier
    shap_reasons: List[ShapReason]


class SimulationRequest(BaseModel):
    """What-if levers. All optional — only provided fields are overridden."""

    login_frequency: Optional[float] = None
    feature_usage: Optional[float] = None
    monthly_usage_pct: Optional[float] = None
    support_ticket_count: Optional[int] = None
    feedback_score: Optional[float] = None
    payment_status: Optional[str] = None


class SimulationResult(BaseModel):
    customer_id: str
    baseline_churn_probability: float
    simulated_churn_probability: float
    baseline_health_score: float
    simulated_health_score: float
    delta_churn: float
    delta_health: float
    changed_fields: dict
