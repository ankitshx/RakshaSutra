import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "RakshaSutra"
    TAGLINE: str = "Check Before You Click."
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security & Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "rakshasutra_super_secure_development_secret_key_2026_change_in_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./rakshasutra.db")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    # Threat Intel API Keys (Optional with mock/fallback mode)
    VIRUSTOTAL_API_KEY: str = os.getenv("VIRUSTOTAL_API_KEY", "")
    GOOGLE_SAFE_BROWSING_KEY: str = os.getenv("GOOGLE_SAFE_BROWSING_KEY", "")
    ABUSEIPDB_API_KEY: str = os.getenv("ABUSEIPDB_API_KEY", "")
    URLHAUS_API_KEY: str = os.getenv("URLHAUS_API_KEY", "")
    
    # SSRF & Networking Limits
    HTTP_CONNECT_TIMEOUT: float = 3.5
    HTTP_READ_TIMEOUT: float = 5.0
    HTTP_MAX_REDIRECTS: int = 4
    HTTP_MAX_BODY_SIZE_BYTES: int = 512 * 1024  # 512 KB
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
