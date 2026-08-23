import httpx
import urllib.parse
from datetime import datetime, timezone
from typing import Dict, Any, List
from app.threat_intel.base import ThreatIntelProvider

class CertificateTransparencyProvider(ThreatIntelProvider):
    """
    Certificate Transparency Log Analyzer (via crt.sh).
    Public cryptographic audit log providing verified subdomains and SSL issuance history.
    """

    def __init__(self):
        super().__init__(name="cert_transparency", display_name="Certificate Transparency Logs (crt.sh)", category="Infrastructure")
        self.status = "OPERATIONAL"

    async def query_target(self, target: str, target_type: str = "domain") -> Dict[str, Any]:
        self.total_queries += 1
        now_str = datetime.now(timezone.utc).isoformat()

        # Extract domain name
        domain = target
        if target.startswith("http://") or target.startswith("https://"):
            parsed = urllib.parse.urlparse(target)
            domain = parsed.hostname or target

        endpoint = f"https://crt.sh/?q=%.{domain}&output=json"

        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(endpoint)
                if res.status_code == 200:
                    data = res.json()
                    self.status = "OPERATIONAL"
                    if isinstance(data, list) and data:
                        subdomains = set()
                        issuers = set()
                        for entry in data[:30]: # Cap first 30 entries
                            name_val = entry.get("name_value", "")
                            for sub in name_val.split("\n"):
                                sub_clean = sub.strip().lower()
                                if sub_clean and not sub_clean.startswith("*."):
                                    subdomains.add(sub_clean)
                            issuer = entry.get("issuer_name", "")
                            if issuer:
                                issuers.add(issuer.split(",")[0])

                        return {
                            "provider_name": self.name,
                            "display_name": self.display_name,
                            "status": "OPERATIONAL",
                            "timestamp": now_str,
                            "found": True,
                            "threat_category": None,
                            "confidence": 95,
                            "score_impact": 0,
                            "evidence": f"Discovered {len(subdomains)} verified subdomains in public Certificate Transparency logs.",
                            "findings": [{
                                "total_certificates": len(data),
                                "discovered_subdomains": list(subdomains)[:15],
                                "known_issuers": list(issuers)[:5]
                            }],
                            "rate_limit_info": None,
                            "error_message": None,
                            "raw_reference": {"subdomains_count": len(subdomains)},
                            "tags": ["crt-sh-verified", f"{len(subdomains)}-subdomains"]
                        }
                    else:
                        return {
                            "provider_name": self.name,
                            "display_name": self.display_name,
                            "status": "OPERATIONAL",
                            "timestamp": now_str,
                            "found": False,
                            "threat_category": None,
                            "confidence": 75,
                            "score_impact": 0,
                            "evidence": "No public Certificate Transparency entries found on crt.sh.",
                            "findings": [],
                            "rate_limit_info": None,
                            "error_message": None,
                            "raw_reference": None,
                            "tags": ["crt-sh-none"]
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
                        "evidence": f"crt.sh responded with HTTP {res.status_code}.",
                        "findings": [],
                        "rate_limit_info": None,
                        "error_message": f"HTTP {res.status_code}",
                        "raw_reference": None,
                        "tags": []
                    }
        except Exception as e:
            self.status = "DEGRADED"
            self.last_error = str(e)
            return {
                "provider_name": self.name,
                "display_name": self.display_name,
                "status": "DEGRADED",
                "timestamp": now_str,
                "found": False,
                "threat_category": None,
                "confidence": 0,
                "score_impact": 0,
                "evidence": f"crt.sh public server timeout/unavailable: {str(e)}",
                "findings": [],
                "rate_limit_info": None,
                "error_message": str(e),
                "raw_reference": None,
                "tags": []
            }
