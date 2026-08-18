from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="citizen", nullable=False)  # "citizen", "admin"
    phone_number = Column(String(50), nullable=True)
    home_location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    address = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    home_location = relationship("Location", back_populates="residents")
    reports = relationship("CitizenReport", back_populates="user", foreign_keys="CitizenReport.user_id")
    notifications = relationship("Notification", back_populates="user")
    issued_alerts = relationship("Alert", back_populates="issuer")
    audit_logs = relationship("AuditLog", back_populates="user")


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    state = Column(String(255), nullable=False)
    country = Column(String(255), default="India")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation = Column(Float, default=100.0)  # meters
    population_density = Column(Float, default=1500.0)  # per sq km
    historical_vulnerability_index = Column(Float, default=0.5)  # 0.0 - 1.0
    flood_prone = Column(Boolean, default=False)
    landslide_prone = Column(Boolean, default=False)
    cyclone_prone = Column(Boolean, default=False)
    heatwave_prone = Column(Boolean, default=False)
    wildfire_prone = Column(Boolean, default=False)
    is_safe_zone = Column(Boolean, default=False)

    residents = relationship("User", back_populates="home_location")
    readings = relationship("EnvironmentalReading", back_populates="location")
    predictions = relationship("DisasterPrediction", back_populates="location")
    alerts = relationship("Alert", back_populates="location")
    shelters = relationship("Shelter", back_populates="location")
    emergency_services = relationship("EmergencyService", back_populates="location")
    historical_disasters = relationship("HistoricalDisaster", back_populates="location")


class EnvironmentalReading(Base):
    __tablename__ = "environmental_readings"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    rainfall_1h = Column(Float, default=0.0)  # mm
    rainfall_6h = Column(Float, default=0.0)  # mm
    rainfall_24h = Column(Float, default=0.0)  # mm
    temperature = Column(Float, default=28.0)  # Celsius
    humidity = Column(Float, default=65.0)  # %
    wind_speed = Column(Float, default=12.0)  # km/h
    wind_gust = Column(Float, default=18.0)  # km/h
    atmospheric_pressure = Column(Float, default=1013.25)  # hPa
    river_water_level = Column(Float, default=1.8)  # meters
    river_danger_level = Column(Float, default=4.5)  # meters
    soil_moisture = Column(Float, default=35.0)  # %
    sea_surface_temp = Column(Float, default=28.0)  # Celsius
    air_quality_index = Column(Float, default=65.0)  # AQI
    is_anomaly = Column(Boolean, default=False)

    location = relationship("Location", back_populates="readings")


class DisasterPrediction(Base):
    __tablename__ = "disaster_predictions"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    disaster_type = Column(String(100), nullable=False)  # "FLOOD", "LANDSLIDE", "CYCLONE", "HEATWAVE", "WILDFIRE", "EARTHQUAKE", "GENERAL"
    risk_score = Column(Float, nullable=False)  # 0.0 to 100.0
    risk_category = Column(String(50), nullable=False)  # "LOW", "MODERATE", "HIGH", "CRITICAL"
    risk_probability = Column(Float, nullable=False)  # 0.0 to 1.0 (e.g. 0.87)
    confidence_score = Column(Float, nullable=False)  # 0.0 to 1.0 (e.g. 0.94)
    contributing_factors_json = Column(JSON, default=list)  # list of strings / feature details
    recommended_action = Column(Text, nullable=False)
    disclaimer = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)

    location = relationship("Location", back_populates="predictions")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    disaster_type = Column(String(100), nullable=False)
    severity = Column(String(50), nullable=False)  # "LOW", "MODERATE", "HIGH", "CRITICAL"
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False, index=True)
    affected_radius_km = Column(Float, default=25.0)
    message = Column(Text, nullable=False)
    reason = Column(Text, nullable=False)
    recommended_actions = Column(JSON, default=list)
    issued_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_official = Column(Boolean, default=True)  # True = Issued by Authority, False = AI Early Warning
    status = Column(String(50), default="ACTIVE")  # "ACTIVE", "EXPIRED", "RESOLVED"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=True)

    location = relationship("Location", back_populates="alerts")
    issuer = relationship("User", back_populates="issued_alerts")


class CitizenReport(Base):
    __tablename__ = "citizen_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    incident_type = Column(String(100), nullable=False)  # "FLOOD", "WATERLOGGING", "LANDSLIDE", "FALLEN_TREE", "FIRE", "STRUCTURAL_DAMAGE", "OTHER"
    description = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(255), nullable=True)
    image_url = Column(String(500), nullable=True)
    ai_detected_hazard = Column(String(100), nullable=True)
    ai_confidence = Column(Float, default=0.0)
    severity = Column(String(50), default="MODERATE")  # "LOW", "MODERATE", "HIGH", "CRITICAL"
    affected_people_count = Column(Integer, default=1)
    status = Column(String(50), default="PENDING")  # "PENDING", "VERIFIED", "DISMISSED", "RESOLVED"
    verified_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    verification_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="reports", foreign_keys=[user_id])


class Shelter(Base):
    __tablename__ = "shelters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity = Column(Integer, default=500)
    current_occupancy = Column(Integer, default=0)
    contact_phone = Column(String(50), nullable=True)
    contact_person = Column(String(255), nullable=True)
    facilities_json = Column(JSON, default=list)  # ["Food", "Medical Kit", "Generator", "Bedding", "Water"]
    is_open = Column(Boolean, default=True)
    is_accessible = Column(Boolean, default=True)

    location = relationship("Location", back_populates="shelters")


class EmergencyService(Base):
    __tablename__ = "emergency_services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    service_type = Column(String(50), nullable=False)  # "HOSPITAL", "POLICE", "FIRE_STATION", "DISASTER_MGMT", "AMBULANCE"
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    phone_number = Column(String(50), nullable=False)
    emergency_hotline = Column(String(50), nullable=False)
    available_units = Column(Integer, default=10)
    is_24_7 = Column(Boolean, default=True)

    location = relationship("Location", back_populates="emergency_services")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=True)
    notification_type = Column(String(50), default="ALERT")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="notifications")


class HistoricalDisaster(Base):
    __tablename__ = "historical_disasters"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    disaster_type = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    severity = Column(String(50), nullable=False)
    peak_rainfall_mm = Column(Float, default=0.0)
    casualties = Column(Integer, default=0)
    displaced_people = Column(Integer, default=0)
    damage_estimate_usd = Column(Float, default=0.0)
    description = Column(Text, nullable=False)

    location = relationship("Location", back_populates="historical_disasters")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(255), nullable=False)
    target_type = Column(String(100), nullable=True)
    target_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="audit_logs")
