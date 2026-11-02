def test_register_user_success(client):
    response = client.post("/api/v1/auth/register", json={
        "email": "newdriver@delivery.com",
        "password": "strongpassword123",
        "full_name": "Marcus Driver",
        "role": "driver"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newdriver@delivery.com"
    assert data["role"] == "driver"
    assert "id" in data

def test_register_duplicate_email(client, test_user):
    response = client.post("/api/v1/auth/register", json={
        "email": test_user.email,
        "password": "anotherpassword123",
        "full_name": "Duplicate User"
    })
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_login_success(client, test_user):
    response = client.post("/api/v1/auth/login", json={
        "email": test_user.email,
        "password": "testpassword123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == test_user.email

def test_login_invalid_password(client, test_user):
    response = client.post("/api/v1/auth/login", json={
        "email": test_user.email,
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

def test_get_current_user(client, auth_headers, test_user):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == test_user.email

def test_get_current_user_unauthorized(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
