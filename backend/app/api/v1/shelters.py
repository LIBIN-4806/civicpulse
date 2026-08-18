from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Shelter, EmergencyService, Location, User
from app.schemas.schemas import ShelterCreate, ShelterResponse, EmergencyServiceResponse, ShelterBase
from app.api.v1.auth import get_current_admin
from app.services.sensor_service import calculate_haversine_distance

router = APIRouter(prefix="/shelters", tags=["Shelters & Emergency Services"])

@router.get("", response_model=List[ShelterResponse])
def get_shelters(
    lat: Optional[float] = Query(None, description="User latitude for distance sorting"),
    lon: Optional[float] = Query(None, description="User longitude for distance sorting"),
    location_id: Optional[int] = Query(None),
    open_only: bool = Query(False),
    db: Session = Depends(get_db)
):
    query = db.query(Shelter)
    if location_id:
        query = query.filter(Shelter.location_id == location_id)
    if open_only:
        query = query.filter(Shelter.is_open == True)
        
    shelters = query.all()
    results = []
    
    for sh in shelters:
        res = ShelterResponse.model_validate(sh)
        res.location_name = sh.location.name if sh.location else "Regional Zone"
        if lat is not None and lon is not None:
            res.distance_km = calculate_haversine_distance(lat, lon, sh.latitude, sh.longitude)
        results.append(res)
        
    if lat is not None and lon is not None:
        results.sort(key=lambda x: (x.distance_km if x.distance_km is not None else 9999))
        
    return results

@router.post("", response_model=ShelterResponse)
def create_shelter(
    shelter_in: ShelterBase,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    new_shelter = Shelter(**shelter_in.model_dump())
    db.add(new_shelter)
    db.commit()
    db.refresh(new_shelter)
    res = ShelterResponse.model_validate(new_shelter)
    res.location_name = new_shelter.location.name if new_shelter.location else ""
    return res

@router.patch("/{shelter_id}")
def update_shelter_occupancy(
    shelter_id: int,
    occupancy: int = Query(...),
    is_open: Optional[bool] = Query(None),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    shelter = db.query(Shelter).filter(Shelter.id == shelter_id).first()
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found")
    shelter.current_occupancy = occupancy
    if is_open is not None:
        shelter.is_open = is_open
    db.commit()
    return {"message": "Shelter status updated successfully", "current_occupancy": shelter.current_occupancy}

@router.get("/emergency-services", response_model=List[EmergencyServiceResponse])
def get_emergency_services(
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    service_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(EmergencyService)
    if service_type:
        query = query.filter(EmergencyService.service_type == service_type.upper())
    services = query.all()
    results = []
    for s in services:
        res = EmergencyServiceResponse.model_validate(s)
        res.location_name = s.location.name if s.location else "Regional Zone"
        if lat is not None and lon is not None:
            res.distance_km = calculate_haversine_distance(lat, lon, s.latitude, s.longitude)
        results.append(res)
        
    if lat is not None and lon is not None:
        results.sort(key=lambda x: (x.distance_km if x.distance_km is not None else 9999))
        
    return results
