"""Pulse360 FastAPI entrypoint.

Run from the backend/ directory:
    uvicorn app.main:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import FRONTEND_ORIGIN
from app.routers import customers, recommendation, simulate

app = FastAPI(title="Pulse360 API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    # Explicit origins plus a regex so any localhost/127.0.0.1 port works
    # (Vite bumps to 5174, 5175, … when a port is taken — don't let CORS break).
    allow_origins=[FRONTEND_ORIGIN, "http://localhost:3000"],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(customers.router)
app.include_router(recommendation.router)
app.include_router(simulate.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to Pulse360 API. Go to /docs for Swagger API documentation."}


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok", "service": "pulse360"}
