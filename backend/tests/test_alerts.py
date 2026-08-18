import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_active_alerts():
    res = client.get("/api/v1/alerts/active")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert data[0]["status"] == "ACTIVE"
        assert "severity" in data[0]
        assert "recommended_actions" in data[0]

def test_get_all_alerts():
    res = client.get("/api/v1/alerts")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
