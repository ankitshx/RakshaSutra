import asyncio
from typing import Dict, List, Any
from app.threat_intel.base import ThreatIntelProvider
from app.threat_intel.urlhaus import URLhausProvider
from app.threat_intel.virustotal import VirusTotalProvider
from app.threat_intel.google_safe_browsing import GoogleSafeBrowsingProvider
from app.threat_intel.urlscan import URLScanProvider
from app.threat_intel.phishtank import PhishTankProvider
from app.threat_intel.cert_transparency import CertificateTransparencyProvider

class ThreatIntelRegistry:
    """Registry managing all external and local threat intelligence engines."""

    def __init__(self):
        self.providers: Dict[str, ThreatIntelProvider] = {
            "google_safe_browsing": GoogleSafeBrowsingProvider(),
            "virustotal": VirusTotalProvider(),
            "urlhaus": URLhausProvider(),
            "urlscan": URLScanProvider(),
            "phishtank": PhishTankProvider(),
            "cert_transparency": CertificateTransparencyProvider()
        }

    async def query_all(self, target: str, target_type: str = "url") -> Dict[str, Any]:
        """
        Query all enabled providers asynchronously in parallel with normalized output.
        """
        tasks = []
        provider_names = []
        for name, provider in self.providers.items():
            if provider.is_enabled:
                tasks.append(provider.query_target(target, target_type))
                provider_names.append(name)

        results = await asyncio.gather(*tasks, return_exceptions=True)

        hits = []
        all_results = []
        max_score_impact = 0
        all_tags = set()
        matched_categories = []

        for i, res in enumerate(results):
            provider_name = provider_names[i]
            if isinstance(res, dict):
                all_results.append(res)
                if res.get("found"):
                    hits.append(res)
                    impact = res.get("score_impact", 0)
                    if impact > max_score_impact:
                        max_score_impact = impact
                    if res.get("threat_category"):
                        matched_categories.append(res["threat_category"])
                    for t in res.get("tags", []):
                        all_tags.add(t)
            else:
                # Exception occurred
                all_results.append({
                    "provider_name": provider_name,
                    "display_name": provider_name.replace("_", " ").title(),
                    "status": "UNAVAILABLE",
                    "found": False,
                    "error_message": str(res),
                    "evidence": f"Provider query failed: {str(res)}",
                    "findings": [],
                    "score_impact": 0,
                    "tags": []
                })

        return {
            "has_threat_intel_hit": len(hits) > 0,
            "hits_count": len(hits),
            "hits": hits,
            "all_results": all_results,
            "max_score_impact": min(max_score_impact, 40),
            "matched_categories": matched_categories,
            "tags": list(all_tags),
            "providers_checked": provider_names
        }

    def get_all_provider_statuses(self) -> List[Dict[str, Any]]:
        return [p.get_status() for p in self.providers.values()]

threat_intel_registry = ThreatIntelRegistry()
