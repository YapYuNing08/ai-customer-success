"""Customer list + detail endpoints."""
from fastapi import APIRouter, HTTPException

from app import data
from app.models import Customer, CustomerSummary

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("", response_model=list[CustomerSummary])
def list_customers():
    return data.list_customers()


@router.get("/{customer_id}", response_model=Customer)
def get_customer(customer_id: str):
    cust = data.get_customer(customer_id)
    if cust is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return cust
