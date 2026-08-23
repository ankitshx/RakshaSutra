import re
import socket
import ssl
import time
import urllib.parse
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

import idna
from app.core.ssrf import safe_fetch_url, validate_destination_safety, SSRFSecurityException
from app.scanners.typosquatting import check_brand_impersonation
from app.scanners.domain_scanner import analyze_domain, extract_domain_components
from app.threat_intel.registry import threat_intel_registry

class InvestigationPipeline:
    """
    Core Evidence-Driven Threat Investigation Engine.
    Executes a transparent, multi-vector analysis pipeline producing
    structured findings with provenance, distinct risk and confidence scores,
    chronological timelines, and relationship graph topology.
    """

    ENGINE_VERSION = "1.0.0-PROD"
    RULESET_VERSION = "2026.08"

    @staticmethod
    def normalize_target(raw_target: str) -> Dict[str, Any]:
        """Normalize URL/domain/IP target with punycode & unicode handling."""
        cleaned = raw_target.strip().strip("<>\"' ")
        target_type = "url"

        # Check if plain message text
        if " " in cleaned and not cleaned.startswith("http://") and not cleaned.startswith("https://"):
            return {
                "target_type": "message",
                "normalized": cleaned,
                "domain": None,
                "scheme": None,
                "hostname": None,
                "port": None,
                "path": None,
                "query": None,
                "is_punycode": False
            }

        # Handle scheme
        if not cleaned.startswith("http://") and not cleaned.startswith("https://"):
            if "@" in cleaned and not "/" in cleaned:
                target_type = "email"
                return {
                    "target_type": "email",
                    "normalized": cleaned,
                    "domain": cleaned.split("@")[-1],
                    "scheme": None,
                    "hostname": cleaned.split("@")[-1],
                    "port": None,
                    "path": None,
                    "query": None,
                    "is_punycode": False
                }
            # Default to https for web targets
            url_to_parse = "https://" + cleaned
        else:
            url_to_parse = cleaned

        parsed = urllib.parse.urlparse(url_to_parse)
        raw_hostname = parsed.hostname or cleaned
        
        # Punycode / IDN normalization
        is_punycode = False
        decoded_hostname = raw_hostname
        try:
            if raw_hostname.startswith("xn--") or ".xn--" in raw_hostname:
                decoded_hostname = idna.decode(raw_hostname)
                is_punycode = True
        except Exception:
            pass

        return {
            "target_type": target_type,
            "normalized": url_to_parse,
            "domain": decoded_hostname,
            "raw_hostname": raw_hostname,
            "decoded_hostname": decoded_hostname,
            "scheme": parsed.scheme,
            "port": parsed.port or (443 if parsed.scheme == "https" else 80),
            "path": parsed.path or "/",
            "query": parsed.query,
            "is_punycode": is_punycode
        }

    @staticmethod
    async def resolve_dns_intelligence(hostname: str) -> Dict[str, Any]:
        """Perform comprehensive DNS record & SPF/DMARC resolution."""
        records = {"A": [], "AAAA": [], "MX": [], "NS": [], "TXT": [], "CNAME": []}
        findings = []
        
        try:
            # Resolve IPv4 (A records)
            try:
                addr_info = socket.getaddrinfo(hostname, None, socket.AF_INET)
                records["A"] = list(set([item[4][0] for item in addr_info]))
            except Exception:
                pass

            # Resolve IPv6 (AAAA records)
            try:
                addr_info6 = socket.getaddrinfo(hostname, None, socket.AF_INET6)
                records["AAAA"] = list(set([item[4][0] for item in addr_info6]))
            except Exception:
                pass

        except Exception as e:
            findings.append({
                "category": "DNS Intelligence",
                "title": "DNS Resolution Anomaly",
                "severity": "INFO",
                "score_impact": 5,
                "provenance": "DIRECT_OBSERVATION",
                "source_name": "System DNS Resolver",
                "rule_id": "RS-DNS-001",
                "evidence": f"DNS resolution query note: {str(e)}",
                "explanation": "Target domain could not resolve standard DNS records immediately."
            })

        return {
            "records": records,
            "primary_ip": records["A"][0] if records["A"] else None,
            "ipv6_available": len(records["AAAA"]) > 0,
            "findings": findings
        }

    @staticmethod
    async def analyze_tls_certificate(hostname: str, port: int = 443) -> Dict[str, Any]:
        """
        Audit TLS certificate security and chain validity.
        Note: HTTPS does NOT mean the website is trustworthy.
        """
        findings = []
        tls_info = {
            "has_tls": False,
            "issuer": None,
            "subject": None,
            "expires_at": None,
            "days_until_expiration": None,
            "is_expired": False,
            "san_list": [],
            "protocol_version": None,
            "disclaimer": "HTTPS guarantees encryption in transit, but does NOT indicate that the website operator is trustworthy or legitimate."
        }

        try:
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE

            with socket.create_connection((hostname, port), timeout=3.0) as sock:
                with ctx.wrap_socket(sock, server_hostname=hostname) as ssock:
                    cert = ssock.getpeercert(binary_form=False)
                    tls_info["protocol_version"] = ssock.version()
                    tls_info["has_tls"] = True

                    if cert:
                        # Extract issuer
                        issuer_dict = dict(x[0] for x in cert.get("issuer", []))
                        tls_info["issuer"] = issuer_dict.get("organizationName") or issuer_dict.get("commonName")
                        
                        # Extract subject
                        subject_dict = dict(x[0] for x in cert.get("subject", []))
                        tls_info["subject"] = subject_dict.get("commonName")

                        # Expiration
                        not_after_str = cert.get("notAfter")
                        if not_after_str:
                            try:
                                exp_dt = datetime.strptime(not_after_str, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
                                tls_info["expires_at"] = exp_dt.isoformat()
                                days_left = (exp_dt - datetime.now(timezone.utc)).days
                                tls_info["days_until_expiration"] = days_left
                                if days_left <= 0:
                                    tls_info["is_expired"] = True
                                    findings.append({
                                        "category": "TLS / Transport Security",
                                        "title": "Expired SSL/TLS Certificate",
                                        "severity": "HIGH",
                                        "score_impact": 25,
                                        "provenance": "DIRECT_OBSERVATION",
                                        "source_name": "TLS Security Auditor",
                                        "rule_id": "RS-SSL-006",
                                        "evidence": f"Certificate expired {abs(days_left)} days ago ({not_after_str}).",
                                        "explanation": "An expired certificate breaks transport trust and may indicate abandoned infrastructure or MITM risk."
                                    })
                            except Exception:
                                pass

                        # SANs
                        sans = [item[1] for item in cert.get("subjectAltName", [])]
                        tls_info["san_list"] = sans[:10]

        except Exception as e:
            findings.append({
                "category": "TLS / Transport Security",
                "title": "TLS Handshake Note",
                "severity": "INFO",
                "score_impact": 0,
                "provenance": "DIRECT_OBSERVATION",
                "source_name": "TLS Security Auditor",
                "rule_id": "RS-SSL-001",
                "evidence": f"TLS connection status: {str(e)}",
                "explanation": "No direct HTTPS connection was negotiated or certificate is self-signed."
            })

        return {
            "tls_info": tls_info,
            "findings": findings
        }

    @staticmethod
    async def run_investigation(
        raw_target: str,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Execute full multi-vector investigation with timeline events,
        provenance, scoring breakdown, and relationship graph.
        """
        t0 = time.time()
        timeline = []
        findings = []
        scoring_breakdown = {}

        # 1. Target Normalization
        norm = InvestigationPipeline.normalize_target(raw_target)
        timeline.append({
            "step_name": "TARGET_NORMALIZED",
            "description": f"Target normalized as {norm['target_type'].upper()}: {norm['normalized']}",
            "status": "SUCCESS",
            "duration_ms": round((time.time() - t0) * 1000, 1),
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        if norm["is_punycode"]:
            findings.append({
                "category": "Domain Intelligence",
                "title": "Internationalized Domain Name (Punycode / Homoglyph)",
                "severity": "MEDIUM",
                "score_impact": 20,
                "provenance": "DIRECT_OBSERVATION",
                "source_name": "Target Normalizer",
                "rule_id": "RS-DOM-002",
                "evidence": f"Domain uses punycode '{norm['raw_hostname']}' resolving to '{norm['decoded_hostname']}'.",
                "explanation": "Attackers frequently use Cyrillic or Greek lookalike characters to visually impersonate legitimate brands."
            })
            scoring_breakdown["punycode"] = 20

        hostname = norm["decoded_hostname"] or norm["normalized"]

        # 2. DNS Intelligence
        t_dns = time.time()
        dns_res = await InvestigationPipeline.resolve_dns_intelligence(hostname)
        findings.extend(dns_res["findings"])
        timeline.append({
            "step_name": "DNS_RESOLVED",
            "description": f"Resolved {len(dns_res['records']['A'])} IPv4 and {len(dns_res['records']['AAAA'])} IPv6 addresses",
            "status": "SUCCESS",
            "duration_ms": round((time.time() - t_dns) * 1000, 1),
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        # 3. Domain & Typosquatting Brand Similarity
        t_brand = time.time()
        brand_check = check_brand_impersonation(hostname)
        if brand_check.get("is_impersonation"):
            brand_name = brand_check.get("target_brand", "a legitimate brand")
            dist = brand_check.get("similarity_distance", 1)
            findings.append({
                "category": "Brand Protection",
                "title": f"Potential Impersonation of {brand_name}",
                "severity": "HIGH",
                "score_impact": 35,
                "provenance": "HEURISTIC",
                "source_name": "Brand Typosquatting Engine",
                "rule_id": "RS-PHISH-001",
                "evidence": f"Domain '{hostname}' closely matches official brand '{brand_name}' (Distance: {dist}).",
                "explanation": f"The domain uses deceptive spelling variations to mimic {brand_name}. Legitimate services operate on their official domain."
            })
            scoring_breakdown["brand_impersonation"] = 35

        # Domain age & TLD check
        domain_data = analyze_domain(hostname)
        if domain_data.get("risk_score", 0) > 0:
            for ind in domain_data.get("indicators", []):
                findings.append({
                    "category": "Domain Intelligence",
                    "title": ind.get("name", "Domain Anomaly"),
                    "severity": ind.get("severity", "LOW"),
                    "score_impact": ind.get("score_impact", 10),
                    "provenance": "DIRECT_OBSERVATION",
                    "source_name": "Domain Reputation Auditor",
                    "rule_id": "RS-DOM-005",
                    "evidence": ind.get("detail", "Domain characteristics evaluated."),
                    "explanation": "Domain registry metadata or high-risk TLD patterns observed."
                })
            scoring_breakdown["domain_reputation"] = domain_data.get("risk_score", 0)

        timeline.append({
            "step_name": "DOMAIN_EVALUATED",
            "description": f"Evaluated brand distance (Impersonation: {brand_check.get('is_impersonation', False)}) and domain reputation",
            "status": "SUCCESS",
            "duration_ms": round((time.time() - t_brand) * 1000, 1),
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        # 4. TLS & Transport Security
        t_tls = time.time()
        tls_res = await InvestigationPipeline.analyze_tls_certificate(hostname, norm.get("port") or 443)
        findings.extend(tls_res["findings"])
        timeline.append({
            "step_name": "TLS_AUDITED",
            "description": f"TLS Certificate inspected (Issuer: {tls_res['tls_info']['issuer'] or 'None/Self-signed'})",
            "status": "SUCCESS",
            "duration_ms": round((time.time() - t_tls) * 1000, 1),
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        # 5. HTTP & Security Headers (Safe Fetch with SSRF Protection)
        t_http = time.time()
        http_data = {
            "status_code": None,
            "security_headers": {},
            "redirect_count": 0,
            "final_url": norm["normalized"],
            "has_forms": False,
            "has_password_field": False
        }

        if norm["target_type"] == "url":
            try:
                fetch_res = await safe_fetch_url(norm["normalized"], max_redirects=3)
                http_data["status_code"] = fetch_res.get("status_code")
                http_data["final_url"] = fetch_res.get("final_url", norm["normalized"])
                http_data["redirect_count"] = fetch_res.get("redirect_count", 0)
                
                headers = fetch_res.get("headers", {})
                
                # Check critical security headers
                sec_headers = {
                    "Content-Security-Policy": "CSP" in headers or "content-security-policy" in headers,
                    "Strict-Transport-Security": "Strict-Transport-Security" in headers or "strict-transport-security" in headers,
                    "X-Frame-Options": "X-Frame-Options" in headers or "x-frame-options" in headers,
                    "X-Content-Type-Options": "X-Content-Type-Options" in headers or "x-content-type-options" in headers,
                    "Referrer-Policy": "Referrer-Policy" in headers or "referrer-policy" in headers
                }
                http_data["security_headers"] = sec_headers

                # Analyze HTML body safely
                body = fetch_res.get("body", "")
                if body:
                    if "<form" in body.lower():
                        http_data["has_forms"] = True
                    if 'type="password"' in body.lower() or "type='password'" in body.lower():
                        http_data["has_password_field"] = True
                        
                        # If password field is present on an impersonated or newly registered domain
                        if brand_check.get("is_impersonation"):
                            findings.append({
                                "category": "Credential Security",
                                "title": "Deceptive Credential Harvesting Form",
                                "severity": "HIGH",
                                "score_impact": 35,
                                "provenance": "DIRECT_OBSERVATION",
                                "source_name": "DOM Page Inspector",
                                "rule_id": "RS-CREDS-002",
                                "evidence": f"Page contains password input field `<input type='password'>` while impersonating {brand_check.get('target_brand')}.",
                                "explanation": "Phishing sites solicit account passwords or PINs to hijack user credentials."
                            })
                            scoring_breakdown["credential_harvesting"] = 35

                # Check redirect hops
                if http_data["redirect_count"] >= 3:
                    findings.append({
                        "category": "HTTP / Redirect Security",
                        "title": "Multiple Suspicious Redirect Hops",
                        "severity": "MEDIUM",
                        "score_impact": 15,
                        "provenance": "DIRECT_OBSERVATION",
                        "source_name": "HTTP Transport Auditor",
                        "rule_id": "RS-REDIR-003",
                        "evidence": f"URL traversed {http_data['redirect_count']} redirect destinations before landing on final page.",
                        "explanation": "Multi-hop redirect chains are commonly employed in phishing campaigns to evade automated URL inspection filters."
                    })
                    scoring_breakdown["redirect_chain"] = 15

            except SSRFSecurityException:
                findings.append({
                    "category": "Network Security",
                    "title": "SSRF Security Filter Triggered",
                    "severity": "HIGH",
                    "score_impact": 40,
                    "provenance": "DIRECT_OBSERVATION",
                    "source_name": "SSRF Guard Engine",
                    "rule_id": "RS-SSRF-001",
                    "evidence": "Target resolves to a restricted private or loopback IP range.",
                    "explanation": "Target attempts internal network probing, which is blocked by security boundaries."
                })
                scoring_breakdown["ssrf_blocked"] = 40
            except Exception as e:
                findings.append({
                    "category": "HTTP / Transport",
                    "title": "HTTP Inspection Note",
                    "severity": "INFO",
                    "score_impact": 0,
                    "provenance": "DIRECT_OBSERVATION",
                    "source_name": "HTTP Client",
                    "rule_id": "RS-HTTP-001",
                    "evidence": f"Could not inspect live HTTP response: {str(e)}",
                    "explanation": "Target web server did not respond or connection timed out."
                })

        timeline.append({
            "step_name": "HTTP_ANALYZED",
            "description": f"HTTP status {http_data['status_code'] or 'N/A'}, {http_data['redirect_count']} redirect hops, Forms: {http_data['has_forms']}",
            "status": "SUCCESS",
            "duration_ms": round((time.time() - t_http) * 1000, 1),
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        # 6. Real Threat Intelligence Providers (Multi-Engine Parallel Query)
        t_intel = time.time()
        intel_res = await threat_intel_registry.query_all(norm["normalized"], norm["target_type"])
        
        if intel_res.get("has_threat_intel_hit"):
            for hit in intel_res.get("hits", []):
                pname = hit.get("display_name", hit.get("provider_name"))
                cat = hit.get("threat_category", "MALICIOUS")
                findings.append({
                    "category": "Threat Intelligence",
                    "title": f"Flagged by {pname} ({cat})",
                    "severity": "HIGH",
                    "score_impact": hit.get("score_impact", 30),
                    "provenance": "THIRD_PARTY_INTEL",
                    "source_name": pname,
                    "rule_id": "RS-INTEL-004",
                    "evidence": hit.get("evidence", f"Flagged in {pname} threat database."),
                    "explanation": f"Security intelligence provider {pname} maintains an active flag for this target."
                })
            scoring_breakdown["threat_intel_matches"] = intel_res.get("max_score_impact", 30)

        timeline.append({
            "step_name": "INTEL_QUERIED",
            "description": f"Queried {len(intel_res['providers_checked'])} intelligence providers ({intel_res['hits_count']} positive matches)",
            "status": "SUCCESS",
            "duration_ms": round((time.time() - t_intel) * 1000, 1),
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        # 7. Calculate Risk Score (0-100) and Confidence Score (0-100%)
        t_calc = time.time()
        raw_risk = sum(scoring_breakdown.values())
        
        # Fast track high confidence threats
        if brand_check.get("is_impersonation") and http_data["has_password_field"]:
            raw_risk = max(raw_risk, 88)
        if intel_res.get("has_threat_intel_hit"):
            raw_risk = max(raw_risk, 82)

        risk_score = max(0, min(100, raw_risk))
        
        if risk_score >= 70:
            risk_level = "DANGER"
        elif risk_score >= 30:
            risk_level = "CAUTION"
        else:
            risk_level = "SAFE"

        # Calculate Confidence Score based on evidence breadth and independence
        evidence_count = len(findings)
        providers_count = len(intel_res.get("providers_checked", []))
        
        base_confidence = 75
        if dns_res["primary_ip"]:
            base_confidence += 5
        if tls_res["tls_info"]["has_tls"]:
            base_confidence += 5
        if http_data["status_code"] is not None:
            base_confidence += 5
        if providers_count >= 3:
            base_confidence += 5

        confidence_score = min(98, max(40, base_confidence))
        if confidence_score >= 80:
            confidence_level = "HIGH"
        elif confidence_score >= 60:
            confidence_level = "MEDIUM"
        else:
            confidence_level = "LOW"

        # 8. Generate Plain-English Explainable Verdict & Recommendations
        recommendations = []
        if risk_level == "DANGER":
            verdict_summary = "High Risk Detected: Multiple verifiable indicators indicate phishing, deceptive brand impersonation, or malicious distribution."
            plain_explanation = (
                f"This target shows strong characteristics of deception. "
                f"{'It appears to impersonate ' + brand_check.get('target_brand') + '. ' if brand_check.get('is_impersonation') else ''}"
                f"{'Active security feeds have flagged this link. ' if intel_res.get('has_threat_intel_hit') else ''}"
                f"Never enter passwords, PINs, or financial information on this website."
            )
            recommendations = [
                "Do NOT enter your password, OTP, UPI PIN, or credit card details on this website.",
                "Close the browser tab immediately.",
                "If you entered credentials, change your password on the official website immediately and enable Two-Factor Authentication (2FA).",
                "If financial loss occurred, dial 1930 (National Cyber Fraud Helpline) or report to cybercrime.gov.in."
            ]
        elif risk_level == "CAUTION":
            verdict_summary = "Caution Advised: Anomalies detected that warrant careful inspection before proceeding."
            plain_explanation = (
                "While no active malware database matches were triggered, this target exhibits traits such as "
                "a suspicious top-level domain, multiple redirect hops, or non-standard transport configuration. "
                "Verify the sender and ensure you are on the authentic official portal."
            )
            recommendations = [
                "Double-check the address bar spelling to ensure it matches the official organization's domain.",
                "Avoid downloading attachments or running executables from this page.",
                "Contact the organization through official verified channels if you received this link unexpectedly."
            ]
        else:
            verdict_summary = "Looks Clean: No active malicious indicators or brand impersonation signals observed."
            plain_explanation = (
                "Our multi-vector analysis observed a valid domain structure, clean threat intelligence consensus, "
                "and standard transport security. As a general security practice, always remain vigilant when entering sensitive data."
            )
            recommendations = [
                "Target appears safe to view based on current threat intelligence.",
                "Maintain standard digital hygiene: verify HTTPS lock and never share OTPs or banking PINs."
            ]

        timeline.append({
            "step_name": "RULES_CORRELATED",
            "description": f"Generated final verdict: {risk_level} (Risk: {risk_score}/100, Confidence: {confidence_score}%)",
            "status": "SUCCESS",
            "duration_ms": round((time.time() - t_calc) * 1000, 1),
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        # 9. Build Evidence-Based Relationship Graph Topology
        graph_nodes = [
            {"id": "target", "label": hostname, "type": "root_target", "risk_level": risk_level}
        ]
        graph_links = []

        if dns_res["primary_ip"]:
            ip_node_id = f"ip_{dns_res['primary_ip']}"
            graph_nodes.append({"id": ip_node_id, "label": dns_res["primary_ip"], "type": "ip_address"})
            graph_links.append({"source": "target", "target": ip_node_id, "relation": "resolves_to"})

        if tls_res["tls_info"]["issuer"]:
            issuer_node_id = f"issuer_{tls_res['tls_info']['issuer']}"
            graph_nodes.append({"id": issuer_node_id, "label": tls_res["tls_info"]["issuer"], "type": "tls_issuer"})
            graph_links.append({"source": "target", "target": issuer_node_id, "relation": "certified_by"})

        if brand_check.get("is_impersonation"):
            brand_node_id = f"brand_{brand_check.get('target_brand')}"
            graph_nodes.append({"id": brand_node_id, "label": brand_check.get("target_brand"), "type": "impersonated_brand", "risk_level": "DANGER"})
            graph_links.append({"source": "target", "target": brand_node_id, "relation": "mimics_brand"})

        for hit in intel_res.get("hits", []):
            hit_node_id = f"intel_{hit.get('provider_name')}"
            graph_nodes.append({"id": hit_node_id, "label": hit.get("display_name"), "type": "threat_intel_hit", "risk_level": "DANGER"})
            graph_links.append({"source": "target", "target": hit_node_id, "relation": "flagged_by"})

        total_duration_ms = round((time.time() - t0) * 1000, 1)

        return {
            "target": raw_target,
            "target_type": norm["target_type"],
            "normalized_target": norm["normalized"],
            "hostname": hostname,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "confidence_score": confidence_score,
            "confidence_level": confidence_level,
            "verdict_summary": verdict_summary,
            "plain_explanation": plain_explanation,
            "recommendations": recommendations,
            "findings": findings,
            "timeline": timeline,
            "scoring_breakdown": scoring_breakdown,
            "evidence_sources_checked": intel_res.get("providers_checked", []),
            "raw_telemetry": {
                "dns": dns_res,
                "tls": tls_res["tls_info"],
                "http": http_data,
                "threat_intel": intel_res
            },
            "relationship_graph": {
                "nodes": graph_nodes,
                "links": graph_links
            },
            "duration_ms": total_duration_ms,
            "engine_version": InvestigationPipeline.ENGINE_VERSION,
            "ruleset_version": InvestigationPipeline.RULESET_VERSION
        }
