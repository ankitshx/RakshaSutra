"""
RakshaSutra OSINT (Open Source Intelligence) & Digital Reconnaissance Engine
Provides passive, asynchronous multi-vector footprinting across Usernames, Domains, Emails, and Phone numbers.
Includes graph synthesizer for interactive visual intelligence mapping.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import asyncio
import httpx
import hashlib
import re
import socket

router = APIRouter(prefix="/osint", tags=["OSINT Reconnaissance"])

# ---------------------------------------------------------------------------
# Request & Response Schemas
# ---------------------------------------------------------------------------

class UsernameReconRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=50)

class DomainReconRequest(BaseModel):
    domain: str = Field(..., min_length=3)

class EmailReconRequest(BaseModel):
    email: str = Field(..., min_length=5)

class PhoneReconRequest(BaseModel):
    phone: str = Field(..., min_length=6)

class FullReconRequest(BaseModel):
    target: str = Field(..., min_length=2)
    target_type: Optional[str] = "auto"  # "auto", "username", "domain", "email", "phone"


# ---------------------------------------------------------------------------
# 1. USERNAME RECON ENGINE (40+ Top Platforms)
# ---------------------------------------------------------------------------

SOCIAL_TARGETS = [
    # Developer & Tech
    {"name": "GitHub", "cat": "Developer", "url": "https://github.com/{}", "check": "status_200", "icon": "github"},
    {"name": "GitLab", "cat": "Developer", "url": "https://gitlab.com/{}", "check": "status_200", "icon": "gitlab"},
    {"name": "DockerHub", "cat": "Developer", "url": "https://hub.docker.com/u/{}", "check": "status_200", "icon": "box"},
    {"name": "NPM", "cat": "Developer", "url": "https://www.npmjs.com/~{}", "check": "status_200", "icon": "package"},
    {"name": "PyPI", "cat": "Developer", "url": "https://pypi.org/user/{}/", "check": "status_200", "icon": "terminal"},
    {"name": "Dev.to", "cat": "Developer", "url": "https://dev.to/{}", "check": "status_200", "icon": "code"},
    {"name": "HackerNews", "cat": "Developer", "url": "https://news.ycombinator.com/user?id={}", "check": "hn_check", "icon": "terminal"},
    {"name": "Replit", "cat": "Developer", "url": "https://replit.com/@{}", "check": "status_200", "icon": "code"},
    {"name": "LeetCode", "cat": "Developer", "url": "https://leetcode.com/u/{}/", "check": "status_200", "icon": "code"},

    # Social & Messaging
    {"name": "Instagram", "cat": "Social", "url": "https://www.instagram.com/api/v1/users/web_profile_info/?username={}", "check": "instagram_api", "icon": "instagram"},
    {"name": "Telegram", "cat": "Social", "url": "https://t.me/{}", "check": "telegram_check", "icon": "send"},
    {"name": "Reddit", "cat": "Social", "url": "https://www.reddit.com/user/{}/about.json", "check": "reddit_json", "icon": "message-circle"},
    {"name": "X (Twitter)", "cat": "Social", "url": "https://x.com/{}", "check": "status_200", "icon": "twitter"},
    {"name": "Pinterest", "cat": "Social", "url": "https://www.pinterest.com/{}/", "check": "status_200", "icon": "image"},
    {"name": "Medium", "cat": "Social", "url": "https://medium.com/@{}", "check": "status_200", "icon": "book-open"},
    {"name": "Mastodon", "cat": "Social", "url": "https://mastodon.social/@{}", "check": "status_200", "icon": "share-2"},
    {"name": "Keybase", "cat": "Social", "url": "https://keybase.io/{}", "check": "status_200", "icon": "key"},
    {"name": "Pastebin", "cat": "Social", "url": "https://pastebin.com/u/{}", "check": "status_200", "icon": "file-text"},
    {"name": "Quora", "cat": "Social", "url": "https://www.quora.com/profile/{}", "check": "status_200", "icon": "help-circle"},
    {"name": "Tumblr", "cat": "Social", "url": "https://{}.tumblr.com", "check": "status_200", "icon": "layout"},
    {"name": "About.me", "cat": "Social", "url": "https://about.me/{}", "check": "status_200", "icon": "user"},

    # Gaming & Entertainment
    {"name": "Steam", "cat": "Gaming", "url": "https://steamcommunity.com/id/{}", "check": "steam_check", "icon": "gamepad-2"},
    {"name": "Chess.com", "cat": "Gaming", "url": "https://api.chess.com/pub/player/{}", "check": "status_200", "icon": "shield"},
    {"name": "Twitch", "cat": "Gaming", "url": "https://www.twitch.tv/{}", "check": "status_200", "icon": "tv"},
    {"name": "Roblox", "cat": "Gaming", "url": "https://www.roblox.com/user.aspx?username={}", "check": "status_200", "icon": "play"},
    {"name": "SoundCloud", "cat": "Media", "url": "https://soundcloud.com/{}", "check": "status_200", "icon": "music"},
    {"name": "Spotify", "cat": "Media", "url": "https://open.spotify.com/user/{}", "check": "status_200", "icon": "headphones"},
    {"name": "Vimeo", "cat": "Media", "url": "https://vimeo.com/{}", "check": "status_200", "icon": "video"},
    {"name": "Flickr", "cat": "Media", "url": "https://www.flickr.com/people/{}", "check": "status_200", "icon": "camera"},
    {"name": "Dribbble", "cat": "Design", "url": "https://dribbble.com/{}", "check": "status_200", "icon": "pen-tool"},
    {"name": "Behance", "cat": "Design", "url": "https://www.behance.net/{}", "check": "status_200", "icon": "layout"},
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9"
}

async def probe_single_target(client: httpx.AsyncClient, target: Dict[str, str], username: str) -> Dict[str, Any]:
    url = target["url"].format(username)
    display_url = url
    if target["check"] == "reddit_json":
        display_url = f"https://www.reddit.com/user/{username}"
    elif target["check"] == "instagram_api":
        display_url = f"https://www.instagram.com/{username}/"

    res_data = {
        "platform": target["name"],
        "category": target["cat"],
        "url": display_url,
        "exists": False,
        "icon": target.get("icon", "globe"),
        "status_code": 0,
        "latency_ms": 0
    }

    try:
        import time
        t0 = time.time()
        headers = dict(HEADERS)
        if target["check"] == "instagram_api":
            headers["X-IG-App-ID"] = "936619743392459"

        r = await client.get(url, headers=headers, timeout=3.5, follow_redirects=True)
        latency = int((time.time() - t0) * 1000)
        res_data["status_code"] = r.status_code
        res_data["latency_ms"] = latency

        if target["check"] == "status_200":
            if r.status_code == 200 and "not found" not in r.text.lower() and "404" not in r.text:
                res_data["exists"] = True
        elif target["check"] == "instagram_api":
            if r.status_code == 200:
                data = r.json()
                if "data" in data and data.get("data", {}).get("user"):
                    res_data["exists"] = True
            elif r.status_code == 404:
                res_data["exists"] = False
        elif target["check"] == "reddit_json":
            if r.status_code == 200:
                data = r.json()
                if "data" in data and "name" in data["data"]:
                    res_data["exists"] = True
        elif target["check"] == "telegram_check":
            if r.status_code == 200 and 'tgme_page_extra' in r.text and 'If you have Telegram' in r.text:
                res_data["exists"] = True
        elif target["check"] == "hn_check":
            if r.status_code == 200 and 'No such user.' not in r.text:
                res_data["exists"] = True
        elif target["check"] == "steam_check":
            if r.status_code == 200 and 'The specified profile could not be found.' not in r.text:
                res_data["exists"] = True
    except Exception:
        res_data["exists"] = False

    return res_data


# ---------------------------------------------------------------------------
# 2. DOMAIN & INFRASTRUCTURE OSINT
# ---------------------------------------------------------------------------

async def resolve_domain_osint(domain: str) -> Dict[str, Any]:
    domain = re.sub(r"^https?://", "", domain).split("/")[0].strip()

    dns_records: Dict[str, List[str]] = {
        "A": [],
        "AAAA": [],
        "MX": [],
        "TXT": [],
        "NS": [],
        "SOA": []
    }
    ip_addresses = []
    mail_servers = []
    dmarc_status = "Missing (Vulnerable to Email Spoofing)"
    spf_record = None

    try:
        loop = asyncio.get_event_loop()
        try:
            addr_info = await loop.getaddrinfo(domain, 80, family=socket.AF_INET)
            ip_addresses = list(set([item[4][0] for item in addr_info]))
            dns_records["A"] = ip_addresses
        except Exception:
            pass

        try:
            import dns.resolver
            resolver = dns.resolver.Resolver()
            resolver.timeout = 2.0
            resolver.lifetime = 2.0

            for qtype in ["MX", "TXT", "NS", "SOA", "AAAA"]:
                try:
                    answers = resolver.resolve(domain, qtype)
                    dns_records[qtype] = [str(rdata) for rdata in answers]
                except Exception:
                    pass

            mail_servers = dns_records.get("MX", [])

            for txt in dns_records.get("TXT", []):
                if "v=spf1" in txt:
                    spf_record = txt

            try:
                dmarc_answers = resolver.resolve(f"_dmarc.{domain}", "TXT")
                dmarc_txt = [str(r) for r in dmarc_answers]
                if dmarc_txt:
                    dmarc_status = f"Enforced ({dmarc_txt[0][:40]}...)"
            except Exception:
                dmarc_status = "Not Configured (High Spoofing Risk)"
        except Exception:
            pass
    except Exception:
        pass

    subdomains = set()
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            res = await client.get(f"https://crt.sh/?q=%.{domain}&output=json", headers=HEADERS)
            if res.status_code == 200:
                data = res.json()
                for entry in data[:20]:
                    name_val = entry.get("name_value", "")
                    for sub in name_val.split("\n"):
                        sub = sub.strip().lower()
                        if "*" not in sub and sub.endswith(domain) and sub != domain:
                            subdomains.add(sub)
    except Exception:
        common_subs = ["api", "mail", "admin", "vpn", "portal", "dev", "staging", "auth", "cpanel", "webmail"]
        for s in common_subs:
            try:
                sub_host = f"{s}.{domain}"
                socket.gethostbyname(sub_host)
                subdomains.add(sub_host)
            except Exception:
                pass

    cloud_provider = "Standard Web Hosting"
    if ip_addresses:
        ip = ip_addresses[0]
        if ip.startswith(("104.", "172.", "188.114.", "190.93.")):
            cloud_provider = "Cloudflare Anycast WAF"
        elif ip.startswith(("52.", "54.", "3.", "13.", "18.", "34.", "35.")):
            cloud_provider = "Amazon Web Services (AWS)"
        elif ip.startswith(("34.", "35.", "104.196.", "104.197.")):
            cloud_provider = "Google Cloud Platform (GCP)"
        elif ip.startswith(("20.", "40.", "51.", "137.")):
            cloud_provider = "Microsoft Azure"
        elif ip.startswith(("159.65.", "167.99.", "178.62.", "138.68.")):
            cloud_provider = "DigitalOcean"

    return {
        "domain": domain,
        "ip_addresses": ip_addresses,
        "dns_records": dns_records,
        "mail_servers": mail_servers,
        "cloud_provider": cloud_provider,
        "dmarc_status": dmarc_status,
        "spf_record": spf_record or "None detected",
        "subdomains": sorted(list(subdomains))[:15],
        "subdomain_count": len(subdomains)
    }


# ---------------------------------------------------------------------------
# 3. EMAIL OSINT PROFILER
# ---------------------------------------------------------------------------

async def resolve_email_osint(email: str) -> Dict[str, Any]:
    email = email.strip().lower()
    parts = email.split("@")
    if len(parts) != 2:
        raise HTTPException(status_code=400, detail="Invalid email format")

    username, domain = parts[0], parts[1]

    email_md5 = hashlib.md5(email.encode("utf-8")).hexdigest()
    gravatar_url = f"https://www.gravatar.com/avatar/{email_md5}?d=404"
    gravatar_profile_url = f"https://www.gravatar.com/{email_md5}.json"
    has_gravatar = False
    profile_data = None

    try:
        async with httpx.AsyncClient(timeout=2.5) as client:
            g_res = await client.get(gravatar_url)
            if g_res.status_code == 200:
                has_gravatar = True
                try:
                    p_res = await client.get(gravatar_profile_url)
                    if p_res.status_code == 200:
                        profile_data = p_res.json()
                except Exception:
                    pass
    except Exception:
        pass

    disposable_domains = [
        "tempmail.com", "mailinator.com", "10minutemail.com", "guerrillamail.com",
        "throwawaymail.com", "yopmail.com", "sharklasers.com", "getnada.com", "trashmail.com"
    ]
    is_disposable = domain in disposable_domains

    tenant_provider = "Custom Enterprise Mail Server"
    if "gmail.com" in domain or "google" in domain:
        tenant_provider = "Google Workspace / Gmail"
    elif "outlook.com" in domain or "hotmail.com" in domain or "live.com" in domain:
        tenant_provider = "Microsoft 365 / Outlook"
    elif "yahoo" in domain:
        tenant_provider = "Yahoo Mail"
    elif "proton" in domain:
        tenant_provider = "ProtonMail (End-to-End Encrypted)"
    elif "icloud.com" in domain or "me.com" in domain:
        tenant_provider = "Apple iCloud Mail"
    else:
        try:
            import dns.resolver
            resolver = dns.resolver.Resolver()
            mx_ans = resolver.resolve(domain, "MX")
            mx_str = " ".join([str(r) for r in mx_ans]).lower()
            if "google" in mx_str or "aspmx" in mx_str:
                tenant_provider = "Google Workspace (Custom Domain)"
            elif "outlook" in mx_str or "protection.outlook" in mx_str:
                tenant_provider = "Microsoft 365 Exchange Online"
            elif "zoho" in mx_str:
                tenant_provider = "Zoho Mail"
        except Exception:
            pass

    return {
        "email": email,
        "username": username,
        "domain": domain,
        "is_disposable": is_disposable,
        "tenant_provider": tenant_provider,
        "has_gravatar": has_gravatar,
        "gravatar_avatar": f"https://www.gravatar.com/avatar/{email_md5}?s=200" if has_gravatar else None,
        "gravatar_profile": profile_data,
        "risk_level": "HIGH" if is_disposable else "LOW"
    }


# ---------------------------------------------------------------------------
# 4. PHONE & TELECOM SCAM INTELLIGENCE
# ---------------------------------------------------------------------------

def resolve_phone_osint(phone: str) -> Dict[str, Any]:
    cleaned = re.sub(r"[^\d+]", "", phone)
    country_code = "Unknown"
    country_name = "International"
    carrier = "Unknown Operator"
    telecom_circle = "Global / Roaming"
    line_type = "Mobile (Cellular)"
    is_valid = True
    scam_risk = "LOW"

    if cleaned.startswith("+91") or (len(cleaned) == 10 and cleaned[0] in "6789"):
        country_code = "+91"
        country_name = "India 🇮🇳"
        num = cleaned[-10:]
        prefix_4 = num[:4]
        prefix_2 = num[:2]

        if prefix_2 in ["98", "99", "97", "96", "95", "94", "93", "92", "91", "90"]:
            carrier = "Airtel / Vodafone-Idea / BSNL"
        elif prefix_2 in ["70", "79", "78", "77", "76", "75", "74", "73", "72", "71"]:
            carrier = "Jio / Airtel Digital"
        elif prefix_2 in ["62", "63", "60"]:
            carrier = "Reliance Jio Infocomm"
        else:
            carrier = "Indian Cellular Operator"

        circle_map = {
            "9810": "Delhi NCR", "9811": "Delhi NCR", "9818": "Delhi NCR",
            "9820": "Mumbai", "9821": "Mumbai", "9819": "Mumbai",
            "9830": "Kolkata", "9831": "Kolkata",
            "9840": "Chennai", "9841": "Chennai",
            "9845": "Karnataka / Bengaluru", "9886": "Karnataka / Bengaluru",
            "9848": "Andhra Pradesh & Telangana", "9849": "Andhra Pradesh & Telangana",
            "9822": "Maharashtra & Goa", "9823": "Maharashtra & Goa",
            "9829": "Rajasthan", "9828": "Rajasthan",
            "9814": "Punjab", "9815": "Punjab",
            "9896": "Haryana", "9897": "UP West", "9839": "UP East"
        }
        telecom_circle = circle_map.get(prefix_4, "India National Roaming")

        if num.startswith(("92", "90")) and carrier == "Indian Cellular Operator":
            line_type = "Virtual / VoIP Gateway"
            scam_risk = "SUSPICIOUS"

    elif cleaned.startswith("+1"):
        country_code = "+1"
        country_name = "USA / Canada 🇺🇸"
        carrier = "North American Cellular Network"
        telecom_circle = "North America"
    elif cleaned.startswith("+44"):
        country_code = "+44"
        country_name = "United Kingdom 🇬🇧"
        carrier = "UK Mobile Network (EE/Vodafone/O2)"
        telecom_circle = "United Kingdom"
    elif cleaned.startswith("+971"):
        country_code = "+971"
        country_name = "United Arab Emirates 🇦🇪"
        carrier = "Etisalat / du"
        telecom_circle = "UAE / Dubai"

    return {
        "raw_phone": phone,
        "e164_format": cleaned if cleaned.startswith("+") else f"+91{cleaned}",
        "country": country_name,
        "country_code": country_code,
        "carrier": carrier,
        "telecom_circle": telecom_circle,
        "line_type": line_type,
        "is_valid": is_valid,
        "scam_risk": scam_risk,
        "advisory": "Banks, Government & Electricity boards never send SMS from personal 10-digit mobile numbers."
    }


# ---------------------------------------------------------------------------
# 5. GRAPH NODE & EDGE SYNTHESIZER
# ---------------------------------------------------------------------------

def synthesize_threat_graph(target: str, data: Dict[str, Any], recon_type: str) -> Dict[str, Any]:
    nodes = []
    edges = []

    root_id = "target_root"
    nodes.append({
        "id": root_id,
        "label": target,
        "type": "root",
        "category": recon_type.upper(),
        "color": "#00f0ff",
        "size": 32,
        "details": f"Investigated Target: {target}"
    })

    if recon_type == "username":
        for idx, item in enumerate(data.get("matches", [])):
            node_id = f"social_{idx}"
            nodes.append({
                "id": node_id,
                "label": f"{item['platform']} (@{target})",
                "type": "profile",
                "category": item["category"],
                "color": "#10b981" if item["category"] == "Developer" else "#38bdf8",
                "size": 22,
                "url": item["url"],
                "details": f"Verified profile on {item['platform']}"
            })
            edges.append({
                "source": root_id,
                "target": node_id,
                "label": "IDENTIFIED_ACCOUNT"
            })

    elif recon_type == "domain":
        for idx, ip in enumerate(data.get("ip_addresses", [])):
            ip_node = f"ip_{idx}"
            nodes.append({
                "id": ip_node,
                "label": ip,
                "type": "ip",
                "category": "Network",
                "color": "#f59e0b",
                "size": 24,
                "details": f"Server IP ({data.get('cloud_provider')})"
            })
            edges.append({
                "source": root_id,
                "target": ip_node,
                "label": "RESOLVES_TO_IP"
            })

        host_id = "host_provider"
        nodes.append({
            "id": host_id,
            "label": data.get("cloud_provider", "Web Host"),
            "type": "infrastructure",
            "category": "Cloud ASN",
            "color": "#ec4899",
            "size": 26,
            "details": "Hosting / CDN Infrastructure"
        })
        edges.append({
            "source": root_id,
            "target": host_id,
            "label": "HOSTED_ON"
        })

        for idx, sub in enumerate(data.get("subdomains", [])[:6]):
            sub_id = f"sub_{idx}"
            nodes.append({
                "id": sub_id,
                "label": sub,
                "type": "subdomain",
                "category": "Subdomain",
                "color": "#8b5cf6",
                "size": 18,
                "details": "Discovered Host / Endpoint"
            })
            edges.append({
                "source": root_id,
                "target": sub_id,
                "label": "SUBDOMAIN_OF"
            })

    elif recon_type == "email":
        tenant_id = "email_tenant"
        nodes.append({
            "id": tenant_id,
            "label": data.get("tenant_provider", "Mail Server"),
            "type": "mail_server",
            "category": "Tenant",
            "color": "#10b981",
            "size": 26,
            "details": "Identified Mail Exchange Tenant"
        })
        edges.append({
            "source": root_id,
            "target": tenant_id,
            "label": "MAIL_EXCHANGER"
        })

    elif recon_type == "phone":
        carrier_id = "carrier_node"
        nodes.append({
            "id": carrier_id,
            "label": data.get("carrier", "Carrier"),
            "type": "carrier",
            "category": "Telecom",
            "color": "#10b981",
            "size": 24,
            "details": f"Operator: {data.get('carrier')}"
        })
        edges.append({
            "source": root_id,
            "target": carrier_id,
            "label": "TELECOM_CARRIER"
        })

        circle_id = "circle_node"
        nodes.append({
            "id": circle_id,
            "label": data.get("telecom_circle", "Circle"),
            "type": "circle",
            "category": "Geography",
            "color": "#f59e0b",
            "size": 22,
            "details": f"Region: {data.get('telecom_circle')}"
        })
        edges.append({
            "source": root_id,
            "target": circle_id,
            "label": "REGISTERED_CIRCLE"
        })

    return {
        "nodes": nodes,
        "edges": edges
    }


# ---------------------------------------------------------------------------
# API ROUTER ENDPOINTS
# ---------------------------------------------------------------------------

@router.post("/username")
async def scan_username(payload: UsernameReconRequest):
    username = payload.username.strip().lstrip("@")
    async with httpx.AsyncClient(timeout=3.5) as client:
        tasks = [probe_single_target(client, t, username) for t in SOCIAL_TARGETS]
        results = await asyncio.gather(*tasks, return_exceptions=False)

    matches = [r for r in results if r["exists"]]
    graph = synthesize_threat_graph(username, {"matches": matches}, "username")

    return {
        "username": username,
        "total_probes": len(SOCIAL_TARGETS),
        "found_count": len(matches),
        "matches": matches,
        "all_results": results,
        "graph": graph
    }


@router.post("/domain")
async def scan_domain(payload: DomainReconRequest):
    data = await resolve_domain_osint(payload.domain)
    graph = synthesize_threat_graph(data["domain"], data, "domain")
    return {
        **data,
        "graph": graph
    }


@router.post("/email")
async def scan_email(payload: EmailReconRequest):
    data = await resolve_email_osint(payload.email)
    graph = synthesize_threat_graph(data["email"], data, "email")
    return {
        **data,
        "graph": graph
    }


@router.post("/phone")
async def scan_phone(payload: PhoneReconRequest):
    data = resolve_phone_osint(payload.phone)
    graph = synthesize_threat_graph(data["e164_format"], data, "phone")
    return {
        **data,
        "graph": graph
    }


@router.post("/full-recon")
async def full_osint_recon(payload: FullReconRequest):
    target = payload.target.strip()

    detected_type = payload.target_type or "auto"
    if detected_type == "auto":
        if "@" in target and "." in target:
            detected_type = "email"
        elif target.startswith("+") or (target.replace(" ", "").isdigit() and len(target.replace(" ", "")) >= 10):
            detected_type = "phone"
        elif "." in target and not target.startswith("@"):
            detected_type = "domain"
        else:
            detected_type = "username"

    if detected_type == "username":
        return await scan_username(UsernameReconRequest(username=target))
    elif detected_type == "domain":
        return await scan_domain(DomainReconRequest(domain=target))
    elif detected_type == "email":
        return await scan_email(EmailReconRequest(email=target))
    elif detected_type == "phone":
        return await scan_phone(PhoneReconRequest(phone=target))
    else:
        raise HTTPException(status_code=400, detail="Unable to determine OSINT investigation target type.")
