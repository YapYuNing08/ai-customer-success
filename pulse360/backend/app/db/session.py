"""SQLAlchemy engine + session factory.

The engine is created lazily and the app does NOT require Postgres to be up
to serve placeholder data — connections are only opened when a DB-backed
path is actually used.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import DATABASE_URL

Base = declarative_base()

# pool_pre_ping avoids stale-connection errors after the DB restarts.
engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db():
    """FastAPI dependency — yields a session, always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
