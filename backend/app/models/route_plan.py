from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class RoutePlan(Base):
    __tablename__ = "route_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    status = Column(String(50), default="OPTIMIZED", nullable=False) # DRAFT, OPTIMIZED, IN_PROGRESS, COMPLETED
    
    # Warehouse / Depot Info
    warehouse_name = Column(String(255), nullable=False)
    warehouse_address = Column(String(500), nullable=False)
    warehouse_lat = Column(Float, nullable=False)
    warehouse_lon = Column(Float, nullable=False)
    
    # Metrics
    total_stops = Column(Integer, default=0, nullable=False)
    total_distance_km = Column(Float, default=0.0, nullable=False)
    estimated_duration_min = Column(Float, default=0.0, nullable=False)
    baseline_distance_km = Column(Float, default=0.0, nullable=False)
    distance_saved_km = Column(Float, default=0.0, nullable=False)
    distance_saved_percent = Column(Float, default=0.0, nullable=False)
    
    # Metadata
    optimization_algorithm = Column(String(100), default="2-Opt Heuristic", nullable=False)
    routing_source = Column(String(50), default="ROAD_OSRM", nullable=False) # ROAD_OSRM or STRAIGHT_LINE_HAVERSINE
    geometry_geojson = Column(JSON, nullable=True) # Full polyline or GeoJSON route line coordinates
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    created_by_user = relationship("User", back_populates="route_plans")
    stops = relationship("RoutePlanStop", back_populates="route_plan", cascade="all, delete-orphan", order_by="RoutePlanStop.sequence_order")

class RoutePlanStop(Base):
    __tablename__ = "route_plan_stops"

    id = Column(Integer, primary_key=True, index=True)
    route_plan_id = Column(Integer, ForeignKey("route_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    delivery_id = Column(Integer, ForeignKey("deliveries.id", ondelete="CASCADE"), nullable=True, index=True)
    
    sequence_order = Column(Integer, nullable=False) # 0 is Start Depot, 1..N deliveries, N+1 Return Depot
    is_warehouse = Column(Integer, default=0, nullable=False) # 1 for depot, 0 for customer stop
    
    location_name = Column(String(255), nullable=False)
    address = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    distance_from_prev_km = Column(Float, default=0.0, nullable=False)
    duration_from_prev_min = Column(Float, default=0.0, nullable=False)
    cumulative_distance_km = Column(Float, default=0.0, nullable=False)
    cumulative_duration_min = Column(Float, default=0.0, nullable=False)
    
    status = Column(String(50), default="PENDING", nullable=False) # PENDING, ARRIVED, DELIVERED, SKIPPED

    # Relationships
    route_plan = relationship("RoutePlan", back_populates="stops")
    delivery = relationship("Delivery", back_populates="route_stops")
