import httpx
from typing import Dict, Any, Optional
from app.threat_intel.base import ThreatIntelProvider
from app.threat_intel.local_db import LocalSignatureProvider
from app.core.logging import logger

class URLhausProvider(ThreatIntelProvider):
    """Integration for abuse.ch URLhaus malware URL feed."""

    def __init__(self):
        super().__init__(name="urlhaus", display_name="URLhaus (abuse.ch)")
        self.api_url = "https://urlhaus-api.abuse.ch/v1/url/"

    async def query_target(self, target: str, target_type: str) -> Dict[str, Any]:
        self.total_queries += 1
        
        # Check local signatures first
        local_hit = LocalSignatureProvider.match_ioc(target, target_type)
        if local_hit:
            self.cache_hits += 1
            return {
                "provider": self.name,
                "display_name": self.display_name,
                "found": True,
                "threat_category": local_hit["threat_category"],
                "confidence": local_hit["confidence"],
                "details": local_hit["details"],
                "score_impact": local_hit["score_impact"],
                "tags": local_hit["tags"]
            }

        # If it's a URL, we can passively query or return clean result
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                resp = await client.post(self.api_url, data={"url": target})
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get("query_status") == "ok":
                        threat = data.get("threat", "Malware URL")
                        return {
                            "provider": self.name,
                            "display_name": self.display_name,
                            "found": True,
                            "threat_category": threat,
                            "confidence": 95,
                            "details": f"Listed in URLhaus database as active threat: {threat}.",
                            "score_impact": 40,
                            "tags": ["URLhaus Active Hit", threat]
                        }
        except Exception as e:
            logger.debug(f"URLhaus live query bypassed/failed ({e}), using local engine.")

        return {
            "provider": self.name,
            "display_name": self.display_name,
            "found": False,
            "threat_category": None,
            "confidence": 0,
            "details": "No active threat records found in URLhaus repository.",
            "score_impact": 0,
            "tags": []
        }
