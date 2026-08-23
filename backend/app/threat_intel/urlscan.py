import httpx
from datetime import datetime, timezone
from typing import Dict, Any
from app.threat_intel.base import ThreatIntelProvider
from app.core.config import settings

class URLScanProvider(ThreatIntelProvider):
    """
    urlscan.io API Integration.
    Queries historical scans and community observations for page details, screenshots, and malicious DOM markers.
    """

    def __init__(self):
        super().__init__(name="urlscan", display_name="urlscan.io Intelligence", category="Page & DOM")
        self.api_key = getattr(settings, "URLSCAN_API_KEY", None)
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
                "evidence": "urlscan.io API key not configured (URLSCAN_API_KEY).",
                "findings": [],
                "rate_limit_info": None,
                "error_message": "Unconfigured credentials",
                "raw_reference": None,
                "tags": []
            }

        # Search existing public observations without automatically submitting sensitive user URLs
        endpoint = f"https://urlscan.io/api/v1/search/?q=page.url:\"{target}\"&size=1"
        headers = {"API-Key": self.api_key}

        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(endpoint, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    results = data.get("results", [])
                    self.status = "OPERATIONAL"
                    if results:
                        item = results[0]
                        verdicts = item.get("verdicts", {}).get("overall", {})
                        malicious = verdicts.get("malicious", False)
                        score = verdicts.get("score", 0)
                        categories = verdicts.get("categories", [])
                        
                        if malicious or score > 50:
                            return {
                                "provider_name": self.name,
                                "display_name": self.display_name,
                                "status": "OPERATIONAL",
                                "timestamp": now_str,
                                "found": True,
                                "threat_category": "MALICIOUS_PAGE",
                                "confidence": 90,
                                "score_impact": 30,
                                "evidence": f"Flagged as malicious by urlscan.io community verdicts (Score: {score}).",
                                "findings": [{
                                    "verdicts": verdicts,
                                    "page": item.get("page", {}),
                                    "screenshot": item.get("screenshot")
                                }],
                                "rate_limit_info": None,
                                "error_message": None,
                                "raw_reference": item,
                                "tags": ["urlscan-flagged"] + categories
                            }
                        else:
                            return {
                                "provider_name": self.name,
                                "display_name": self.display_name,
                                "status": "OPERATIONAL",
                                "timestamp": now_str,
                                "found": False,
                                "threat_category": None,
                                "confidence": 80,
                                "score_impact": 0,
                                "evidence": "urlscan.io record observed clean.",
                                "findings": [{
                                    "page": item.get("page", {}),
                                    "last_scanned": item.get("task", {}).get("time")
                                }],
                                "rate_limit_info": None,
                                "error_message": None,
                                "raw_reference": None,
                                "tags": ["urlscan-clean"]
                            }
                    else:
                        return {
                            "provider_name": self.name,
                            "display_name": self.display_name,
                            "status": "OPERATIONAL",
                            "timestamp": now_str,
                            "found": False,
                            "threat_category": None,
                            "confidence": 40,
                            "score_impact": 0,
                            "evidence": "No historical community observations found on urlscan.io.",
                            "findings": [],
                            "rate_limit_info": None,
                            "error_message": None,
                            "raw_reference": None,
                            "tags": ["urlscan-unseen"]
                        }
                elif res.status_code == 429:
                    self.status = "RATE_LIMITED"
                    self.last_error = "Rate limit reached"
                    return {
                        "provider_name": self.name,
                        "display_name": self.display_name,
                        "status": "RATE_LIMITED",
                        "timestamp": now_str,
                        "found": False,
                        "threat_category": None,
                        "confidence": 0,
                        "score_impact": 0,
                        "evidence": "urlscan.io rate limit exceeded.",
                        "findings": [],
                        "rate_limit_info": {"status": "rate_limited"},
                        "error_message": "Rate limit exceeded",
                        "raw_reference": None,
                        "tags": []
                    }
                else:
                    self.status = "DEGRADED"
                    return {
                        "provider_name": self.name,
                        "display_name": self.display_name,
                        "status": "DEGRADED",
                        "timestamp": now_str,
                        "found": False,
                        "threat_category": None,
                        "confidence": 0,
                        "score_impact": 0,
                        "evidence": f"urlscan.io returned HTTP {res.status_code}.",
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
                "evidence": f"urlscan.io connection error: {str(e)}",
                "findings": [],
                "rate_limit_info": None,
                "error_message": str(e),
                "raw_reference": None,
                "tags": []
            }
