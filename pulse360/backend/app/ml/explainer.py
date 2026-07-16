"""Model loading + scoring logic for the serving layer.

Kept separate from the route handlers so the serving layer stays thin.

SHAP reasons are NOT computed here at request time — they are precomputed by
ml/train.py and stored in the customers table (deterministic and fast for
live judging). This module only loads the XGBoost model + training metadata
for the /simulate endpoint, which needs live re-scoring of a modified
feature vector.
"""
import json
import pickle
from datetime import date
from pathlib import Path
from typing import Optional

# pulse360/ml/models — three levels above backend/app/ml/.
_MODELS_DIR = Path(__file__).resolve().parents[3] / "ml" / "models"
_MODEL_PATH = _MODELS_DIR / "churn_model.json"
_FEATURES_PATH = _MODELS_DIR / "feature_cols.pkl"
_METADATA_PATH = _MODELS_DIR / "metadata.json"

_model = None
_feature_cols: Optional[list] = None
_metadata: Optional[dict] = None


def _artifacts_available() -> bool:
    return (
        _MODEL_PATH.exists()
        and _FEATURES_PATH.exists()
        and _METADATA_PATH.exists()
    )


def load_artifacts() -> bool:
    """Lazy-load the trained model + metadata. Returns True when ready.

    No-op (and no crash) when artifacts haven't been trained yet — callers
    fall back to heuristics so the API keeps working.
    """
    global _model, _feature_cols, _metadata
    if _model is not None:
        return True
    if not _artifacts_available():
        return False

    import xgboost as xgb

    model = xgb.XGBClassifier()
    model.load_model(str(_MODEL_PATH))
    with open(_FEATURES_PATH, "rb") as fh:
        _feature_cols = pickle.load(fh)
    with open(_METADATA_PATH) as fh:
        _metadata = json.load(fh)
    _model = model
    return True


def build_feature_dict(customer: dict, overrides: dict) -> dict:
    """Assemble the model's feature dict from a customer row + what-if overrides.

    Derived features (payment_active, tenure_days) are recomputed exactly as
    in ml/train.py, using the training reference date from metadata.
    """
    merged = {**customer, **overrides}

    reference = date.fromisoformat(_metadata["reference_date"])
    signup = merged.get("signup_date")
    if isinstance(signup, str):
        signup = date.fromisoformat(signup)
    tenure_days = (reference - signup).days if signup else 0

    return {
        "login_frequency": float(merged["login_frequency"]),
        "feature_usage": float(merged["feature_usage"]),
        "monthly_usage_pct": float(merged["monthly_usage_pct"]),
        "support_ticket_count": float(merged["support_ticket_count"]),
        "feedback_score": float(merged["feedback_score"]),
        "payment_active": 1.0 if merged.get("payment_status") == "active" else 0.0,
        "tenure_days": float(tenure_days),
    }


def predict_churn(features: dict) -> Optional[float]:
    """Score a feature dict with the trained model. None until trained."""
    if not load_artifacts():
        return None
    import numpy as np

    vector = np.array([[features[c] for c in _feature_cols]])
    return float(_model.predict_proba(vector)[0, 1])


def compute_health_score(features: dict) -> Optional[float]:
    """Recompute the composite health score exactly as ml/train.py does,
    using the normalization bounds captured at train time."""
    if not load_artifacts():
        return None

    weights = _metadata["health_weights"]
    bounds = _metadata["normalization_bounds"]
    components = _metadata["health_components"]  # {component: [col, invert]}

    score = weights["payment"] * features["payment_active"]
    for component, (col, invert) in components.items():
        lo, hi = bounds[col]
        scaled = (features[col] - lo) / (hi - lo) if hi > lo else 0.5
        scaled = max(0.0, min(1.0, scaled))
        score += weights[component] * ((1 - scaled) if invert else scaled)
    return round(score * 100, 1)
