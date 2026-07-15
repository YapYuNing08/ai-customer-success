"""Model loading + SHAP explanation logic.

Kept separate from the route handlers so the serving layer stays thin. Until a
real artifact exists in ml/models/, these functions fall back to the
placeholder dataset so the API stays fully functional during early build days.
"""
from pathlib import Path
from typing import List, Optional

from app import data

# ml/models/ lives at the repo root, two levels above backend/app/ml/.
_MODELS_DIR = Path(__file__).resolve().parents[4] / "ml" / "models"
_MODEL_PATH = _MODELS_DIR / "churn_model.json"
_EXPLAINER_PATH = _MODELS_DIR / "shap_explainer.pkl"

_model = None
_explainer = None


def _artifacts_available() -> bool:
    return _MODEL_PATH.exists() and _EXPLAINER_PATH.exists()


def load_artifacts() -> None:
    """Lazy-load the trained model + SHAP explainer if present.

    No-op (and no crash) when artifacts haven't been trained yet.
    """
    global _model, _explainer
    if not _artifacts_available():
        return
    if _model is not None:
        return
    import pickle

    import xgboost as xgb

    _model = xgb.XGBClassifier()
    _model.load_model(str(_MODEL_PATH))
    with open(_EXPLAINER_PATH, "rb") as fh:
        _explainer = pickle.load(fh)


def explain_customer(customer_id: str) -> Optional[List[dict]]:
    """Return SHAP-style reasons for a customer.

    Falls back to the placeholder dataset's reasons until a real model exists.
    """
    load_artifacts()
    if _model is None:
        cust = data.get_customer(customer_id)
        return cust["shap_reasons"] if cust else None

    # TODO: once trained, pull the customer's feature vector from the DB,
    # run _explainer(feature_vector), and map SHAP values -> shap_reasons.
    cust = data.get_customer(customer_id)
    return cust["shap_reasons"] if cust else None


def predict_churn(features: dict) -> Optional[float]:
    """Score a feature dict. Returns None until a model is trained."""
    load_artifacts()
    if _model is None:
        return None
    # TODO: assemble the feature vector in training order and return
    # _model.predict_proba(...)[0, 1].
    return None
