from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# Auth Schemas
class UserBase(BaseModel):
    email: str
    full_name: str
    phone_number: Optional[str] = None
    role: Optional[str] = "citizen"
    home_location_id: Optional[int] = None
    address: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Location Schemas
class LocationBase(BaseModel):
    name: str
    state: str
    country: str = "India"
    latitude: float
    longitude: float
    elevation: float = 100.0
    population_density: float = 1500.0
    historical_vulnerability_index: float = 0.5
    flood_prone: bool = False
    landslide_prone: bool = False
    cyclone_prone: bool = False
    heatwave_prone: bool = False
    wildfire_prone: bool = False
    is_safe_zone: bool = False

class LocationResponse(LocationBase):
    id: int
    class Config:
        from_attributes = True

# Environmental Reading Schemas
class EnvironmentalReadingBase(BaseModel):
    location_id: int
    rainfall_1h: float = 0.0
    rainfall_6h: float = 0.0
    rainfall_24h: float = 0.0
    temperature: float = 28.0
    humidity: float = 65.0
    wind_speed: float = 12.0
    wind_gust: float = 18.0
    atmospheric_pressure: float = 1013.25
    river_water_level: float = 1.8
    river_danger_level: float = 4.5
    soil_moisture: float = 35.0
    sea_surface_temp: float = 28.0
    air_quality_index: float = 65.0

class EnvironmentalReadingResponse(EnvironmentalReadingBase):
    id: int
    timestamp: datetime
    is_anomaly: bool
    class Config:
        from_attributes = True

# Prediction & Risk Schemas
class PredictionRequest(BaseModel):
    location_id: Optional[int] = None
    location_name: Optional[str] = "Current Location"
    latitude: Optional[float] = 10.0889
    longitude: Optional[float] = 77.0595
    elevation: Optional[float] = 150.0
    rainfall_1h: float = 0.0
    rainfall_6h: float = 0.0
    rainfall_24h: float = 0.0
    temperature: float = 28.0
    humidity: float = 65.0
    wind_speed: float = 15.0
    atmospheric_pressure: float = 1012.0
    river_water_level: float = 2.0
    river_danger_level: float = 4.5
    soil_moisture: float = 40.0
    historical_vulnerability: float = 0.5
    population_density: float = 2000.0

class ContributingFactor(BaseModel):
    feature: str
    impact: str  # "POSITIVE", "NEGATIVE", "NEUTRAL"
    description: str
    weight: float

class PredictionResponse(BaseModel):
    disaster_type: str
    risk_score: float  # 0 to 100
    risk_category: str  # LOW, MODERATE, HIGH, CRITICAL
    risk_probability: float  # 0.0 to 1.0
    confidence_score: float  # 0.0 to 1.0
    location_name: str
    contributing_factors: List[str]
    factor_breakdown: List[ContributingFactor]
    recommended_action: str
    safety_checklist: List[str]
    disclaimer: str
    timestamp: datetime
    is_anomaly_detected: bool = False

# Alert Schemas
class AlertCreate(BaseModel):
    title: str
    disaster_type: str
    severity: str
    location_id: int
    affected_radius_km: float = 25.0
    message: str
    reason: str
    recommended_actions: List[str]
    is_official: bool = True
    expires_at: Optional[datetime] = None

class AlertResponse(BaseModel):
    id: int
    title: str
    disaster_type: str
    severity: str
    location_id: int
    location_name: Optional[str] = None
    affected_radius_km: float
    message: str
    reason: str
    recommended_actions: List[str]
    issued_by_user_id: Optional[int]
    is_official: bool
    status: str
    created_at: datetime
    expires_at: Optional[datetime]
    class Config:
        from_attributes = True

# Citizen Incident Report Schemas
class CitizenReportCreate(BaseModel):
    incident_type: str
    description: str
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    image_url: Optional[str] = None
    severity: Optional[str] = "MODERATE"
    affected_people_count: Optional[int] = 1

class CitizenReportVerify(BaseModel):
    status: str  # "VERIFIED", "DISMISSED", "RESOLVED"
    verification_notes: Optional[str] = None

class CitizenReportResponse(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    incident_type: str
    description: str
    latitude: float
    longitude: float
    location_name: Optional[str]
    image_url: Optional[str]
    ai_detected_hazard: Optional[str]
    ai_confidence: float
    severity: str
    affected_people_count: int
    status: str
    verification_notes: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

# Shelter Schemas
class ShelterBase(BaseModel):
    name: str
    location_id: int
    address: str
    latitude: float
    longitude: float
    capacity: int = 500
    current_occupancy: int = 0
    contact_phone: Optional[str] = None
    contact_person: Optional[str] = None
    facilities_json: List[str] = []
    is_open: bool = True
    is_accessible: bool = True

class ShelterCreate(ShelterBase):
    pass

class ShelterResponse(ShelterBase):
    id: int
    location_name: Optional[str] = None
    distance_km: Optional[float] = None
    class Config:
        from_attributes = True

# Emergency Service Schemas
class EmergencyServiceBase(BaseModel):
    name: str
    service_type: str
    location_id: int
    address: str
    latitude: float
    longitude: float
    phone_number: str
    emergency_hotline: str
    available_units: int = 10
    is_24_7: bool = True

class EmergencyServiceResponse(EmergencyServiceBase):
    id: int
    location_name: Optional[str] = None
    distance_km: Optional[float] = None
    class Config:
        from_attributes = True

# Notification Schemas
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    alert_id: Optional[int]
    notification_type: str
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True

# Historical Disaster Schemas
class HistoricalDisasterResponse(BaseModel):
    id: int
    location_id: int
    location_name: Optional[str] = None
    disaster_type: str
    year: int
    month: int
    severity: str
    peak_rainfall_mm: float
    casualties: int
    displaced_people: int
    damage_estimate_usd: float
    description: str
    class Config:
        from_attributes = True

# Audit Log Schemas
class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    target_type: Optional[str]
    target_id: Optional[int]
    details: Optional[str]
    timestamp: datetime
    class Config:
        from_attributes = True
