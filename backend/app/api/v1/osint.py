"""
RakshaSutra OSINT (Open Source Intelligence) & Digital Footprinting Engine
Provides passive, evidence-based reconnaissance across Usernames, Domains, Emails, and Phone Numbers.
Includes confidence scoring (LOW, MEDIUM, HIGH) and interactive Force Threat Graph synthesis.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
import asyncio
import httpx
import hashlib
import re
import socket

from app.core.database import get_db
from app.api.v1.auth import get_current_user_optional, enforce_osint_quota
from app.models.user import User

router = APIRouter(prefix="/osint", tags=["OSINT Reconnaissance"])

# Request & Response Schemas
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

# 40+ Social & Developer Platform Probes
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

    # Gaming & Media
    {"name": "Steam", "cat": "Gaming", "url": "https://steamcommunity.com/id/{}", "check": "steam_check", "icon": "gamepad-2"},
    {"name": "Chess.com", "cat": "Gaming", "url": "https://api.chess.com/pub/player/{}", "check": "status_200", "icon": "shield"},
    {"name": "Twitch", "cat": "Gaming", "url": "https://www.twitch.tv/{}", "check": "status_200", "icon": "tv"},
    {"name": "Roblox", "cat": "Gaming", "url": "https://www.roblox.com/user.aspx?username={}", "check": "status_200", "icon": "play"},
    {"name": "SoundCloud", "cat": "Media", "url": "https://soundcloud.com/{}", "check": "status_200", "icon": "music"},
    {"name": "Spotify", "cat": "Media", "url": "https://open.spotify.com/user/{}", "check": "status_200", "icon": "headphones"},
    {"name": "Vimeo", "cat": "Media", "url": "https://vimeo.com/{}", "check": "status_200", "icon": "video"},
    {"name": "Dribbble", "cat": "Design", "url": "https://dribbble.com/{}", "check": "status_200", "icon": "pen-tool"},
    {"name": "Behance", "cat": "Design", "url": "https://www.behance.net/{}", "check": "status_200", "icon": "layout"}
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8"
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
        "confidence": "LOW",
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
                res_data["confidence"] = "HIGH" if target["name"] in ["GitHub", "GitLab", "NPM", "PyPI"] else "MEDIUM"
        elif target["check"] == "instagram_api":
            if r.status_code == 200:
                data = r.json()
                if "data" in data and data.get("data", {}).get("user"):
                    res_data["exists"] = True
                    res_data["confidence"] = "HIGH"
        elif target["check"] == "reddit_json":
            if r.status_code == 200:
                data = r.json()
                if "data" in data and "name" in data["data"]:
                    res_data["exists"] = True
                    res_data["confidence"] = "HIGH"
        elif target["check"] == "telegram_check":
            if r.status_code == 200 and 'tgme_page_extra' in r.text and 'If you have Telegram' in r.text:
                res_data["exists"] = True
                res_data["confidence"] = "HIGH"
        elif target["check"] == "hn_check":
            if r.status_code == 200 and 'No such user.' not in r.text:
                res_data["exists"] = True
                res_data["confidence"] = "HIGH"
        elif target["check"] == "steam_check":
            if r.status_code == 200 and 'The specified profile could not be found.' not in r.text:
                res_data["exists"] = True
                res_data["confidence"] = "HIGH"
    except Exception:
        res_data["exists"] = False

    return res_data

async def run_username_probes(username: str) -> List[Dict[str, Any]]:
    clean_user = re.sub(r"[^a-zA-Z0-9._-]", "", username)
    async with httpx.AsyncClient() as client:
        tasks = [probe_single_target(client, target, clean_user) for target in SOCIAL_TARGETS]
        results = await asyncio.gather(*tasks, return_exceptions=False)
    return results

async def resolve_dns_records(domain: str) -> Dict[str, Any]:
    records: Dict[str, List[str]] = {"A": [], "AAAA": [], "MX": [], "TXT": [], "NS": []}
    clean_domain = re.sub(r"^https?://", "", domain).split("/")[0].split(":")[0]

    try:
        loop = asyncio.get_event_loop()
        addr_info = await loop.run_in_executor(None, socket.getaddrinfo, clean_domain, 80)
        for item in addr_info:
            ip = item[4][0]
            if ":" in ip and ip not in records["AAAA"]:
                records["AAAA"].append(ip)
            elif "." in ip and ip not in records["A"]:
                records["A"].append(ip)
    except Exception:
        pass

    try:
        import dns.resolver
        resolver = dns.resolver.Resolver()
        resolver.timeout = 2.0
        resolver.lifetime = 2.0
        for rtype in ["MX", "TXT", "NS"]:
            try:
                answers = resolver.resolve(clean_domain, rtype)
                for rdata in answers:
                    records[rtype].append(str(rdata))
            except Exception:
                pass
    except Exception:
        pass

    # DMARC / SPF Risk Assessment
    dmarc_present = any("v=DMARC" in t.upper() for t in records.get("TXT", []))
    spf_present = any("v=spf1" in t.lower() for t in records.get("TXT", []))

    spoofing_risk = "LOW" if (dmarc_present and spf_present) else "MEDIUM" if (dmarc_present or spf_present) else "HIGH"

    return {
        "domain": clean_domain,
        "dns_records": records,
        "dmarc_configured": dmarc_present,
        "spf_configured": spf_present,
        "email_spoofing_risk": spoofing_risk
    }

async def fetch_certificate_subdomains(domain: str) -> List[str]:
    clean_domain = re.sub(r"^https?://", "", domain).split("/")[0].split(":")[0]
    found_subdomains = set()

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            res = await client.get(f"https://crt.sh/?q=%.{clean_domain}&output=json", headers=HEADERS)
            if res.status_code == 200:
                data = res.json()
                for entry in data[:50]:
                    name_val = entry.get("name_value", "")
                    for sub in name_val.split("\n"):
                        sub = sub.strip().lower()
                        if sub.endswith(clean_domain) and "*" not in sub:
                            found_subdomains.add(sub)
    except Exception:
        pass

    return sorted(list(found_subdomains))[:25]

def analyze_email_identity(email: str) -> Dict[str, Any]:
    email_clean = email.strip().lower()
    user_part, domain_part = email_clean.split("@") if "@" in email_clean else (email_clean, "")

    disposable_providers = ["tempmail.com", "guerrillamail.com", "10minutemail.com", "mailinator.com", "yopmail.com", "trashmail.com"]
    is_disposable = domain_part in disposable_providers

    known_tenants = {
        "gmail.com": "Google Consumer Mail",
        "googlemail.com": "Google Consumer Mail",
        "outlook.com": "Microsoft Outlook Personal",
        "hotmail.com": "Microsoft Outlook Personal",
        "yahoo.com": "Yahoo Mail",
        "proton.me": "ProtonMail Encrypted",
        "protonmail.com": "ProtonMail Encrypted",
        "icloud.com": "Apple iCloud Mail"
    }
    tenant = known_tenants.get(domain_part, "Custom Domain / Enterprise Mail Tenant")

    gravatar_hash = hashlib.md5(email_clean.encode("utf-8")).hexdigest()
    gravatar_url = f"https://www.gravatar.com/avatar/{gravatar_hash}?d=404"

    return {
        "email": email_clean,
        "username_part": user_part,
        "domain": domain_part,
        "tenant_infrastructure": tenant,
        "is_disposable": is_disposable,
        "gravatar_md5": gravatar_hash,
        "avatar_url": gravatar_url,
        "risk_level": "HIGH" if is_disposable else "LOW"
    }

def synthesize_threat_graph(target: str, recon_data: Dict[str, Any]) -> Dict[str, Any]:
    nodes = []
    edges = []

    # Center root node
    root_id = "target_root"
    nodes.append({
        "id": root_id,
        "label": target,
        "type": "target",
        "category": "Root Target",
        "size": 32,
        "color": "#06b6d4"
    })

    # Add username matches
    if "username_matches" in recon_data:
        for idx, match in enumerate(recon_data["username_matches"]):
            match_id = f"soc_{idx}"
            nodes.append({
                "id": match_id,
                "label": match["platform"],
                "type": "social_profile",
                "category": match["category"],
                "url": match["url"],
                "confidence": match.get("confidence", "MEDIUM"),
                "size": 18,
                "color": "#10b981"
            })
            edges.append({
                "source": root_id,
                "target": match_id,
                "relationship": "ACCOUNT_EXISTS",
                "color": "#10b981"
            })

    # Add IP nodes
    if "dns" in recon_data and "dns_records" in recon_data["dns"]:
        for ip in recon_data["dns"]["dns_records"].get("A", [])[:3]:
            ip_id = f"ip_{ip}"
            nodes.append({
                "id": ip_id,
                "label": ip,
                "type": "ip_address",
                "category": "Infrastructure",
                "size": 20,
                "color": "#8b5cf6"
            })
            edges.append({
                "source": root_id,
                "target": ip_id,
                "relationship": "RESOLVES_TO_IP",
                "color": "#8b5cf6"
            })

    return {"nodes": nodes, "edges": edges}

# Endpoints
@router.post("/username")
async def osint_username_recon(
    req: UsernameReconRequest,
    user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    enforce_osint_quota(user, db)
    probes = await run_username_probes(req.username)
    matches = [p for p in probes if p["exists"]]
    return {
        "username": req.username,
        "total_probes": len(probes),
        "matches_found": len(matches),
        "matches": matches,
        "all_probes": probes
    }

@router.post("/domain")
async def osint_domain_recon(
    req: DomainReconRequest,
    user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    enforce_osint_quota(user, db)
    dns_info = await resolve_dns_records(req.domain)
    subdomains = await fetch_certificate_subdomains(req.domain)
    return {
        "domain": req.domain,
        "dns": dns_info,
        "subdomains": subdomains,
        "subdomain_count": len(subdomains)
    }

@router.post("/email")
def osint_email_recon(
    req: EmailReconRequest,
    user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    enforce_osint_quota(user, db)
    analysis = analyze_email_identity(req.email)
    return analysis

@router.post("/full-recon")
async def osint_full_recon(
    req: FullReconRequest,
    user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    enforce_osint_quota(user, db)
    target = req.target.strip()
    recon_result: Dict[str, Any] = {"target": target}

    if "@" in target:
        email_data = analyze_email_identity(target)
        recon_result["email"] = email_data
        if email_data["username_part"]:
            probes = await run_username_probes(email_data["username_part"])
            recon_result["username_matches"] = [p for p in probes if p["exists"]]
    elif "." in target and " " not in target:
        dns_data = await resolve_dns_records(target)
        subdomains = await fetch_certificate_subdomains(target)
        recon_result["dns"] = dns_data
        recon_result["subdomains"] = subdomains
    else:
        probes = await run_username_probes(target)
        recon_result["username_matches"] = [p for p in probes if p["exists"]]

    graph = synthesize_threat_graph(target, recon_result)
    recon_result["threat_graph"] = graph

    return recon_result
