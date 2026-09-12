"""
RakshaSutra Entitlement & Authorization Service
Authoritative server-side source of truth for all user plan limits, features, and quotas.
Community Free Mode is ACTIVE: All scans, OSINT, API keys, and enterprise features are completely free for everyone.
"""

from datetime import datetime, timezone
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.api_gateway import APIQuota
from app.core.config import settings

class EntitlementService:
    # Set to True so anyone can use the platform 100% free without paywalls or payment blocks
    COMMUNITY_FREE_MODE: bool = True
    
    @staticmethod
    def get_tier(user: Optional[User]) -> str:
        if not user:
            return "community_free" if EntitlementService.COMMUNITY_FREE_MODE else "free"
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
        return role in ["super_admin", "admin", "enterprise_admin"] or tier == "enterprise" or EntitlementService.COMMUNITY_FREE_MODE

    @staticmethod
    def enforce_scan_quota(user: Optional[User], db: Session) -> Dict[str, Any]:
        """
        Enforce Daily Threat Scan Quotas.
        In Community Free Mode: All users get unlimited scans with zero payment required.
        """
        if not user:
            return {"allowed": True, "tier": "guest", "scans_today": 0, "daily_quota": 999999 if EntitlementService.COMMUNITY_FREE_MODE else 3}

        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        if getattr(user, "last_scan_date", None) != today_str:
            user.scans_today = 0
            user.last_scan_date = today_str

        tier = EntitlementService.get_tier(user)
        role = EntitlementService.get_role(user)

        if EntitlementService.COMMUNITY_FREE_MODE:
            daily_limit = 999999
        elif role in ["super_admin", "admin", "enterprise_admin"] or tier == "enterprise":
            daily_limit = 999999
        elif tier == "business":
            daily_limit = 500
        elif tier == "pro":
            daily_limit = 100
        else:
            daily_limit = 6

        scans_today = getattr(user, "scans_today", 0)

        if not EntitlementService.COMMUNITY_FREE_MODE and scans_today >= daily_limit:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail={
                    "error": "DAILY_SCAN_QUOTA_EXHAUSTED",
                    "message": f"Daily scan limit reached ({scans_today}/{daily_limit} scans used today). Upgrade your plan for higher scan volume.",
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
        Enforce Daily OSINT Investigation Quotas.
        In Community Free Mode: All users get unlimited investigations with zero payment required.
        """
        tier = EntitlementService.get_tier(user)
        role = EntitlementService.get_role(user)

        if EntitlementService.COMMUNITY_FREE_MODE or role in ["super_admin", "admin", "enterprise_admin"] or tier in ["pro", "business", "enterprise"]:
            if user:
                user.osint_today = getattr(user, "osint_today", 0) + 1
                db.commit()
            return {"allowed": True, "tier": tier, "osint_today": getattr(user, "osint_today", 1) if user else 1, "osint_quota": "Unlimited"}

        # Fallback legacy logic if Community Free Mode is turned off
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
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
                        "message": "You have used your 1 Free OSINT Reconnaissance Investigation for today.",
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
        """In Community Free Mode, all authenticated users can access and generate developer API keys."""
        if not user:
            return False
        if EntitlementService.COMMUNITY_FREE_MODE:
            return True
        tier = EntitlementService.get_tier(user)
        role = EntitlementService.get_role(user)
        if role in ["super_admin", "admin"]:
            return True
        return tier in ["business", "enterprise"]

    @staticmethod
    def can_use_honeytokens(user: Optional[User]) -> bool:
        """In Community Free Mode, all authenticated users can deploy honeytoken deception tripwires."""
        if not user:
            return False
        if EntitlementService.COMMUNITY_FREE_MODE:
            return True
        if not settings.FEATURE_ENTERPRISE_HONEYTOKENS:
            return False
        tier = EntitlementService.get_tier(user)
        role = EntitlementService.get_role(user)
        return role in ["super_admin", "admin", "enterprise_admin"] or tier == "enterprise"

    @staticmethod
    def get_user_entitlements(user: Optional[User], db: Session) -> Dict[str, Any]:
        tier = EntitlementService.get_tier(user)
        role = EntitlementService.get_role(user)
        
        if EntitlementService.COMMUNITY_FREE_MODE:
            return {
                "tier": "enterprise" if tier in ["enterprise", "super_admin"] else "community_unlimited",
                "role": role,
                "can_scan": True,
                "daily_scan_limit": 999999,
                "can_use_osint": True,
                "osint_daily_limit": "Unlimited",
                "can_use_darkweb_monitor": True,
                "can_use_api": True,
                "can_use_honeytokens": True,
                "can_manage_team": True,
                "can_export_reports": True
            }

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
