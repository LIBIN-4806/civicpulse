import os
from pydantic_settings import BaseSettings
from typing import List

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEFAULT_DB_PATH = os.path.join(BASE_DIR, "civicpulse.db").replace("\\", "/")

class Settings(BaseSettings):
    PROJECT_NAME: str = "CivicPulse"
    PROJECT_SLOGAN: str = "Predict Early. Act Early. Protect Communities."
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "civicpulse-super-secret-production-key-2026-secure"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    DATABASE_URL: str = f"sqlite:///{DEFAULT_DB_PATH}"
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    MODEL_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml", "saved_models")
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static", "uploads")
    
    AI_DISCLAIMER: str = (
        "CivicPulse provides AI-assisted risk assessment and early-warning support. "
        "Predictions are probabilistic risk assessments, not guaranteed disaster predictions. "
        "Always follow official emergency instructions from authorized authorities."
    )

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
os.makedirs(settings.MODEL_DIR, exist_ok=True)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
