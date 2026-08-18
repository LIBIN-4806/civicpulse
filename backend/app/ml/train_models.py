import os
import sys
from pathlib import Path

# Ensure backend root directory is in sys.path when executed directly as a script
backend_dir = Path(__file__).resolve().parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor, IsolationForest
from sklearn.metrics import classification_report, confusion_matrix, r2_score, mean_squared_error, accuracy_score
from app.core.config import settings
from app.ml.dataset_generator import generate_multi_hazard_dataset

FEATURE_COLUMNS = [
    "rainfall_1h",
    "rainfall_6h",
    "rainfall_24h",
    "elevation",
    "river_water_level",
    "river_danger_level",
    "soil_moisture",
    "temperature",
    "humidity",
    "wind_speed",
    "wind_gust",
    "atmospheric_pressure",
    "historical_vulnerability",
    "population_density"
]

def train_and_save_models():
    print("Generating training dataset...")
    df = generate_multi_hazard_dataset(n_samples=8000, random_state=42)
    
    X = df[FEATURE_COLUMNS]
    y_cat = df["risk_category"]
    y_score = df["risk_score"]
    
    X_train, X_test, y_cat_train, y_cat_test, y_score_train, y_score_test = train_test_split(
        X, y_cat, y_score, test_size=0.2, random_state=42, stratify=y_cat
    )
    
    # 1. Multi-Class Risk Category Classifier (Random Forest)
    print("Training Risk Classifier (Random Forest)...")
    clf = RandomForestClassifier(n_estimators=120, max_depth=12, random_state=42, n_jobs=-1)
    clf.fit(X_train, y_cat_train)
    
    y_cat_pred = clf.predict(X_test)
    accuracy = float(accuracy_score(y_cat_test, y_cat_pred))
    report = classification_report(y_cat_test, y_cat_pred, output_dict=True)
    labels = sorted(list(set(y_cat)))
    cm = confusion_matrix(y_cat_test, y_cat_pred, labels=labels).tolist()
    
    feature_importances = {
        feat: round(float(imp), 4)
        for feat, imp in zip(FEATURE_COLUMNS, clf.feature_importances_)
    }
    # Sort feature importances descending
    sorted_features = sorted(feature_importances.items(), key=lambda x: x[1], reverse=True)
    
    # 2. Risk Score Regressor (Gradient Boosting)
    print("Training Risk Score Regressor...")
    reg = GradientBoostingRegressor(n_estimators=100, max_depth=6, learning_rate=0.08, random_state=42)
    reg.fit(X_train, y_score_train)
    
    y_score_pred = reg.predict(X_test)
    r2 = float(r2_score(y_score_test, y_score_pred))
    rmse = float(np.sqrt(mean_squared_error(y_score_test, y_score_pred)))
    
    # 3. Anomaly Detection (Isolation Forest)
    print("Training Anomaly Detector (Isolation Forest)...")
    anomaly_detector = IsolationForest(n_estimators=100, contamination=0.03, random_state=42)
    anomaly_detector.fit(X)
    
    # Save artifacts
    os.makedirs(settings.MODEL_DIR, exist_ok=True)
    joblib.dump(clf, os.path.join(settings.MODEL_DIR, "risk_classifier.joblib"))
    joblib.dump(reg, os.path.join(settings.MODEL_DIR, "risk_regressor.joblib"))
    joblib.dump(anomaly_detector, os.path.join(settings.MODEL_DIR, "anomaly_detector.joblib"))
    
    # Save Evaluation Metrics & Model Metadata
    metrics = {
        "model_name": "CivicPulse Multi-Hazard Ensemble v2.0",
        "algorithm_classifier": "Random Forest Classifier (120 Estimators)",
        "algorithm_regressor": "Gradient Boosting Regressor",
        "algorithm_anomaly": "Isolation Forest (3% Contamination)",
        "classifier_accuracy": round(accuracy, 4),
        "regressor_r2": round(r2, 4),
        "regressor_rmse": round(rmse, 2),
        "total_samples": len(df),
        "feature_names": FEATURE_COLUMNS,
        "feature_importances": dict(sorted_features),
        "confusion_matrix": {
            "labels": labels,
            "matrix": cm
        },
        "classification_report": report,
        "hazard_breakdown": df["disaster_type"].value_counts().to_dict(),
        "category_breakdown": df["risk_category"].value_counts().to_dict()
    }
    
    metrics_path = os.path.join(settings.MODEL_DIR, "model_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
        
    print(f"\nModels successfully saved to {settings.MODEL_DIR}")
    print(f"Classifier Accuracy: {accuracy * 100:.2f}% | Regressor R2: {r2:.4f}")
    return metrics

if __name__ == "__main__":
    train_and_save_models()
