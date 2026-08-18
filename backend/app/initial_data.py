import os
import sys
from pathlib import Path

# Ensure backend root directory is in sys.path when executed directly as a script
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from datetime import datetime, timezone, timedelta
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.models import (
    User, Location, EnvironmentalReading, DisasterPrediction,
    Alert, CitizenReport, Shelter, EmergencyService,
    Notification, HistoricalDisaster, AuditLog
)
from app.ml.predictor import predictor

def init_db():
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).filter(User.email == "admin@civicpulse.org").first():
        print("Database already initialized and seeded.")
        db.close()
        return

    print("Seeding initial locations...")
    locations_data = [
        {
            "name": "Munnar",
            "state": "Kerala",
            "country": "India",
            "latitude": 10.0889,
            "longitude": 77.0595,
            "elevation": 1532.0,
            "population_density": 650.0,
            "historical_vulnerability_index": 0.85,
            "flood_prone": False,
            "landslide_prone": True,
            "cyclone_prone": False,
            "heatwave_prone": False,
            "wildfire_prone": True,
            "is_safe_zone": False
        },
        {
            "name": "Kochi",
            "state": "Kerala",
            "country": "India",
            "latitude": 9.9312,
            "longitude": 76.2673,
            "elevation": 4.0,
            "population_density": 6300.0,
            "historical_vulnerability_index": 0.78,
            "flood_prone": True,
            "landslide_prone": False,
            "cyclone_prone": True,
            "heatwave_prone": False,
            "wildfire_prone": False,
            "is_safe_zone": False
        },
        {
            "name": "Wayanad (Meppadi)",
            "state": "Kerala",
            "country": "India",
            "latitude": 11.5534,
            "longitude": 76.1264,
            "elevation": 1100.0,
            "population_density": 820.0,
            "historical_vulnerability_index": 0.92,
            "flood_prone": False,
            "landslide_prone": True,
            "cyclone_prone": False,
            "heatwave_prone": False,
            "wildfire_prone": False,
            "is_safe_zone": False
        },
        {
            "name": "Alappuzha (Kuttanad)",
            "state": "Kerala",
            "country": "India",
            "latitude": 9.4981,
            "longitude": 76.3388,
            "elevation": -1.5,
            "population_density": 4500.0,
            "historical_vulnerability_index": 0.88,
            "flood_prone": True,
            "landslide_prone": False,
            "cyclone_prone": False,
            "heatwave_prone": False,
            "wildfire_prone": False,
            "is_safe_zone": False
        },
        {
            "name": "Mumbai (Kurla / Mithi Basin)",
            "state": "Maharashtra",
            "country": "India",
            "latitude": 19.0760,
            "longitude": 72.8777,
            "elevation": 8.0,
            "population_density": 21000.0,
            "historical_vulnerability_index": 0.80,
            "flood_prone": True,
            "landslide_prone": False,
            "cyclone_prone": True,
            "heatwave_prone": False,
            "wildfire_prone": False,
            "is_safe_zone": False
        },
        {
            "name": "Pune (Shivaji Nagar)",
            "state": "Maharashtra",
            "country": "India",
            "latitude": 18.5204,
            "longitude": 73.8567,
            "elevation": 560.0,
            "population_density": 9400.0,
            "historical_vulnerability_index": 0.35,
            "flood_prone": False,
            "landslide_prone": False,
            "cyclone_prone": False,
            "heatwave_prone": False,
            "wildfire_prone": False,
            "is_safe_zone": True
        },
        {
            "name": "Chennai (Velachery / Adyar)",
            "state": "Tamil Nadu",
            "country": "India",
            "latitude": 13.0827,
            "longitude": 80.2707,
            "elevation": 6.0,
            "population_density": 17000.0,
            "historical_vulnerability_index": 0.82,
            "flood_prone": True,
            "landslide_prone": False,
            "cyclone_prone": True,
            "heatwave_prone": False,
            "wildfire_prone": False,
            "is_safe_zone": False
        },
        {
            "name": "Joshimath",
            "state": "Uttarakhand",
            "country": "India",
            "latitude": 30.5564,
            "longitude": 79.5661,
            "elevation": 1890.0,
            "population_density": 450.0,
            "historical_vulnerability_index": 0.95,
            "flood_prone": False,
            "landslide_prone": True,
            "cyclone_prone": False,
            "heatwave_prone": False,
            "wildfire_prone": False,
            "is_safe_zone": False
        },
        {
            "name": "Puri (Coastal Zone)",
            "state": "Odisha",
            "country": "India",
            "latitude": 19.8135,
            "longitude": 85.8312,
            "elevation": 3.0,
            "population_density": 3200.0,
            "historical_vulnerability_index": 0.89,
            "flood_prone": True,
            "landslide_prone": False,
            "cyclone_prone": True,
            "heatwave_prone": False,
            "wildfire_prone": False,
            "is_safe_zone": False
        },
        {
            "name": "Jaisalmer",
            "state": "Rajasthan",
            "country": "India",
            "latitude": 26.9157,
            "longitude": 70.9083,
            "elevation": 225.0,
            "population_density": 180.0,
            "historical_vulnerability_index": 0.70,
            "flood_prone": False,
            "landslide_prone": False,
            "cyclone_prone": False,
            "heatwave_prone": True,
            "wildfire_prone": False,
            "is_safe_zone": False
        },
        {
            "name": "Guwahati (Brahmaputra Valley)",
            "state": "Assam",
            "country": "India",
            "latitude": 26.1445,
            "longitude": 91.7362,
            "elevation": 55.0,
            "population_density": 4200.0,
            "historical_vulnerability_index": 0.84,
            "flood_prone": True,
            "landslide_prone": True,
            "cyclone_prone": False,
            "heatwave_prone": False,
            "wildfire_prone": False,
            "is_safe_zone": False
        },
        {
            "name": "Bengaluru (Central Highlands)",
            "state": "Karnataka",
            "country": "India",
            "latitude": 12.9716,
            "longitude": 77.5946,
            "elevation": 920.0,
            "population_density": 12000.0,
            "historical_vulnerability_index": 0.30,
            "flood_prone": False,
            "landslide_prone": False,
            "cyclone_prone": False,
            "heatwave_prone": False,
            "wildfire_prone": False,
            "is_safe_zone": True
        }
    ]

    location_objs = []
    for loc_data in locations_data:
        loc = Location(**loc_data)
        db.add(loc)
        location_objs.append(loc)
    db.commit()
    for loc in location_objs:
        db.refresh(loc)

    print("Seeding default users...")
    admin_user = User(
        email="admin@civicpulse.org",
        full_name="Dr. Rajesh Varma (Chief Disaster Officer)",
        hashed_password=get_password_hash("Admin@123"),
        role="admin",
        phone_number="+91 98450 11223",
        home_location_id=location_objs[0].id,
        address="State Disaster Operations Center, HQ",
        is_active=True
    )
    db.add(admin_user)

    citizen_user = User(
        email="citizen@civicpulse.org",
        full_name="Anoop Kumar",
        hashed_password=get_password_hash("Citizen@123"),
        role="citizen",
        phone_number="+91 94471 55667",
        home_location_id=location_objs[0].id,  # Munnar
        address="Tea County Estate Rd, Old Munnar",
        is_active=True
    )
    db.add(citizen_user)

    db.commit()
    db.refresh(admin_user)
    db.refresh(citizen_user)

    print("Seeding sensor environmental readings...")
    sensor_profiles = [
        # Munnar (High Landslide Risk)
        {"loc_idx": 0, "r1": 18.5, "r6": 72.0, "r24": 185.0, "temp": 17.5, "hum": 96.0, "wind": 32.0, "press": 998.0, "riv": 4.1, "riv_d": 4.5, "soil": 88.0},
        # Kochi (Moderate Flood Risk)
        {"loc_idx": 1, "r1": 8.0, "r6": 32.0, "r24": 85.0, "temp": 29.0, "hum": 89.0, "wind": 24.0, "press": 1004.0, "riv": 2.8, "riv_d": 4.0, "soil": 72.0},
        # Wayanad (Critical Landslide Hazard)
        {"loc_idx": 2, "r1": 24.0, "r6": 95.0, "r24": 240.0, "temp": 19.0, "hum": 98.0, "wind": 28.0, "press": 994.0, "riv": 5.2, "riv_d": 4.8, "soil": 94.0},
        # Alappuzha (High Flood Risk)
        {"loc_idx": 3, "r1": 12.0, "r6": 48.0, "r24": 130.0, "temp": 28.5, "hum": 92.0, "wind": 18.0, "press": 1006.0, "riv": 3.9, "riv_d": 3.5, "soil": 90.0},
        # Mumbai (Moderate Waterlogging)
        {"loc_idx": 4, "r1": 14.0, "r6": 42.0, "r24": 95.0, "temp": 30.0, "hum": 84.0, "wind": 22.0, "press": 1007.0, "riv": 3.1, "riv_d": 3.8, "soil": 76.0},
        # Pune (Safe Zone)
        {"loc_idx": 5, "r1": 0.0, "r6": 0.0, "r24": 2.0, "temp": 26.0, "hum": 55.0, "wind": 10.0, "press": 1014.0, "riv": 1.2, "riv_d": 5.0, "soil": 35.0},
        # Chennai (Moderate Coastal)
        {"loc_idx": 6, "r1": 2.0, "r6": 10.0, "r24": 25.0, "temp": 33.0, "hum": 78.0, "wind": 25.0, "press": 1010.0, "riv": 1.5, "riv_d": 4.2, "soil": 45.0},
        # Joshimath (High Geological Warning)
        {"loc_idx": 7, "r1": 6.0, "r6": 28.0, "r24": 70.0, "temp": 12.0, "hum": 80.0, "wind": 18.0, "press": 1002.0, "riv": 2.4, "riv_d": 4.0, "soil": 82.0},
        # Puri (High Cyclone Warning)
        {"loc_idx": 8, "r1": 16.0, "r6": 65.0, "r24": 140.0, "temp": 27.0, "hum": 95.0, "wind": 88.0, "press": 982.0, "riv": 3.6, "riv_d": 4.5, "soil": 80.0},
        # Jaisalmer (Severe Heatwave)
        {"loc_idx": 9, "r1": 0.0, "r6": 0.0, "r24": 0.0, "temp": 46.5, "hum": 22.0, "wind": 30.0, "press": 1008.0, "riv": 0.2, "riv_d": 3.0, "soil": 12.0},
        # Guwahati (Flood Watch)
        {"loc_idx": 10, "r1": 10.0, "r6": 40.0, "r24": 115.0, "temp": 29.0, "hum": 88.0, "wind": 15.0, "press": 1009.0, "riv": 4.4, "riv_d": 4.5, "soil": 86.0},
        # Bengaluru (Safe Zone)
        {"loc_idx": 11, "r1": 0.0, "r6": 0.0, "r24": 1.0, "temp": 25.0, "hum": 52.0, "wind": 12.0, "press": 1015.0, "riv": 1.0, "riv_d": 4.0, "soil": 32.0}
    ]

    for p in sensor_profiles:
        loc = location_objs[p["loc_idx"]]
        reading = EnvironmentalReading(
            location_id=loc.id,
            timestamp=datetime.now(timezone.utc),
            rainfall_1h=p["r1"],
            rainfall_6h=p["r6"],
            rainfall_24h=p["r24"],
            temperature=p["temp"],
            humidity=p["hum"],
            wind_speed=p["wind"],
            wind_gust=p["wind"] * 1.4,
            atmospheric_pressure=p["press"],
            river_water_level=p["riv"],
            river_danger_level=p["riv_d"],
            soil_moisture=p["soil"],
            sea_surface_temp=29.0,
            air_quality_index=55.0,
            is_anomaly=False
        )
        db.add(reading)

        # Generate ML Prediction for initial seed
        pred_res = predictor.predict(type("Req", (), {
            "rainfall_1h": p["r1"],
            "rainfall_6h": p["r6"],
            "rainfall_24h": p["r24"],
            "elevation": loc.elevation,
            "river_water_level": p["riv"],
            "river_danger_level": p["riv_d"],
            "soil_moisture": p["soil"],
            "temperature": p["temp"],
            "humidity": p["hum"],
            "wind_speed": p["wind"],
            "atmospheric_pressure": p["press"],
            "historical_vulnerability": loc.historical_vulnerability_index,
            "population_density": loc.population_density,
            "location_name": loc.name
        })())

        pred = DisasterPrediction(
            location_id=loc.id,
            timestamp=datetime.now(timezone.utc),
            disaster_type=pred_res.disaster_type,
            risk_score=pred_res.risk_score,
            risk_category=pred_res.risk_category,
            risk_probability=pred_res.risk_probability,
            confidence_score=pred_res.confidence_score,
            contributing_factors_json=pred_res.contributing_factors,
            recommended_action=pred_res.recommended_action,
            disclaimer=pred_res.disclaimer,
            is_active=True
        )
        db.add(pred)

    db.commit()

    print("Seeding shelters and emergency services...")
    shelters_data = [
        {
            "name": "Munnar Government Higher Secondary Relief Center",
            "loc_idx": 0,
            "address": "GHSS Campus, Mattupetty Road, Munnar",
            "latitude": 10.0895,
            "longitude": 77.0620,
            "capacity": 650,
            "current_occupancy": 85,
            "contact_phone": "+91 4865 230455",
            "contact_person": "V. S. Manoj (Camp Officer)",
            "facilities_json": ["Emergency Medical Kit", "Purified Water", "Diesel Generator", "Community Kitchen", "Baby Care"],
            "is_open": True,
            "is_accessible": True
        },
        {
            "name": "St. Joseph Community Center Shelter",
            "loc_idx": 0,
            "address": "Church Hill Road, Munnar High Ranges",
            "latitude": 10.0920,
            "longitude": 77.0560,
            "capacity": 400,
            "current_occupancy": 30,
            "contact_phone": "+91 4865 231120",
            "contact_person": "Fr. Thomas Mathew",
            "facilities_json": ["First Aid Station", "Clean Water", "Bunk Beds", "Food Supply"],
            "is_open": True,
            "is_accessible": True
        },
        {
            "name": "Meppadi Public School Relief Camp",
            "loc_idx": 2,
            "address": "Meppadi Main Road, Wayanad",
            "latitude": 11.5540,
            "longitude": 76.1280,
            "capacity": 1200,
            "current_occupancy": 320,
            "contact_phone": "+91 4936 280200",
            "contact_person": "K. R. Divya (Tahsildar)",
            "facilities_json": ["Full Trauma Medical Center", "Power Backup", "Emergency Rations", "Satellite Phone", "Helipad Access"],
            "is_open": True,
            "is_accessible": True
        },
        {
            "name": "Ernakulam Town Hall Relief Shelter",
            "loc_idx": 1,
            "address": "Banerji Road, High Court Junction, Kochi",
            "latitude": 9.9880,
            "longitude": 76.2790,
            "capacity": 1500,
            "current_occupancy": 110,
            "contact_phone": "+91 484 2351234",
            "contact_person": "S. Pradeep (Disaster Management Cell)",
            "facilities_json": ["Clean Water", "Food Supply", "Medical Staff On-Duty", "Wheelchair Ramps"],
            "is_open": True,
            "is_accessible": True
        },
        {
            "name": "Puri Cyclone Shelter #14",
            "loc_idx": 8,
            "address": "Gopal Ballabh Road, Puri Beach Front",
            "latitude": 19.8050,
            "longitude": 85.8260,
            "capacity": 2000,
            "current_occupancy": 450,
            "contact_phone": "+91 6752 223400",
            "contact_person": "A. K. Mohapatra (ODRAF Incharge)",
            "facilities_json": ["Reinforced RCC Bunker", "Desalination Unit", "Solar Power Grid", "Radio Comms"],
            "is_open": True,
            "is_accessible": True
        }
    ]

    for sh in shelters_data:
        loc = location_objs[sh.pop("loc_idx")]
        shelter = Shelter(location_id=loc.id, **sh)
        db.add(shelter)

    emergency_services_data = [
        {
            "name": "Tata General Hospital & Trauma Center",
            "service_type": "HOSPITAL",
            "loc_idx": 0,
            "address": "Munnar Tea Estate Sector 4",
            "latitude": 10.0860,
            "longitude": 77.0630,
            "phone_number": "+91 4865 230222",
            "emergency_hotline": "108 / +91 4865 230911",
            "available_units": 8,
            "is_24_7": True
        },
        {
            "name": "Munnar Fire & Rescue Station",
            "service_type": "FIRE_STATION",
            "loc_idx": 0,
            "address": "Near KSRTC Depot, Munnar",
            "latitude": 10.0780,
            "longitude": 77.0600,
            "phone_number": "+91 4865 230101",
            "emergency_hotline": "101",
            "available_units": 4,
            "is_24_7": True
        },
        {
            "name": "Kerala State Police Command Post",
            "service_type": "POLICE",
            "loc_idx": 0,
            "address": "Devikulam Road, Munnar",
            "latitude": 10.0840,
            "longitude": 77.0650,
            "phone_number": "+91 4865 230321",
            "emergency_hotline": "112",
            "available_units": 12,
            "is_24_7": True
        },
        {
            "name": "National Disaster Response Force (NDRF) Regional Hub",
            "service_type": "DISASTER_MGMT",
            "loc_idx": 1,
            "address": "Wellington Island Port Road, Kochi",
            "latitude": 9.9450,
            "longitude": 76.2750,
            "phone_number": "+91 484 2668900",
            "emergency_hotline": "1077",
            "available_units": 25,
            "is_24_7": True
        },
        {
            "name": "Aster Medcity Emergency & Critical Care",
            "service_type": "HOSPITAL",
            "loc_idx": 1,
            "address": "Cheranalloor, Kochi",
            "latitude": 10.0430,
            "longitude": 76.2890,
            "phone_number": "+91 484 6699999",
            "emergency_hotline": "108 / 102",
            "available_units": 15,
            "is_24_7": True
        }
    ]

    for es in emergency_services_data:
        loc = location_objs[es.pop("loc_idx")]
        service = EmergencyService(location_id=loc.id, **es)
        db.add(service)

    print("Seeding alerts...")
    active_alert = Alert(
        title="RED ALERT: Severe Landslide & Debris Flow Threat",
        disaster_type="LANDSLIDE",
        severity="CRITICAL",
        location_id=location_objs[2].id,  # Wayanad
        affected_radius_km=30.0,
        message="Torrential rainfall exceeding 240mm has supersaturated mountain slopes. Severe risk of debris collapse along estate hilltops.",
        reason="Heavy rainfall detected for the last 24 hours (240mm), soil moisture is at 94%, and historical landslide vulnerability is extreme.",
        recommended_actions=[
            "Immediate mandatory evacuation for residents in slopes > 30 degrees",
            "Move to Meppadi Public School Relief Camp",
            "Avoid travelling via Ghat road passes",
            "Keep emergency battery lights and documents ready"
        ],
        issued_by_user_id=admin_user.id,
        is_official=True,
        status="ACTIVE",
        expires_at=datetime.now(timezone.utc) + timedelta(hours=48)
    )
    db.add(active_alert)

    high_alert = Alert(
        title="ORANGE ALERT: High Landslide Watch & Soil Saturation",
        disaster_type="LANDSLIDE",
        severity="HIGH",
        location_id=location_objs[0].id,  # Munnar
        affected_radius_km=25.0,
        message="Continuous intense rainfall (185mm) has raised slope saturation to critical limits. Localized rockslides reported near Mattupetty.",
        reason="High 24h rainfall (185mm), soil moisture reached 88%, steep terrain gradient (1532m elevation).",
        recommended_actions=[
            "Avoid night travel on Munnar-Devikulam ghat roads",
            "Report waterlogging or ground cracks immediately on CivicPulse",
            "Keep mobile phones charged and monitor live advisories"
        ],
        issued_by_user_id=admin_user.id,
        is_official=True,
        status="ACTIVE",
        expires_at=datetime.now(timezone.utc) + timedelta(hours=24)
    )
    db.add(high_alert)

    print("Seeding citizen incident reports...")
    reports_data = [
        {
            "user_id": citizen_user.id,
            "incident_type": "LANDSLIDE",
            "description": "Small rockslide and mud collapse on Old Munnar tea estate road. Road partially blocked, single lane passable.",
            "latitude": 10.0870,
            "longitude": 77.0610,
            "location_name": "Old Munnar Tea Road",
            "image_url": "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80",
            "ai_detected_hazard": "LANDSLIDE",
            "ai_confidence": 0.94,
            "severity": "HIGH",
            "affected_people_count": 45,
            "status": "VERIFIED",
            "verified_by_user_id": admin_user.id,
            "verification_notes": "PWD excavator dispatched to clear debris. Traffic diverted."
        },
        {
            "user_id": citizen_user.id,
            "incident_type": "WATERLOGGING",
            "description": "Severe urban waterlogging under Kaloor railway overbridge. Water depth approximately 2.5 feet, vehicles stranded.",
            "latitude": 9.9890,
            "longitude": 76.2840,
            "location_name": "Kaloor Overbridge, Kochi",
            "image_url": "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80",
            "ai_detected_hazard": "FLOOD",
            "ai_confidence": 0.91,
            "severity": "MODERATE",
            "affected_people_count": 150,
            "status": "PENDING",
            "verified_by_user_id": None,
            "verification_notes": None
        }
    ]

    for rep in reports_data:
        db.add(CitizenReport(**rep))

    print("Seeding historical disaster records...")
    historical_data = [
        {
            "loc_idx": 0,
            "disaster_type": "LANDSLIDE",
            "year": 2020,
            "month": 8,
            "severity": "CRITICAL",
            "peak_rainfall_mm": 310.0,
            "casualties": 66,
            "displaced_people": 2500,
            "damage_estimate_usd": 15000000.0,
            "description": "Pettimudi Landslide: Massive debris avalanche triggered by 4 days of extreme precipitation over tea plantations."
        },
        {
            "loc_idx": 1,
            "disaster_type": "FLOOD",
            "year": 2018,
            "month": 8,
            "severity": "CRITICAL",
            "peak_rainfall_mm": 450.0,
            "casualties": 483,
            "displaced_people": 1450000,
            "damage_estimate_usd": 3000000000.0,
            "description": "Great Kerala Floods: 35 dams opened simultaneously following historic monsoon deluge, inundating Kochi airport and lowlands."
        },
        {
            "loc_idx": 8,
            "disaster_type": "CYCLONE",
            "year": 2019,
            "month": 5,
            "severity": "CRITICAL",
            "peak_rainfall_mm": 280.0,
            "casualties": 89,
            "displaced_people": 1200000,
            "damage_estimate_usd": 8100000000.0,
            "description": "Extremely Severe Cyclonic Storm Fani: Landfall in Puri with wind gusts exceeding 215 km/h, devastating infrastructure."
        },
        {
            "loc_idx": 4,
            "disaster_type": "FLOOD",
            "year": 2005,
            "month": 7,
            "severity": "CRITICAL",
            "peak_rainfall_mm": 944.0,
            "casualties": 1094,
            "displaced_people": 2000000,
            "damage_estimate_usd": 450000000.0,
            "description": "Maharashtra 2005 Cloudburst: 944mm rainfall recorded within 24 hours, submerging Mumbai city and transport hubs."
        }
    ]

    for hist in historical_data:
        loc = location_objs[hist.pop("loc_idx")]
        db.add(HistoricalDisaster(location_id=loc.id, **hist))

    # Audit Log
    db.add(AuditLog(
        user_id=admin_user.id,
        action="SYSTEM_INIT",
        target_type="DATABASE",
        target_id=1,
        details="CivicPulse database successfully seeded with multi-hazard locations, ML parameters, and initial shelter networks."
    ))

    db.commit()
    db.close()
    print("Database initialization and realistic data seeding complete!")

if __name__ == "__main__":
    init_db()
