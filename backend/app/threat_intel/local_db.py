import re
from typing import Dict, List, Any, Optional

# High-confidence known threat signatures, malware drop domains, phishing campaigns
KNOWN_MALICIOUS_DOMAINS = {
    "malware-traffic-analysis.net": {"category": "Research/ThreatSample", "confidence": 95, "desc": "Known threat intelligence testing domain"},
    "evil-phishing-test.top": {"category": "Phishing", "confidence": 100, "desc": "Known credential harvesting infrastructure"},
    "bank-update-sbi-kyc.xyz": {"category": "Banking Phishing", "confidence": 100, "desc": "Known Indian banking credential stealer"},
    "free-nitro-discord-gift.click": {"category": "Scam/TokenStealer", "confidence": 98, "desc": "Discord token stealer lure"},
    "login-appleid-verify.club": {"category": "Phishing", "confidence": 100, "desc": "Apple ID credential harvesting trap"},
    "metamask-wallet-restore.top": {"category": "Crypto Drainer", "confidence": 100, "desc": "Seed phrase theft phishing site"},
    "whatsapp-gold-download.click": {"category": "Malware/Spyware", "confidence": 95, "desc": "Trojanized APK distribution portal"},
    "netflix-account-suspended.work": {"category": "Phishing", "confidence": 98, "desc": "Payment card skimmer lure"},
    "income-tax-refund-claim.buzz": {"category": "Government Impersonation", "confidence": 100, "desc": "Fake tax refund advance fee scam"},
    "binance-security-verify.top": {"category": "Crypto Phishing", "confidence": 100, "desc": "Binance 2FA & API key harvesting"},
}

# Regex pattern signatures for threat campaigns
CAMPAIGN_PATTERNS = [
    (r'(sbi|hdfc|icici|axis|pnb)[-_]?(kyc|pan|update|verify|blocked)[-_]?[0-9]*\.(xyz|top|club|click|buzz|work)', "Banking Credential Harvester (India)", 95),
    (r'(apple|icloud|appleid)[-_]?(support|verify|findmy|auth)\.(top|xyz|club|work)', "Apple ID Harvesting Kit", 95),
    (r'(meta|facebook|instagram)[-_]?(copyright|appeal|security|help)[-_]?[0-9]*\.(xyz|top|buzz)', "Social Media Account Hijacking Lure", 90),
    (r'(netflix|spotify)[-_]?(billing|renew|payment|reactivate)\.(xyz|top|club)', "Subscription Payment Skimmer", 90),
    (r'(binance|coinbase|metamask|trustwallet)[-_]?(connect|claim|airdrop|sync)\.(xyz|top|click)', "Web3 / Crypto Wallet Drainer Lure", 95),
    (r'(dhl|fedex|usps|indiapost)[-_]?(track|package|customs|delivery)\.(top|xyz|buzz)', "Postal Smishing / Delivery Scam Link", 90),
]

class LocalSignatureProvider:
    """Built-in high-confidence threat signature and pattern engine."""
    
    @staticmethod
    def match_ioc(target: str, target_type: str) -> Optional[Dict[str, Any]]:
        target_lower = target.lower().strip()
        
        # Exact domain match
        for bad_domain, meta in KNOWN_MALICIOUS_DOMAINS.items():
            if target_lower == bad_domain or bad_domain in target_lower:
                return {
                    "matched": True,
                    "threat_category": meta["category"],
                    "confidence": meta["confidence"],
                    "source": "RakshaSutra Local Signature Engine",
                    "details": meta["desc"],
                    "score_impact": 40,
                    "tags": ["Known Malicious IOC", "Active Blacklist", meta["category"]]
                }

        # Pattern match
        for pattern, cat_name, conf in CAMPAIGN_PATTERNS:
            if re.search(pattern, target_lower):
                return {
                    "matched": True,
                    "threat_category": cat_name,
                    "confidence": conf,
                    "source": "RakshaSutra Pattern Signature Engine",
                    "details": f"Matches verified malicious campaign signature: {cat_name}.",
                    "score_impact": 35,
                    "tags": ["Campaign Signature", cat_name]
                }

        return None
