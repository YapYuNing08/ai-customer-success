"""SQLAlchemy ORM model for the customers table.

Mirrors backend/app/db/init.sql. Kept in sync with the pydantic contract in
app/models/customer.py, plus the raw signal columns used by the ML pipeline.
"""
from sqlalchemy import Column, Date, Float, Integer, String

from app.db.session import Base


class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    subscription_plan = Column(String, nullable=False)

    # Model outputs (served to the frontend)
    health_score = Column(Float)
    churn_probability = Column(Float)
    risk_tier = Column(String)
    recommended_action = Column(String)
    monthly_usage_pct = Column(Float)

    # Raw signals (model inputs / feature engineering)
    signup_date = Column(Date)
    login_frequency = Column(Float)
    feature_usage = Column(Float)
    payment_status = Column(String)
    support_ticket_count = Column(Integer)
    feedback_score = Column(Float)
    churn_status = Column(Integer)  # 0 = active, 1 = churned (training label)
