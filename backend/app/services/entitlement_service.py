"""
RakshaSutra Entitlement & Authorization Service
Authoritative server-side source of truth for all user plan limits, features, and quotas.
"""

from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.api_gateway import APIQuota
from app.core.config import settings

class EntitlementService:
    
    @staticmethod
    def get_tier(user: Optional[User]) -> str:
        if not user:
            return "free"
        return getattr(user, "subscription_tier", "free").lower()

    @staticmethod
    def get_role(user: Optional[User]) -> str:
        if not user:
            return "guest"
        return getattr(user, "role", "user").lower()

    @staticmethod
    def is_privileged(user: Optional[User]) -> bool:
        if not user:
            return False
        role = EntitlementService.get_role(user)
        tier = EntitlementService.get_tier(user)
        return role in ["super_admin", "admin", "enterprise_admin"] or tier == "enterprise"

    @staticmethod
    def enforce_scan_quota(user: Optional[User], db: Session) -> Dict[str, Any]:
        """
        Enforce Daily Threat Scan Quotas:
        - Free: 6 scans/day
        - Pro: 100 scans/day
        - Business: 500 scans/day
        - Enterprise / Super Admin: Contract-based / Configurable
        """
        if not user:
            # Unauthenticated guests are allowed 3 introductory trial scans
            return {"allowed": True, "tier": "guest", "scans_today": 0, "daily_quota": 3}

        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        if getattr(user, "last_scan_date", None) != today_str:
            user.scans_today = 0
            user.last_scan_date = today_str

        tier = EntitlementService.get_tier(user)
        role = EntitlementService.get_role(user)

        # Determine daily quota based on plan tier
        if role in ["super_admin", "admin", "enterprise_admin"] or tier == "enterprise":
            daily_limit = 999999
        elif tier == "business":
            daily_limit = 500
        elif tier == "pro":
            daily_limit = 100
        else:
            daily_limit = 6

        scans_today = getattr(user, "scans_today", 0)

        if scans_today >= daily_limit:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail={
                    "error": "DAILY_SCAN_QUOTA_EXHAUSTED",
                    "message": f"Daily scan limit reached ({scans_today}/{daily_limit} scans used today). Your daily allowance resets at 00:00 UTC. Upgrade your plan for higher scan volume.",
                    "tier": tier,
                    "scans_today": scans_today,
                    "daily_quota": daily_limit,
                    "upgrade_url": "/pricing"
                }
            )

        user.scans_today = scans_today + 1
        user.scans_used = getattr(user, "scans_used", 0) + 1
        db.commit()

        return {"allowed": True, "tier": tier, "scans_today": user.scans_today, "daily_quota": daily_limit}

    @staticmethod
    def enforce_osint_quota(user: Optional[User], db: Session) -> Dict[str, Any]:
        """
        Enforce Daily OSINT Investigation Quotas:
        - Free: 1 investigation/day
        - Pro / Business / Enterprise: Unlimited investigations
        """
        tier = EntitlementService.get_tier(user)
        role = EntitlementService.get_role(user)

        if role in ["super_admin", "admin", "enterprise_admin"] or tier in ["pro", "business", "enterprise"]:
            if user:
                user.osint_today = getattr(user, "osint_today", 0) + 1
                db.commit()
            return {"allowed": True, "tier": tier, "osint_today": getattr(user, "osint_today", 1), "osint_quota": "Unlimited"}

        # Free tier logic
        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        if user:
            if getattr(user, "last_osint_date", None) != today_str:
                user.osint_today = 0
                user.last_osint_date = today_str

            osint_today = getattr(user, "osint_today", 0)
            if osint_today >= 1:
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail={
                        "error": "OSINT_QUOTA_EXHAUSTED",
                        "message": "You have used your 1 Free OSINT Reconnaissance Investigation for today. Upgrade to Pro or Business for unlimited investigations, deep footprinting, and interactive threat graph exports.",
                        "tier": "free",
                        "osint_today": osint_today,
                        "osint_quota": 1,
                        "upgrade_url": "/pricing"
                    }
                )
            user.osint_today = osint_today + 1
            db.commit()
            return {"allowed": True, "tier": "free", "osint_today": user.osint_today, "osint_quota": 1}

        return {"allowed": True, "tier": "guest", "osint_today": 1, "osint_quota": 1}

    @staticmethod
    def can_use_api(user: Optional[User], db: Session) -> bool:
        """API Access is available only for Business & Enterprise tiers."""
        tier = EntitlementService.get_tier(user)
        role = EntitlementService.get_role(user)
        if role in ["super_admin", "admin"]:
            return True
        return tier in ["business", "enterprise"]

    @staticmethod
    def can_use_honeytokens(user: Optional[User]) -> bool:
        """Honeytokens & Deception are Enterprise-only features."""
        if not settings.FEATURE_ENTERPRISE_HONEYTOKENS:
            return False
        tier = EntitlementService.get_tier(user)
        role = EntitlementService.get_role(user)
        return role in ["super_admin", "admin", "enterprise_admin"] or tier == "enterprise"

    @staticmethod
    def get_user_entitlements(user: Optional[User], db: Session) -> Dict[str, Any]:
        tier = EntitlementService.get_tier(user)
        role = EntitlementService.get_role(user)
        
        return {
            "tier": tier,
            "role": role,
            "can_scan": True,
            "daily_scan_limit": 999999 if tier in ["enterprise", "pro", "business"] else 6,
            "can_use_osint": True,
            "osint_daily_limit": "Unlimited" if tier in ["pro", "business", "enterprise"] else 1,
            "can_use_darkweb_monitor": tier in ["pro", "business", "enterprise"],
            "can_use_api": EntitlementService.can_use_api(user, db),
            "can_use_honeytokens": EntitlementService.can_use_honeytokens(user),
            "can_manage_team": tier in ["business", "enterprise"],
            "can_export_reports": True
        }
