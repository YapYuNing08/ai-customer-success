"""Centralized settings, loaded from environment (.env)."""
import os

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://pulse:pulse@localhost:5432/pulse360"
)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
