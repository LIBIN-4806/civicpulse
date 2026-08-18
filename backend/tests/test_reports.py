import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_auth_token():
    res = client.post("/api/v1/auth/login", json={
        "email": "citizen@civicpulse.org",
        "password": "Citizen@123"
    })
    return res.json()["access_token"]

def test_get_and_submit_incident_reports():
    token = get_auth_token()
    
    # 1. Get reports
    get_res = client.get("/api/v1/reports")
    assert get_res.status_code == 200
    assert isinstance(get_res.json(), list)
    
    # 2. Submit report
    payload = {
        "incident_type": "FLOOD",
        "description": "Rising water in subway junction. Approximately 2 feet depth.",
        "latitude": 9.9880,
        "longitude": 76.2790,
        "location_name": "MG Road Underpass",
        "severity": "MODERATE",
        "affected_people_count": 20,
        "image_url": "https://images.unsplash.com/photo-1547683905-f686c993aae5"
    }
    post_res = client.post(
        "/api/v1/reports",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert post_res.status_code == 200
    report_data = post_res.json()
    assert report_data["incident_type"] == "FLOOD"
    assert report_data["status"] == "PENDING"
    assert "ai_detected_hazard" in report_data
