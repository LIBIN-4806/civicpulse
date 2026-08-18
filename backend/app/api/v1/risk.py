from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.models import Location, EnvironmentalReading, DisasterPrediction, User
from app.schemas.schemas import PredictionRequest, PredictionResponse, LocationResponse
from app.ml.predictor import predictor
from app.api.v1.auth import get_current_user
from app.services.sensor_service import calculate_haversine_distance

router = APIRouter(prefix="/risk", tags=["Risk Assessment & Prediction"])

@router.get("/current", response_model=PredictionResponse)
def get_current_risk(
    lat: Optional[float] = Query(None, description="User current latitude"),
    lon: Optional[float] = Query(None, description="User current longitude"),
    location_id: Optional[int] = Query(None, description="Location ID if selected directly"),
    db: Session = Depends(get_db)
):
    target_location = None
    if location_id:
        target_location = db.query(Location).filter(Location.id == location_id).first()
    elif lat is not None and lon is not None:
        # Find closest location
        all_locs = db.query(Location).all()
        if all_locs:
            target_location = min(
                all_locs,
                key=lambda l: calculate_haversine_distance(lat, lon, l.latitude, l.longitude)
            )
            
    if not target_location:
        target_location = db.query(Location).first()

    if not target_location:
        raise HTTPException(status_code=404, detail="No regional location found")

    # Get latest environmental sensor reading
    latest_reading = db.query(EnvironmentalReading)\
        .filter(EnvironmentalReading.location_id == target_location.id)\
        .order_by(EnvironmentalReading.timestamp.desc())\
        .first()

    req = PredictionRequest(
        location_id=target_location.id,
        location_name=target_location.name,
        latitude=target_location.latitude,
        longitude=target_location.longitude,
        elevation=target_location.elevation,
        rainfall_1h=latest_reading.rainfall_1h if latest_reading else 5.0,
        rainfall_6h=latest_reading.rainfall_6h if latest_reading else 25.0,
        rainfall_24h=latest_reading.rainfall_24h if latest_reading else 60.0,
        temperature=latest_reading.temperature if latest_reading else 28.0,
        humidity=latest_reading.humidity if latest_reading else 70.0,
        wind_speed=latest_reading.wind_speed if latest_reading else 15.0,
        atmospheric_pressure=latest_reading.atmospheric_pressure if latest_reading else 1012.0,
        river_water_level=latest_reading.river_water_level if latest_reading else 2.2,
        river_danger_level=latest_reading.river_danger_level if latest_reading else 4.5,
        soil_moisture=latest_reading.soil_moisture if latest_reading else 50.0,
        historical_vulnerability=target_location.historical_vulnerability_index,
        population_density=target_location.population_density
    )

    result = predictor.predict(req)
    return result

@router.get("/locations")
def get_all_locations_risk(db: Session = Depends(get_db)):
    locations = db.query(Location).all()
    results = []

    for loc in locations:
        latest_reading = db.query(EnvironmentalReading)\
            .filter(EnvironmentalReading.location_id == loc.id)\
            .order_by(EnvironmentalReading.timestamp.desc())\
            .first()

        req = PredictionRequest(
            location_id=loc.id,
            location_name=loc.name,
            latitude=loc.latitude,
            longitude=loc.longitude,
            elevation=loc.elevation,
            rainfall_1h=latest_reading.rainfall_1h if latest_reading else 0.0,
            rainfall_6h=latest_reading.rainfall_6h if latest_reading else 0.0,
            rainfall_24h=latest_reading.rainfall_24h if latest_reading else 0.0,
            temperature=latest_reading.temperature if latest_reading else 28.0,
            humidity=latest_reading.humidity if latest_reading else 60.0,
            wind_speed=latest_reading.wind_speed if latest_reading else 12.0,
            atmospheric_pressure=latest_reading.atmospheric_pressure if latest_reading else 1013.25,
            river_water_level=latest_reading.river_water_level if latest_reading else 1.5,
            river_danger_level=latest_reading.river_danger_level if latest_reading else 4.5,
            soil_moisture=latest_reading.soil_moisture if latest_reading else 40.0,
            historical_vulnerability=loc.historical_vulnerability_index,
            population_density=loc.population_density
        )

        pred = predictor.predict(req)
        
        results.append({
            "location_id": loc.id,
            "name": loc.name,
            "state": loc.state,
            "latitude": loc.latitude,
            "longitude": loc.longitude,
            "elevation": loc.elevation,
            "is_safe_zone": loc.is_safe_zone,
            "flood_prone": loc.flood_prone,
            "landslide_prone": loc.landslide_prone,
            "cyclone_prone": loc.cyclone_prone,
            "heatwave_prone": loc.heatwave_prone,
            "wildfire_prone": loc.wildfire_prone,
            "disaster_type": pred.disaster_type,
            "risk_score": pred.risk_score,
            "risk_category": pred.risk_category,
            "risk_probability": pred.risk_probability,
            "confidence_score": pred.confidence_score,
            "contributing_factors": pred.contributing_factors,
            "recommended_action": pred.recommended_action,
            "latest_reading": {
                "rainfall_24h": latest_reading.rainfall_24h if latest_reading else 0.0,
                "temperature": latest_reading.temperature if latest_reading else 28.0,
                "humidity": latest_reading.humidity if latest_reading else 60.0,
                "wind_speed": latest_reading.wind_speed if latest_reading else 12.0,
                "river_water_level": latest_reading.river_water_level if latest_reading else 1.5,
                "river_danger_level": latest_reading.river_danger_level if latest_reading else 4.5,
                "soil_moisture": latest_reading.soil_moisture if latest_reading else 40.0,
                "atmospheric_pressure": latest_reading.atmospheric_pressure if latest_reading else 1013.25,
            }
        })
    return results

@router.post("/predict", response_model=PredictionResponse)
def run_custom_prediction(req: PredictionRequest):
    """
    On-demand ML prediction endpoint. Computes risk category, transparent score,
    contributing factors, confidence, and safety actions.
    """
    return predictor.predict(req)

@router.post("/simulate", response_model=PredictionResponse)
def simulate_environmental_scenario(req: PredictionRequest):
    """
    Interactive simulation endpoint for testing extreme scenarios like dam breaches,
    monsoon surges, cyclones, or heatwaves.
    """
    return predictor.predict(req)
