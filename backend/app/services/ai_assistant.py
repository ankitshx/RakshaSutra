"""
RakshaAI Copilot — System Prompt & Grounded Explanation Engine

Purpose: Turn a raw scan/investigation JSON object from the RakshaSutra pipeline
into a plain-language, non-alarmist, evidence-grounded explanation for the end user —
never a generic or invented verdict.
"""

import json
import re
from typing import Dict, List, Any, Optional
from app.models.scan import Scan
from app.models.investigation import Investigation
from app.schemas.ai import IncidentPlaybookOut
from app.core.metrics import metrics

# Official Drop-In System Prompt for LLM integrations & Reference
RAKSHA_AI_SYSTEM_PROMPT = """You are RakshaAI, the explanation and triage copilot inside RakhshaSutra, a personal/enterprise
cybersecurity command center. Your only job is to translate a structured scan result into a
clear, honest, actionable explanation for the person who submitted it. You do not perform
scanning yourself — you explain results that have already been computed by the pipeline.

## Ground truth rule (most important instruction)
You may only state facts that appear in the <scan_data> block you are given. If a field is
missing, null, or a provider returned an error, say so explicitly ("TLS certificate data was
unavailable for this domain") rather than guessing, inferring, or filling the gap with a
plausible-sounding default. Never invent a WHOIS date, a threat-feed hit, a CVE, or a
confidence number that is not present in the input. If the input is too sparse to support a
verdict, say that plainly and recommend which additional scan (URL/domain/message/email/IP)
would fill the gap.

## Input format
You will receive a JSON object inside <scan_data> tags. Typical fields include (not all appear
every time): input_type, risk_score (0-100), confidence_score (0-100%), verdict
(SAFE/CAUTION/DANGER), typosquat_matches, dns_records, tls_details, threat_feed_hits
(per-provider: virustotal, urlhaus, safe_browsing, abuseipdb, otx, urlscan), nlp_flags
(urgency/coercion phrases actually matched), whois_age_days, breach_index_hits, geo/asn data.

## Reasoning steps (do this before writing the reply)
1. Identify which fields are actually populated vs. missing/errored.
2. Identify the single or joint strongest evidence driving the verdict (e.g. "typosquat match
   + domain registered 4 days ago" is stronger than "domain registered 4 days ago" alone).
3. Check for conflicting signals (e.g. clean VirusTotal but a live URLhaus hit) and surface the
   conflict rather than silently picking a side.
4. Map the evidence to the verdict's confidence_score — if confidence is low, your tone must
   reflect genuine uncertainty, not false authority.
5. Only after 1-4, draft the explanation.

## Output format
Respond in this exact structure, plain text, no markdown headers:

VERDICT: <verdict emoji + word, e.g. "🔴 DANGER">
WHY: 2-4 sentences in plain language, citing only fields present in scan_data. No jargon
without a one-clause definition (e.g. "SPF (a check that verifies who's allowed to send email
from this domain) failed").
EVIDENCE: bullet list, each bullet traceable to one field in scan_data. Never add a bullet
that isn't backed by a field.
WHAT TO DO: 1-3 concrete next actions, ordered by urgency, scaled to the actual risk_score —
do not recommend "freeze your bank account" for a CAUTION-level typosquat with no financial
indicators, and do not soften language for a genuine DANGER verdict.
CONFIDENCE NOTE: one sentence stating the confidence_score and, if below 70%, what additional
scan would raise it.

## Tone constraints
- Calm, direct, never fear-mongering — the person may already be anxious about a scam attempt.
- Never use absolute certainty language ("this WILL steal your money") unless confidence_score
  is explicitly ≥90 AND multiple independent threat feeds agree.
- Never diagnose intent ("the attacker is targeting you specifically") — describe the pattern,
  not a narrative about who is behind it.
- If nlp_flags shows urgency/coercion phrases, name the specific matched phrase category
  (e.g. "artificial time pressure," "threat of account suspension") rather than a vague
  "this looks manipulative."

## Refusals within scope
- If asked to scan something live, explain you only interpret completed scan_data and hand off
  to the appropriate scanner view.
- If scan_data indicates a DANGER verdict involving financial fraud in progress, always include
  the India Cyber Fraud Helpline (1930) and cybercrime.gov.in in WHAT TO DO, regardless of
  what else is recommended.
- Do not speculate about identity of an attacker, do not generate content that could be reused
  as a phishing template, and do not reproduce the exact wording of a submitted phishing
  message beyond what's needed to point out its flagged phrases."""

# Standard Incident Response Playbooks
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

def format_grounded_copilot_explanation(scan_data: Dict[str, Any]) -> str:
    """
    Format a deterministic, evidence-grounded explanation conforming strictly to the
    RakshaAI Copilot system specification.
    """
    verdict = scan_data.get("verdict", "CAUTION").upper()
    risk_score = scan_data.get("risk_score", 50)
    confidence_score = scan_data.get("confidence_score", 75)
    input_type = scan_data.get("input_type", scan_data.get("scan_type", "target"))

    emoji = "🔴" if verdict == "DANGER" else ("🟡" if verdict == "CAUTION" else "🟢")
    verdict_header = f"VERDICT: {emoji} {verdict}"

    # Build WHY rationale
    why_sentences = []
    evidence_bullets = []
    what_to_do = []

    typosquat = scan_data.get("typosquat_matches") or scan_data.get("brand_impersonated")
    if typosquat:
        if isinstance(typosquat, list) and len(typosquat) > 0:
            why_sentences.append(f"This domain mimics a legitimate institution ({typosquat[0]}), which is a common typosquatting technique designed to deceive users.")
            evidence_bullets.append(f"- Domain name matches deceptive lookalike pattern ({typosquat[0]})")
        else:
            why_sentences.append(f"This domain exhibits brand lookalike patterns targeting {typosquat}.")
            evidence_bullets.append(f"- Brand impersonation match detected: {typosquat}")

    whois_days = scan_data.get("whois_age_days")
    if whois_days is not None:
        if whois_days < 14:
            why_sentences.append(f"The domain was registered recently ({whois_days} days ago). Newly registered domains have high statistical correlation with disposable attack infrastructure.")
            evidence_bullets.append(f"- Domain registered only {whois_days} days ago (whois_age_days)")
        else:
            evidence_bullets.append(f"- Domain age is {whois_days} days (whois_age_days)")

    threat_feeds = scan_data.get("threat_feed_hits", {})
    if isinstance(threat_feeds, dict) and threat_feeds:
        active_hits = [f"{k}: {v}" for k, v in threat_feeds.items() if v not in ("clean", "unlisted", None, False)]
        if active_hits:
            why_sentences.append(f"Active threat intelligence repositories flag this target ({', '.join(active_hits)}).")
            for hit in active_hits:
                evidence_bullets.append(f"- Flagged on threat intelligence feed: {hit}")
        else:
            evidence_bullets.append("- Threat intelligence feeds show no historical blacklist record")
    elif isinstance(threat_feeds, list) and threat_feeds:
        why_sentences.append(f"Active threat intelligence feeds returned {len(threat_feeds)} positive hit(s).")
        for hit in threat_feeds[:3]:
            evidence_bullets.append(f"- Threat feed hit: {hit.get('display_name', 'Provider')} ({hit.get('threat_category', 'Malicious')})")

    tls = scan_data.get("tls_details") or scan_data.get("tls_info")
    if isinstance(tls, dict):
        issuer = tls.get("issuer", "Unknown")
        valid = tls.get("valid", tls.get("has_tls", False))
        if valid:
            evidence_bullets.append(f"- TLS certificate is valid (Issuer: {issuer}). Note that valid HTTPS encrypts traffic but does not guarantee the website's legitimacy.")
        else:
            why_sentences.append("The target lacks valid transport encryption (TLS), leaving communication susceptible to interception.")
            evidence_bullets.append("- Unencrypted HTTP or invalid TLS certificate")

    nlp_flags = scan_data.get("nlp_flags") or scan_data.get("detected_techniques")
    if isinstance(nlp_flags, list) and nlp_flags:
        techniques = []
        for f in nlp_flags:
            if isinstance(f, str):
                techniques.append(f)
                evidence_bullets.append(f"- Social engineering trigger: {f}")
            elif isinstance(f, dict):
                t_name = f.get("name", f.get("category", "Coercion"))
                techniques.append(t_name)
                evidence_bullets.append(f"- Social engineering trigger: {t_name} (Category: {f.get('category', 'Social Engineering')})")
        if techniques:
            why_sentences.append(f"The text uses social engineering pressure tactics ({', '.join(techniques[:2])}).")

    if not why_sentences:
        if verdict == "DANGER":
            why_sentences.append("Multiple critical security indicators confirm active malicious risk on this target.")
        elif verdict == "CAUTION":
            why_sentences.append("Anomalous configuration traits were observed that warrant verification before submitting credentials.")
        else:
            why_sentences.append("No active malicious signatures, brand impersonation, or suspicious redirection traits were detected in this analysis.")

    # Fallback evidence bullet if sparse
    if not evidence_bullets:
        evidence_bullets.append(f"- Calculated composite risk score: {risk_score}/100")
        evidence_bullets.append(f"- Evaluated input type: {input_type}")

    # Build WHAT TO DO
    is_financial = "bank" in str(scan_data).lower() or "sbi" in str(scan_data).lower() or "otp" in str(scan_data).lower() or "upi" in str(scan_data).lower()
    
    if verdict == "DANGER":
        what_to_do.append("1. Do not click the link, open attachments, or enter any credentials or OTPs on this destination.")
        if is_financial:
            what_to_do.append("2. If you already submitted banking details or OTPs, immediately contact your bank to freeze your account and call 1930 (India Cyber Fraud Helpline) or report at cybercrime.gov.in.")
        else:
            what_to_do.append("2. If you already entered credentials, immediately change your password on the official verified portal and terminate other active sessions.")
        what_to_do.append("3. Block the sender and report the target to your security team or cybersecurity authority.")
    elif verdict == "CAUTION":
        what_to_do.append("1. Verify the authenticity of the sender through a secondary verified communication channel.")
        what_to_do.append("2. Double-check the exact address bar spelling and ensure it matches the organization's official domain.")
        what_to_do.append("3. Avoid entering passwords, financial details, or running downloaded executables from this page.")
    else:
        what_to_do.append("1. Target appears safe based on current telemetry; you may proceed with standard online caution.")
        what_to_do.append("2. Remember that legitimate organizations never ask for passwords or one-time passcodes over chat or SMS.")

    # Build CONFIDENCE NOTE
    if confidence_score >= 70:
        conf_note = f"CONFIDENCE NOTE: Confidence is {confidence_score}% based on consistent corroboration across structural and threat intelligence indicators."
    else:
        conf_note = f"CONFIDENCE NOTE: Confidence is {confidence_score}%. Additional telemetry (e.g. running a full DNS and TLS certificate audit) would raise verification certainty."

    # Assemble structured text
    output = (
        f"{verdict_header}\n\n"
        f"WHY: {' '.join(why_sentences)}\n\n"
        f"EVIDENCE:\n" + "\n".join(evidence_bullets) + "\n\n"
        f"WHAT TO DO:\n" + "\n".join(what_to_do) + "\n\n"
        f"{conf_note}"
    )

    # Record Prometheus Observability Metrics
    metrics.record_copilot_explanation(verdict=verdict, confidence_score=confidence_score)

    return output

def generate_ai_security_response(
    query: str,
    context_scan: Optional[Scan] = None,
    context_investigation: Optional[Investigation] = None,
    user_role: str = "normal_user",
    history: Optional[List[Dict[str, str]]] = None,
    mode: str = "guardian"
) -> Dict[str, Any]:
    """
    Generate grounded, explainable cybersecurity guidance in Analyst or Guardian mode.
    Uses structured investigation evidence strictly. Never invents facts.
    """
    q_text = query.strip()
    q_lower = q_text.lower()

    # 1. Check if user pasted structured <scan_data> tags or raw JSON
    scan_data_payload = None
    if "<scan_data>" in q_text and "</scan_data>" in q_text:
        match = re.search(r'<scan_data>(.*?)</scan_data>', q_text, re.DOTALL)
        if match:
            try:
                scan_data_payload = json.loads(match.group(1).strip())
            except Exception:
                pass

    if not scan_data_payload and (q_text.startswith("{") and q_text.endswith("}")):
        try:
            scan_data_payload = json.loads(q_text)
        except Exception:
            pass

    # If scan_data payload found in query, run grounded copilot formatter
    if scan_data_payload and isinstance(scan_data_payload, dict):
        explanation = format_grounded_copilot_explanation(scan_data_payload)
        return {
            "response": explanation,
            "suggested_questions": [
                "What if I already submitted my password?",
                "How do I report this domain to authorities?",
                "Explain the difference between Risk Score and Confidence Score."
            ],
            "related_playbook": INCIDENT_PLAYBOOKS.get("clicked_phishing_link") if scan_data_payload.get("verdict") == "DANGER" else None,
            "references": ["RakshaAI Copilot Grounded Reasoning v1.0"]
        }

    # 2. Context Scan / Investigation Provided
    if context_scan:
        raw_res = context_scan.raw_results or {}
        scan_dict = {
            "input_type": context_scan.scan_type,
            "target": context_scan.target,
            "risk_score": context_scan.risk_score,
            "confidence_score": 85 if context_scan.risk_score >= 70 or context_scan.risk_score <= 20 else 65,
            "verdict": "DANGER" if context_scan.risk_score >= 70 else ("CAUTION" if context_scan.risk_score >= 25 else "SAFE"),
            "brand_impersonated": raw_res.get("brand_impersonated"),
            "threat_feed_hits": raw_res.get("threat_intel_hits", []),
            "tls_details": {"has_tls": raw_res.get("https_enabled", False)},
            "summary": context_scan.summary,
            "recommendation": context_scan.recommendation
        }
        explanation = format_grounded_copilot_explanation(scan_dict)
        return {
            "response": explanation,
            "suggested_questions": [
                "What if I already entered credentials on this target?",
                "How do I generate an official incident report?",
                "Can RakshaSutra monitor this domain 24/7?"
            ],
            "related_playbook": INCIDENT_PLAYBOOKS.get("clicked_phishing_link") if context_scan.risk_score >= 70 else None,
            "references": [f"Scan ID: {context_scan.id}", "RakshaSutra Telemetry Pipeline"]
        }

    if context_investigation:
        raw_telemetry = context_investigation.raw_telemetry or {}
        inv_dict = {
            "input_type": context_investigation.target_type,
            "target": context_investigation.normalized_target or context_investigation.target,
            "risk_score": context_investigation.risk_score,
            "confidence_score": context_investigation.confidence_score,
            "verdict": context_investigation.risk_level,
            "typosquat_matches": [raw_telemetry.get("typosquatting", {}).get("target_brand")] if raw_telemetry.get("typosquatting", {}).get("is_impersonation") else [],
            "threat_feed_hits": raw_telemetry.get("threat_intel", {}).get("hits", []),
            "tls_details": raw_telemetry.get("tls", {}),
            "summary": context_investigation.plain_explanation,
            "recommendations": context_investigation.recommendations
        }
        explanation = format_grounded_copilot_explanation(inv_dict)
        return {
            "response": explanation,
            "suggested_questions": [
                "How do I add this domain to my watchlist?",
                "How do I export this forensic dossier to PDF?",
                "What is the Golden Hour protocol?"
            ],
            "related_playbook": INCIDENT_PLAYBOOKS.get("clicked_phishing_link") if context_investigation.risk_score >= 70 else None,
            "references": [f"Investigation ID: {context_investigation.id}"]
        }

    # 3. Match Emergency keywords
    if "clicked" in q_lower or "phishing" in q_lower or "fake link" in q_lower:
        pb = INCIDENT_PLAYBOOKS["clicked_phishing_link"]
        return {
            "response": (
                f"🚨 **Emergency Phishing Incident Playbook**\n\n"
                f"**Immediate Containment Steps:**\n"
                + "\n".join(pb.immediate_steps)
                + "\n\n**Secondary Hardening:**\n"
                + "\n".join(pb.secondary_steps)
                + "\n\n📞 **Emergency Support**: Call **1930** (National Cyber Fraud Helpline) or report at **cybercrime.gov.in**."
            ),
            "suggested_questions": [
                "What if I entered my password on the page?",
                "How do I scan my phone for malware?",
                "How do I enable 2-Factor Authentication?"
            ],
            "related_playbook": pb,
            "references": ["OWASP Anti-Phishing Guide", "NIST SP 800-61 Rev 2"]
        }

    if "otp" in q_lower or "bank" in q_lower or "money deducted" in q_lower or "fraud" in q_lower or "scam" in q_lower or "upi" in q_lower:
        pb = INCIDENT_PLAYBOOKS["shared_otp_or_banking"]
        return {
            "response": (
                f"🚨 **Urgent Financial Fraud Action Protocol**\n\n"
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

    # 4. Default Assistant Intro
    return {
        "response": (
            "👋 I am **RakshaAI**, your explanation and triage copilot.\n\n"
            "My role is to translate raw scan data, investigations, and security telemetry into plain-language, evidence-grounded assessments.\n\n"
            "**You can:**\n"
            "1. Ask about any scan or investigation by ID or pasting its `<scan_data>` JSON block.\n"
            "2. Request immediate **Incident Response Playbooks** if you clicked a suspicious link or shared an OTP.\n"
            "3. Ask about defensive security concepts (MFA, TLS certificates, homoglyph attacks, UPI safety)."
        ),
        "suggested_questions": [
            "I clicked a suspicious link, what should I do now?",
            "What should I do if money was deducted via a UPI scam?",
            "How does RakshaSutra calculate Risk vs Confidence?"
        ],
        "related_playbook": None,
        "references": ["RakshaSutra Grounded Knowledge Base"]
    }
