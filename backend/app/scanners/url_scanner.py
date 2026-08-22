import re
import ipaddress
import urllib.parse
from typing import Dict, List, Any, Optional
from app.core.ssrf import safe_fetch_url, validate_destination_safety, SSRFSecurityException
from app.scanners.typosquatting import check_brand_impersonation
from app.scanners.domain_scanner import analyze_domain, extract_domain_components

# Known URL shortener domains
URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "is.gd", "ow.ly", "cutt.ly",
    "buff.ly", "goo.gl", "rebrand.ly", "shorturl.at", "tiny.cc",
    "qr.ae", "trib.al", "adf.ly", "bit.do", "soo.gd", "v.gd"
}

SUSPICIOUS_PATH_KEYWORDS = [
    "login", "signin", "verify", "verification", "secure", "security",
    "update", "account", "wallet", "recover", "recovery", "webscr",
    "banking", "confirm", "validation", "authenticate", "passcode",
    "credential", "session", "suspended", "unlock", "kyc", "pan-link",
    "aadhaar", "claim", "reward", "lottery", "gift", "bonus", "free"
]

SUSPICIOUS_EXTENSIONS = [
    ".exe", ".scr", ".bat", ".vbs", ".apk", ".msi", ".cmd", ".ps1", ".iso", ".dmg", ".zip"
]

def normalize_url(raw_url: str) -> str:
    """Normalize input URL into a well-formed http/https URI."""
    url = raw_url.strip()
    # Remove leading @ or angle brackets if user pasted from chat
    url = url.strip("<>\"' ")
    
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url
    
    return url

def analyze_url_structure(url: str) -> Dict[str, Any]:
    """
    Evaluate syntactic indicators, obfuscation, ports, encoding, and path semantics.
    """
    parsed = urllib.parse.urlparse(url)
    findings = []
    structure_score = 0
    
    hostname = parsed.hostname or ""
    port = parsed.port
    path = parsed.path.lower()
    query = parsed.query.lower()
    full_url_lower = url.lower()

    # 1. Scheme Check
    if parsed.scheme == "http":
        findings.append({
            "category": "TLS / Transport Security",
            "severity": "MEDIUM",
            "title": "Unencrypted HTTP Protocol",
            "evidence": f"URL uses plain 'http://' rather than secure 'https://'.",
            "explanation": "Plain HTTP traffic is unencrypted and susceptible to Man-In-The-Middle (MITM) interception and credential sniffing.",
            "score_impact": 15
        })
        structure_score += 15

    # 2. IP Host Check (e.g. http://192.0.2.1/login or hex IP)
    is_ip = False
    try:
        ipaddress.ip_address(hostname)
        is_ip = True
        findings.append({
            "category": "URL Structure",
            "severity": "HIGH",
            "title": "Raw IP Address in URL Hostname",
            "evidence": f"The target URL host is a raw IP address ({hostname}) instead of a registered domain.",
            "explanation": "Legitimate organizations rarely direct consumers to raw IP addresses. Attackers use raw IPs to bypass domain reputation blocklists.",
            "score_impact": 28
        })
        structure_score += 28
    except ValueError:
        pass

    # 3. Hex / Octal / Decimal obfuscation detection
    if re.search(r'https?://0x[0-9a-fA-F]+', url) or re.search(r'https?://[0-9]{8,12}', url):
        findings.append({
            "category": "URL Obfuscation",
            "severity": "HIGH",
            "title": "Obfuscated IP Representation (Dword/Hex)",
            "evidence": f"Host contains encoded numeric or hex IP notation in '{hostname}'.",
            "explanation": "Attackers format IP addresses into hexadecimal or integer formats to evade standard URL security filters.",
            "score_impact": 30
        })
        structure_score += 30

    # 4. Non-Standard Port Check
    if port and port not in (80, 443):
        findings.append({
            "category": "URL Structure",
            "severity": "MEDIUM",
            "title": f"Unusual Network Port (:{port})",
            "evidence": f"URL specifies non-standard service port {port}.",
            "explanation": "Standard web browsing uses ports 80 (HTTP) and 443 (HTTPS). Malicious proxies, C2 nodes, and test phishing servers frequently operate on irregular ports.",
            "score_impact": 14
        })
        structure_score += 14

    # 5. Excessive Length Check
    if len(url) > 200:
        findings.append({
            "category": "URL Structure",
            "severity": "LOW",
            "title": "Abnormally Long URL (>200 chars)",
            "evidence": f"URL length is {len(url)} characters.",
            "explanation": "Excessively long URLs are often used to pad browser address bars, pushing the true malicious domain off-screen on mobile devices.",
            "score_impact": 8
        })
        structure_score += 8

    # 6. Suspicious Keyword Stacking in Path / Query
    matched_keywords = [kw for kw in SUSPICIOUS_PATH_KEYWORDS if kw in path or kw in query]
    if len(matched_keywords) >= 2:
        findings.append({
            "category": "Content & Intent Indicators",
            "severity": "HIGH",
            "title": "Authentication & Banking Lure Keywords in Path",
            "evidence": f"Path contains high-risk action words: {', '.join(matched_keywords)}.",
            "explanation": "The URL path includes multiple keywords commonly associated with credential harvesting, account lockouts, or fake verification pages.",
            "score_impact": 20
        })
        structure_score += 20
    elif len(matched_keywords) == 1:
        findings.append({
            "category": "Content & Intent Indicators",
            "severity": "LOW",
            "title": f"Sensitive Action Keyword in Path ('{matched_keywords[0]}')",
            "evidence": f"Path includes '{matched_keywords[0]}'.",
            "explanation": "The target page requests or references an authentication/sensitive action.",
            "score_impact": 8
        })
        structure_score += 8

    # 7. Executable File Extension Check
    for ext in SUSPICIOUS_EXTENSIONS:
        if path.endswith(ext):
            findings.append({
                "category": "Malware Risk",
                "severity": "CRITICAL",
                "title": f"Direct Download for Executable Payload ({ext})",
                "evidence": f"URL points directly to an executable file: '{path}'.",
                "explanation": "Downloading and executing files from unverified links is a primary vector for ransomware, trojans, and info-stealers.",
                "score_impact": 40
            })
            structure_score += 40
            break

    # 8. Excessive URL Encoding / Obfuscation
    encoding_count = url.count("%")
    if encoding_count > 3:
        findings.append({
            "category": "URL Obfuscation",
            "severity": "MEDIUM",
            "title": "Heavy Percent-Encoding Obfuscation",
            "evidence": f"URL contains {encoding_count} percent-encoded escape sequences.",
            "explanation": "Multiple percent encodings can be used to disguise target destination URLs or evade signature-based scanners.",
            "score_impact": 12
        })
        structure_score += 12

    # 9. Shortener Detection
    is_shortener = hostname.lower() in URL_SHORTENERS
    if is_shortener:
        findings.append({
            "category": "Redirect Behavior",
            "severity": "MEDIUM",
            "title": "URL Shortener Service Detected",
            "evidence": f"Host '{hostname}' is a known URL shortening service.",
            "explanation": "URL shorteners conceal the true landing destination, making it impossible to assess legitimacy prior to expansion.",
            "score_impact": 12
        })
        structure_score += 12

    return {
        "hostname": hostname,
        "port": port,
        "is_ip": is_ip,
        "is_shortener": is_shortener,
        "structure_score": min(structure_score, 45),
        "findings": findings
    }

async def inspect_url_comprehensive(raw_url: str) -> Dict[str, Any]:
    """
    Full pipeline scan: Validation -> SSRF check -> Structure -> Domain -> Brand Impersonation -> Redirect Trace.
    """
    normalized = normalize_url(raw_url)
    parsed = urllib.parse.urlparse(normalized)
    host = parsed.hostname or ""

    # Pre-flight SSRF Validation
    is_safe, ssrf_msg, resolved_ips = validate_destination_safety(host)
    if not is_safe:
        raise SSRFSecurityException(f"Destination blocked by SSRF Security Policy: {ssrf_msg}")

    # 1. Structural Analysis
    struct_result = analyze_url_structure(normalized)

    # 2. Domain & TLD Analysis
    domain_result = analyze_domain(host, host)

    # 3. Brand Impersonation & Typosquatting Check
    impersonation_result = check_brand_impersonation(domain_result["registered_domain"], host)

    impersonation_findings = []
    impersonation_score = 0
    if impersonation_result["is_impersonation"]:
        impersonation_score = 35
        impersonation_findings.append({
            "category": "Brand Impersonation",
            "severity": "CRITICAL" if impersonation_result["confidence"] >= 90 else "HIGH",
            "title": f"Possible Impersonation of Brand: {impersonation_result.get('target_brand', 'Target')}",
            "evidence": impersonation_result.get("evidence", "Domain closely mimics a recognized brand name."),
            "explanation": impersonation_result.get("explanation", "Attackers craft lookalike domains to steal credentials and financial details."),
            "score_impact": 35
        })

    # 4. Safe Redirect Tracing & HTTP Fetch
    http_result = await safe_fetch_url(
        normalized, 
        method="GET", 
        max_redirects=3, 
        follow_redirects=True
    )

    redirect_findings = []
    redirect_score = 0
    if len(http_result.get("redirect_chain", [])) > 2:
        redirect_score = 12
        redirect_findings.append({
            "category": "Redirect Behavior",
            "severity": "MEDIUM",
            "title": "Multiple Redirect Hops Detected",
            "evidence": f"URL traversed {len(http_result['redirect_chain'])} hops before reaching terminal page.",
            "explanation": "Chained redirects are frequently used by cloaking networks to evade automated security scanners and route traffic based on geolocation.",
            "score_impact": 12
        })

    # Consolidate all findings
    all_findings = (
        struct_result["findings"] +
        domain_result["findings"] +
        impersonation_findings +
        redirect_findings
    )

    return {
        "normalized_url": normalized,
        "hostname": host,
        "registered_domain": domain_result["registered_domain"],
        "subdomain": domain_result["subdomain"],
        "tld": domain_result["suffix"],
        "tld_tier": domain_result["tld_tier"],
        "resolved_ips": resolved_ips,
        "status_code": http_result.get("status_code"),
        "final_url": http_result.get("final_url", normalized),
        "redirect_chain": http_result.get("redirect_chain", []),
        "dns_records": domain_result["dns_records"],
        "impersonation_info": impersonation_result,
        "structure_score": struct_result["structure_score"],
        "domain_score": domain_result["tld_risk_score"],
        "impersonation_score": impersonation_score,
        "redirect_score": redirect_score,
        "findings": all_findings,
        "http_success": http_result.get("success", False),
        "headers": http_result.get("headers", {})
    }
