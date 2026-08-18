import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from datetime import datetime, timezone
from app.core.config import settings
from app.schemas.schemas import PredictionRequest, PredictionResponse, ContributingFactor

class MLPredictor:
    def __init__(self):
        self.classifier = None
        self.regressor = None
        self.anomaly_detector = None
        self.metrics = {}
        self.load_models()

    def load_models(self):
        clf_path = os.path.join(settings.MODEL_DIR, "risk_classifier.joblib")
        reg_path = os.path.join(settings.MODEL_DIR, "risk_regressor.joblib")
        ano_path = os.path.join(settings.MODEL_DIR, "anomaly_detector.joblib")
        met_path = os.path.join(settings.MODEL_DIR, "model_metrics.json")

        if os.path.exists(clf_path) and os.path.exists(reg_path):
            try:
                self.classifier = joblib.load(clf_path)
                self.regressor = joblib.load(reg_path)
                if os.path.exists(ano_path):
                    self.anomaly_detector = joblib.load(ano_path)
                if os.path.exists(met_path):
                    with open(met_path, "r") as f:
                        self.metrics = json.load(f)
                print("ML Models successfully loaded.")
            except Exception as e:
                print(f"Error loading models: {e}")

    def predict(self, req: PredictionRequest) -> PredictionResponse:
        feature_dict = {
            "rainfall_1h": req.rainfall_1h,
            "rainfall_6h": req.rainfall_6h,
            "rainfall_24h": req.rainfall_24h,
            "elevation": req.elevation,
            "river_water_level": req.river_water_level,
            "river_danger_level": req.river_danger_level,
            "soil_moisture": req.soil_moisture,
            "temperature": req.temperature,
            "humidity": req.humidity,
            "wind_speed": req.wind_speed,
            "wind_gust": req.wind_speed * 1.35,
            "atmospheric_pressure": req.atmospheric_pressure,
            "historical_vulnerability": req.historical_vulnerability,
            "population_density": req.population_density
        }

        df_input = pd.DataFrame([feature_dict])

        # Anomaly Check
        is_anomaly = False
        if self.anomaly_detector is not None:
            try:
                pred_anomaly = self.anomaly_detector.predict(df_input)[0]
                is_anomaly = bool(pred_anomaly == -1)
            except Exception:
                is_anomaly = False

        # Multi-Hazard Specific Indices (Deterministic signals for explainability)
        signals = {
            "FLOOD": (
                (req.rainfall_24h / 150.0) * 40.0 +
                (req.river_water_level / max(0.1, req.river_danger_level)) * 35.0 +
                (req.soil_moisture / 100.0) * 15.0 +
                (1.0 - min(1.0, max(0.0, req.elevation / 500.0))) * 10.0
            ),
            "LANDSLIDE": (
                (req.rainfall_24h / 180.0) * 35.0 +
                (req.soil_moisture / 100.0) * 35.0 +
                (min(1.0, max(0.0, req.elevation / 1000.0))) * 25.0 +
                req.historical_vulnerability * 10.0
            ),
            "CYCLONE": (
                (req.wind_speed / 120.0) * 45.0 +
                (max(0.0, min(1.0, (1013.25 - req.atmospheric_pressure) / 40.0))) * 40.0 +
                (req.humidity / 100.0) * 15.0
            ),
            "HEATWAVE": (
                (max(0.0, min(1.0, (req.temperature - 35.0) / 12.0))) * 60.0 +
                (req.humidity / 100.0) * 25.0 +
                (1.0 - min(1.0, req.rainfall_24h / 40.0)) * 15.0
            ),
            "WILDFIRE": (
                (max(0.0, min(1.0, (req.temperature - 32.0) / 15.0))) * 35.0 +
                (max(0.0, min(1.0, (50.0 - req.humidity) / 40.0))) * 35.0 +
                (req.wind_speed / 60.0) * 20.0 +
                (1.0 - min(1.0, req.soil_moisture / 60.0)) * 10.0
            )
        }

        top_disaster = max(signals, key=signals.get)
        calculated_score = float(np.clip(signals[top_disaster], 0.0, 100.0))

        # Model Inference
        if self.regressor is not None:
            try:
                ml_score = float(np.clip(self.regressor.predict(df_input)[0], 0.0, 100.0))
                risk_score = round(0.7 * ml_score + 0.3 * calculated_score, 1)
            except Exception:
                risk_score = round(calculated_score, 1)
        else:
            risk_score = round(calculated_score, 1)

        # Categorize
        if risk_score <= 25.0:
            risk_category = "LOW"
            disaster_type = "NORMAL_CONDITIONS" if risk_score < 15.0 else top_disaster
            risk_prob = round(risk_score / 100.0, 2)
            confidence = 0.96
        elif risk_score <= 50.0:
            risk_category = "MODERATE"
            disaster_type = top_disaster
            risk_prob = round(risk_score / 100.0, 2)
            confidence = 0.92
        elif risk_score <= 75.0:
            risk_category = "HIGH"
            disaster_type = top_disaster
            risk_prob = round(risk_score / 100.0, 2)
            confidence = 0.94
        else:
            risk_category = "CRITICAL"
            disaster_type = top_disaster
            risk_prob = round(min(0.99, risk_score / 100.0), 2)
            confidence = 0.97

        # Explainability: Feature breakdown and contributing factors
        factors: List[str] = []
        breakdown: List[ContributingFactor] = []

        if req.rainfall_24h > 50.0:
            desc = f"Heavy 24h rainfall of {req.rainfall_24h:.1f}mm detected"
            factors.append(desc)
            breakdown.append(ContributingFactor(feature="rainfall_24h", impact="NEGATIVE", description=desc, weight=0.35))
        elif req.rainfall_6h > 25.0:
            desc = f"Elevated 6h rainfall of {req.rainfall_6h:.1f}mm recorded"
            factors.append(desc)
            breakdown.append(ContributingFactor(feature="rainfall_6h", impact="NEGATIVE", description=desc, weight=0.20))

        if req.river_water_level >= req.river_danger_level * 0.85:
            diff = req.river_water_level - req.river_danger_level
            if diff >= 0:
                desc = f"River level ({req.river_water_level:.1f}m) has breached safety threshold ({req.river_danger_level:.1f}m) by +{diff:.1f}m"
            else:
                desc = f"River level ({req.river_water_level:.1f}m) is nearing warning threshold ({req.river_danger_level:.1f}m)"
            factors.append(desc)
            breakdown.append(ContributingFactor(feature="river_water_level", impact="NEGATIVE", description=desc, weight=0.30))

        if req.soil_moisture > 75.0:
            desc = f"Soil moisture saturation is high ({req.soil_moisture:.1f}%), elevating surface runoff and slide susceptibility"
            factors.append(desc)
            breakdown.append(ContributingFactor(feature="soil_moisture", impact="NEGATIVE", description=desc, weight=0.20))

        if req.wind_speed > 45.0:
            desc = f"High gale wind speeds ({req.wind_speed:.1f} km/h) with pressure drop ({req.atmospheric_pressure:.1f} hPa)"
            factors.append(desc)
            breakdown.append(ContributingFactor(feature="wind_speed", impact="NEGATIVE", description=desc, weight=0.25))

        if req.temperature > 40.0:
            desc = f"Extreme ambient temperature ({req.temperature:.1f}°C) exceeding safety norms"
            factors.append(desc)
            breakdown.append(ContributingFactor(feature="temperature", impact="NEGATIVE", description=desc, weight=0.30))

        if req.elevation < 30.0 and top_disaster == "FLOOD":
            desc = f"Low elevation coastal/basin zone ({req.elevation:.1f}m ASL) prone to rapid inundation"
            factors.append(desc)
            breakdown.append(ContributingFactor(feature="elevation", impact="NEGATIVE", description=desc, weight=0.15))
        elif req.elevation > 800.0 and top_disaster == "LANDSLIDE":
            desc = f"High steep terrain elevation ({req.elevation:.1f}m ASL) susceptible to slope instability"
            factors.append(desc)
            breakdown.append(ContributingFactor(feature="elevation", impact="NEGATIVE", description=desc, weight=0.15))

        if not factors:
            factors.append("Environmental metrics are currently within nominal seasonal baselines.")
            breakdown.append(ContributingFactor(feature="nominal_status", impact="POSITIVE", description="All sensors within safe thresholds", weight=1.0))

        # Recommended safety actions
        rec_action, checklist = self.generate_safety_protocols(disaster_type, risk_category, req.location_name or "Local Area")

        return PredictionResponse(
            disaster_type=disaster_type,
            risk_score=risk_score,
            risk_category=risk_category,
            risk_probability=risk_prob,
            confidence_score=confidence,
            location_name=req.location_name or "Detected Location",
            contributing_factors=factors,
            factor_breakdown=breakdown,
            recommended_action=rec_action,
            safety_checklist=checklist,
            disclaimer=settings.AI_DISCLAIMER,
            timestamp=datetime.now(timezone.utc),
            is_anomaly_detected=is_anomaly
        )

    def generate_safety_protocols(self, disaster_type: str, category: str, location: str) -> (str, List[str]):
        if category == "LOW":
            action = f"Conditions in {location} are currently stable. Continue standard routine and monitor periodic updates."
            checklist = [
                "Keep a basic home emergency first-aid kit stocked",
                "Ensure emergency contacts are saved in your phone",
                "Review family emergency communication plan"
            ]
        elif category == "MODERATE":
            action = f"Moderate environmental risks detected for {location}. Exercise caution in low-lying or exposed zones."
            checklist = [
                "Charge mobile phones, power banks, and portable lights",
                "Store essential drinking water and non-perishable food",
                "Avoid parking vehicles under large trees or weak structures",
                "Stay tuned to local weather advisories on CivicPulse"
            ]
        elif category == "HIGH":
            action = f"HIGH ALERT: Significant {disaster_type.lower()} hazard identified in {location}. Prepare for potential relocation if advised."
            checklist = [
                "Move critical valuables, medicines, and documents to upper floors",
                "Locate your nearest CivicPulse certified relief shelter",
                "Avoid non-essential outdoor travel and stay clear of water channels",
                "Keep emergency go-bag ready with 72-hour provisions",
                "Follow official disaster management directives immediately"
            ]
        else:  # CRITICAL
            action = f"CRITICAL EMERGENCY: Severe {disaster_type.lower()} hazard imminent in {location}. Take immediate protective action."
            checklist = [
                "Evacuate vulnerable or low-lying zones immediately to nearest shelter",
                "Disconnect electrical mains and gas valves before leaving",
                "Do NOT attempt to cross flowing water or flooded roads by vehicle or foot",
                "Call 112 / CivicPulse Emergency Hotlines for rescue coordination",
                "Assist elderly, children, and persons with disabilities"
            ]
        return action, checklist

predictor = MLPredictor()
