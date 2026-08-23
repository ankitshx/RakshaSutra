import re
from typing import Dict, List, Any, Optional
from app.models.scan import Scan
from app.models.investigation import Investigation, EvidenceItem
from app.schemas.ai import IncidentPlaybookOut

# Built-in Incident Response Playbooks
INCIDENT_PLAYBOOKS = {
    "clicked_phishing_link": IncidentPlaybookOut(
        id="phishing_click_response",
        title="Immediate Playbook: Clicked a Suspicious Phishing Link",
        description="Follow these rapid containment steps if you clicked a suspicious link or landed on a fake portal.",
        severity="HIGH",
        immediate_steps=[
            "1. Disconnect network immediately (Turn off Wi-Fi / Cellular Data) if any file began downloading.",
            "2. DO NOT enter any credentials, OTPs, or credit card details on the opened page.",
            "3. Close the browser tab and clear recent browser cookies/cache for that session.",
            "4. If you entered a password, immediately navigate to the real website from another clean device and change your password.",
            "5. Enable Multi-Factor Authentication (MFA / 2FA) using an Authenticator app (not SMS if possible)."
        ],
        secondary_steps=[
            "1. Run a full antivirus/antimalware scan on your device.",
            "2. Check active login sessions in your account security settings and terminate all unknown sessions.",
            "3. Monitor your bank/card statements for unauthorized transactions."
        ],
        reporting_authorities=[
            {"name": "National Cyber Crime Portal (India)", "contact": "https://cybercrime.gov.in / Helpline: 1930"},
            {"name": "US Cybersecurity & CISA", "contact": "https://reportfraud.ftc.gov / https://www.cisa.gov"},
            {"name": "UK Action Fraud", "contact": "https://www.actionfraud.police.uk"}
        ]
    ),
    "shared_otp_or_banking": IncidentPlaybookOut(
        id="financial_fraud_response",
        title="Emergency Playbook: Shared OTP or Bank Details with Scammer",
        description="Urgent steps for financial account compromise or unauthorized UPI transactions.",
        severity="CRITICAL",
        immediate_steps=[
            "1. IMMEDIATELY call your bank's 24/7 fraud helpline and ask to FREEZE/LOCK your account, cards, and UPI ID.",
            "2. In India, immediately call the National Cyber Fraud Helpline at 1930 to report the transaction within the 'Golden Hour'.",
            "3. Change your Internet Banking password, UPI PIN, and ATM PIN immediately.",
            "4. Take screenshots of the fraudulent SMS, WhatsApp chat, and transaction reference numbers (UTR)."
        ],
        secondary_steps=[
            "1. File an official complaint on https://cybercrime.gov.in with transaction receipts.",
            "2. Visit your home branch with the complaint acknowledgment and request a chargeback / fraud investigation."
        ],
        reporting_authorities=[
            {"name": "Citizen Financial Cyber Fraud Reporting System", "contact": "Toll-Free Helpline: 1930"},
            {"name": "RBI Ombudsman", "contact": "https://cms.rbi.org.in"}
        ]
    ),
    "whatsapp_or_social_hack": IncidentPlaybookOut(
        id="account_takeover_response",
        title="Playbook: WhatsApp or Social Media Account Takeover",
        description="Steps to recover compromised messaging and social profiles.",
        severity="HIGH",
        immediate_steps=[
            "1. Re-register WhatsApp with your phone number and enter the 6-digit SMS code to kick out the intruder.",
            "2. Immediately set up Two-Step Verification with a secret 6-digit PIN and recovery email in WhatsApp Settings.",
            "3. Notify your close contacts via alternate channels that your account was compromised and warn them not to send money.",
            "4. Check linked devices (WhatsApp Web) in settings and click 'Log out from all devices'."
        ],
        secondary_steps=[
            "1. Check recovery email and phone numbers in your email accounts (Gmail, Outlook).",
            "2. Generate recovery codes for Google/Apple accounts."
        ],
        reporting_authorities=[
            {"name": "WhatsApp Official Security Support", "contact": "support@whatsapp.com"},
            {"name": "National Cybercrime Portal", "contact": "https://cybercrime.gov.in"}
        ]
    )
}

def generate_ai_security_response(
    query: str,
    context_scan: Optional[Scan] = None,
    context_investigation: Optional[Investigation] = None,
    user_role: str = "normal_user", # normal_user, student, developer, business, soc_analyst
    history: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    """
    Generate grounded, explainable cybersecurity guidance.
    Uses structured investigation evidence strictly. Never invents facts.
    """
    q_lower = query.lower()

    # Match emergency keywords
    if "clicked" in q_lower or "phishing" in q_lower or "fake link" in q_lower:
        pb = INCIDENT_PLAYBOOKS["clicked_phishing_link"]
        return {
            "response": (
                f"🚨 **Emergency Phishing Guidance**: Follow these rapid containment steps immediately:\n\n"
                + "\n".join(pb.immediate_steps)
                + "\n\n**Secondary Actions:**\n"
                + "\n".join(pb.secondary_steps)
            ),
            "suggested_questions": [
                "What if I entered my password on the page?",
                "How do I scan my phone for malware?",
                "How do I enable 2-Factor Authentication?"
            ],
            "related_playbook": pb,
            "references": ["OWASP Anti-Phishing Guide", "NIST SP 800-61 Rev 2"]
        }

    if "otp" in q_lower or "bank" in q_lower or "money deducted" in q_lower or "fraud" in q_lower or "scam" in q_lower:
        pb = INCIDENT_PLAYBOOKS["shared_otp_or_banking"]
        return {
            "response": (
                f"🚨 **Urgent Financial Fraud Action Plan**:\n\n"
                + "\n".join(pb.immediate_steps)
                + "\n\n📞 **Emergency Hotline**: Dial **1930** immediately (National Cyber Financial Fraud Reporting System)."
            ),
            "suggested_questions": [
                "What is the Golden Hour in cyber fraud?",
                "How do I file a formal complaint on cybercrime.gov.in?",
                "Will my bank refund the money?"
            ],
            "related_playbook": pb,
            "references": ["Citizen Financial Cyber Fraud Reporting System (1930)", "RBI Circular on Customer Protection"]
        }

    # If context investigation or scan is provided, explain it strictly based on findings
    if context_investigation:
        verdict = context_investigation.risk_level
        risk_score = context_investigation.risk_score
        target = context_investigation.normalized_target or context_investigation.target
        explanation = context_investigation.plain_explanation or "Analysis completed."

        if user_role == "student":
            role_explanation = (
                f"🎓 **Educational Cyber Breakdown** for `{target}`:\n\n"
                f"- **Verdict:** {verdict} (Risk Score: {risk_score}/100, Confidence: {context_investigation.confidence_score}%)\n"
                f"- **Core Concept:** Attackers exploit human deception (typosquatting, urgency lures) to bypass perimeter defenses.\n"
                f"- **Evidence Found:** {explanation}\n\n"
                f"**Key Learning:** Always inspect the actual Top-Level Domain (TLD) and TLS Certificate Issuer rather than trusting visual logos."
            )
        elif user_role == "developer":
            sec_headers = context_investigation.raw_telemetry.get("http", {}).get("security_headers", {})
            role_explanation = (
                f"💻 **Developer & Security Engineering Report** for `{target}`:\n\n"
                f"- **Verdict:** {verdict} (Risk: {risk_score}/100)\n"
                f"- **Transport Security:** {context_investigation.raw_telemetry.get('tls', {}).get('protocol_version', 'N/A')}\n"
                f"- **Security Headers Present:** {', '.join([k for k, v in sec_headers.items() if v]) or 'None'}\n"
                f"- **Technical Rationale:** {explanation}\n\n"
                f"**Recommendation:** Ensure Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), and X-Frame-Options: DENY are configured."
            )
        elif user_role == "business" or user_role == "soc_analyst":
            role_explanation = (
                f"🛡️ **SOC & Incident Response Assessment** for `{target}`:\n\n"
                f"- **Classification:** {verdict} | Risk: {risk_score}/100 | Confidence: {context_investigation.confidence_score}%\n"
                f"- **Investigation ID:** `{context_investigation.id}`\n"
                f"- **Evidence Summary:** {explanation}\n"
                f"- **Recommended SOC Action:** Blacklist domain on perimeter firewall/EDR agents and distribute RFC 2822 notice to upstream registrar."
            )
        else: # normal_user
            role_explanation = (
                f"🔍 **Security Analysis for {target}**:\n\n"
                f"**Result:** {verdict} ({'Dangerous link' if verdict == 'DANGER' else ('Caution needed' if verdict == 'CAUTION' else 'Appears clean')})\n\n"
                f"{explanation}\n\n"
                f"**What you should do:**\n"
                + "\n".join([f"• {rec}" for rec in (context_investigation.recommendations or ["Stay vigilant when clicking links."])])
            )

        return {
            "response": role_explanation,
            "suggested_questions": [
                "How do I generate an incident report dossier?",
                "Can you monitor this target for changes?",
                "Explain the DNS and TLS evidence."
            ],
            "related_playbook": None,
            "references": ["RakshaSutra Evidence Engine v1.0", f"Investigation ID: {context_investigation.id}"]
        }

    # Default conversational response
    return {
        "response": (
            "👋 Hi, I am **Raksha AI Security Copilot**.\n\n"
            "I can help you:\n"
            "1. **Explain any investigation findings** in simple language.\n"
            "2. **Guide immediate incident response** if you clicked a suspicious link or shared an OTP.\n"
            "3. **Audit your security posture** and recommend hardening steps for your accounts."
        ),
        "suggested_questions": [
            "What should I do if I clicked a fake banking link?",
            "How do I check if my email is in a dark web breach?",
            "How does RakshaSutra calculate Risk vs Confidence?"
        ],
        "related_playbook": None,
        "references": ["RakshaSutra Knowledge Base"]
    }
