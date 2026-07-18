"""Pydantic schemas — the API contract shared with the frontend.

Field names here MUST match what the Stitch-exported UI expects.
"""
from datetime import date
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
    payment_status: Optional[str] = None
    monthly_charges: Optional[float] = None
    # Raw signals + account facts, so the dashboard derives its detail metrics
    # (feature adoption, friction, tenure, activity timeline) from real data.
    login_frequency: Optional[float] = None
    feature_usage: Optional[float] = None
    support_ticket_count: Optional[int] = None
    feedback_score: Optional[float] = None
    signup_date: Optional[date] = None
    contract: Optional[str] = None


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
    payment_status: Optional[str] = None
    monthly_charges: Optional[float] = None
    # Current raw signal values — the what-if simulator initializes its levers
    # from these so an untouched run shows a zero delta.
    login_frequency: Optional[float] = None
    feature_usage: Optional[float] = None
    support_ticket_count: Optional[int] = None
    feedback_score: Optional[float] = None
    signup_date: Optional[date] = None
    contract: Optional[str] = None


class HealthStats(BaseModel):
    """Population-wide health-band aggregates for the dashboard.

    Computed over the FULL customers table — the /customers list endpoint
    returns a deliberately band-balanced sample, so the frontend must not
    derive these numbers from the list it renders.
    """

    total_customers: int
    healthy_count: int
    at_risk_count: int
    critical_count: int
    healthy_pct: float
    at_risk_pct: float
    critical_pct: float
    avg_health_score: float


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
    # Revenue framing: expected revenue kept = churn-risk reduction x charges.
    # Positive = revenue protected, negative = revenue put at risk.
    monthly_charges: Optional[float] = None
    projected_monthly_revenue_saved: Optional[float] = None
    projected_annual_revenue_saved: Optional[float] = None


class SimulationNarrative(BaseModel):
    """AI-written retention plan for a simulation scenario."""

    customer_id: str
    narrative: str
    source: Literal["gemini", "fallback"]
