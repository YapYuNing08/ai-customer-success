-- Pulse360 schema — plain SQL init (runs automatically via docker-compose).
-- Single customers table: model outputs + raw signals + training label.

CREATE TABLE IF NOT EXISTS customers (
    customer_id          TEXT PRIMARY KEY,
    name                 TEXT NOT NULL,
    subscription_plan    TEXT NOT NULL,

    -- Model outputs (served to the frontend)
    health_score         DOUBLE PRECISION,
    churn_probability    DOUBLE PRECISION,
    risk_tier            TEXT CHECK (risk_tier IN ('low', 'medium', 'high')),
    recommended_action   TEXT,
    monthly_usage_pct    DOUBLE PRECISION,

    -- Raw signals (model inputs / feature engineering)
    signup_date          DATE,
    login_frequency      DOUBLE PRECISION,
    feature_usage        DOUBLE PRECISION,
    payment_status       TEXT,
    support_ticket_count INTEGER DEFAULT 0,
    feedback_score       DOUBLE PRECISION,
    churn_status         INTEGER DEFAULT 0   -- 0 = active, 1 = churned
);

-- A few seed rows so the API has data the moment Postgres comes up.
INSERT INTO customers (
    customer_id, name, subscription_plan, health_score, churn_probability,
    risk_tier, recommended_action, monthly_usage_pct, signup_date,
    login_frequency, feature_usage, payment_status, support_ticket_count,
    feedback_score, churn_status
) VALUES
    ('cus_001', 'Northwind Traders', 'Enterprise', 41.2, 0.72, 'high',
     'Schedule an executive business review; usage dropped 40% MoM.', 34.0,
     '2023-02-11', 1.2, 0.30, 'active', 7, 5.5, 0),
    ('cus_002', 'Acme Robotics', 'Growth', 68.5, 0.34, 'medium',
     'Nudge toward the analytics module — low feature adoption.', 61.0,
     '2023-06-02', 3.4, 0.55, 'active', 2, 7.1, 0),
    ('cus_003', 'Blue Harbor Health', 'Enterprise', 88.9, 0.08, 'low',
     'Healthy account — flag as expansion / upsell candidate.', 92.0,
     '2022-09-19', 6.8, 0.88, 'active', 1, 9.2, 0),
    ('cus_004', 'Cedar & Co.', 'Starter', 52.3, 0.55, 'high',
     'Payment failed twice this cycle — trigger billing recovery flow.', 45.0,
     '2024-01-07', 2.1, 0.40, 'past_due', 4, 6.0, 0),
    ('cus_005', 'Summit Analytics', 'Growth', 74.1, 0.21, 'medium',
     'Send onboarding follow-up for the two seats added last week.', 70.0,
     '2023-11-23', 4.0, 0.62, 'active', 2, 7.8, 0)
ON CONFLICT (customer_id) DO NOTHING;
