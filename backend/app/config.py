import os
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Based Delivery Planning System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-delivery-jwt-key-2026-production-ready")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./delivery_system.db")
    
    # OSRM public routing endpoint (handles road distance & durations)
    OSRM_BASE_URL: str = os.getenv("OSRM_BASE_URL", "https://router.project-osrm.org")
    
    # CORS allowed origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Default Central Depot / Warehouse
    DEFAULT_WAREHOUSE_NAME: str = "Central Distribution Hub"
    DEFAULT_WAREHOUSE_ADDRESS: str = "100 Market St, San Francisco, CA"
    DEFAULT_WAREHOUSE_LAT: float = 37.7937
    DEFAULT_WAREHOUSE_LON: float = -122.3965

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
