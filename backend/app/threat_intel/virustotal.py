import base64
import httpx
from datetime import datetime, timezone
from typing import Dict, Any
from app.threat_intel.base import ThreatIntelProvider
from app.core.config import settings

class VirusTotalProvider(ThreatIntelProvider):
    """
    VirusTotal API v3 Integration.
    Queries URL / Domain / IP reports from over 70+ antivirus and web scanner engines.
    """

    def __init__(self):
        super().__init__(name="virustotal", display_name="VirusTotal Intelligence", category="Consensus")
        self.api_key = getattr(settings, "VIRUSTOTAL_API_KEY", None)
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
                "evidence": "VirusTotal API key not configured (VIRUSTOTAL_API_KEY).",
                "findings": [],
                "rate_limit_info": None,
                "error_message": "Unconfigured credentials",
                "raw_reference": None,
                "tags": []
            }

        # For URLs, VirusTotal uses base64 URL ID without padding
        url_id = base64.urlsafe_b64encode(target.encode()).decode().strip("=")
        endpoint = f"https://www.virustotal.com/api/v3/urls/{url_id}"
        headers = {"x-apikey": self.api_key}

        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(endpoint, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    attr = data.get("data", {}).get("attributes", {})
                    stats = attr.get("last_analysis_stats", {})
                    malicious = stats.get("malicious", 0)
                    suspicious = stats.get("suspicious", 0)
                    harmless = stats.get("harmless", 0)
                    total_engines = sum(stats.values()) if stats else 0
                    
                    self.status = "OPERATIONAL"
                    if malicious > 0 or suspicious > 1:
                        score_impact = min(40, (malicious * 8) + (suspicious * 4))
                        return {
                            "provider_name": self.name,
                            "display_name": self.display_name,
                            "status": "OPERATIONAL",
                            "timestamp": now_str,
                            "found": True,
                            "threat_category": "MALWARE_OR_PHISHING",
                            "confidence": min(98, 50 + (malicious * 10)),
                            "score_impact": score_impact,
                            "evidence": f"Flagged as malicious by {malicious}/{total_engines} security vendors on VirusTotal.",
                            "findings": [{
                                "malicious_count": malicious,
                                "suspicious_count": suspicious,
                                "harmless_count": harmless,
                                "total_engines": total_engines,
                                "categories": attr.get("categories", {})
                            }],
                            "rate_limit_info": None,
                            "error_message": None,
                            "raw_reference": {"stats": stats, "reputation": attr.get("reputation")},
                            "tags": ["virustotal-flagged", f"{malicious}-positives"]
                        }
                    else:
                        return {
                            "provider_name": self.name,
                            "display_name": self.display_name,
                            "status": "OPERATIONAL",
                            "timestamp": now_str,
                            "found": False,
                            "threat_category": None,
                            "confidence": 90,
                            "score_impact": 0,
                            "evidence": f"Clean consensus across {total_engines} vendors on VirusTotal.",
                            "findings": [{"harmless_count": harmless, "total_engines": total_engines}],
                            "rate_limit_info": None,
                            "error_message": None,
                            "raw_reference": {"stats": stats},
                            "tags": ["virustotal-clean"]
                        }
                elif res.status_code == 404:
                    self.status = "OPERATIONAL"
                    return {
                        "provider_name": self.name,
                        "display_name": self.display_name,
                        "status": "OPERATIONAL",
                        "timestamp": now_str,
                        "found": False,
                        "threat_category": None,
                        "confidence": 50,
                        "score_impact": 0,
                        "evidence": "URL has not been previously scanned by VirusTotal community.",
                        "findings": [],
                        "rate_limit_info": None,
                        "error_message": None,
                        "raw_reference": None,
                        "tags": ["vt-unseen"]
                    }
                elif res.status_code == 429:
                    self.status = "RATE_LIMITED"
                    self.last_error = "Rate limited (HTTP 429)"
                    return {
                        "provider_name": self.name,
                        "display_name": self.display_name,
                        "status": "RATE_LIMITED",
                        "timestamp": now_str,
                        "found": False,
                        "threat_category": None,
                        "confidence": 0,
                        "score_impact": 0,
                        "evidence": "VirusTotal API rate limit reached.",
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
                        "evidence": f"VirusTotal returned HTTP status {res.status_code}.",
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
                "evidence": f"VirusTotal connection timeout/error: {str(e)}",
                "findings": [],
                "rate_limit_info": None,
                "error_message": str(e),
                "raw_reference": None,
                "tags": []
            }
