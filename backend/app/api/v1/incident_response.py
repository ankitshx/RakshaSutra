"""
RakshaSutra Incident Response Assistant
Generates evidence summaries, cryptographic SHA-256 digests, RFC 2822 abuse drafts,
and official CERT-In / 1930 Cyber Fraud reporting guidance.
Assisted workflow — does NOT automatically attack or disrupt external infrastructure.
"""

import hashlib
from datetime import datetime, timezone
from typing import Optional, List
from urllib.parse import urlparse
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.auth import get_current_user_optional, enforce_api_quota
from app.models.user import User

router = APIRouter(prefix="/incident-response", tags=["Incident Response Assistant"])

class IncidentReportRequest(BaseModel):
    target_url: str = Field(..., description="The suspicious or fraudulent URL to document")
    threat_classification: Optional[str] = Field("Phishing / Fake Banking Lure")
    targeted_brand: Optional[str] = Field("General Public / Banking Users")
    evidence_notes: Optional[str] = Field("Discovered active credential harvesting form and fraudulent logo impersonation.")

class IncidentDossierOut(BaseModel):
    target_url: str
    domain: str
    sha256_evidence_hash: str
    registrar_name: str
    registrar_abuse_email: str
    registrar_abuse_url: str
    rfc2822_abuse_notice: str
    certin_incident_report: str
    cybercrime_1930_guidance: str
    firewall_rules: dict
    dns_sinkhole_entry: str
    generated_timestamp: str
    notice: str = "This dossier is prepared for manual reporting to authorized registrars and law enforcement. RakshaSutra does not automate destructive actions."

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

@router.post("/generate", response_model=IncidentDossierOut)
def generate_incident_dossier(
    request: IncidentReportRequest,
    user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Generate an assisted Incident Response Dossier containing RFC 2822 abuse notice,
    CERT-In reporting template, and defensive firewall rules.
    """
    enforce_api_quota(user, db)

    url_str = request.target_url.strip()
    try:
        parsed = urlparse(url_str if "://" in url_str else f"http://{url_str}")
        domain = parsed.hostname.lower() if parsed.hostname else url_str
    except Exception:
        domain = url_str

    # Derive registrar info
    tld = domain.split(".")[-1] if "." in domain else ""
    registrar = REGISTRAR_DATABASE.get(tld, REGISTRAR_DATABASE["default"])
    if "cloudflare" in domain:
        registrar = REGISTRAR_DATABASE["cloudflare"]
    elif "aws" in domain or "amazonaws" in domain:
        registrar = REGISTRAR_DATABASE["aws"]

    evidence_hash = hashlib.sha256(f"{url_str}|{domain}|{datetime.now(timezone.utc).strftime('%Y-%m-%d')}".encode()).hexdigest()
    now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    # RFC 2822 Abuse Letter
    rfc_notice = f"""To: {registrar['email']}
Subject: URGENT ABUSE COMPLAINT: Active Fraudulent / Phishing Host [{domain}]
Date: {now_utc}
Message-ID: <incident-{evidence_hash[:16]}@rakshasutra.org>
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8

Dear Trust & Safety / Abuse Team at {registrar['name']},

We are submitting formal evidence regarding malicious infrastructure hosted on your network:

- Malicious Target: {url_str}
- Fully Qualified Domain: {domain}
- Threat Classification: {request.threat_classification}
- Impersonated Entity: {request.targeted_brand}
- Cryptographic SHA-256 Evidence Digest: {evidence_hash}
- Discovery Timestamp: {now_utc}

OBSERVED TECHNICAL FINDINGS:
{request.evidence_notes}

REQUESTED ACTION:
In accordance with international anti-abuse standards and your Acceptable Use Policy, we request immediate suspension and de-resolution of the offending host to prevent further harm to citizens and consumers.

Generated via RakshaSutra Incident Response Assistant.
Evidence Archive ID: RS-INC-{evidence_hash[:8].upper()}
"""

    # CERT-In Incident Report
    certin_report = f"""FORMAL CYBER INCIDENT REPORT FOR CERT-In & LAW ENFORCEMENT
----------------------------------------------------------------------
Incident Reference ID : RS-CERTIN-{evidence_hash[:10].upper()}
Date of Observation   : {now_utc}
Classification        : {request.threat_classification}
Impacted Brand/Public : {request.targeted_brand}

1. TARGET IDENTIFIERS:
   - URL    : {url_str}
   - Domain : {domain}
   - SHA256 : {evidence_hash}

2. TECHNICAL OBSERVATIONS:
   - {request.evidence_notes}
   - Domain is actively weaponized for credential harvesting or scam lure distribution.

3. RECOMMENDED CITIZEN ACTIONS:
   - File formal complaint on https://cybercrime.gov.in
   - If financial loss occurred, call the National Cyber Helpline 1930 immediately.
----------------------------------------------------------------------
"""

    guidance_1930 = (
        "If you or someone in your organization entered banking credentials or transferred money:\n"
        "1. Immediately call the National Cyber Fraud Helpline: Dial 1930 (Toll-Free in India).\n"
        "2. Report the transaction reference ID within the 'Golden Hour' to freeze fraudulent bank transfers.\n"
        "3. Register an official cyber fraud complaint at https://cybercrime.gov.in."
    )

    firewall_rules = {
        "nginx_block": f"deny {domain};",
        "apache_block": f"Require not host {domain}",
        "iptables": f"iptables -A OUTPUT -d {domain} -j REJECT",
        "cloudflare_waf": f"(http.host eq \"{domain}\") -> Block",
        "windows_hosts": f"0.0.0.0 {domain}"
    }

    sinkhole_entry = f"local-data: \"{domain} A 0.0.0.0\""

    return IncidentDossierOut(
        target_url=url_str,
        domain=domain,
        sha256_evidence_hash=evidence_hash,
        registrar_name=registrar["name"],
        registrar_abuse_email=registrar["email"],
        registrar_abuse_url=registrar["url"],
        rfc2822_abuse_notice=rfc_notice,
        certin_incident_report=certin_report,
        cybercrime_1930_guidance=guidance_1930,
        firewall_rules=firewall_rules,
        dns_sinkhole_entry=sinkhole_entry,
        generated_timestamp=now_utc
    )
