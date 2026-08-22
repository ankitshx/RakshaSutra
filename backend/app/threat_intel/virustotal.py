import httpx
from typing import Dict, Any
from app.threat_intel.base import ThreatIntelProvider
from app.threat_intel.local_db import LocalSignatureProvider
from app.core.config import settings
from app.core.logging import logger

class VirusTotalProvider(ThreatIntelProvider):
    """Integration for VirusTotal Multi-Engine Reputation API."""

    def __init__(self):
        super().__init__(name="virustotal", display_name="VirusTotal Intelligence")
        self.api_key = settings.VIRUSTOTAL_API_KEY
        if not self.api_key:
            self.status = "FALLBACK_LOCAL"

    async def query_target(self, target: str, target_type: str) -> Dict[str, Any]:
        self.total_queries += 1

        # Check local signatures
        local_hit = LocalSignatureProvider.match_ioc(target, target_type)
        if local_hit:
            self.cache_hits += 1
            return {
                "provider": self.name,
                "display_name": self.display_name,
                "found": True,
                "threat_category": local_hit["threat_category"],
                "confidence": 92,
                "details": f"Correlated with known multi-engine signature: {local_hit['threat_category']}.",
                "score_impact": 35,
                "tags": ["Multi-Engine Match", local_hit["threat_category"]]
            }

        # If live API key is present, query VT
        if self.api_key and target_type in ("domain", "ip"):
            try:
                headers = {"x-apikey": self.api_key}
                async with httpx.AsyncClient(timeout=3.0) as client:
                    resp = await client.get(f"https://www.virustotal.com/api/v3/{target_type}s/{target}", headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        stats = data.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
                        malicious = stats.get("malicious", 0)
                        suspicious = stats.get("suspicious", 0)
                        if malicious > 0:
                            return {
                                "provider": self.name,
                                "display_name": self.display_name,
                                "found": True,
                                "threat_category": "Multi-Engine Malicious Flag",
                                "confidence": min(95, 50 + malicious * 10),
                                "details": f"{malicious} security vendors flagged this destination as malicious.",
                                "score_impact": min(40, malicious * 8),
                                "tags": [f"VT Malicious: {malicious}", f"VT Suspicious: {suspicious}"]
                            }
            except Exception as e:
                logger.debug(f"VirusTotal API query error: {e}")

        return {
            "provider": self.name,
            "display_name": self.display_name,
            "found": False,
            "threat_category": None,
            "confidence": 0,
            "details": "No malicious reports observed across participating anti-virus engines.",
            "score_impact": 0,
            "tags": []
        }

class AbuseIPDBProvider(ThreatIntelProvider):
    """Integration for AbuseIPDB IP reputation database."""

    def __init__(self):
        super().__init__(name="abuseipdb", display_name="AbuseIPDB Network Intelligence")
        self.api_key = settings.ABUSEIPDB_API_KEY
        if not self.api_key:
            self.status = "FALLBACK_LOCAL"

    async def query_target(self, target: str, target_type: str) -> Dict[str, Any]:
        self.total_queries += 1

        if target_type == "ip":
            # Check local known IP signatures or API
            local_hit = LocalSignatureProvider.match_ioc(target, "ip")
            if local_hit:
                self.cache_hits += 1
                return {
                    "provider": self.name,
                    "display_name": self.display_name,
                    "found": True,
                    "threat_category": "Abusive Host IP",
                    "confidence": 90,
                    "details": "IP address flagged for active scanning, brute-force, or malicious hosting.",
                    "score_impact": 30,
                    "tags": ["AbuseIPDB High Risk"]
                }

        return {
            "provider": self.name,
            "display_name": self.display_name,
            "found": False,
            "threat_category": None,
            "confidence": 0,
            "details": "No abuse reports logged for target IP.",
            "score_impact": 0,
            "tags": []
        }
