# CivicPulse — System Architecture Document

```mermaid
graph TD
    subgraph ClientLayer["Frontend Client Layer (React + Vite + Leaflet)"]
        A1[Citizen Web Portal]
        A2[Authority Command Center]
        A3[Interactive Multi-Layer Risk Map]
        A4[Crowdsourced Incident Reporter]
        A5[ML Analytics & Simulator Hub]
    end

    subgraph APIGateway["Backend API & Security Layer (FastAPI)"]
        B1[JWT Authentication & RBAC]
        B2[Risk & Prediction Endpoints]
        B3[Alert Broadcasting Engine]
        B4[Citizen Report & Media Ingestion]
        B5[Shelter & Medical Services Directory]
        B6[Audit Logger & CSV Exporter]
    end

    subgraph MLEngine["AI/ML Early Detection & Explainability Pipeline"]
        C1[Meteorological & Sensor Feature Extractor]
        C2[Random Forest Multi-Hazard Classifier]
        C3[Gradient Boosting Risk Score Regressor]
        C4[Isolation Forest Sensor Anomaly Detector]
        C5[Explainable SHAP / Factor Decomposition]
        C6[Dynamic Safety Action Checklist Generator]
        C7[Computer Vision Incident Photo Classifier]
    end

    subgraph DataStorage["Data Persistence Layer"]
        D1[(PostgreSQL / SQLite Database)]
        D2[Serialized Model Artifacts .joblib]
        D3[Geotagged Incident Photo Storage]
    end

    subgraph ExternalSources["IoT Telemetry & Emergency Broadcasts"]
        E1[Weather & Precipitation Stations]
        E2[River Level & Hydrological Gauges]
        E3[Slope Soil Saturation Sensors]
        E4[SMS / Push / Emergency Siren Dispatcher]
    end

    A1 & A2 & A3 & A4 & A5 -->|HTTPS / REST API + JWT| APIGateway
    B2 & B3 & B4 -->|Feature Inference| MLEngine
    APIGateway -->|SQLAlchemy ORM| D1
    MLEngine -->|Load Weights & Thresholds| D2
    B4 -->|Persist Uploaded Proof| D3
    E1 & E2 & E3 -->|Simulated Telemetry Feeds| B2
    B3 -->|Multi-Channel Broadcast| E4
```

---

## Architecture Components

### 1. Presentation Layer (Frontend)
- **Framework**: React 18 + Vite with Tailwind CSS glassmorphic public safety design system.
- **Mapping & Geofencing**: Leaflet.js with dynamic SVG hazard circles, safe zones, shelters, and trauma centers.
- **Explainability Visuals**: Real-time gauge meters, feature weight breakdown bars, confusion matrices, and interactive scenario simulator.

### 2. Application & API Layer (Backend)
- **Framework**: FastAPI (Asynchronous Python 3.14).
- **Security**: PBKDF2 password hashing, JSON Web Tokens (JWT), Role-Based Access Control (`citizen`, `admin`).
- **REST Endpoints**: Modular routing for Auth, Risk Assessment, Alerts, Citizen Reports, Shelters, and Telemetry.

### 3. Artificial Intelligence & Machine Learning Pipeline
- **Classifier**: Random Forest Ensemble (120 trees) categorizing conditions into `LOW`, `MODERATE`, `HIGH`, `CRITICAL`.
- **Regressor**: Gradient Boosting Regressor computing a transparent continuous score (0–100).
- **Anomaly Detection**: `IsolationForest` detecting faulty, tampered, or sudden extreme sensor readings.
- **Explainable AI**: Deconstructs every prediction into clear human-readable factors (e.g. *“Heavy 24h rainfall of 185mm detected, river level at 4.1m nearing warning threshold”*).
- **Image Hazard Classifier**: Heuristic & computer vision analyzer categorizing crowdsourced photos into Floods, Landslides, Fires, or Fallen Trees.

### 4. Data Layer
- **Relational Storage**: Relational tables for Users, Locations, Sensor Streams, Predictions, Alerts, Reports, Shelters, Emergency Services, and Audit Logs.
- **Static Assets**: Secure directory for citizen upload proofs and serialized `.joblib` model artifacts.
