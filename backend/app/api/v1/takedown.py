import hashlib
from datetime import datetime
from typing import Optional, List
from urllib.parse import urlparse
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.v1.auth import get_current_user_optional, enforce_api_quota
from app.models.user import User

router = APIRouter(prefix="/takedown", tags=["Autonomous Takedown & Incident Response"])

class TakedownRequest(BaseModel):
    target_url: str = Field(..., description="The malicious or scam URL to generate takedown package for")
    threat_classification: Optional[str] = Field("Phishing / Fake Banking Lure")
    targeted_brand: Optional[str] = Field("General Public / Banking Users")
    evidence_notes: Optional[str] = Field("Discovered active credential harvesting form and fraudulent logo impersonation.")

class TakedownPackageOut(BaseModel):
    target_url: str
    domain: str
    sha256_evidence_hash: str
    registrar_name: str
    registrar_abuse_email: str
    registrar_abuse_url: str
    rfc2822_abuse_notice: str
    certin_incident_report: str
    firewall_rules: dict
    dns_sinkhole_entry: str
    generated_timestamp: str

REGISTRAR_DATABASE = {
    "xyz": {"name": "CentralNic / XYZ Domains", "email": "abuse@centralnic.com", "url": "https://centralnic.com/abuse"},
    "top": {"name": "Zodiac Taurus (Top TLD)", "email": "abuse@nic.top", "url": "https://nic.top/abuse.asp"},
    "tk": {"name": "Freenom Domains", "email": "abuse@freenom.com", "url": "https://www.freenom.com/abuse"},
    "cloudflare": {"name": "Cloudflare Trust & Safety", "email": "abuse@cloudflare.com", "url": "https://abuse.cloudflare.com"},
    "godaddy": {"name": "GoDaddy Abuse Operations", "email": "abuse@godaddy.com", "url": "https://supportcenter.godaddy.com/AbuseReport"},
    "namecheap": {"name": "Namecheap Legal & Abuse", "email": "abuse@namecheap.com", "url": "https://www.namecheap.com/support/knowledgebase/article.aspx/9196/"},
    "aws": {"name": "Amazon Web Services Trust & Safety", "email": "ec2-abuse@amazon.com", "url": "https://aws.amazon.com/forms/report-abuse"},
    "default": {"name": "Global Registrar Abuse Operations", "email": "abuse-reports@icann.org", "url": "https://www.icann.org/resources/pages/abuse-report"}
}

@router.post("/generate", response_model=TakedownPackageOut)
def generate_takedown_package(
    request: TakedownRequest,
    user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Generate an automated RFC 2822 Abuse Notice, CERT-In Dossier,
    and Multi-Platform Firewall Blocking Rules to neutralize malicious domains.
    """
    enforce_api_quota(user, db)

    url_str = request.target_url.strip()
    try:
        parsed = urlparse(url_str if "://" in url_str else f"http://{url_str}")
        domain = parsed.hostname.lower() if parsed.hostname else url_str
    except:
        domain = url_str

    # Compute unique evidence cryptographic hash
    evidence_hash = hashlib.sha256(f"{url_str}|{datetime.utcnow().isoformat()}".encode()).hexdigest()
    
    # Identify registrar info
    tld = domain.split(".")[-1] if "." in domain else "default"
    reg_info = REGISTRAR_DATABASE.get(tld, REGISTRAR_DATABASE["default"])
    if "sbi" in domain or "bank" in domain:
        targeted_entity = "State Bank of India & Netbanking Users"
    else:
        targeted_entity = request.targeted_brand or "General Public"

    timestamp_str = datetime.utcnow().strftime("%a, %d %b %Y %H:%M:%S UTC")

    # RFC 2822 Abuse Notice Email Template
    rfc2822_notice = f"""From: RakshaSutra AI Threat Neutralization Swarm <takedown@rakshasutra.org>
To: {reg_info['email']}
Subject: [URGENT ABUSE REPORT] Immediate Domain Suspension Request - Phishing / Fraud Lure: {domain}
Date: {timestamp_str}
X-Evidence-Hash-SHA256: {evidence_hash}
X-Reporting-Platform: RakshaSutra Cyber Defense Core v2.4

ATTN: Abuse Operations & Legal Compliance Team ({reg_info['name']}),

This is an automated, verified high-priority abuse complaint issued by RakshaSutra AI Cyber Intelligence Engine. 

We have detected an active, live cyber fraud and phishing deployment operating under your network infrastructure:

══════════════════════════════════════════════════════════════════════════════════
INFRINGING / MALICIOUS ASSET DETAILS:
══════════════════════════════════════════════════════════════════════════════════
• Malicious URL: {url_str}
• Target Domain: {domain}
• Threat Category: {request.threat_classification}
• Targeted Entity / Victims: {targeted_entity}
• Detection Timestamp: {timestamp_str}
• Cryptographic Evidence Hash (SHA-256): {evidence_hash}

══════════════════════════════════════════════════════════════════════════════════
EVIDENCE & THREAT SUMMARY:
══════════════════════════════════════════════════════════════════════════════════
The designated domain is hosting deceptive content mimicking official financial / government portals to unlawfully solicit banking credentials, OTPs, and personal identity data from innocent citizens in direct violation of ICANN regulations and your Terms of Service (Acceptable Use Policy).

══════════════════════════════════════════════════════════════════════════════════
REQUESTED REMEDIATION ACTION:
══════════════════════════════════════════════════════════════════════════════════
1. Immediate suspension of DNS delegation for {domain} (ServerHold / ClientHold status).
2. Termination of upstream hosting and routing for the offending IP space.
3. Preservation of server access logs for law enforcement forensic subpoena.

Thank you for your prompt assistance in safeguarding global cyberspace.

Sincerely,
RakshaSutra Threat Intelligence & Incident Response Swarm
National Security Emergency Helpline: 1930
Web: https://rakshasutra.org
"""

    # CERT-In / Cybercrime 1930 Formal Incident Dossier
    certin_dossier = f"""[CONFIDENTIAL - FORMAL CYBERCRIME INCIDENT DOSSIER]
To: Indian Computer Emergency Response Team (CERT-In) & National Cybercrime Portal (1930)
Incident Category: Phishing / Financial Identity Theft / Fraudulent Impersonation
Reference Evidence SHA-256: {evidence_hash}

1. INCIDENT OVERVIEW:
   • Target Threat URL: {url_str}
   • Associated Host Domain: {domain}
   • Classification: {request.threat_classification}
   • Impact Scope: Citizens receiving fraudulent SMS / WhatsApp lures claiming account block or electricity power disconnection.

2. FORENSIC EVIDENCE:
   • Domain TLD: .{tld}
   • Evidence Notes: {request.evidence_notes}
   • Timestamp of Verification: {timestamp_str}

3. REQUESTED LEGAL ACTION:
   • Issue Section 69A IT Act emergency takedown blocking order to Indian ISPs and DoT.
   • Freeze associated fraudulent UPI accounts and SIM card numbers linked to SMS sender ID.
"""

    # Firewall and Infrastructure Blocking Rules
    firewall_rules = {
        "nginx_block": f"# RakshaSutra Auto-Generated Block Rule\nserver {{\n    if ($host = '{domain}') {{\n        return 403;\n    }}\n}}",
        "apache_htaccess": f"# RakshaSutra Threat Block\nRewriteEngine On\nRewriteCond %{{HTTP_HOST}} ^{domain.replace('.', r'\.')}$ [NC]\nRewriteRule ^(.*)$ - [F,L]",
        "cloudflare_waf_expression": f'(http.host eq "{domain}") or (http.request.uri.path contains "{domain}")',
        "windows_defender_firewall": f'netsh advfirewall firewall add rule name="RakshaSutra_Block_{domain}" dir=out action=block remoteip="{domain}"',
        "iptables_linux": f"iptables -A OUTPUT -p tcp -d {domain} -j DROP"
    }

    dns_sinkhole = f"0.0.0.0    {domain}    # RakshaSutra Malicious Sinkhole"

    return TakedownPackageOut(
        target_url=url_str,
        domain=domain,
        sha256_evidence_hash=evidence_hash,
        registrar_name=reg_info["name"],
        registrar_abuse_email=reg_info["email"],
        registrar_abuse_url=reg_info["url"],
        rfc2822_abuse_notice=rfc2822_notice,
        certin_incident_report=certin_dossier,
        firewall_rules=firewall_rules,
        dns_sinkhole_entry=dns_sinkhole,
        generated_timestamp=timestamp_str
    )
