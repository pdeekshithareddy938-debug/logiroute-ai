def test_analytics_stats(client, auth_headers):
    # Ensure at least 1 delivery exists
    client.post("/api/v1/deliveries", json={
        "customer_name": "Analytics Customer",
        "delivery_address": "777 Market St",
        "latitude": 37.7870,
        "longitude": -122.4040,
        "weight_kg": 2.5,
        "priority": "HIGH",
        "status": "PENDING"
    }, headers=auth_headers)

    response = client.get("/api/v1/analytics/stats", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "status_distribution" in data
    assert "priority_distribution" in data
    assert "efficiency_trend" in data
    assert data["summary"]["total_deliveries"] >= 1
    assert "pending_deliveries" in data["summary"]
    assert "total_distance_saved_km" in data["summary"]
