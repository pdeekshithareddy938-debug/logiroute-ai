from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="dispatcher", nullable=False) # admin, dispatcher, driver
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    deliveries = relationship("Delivery", back_populates="created_by_user", cascade="all, delete-orphan")
    route_plans = relationship("RoutePlan", back_populates="created_by_user", cascade="all, delete-orphan")
