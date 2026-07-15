# Pulse360 — Project Context

AI-powered customer success & subscription optimization platform. Built for a 7-day hackathon, preliminary round. Case Study 2: Smart Subscription & Customer Experience Optimization.

## Judging rubric (drives priority order — see "Feature priority" below)
- Solution 85%: Formulation of Concept 30%, Innovativeness 20%, Methodology 20%, Design 15%
- Business 15%: Market Potential and Demand

## Stack
- Frontend: React + Tailwind + Chart.js/Recharts. UI sourced from a Google Stitch export — do not rebuild from scratch, wire real data into existing components.
- Backend: FastAPI
- Database: PostgreSQL, hosted (Neon or Supabase free tier) — not local, not Docker, not SQLite. One shared connection string in `.env` means the whole team and the demo machine hit the same data, no local drift, no container failure risk mid-week.
- ML: pandas, numpy, scikit-learn, XGBoost, SHAP
- GenAI: Gemini API — used only for the copilot feature (see below), not for churn/health-score logic, which must stay deterministic and fast for live judging

## Data
- Base dataset: Kaggle Telco Customer Churn (7,043 rows) — real churn labels, tenure, contract, payment fields
- Columns not present in the public dataset (support_ticket_count, feedback_score, fine-grained login_frequency/feature_usage) are synthetically generated, correlated with the existing churn label — not random noise. Generator script runs once after the base CSV is loaded into Postgres.
- Load order: CSV → Postgres → synthetic-column generator → train.

## Repo structure
```
pulse360/
├── frontend/        # React + Tailwind, Stitch export goes here
├── backend/
│   └── app/
│       ├── routers/       # customers.py, recommendation.py, simulate.py
│       ├── models/        # pydantic schemas
│       ├── db/             # SQLAlchemy models + session
│       └── ml/              # model loading + SHAP, kept out of route handlers
├── ml/
│   ├── data/          # raw + processed dataset (gitignored except sample)
│   ├── train.py        # training pipeline
│   └── models/         # trained artifacts (gitignored)
└── .env.example          # DATABASE_URL (Neon/Supabase connection string), GEMINI_API_KEY
```

## API contract (drives both frontend and backend — don't let either side drift from this)
Customer object: `customer_id, name, subscription_plan, health_score, churn_probability, risk_tier, shap_reasons: [{feature, contribution}], recommended_action, monthly_usage_pct`

Endpoints:
- `GET /customers` — list + health scores, for dashboard table
- `GET /customers/{id}` — detail + SHAP breakdown, for drill-down
- `GET /customers/{id}/recommendation` — Next Best Action output
- `POST /customers/{id}/simulate` — What-If simulator, takes an action param, returns projected delta

## Feature priority (do not build out of order — scope discipline matters more than feature count for this rubric)

**Must build:**
1. Health Score — composite: usage 30%, feature adoption 20%, payment behavior 20%, feedback 15%, support history 15%
2. Churn Prediction — XGBoost classifier
3. Explainable AI — SHAP values on top of the churn model
4. Next Best Action — rules table keyed to health-score band + top SHAP reason (not a model, a lookup)

**Build if core spine finishes on schedule:**
5. Subscription Optimizer — usage% vs. plan tier, threshold-based upgrade/downgrade rule. Downgrade recommendation is the key innovativeness signal — most competing teams will only ever suggest upsell.
6. What-If Retention Simulator — UI layer over the Next Best Action rules table, projects retention/revenue delta for a chosen intervention

**Fake it, don't build it:**
7. Onboarding Agent — do NOT build real dwell-time/click-tracking ML. Deterministic scripted trigger only: `time_on_page > 10min AND same_button_clicked >= 3 → show popup`, run against a scripted demo customer.
8. Copilot — do NOT build live RAG during the judged demo. Pre-generate answers for 3-4 rehearsed questions, route those exact queries to a real Gemini call with retrieved context. Everything outside the rehearsed set falls back to a canned response — do not risk a live LLM call failing on stage.

**Drop entirely for the hackathon:**
- Separate portals per actor type (Customer, CSM, Business Manager, Support Agent). Build one CSM dashboard + one thin customer-facing onboarding widget. Do not build 5 separate UIs.

## Demo script (maps directly to rubric — follow this order, not a feature-by-feature walkthrough)
CSM dashboard (Design) → drill into high-risk customer, show SHAP "why" (Methodology) → Next Best Action recommendation (Formulation of Concept) → What-If simulator changing the action, showing revenue delta (Innovativeness) → ROI counter + acquisition-vs-retention-cost framing (Market Potential)

## Model routing for development (Claude Code / Claude usage during the build)
- Default: Opus 4.8 — for scaffolding, well-scoped edits, single-file features, routine debugging
- Escalate to Fable 5 only for: the ML training pipeline once real cross-file debugging starts, multi-file refactors, or long autonomous multi-step runs. Don't use Fable 5 for short, well-defined tasks — the capability gap disappears there and it costs ~2x.

## Hard rules
- Don't let UI polish (Stitch cleanup) run past its time box — Design points are already secured once real data is wired in; remaining time should weight toward Formulation of Concept and Methodology, which score zero until the backend/model actually works.
- API contract is defined by the frontend's needs, not the model's natural output shape — reshape model output to match the contract, not the other way around.
- Every screen needs loading and empty states — Stitch-generated components usually don't have them by default.