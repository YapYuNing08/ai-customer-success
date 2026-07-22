# Falcon360

**AI-powered Customer Success & Subscription Optimization platform.**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)
![XGBoost](https://img.shields.io/badge/XGBoost-337AB7?style=for-the-badge&logo=xgboost&logoColor=white)
![pandas](https://img.shields.io/badge/pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white)
![SHAP](https://img.shields.io/badge/SHAP-000000?style=for-the-badge&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_API-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

**🔗 Live Demo: [ai-customer-success.vercel.app](https://ai-customer-success.vercel.app/)**

Case Study 2 — *Smart Subscription & Customer Experience Optimization.*

Falcon360 turns a subscription business's raw customer data into a live, explainable
control room: it predicts *who* is about to churn, explains *why*, tells the team
*what to do next*, and lets them *simulate the outcome before they act* — all driven
by a team of five specialised AI agents working together.

---

## The Problem

Subscription businesses live and die by retention, yet most are flying blind:

- **Churn is invisible until it's too late.** By the time a customer cancels, the
  window to save them has already closed. Teams react to churn instead of preventing it.
- **The quiet ones slip away.** The loudest problem customers get all the attention,
  while a large segment of customers simply *go quiet and leave* — never opening a
  ticket, never complaining, never showing up on any "at-risk" list.
- **"Why" is a black box.** A risk score with no explanation is useless. Customer
  Success Managers (CSMs) can't act on a number they don't understand.
- **Retention is generic.** Everyone gets the same "we miss you" email. Teams default
  to discounts and upsells, and rarely consider that the *right* move might be a
  downgrade that keeps the customer for years.
- **Onboarding is where trust is won or lost.** New customers who get stuck in the
  first five minutes churn before they ever see the product's value.

Acquiring a new customer costs **5–7× more** than retaining an existing one — so every
avoidable cancellation is money left on the table.

---

## Our Solution

Falcon360 is a single CSM command center backed by **5 AI agents**. Instead of one
monolithic model, each agent owns one job in the customer lifecycle — onboarding, predicting,
detecting silent churn, replaying the journey, coaching, and strategizing — and they
hand off to each other to turn data into decisions.

The result: a CSM opens the dashboard and immediately sees who's at risk, *why*, the
exact next action to take, and the revenue impact of taking it — in seconds, live,
during a conversation with the customer.

---

## The 5 AI Agents

### 1. Falcon Guide — AI Onboarding Success Agent
Proactively assists customers who appear **hesitant, confused, or inactive** during
onboarding, reducing early-stage churn. It guides brand-new signups through a guided
flow (welcome → package → SIM → preferences), stepping in with contextual help the
moment a customer stalls or repeats an action — so new customers reach value fast and
start their lifecycle healthy instead of at-risk.

### 2. Falcon Sentinel Agent — Silent Customer Detector
The differentiator. Identifies customers with **declining engagement even if they have
never submitted a complaint or support ticket**. Most tools only flag customers who are
already loud — high tickets, low scores. Sentinel hunts the **opposite** profile:
customers who are **quietly disengaging** (low login frequency, few tickets,
still-decent health) and will leave *without ever complaining*.

- Surfaces a segment of accounts and the **monthly recurring revenue** sitting silently
  at risk.
- Critically, most of these customers are **not** in the high-risk tier — they'd be
  completely invisible to any standard churn dashboard. This is the "customers who leave
  without complaining" the rest of the market never catches.

### 3. Falcon Chronicle Agent — AI Journey Replay
Automatically summarizes a customer's **activity history into an easy-to-understand
timeline**, helping Customer Success Managers quickly understand the *root causes* of
churn risk. Instead of scanning raw signals, a CSM reads a plain-language replay of the
account's journey — when engagement dipped, when tickets spiked, when usage fell off —
so the "why behind the number" is obvious at a glance.

### 4. Falcon Coach Agent — Customer AI Coach
Provides **personalized recommendations directly to customers**, improving product
adoption and engagement. A conversational, customer-facing layer that nudges each user
toward the features and habits that keep them successful — turning generic "we miss you"
outreach into tailored, individual coaching.

### 5. Falcon Strategist Agent — Explainable AI with Next Best Actions
The core brain. It doesn't just predict churn — it **explains the reasons and recommends
actionable retention strategies**.

- An **XGBoost** classifier scores every customer on a **0–100 health score** and a
  **churn probability**, sorting them into risk tiers. Health score is a transparent
  composite: **usage 30%, feature adoption 20%, payment behavior 20%, feedback 15%,
  support history 15%**, and the model achieves **0.921 AUC** on a 7,043-customer
  holdout.
- Every score is paired with **Explainable AI (SHAP)** — the top reasons *why* this
  customer is at risk, ranked by contribution. No black boxes.
- It then recommends the single most effective **Next Best Action** — reading each
  customer's health band **and** their top churn driver to turn "this customer is at
  risk" into "call them about their billing issue today."
- A **What-If retention simulator** lets a CSM model changes to the real levers — usage,
  engagement, support experience — re-run the live model, and see the projected churn,
  health, and **revenue saved** before committing:

  > `(baseline churn − simulated churn) × monthly charges × 12`

  It then generates a plain-language **retention plan** (powered by the Gemini API) —
  retention as a decision, not a guess.

> **Plus — the Copilot.** A conversational layer over the platform lets the CSM ask
> natural-language questions ("who are my top at-risk enterprise accounts?") and get
> answers grounded in the live customer data, powered by the Gemini API.

---

## How It Works

```
                    ┌─────────────────────────────────────────────────────────┐
                    │              CSM Dashboard (React/Typescript)           │
                    │  health · churn · SHAP · actions · simulator            │
                    └───────────────────────┬─────────────────────────────────┘
                                            │  REST API
                    ┌───────────────────────┴─────────────────────┐
                    │                FastAPI backend              │
                    │   5 agents · scoring · rules · simulation   │
                    └───────────────────────┬─────────────────────┘
                          ┌─────────────────┼──────────────────┐
                   ┌──────┴──────┐   ┌───────┴───────┐   ┌──────┴──────┐
                   │  PostgreSQL │   │  XGBoost+SHAP │   │  Gemini API │
                   │  Supabase   │   │  churn model  │   │  narratives │
                   └─────────────┘   └───────────────┘   └─────────────┘
```

1. **Train** — XGBoost learns churn from 7,043 real customer records; SHAP explains it;
   the health-score composite is derived. Scores, reasons, and recommended actions are
   written back per customer.
2. **Serve** — FastAPI exposes the agents as clean endpoints; the churn/health numbers
   stay deterministic and fast for a live demo.
3. **Act** — the React dashboard lets a CSM drill into any customer, see the "why",
   simulate an intervention, and read the AI-generated retention plan.

The prediction numbers are always **deterministic and fast** — the Gemini API only ever
rewrites already-computed results into plain language, so the intelligence never depends
on a live external call.

---

## Tech Stack

| Layer      | Technology                                              |
| ---------- | ------------------------------------------------------- |
| Frontend   | React · Vite · Tailwind · Recharts                      |
| Backend    | FastAPI                                                 |
| Database   | Supabase (PostgreSQL)                                   |
| ML         | pandas · numpy · scikit-learn · XGBoost · SHAP          |
| GenAI      | Gemini API (narratives & copilot)                       |
| Deployment | Vercel (frontend) · Render (backend)                    |

**Data:** Kaggle Telco Customer Churn (7,043 real customers with churn labels, tenure,
contract, and payment fields), enriched with engagement signals correlated to real churn
behavior.

---

## Key Numbers (for the demo)

- **7,043** real customers scored
- **0.921 AUC** churn model on holdout
- **Top-5 SHAP reasons** per customer — every prediction is explainable
- A full **Silent Churn** segment worth thousands in monthly recurring revenue —
  most of it invisible to standard risk dashboards

---

## Getting Started

```bash
# Backend (FastAPI)
cd pulse360/backend
python -m venv venv
venv\Scripts\activate           # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
#  API:  http://localhost:8000        Docs:  http://localhost:8000/docs

# Frontend (Vite + React)
cd pulse360/frontend
npm install
npm run dev
#  App:  http://localhost:5173
```

The ML pipeline (`pulse360/ml/load_data.py` → `train.py`) loads and scores the dataset
into Postgres; the shared database is already trained and populated for the demo.

---

## Demo Flow

CSM dashboard → drill into a high-risk customer → see the SHAP "why" → read the Next Best
Action → open the What-If simulator and change the action → watch churn drop and revenue
saved climb → close on the acquisition-vs-retention cost framing.

*Predict. Explain. Recommend. Simulate. Retain.*
