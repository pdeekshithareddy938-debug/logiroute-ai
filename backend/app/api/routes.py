from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app.models.user import User
from app.models.delivery import Delivery, DeliveryStatus
from app.models.route_plan import RoutePlan, RoutePlanStop
from app.schemas.route_plan import (
    RoutePlanCreateRequest,
    RoutePlanResponse,
    RoutePlanPreviewResponse,
    RouteStopResponse,
    RouteComparisonMetrics
)
from app.services.auth_service import get_current_user
from app.services.distance_matrix import DistanceService
from app.services.route_optimizer import NearestNeighbor2OptOptimizer

router = APIRouter(prefix="/routes", tags=["Route Planning & Optimization"])
distance_service = DistanceService(osrm_base_url=settings.OSRM_BASE_URL)
optimizer = NearestNeighbor2OptOptimizer()

def _resolve_locations_and_deliveries(req: RoutePlanCreateRequest, db: Session):
    # Determine warehouse depot coordinates
    wh_lat = req.warehouse_lat if req.warehouse_lat is not None else settings.DEFAULT_WAREHOUSE_LAT
    wh_lon = req.warehouse_lon if req.warehouse_lon is not None else settings.DEFAULT_WAREHOUSE_LON
    wh_name = req.warehouse_name or settings.DEFAULT_WAREHOUSE_NAME
    wh_addr = req.warehouse_address or settings.DEFAULT_WAREHOUSE_ADDRESS

    # Fetch selected deliveries
    deliveries = db.query(Delivery).filter(Delivery.id.in_(req.delivery_ids)).all()
    if not deliveries:
        raise HTTPException(status_code=400, detail="None of the selected delivery IDs were found.")

    # Maintain the order of delivery_ids requested by user
    id_to_delivery = {d.id: d for d in deliveries}
    ordered_deliveries = [id_to_delivery[did] for did in req.delivery_ids if did in id_to_delivery]

    # Index 0: Depot, Index 1..N: Deliveries
    locations = [(wh_lat, wh_lon)] + [(d.latitude, d.longitude) for d in ordered_deliveries]

    return {
        "warehouse": {
            "name": wh_name,
            "address": wh_addr,
            "lat": wh_lat,
            "lon": wh_lon
        },
        "deliveries": ordered_deliveries,
        "locations": locations
    }

@router.post("/optimize", response_model=RoutePlanPreviewResponse)
def optimize_route_preview(
    req: RoutePlanCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resolved = _resolve_locations_and_deliveries(req, db)
    wh = resolved["warehouse"]
    deliveries = resolved["deliveries"]
    locations = resolved["locations"]

    opt_result = optimizer.optimize_route(
        locations=locations,
        distance_service=distance_service,
        use_road_network=req.use_road_network
    )

    # Format original sequence stops
    original_stops = []
    for step_num, idx in enumerate(opt_result.original_route_indices):
        if idx == 0:
            original_stops.append(RouteStopResponse(
                sequence_order=step_num,
                is_warehouse=1,
                delivery_id=None,
                location_name=f"{wh['name']} (Depot)",
                address=wh["address"],
                latitude=wh["lat"],
                longitude=wh["lon"],
                distance_from_prev_km=0.0,
                duration_from_prev_min=0.0,
                cumulative_distance_km=0.0,
                cumulative_duration_min=0.0,
                status="WAREHOUSE"
            ))
        else:
            deliv = deliveries[idx - 1]
            original_stops.append(RouteStopResponse(
                sequence_order=step_num,
                is_warehouse=0,
                delivery_id=deliv.id,
                location_name=deliv.customer_name,
                address=deliv.delivery_address,
                latitude=deliv.latitude,
                longitude=deliv.longitude,
                distance_from_prev_km=0.0,
                duration_from_prev_min=0.0,
                cumulative_distance_km=0.0,
                cumulative_duration_min=0.0,
                status=deliv.status
            ))

    # Format optimized sequence stops with calculated metrics
    optimized_stops = []
    for step_num, idx in enumerate(opt_result.optimized_route_indices):
        metrics = opt_result.step_metrics[step_num] if step_num < len(opt_result.step_metrics) else {
            "distance_km": 0.0, "duration_min": 0.0, "cum_dist": 0.0, "cum_dur": 0.0
        }
        if idx == 0:
            is_return = (step_num == len(opt_result.optimized_route_indices) - 1 and step_num > 0)
            label = f"{wh['name']} (Return Hub)" if is_return else f"{wh['name']} (Start Depot)"
            optimized_stops.append(RouteStopResponse(
                sequence_order=step_num,
                is_warehouse=1,
                delivery_id=None,
                location_name=label,
                address=wh["address"],
                latitude=wh["lat"],
                longitude=wh["lon"],
                distance_from_prev_km=metrics["distance_km"],
                duration_from_prev_min=metrics["duration_min"],
                cumulative_distance_km=metrics["cum_dist"],
                cumulative_duration_min=metrics["cum_dur"],
                status="RETURN" if is_return else "START"
            ))
        else:
            deliv = deliveries[idx - 1]
            optimized_stops.append(RouteStopResponse(
                sequence_order=step_num,
                is_warehouse=0,
                delivery_id=deliv.id,
                location_name=deliv.customer_name,
                address=deliv.delivery_address,
                latitude=deliv.latitude,
                longitude=deliv.longitude,
                distance_from_prev_km=metrics["distance_km"],
                duration_from_prev_min=metrics["duration_min"],
                cumulative_distance_km=metrics["cum_dist"],
                cumulative_duration_min=metrics["cum_dur"],
                status=deliv.status
            ))

    comparison = RouteComparisonMetrics(
        baseline_algorithm="Original Dispatch Order",
        baseline_distance_km=opt_result.baseline_distance_km,
        baseline_duration_min=opt_result.baseline_duration_min,
        optimized_algorithm=opt_result.algorithm_used,
        optimized_distance_km=opt_result.optimized_distance_km,
        optimized_duration_min=opt_result.optimized_duration_min,
        distance_saved_km=opt_result.distance_saved_km,
        distance_saved_percent=opt_result.distance_saved_percent,
        time_saved_min=opt_result.time_saved_min,
        routing_source=opt_result.routing_source
    )

    return RoutePlanPreviewResponse(
        name=req.name or f"Optimized Route ({len(deliveries)} Stops)",
        metrics=comparison,
        original_sequence=original_stops,
        optimized_sequence=optimized_stops,
        geometry_geojson=opt_result.geometry_geojson,
        warehouse=wh
    )

@router.post("/plan", response_model=RoutePlanResponse, status_code=status.HTTP_201_CREATED)
def create_and_save_route_plan(
    req: RoutePlanCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resolved = _resolve_locations_and_deliveries(req, db)
    wh = resolved["warehouse"]
    deliveries = resolved["deliveries"]
    locations = resolved["locations"]

    opt_result = optimizer.optimize_route(
        locations=locations,
        distance_service=distance_service,
        use_road_network=req.use_road_network
    )

    route_name = req.name or f"Route Run #{db.query(RoutePlan).count() + 1} - {len(deliveries)} Stops"

    # Create RoutePlan entity
    route_plan = RoutePlan(
        name=route_name,
        status="OPTIMIZED",
        warehouse_name=wh["name"],
        warehouse_address=wh["address"],
        warehouse_lat=wh["lat"],
        warehouse_lon=wh["lon"],
        total_stops=len(opt_result.optimized_route_indices),
        total_distance_km=opt_result.optimized_distance_km,
        estimated_duration_min=opt_result.optimized_duration_min,
        baseline_distance_km=opt_result.baseline_distance_km,
        distance_saved_km=opt_result.distance_saved_km,
        distance_saved_percent=opt_result.distance_saved_percent,
        optimization_algorithm=opt_result.algorithm_used,
        routing_source=opt_result.routing_source,
        geometry_geojson=opt_result.geometry_geojson,
        user_id=current_user.id
    )
    db.add(route_plan)
    db.flush()

    # Create stops
    for step_num, idx in enumerate(opt_result.optimized_route_indices):
        metrics = opt_result.step_metrics[step_num] if step_num < len(opt_result.step_metrics) else {
            "distance_km": 0.0, "duration_min": 0.0, "cum_dist": 0.0, "cum_dur": 0.0
        }
        if idx == 0:
            is_return = (step_num == len(opt_result.optimized_route_indices) - 1 and step_num > 0)
            stop = RoutePlanStop(
                route_plan_id=route_plan.id,
                delivery_id=None,
                sequence_order=step_num,
                is_warehouse=1,
                location_name=f"{wh['name']} (Return Hub)" if is_return else f"{wh['name']} (Depot Start)",
                address=wh["address"],
                latitude=wh["lat"],
                longitude=wh["lon"],
                distance_from_prev_km=metrics["distance_km"],
                duration_from_prev_min=metrics["duration_min"],
                cumulative_distance_km=metrics["cum_dist"],
                cumulative_duration_min=metrics["cum_dur"],
                status="RETURN" if is_return else "DEPARTED"
            )
        else:
            deliv = deliveries[idx - 1]
            # Mark delivery as scheduled
            deliv.status = DeliveryStatus.SCHEDULED.value
            stop = RoutePlanStop(
                route_plan_id=route_plan.id,
                delivery_id=deliv.id,
                sequence_order=step_num,
                is_warehouse=0,
                location_name=deliv.customer_name,
                address=deliv.delivery_address,
                latitude=deliv.latitude,
                longitude=deliv.longitude,
                distance_from_prev_km=metrics["distance_km"],
                duration_from_prev_min=metrics["duration_min"],
                cumulative_distance_km=metrics["cum_dist"],
                cumulative_duration_min=metrics["cum_dur"],
                status="SCHEDULED"
            )
        db.add(stop)

    db.commit()
    db.refresh(route_plan)
    return route_plan

@router.get("/history", response_model=List[RoutePlanResponse])
def get_route_history(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plans = db.query(RoutePlan).order_by(RoutePlan.created_at.desc()).offset(offset).limit(limit).all()
    return plans

@router.get("/{route_id}", response_model=RoutePlanResponse)
def get_route_plan_details(
    route_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = db.query(RoutePlan).filter(RoutePlan.id == route_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Route plan not found")
    return plan

@router.patch("/{route_id}/status", response_model=RoutePlanResponse)
def update_route_plan_status(
    route_id: int,
    status_update: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = db.query(RoutePlan).filter(RoutePlan.id == route_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Route plan not found")

    new_status = status_update.get("status")
    if new_status:
        plan.status = new_status.upper()
        # If completing route, update deliveries to DELIVERED
        if plan.status == "COMPLETED":
            for stop in plan.stops:
                if stop.delivery:
                    stop.delivery.status = DeliveryStatus.DELIVERED.value
                    stop.status = "DELIVERED"
        elif plan.status == "IN_PROGRESS":
            for stop in plan.stops:
                if stop.delivery and stop.delivery.status != DeliveryStatus.DELIVERED.value:
                    stop.delivery.status = DeliveryStatus.IN_TRANSIT.value

    db.commit()
    db.refresh(plan)
    return plan
