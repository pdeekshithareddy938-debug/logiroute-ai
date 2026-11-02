from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class DeliveryPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"

class DeliveryStatus(str, enum.Enum):
    PENDING = "PENDING"
    SCHEDULED = "SCHEDULED"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    FAILED = "FAILED"

class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(255), nullable=False, index=True)
    customer_phone = Column(String(50), nullable=True)
    customer_email = Column(String(255), nullable=True)
    delivery_address = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    package_details = Column(String(500), nullable=True)
    weight_kg = Column(Float, default=1.0, nullable=False)
    priority = Column(String(20), default=DeliveryPriority.MEDIUM.value, nullable=False)
    status = Column(String(20), default=DeliveryStatus.PENDING.value, nullable=False, index=True)
    time_window_start = Column(String(20), nullable=True) # e.g. "09:00"
    time_window_end = Column(String(20), nullable=True)   # e.g. "17:00"
    notes = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    created_by_user = relationship("User", back_populates="deliveries")
    route_stops = relationship("RoutePlanStop", back_populates="delivery", cascade="all, delete-orphan")
