import re
import socket
import dns.resolver
from typing import Dict, List, Any, Optional
import tldextract

# High-risk TLDs according to Spamhaus, APWG, and global threat reports
HIGH_RISK_TLDS = {
    "top": {"risk": "HIGH", "weight": 20, "desc": "Statistically elevated phishing/spam abuse rates."},
    "xyz": {"risk": "MEDIUM", "weight": 12, "desc": "Frequent low-cost domain registration for malicious campaigns."},
    "club": {"risk": "MEDIUM", "weight": 10, "desc": "Elevated use in spam & phishing lures."},
    "work": {"risk": "HIGH", "weight": 18, "desc": "High prevalence in credential harvesting campaigns."},
    "click": {"risk": "HIGH", "weight": 18, "desc": "High prevalence in scam click-through links."},
    "buzz": {"risk": "HIGH", "weight": 18, "desc": "Commonly abused in clickbait and adware lures."},
    "fit": {"risk": "HIGH", "weight": 18, "desc": "Abused in spam networks."},
    "tk": {"risk": "HIGH", "weight": 22, "desc": "Free TLD with historical high abuse density."},
    "ml": {"risk": "HIGH", "weight": 20, "desc": "High malicious registration density."},
    "ga": {"risk": "HIGH", "weight": 20, "desc": "High malicious registration density."},
    "cf": {"risk": "HIGH", "weight": 20, "desc": "High malicious registration density."},
    "gq": {"risk": "HIGH", "weight": 20, "desc": "High malicious registration density."},
    "loan": {"risk": "HIGH", "weight": 20, "desc": "Financial and advance-fee scam prevalence."},
    "racing": {"risk": "HIGH", "weight": 18, "desc": "Spam/malware landing domain."},
    "download": {"risk": "HIGH", "weight": 18, "desc": "Frequent malware delivery vector."},
    "stream": {"risk": "MEDIUM", "weight": 14, "desc": "Copyright and credential trap domain."},
    "kim": {"risk": "HIGH", "weight": 18, "desc": "High spam prevalence."},
    "party": {"risk": "HIGH", "weight": 18, "desc": "High spam prevalence."},
    "review": {"risk": "HIGH", "weight": 18, "desc": "Fake review and scam landing page prevalence."},
    "bid": {"risk": "HIGH", "weight": 18, "desc": "Phishing lure prevalence."},
    "trade": {"risk": "HIGH", "weight": 18, "desc": "Crypto and fake trading scam prevalence."},
    "cc": {"risk": "MEDIUM", "weight": 10, "desc": "Elevated misuse in malicious redirects."},
}

# Reputable & Regulated TLDs
GOV_EDU_TLDS = {"gov", "gov.in", "gov.uk", "mil", "edu", "ac.in", "ac.uk"}

def extract_domain_components(url_or_host: str) -> Dict[str, str]:
    """Extract subdomain, domain, suffix, and registered domain cleanly."""
    extracted = tldextract.extract(url_or_host)
    return {
        "subdomain": extracted.subdomain,
        "domain_name": extracted.domain,
        "suffix": extracted.suffix,
        "registered_domain": f"{extracted.domain}.{extracted.suffix}" if extracted.suffix else extracted.domain
    }

def analyze_domain(domain_str: str, host_str: str) -> Dict[str, Any]:
    """
    Perform deep static and DNS analysis on the target domain.
    """
    comp = extract_domain_components(host_str)
    suffix = comp["suffix"].lower()
    subdomain = comp["subdomain"]
    domain_name = comp["domain_name"]
    registered_domain = comp["registered_domain"]

    findings = []
    tld_risk_score = 0
    tld_tier = "Standard"

    # Check TLD
    if suffix in HIGH_RISK_TLDS:
        tld_info = HIGH_RISK_TLDS[suffix]
        tld_tier = tld_info["risk"]
        tld_risk_score += tld_info["weight"]
        findings.append({
            "category": "Domain Reputation",
            "severity": "HIGH" if tld_info["risk"] == "HIGH" else "MEDIUM",
            "title": f"High-Risk Top-Level Domain (.{suffix})",
            "evidence": f"The URL is hosted on the '.{suffix}' TLD.",
            "explanation": f"{tld_info['desc']} Threat actors frequently register low-cost or unverified TLDs for disposable phishing infrastructure.",
            "score_impact": tld_info["weight"]
        })
    elif any(suffix == g or suffix.endswith("." + g) for g in GOV_EDU_TLDS):
        tld_tier = "Verified Institutional"

    # Check for excessive subdomain depth
    subdomain_parts = [p for p in subdomain.split(".") if p] if subdomain else []
    if len(subdomain_parts) >= 3:
        findings.append({
            "category": "URL Structure",
            "severity": "MEDIUM",
            "title": "Deep Subdomain Hierarchy",
            "evidence": f"Detected {len(subdomain_parts)} subdomain levels: '{subdomain}'.",
            "explanation": "Phishing kits often use deeply nested subdomains to bypass basic string filters or mimic legitimate directory structures.",
            "score_impact": 12
        })

    # DNS Records lookup (Passive check with short timeout)
    dns_records = {
        "has_a_record": False,
        "has_mx_record": False,
        "has_ns_record": False,
        "mx_servers": [],
        "name_servers": [],
        "txt_records": []
    }

    try:
        resolver = dns.resolver.Resolver()
        resolver.timeout = 2.0
        resolver.lifetime = 2.0

        try:
            a_answers = resolver.resolve(registered_domain, 'A')
            dns_records["has_a_record"] = len(a_answers) > 0
        except Exception:
            pass

        try:
            ns_answers = resolver.resolve(registered_domain, 'NS')
            dns_records["has_ns_record"] = len(ns_answers) > 0
            dns_records["name_servers"] = [str(r.target).rstrip(".") for r in ns_answers][:4]
        except Exception:
            pass

        try:
            mx_answers = resolver.resolve(registered_domain, 'MX')
            dns_records["has_mx_record"] = len(mx_answers) > 0
            dns_records["mx_servers"] = [str(r.exchange).rstrip(".") for r in mx_answers][:4]
        except Exception:
            pass

    except Exception:
        # Resolver configuration or network timeout
        pass

    return {
        "subdomain": subdomain,
        "domain_name": domain_name,
        "suffix": suffix,
        "registered_domain": registered_domain,
        "tld_tier": tld_tier,
        "tld_risk_score": tld_risk_score,
        "dns_records": dns_records,
        "findings": findings
    }
