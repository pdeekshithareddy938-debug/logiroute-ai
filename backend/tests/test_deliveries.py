def test_create_delivery_success(client, auth_headers):
    payload = {
        "customer_name": "Test Customer",
        "customer_phone": "+1-555-0199",
        "customer_email": "customer@example.com",
        "delivery_address": "123 Market St, San Francisco, CA",
        "latitude": 37.7900,
        "longitude": -122.4000,
        "package_details": "Electronics Kit",
        "weight_kg": 3.5,
        "priority": "HIGH",
        "status": "PENDING",
        "notes": "Gate code #1234"
    }
    response = client.post("/api/v1/deliveries", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["customer_name"] == "Test Customer"
    assert data["latitude"] == 37.7900
    assert data["longitude"] == -122.4000
    assert data["priority"] == "HIGH"
    assert data["status"] == "PENDING"
    assert "id" in data

def test_create_delivery_invalid_coordinates(client, auth_headers):
    # Latitude > 90 is invalid
    payload = {
        "customer_name": "Invalid Customer",
        "delivery_address": "Nowhere",
        "latitude": 195.0,
        "longitude": -122.4000,
        "weight_kg": 1.0
    }
    response = client.post("/api/v1/deliveries", json=payload, headers=auth_headers)
    assert response.status_code == 422

def test_get_deliveries_list(client, auth_headers):
    response = client.get("/api/v1/deliveries", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_update_delivery(client, auth_headers):
    # First create a delivery
    create_resp = client.post("/api/v1/deliveries", json={
        "customer_name": "Update Target",
        "delivery_address": "456 Howard St",
        "latitude": 37.7880,
        "longitude": -122.3990,
        "weight_kg": 2.0
    }, headers=auth_headers)
    deliv_id = create_resp.json()["id"]

    # Update customer name and priority
    update_resp = client.put(f"/api/v1/deliveries/{deliv_id}", json={
        "customer_name": "Updated Customer Name",
        "priority": "URGENT"
    }, headers=auth_headers)
    assert update_resp.status_code == 200
    data = update_resp.json()
    assert data["customer_name"] == "Updated Customer Name"
    assert data["priority"] == "URGENT"

def test_update_delivery_status(client, auth_headers):
    create_resp = client.post("/api/v1/deliveries", json={
        "customer_name": "Status Target",
        "delivery_address": "789 Mission St",
        "latitude": 37.7850,
        "longitude": -122.4020,
        "weight_kg": 1.5
    }, headers=auth_headers)
    deliv_id = create_resp.json()["id"]

    patch_resp = client.patch(f"/api/v1/deliveries/{deliv_id}/status", json={
        "status": "DELIVERED"
    }, headers=auth_headers)
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "DELIVERED"

def test_delete_delivery(client, auth_headers):
    create_resp = client.post("/api/v1/deliveries", json={
        "customer_name": "Delete Target",
        "delivery_address": "999 Folsom St",
        "latitude": 37.7800,
        "longitude": -122.4050,
        "weight_kg": 1.0
    }, headers=auth_headers)
    deliv_id = create_resp.json()["id"]

    del_resp = client.delete(f"/api/v1/deliveries/{deliv_id}", headers=auth_headers)
    assert del_resp.status_code == 204

    # Verify 404
    get_resp = client.get(f"/api/v1/deliveries/{deliv_id}", headers=auth_headers)
    assert get_resp.status_code == 404
