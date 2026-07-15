"""Pulse360 training pipeline — end-to-end, runnable standalone.

    python ml/train.py --data ml/data/sample_customers.csv

Steps:
    1. Load CSV
    2. Engineer features
    3. Train an XGBoost churn classifier
    4. Compute SHAP values (and persist the explainer)
    5. Compute a composite health score
       (usage 30%, feature adoption 20%, payment 20%, feedback 15%, support 15%)
    6. Save artifacts to ml/models/

This is intentionally decoupled from the served backend — it only writes
artifacts that backend/app/ml/explainer.py later loads.
"""
from __future__ import annotations

import argparse
import pickle
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent
MODELS_DIR = ROOT / "models"
DEFAULT_DATA = ROOT / "data" / "sample_customers.csv"

FEATURE_COLS = [
    "login_frequency",
    "feature_usage",
    "monthly_usage_pct",
    "support_ticket_count",
    "feedback_score",
    "payment_active",
    "tenure_days",
]

# Health-score composite weights (must sum to 1.0).
HEALTH_WEIGHTS = {
    "usage": 0.30,
    "feature_adoption": 0.20,
    "payment": 0.20,
    "feedback": 0.15,
    "support": 0.15,
}


def load_data(path: Path) -> pd.DataFrame:
    print(f"[1/6] Loading {path}")
    return pd.read_csv(path, parse_dates=["signup_date"])


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    print("[2/6] Engineering features")
    df = df.copy()
    df["payment_active"] = (df["payment_status"] == "active").astype(int)
    reference = pd.Timestamp("2026-07-15")
    df["tenure_days"] = (reference - df["signup_date"]).dt.days
    return df


def _normalize(series: pd.Series, invert: bool = False) -> pd.Series:
    """Min-max scale to 0..1; invert so 'more is worse' -> lower score."""
    lo, hi = series.min(), series.max()
    scaled = (series - lo) / (hi - lo) if hi > lo else pd.Series(0.5, index=series.index)
    return 1 - scaled if invert else scaled


def compute_health_score(df: pd.DataFrame) -> pd.Series:
    """Weighted composite, returned on a 0..100 scale."""
    print("[5/6] Computing composite health score")
    usage = _normalize(df["monthly_usage_pct"])
    feature_adoption = _normalize(df["feature_usage"])
    payment = df["payment_active"].astype(float)
    feedback = _normalize(df["feedback_score"])
    support = _normalize(df["support_ticket_count"], invert=True)  # fewer is better

    score = (
        HEALTH_WEIGHTS["usage"] * usage
        + HEALTH_WEIGHTS["feature_adoption"] * feature_adoption
        + HEALTH_WEIGHTS["payment"] * payment
        + HEALTH_WEIGHTS["feedback"] * feedback
        + HEALTH_WEIGHTS["support"] * support
    )
    return (score * 100).round(1)


def train_model(df: pd.DataFrame):
    print("[3/6] Training XGBoost churn classifier")
    from xgboost import XGBClassifier

    X = df[FEATURE_COLS]
    y = df["churn_status"]

    model = XGBClassifier(
        n_estimators=200,
        max_depth=3,
        learning_rate=0.1,
        subsample=0.9,
        eval_metric="logloss",
    )
    model.fit(X, y)
    acc = (model.predict(X) == y).mean()
    print(f"      train accuracy: {acc:.3f} (small sample — expect overfit)")
    return model, X


def build_explainer(model, X: pd.DataFrame):
    print("[4/6] Computing SHAP values + explainer")
    import shap

    explainer = shap.TreeExplainer(model)
    _ = explainer.shap_values(X)  # sanity check it runs
    return explainer


def save_artifacts(model, explainer) -> None:
    print(f"[6/6] Saving artifacts to {MODELS_DIR}")
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    model.save_model(str(MODELS_DIR / "churn_model.json"))
    with open(MODELS_DIR / "shap_explainer.pkl", "wb") as fh:
        pickle.dump(explainer, fh)
    with open(MODELS_DIR / "feature_cols.pkl", "wb") as fh:
        pickle.dump(FEATURE_COLS, fh)
    print("      done: churn_model.json, shap_explainer.pkl, feature_cols.pkl")


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the Pulse360 churn model.")
    parser.add_argument("--data", type=Path, default=DEFAULT_DATA)
    args = parser.parse_args()

    df = load_data(args.data)
    df = engineer_features(df)
    df["health_score"] = compute_health_score(df)

    model, X = train_model(df)
    explainer = build_explainer(model, X)
    save_artifacts(model, explainer)

    churn_prob = model.predict_proba(X)[:, 1]
    preview = df[["customer_id", "name", "health_score"]].copy()
    preview["churn_probability"] = np.round(churn_prob, 3)
    print("\nPreview:")
    print(preview.to_string(index=False))


if __name__ == "__main__":
    main()
