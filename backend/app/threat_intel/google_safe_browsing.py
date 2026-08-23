import httpx
from datetime import datetime, timezone
from typing import Dict, Any
from app.threat_intel.base import ThreatIntelProvider
from app.core.config import settings

class GoogleSafeBrowsingProvider(ThreatIntelProvider):
    """
    Google Safe Browsing API v4 Integration.
    Checks URLs against Google's constantly updated lists of unsafe web resources
    (Social Engineering, Malware, Unwanted Software, Potentially Harmful Applications).
    """

    def __init__(self):
        super().__init__(name="google_safe_browsing", display_name="Google Safe Browsing", category="Reputation")
        self.api_key = getattr(settings, "GOOGLE_SAFE_BROWSING_KEY", None)
        if not self.api_key:
            self.status = "NOT_CONFIGURED"

    async def query_target(self, target: str, target_type: str = "url") -> Dict[str, Any]:
        self.total_queries += 1
        now_str = datetime.now(timezone.utc).isoformat()
        
        # If API key is not configured, transparently declare status without fabricating
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
                "evidence": "Google Safe Browsing API key not configured in environment (GOOGLE_SAFE_BROWSING_KEY).",
                "findings": [],
                "rate_limit_info": None,
                "error_message": "Unconfigured credentials",
                "raw_reference": None,
                "tags": []
            }

        endpoint = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={self.api_key}"
        payload = {
            "client": {
                "clientId": "rakshasutra-security",
                "clientVersion": "1.0.0"
            },
            "threatInfo": {
                "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                "platformTypes": ["ANY_PLATFORM"],
                "threatEntryTypes": ["URL"],
                "threatEntries": [{"url": target}]
            }
        }

        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.post(endpoint, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    matches = data.get("matches", [])
                    if matches:
                        threat_type = matches[0].get("threatType", "MALICIOUS")
                        self.status = "OPERATIONAL"
                        return {
                            "provider_name": self.name,
                            "display_name": self.display_name,
                            "status": "OPERATIONAL",
                            "timestamp": now_str,
                            "found": True,
                            "threat_category": threat_type,
                            "confidence": 95,
                            "score_impact": 35,
                            "evidence": f"Flagged by Google Safe Browsing as {threat_type}.",
                            "findings": [{
                                "threat_type": threat_type,
                                "platform": matches[0].get("platformType"),
                                "cache_duration": matches[0].get("cacheDuration")
                            }],
                            "rate_limit_info": None,
                            "error_message": None,
                            "raw_reference": data,
                            "tags": ["google-safe-browsing", threat_type.lower()]
                        }
                    else:
                        self.status = "OPERATIONAL"
                        return {
                            "provider_name": self.name,
                            "display_name": self.display_name,
                            "status": "OPERATIONAL",
                            "timestamp": now_str,
                            "found": False,
                            "threat_category": None,
                            "confidence": 85,
                            "score_impact": 0,
                            "evidence": "No matches found in Google Safe Browsing database.",
                            "findings": [],
                            "rate_limit_info": None,
                            "error_message": None,
                            "raw_reference": None,
                            "tags": ["clean-google-safebrowsing"]
                        }
                elif res.status_code == 429:
                    self.status = "RATE_LIMITED"
                    self.last_error = "Rate limit exceeded (HTTP 429)"
                    return {
                        "provider_name": self.name,
                        "display_name": self.display_name,
                        "status": "RATE_LIMITED",
                        "timestamp": now_str,
                        "found": False,
                        "threat_category": None,
                        "confidence": 0,
                        "score_impact": 0,
                        "evidence": "Google Safe Browsing rate limit reached.",
                        "findings": [],
                        "rate_limit_info": {"status": "rate_limited"},
                        "error_message": "Rate limit exceeded",
                        "raw_reference": None,
                        "tags": []
                    }
                else:
                    self.status = "DEGRADED"
                    self.last_error = f"HTTP {res.status_code}"
                    return {
                        "provider_name": self.name,
                        "display_name": self.display_name,
                        "status": "DEGRADED",
                        "timestamp": now_str,
                        "found": False,
                        "threat_category": None,
                        "confidence": 0,
                        "score_impact": 0,
                        "evidence": f"Google Safe Browsing responded with HTTP status {res.status_code}.",
                        "findings": [],
                        "rate_limit_info": None,
                        "error_message": f"HTTP {res.status_code}",
                        "raw_reference": None,
                        "tags": []
                    }
        except Exception as e:
            self.status = "UNAVAILABLE"
            self.last_error = str(e)
            return {
                "provider_name": self.name,
                "display_name": self.display_name,
                "status": "UNAVAILABLE",
                "timestamp": now_str,
                "found": False,
                "threat_category": None,
                "confidence": 0,
                "score_impact": 0,
                "evidence": f"Google Safe Browsing connection timeout/error: {str(e)}",
                "findings": [],
                "rate_limit_info": None,
                "error_message": str(e),
                "raw_reference": None,
                "tags": []
            }
