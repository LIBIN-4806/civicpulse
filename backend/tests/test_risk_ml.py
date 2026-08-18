import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.ml.predictor import predictor
from app.schemas.schemas import PredictionRequest

client = TestClient(app)

def test_ml_predictor_inference():
    req = PredictionRequest(
        rainfall_1h=25.0,
        rainfall_6h=90.0,
        rainfall_24h=210.0,
        elevation=1200.0,
        river_water_level=5.2,
        river_danger_level=4.5,
        soil_moisture=92.0,
        temperature=18.0,
        humidity=96.0,
        wind_speed=25.0,
        atmospheric_pressure=995.0,
        historical_vulnerability=0.85,
        population_density=900.0,
        location_name="Wayanad High Ranges"
    )
    
    result = predictor.predict(req)
    assert result.risk_score >= 0.0 and result.risk_score <= 100.0
    assert result.risk_category in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert result.risk_probability >= 0.0 and result.risk_probability <= 1.0
    assert len(result.contributing_factors) > 0
    assert len(result.safety_checklist) > 0
    assert "CivicPulse provides AI-assisted risk assessment" in result.disclaimer

def test_risk_current_endpoint():
    res = client.get("/api/v1/risk/current?lat=10.0889&lon=77.0595")
    assert res.status_code == 200
    data = res.json()
    assert "risk_score" in data
    assert "risk_category" in data
    assert "contributing_factors" in data
    assert "safety_checklist" in data

def test_risk_locations_endpoint():
    res = client.get("/api/v1/risk/locations")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 10
    assert "risk_score" in data[0]
    assert "latest_reading" in data[0]
