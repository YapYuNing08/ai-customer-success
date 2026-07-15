# Pulse360

A subscription / customer-success analytics MVP (hackathon build). It surfaces
per-customer **health scores**, **churn probability**, **SHAP-based reasons**,
and **recommended actions**, with a **what-if simulator** and (later) a Gemini
copilot.

```
pulse360/
├── frontend/   # React + Vite + Tailwind  (Stitch export drops into src/)
├── backend/    # FastAPI — serves the customer analytics contract
├── ml/         # Training pipeline (XGBoost churn model + SHAP + health score)
├── .env.example
└── README.md
```

The backend serves realistic **placeholder data** out of the box, so the
frontend and API can be built before the model or database exist. The DB and
model are wired in progressively.

## Prerequisites

- Node 18+ and Python 3.10+
- A hosted Postgres database (Neon or Supabase free tier) — only needed once
  you move off placeholder data

## Run each piece separately

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv venv
# Windows:  venv\Scripts\activate
# macOS/Linux:  source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Serves placeholder data immediately — **no database required**.

### 2. Frontend (Vite + React + Tailwind)

```bash
cd frontend
npm install
npm run dev
```

- App: http://localhost:5173
- Calls the backend via `src/lib/api.js` (`VITE_API_BASE_URL`, default
  `http://localhost:8000`). Copy `.env.example` → `.env.local` to override.
- The Google Stitch export goes into `src/components/` and `src/pages/`; wire it
  up using the functions already in `src/lib/api.js`.

### 3. Database (hosted Postgres — Neon or Supabase)

1. Create a free Postgres database at [neon.tech](https://neon.tech) or
   [supabase.com](https://supabase.com).
2. Copy the connection string into `.env`:

   ```bash
   cp .env.example .env        # then paste your DATABASE_URL
   ```

   Neon requires `?sslmode=require` on the URL; Supabase uses port `5432`.
3. Apply the schema + seed rows once:

   ```bash
   psql "$DATABASE_URL" -f backend/app/db/init.sql
   ```

SQLAlchemy connects to it transparently — the backend code is identical whether
Postgres is local, containerized, or hosted. Until you switch the routers over
to DB-backed reads, the API keeps serving in-memory placeholder data, so this
step is optional for early frontend work.

### 4. ML training pipeline

```bash
cd ml
pip install -r requirements.txt
python train.py --data data/sample_customers.csv
```

Trains the XGBoost churn classifier, computes SHAP values, derives the health
score composite, and writes artifacts to `ml/models/`. The backend picks these
up automatically once they exist (see `backend/app/ml/explainer.py`).

## API surface

| Method | Path                                   | Purpose                          |
| ------ | -------------------------------------- | -------------------------------- |
| GET    | `/customers`                           | List (summary shape)             |
| GET    | `/customers/{id}`                      | Full customer detail             |
| GET    | `/customers/{id}/recommendation`       | Recommended action + reasons     |
| POST   | `/customers/{id}/simulate`             | What-if churn/health simulation  |
| GET    | `/health`                              | Liveness                         |

Customer shape: `customer_id, name, subscription_plan, health_score,
churn_probability, risk_tier, shap_reasons[{feature, contribution}],
recommended_action, monthly_usage_pct`.

## Health score composite

Weighted 0–100 score computed in `ml/train.py`:

| Component        | Weight |
| ---------------- | ------ |
| Usage            | 30%    |
| Feature adoption | 20%    |
| Payment behavior | 20%    |
| Feedback         | 15%    |
| Support history  | 15%    |

## 7-day build order

1. **Data + model** — dataset into `ml/data/`, train XGBoost + SHAP, health score.
2. **API** — replace placeholder data with DB-backed reads; wire model outputs.
3. **Wire UI** — drop in the Stitch export, connect to `src/lib/api.js`.
4. **Rules layer** — turn SHAP reasons into concrete recommended actions.
5. **What-if simulator** — replace the heuristic in `simulate.py` with the model.
6. **Scripted onboarding trigger** — event that flags at-risk new accounts.
7. **Copilot** — Gemini narrative (`backend/app/ml/gemini.py`) with cached fallback.

## Notes

- Gemini copilot is a **stub** (`backend/app/ml/gemini.py`) — `GEMINI_API_KEY`
  is wired into `.env` but no live calls are made yet.
- `ml/data/` and `ml/models/` are gitignored except a small sample dataset.
