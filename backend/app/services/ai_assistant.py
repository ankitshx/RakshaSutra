import re
from typing import Dict, List, Any, Optional
from app.models.scan import Scan
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
            "1. Check if your email associated with the social accounts was also breached.",
            "2. Review connected apps and revoke permissions for any unrecognized integrations."
        ],
        reporting_authorities=[
            {"name": "WhatsApp Official Support", "contact": "support@whatsapp.com"},
            {"name": "Meta Security Center", "contact": "https://facebook.com/hacked"}
        ]
    )
}

# Domain Knowledge Base for General Cyber Inquiries
KNOWLEDGE_RESPONSES = [
    (
        r"(recognize|identify|spot|detect).*(phishing|scam|fake)",
        "### How to Spot a Phishing Attempt:\n\n"
        "1. **Mismatched or Deceptive Domain**: Check the spelling of the domain name carefully (e.g. `sbi-kyc.top` instead of `onlinesbi.sbi`).\n"
        "2. **Artificial Urgency & Fear**: Scammers use phrases like *'Account will be suspended in 24 hours'* or *'Electricity cut tonight'*.\n"
        "3. **Requests for Sensitive Information**: Legitimate organizations never ask for your **password, OTP, PIN, or CVV** via SMS, email, or chat.\n"
        "4. **Generic Greetings & Odd Grammar**: Messages addressing you as *'Dear Customer'* with irregular punctuation or awkward phrasing.\n"
        "5. **Suspicious Attachments / Links**: Links pointing to URL shorteners or executable downloads (`.apk`, `.exe`, `.scr`).\n\n"
        "💡 *Rule of Thumb:* If in doubt, never click. Navigate to the service directly by typing the official address in your browser."
    ),
    (
        r"(what is|explain).*(mfa|2fa|two factor|multi factor)",
        "### What is Multi-Factor Authentication (MFA/2FA)?\n\n"
        "MFA is a security mechanism that requires you to provide **two or more distinct verification factors** before accessing your account:\n\n"
        "- **Something you know**: Password or PIN\n"
        "- **Something you have**: Authenticator app (Google Authenticator, Microsoft Authenticator), Hardware security key (YubiKey), or SMS code\n"
        "- **Something you are**: Fingerprint, Face ID\n\n"
        "🛡️ **Why MFA Matters:** Even if a phishing scam steals your password, the attacker cannot breach your account without your physical 2FA token. Authenticator apps and hardware keys are significantly more secure than SMS codes, which are vulnerable to SIM swapping."
    ),
    (
        r"(upi|payment|qr code|refund).*(scam|fraud|money)",
        "### How UPI & QR Code Scams Operate:\n\n"
        "1. **Golden Rule of UPI**: You **NEVER enter your UPI PIN to RECEIVE money**. A UPI PIN is only required to *deduct* money from your account.\n"
        "2. **QR Code Trap**: Scammers send a QR code claiming *'Scan this QR code to receive ₹10,000 refund/cashback'*. Scanning and entering your PIN instantly debits your bank balance!\n"
        "3. **Test Payment Trick**: *'Send ₹1 to verify your account and I will return the full prize'*. Once you transfer ₹1, they request larger amounts or trigger a collect request.\n"
        "4. **OLX / Marketplace Scams**: Fake buyers posing as military personnel or army officers sending collect requests or fake deposit screenshots.\n\n"
        "🚨 If you are ever asked to enter your PIN to claim a prize or refund, **cancel the transaction immediately**."
    ),
    (
        r"(password|secure password|passphrase|password manager)",
        "### Password Security Best Practices:\n\n"
        "1. **Use Long Passphrases**: 14+ characters combining 3 to 4 random unrelated words (e.g. `Velvet#Falcon92!Sunset`) are vastly stronger than short complex passwords.\n"
        "2. **Never Reuse Passwords**: If one website suffers a data breach, credential-stuffing bots will automatically test that same password on your email, banking, and social accounts.\n"
        "3. **Adopt a Dedicated Password Manager**: Tools like Bitwarden, 1Password, or KeePass generate and store unique, high-entropy passwords for all your logins.\n"
        "4. **Pair with Authenticator 2FA**: Ensure your password manager master vault is protected with a physical key or app-based 2FA."
    )
]

def generate_ai_security_response(
    query: str, 
    context_scan: Optional[Scan] = None,
    history: List[Dict[str, str]] = []
) -> Dict[str, Any]:
    """
    Generate an expert defensive cybersecurity response with incident guidance and suggestions.
    """
    q_lower = query.lower()

    # 1. Check for emergency trigger / incident matching
    matched_playbook = None
    if any(term in q_lower for term in ["clicked", "opened link", "visited fake", "entered details", "fell for"]):
        matched_playbook = INCIDENT_PLAYBOOKS["clicked_phishing_link"]
    elif any(term in q_lower for term in ["otp", "pin", "shared otp", "sent money", "bank fraud", "cheated", "lost money", "upi fraud"]):
        matched_playbook = INCIDENT_PLAYBOOKS["shared_otp_or_banking"]
    elif any(term in q_lower for term in ["whatsapp hacked", "instagram hacked", "facebook hacked", "telegram hack", "account takeover"]):
        matched_playbook = INCIDENT_PLAYBOOKS["whatsapp_or_social_hack"]

    # 2. Check if user is asking about an active scan result in context
    if context_scan and any(w in q_lower for w in ["this scan", "the report", "why is it dangerous", "explain this", "this link"]):
        response_text = (
            f"### Analysis of Target: `{context_scan.target_display or context_scan.target}`\n\n"
            f"**Assigned Risk Score:** `{context_scan.risk_score}/100` ({context_scan.risk_level} RISK)\n\n"
            f"**Findings Breakdown:**\n"
            f"{context_scan.summary}\n\n"
            f"**Why this is dangerous:**\n"
            f"When a target is rated {context_scan.risk_level}, it exhibits indicators like deceptive lookalike characters, suspicious TLDs, or matches on active threat blacklists. Attackers use these techniques to bypass human suspicion and steal confidential data.\n\n"
            f"**Recommended Action:**\n"
            f"{context_scan.recommendation}"
        )
        return {
            "response": response_text,
            "suggested_questions": [
                "What should I do if I already clicked it?",
                "How do attackers create lookalike domains?",
                "How does RakshaSutra calculate this risk score?"
            ],
            "related_playbook": matched_playbook,
            "references": ["RakshaSutra Threat Telemetry", "NIST SP 800-63B Guidelines"]
        }

    # 3. Check domain knowledge triggers
    for pat, text in KNOWLEDGE_RESPONSES:
        if re.search(pat, q_lower):
            return {
                "response": text,
                "suggested_questions": [
                    "What should I do after clicking a suspicious link?",
                    "How do UPI and QR code scams work?",
                    "What is MFA and why is it important?",
                    "How do attackers spoof banking websites?"
                ],
                "related_playbook": matched_playbook,
                "references": ["CERT-In Security Advisory", "CISA Security Tips", "OWASP Awareness Guide"]
            }

    # 4. If an incident playbook triggered, emphasize it directly
    if matched_playbook:
        response_text = (
            f"### 🚨 {matched_playbook.title}\n\n"
            f"{matched_playbook.description}\n\n"
            f"#### Immediate Action Steps:\n" +
            "\n".join([f"- {step}" for step in matched_playbook.immediate_steps]) +
            "\n\n#### Follow-up Protective Measures:\n" +
            "\n".join([f"- {step}" for step in matched_playbook.secondary_steps])
        )
        return {
            "response": response_text,
            "suggested_questions": [
                "Where can I report this cyber incident?",
                "How can I secure my other accounts?",
                "What is the Golden Hour in financial fraud?"
            ],
            "related_playbook": matched_playbook,
            "references": ["National Cyber Crime Portal", "RBI Consumer Protection Guidelines"]
        }

    # 5. Default high-quality defensive assistant response
    default_response = (
        "### Raksha AI Defensive Guidance\n\n"
        f"Thank you for consulting Raksha AI regarding: *\"{query}\"*\n\n"
        "As your defensive security copilot, here are essential principles to keep in mind:\n\n"
        "- **Verify Identity Out-of-Band**: Whenever you receive an unsolicited message requesting actions, verify with the organization using their official, known contact details.\n"
        "- **Zero-Trust for Inbound Links**: Treat all short links and unsolicited alerts with skepticism before entering credentials.\n"
        "- **Protect Authentication Tokens**: Never share One-Time Passcodes (OTPs), PINs, or authenticator prompt approvals.\n\n"
        "Feel free to ask me to analyze a specific message, explain a threat vector, or guide you through an incident response checklist."
    )

    return {
        "response": default_response,
        "suggested_questions": [
            "How do I recognize a phishing message?",
            "What should I do if I entered my password on a fake site?",
            "How do scammers trick people with UPI QR codes?",
            "What are the best practices for strong passwords?"
        ],
        "related_playbook": None,
        "references": ["RakshaSutra Cybersecurity Knowledge Base"]
    }
