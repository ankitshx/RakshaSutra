from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.scans import router as scans_router
from app.api.v1.message_scan import router as message_scan_router
from app.api.v1.website_scan import router as website_scan_router
from app.api.v1.threat_intel import router as threat_intel_router
from app.api.v1.raksha_ai import router as ai_router
from app.api.v1.awareness import router as awareness_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.admin import router as admin_router
from app.api.v1.subscription import router as subscription_router
from app.api.v1.darkweb import router as darkweb_router
from app.api.v1.takedown import router as takedown_router
from app.api.v1.deception import router as deception_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(scans_router)
api_router.include_router(message_scan_router)
api_router.include_router(website_scan_router)
api_router.include_router(threat_intel_router)
api_router.include_router(ai_router)
api_router.include_router(awareness_router)
api_router.include_router(dashboard_router)
api_router.include_router(admin_router)
api_router.include_router(subscription_router)
api_router.include_router(darkweb_router)
api_router.include_router(takedown_router)
api_router.include_router(deception_router)
