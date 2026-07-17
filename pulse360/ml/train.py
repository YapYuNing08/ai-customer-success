"""Pulse360 training pipeline — end-to-end, runnable standalone.

    python ml/train.py                 # train on the shared Postgres customers table
    python ml/train.py --data <csv>    # offline fallback: train on a processed CSV

Steps:
    1. Load customers (Postgres by default)
    2. Engineer features
    3. Train an XGBoost churn classifier (stratified 80/20 holdout AUC, then
       refit on all rows for serving)
    4. Compute SHAP values; keep top-5 signed reasons per customer
    5. Compute a composite health score
       (usage 30%, feature adoption 20%, payment 20%, feedback 15%, support 15%)
    6. Assign risk tiers + Next Best Action (rules lookup, not a model)
    7. Write scores/reasons/actions back to Postgres so the API serves
       precomputed, deterministic values
    8. Save artifacts to ml/models/ (model + explainer + feature cols + metadata)
"""
from __future__ import annotations

import argparse
import json
import pickle
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent           # pulse360/ml
PULSE_DIR = ROOT.parent                           # pulse360/
MODELS_DIR = ROOT / "models"

load_dotenv(PULSE_DIR / ".env")
sys.path.insert(0, str(PULSE_DIR / "backend"))

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

REFERENCE_DATE = pd.Timestamp("2026-07-15")  # must match ml/load_data.py

RISK_THRESHOLDS = {"low": 0.30, "medium": 0.60}  # p < low -> low, p < medium -> medium

# Which raw column feeds each health component, and whether more is worse.
HEALTH_COMPONENTS = {
    "usage": ("monthly_usage_pct", False),
    "feature_adoption": ("feature_usage", False),
    "feedback": ("feedback_score", False),
    "support": ("support_ticket_count", True),
}

# ---------------------------------------------------------------------------
# Next Best Action — a rules lookup keyed on (health band, top churn driver).
# Deliberately NOT a model (CLAUDE.md feature #4).
# ---------------------------------------------------------------------------
HEALTH_BANDS = [(45.0, "low"), (70.0, "medium"), (float("inf"), "high")]

ACTION_RULES = {
    ("low", "support_ticket_count"): "Escalate to priority support queue — unresolved tickets are the top churn driver.",
    ("low", "feedback_score"): "Schedule a CSM recovery call within 48h to address detractor feedback.",
    ("low", "login_frequency"): "Launch a re-engagement campaign; account has gone quiet.",
    ("low", "feature_usage"): "Book a guided feature-adoption session — core modules are untouched.",
    ("low", "monthly_usage_pct"): "Offer a right-sized plan review before the customer walks — they are paying for capacity they do not use.",
    ("low", "payment_active"): "Trigger the billing recovery flow and offer a flexible payment option.",
    ("low", "tenure_days"): "Run the new-account rescue play: onboarding check-in + success plan.",
    ("medium", "support_ticket_count"): "Proactively follow up on recent tickets before renewal.",
    ("medium", "feedback_score"): "Send a feedback follow-up and close the loop on their last survey.",
    ("medium", "login_frequency"): "Nudge with a personalized usage digest to rebuild the habit.",
    ("medium", "feature_usage"): "Recommend the analytics module walkthrough — adoption is lagging.",
    ("medium", "monthly_usage_pct"): "Suggest a plan right-size (downgrade) to rebuild trust and lock renewal.",
    ("medium", "payment_active"): "Switch the account to auto-pay to remove payment friction.",
    ("medium", "tenure_days"): "Schedule a 90-day business review to prove early value.",
    ("high", "monthly_usage_pct"): "Healthy but under-using their tier — proactively offer a downgrade; it builds trust and prevents silent churn.",
    ("high", "feature_usage"): "Healthy account — introduce advanced features to deepen adoption.",
}
DEFAULT_ACTIONS = {
    "low": "Open a retention play: exec sponsor outreach + save offer.",
    "medium": "Monitor closely; add to the next CSM review cycle.",
    "high": "Healthy account — flag as expansion / upsell candidate.",
}


def load_from_postgres() -> pd.DataFrame:
    from app.db.session import engine

    print("[1/8] Loading customers from Postgres")
    df = pd.read_sql("SELECT * FROM customers", engine)
    df["signup_date"] = pd.to_datetime(df["signup_date"])
    return df


def load_from_csv(path: Path) -> pd.DataFrame:
    print(f"[1/8] Loading {path}")
    return pd.read_csv(path, parse_dates=["signup_date"])


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    print("[2/8] Engineering features")
    df = df.copy()
    df["payment_active"] = (df["payment_status"] == "active").astype(int)
    df["tenure_days"] = (REFERENCE_DATE - df["signup_date"]).dt.days
    return df


def compute_health_score(df: pd.DataFrame) -> tuple[pd.Series, dict]:
    """Weighted composite on a 0..100 scale.

    Returns the scores and the min/max bounds used for normalization so the
    serving layer (/simulate) can recompute identically at request time.
    """
    print("[5/8] Computing composite health score")
    bounds: dict[str, list[float]] = {}
    parts = {}
    for component, (col, invert) in HEALTH_COMPONENTS.items():
        lo, hi = float(df[col].min()), float(df[col].max())
        bounds[col] = [lo, hi]
        scaled = (df[col] - lo) / (hi - lo) if hi > lo else pd.Series(0.5, index=df.index)
        parts[component] = 1 - scaled if invert else scaled
    parts["payment"] = df["payment_active"].astype(float)

    score = sum(HEALTH_WEIGHTS[c] * parts[c] for c in HEALTH_WEIGHTS)
    return (score * 100).round(1), bounds


def train_model(df: pd.DataFrame):
    print("[3/8] Training XGBoost churn classifier")
    from sklearn.metrics import roc_auc_score
    from sklearn.model_selection import train_test_split
    from xgboost import XGBClassifier

    X = df[FEATURE_COLS]
    y = df["churn_status"]

    params = dict(
        n_estimators=200,
        max_depth=3,
        learning_rate=0.1,
        subsample=0.9,
        eval_metric="logloss",
        random_state=42,
    )

    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    holdout = XGBClassifier(**params).fit(X_tr, y_tr)
    auc = roc_auc_score(y_te, holdout.predict_proba(X_te)[:, 1])
    acc = (holdout.predict(X_te) == y_te).mean()
    print(f"      holdout AUC: {auc:.3f} | holdout accuracy: {acc:.3f}")

    model = XGBClassifier(**params).fit(X, y)  # refit on all rows for serving
    return model, X, float(auc)


def build_explainer(model, X: pd.DataFrame):
    print("[4/8] Computing SHAP values")
    import shap

    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)
    return explainer, np.asarray(shap_values)


def top_shap_reasons(shap_row: np.ndarray, top_n: int = 5) -> list[dict]:
    order = np.argsort(-np.abs(shap_row))[:top_n]
    return [
        {"feature": FEATURE_COLS[i], "contribution": round(float(shap_row[i]), 4)}
        for i in order
    ]


def health_band(score: float) -> str:
    for limit, band in HEALTH_BANDS:
        if score < limit:
            return band
    return "high"


def next_best_action(score: float, reasons: list[dict]) -> str:
    band = health_band(score)
    # act on the strongest churn-increasing driver; fall back to top |driver|
    drivers = [r for r in reasons if r["contribution"] > 0] or reasons
    top_feature = drivers[0]["feature"]
    return ACTION_RULES.get((band, top_feature), DEFAULT_ACTIONS[band])


def risk_tier(p: float) -> str:
    if p < RISK_THRESHOLDS["low"]:
        return "low"
    if p < RISK_THRESHOLDS["medium"]:
        return "medium"
    return "high"


def write_back(df: pd.DataFrame) -> None:
    """Replace the customers table contents with scored rows.

    Delete + re-insert (rather than 7k UPDATEs) — SQLAlchemy batches inserts
    into multi-row VALUES, which is orders of magnitude faster over a remote
    pooler connection.
    """
    from sqlalchemy import delete, insert

    from app.db.models import Customer
    from app.db.session import engine

    print("[7/8] Writing scores back to Postgres")
    cols = [c.name for c in Customer.__table__.columns]
    out = df[cols].copy()
    out["signup_date"] = out["signup_date"].dt.date
    records = out.to_dict(orient="records")
    with engine.begin() as conn:
        conn.execute(delete(Customer))
        for i in range(0, len(records), 500):
            conn.execute(insert(Customer), records[i : i + 500])
    print(f"      updated {len(records)} rows")


def save_artifacts(model, explainer, bounds: dict, auc: float) -> None:
    print(f"[8/8] Saving artifacts to {MODELS_DIR}")
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    model.save_model(str(MODELS_DIR / "churn_model.json"))
    with open(MODELS_DIR / "shap_explainer.pkl", "wb") as fh:
        pickle.dump(explainer, fh)
    with open(MODELS_DIR / "feature_cols.pkl", "wb") as fh:
        pickle.dump(FEATURE_COLS, fh)

    metadata = {
        "reference_date": str(REFERENCE_DATE.date()),
        "risk_thresholds": RISK_THRESHOLDS,
        "health_weights": HEALTH_WEIGHTS,
        "health_components": {c: list(v) for c, v in HEALTH_COMPONENTS.items()},
        "normalization_bounds": bounds,
        "feature_cols": FEATURE_COLS,
        "holdout_auc": round(auc, 4),
        "trained_at": datetime.now(timezone.utc).isoformat(),
    }
    with open(MODELS_DIR / "metadata.json", "w") as fh:
        json.dump(metadata, fh, indent=2)
    print("      done: churn_model.json, shap_explainer.pkl, feature_cols.pkl, metadata.json")


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the Pulse360 churn model.")
    parser.add_argument("--data", type=Path, default=None,
                        help="train from a processed CSV instead of Postgres")
    parser.add_argument("--no-db-write", action="store_true",
                        help="skip writing scores back to Postgres")
    args = parser.parse_args()

    df = load_from_csv(args.data) if args.data else load_from_postgres()
    df = engineer_features(df)

    model, X, auc = train_model(df)
    explainer, shap_values = build_explainer(model, X)

    df["health_score"], bounds = compute_health_score(df)
    df["churn_probability"] = np.round(model.predict_proba(X)[:, 1], 4)
    df["risk_tier"] = df["churn_probability"].map(risk_tier)

    print("[6/8] Assigning SHAP reasons + Next Best Actions")
    df["shap_reasons"] = [top_shap_reasons(row) for row in shap_values]
    df["recommended_action"] = [
        next_best_action(s, r) for s, r in zip(df["health_score"], df["shap_reasons"])
    ]

    if args.no_db_write or args.data is not None:
        print("[7/8] Skipping Postgres write-back")
    else:
        write_back(df)

    save_artifacts(model, explainer, bounds, auc)

    print("\nRisk tier mix:")
    print(df["risk_tier"].value_counts().to_string())
    preview = df.sort_values("churn_probability", ascending=False).head(8)
    print("\nTop-risk preview:")
    print(preview[["customer_id", "name", "health_score", "churn_probability",
                   "risk_tier"]].to_string(index=False))


if __name__ == "__main__":
    main()
