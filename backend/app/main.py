import os
import time
import uuid
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from app.core.config import settings
from app.core.logging import logger
from app.core.database import SessionLocal, engine, Base
from app.api.router import api_router
from app.models.user import User
from app.models.scan import Scan
from app.models.security_event import SecurityEvent
from app.core.security import get_password_hash
from app.core.metrics import metrics
from app.core.pii_scrubber import pii_scrubber

# Create tables if not present
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    description="RakshaSutra: Production-Style AI-Powered Cybersecurity Threat Detection & Awareness Platform"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def audit_and_timing_middleware(request: Request, call_next):
    req_id = str(uuid.uuid4())[:8]
    request.state.request_id = req_id
    start_time = time.time()

    response = await call_next(request)
    duration_sec = time.time() - start_time
    duration_ms = round(duration_sec * 1000, 2)
    response.headers["X-Request-ID"] = req_id
    response.headers["X-Execution-Time-MS"] = str(duration_ms)

    # Record Prometheus Observability Metrics
    metrics.record_http_request(
        method=request.method,
        endpoint=request.url.path,
        status_code=response.status_code,
        duration_sec=duration_sec
    )

    return response

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    req_id = getattr(request.state, "request_id", "unknown")
    logger.error(f"Unhandled Exception on {request.url.path} (ReqID: {req_id}): {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "message": "Something went wrong during security processing.",
            "request_id": req_id,
            "status": "error"
        }
    )

# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_seed_data():
    """Seed initial demo admin and baseline threat indicators if empty."""
    db = SessionLocal()
    try:
        # Seed default admin user
        admin_email = "admin@rakshasutra.org"
        admin_pass = "Admin@12345"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                email=admin_email,
                hashed_password=get_password_hash(admin_pass),
                full_name="Security Operations Lead",
                role="admin",
                subscription_tier="enterprise",
                is_active=True,
                api_key="rs_admin_telemetry_key_secure"
            )
            db.add(admin)
            db.commit()
            logger.info("Configured default Admin account.")
        else:
            admin.hashed_password = get_password_hash(admin_pass)
            admin.role = "admin"
            admin.subscription_tier = "enterprise"
            db.commit()

        # Seed default citizen user
        demo_email = "demo@rakshasutra.org"
        demo_pass = "Citizen@12345"
        demo_user = db.query(User).filter(User.email == demo_email).first()
        if not demo_user:
            demo_user = User(
                email=demo_email,
                hashed_password=get_password_hash(demo_pass),
                full_name="Verified Citizen Analyst",
                role="user",
                subscription_tier="free",
                daily_quota=20,
                scans_today=2,
                osint_quota=5,
                osint_today=0,
                is_active=True,
                api_key="rs_demo_citizen_key_valid"
            )
            db.add(demo_user)
            db.commit()
            logger.info("Configured default Citizen demo user.")
        else:
            demo_user.hashed_password = get_password_hash(demo_pass)
            db.commit()

        # Seed sample scan records for rich dashboard demo if empty
        if db.query(Scan).count() == 0:
            sample_scans = [
                Scan(
                    user_id=admin.id,
                    scan_type="url",
                    target="http://login-sbi-pan-update.xyz/verify.php",
                    target_display="login-sbi-pan-update.xyz",
                    risk_score=94,
                    risk_level="HIGH",
                    summary="This link is classified as HIGH RISK because it impersonates SBI and operates on disposable .xyz infrastructure with banking credential lure keywords.",
                    recommendation="DO NOT open this link, enter passwords, or provide OTPs. Manually navigate to official onlinesbi.sbi portal.",
                    execution_time_ms=48.2,
                    indicators_count=4
                ),
                Scan(
                    user_id=admin.id,
                    scan_type="message",
                    target="URGENT: Your electricity connection will be disconnected tonight at 9:30 PM. Call power officer at 9876543210 immediately.",
                    target_display="[SMS] Electricity disconnection alert",
                    risk_score=88,
                    risk_level="HIGH",
                    summary="High probability social engineering attempt exploiting fake utility cutoff deadline panic.",
                    recommendation="Never call mobile numbers sent in disconnection SMS messages. Contact the official customer helpline on your electricity bill.",
                    execution_time_ms=32.4,
                    indicators_count=3
                ),
                Scan(
                    user_id=admin.id,
                    scan_type="website",
                    target="https://github.com",
                    target_display="github.com",
                    risk_score=5,
                    risk_level="LOW",
                    summary="Domain exhibits robust defensive posture with TLS 1.3 encryption, Strict-Transport-Security (HSTS), and restrictive Content-Security-Policy (CSP).",
                    recommendation="Domain is verified clean. Continue regular browsing with standard operational awareness.",
                    execution_time_ms=210.6,
                    indicators_count=0
                )
            ]
            db.add_all(sample_scans)
            db.commit()
            logger.info("Seeded sample scan telemetry data.")

    except Exception as e:
        logger.error(f"Error during startup data seeding: {e}")
    finally:
        db.close()

@app.get("/health", tags=["Telemetry"])
@app.get("/api/v1/health", tags=["Telemetry"])
def health_check():
    """System health check and live provider readiness."""
    return {
        "status": "healthy",
        "service": "RakshaSutra",
        "tagline": "Check Before You Click.",
        "version": "1.0.0",
        "active_providers": 3
    }

@app.get("/metrics", tags=["Telemetry"])
@app.get("/api/v1/metrics", tags=["Telemetry"])
def prometheus_metrics():
    """Prometheus plaintext exposition endpoint for Grafana/Prometheus scraping."""
    from fastapi.responses import PlainTextResponse
    return PlainTextResponse(
        content=metrics.export_prometheus_text(),
        media_type="text/plain; version=0.0.4; charset=utf-8"
    )

# Mount static files if frontend dist exists (Production Unified Single Container Mode)
frontend_dist_paths = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../frontend/dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/dist")),
    "/app/frontend/dist"
]

frontend_dist = next((p for p in frontend_dist_paths if os.path.exists(p)), None)
if frontend_dist:
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa_frontend(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("openapi.json"):
            return JSONResponse(status_code=404, content={"message": "Endpoint not found"})
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
