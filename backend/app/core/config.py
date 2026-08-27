"""
RakshaSutra Configuration & Security Settings
Reads all environment variables and controls feature flags, security parameters, and payment keys.
"""

import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "RakshaSutra"
    TAGLINE: str = "Check Before You Click."
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security & Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "rakshasutra_super_secure_development_secret_key_2026_change_in_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Super Admin Configuration (Configured strictly via Environment Variables / .env)
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@rakshasutra.org")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "ChangeThisAdminSecret2026!")
    
    # Database (PostgreSQL for production, SQLite for local dev)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./rakshasutra.db")
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "https://rakshasutra.org",
        "https://app.rakshasutra.org",
        "*"
    ]
    
    # Threat Intelligence API Keys (Optional external enrichment)
    VIRUSTOTAL_API_KEY: str = os.getenv("VIRUSTOTAL_API_KEY", "")
    GOOGLE_SAFE_BROWSING_KEY: str = os.getenv("GOOGLE_SAFE_BROWSING_KEY", "")
    ABUSEIPDB_API_KEY: str = os.getenv("ABUSEIPDB_API_KEY", "")
    URLHAUS_API_KEY: str = os.getenv("URLHAUS_API_KEY", "")
    
    # Razorpay Payment Gateway
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_rakshasutra_2026")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "rakshasutra_rzp_secret_key_dev")
    RAZORPAY_WEBHOOK_SECRET: str = os.getenv("RAZORPAY_WEBHOOK_SECRET", "rakshasutra_webhook_secret_dev")
    
    # Feature Flags
    FEATURE_ADVANCED_OSINT: bool = True
    FEATURE_DARKWEB_MONITORING: bool = True
    FEATURE_ENTERPRISE_API: bool = True
    FEATURE_ENTERPRISE_HONEYTOKENS: bool = True
    FEATURE_APK_SCANNER: bool = False  # Marked "Coming Soon / Isolated Sandbox"
    FEATURE_LIVE_THREAT_INTELLIGENCE: bool = False  # Defaults to Simulation Mode unless configured
    FEATURE_INCIDENT_RESPONSE: bool = True
    FEATURE_ENTERPRISE_BROWSER_MANAGEMENT: bool = True
    
    # SSRF & Networking Limits
    HTTP_CONNECT_TIMEOUT: float = 3.5
    HTTP_READ_TIMEOUT: float = 5.0
    HTTP_MAX_REDIRECTS: int = 4
    HTTP_MAX_BODY_SIZE_BYTES: int = 512 * 1024  # 512 KB
    
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra="ignore"
    )

settings = Settings()
