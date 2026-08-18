import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_and_login_flow():
    # Test registration
    email = "testcitizen_2026@civicpulse.org"
    reg_payload = {
        "email": email,
        "full_name": "Test Citizen",
        "password": "Password@123",
        "role": "citizen",
        "phone_number": "+91 99887 76655"
    }
    
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code in [200, 400] # 200 on first create, 400 if exists
    
    # Test login
    login_res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "Password@123"
    })
    assert login_res.status_code == 200
    data = login_res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == email

def test_invalid_login():
    res = client.post("/api/v1/auth/login", json={
        "email": "nonexistent@civicpulse.org",
        "password": "WrongPassword123"
    })
    assert res.status_code == 401
