"""Customer list + detail endpoints — served from Postgres."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import repository
from app.db.session import get_db
from app.models import Customer, CustomerSummary

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("", response_model=list[CustomerSummary])
def list_customers(
    limit: int = Query(100, ge=1, le=7100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """Highest-risk customers first — the dashboard opens on the accounts
    that need attention."""
    return repository.list_customers(db, limit=limit, offset=offset)


@router.get("/{customer_id}", response_model=Customer)
def get_customer(customer_id: str, db: Session = Depends(get_db)):
    cust = repository.get_customer(db, customer_id)
    if cust is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return cust
