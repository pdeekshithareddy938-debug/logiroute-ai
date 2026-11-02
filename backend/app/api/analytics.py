from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.delivery import Delivery, DeliveryStatus, DeliveryPriority
from app.models.route_plan import RoutePlan
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics & Statistics"])

@router.get("/stats")
def get_analytics_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Deliveries Count Metrics
    total_deliveries = db.query(Delivery).count()
    pending_deliveries = db.query(Delivery).filter(Delivery.status == DeliveryStatus.PENDING.value).count()
    scheduled_deliveries = db.query(Delivery).filter(Delivery.status == DeliveryStatus.SCHEDULED.value).count()
    in_transit_deliveries = db.query(Delivery).filter(Delivery.status == DeliveryStatus.IN_TRANSIT.value).count()
    completed_deliveries = db.query(Delivery).filter(Delivery.status == DeliveryStatus.DELIVERED.value).count()
    failed_deliveries = db.query(Delivery).filter(Delivery.status.in_([DeliveryStatus.FAILED.value, DeliveryStatus.CANCELLED.value])).count()

    # Route Plan Optimization Metrics
    total_routes = db.query(RoutePlan).count()
    total_distance_saved = db.query(func.sum(RoutePlan.distance_saved_km)).scalar() or 0.0
    total_planned_distance = db.query(func.sum(RoutePlan.total_distance_km)).scalar() or 0.0
    avg_savings_pct = db.query(func.avg(RoutePlan.distance_saved_percent)).scalar() or 0.0

    # Status distribution
    status_counts = {}
    for row in db.query(Delivery.status, func.count(Delivery.id)).group_by(Delivery.status).all():
        status_counts[row[0]] = row[1]

    # Priority distribution
    priority_counts = {}
    for row in db.query(Delivery.priority, func.count(Delivery.id)).group_by(Delivery.priority).all():
        priority_counts[row[0]] = row[1]

    # Recent route performances
    recent_routes = db.query(RoutePlan).order_by(RoutePlan.created_at.desc()).limit(7).all()
    route_efficiency_trend = [
        {
            "id": r.id,
            "name": r.name,
            "stops": r.total_stops,
            "distance_km": round(r.total_distance_km, 2),
            "baseline_km": round(r.baseline_distance_km, 2),
            "saved_km": round(r.distance_saved_km, 2),
            "saved_percent": round(r.distance_saved_percent, 1),
            "duration_min": round(r.estimated_duration_min, 1),
            "date": r.created_at.strftime("%b %d, %H:%M")
        }
        for r in reversed(recent_routes)
    ]

    return {
        "summary": {
            "total_deliveries": total_deliveries,
            "pending_deliveries": pending_deliveries,
            "scheduled_deliveries": scheduled_deliveries,
            "in_transit_deliveries": in_transit_deliveries,
            "completed_deliveries": completed_deliveries,
            "failed_deliveries": failed_deliveries,
            "total_routes_planned": total_routes,
            "total_distance_saved_km": round(total_distance_saved, 2),
            "total_planned_distance_km": round(total_planned_distance, 2),
            "average_savings_percent": round(avg_savings_pct, 1)
        },
        "status_distribution": status_counts,
        "priority_distribution": priority_counts,
        "efficiency_trend": route_efficiency_trend
    }
