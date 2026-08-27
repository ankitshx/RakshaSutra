import os
import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from app.core.config import settings
from app.core.logging import logger
from app.core.database import SessionLocal, engine, Base
from app.api.router import api_router
from app.models.user import User
from app.models.scan import Scan
from app.core.security import get_password_hash
from app.core.metrics import metrics

from sqlalchemy import text

# Create tables if not present
Base.metadata.create_all(bind=engine)

def run_db_migrations():
    """Ensure newly added columns exist in existing SQLite databases."""
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE team_members ADD COLUMN custom_permissions JSON DEFAULT '[]'"))
            conn.commit()
        except Exception:
            pass

run_db_migrations()

def seed_database():
    """Seed initial demo admin and baseline threat indicators if empty."""
    db = SessionLocal()
    try:
        # Seed Super Admin user (rakshasutra.org)
        super_email = "superadmin@rakshasutra.org"
        super_pass = "SuperAdmin@12345"
        super_admin = db.query(User).filter(User.email == super_email).first()
        if not super_admin:
            super_admin = User(
                email=super_email,
                hashed_password=get_password_hash(super_pass),
                full_name="Principal Defense SuperAdmin",
                role="super_admin",
                subscription_tier="enterprise",
                is_active=True,
                api_key="rs_superadmin_telemetry_key_master"
            )
            db.add(super_admin)
            db.commit()
            logger.info("Configured default SuperAdmin account.")
        else:
            super_admin.hashed_password = get_password_hash(super_pass)
            super_admin.role = "super_admin"
            super_admin.subscription_tier = "enterprise"
            super_admin.is_active = True
            db.commit()

        # Seed default admin user (rakshasutra.org)
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
            admin.is_active = True
            db.commit()

        # Seed alternate admin (sharma1.org)
        admin_alt = db.query(User).filter(User.email == "admin@sharma1.org").first()
        if not admin_alt:
            admin_alt = User(
                email="admin@sharma1.org",
                hashed_password=get_password_hash("AdminSOC2026!"),
                full_name="SOC Lead Engineer",
                role="admin",
                subscription_tier="enterprise",
                is_active=True,
                api_key="rs_admin_sharma1_key"
            )
            db.add(admin_alt)
            db.commit()
        else:
            admin_alt.hashed_password = get_password_hash("AdminSOC2026!")
            admin_alt.role = "admin"
            admin_alt.is_active = True
            db.commit()

        # Seed default citizen user (rakshasutra.org)
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
            demo_user.is_active = True
            db.commit()

        # Seed alternate demo user (sharma1.org)
        demo_alt = db.query(User).filter(User.email == "demo@sharma1.org").first()
        if not demo_alt:
            demo_alt = User(
                email="demo@sharma1.org",
                hashed_password=get_password_hash("DemoUser123!"),
                full_name="Citizen Persona",
                role="user",
                subscription_tier="free",
                daily_quota=20,
                scans_today=0,
                osint_quota=5,
                osint_today=0,
                is_active=True
            )
            db.add(demo_alt)
            db.commit()
        else:
            demo_alt.hashed_password = get_password_hash("DemoUser123!")
            demo_alt.is_active = True
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
        # Seed v3.0 sample assets if empty
        from app.models.asset import Asset
        from app.models.vulnerability import Vulnerability, AssetVulnerability
        from app.models.alert_and_incident import SecurityAlert, SecurityIncident

        if db.query(Asset).count() == 0:
            sample_assets = [
                Asset(
                    name="rakshasutra.org",
                    asset_type="domain",
                    environment="production",
                    criticality="CRITICAL",
                    ip_address="104.21.58.12",
                    risk_score=15,
                    risk_level="LOW",
                    technologies=["Cloudflare", "React 19", "FastAPI", "Python 3.12"],
                    tags=["apex-domain", "prod-web"],
                    owner_id=admin.id
                ),
                Asset(
                    name="api.rakshasutra.org",
                    asset_type="subdomain",
                    environment="production",
                    criticality="CRITICAL",
                    ip_address="104.21.58.13",
                    risk_score=20,
                    risk_level="LOW",
                    technologies=["FastAPI", "Uvicorn", "Cloudflare WAF"],
                    tags=["api-gateway", "prod-api"],
                    owner_id=admin.id
                ),
                Asset(
                    name="auth.rakshasutra.org",
                    asset_type="subdomain",
                    environment="production",
                    criticality="HIGH",
                    ip_address="104.21.58.14",
                    risk_score=25,
                    risk_level="LOW",
                    technologies=["JWT / OAuth2", "Nginx"],
                    tags=["identity-provider"],
                    owner_id=admin.id
                ),
                Asset(
                    name="dev-staging.rakshasutra.org",
                    asset_type="subdomain",
                    environment="staging",
                    criticality="MEDIUM",
                    ip_address="198.51.100.45",
                    risk_score=45,
                    risk_level="MEDIUM",
                    technologies=["Docker", "Node.js 20"],
                    tags=["staging-env", "dev-cluster"],
                    owner_id=admin.id
                )
            ]
            db.add_all(sample_assets)
            db.commit()

        # Seed sample vulnerabilities if empty
        if db.query(Vulnerability).count() == 0:
            sample_vulns = [
                Vulnerability(
                    id="CVE-2024-3094",
                    title="XZ Utils Upstream Backdoor Vulnerability",
                    description="Malicious code was discovered in the upstream tarballs of xz, starting with version 5.6.0.",
                    cvss_score=10.0,
                    severity="CRITICAL",
                    epss_score=0.92,
                    affected_component="xz-utils",
                    affected_versions="5.6.0, 5.6.1",
                    fixed_versions="5.6.1-patch, 5.4.6",
                    exploit_available=True,
                    remediation_guidance="Immediately downgrade to xz 5.4.6 or install distribution vendor patched packages.",
                    references=["https://nvd.nist.gov/vuln/detail/CVE-2024-3094"]
                ),
                Vulnerability(
                    id="CVE-2023-4863",
                    title="libwebp Heap Buffer Overflow",
                    description="Heap buffer overflow in libwebp in Google Chrome / WebP renders arbitrary code execution possible.",
                    cvss_score=8.8,
                    severity="HIGH",
                    epss_score=0.45,
                    affected_component="libwebp",
                    affected_versions="< 1.3.2",
                    fixed_versions="1.3.2",
                    exploit_available=True,
                    remediation_guidance="Upgrade libwebp to version 1.3.2 or above across all build pipelines.",
                    references=["https://nvd.nist.gov/vuln/detail/CVE-2023-4863"]
                ),
                Vulnerability(
                    id="CVE-2023-44487",
                    title="HTTP/2 Rapid Reset Attack (DDoS)",
                    description="The HTTP/2 protocol allows a denial of service (server resource consumption) via rapid reset streams.",
                    cvss_score=7.5,
                    severity="HIGH",
                    epss_score=0.28,
                    affected_component="HTTP/2 Web Servers",
                    affected_versions="All HTTP/2 implementations prior to patch",
                    fixed_versions="Patched web server release",
                    exploit_available=True,
                    remediation_guidance="Enable HTTP/2 concurrent stream throttling or rate limits on upstream reverse proxy.",
                    references=["https://nvd.nist.gov/vuln/detail/CVE-2023-44487"]
                )
            ]
            db.add_all(sample_vulns)
            db.commit()

        # Seed sample alerts if empty
        if db.query(SecurityAlert).count() == 0:
            sample_alerts = [
                SecurityAlert(
                    title="Potential Typosquatting Domain Registered (raksha-sutra-kyc.top)",
                    alert_type="PHISHING_DOMAIN_DETECTED",
                    severity="HIGH",
                    confidence=95,
                    status="NEW",
                    source="Brand Impersonation Engine",
                    description="A newly registered lookalike domain 'raksha-sutra-kyc.top' was detected targeting organizational brand keywords.",
                    recommended_action="Submit registrar abuse complaint and add domain to edge firewall blocklist."
                ),
                SecurityAlert(
                    title="SSL/TLS Certificate Expiring in 14 Days on staging.rakshasutra.org",
                    alert_type="CERTIFICATE_EXPIRING",
                    severity="MEDIUM",
                    confidence=100,
                    status="ACKNOWLEDGED",
                    source="Continuous Monitor",
                    description="Let's Encrypt TLS certificate for staging endpoint expires on upcoming billing cycle.",
                    recommended_action="Verify certbot auto-renewal cronjob on staging host."
                )
            ]
            db.add_all(sample_alerts)
            db.commit()

        # Seed sample incident if empty
        if db.query(SecurityIncident).count() == 0:
            sample_inc = SecurityIncident(
                title="Credential Harvester Campaign Impersonating SBI & Utility Notices",
                classification="Phishing Attempt",
                severity="HIGH",
                status="INVESTIGATING",
                summary="Coordinated SMS phishing campaign using lookalike PAN KYC URLs targeting customer credentials.",
                affected_assets=["rakshasutra.org", "SMS Gateway"],
                ioc_indicators=["198.51.100.99", "login-sbi-pan-update.xyz", "http://sbi-verify.top"],
                containment_checklist=[
                    {"step": "RFC 2822 Abuse Letter dispatched to Namecheap Registrar", "completed": True},
                    {"step": "IOC domain added to Platform Blocklist", "completed": True},
                    {"step": "Escalated to CERT-In Incident Response Desk", "completed": False},
                    {"step": "Published Awareness Advisory on Awareness Center", "completed": True}
                ],
                defensive_playbook_id="phishing_click_response",
                owner_id=admin.id
            )
            db.add(sample_inc)
            db.commit()
            logger.info("Seeded sample v3.0 ASM, CVE, Alert, and Incident telemetry data.")

    except Exception as e:
        logger.error(f"Error during startup data seeding: {e}")
    finally:
        db.close()

seed_database()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    seed_database()
    logger.info("RakshaSutra engine initialized successfully.")
    yield
    # Shutdown logic
    logger.info("RakshaSutra engine shutdown complete.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    description="RakshaSutra: Production-Style AI-Powered Cybersecurity Threat Detection & Awareness Platform",
    lifespan=lifespan
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
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"

    # Record Prometheus Observability Metrics
    metrics.record_http_request(
        method=request.method,
        endpoint=request.url.path,
        status_code=response.status_code,
        duration_sec=duration_sec
    )

    return response

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    req_id = getattr(request.state, "request_id", "unknown")
    logger.warning(f"Validation error on {request.url.path} (ReqID: {req_id}): {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "message": "Invalid request parameters provided.",
            "errors": exc.errors(),
            "request_id": req_id,
            "status": "error"
        }
    )

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
