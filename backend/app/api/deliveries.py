from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.user import User
from app.models.delivery import Delivery, DeliveryStatus, DeliveryPriority
from app.schemas.delivery import (
    DeliveryCreate,
    DeliveryUpdate,
    DeliveryStatusUpdate,
    DeliveryResponse
)
from app.services.auth_service import get_current_user
from app.services.seed_data import seed_database

router = APIRouter(prefix="/deliveries", tags=["Deliveries"])

@router.get("", response_model=List[DeliveryResponse])
def get_deliveries(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    search: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Delivery)

    if status_filter:
        query = query.filter(Delivery.status == status_filter.upper())
    if priority_filter:
        query = query.filter(Delivery.priority == priority_filter.upper())
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                Delivery.customer_name.ilike(search_fmt),
                Delivery.delivery_address.ilike(search_fmt),
                Delivery.package_details.ilike(search_fmt)
            )
        )

    deliveries = query.order_by(Delivery.created_at.desc()).offset(offset).limit(limit).all()
    return deliveries

@router.post("", response_model=DeliveryResponse, status_code=status.HTTP_201_CREATED)
def create_delivery(
    delivery_in: DeliveryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    delivery = Delivery(
        customer_name=delivery_in.customer_name,
        customer_phone=delivery_in.customer_phone,
        customer_email=delivery_in.customer_email,
        delivery_address=delivery_in.delivery_address,
        latitude=delivery_in.latitude,
        longitude=delivery_in.longitude,
        package_details=delivery_in.package_details,
        weight_kg=delivery_in.weight_kg,
        priority=delivery_in.priority.value if hasattr(delivery_in.priority, 'value') else delivery_in.priority,
        status=delivery_in.status.value if hasattr(delivery_in.status, 'value') else delivery_in.status,
        time_window_start=delivery_in.time_window_start,
        time_window_end=delivery_in.time_window_end,
        notes=delivery_in.notes,
        user_id=current_user.id
    )
    db.add(delivery)
    db.commit()
    db.refresh(delivery)
    return delivery

@router.get("/{delivery_id}", response_model=DeliveryResponse)
def get_delivery(
    delivery_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery order not found")
    return delivery

@router.put("/{delivery_id}", response_model=DeliveryResponse)
def update_delivery(
    delivery_id: int,
    delivery_in: DeliveryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery order not found")

    update_data = delivery_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            if hasattr(value, 'value'):
                value = value.value
            setattr(delivery, field, value)

    db.commit()
    db.refresh(delivery)
    return delivery

@router.patch("/{delivery_id}/status", response_model=DeliveryResponse)
def update_delivery_status(
    delivery_id: int,
    status_in: DeliveryStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery order not found")

    delivery.status = status_in.status.value if hasattr(status_in.status, 'value') else status_in.status
    db.commit()
    db.refresh(delivery)
    return delivery

@router.delete("/{delivery_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_delivery(
    delivery_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery order not found")

    db.delete(delivery)
    db.commit()
    return None

@router.post("/actions/seed", response_model=dict)
def trigger_seed_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    delivery_count = db.query(Delivery).count()
    if delivery_count == 0:
        seed_database(db)
    else:
        # Reset all deliveries to PENDING for repeatable live demos
        db.query(Delivery).update({Delivery.status: DeliveryStatus.PENDING.value})
        db.commit()
    count = db.query(Delivery).count()
    return {"message": "Sample dataset seeded successfully", "total_deliveries": count}
