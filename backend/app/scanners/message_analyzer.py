import re
from typing import Dict, List, Any, Optional
from app.scanners.url_scanner import inspect_url_comprehensive
from app.scanners.risk_engine import get_risk_level_info

# Specific NLP detection categories & regex triggers
PHISHING_PATTERNS = [
    # 1. Urgency & Coercion / Threat of Suspension
    {
        "category": "Urgency & Fear Coercion",
        "name": "Immediate Account Suspension Threat",
        "patterns": [
            r"account (will be|is|has been) (suspended|blocked|deactivated|closed|frozen)",
            r"within (24|12|48|2|6) hours",
            r"immediate action (is )?required",
            r"to avoid (permanent )?(suspension|closure|penalty|disconnection)",
            r"last warning",
            r"final reminder",
            r"act now",
            r"call officer (at|on)?\s*[0-9]+"
        ],
        "weight": 25,
        "description": "Uses artificial urgency and threats to pressure the victim into acting quickly without thinking."
    },
    {
        "category": "Government & Legal Coercion",
        "name": "Legal Action / Arrest / Utility Disconnection Threat",
        "patterns": [
            r"(electricity|power|water|gas|bill).*(unpaid|overdue|pending|cut|disconnect)",
            r"tonight at (9|10|8|7|11)",
            r"(police|cbi|customs|court|trai) (notice|warrant|case|complaint)",
            r"sim (card )?will be deactivated",
            r"pan (card )?(blocked|deactivated|invalid|link)"
        ],
        "weight": 30,
        "description": "Impersonates authorities or utility services threatening imminent disconnection or arrest."
    },
    
    # 2. Financial Bait & UPI / Lottery Scams
    {
        "category": "Financial Bait",
        "name": "Advance Fee / Lottery / Refund Lure",
        "patterns": [
            r"(won|winner|win|claim) (lottery|cash prize|gift card|bonus|reward)",
            r"(income tax|tax|it) refund (of|worth)?\s*(rs\.?|₹)?\s*[0-9]+",
            r"credited with (rs\.?|₹)?\s*[0-9]+",
            r"send (rs\.?|₹)?\s*1 to (receive|verify|claim)",
            r"part[- ]time job.*earn (rs\.?|₹)?\s*[0-9]+",
            r"like and subscribe.*(telegram|earn|daily)",
            r"crypto airdrop"
        ],
        "weight": 28,
        "description": "Entices victims with fake prizes, unexpected refunds, or lucrative task scams."
    },
    
    # 3. Credential & Secret Theft Requests
    {
        "category": "Credential Theft",
        "name": "OTP / PIN / Password Request",
        "patterns": [
            r"(share|send|provide|tell|enter) (your )?(otp|one[- ]time password|verification code)",
            r"(atm|upi|card) (pin|password|cvv)",
            r"verify (your )?(identity|credentials|password|netbanking)",
            r"update your (kyc|pan|aadhaar|bank account)",
            r"login to confirm"
        ],
        "weight": 35,
        "description": "Directly attempts to harvest sensitive one-time passcodes, banking credentials, or personal identifiers."
    },

    # 4. Remote Access Trojan Lures
    {
        "category": "Remote Access Fraud",
        "name": "Screen Sharing / Support Tool Lure",
        "patterns": [
            r"(install|download) (anydesk|teamviewer|quicksupport|rustdesk|zoho assist)",
            r"share your (screen|access code|support id)",
            r"customer care executive will connect"
        ],
        "weight": 35,
        "description": "Instructs victim to install remote desktop control software to take over devices."
    },

    # 5. Impersonation of Recognizable Institutions
    {
        "category": "Brand Impersonation",
        "name": "Customer Care & Bank Impersonation",
        "patterns": [
            r"dear (sbi|hdfc|icici|axis|pnb|customer|user|netflix|amazon) (user|customer)?",
            r"(sbi|hdfc|icici) bank alert",
            r"(india post|dhl|fedex|customs) package (delivery|hold)",
            r"trai official notice"
        ],
        "weight": 18,
        "description": "Falsely claims to represent a recognized financial institution, delivery service, or regulator."
    }
]

# Regex for extracting embedded URLs in raw message text
URL_REGEX = r'https?://[^\s<>"\']+|www\.[^\s<>"\']+'

async def analyze_message_content(content: str, channel: str = "generic", sender: Optional[str] = None) -> Dict[str, Any]:
    """
    Evaluate message for social engineering techniques, credential theft, financial bait, and embedded links.
    """
    text_lower = content.lower()
    detected_techniques = []
    indicators = []
    total_heuristic_score = 0

    # 1. Match NLP Patterns
    for rule in PHISHING_PATTERNS:
        for pat in rule["patterns"]:
            match = re.search(pat, text_lower)
            if match:
                matched_phrase = match.group(0)
                detected_techniques.append({
                    "category": rule["category"],
                    "name": rule["name"],
                    "confidence": 92,
                    "matched_phrase": matched_phrase,
                    "description": rule["description"]
                })
                
                indicators.append({
                    "category": rule["category"],
                    "severity": "CRITICAL" if rule["weight"] >= 30 else "HIGH",
                    "title": rule["name"],
                    "evidence": f"Detected matching phrase: \"{matched_phrase}\"",
                    "explanation": rule["description"],
                    "score_impact": rule["weight"]
                })
                total_heuristic_score += rule["weight"]
                break  # match once per rule

    # 2. Extract and Scan Embedded URLs
    extracted_urls = re.findall(URL_REGEX, content)
    cleaned_urls = []
    for u in extracted_urls:
        if not u.startswith("http://") and not u.startswith("https://"):
            u = "https://" + u
        cleaned_urls.append(u)

    embedded_url_analyses = []
    max_url_risk_score = 0

    for u in cleaned_urls[:3]:  # inspect up to 3 URLs safely
        try:
            url_scan = await inspect_url_comprehensive(u)
            # Add URL findings into message indicators
            for ind in url_scan["findings"]:
                if ind.get("severity") in ("CRITICAL", "HIGH"):
                    indicators.append({
                        "category": f"Embedded Link: {ind.get('category')}",
                        "severity": ind.get("severity"),
                        "title": f"[{u[:30]}...] {ind.get('title')}",
                        "evidence": ind.get("evidence"),
                        "explanation": ind.get("explanation"),
                        "score_impact": ind.get("score_impact", 20)
                    })
            
            url_risk = url_scan.get("impersonation_score", 0) + url_scan.get("domain_score", 0) + url_scan.get("structure_score", 0)
            if url_risk > max_url_risk_score:
                max_url_risk_score = url_risk

            embedded_url_analyses.append({
                "url": u,
                "domain": url_scan["registered_domain"],
                "is_impersonation": url_scan["impersonation_info"]["is_impersonation"],
                "target_brand": url_scan["impersonation_info"].get("target_brand"),
                "status_code": url_scan["status_code"]
            })
        except Exception as e:
            embedded_url_analyses.append({
                "url": u,
                "error": str(e)
            })

    # If message contains link + high urgency or OTP ask
    if cleaned_urls and total_heuristic_score >= 25:
        total_heuristic_score += 20
        indicators.append({
            "category": "Social Engineering",
            "severity": "HIGH",
            "title": "Combination of Coercive Text and Action Link",
            "evidence": f"Message pairs urgency/threat wording with {len(cleaned_urls)} clickable link(s).",
            "explanation": "Attackers combine emotional coercion with direct links to herd victims straight into credential phishing forms.",
            "score_impact": 20
        })

    final_score = min(100, total_heuristic_score + (max_url_risk_score // 2))
    risk_level, _ = get_risk_level_info(final_score)

    # Plain summary & recommendation
    if risk_level == "HIGH":
        summary = f"This {channel.upper()} message shows strong hallmarks of a high-risk phishing or scam attempt. It utilizes pressure tactics and sensitive data lures to deceive you."
        recommendation = "DO NOT click any links, DO NOT share OTPs or passwords, and DO NOT reply to this message. Block the sender and delete the conversation."
    elif risk_level == "SUSPICIOUS":
        summary = f"This message contains suspicious wording and techniques typical of online fraud. Exercise high caution."
        recommendation = "Verify the claimed notification through official customer support numbers, never using the contact details or links in this message."
    elif risk_level == "MODERATE":
        summary = "Minor suspicious traits or generic promotional formatting were detected. Verify the sender."
        recommendation = "Do not share passwords or payment details without confirming sender identity."
    else:
        summary = "No obvious phishing keywords, OTP requests, or high-risk scam patterns were detected in this text. Maintain standard vigilance."
        recommendation = "Always remember: Legitimate banks and services will never ask you for your passwords or OTPs over text or phone."

    return {
        "channel": channel,
        "sender": sender,
        "risk_score": final_score,
        "risk_level": risk_level,
        "summary": summary,
        "recommendation": recommendation,
        "detected_techniques": detected_techniques,
        "indicators": indicators,
        "extracted_urls": cleaned_urls,
        "embedded_url_analyses": embedded_url_analyses
    }
