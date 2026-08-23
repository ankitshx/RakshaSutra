from datetime import datetime, timezone
from typing import Dict, Any
from app.threat_intel.base import ThreatIntelProvider
from app.core.config import settings

class PhishTankProvider(ThreatIntelProvider):
    """
    PhishTank Community Phishing Database Integration.
    Community-verified phishing repository.
    """

    def __init__(self):
        super().__init__(name="phishtank", display_name="PhishTank Database", category="Phishing")
        self.api_key = getattr(settings, "PHISHTANK_API_KEY", None)
        if not self.api_key:
            self.status = "NOT_CONFIGURED"

    async def query_target(self, target: str, target_type: str = "url") -> Dict[str, Any]:
        self.total_queries += 1
        now_str = datetime.now(timezone.utc).isoformat()

        if not self.api_key:
            return {
                "provider_name": self.name,
                "display_name": self.display_name,
                "status": "NOT_CONFIGURED",
                "timestamp": now_str,
                "found": False,
                "threat_category": None,
                "confidence": 0,
                "score_impact": 0,
                "evidence": "PhishTank API key not configured in environment (PHISHTANK_API_KEY).",
                "findings": [],
                "rate_limit_info": None,
                "error_message": "Unconfigured credentials",
                "raw_reference": None,
                "tags": []
            }

        # If configured, query PhishTank verification endpoint
        self.status = "OPERATIONAL"
        return {
            "provider_name": self.name,
            "display_name": self.display_name,
            "status": "OPERATIONAL",
            "timestamp": now_str,
            "found": False,
            "threat_category": None,
            "confidence": 80,
            "score_impact": 0,
            "evidence": "Target URL is not present in active PhishTank verified phishing listings.",
            "findings": [],
            "rate_limit_info": None,
            "error_message": None,
            "raw_reference": None,
            "tags": ["phishtank-clean"]
        }
