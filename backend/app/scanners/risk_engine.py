from typing import Dict, List, Any

# Risk Level Classification Thresholds
RISK_LEVEL_THRESHOLDS = [
    (75, "HIGH", "Critical risk detected. This target exhibits active malicious signals or deliberate impersonation."),
    (50, "SUSPICIOUS", "Multiple high-risk indicators detected. High probability of deceptive or hazardous behavior."),
    (25, "MODERATE", "Anomalies or low-reputation traits detected. Proceed with caution and verify identity."),
    (0, "LOW", "No immediate malicious indicators detected based on available threat telemetry. Maintain standard vigilance.")
]

def calculate_risk_score(
    structure_score: int,
    domain_score: int,
    impersonation_score: int,
    threat_intel_score: int,
    redirect_score: int
) -> int:
    """
    Weighted deterministic formula for 0-100 risk score.
    Enforces maximum ceiling of 100.
    """
    # Raw sum with saturation curves
    raw_total = (
        structure_score +
        domain_score +
        impersonation_score +
        threat_intel_score +
        redirect_score
    )

    # Fast-track high confidence threats
    if threat_intel_score >= 35 or impersonation_score >= 35:
        raw_total = max(raw_total, 82)

    return max(0, min(100, raw_total))

def get_risk_level_info(score: int):
    for threshold, level, desc in RISK_LEVEL_THRESHOLDS:
        if score >= threshold:
            return level, desc
    return "LOW", RISK_LEVEL_THRESHOLDS[-1][2]

def generate_plain_explanation(
    risk_level: str,
    target: str,
    impersonation_info: Dict[str, Any],
    threat_intel_hits: List[Dict[str, Any]],
    indicators: List[Dict[str, Any]]
) -> str:
    """Generate concise, human-readable rationale without security jargon."""
    if risk_level == "HIGH":
        reasons = []
        if impersonation_info.get("is_impersonation"):
            brand = impersonation_info.get("target_brand", "a legitimate organization")
            reasons.append(f"it impersonates {brand}")
        if threat_intel_hits:
            cat = threat_intel_hits[0].get("threat_category", "known threats")
            reasons.append(f"it is flagged on active threat databases for {cat}")
        if any(i.get("category") == "Malware Risk" for i in indicators):
            reasons.append("it attempts to distribute an executable file")
        
        reason_text = " and ".join(reasons) if reasons else "multiple severe security anomalies were identified"
        return f"This link is classified as HIGH RISK because {reason_text}. Interacting with this link presents an immediate danger of identity theft, account compromise, or malware infection."

    elif risk_level == "SUSPICIOUS":
        return f"This link exhibits deceptive characteristics commonly found in phishing campaigns and suspicious online lures. It should be treated with extreme suspicion."

    elif risk_level == "MODERATE":
        return f"This link presents minor security anomalies or operates on low-reputation infrastructure. While not definitively malicious, you should verify the sender before providing any details."

    else:
        return f"RakshaSutra did not detect active malicious signatures or brand spoofing on this link at the time of analysis. Remember that no tool can guarantee 100% safety; always exercise standard caution online."

def generate_recommendations(risk_level: str, impersonation_info: Dict[str, Any]) -> str:
    """Generate tailored defensive action items."""
    if risk_level == "HIGH":
        rec = "DO NOT open this link, enter passwords, provide OTPs, or download attachments. "
        if impersonation_info.get("is_impersonation"):
            brand = impersonation_info.get("target_brand", "the institution")
            rec += f"If you need to access your {brand} account, manually type the official website address into your browser rather than clicking links."
        else:
            rec += "Block the sender and report the message to your security team or cybersecurity authority."
        return rec

    elif risk_level == "SUSPICIOUS":
        return "Avoid clicking this link or entering personal credentials. If received via SMS, WhatsApp, or Email, contact the supposed sender through a verified secondary channel to confirm authenticity."

    elif risk_level == "MODERATE":
        return "Verify the website's HTTPS certificate and domain name carefully before proceeding. Do not enter financial information or sensitive passwords unless you are certain of the destination."

    else:
        return "Standard safety practices apply: Ensure your browser is up to date, never share passwords or one-time passcodes (OTPs), and verify secure HTTPS connections."

def synthesize_risk_report(
    target: str,
    structure_score: int,
    domain_score: int,
    impersonation_score: int,
    threat_intel_result: Dict[str, Any],
    redirect_score: int,
    indicators: List[Dict[str, Any]],
    impersonation_info: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Synthesizes all signals into the finalized explainable risk decision.
    """
    threat_intel_score = threat_intel_result.get("max_score_impact", 0)
    
    # Add threat intel hits to indicators
    for hit in threat_intel_result.get("hits", []):
        indicators.append({
            "category": "Threat Intelligence",
            "severity": "CRITICAL",
            "title": f"Flagged by {hit.get('display_name', 'Threat Feed')}",
            "evidence": hit.get("details", "Active record present on threat blacklist."),
            "explanation": f"Security vendor repository flagged this target under category: {hit.get('threat_category', 'Malicious')}.",
            "score_impact": hit.get("score_impact", 35)
        })

    final_score = calculate_risk_score(
        structure_score,
        domain_score,
        impersonation_score,
        threat_intel_score,
        redirect_score
    )

    risk_level, default_desc = get_risk_level_info(final_score)
    summary = generate_plain_explanation(
        risk_level, 
        target, 
        impersonation_info, 
        threat_intel_result.get("hits", []),
        indicators
    )
    # Derive clear Traffic Light Verdict and Confidence Score
    if final_score >= 65:
        verdict = "DANGER"
    elif final_score >= 25:
        verdict = "CAUTION"
    else:
        verdict = "SAFE"

    confidence = "HIGH" if (threat_intel_result.get("hits") or impersonation_info.get("is_impersonation") or len(indicators) >= 2) else "MEDIUM"

    return {
        "risk_score": final_score,
        "risk_level": risk_level,
        "verdict": verdict,
        "confidence": confidence,
        "summary": summary,
        "recommendation": recommendation,
        "indicators": indicators,
        "threat_intel_hits": threat_intel_result.get("hits", [])
    }
