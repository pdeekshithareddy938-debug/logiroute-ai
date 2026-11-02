import pytest
from app.services.distance_matrix import haversine_distance, DistanceService
from app.services.route_optimizer import NearestNeighbor2OptOptimizer

def test_haversine_distance():
    # San Francisco (37.7749, -122.4194) to Oakland (37.8044, -122.2712) ~ 13-14 km
    dist = haversine_distance(37.7749, -122.4194, 37.8044, -122.2712)
    assert 12.0 <= dist <= 15.0

    # Distance to self should be 0.0
    zero_dist = haversine_distance(37.7749, -122.4194, 37.7749, -122.4194)
    assert zero_dist == 0.0

def test_route_optimizer_single_point():
    optimizer = NearestNeighbor2OptOptimizer()
    service = DistanceService()
    locations = [(37.7937, -122.3965)] # Only depot
    result = optimizer.optimize_route(locations, service, use_road_network=False)
    assert result.baseline_distance_km == 0.0
    assert result.optimized_distance_km == 0.0
    assert result.optimized_route_indices == [0]

def test_route_optimizer_two_points():
    optimizer = NearestNeighbor2OptOptimizer()
    service = DistanceService()
    locations = [
        (37.7937, -122.3965), # Depot
        (37.7946, -122.4034), # Stop 1
    ]
    result = optimizer.optimize_route(locations, service, use_road_network=False)
    assert result.optimized_route_indices == [0, 1, 0]
    assert result.optimized_distance_km > 0

def test_route_optimizer_improvement_multi_points():
    optimizer = NearestNeighbor2OptOptimizer()
    service = DistanceService()
    # Deliberately unordered coordinates to verify optimization works
    locations = [
        (37.7937, -122.3965), # Depot (Market St)
        (37.7525, -122.4116), # Stop A (24th St far south)
        (37.7946, -122.4034), # Stop B (Montgomery St near depot)
        (37.7632, -122.4192), # Stop C (Mission St mid)
        (37.7719, -122.4048), # Stop D (Brannan St)
    ]
    result = optimizer.optimize_route(locations, service, use_road_network=False)
    # Optimized distance should be less than or equal to unoptimized baseline
    assert result.optimized_distance_km <= result.baseline_distance_km
    assert result.distance_saved_km >= 0.0
    assert result.distance_saved_percent >= 0.0
    # The route must start and end at depot (index 0)
    assert result.optimized_route_indices[0] == 0
    assert result.optimized_route_indices[-1] == 0
    # Every delivery node must be visited
    visited_deliveries = set(result.optimized_route_indices[1:-1])
    assert visited_deliveries == {1, 2, 3, 4}

def test_route_api_preview_and_plan(client, auth_headers):
    # Create 3 test deliveries
    deliv_ids = []
    for i in range(3):
        resp = client.post("/api/v1/deliveries", json={
            "customer_name": f"Route Test Customer {i}",
            "delivery_address": f"{100 + i * 50} Test St",
            "latitude": 37.7700 + (i * 0.01),
            "longitude": -122.4100 + (i * 0.01),
            "weight_kg": 2.0
        }, headers=auth_headers)
        deliv_ids.append(resp.json()["id"])

    # Test /routes/optimize preview
    preview_resp = client.post("/api/v1/routes/optimize", json={
        "delivery_ids": deliv_ids,
        "use_road_network": False
    }, headers=auth_headers)
    assert preview_resp.status_code == 200
    preview_data = preview_resp.json()
    assert "metrics" in preview_data
    assert "optimized_sequence" in preview_data
    assert len(preview_data["optimized_sequence"]) == len(deliv_ids) + 2 # Depot start + 3 stops + Depot return

    # Test /routes/plan persistent creation
    plan_resp = client.post("/api/v1/routes/plan", json={
        "name": "Integration Test Route Plan",
        "delivery_ids": deliv_ids,
        "use_road_network": False
    }, headers=auth_headers)
    assert plan_resp.status_code == 201
    plan_data = plan_resp.json()
    assert plan_data["name"] == "Integration Test Route Plan"
    assert plan_data["total_stops"] == len(deliv_ids) + 2
    assert "id" in plan_data
    plan_id = plan_data["id"]

    # Test /routes/history
    hist_resp = client.get("/api/v1/routes/history", headers=auth_headers)
    assert hist_resp.status_code == 200
    assert any(p["id"] == plan_id for p in hist_resp.json())

    # Test /routes/{id}
    detail_resp = client.get(f"/api/v1/routes/{plan_id}", headers=auth_headers)
    assert detail_resp.status_code == 200
    assert detail_resp.json()["id"] == plan_id
