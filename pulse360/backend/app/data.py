"""In-memory placeholder dataset.

Used until the trained model + Postgres are wired in. Every field matches
the frontend contract so the UI can be built against real-looking data.
"""
from typing import Dict, List

_CUSTOMERS: List[dict] = [
    {
        "customer_id": "cus_001",
        "name": "Northwind Traders",
        "subscription_plan": "Enterprise",
        "health_score": 41.2,
        "churn_probability": 0.72,
        "risk_tier": "high",
        "monthly_usage_pct": 34.0,
        "recommended_action": "Schedule an executive business review; usage dropped 40% MoM.",
        "shap_reasons": [
            {"feature": "login_frequency", "contribution": 0.28},
            {"feature": "support_ticket_count", "contribution": 0.19},
            {"feature": "feature_usage", "contribution": 0.14},
            {"feature": "feedback_score", "contribution": -0.05},
        ],
    },
    {
        "customer_id": "cus_002",
        "name": "Acme Robotics",
        "subscription_plan": "Growth",
        "health_score": 68.5,
        "churn_probability": 0.34,
        "risk_tier": "medium",
        "monthly_usage_pct": 61.0,
        "recommended_action": "Nudge toward the analytics module — low feature adoption for their plan.",
        "shap_reasons": [
            {"feature": "feature_usage", "contribution": 0.17},
            {"feature": "monthly_usage_pct", "contribution": -0.11},
            {"feature": "payment_status", "contribution": 0.08},
            {"feature": "feedback_score", "contribution": -0.09},
        ],
    },
    {
        "customer_id": "cus_003",
        "name": "Blue Harbor Health",
        "subscription_plan": "Enterprise",
        "health_score": 88.9,
        "churn_probability": 0.08,
        "risk_tier": "low",
        "monthly_usage_pct": 92.0,
        "recommended_action": "Healthy account — flag as expansion / upsell candidate.",
        "shap_reasons": [
            {"feature": "monthly_usage_pct", "contribution": -0.31},
            {"feature": "login_frequency", "contribution": -0.22},
            {"feature": "feedback_score", "contribution": -0.18},
            {"feature": "support_ticket_count", "contribution": 0.04},
        ],
    },
    {
        "customer_id": "cus_004",
        "name": "Cedar & Co.",
        "subscription_plan": "Starter",
        "health_score": 52.3,
        "churn_probability": 0.55,
        "risk_tier": "high",
        "monthly_usage_pct": 45.0,
        "recommended_action": "Payment failed twice this cycle — trigger billing recovery flow.",
        "shap_reasons": [
            {"feature": "payment_status", "contribution": 0.33},
            {"feature": "monthly_usage_pct", "contribution": 0.09},
            {"feature": "feature_usage", "contribution": 0.06},
            {"feature": "login_frequency", "contribution": -0.03},
        ],
    },
    {
        "customer_id": "cus_005",
        "name": "Summit Analytics",
        "subscription_plan": "Growth",
        "health_score": 74.1,
        "churn_probability": 0.21,
        "risk_tier": "medium",
        "monthly_usage_pct": 70.0,
        "recommended_action": "Send onboarding follow-up for the two seats added last week.",
        "shap_reasons": [
            {"feature": "feature_usage", "contribution": -0.12},
            {"feature": "login_frequency", "contribution": -0.14},
            {"feature": "support_ticket_count", "contribution": 0.07},
            {"feature": "feedback_score", "contribution": -0.06},
        ],
    },
]

_BY_ID: Dict[str, dict] = {c["customer_id"]: c for c in _CUSTOMERS}


def list_customers() -> List[dict]:
    return _CUSTOMERS


def get_customer(customer_id: str) -> dict | None:
    return _BY_ID.get(customer_id)
