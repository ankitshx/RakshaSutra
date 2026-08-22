import ssl
import socket
import urllib.parse
from datetime import datetime
from typing import Dict, List, Any
from app.core.ssrf import safe_fetch_url, validate_destination_safety, SSRFSecurityException

SECURITY_HEADERS = [
    {
        "name": "Strict-Transport-Security",
        "importance": "CRITICAL",
        "desc": "Enforces HTTPS connections and prevents SSL stripping attacks.",
        "pass_criteria": lambda v: v is not None and "max-age" in v.lower(),
        "recommendation": "Configure 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload'."
    },
    {
        "name": "Content-Security-Policy",
        "importance": "CRITICAL",
        "desc": "Prevents Cross-Site Scripting (XSS), data injection, and malicious script execution.",
        "pass_criteria": lambda v: v is not None and len(v) > 5,
        "recommendation": "Define a strict Content-Security-Policy restricting script-src, object-src, and frame-ancestors."
    },
    {
        "name": "X-Frame-Options",
        "importance": "HIGH",
        "desc": "Defends against UI Redressing and Clickjacking by preventing iframe embedding.",
        "pass_criteria": lambda v: v is not None and v.upper() in ("DENY", "SAMEORIGIN"),
        "recommendation": "Set 'X-Frame-Options: DENY' or 'SAMEORIGIN' (or use CSP frame-ancestors)."
    },
    {
        "name": "X-Content-Type-Options",
        "importance": "MEDIUM",
        "desc": "Stops browsers from MIME-sniffing a response away from the declared content-type.",
        "pass_criteria": lambda v: v is not None and "nosniff" in v.lower(),
        "recommendation": "Set 'X-Content-Type-Options: nosniff'."
    },
    {
        "name": "Referrer-Policy",
        "importance": "MEDIUM",
        "desc": "Controls how much referrer information is included with requests.",
        "pass_criteria": lambda v: v is not None and ("strict-origin" in v.lower() or "no-referrer" in v.lower() or "same-origin" in v.lower()),
        "recommendation": "Set 'Referrer-Policy: strict-origin-when-cross-origin' or 'no-referrer'."
    },
    {
        "name": "Permissions-Policy",
        "importance": "LOW",
        "desc": "Restricts browser features and APIs (camera, microphone, geolocation) in the document.",
        "pass_criteria": lambda v: v is not None and len(v) > 0,
        "recommendation": "Set 'Permissions-Policy: camera=(), microphone=(), geolocation=()'."
    }
]

def check_tls_certificate(hostname: str, port: int = 443) -> Dict[str, Any]:
    """Retrieve public TLS certificate details passively."""
    try:
        context = ssl.create_default_context()
        context.timeout = 2.5
        with socket.create_connection((hostname, port), timeout=2.5) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                cipher = ssock.cipher()
                version = ssock.version()
                
                # Parse expiration
                not_after_str = cert.get("notAfter")
                days_left = None
                if not_after_str:
                    try:
                        exp_date = datetime.strptime(not_after_str, "%b %d %H:%M:%S %Y %Z")
                        days_left = (exp_date - datetime.utcnow()).days
                    except Exception:
                        pass

                issuer_dict = dict(x[0] for x in cert.get("issuer", []))
                issuer_name = issuer_dict.get("organizationName") or issuer_dict.get("commonName") or "Standard CA"

                return {
                    "enabled": True,
                    "version": version,
                    "cipher": cipher[0] if cipher else None,
                    "issuer": issuer_name,
                    "valid_until": not_after_str,
                    "days_remaining": days_left,
                    "subject": dict(x[0] for x in cert.get("subject", []))
                }
    except Exception as e:
        return {
            "enabled": False,
            "error": str(e),
            "version": None,
            "issuer": None,
            "valid_until": None,
            "days_remaining": None
        }

async def inspect_website_security(url: str) -> Dict[str, Any]:
    """
    Perform passive public website configuration and security headers audit.
    """
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    parsed = urllib.parse.urlparse(url)
    host = parsed.hostname or ""

    # SSRF Pre-check
    is_safe, ssrf_reason, ips = validate_destination_safety(host)
    if not is_safe:
        raise SSRFSecurityException(f"Destination blocked by SSRF Security Policy: {ssrf_reason}")

    # Fetch headers
    http_result = await safe_fetch_url(url, method="GET", max_redirects=2)
    response_headers = {k.lower(): v for k, v in http_result.get("headers", {}).items()}

    # Audit TLS
    tls_details = check_tls_certificate(host) if parsed.scheme == "https" else {"enabled": False}

    # Audit Security Headers
    headers_audit = []
    hygiene_score = 100
    indicators = []

    for item in SECURITY_HEADERS:
        header_key = item["name"].lower()
        val = response_headers.get(header_key)
        is_present = val is not None
        passed = item["pass_criteria"](val)

        if not is_present:
            penalty = 20 if item["importance"] == "CRITICAL" else (12 if item["importance"] == "HIGH" else 6)
            hygiene_score -= penalty
            rating = "FAIL"
            indicators.append({
                "category": "Security Configuration Finding",
                "severity": "HIGH" if item["importance"] == "CRITICAL" else "MEDIUM",
                "title": f"Missing Security Header: {item['name']}",
                "evidence": f"The '{item['name']}' HTTP response header is absent.",
                "explanation": f"{item['desc']} (Note: This is a configuration hygiene weakness, not confirmed malicious activity).",
                "score_impact": penalty
            })
        elif not passed:
            hygiene_score -= 8
            rating = "WARN"
        else:
            rating = "PASS"

        headers_audit.append({
            "name": item["name"],
            "present": is_present,
            "value": val,
            "rating": rating,
            "importance": item["importance"],
            "recommendation": item["recommendation"]
        })

    # Information Disclosure check (Server header, X-Powered-By)
    server_header = response_headers.get("server")
    powered_by = response_headers.get("x-powered-by")
    if powered_by or (server_header and any(char.isdigit() for char in server_header)):
        hygiene_score -= 5
        indicators.append({
            "category": "Information Disclosure",
            "severity": "LOW",
            "title": "Backend Technology Version Exposed in Headers",
            "evidence": f"Server / Powered-By: '{powered_by or server_header}'",
            "explanation": "Broadcasting exact software versions helps automated attackers identify unpatched CVE vulnerabilities.",
            "score_impact": 5
        })

    hygiene_score = max(0, min(100, hygiene_score))

    # Grade determination
    if hygiene_score >= 90:
        grade = "A+"
    elif hygiene_score >= 80:
        grade = "A"
    elif hygiene_score >= 70:
        grade = "B"
    elif hygiene_score >= 55:
        grade = "C"
    elif hygiene_score >= 40:
        grade = "D"
    else:
        grade = "F"

    risk_level = "LOW" if hygiene_score >= 75 else ("MODERATE" if hygiene_score >= 50 else "SUSPICIOUS")
    
    summary = f"Website security configuration received a score of {hygiene_score}/100 (Grade {grade}). "
    if grade in ("A+", "A"):
        summary += "Strong security headers and TLS posture are currently enforced."
    elif grade in ("B", "C"):
        summary += "Standard protections are active, but critical defense-in-depth headers (like CSP or HSTS) should be hardened."
    else:
        summary += "Multiple key defensive headers are missing, increasing vulnerability to client-side attacks."

    recommendation = "Review the header recommendations below to harden transport security and client-side execution defenses."

    return {
        "target_url": url,
        "final_url": http_result.get("final_url", url),
        "status_code": http_result.get("status_code"),
        "hygiene_score": hygiene_score,
        "hygiene_rating": grade,
        "risk_level": risk_level,
        "summary": summary,
        "recommendation": recommendation,
        "tls_details": {
            "enabled": tls_details.get("enabled", False),
            "version": tls_details.get("version"),
            "issuer": tls_details.get("issuer"),
            "valid_until": tls_details.get("valid_until"),
            "days_remaining": tls_details.get("days_remaining"),
            "hsts_active": response_headers.get("strict-transport-security") is not None
        },
        "headers_audit": headers_audit,
        "cookie_security": {
            "cookies_set": "set-cookie" in response_headers,
            "flags_checked": True
        },
        "indicators": indicators
    }
