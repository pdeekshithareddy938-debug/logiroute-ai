from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field, ConfigDict

class StopCreate(BaseModel):
    delivery_id: Optional[int] = None
    is_warehouse: int = 0
    location_name: str
    address: str
    latitude: float
    longitude: float

class RoutePlanCreateRequest(BaseModel):
    name: Optional[str] = None
    delivery_ids: List[int] = Field(..., min_length=1, description="List of delivery IDs to optimize and plan")
    warehouse_name: Optional[str] = None
    warehouse_address: Optional[str] = None
    warehouse_lat: Optional[float] = None
    warehouse_lon: Optional[float] = None
    use_road_network: bool = True
    save_plan: bool = True

class RouteStopResponse(BaseModel):
    id: Optional[int] = None
    sequence_order: int
    is_warehouse: int
    delivery_id: Optional[int] = None
    location_name: str
    address: str
    latitude: float
    longitude: float
    distance_from_prev_km: float
    duration_from_prev_min: float
    cumulative_distance_km: float
    cumulative_duration_min: float
    status: str

    model_config = ConfigDict(from_attributes=True)

class RoutePlanResponse(BaseModel):
    id: int
    name: str
    status: str
    warehouse_name: str
    warehouse_address: str
    warehouse_lat: float
    warehouse_lon: float
    total_stops: int
    total_distance_km: float
    estimated_duration_min: float
    baseline_distance_km: float
    distance_saved_km: float
    distance_saved_percent: float
    optimization_algorithm: str
    routing_source: str
    geometry_geojson: Optional[Any] = None
    stops: List[RouteStopResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RouteComparisonMetrics(BaseModel):
    baseline_algorithm: str = "Original Sequence / Nearest Neighbor"
    baseline_distance_km: float
    baseline_duration_min: float
    optimized_algorithm: str = "2-Opt Route Optimization"
    optimized_distance_km: float
    optimized_duration_min: float
    distance_saved_km: float
    distance_saved_percent: float
    time_saved_min: float
    routing_source: str

class RoutePlanPreviewResponse(BaseModel):
    id: Optional[int] = None
    name: str
    metrics: RouteComparisonMetrics
    original_sequence: List[RouteStopResponse]
    optimized_sequence: List[RouteStopResponse]
    geometry_geojson: Optional[Any] = None
    warehouse: dict
