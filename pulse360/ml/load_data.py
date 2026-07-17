"""Pulse360 data loader — Telco CSV -> synthetic columns -> Postgres.

    python ml/load_data.py [--source backend/plots/Telco-Customer-Churn.csv]
                           [--csv-only] [--recreate]

Steps:
    1. Load + normalize the Kaggle/IBM Telco churn CSV into the customers schema
    2. Generate the synthetic behaviour columns (login_frequency, feature_usage,
       monthly_usage_pct, support_ticket_count, feedback_score) from
       churn-conditional distributions — correlated with the label, not noise
    3. Write ml/data/customers_processed.csv (gitignored)
    4. Bulk-load the shared Postgres customers table (idempotent: truncate + insert)

Deterministic: seeded RNG + rows sorted by customerID, so every re-run produces
identical data for the whole team.
"""
from __future__ import annotations

import argparse
import hashlib
import shutil
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent          # pulse360/ml
PULSE_DIR = ROOT.parent                          # pulse360/
DATA_DIR = ROOT / "data"
DEFAULT_SOURCE = PULSE_DIR / "backend" / "plots" / "Telco-Customer-Churn.csv"

# Load .env before importing app.config (load_dotenv never overrides existing vars).
load_dotenv(PULSE_DIR / ".env")
sys.path.insert(0, str(PULSE_DIR / "backend"))

SEED = 42
MIX_RATE = 0.15  # chance a row samples from the opposite class, keeps AUC believable
REFERENCE_DATE = pd.Timestamp("2026-07-15")  # must match train.py

FIRST_NAMES_F = [
    "Aisha", "Amelia", "Ava", "Camila", "Chloe", "Elena", "Emma", "Fatimah",
    "Grace", "Hana", "Isabella", "Jasmine", "Layla", "Lily", "Maya", "Mei",
    "Mia", "Nadia", "Nora", "Olivia", "Priya", "Rania", "Sofia", "Siti",
    "Tara", "Valentina", "Wei Ling", "Yasmin", "Zara", "Zoe",
]
FIRST_NAMES_M = [
    "Adam", "Ahmad", "Aiden", "Arjun", "Carlos", "Daniel", "David", "Diego",
    "Ethan", "Farhan", "Hassan", "Henry", "Ibrahim", "Jack", "Jun Wei",
    "Kai", "Leo", "Liam", "Lucas", "Marcus", "Mateo", "Noah", "Omar",
    "Rafael", "Ravi", "Samuel", "Tariq", "Wei Jie", "Yusuf", "Zhi Hao",
]
SURNAMES = [
    "Abdullah", "Anderson", "Bakar", "Bennett", "Chan", "Chen", "Costa",
    "Das", "Fernandez", "Foster", "Garcia", "Goh", "Gupta", "Hassan",
    "Hernandez", "Ho", "Ibrahim", "Ismail", "Khan", "Kim", "Koh", "Kumar",
    "Lee", "Lim", "Liu", "Martinez", "Mohamed", "Nair", "Ng", "Nguyen",
    "Ong", "Osman", "Patel", "Pereira", "Rahman", "Raj", "Reyes", "Rodriguez",
    "Santos", "Sharma", "Silva", "Singh", "Tan", "Teo", "Tran", "Wang",
    "Wong", "Wu", "Yap", "Zhang",
]


def _stable_hash(s: str) -> int:
    return int(hashlib.md5(s.encode()).hexdigest(), 16)


def synth_name(customer_id: str, gender: str) -> str:
    firsts = FIRST_NAMES_F if gender == "Female" else FIRST_NAMES_M
    h = _stable_hash(customer_id)
    return f"{firsts[h % len(firsts)]} {SURNAMES[(h // 1000) % len(SURNAMES)]}"


def normalize(raw: pd.DataFrame) -> pd.DataFrame:
    """Map Telco columns onto the customers schema (no synthetic columns yet)."""
    raw = raw.sort_values("customerID").reset_index(drop=True)
    df = pd.DataFrame()
    df["customer_id"] = "cus_" + raw["customerID"]
    df["name"] = [
        synth_name(cid, g) for cid, g in zip(raw["customerID"], raw["gender"])
    ]

    charges = raw["MonthlyCharges"].astype(float)
    q33, q66, q90 = charges.quantile([0.33, 0.66, 0.90])
    df["subscription_plan"] = np.select(
        [charges < q33, charges < q66, charges < q90],
        ["Starter", "Growth", "Pro"],
        default="Enterprise",
    )

    tenure = raw["tenure"].astype(int)
    df["signup_date"] = [
        (REFERENCE_DATE - pd.DateOffset(months=int(t))).date() for t in tenure
    ]
    df["churn_status"] = (raw["Churn"] == "Yes").astype(int)
    df["monthly_charges"] = charges.round(2)
    df["contract"] = raw["Contract"]

    # carried through for the synthetic generator, dropped before load
    df["_tenure"] = tenure
    df["_tech_support_no"] = (raw["TechSupport"] == "No").astype(int)
    df["_electronic_check"] = (raw["PaymentMethod"] == "Electronic check").astype(int)
    df["_charges_pctile"] = charges.rank(pct=True)
    return df


def add_synthetic_columns(df: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    """Churn-conditional distributions modulated by real Telco signals.

    A MIX_RATE fraction of rows sample from the opposite class so the
    separation stays realistic rather than trivially learnable.
    """
    n = len(df)
    churned = df["churn_status"].to_numpy().astype(bool)
    eff = churned ^ (rng.random(n) < MIX_RATE)  # effective class for sampling

    login = np.where(
        eff, rng.normal(1.8, 1.0, n), rng.normal(5.0, 1.6, n)
    ) + 0.5 * (df["_tenure"].to_numpy() / 72)
    df["login_frequency"] = np.clip(login, 0, None).round(2)

    usage01 = np.where(eff, rng.beta(2, 5, n), rng.beta(5, 2, n))
    usage01 = usage01 + 0.10 * (df["contract"] == "Two year").to_numpy()
    df["feature_usage"] = np.clip(usage01, 0, 1).round(3)

    pct = np.where(eff, rng.normal(35, 15, n), rng.normal(72, 15, n))
    pct = pct + 10 * (df["_charges_pctile"].to_numpy() - 0.5)
    df["monthly_usage_pct"] = np.clip(pct, 0, 100).round(1)

    lam = np.where(eff, 4.0, 1.0) + df["_tech_support_no"].to_numpy()
    df["support_ticket_count"] = rng.poisson(lam)

    fb = np.where(eff, rng.normal(4.5, 1.5, n), rng.normal(7.6, 1.2, n))
    df["feedback_score"] = np.clip(fb, 1, 10).round(1)

    p_past_due = np.where(churned, 0.35, 0.06) + 0.10 * df["_electronic_check"].to_numpy()
    df["payment_status"] = np.where(
        rng.random(n) < p_past_due, "past_due", "active"
    )
    return df.drop(columns=[c for c in df.columns if c.startswith("_")])


def sanity_report(df: pd.DataFrame) -> None:
    cols = [
        "login_frequency", "feature_usage", "monthly_usage_pct",
        "support_ticket_count", "feedback_score",
    ]
    print("\nChurn-vs-feature means (correlation sanity check):")
    summary = df.groupby("churn_status")[cols].mean().round(2)
    summary["n"] = df.groupby("churn_status").size()
    summary["past_due_rate"] = (
        df.assign(pd_flag=df["payment_status"] == "past_due")
        .groupby("churn_status")["pd_flag"].mean().round(3)
    )
    print(summary.to_string())


def load_postgres(df: pd.DataFrame, recreate: bool) -> None:
    from sqlalchemy import delete, insert

    from app.db.models import Customer
    from app.db.session import Base, engine

    if recreate:
        print("Dropping + recreating customers table")
        Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

    records = df.to_dict(orient="records")
    with engine.begin() as conn:
        conn.execute(delete(Customer))
        for i in range(0, len(records), 500):
            conn.execute(insert(Customer), records[i : i + 500])
    print(f"Loaded {len(records)} rows into Postgres ({engine.url.host})")


def main() -> None:
    parser = argparse.ArgumentParser(description="Load Telco data into Pulse360.")
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--csv-only", action="store_true",
                        help="write processed CSV but skip the Postgres load")
    parser.add_argument("--recreate", action="store_true",
                        help="drop + recreate the customers table (schema changes)")
    args = parser.parse_args()

    print(f"[1/4] Loading {args.source}")
    raw = pd.read_csv(args.source)
    print(f"      {len(raw)} rows")

    print("[2/4] Normalizing + generating synthetic columns (seed=42)")
    rng = np.random.default_rng(SEED)
    df = add_synthetic_columns(normalize(raw), rng)

    print("[3/4] Writing processed CSV")
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if args.source.resolve() != (DATA_DIR / "telco_churn.csv").resolve():
        shutil.copy(args.source, DATA_DIR / "telco_churn.csv")
    df.to_csv(DATA_DIR / "customers_processed.csv", index=False)

    if args.csv_only:
        print("[4/4] --csv-only: skipping Postgres load")
    else:
        print("[4/4] Loading Postgres")
        load_postgres(df, recreate=args.recreate)

    sanity_report(df)


if __name__ == "__main__":
    main()
