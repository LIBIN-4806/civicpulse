import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import Base, engine
from app.api.v1 import auth, risk, alerts, reports, shelters, analytics, admin
from app.ml.train_models import train_and_save_models
from app.initial_data import init_db

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "CivicPulse: Early Calamity Detection & Public Safety Early-Warning Platform.\n\n"
        f"⚠️ Safety Disclaimer: {settings.AI_DISCLAIMER}"
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(risk.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(shelters.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def on_startup():
    # 1. Initialize DB tables and seed data
    Base.metadata.create_all(bind=engine)
    init_db()

    # 2. Check and train ML models if missing
    clf_path = os.path.join(settings.MODEL_DIR, "risk_classifier.joblib")
    if not os.path.exists(clf_path):
        print("Model artifacts not found. Training ML pipeline on startup...")
        train_and_save_models()

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "slogan": settings.PROJECT_SLOGAN,
        "status": "OPERATIONAL",
        "version": "2.0.0",
        "api_docs": "/docs",
        "disclaimer": settings.AI_DISCLAIMER
    }
