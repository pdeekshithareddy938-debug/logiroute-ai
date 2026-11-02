from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models.delivery import DeliveryPriority, DeliveryStatus

class DeliveryBase(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=255)
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    delivery_address: str = Field(..., min_length=5, max_length=500)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    package_details: Optional[str] = "Standard Parcel"
    weight_kg: float = Field(1.0, ge=0.1)
    priority: DeliveryPriority = DeliveryPriority.MEDIUM
    status: DeliveryStatus = DeliveryStatus.PENDING
    time_window_start: Optional[str] = None
    time_window_end: Optional[str] = None
    notes: Optional[str] = None

class DeliveryCreate(DeliveryBase):
    pass

class DeliveryUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    delivery_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    package_details: Optional[str] = None
    weight_kg: Optional[float] = None
    priority: Optional[DeliveryPriority] = None
    status: Optional[DeliveryStatus] = None
    time_window_start: Optional[str] = None
    time_window_end: Optional[str] = None
    notes: Optional[str] = None

class DeliveryStatusUpdate(BaseModel):
    status: DeliveryStatus

class DeliveryResponse(DeliveryBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
