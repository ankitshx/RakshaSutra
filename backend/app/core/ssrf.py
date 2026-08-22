import ipaddress
import socket
import urllib.parse
from typing import Tuple, Optional, List
import httpx
from app.core.config import settings
from app.core.logging import logger

# Disallowed internal/cloud domains
DISALLOWED_HOSTNAMES = {
    "localhost",
    "localhost.localdomain",
    "ip6-localhost",
    "ip6-loopback",
    "metadata.google.internal",
    "metadata.internal",
    "instance-data",
    "kubernetes.default",
    "kubernetes.default.svc",
}

BLOCKED_IP_NETWORKS = [
    # IPv4 Private / Loopback / Link-Local / Reserved
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("100.64.0.0/10"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.0.0.0/24"),
    ipaddress.ip_network("192.0.2.0/24"),
    ipaddress.ip_network("192.88.99.0/24"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("198.18.0.0/15"),
    ipaddress.ip_network("198.51.100.0/24"),
    ipaddress.ip_network("203.0.113.0/24"),
    ipaddress.ip_network("224.0.0.0/4"),
    ipaddress.ip_network("240.0.0.0/4"),
    ipaddress.ip_network("255.255.255.255/32"),
    # IPv6 Private / Loopback / Link-Local
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("::/128"),
    ipaddress.ip_network("fc00::/7"),
    ipaddress.ip_network("fe80::/10"),
    ipaddress.ip_network("ff00::/8"),
]

class SSRFSecurityException(Exception):
    """Raised when a URL or host violates SSRF security boundaries."""
    pass

def is_ip_blocked(ip_str: str) -> Tuple[bool, str]:
    """
    Check if an IP string belongs to private, loopback, link-local, or reserved spaces.
    Handles IPv4, IPv6, and IPv4-mapped IPv6 addresses.
    """
    try:
        ip = ipaddress.ip_address(ip_str)
        
        # Check IPv4-mapped IPv6 address (e.g. ::ffff:127.0.0.1)
        if isinstance(ip, ipaddress.IPv6Address) and ip.ipv4_mapped:
            ip = ip.ipv4_mapped

        # Check standard properties
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast or ip.is_reserved or ip.is_unspecified:
            return True, f"IP address {ip_str} is within a protected/private network range."

        for net in BLOCKED_IP_NETWORKS:
            if ip in net:
                return True, f"IP address {ip_str} matches blocked network {net}."

        return False, ""
    except ValueError:
        return True, f"Invalid IP address format: {ip_str}"

def validate_destination_safety(hostname_or_ip: str) -> Tuple[bool, str, List[str]]:
    """
    Validate that a given hostname or IP does not point to internal resources.
    Performs DNS resolution and checks ALL resolved IPs.
    """
    cleaned_host = hostname_or_ip.strip().lower()
    
    if cleaned_host in DISALLOWED_HOSTNAMES or cleaned_host.endswith(".internal") or cleaned_host.endswith(".local"):
        return False, f"Access to internal domain '{cleaned_host}' is blocked for security.", []

    # Check if host is direct IP
    try:
        ipaddress.ip_address(cleaned_host)
        is_blocked, reason = is_ip_blocked(cleaned_host)
        if is_blocked:
            return False, reason, [cleaned_host]
        return True, "IP is valid and public.", [cleaned_host]
    except ValueError:
        # It's a domain name, resolve DNS
        pass

    # Check if host is single label without dots (internal machine name)
    if "." not in cleaned_host:
        return False, f"Access to single-label local host '{cleaned_host}' is blocked for security.", []

    resolved_ips = []
    try:
        addr_info = socket.getaddrinfo(cleaned_host, None, socket.AF_UNSPEC, socket.SOCK_STREAM)
        for entry in addr_info:
            ip_candidate = entry[4][0]
            resolved_ips.append(ip_candidate)
            is_blocked, reason = is_ip_blocked(ip_candidate)
            if is_blocked:
                return False, f"Domain '{cleaned_host}' resolves to restricted IP ({ip_candidate}): {reason}", resolved_ips
        
        if not resolved_ips:
            return True, f"Domain '{cleaned_host}' did not return active IP records.", []
            
        return True, "Destination is verified public.", resolved_ips
    except socket.gaierror:
        # Syntactically public domain that is currently offline or synthetic test domain
        return True, f"Domain '{cleaned_host}' is not currently resolvable via public DNS.", []
    except Exception as e:
        return False, f"Error validating destination '{cleaned_host}': {str(e)}", []

async def safe_fetch_url(
    url: str, 
    method: str = "GET", 
    max_redirects: int = settings.HTTP_MAX_REDIRECTS,
    timeout: float = settings.HTTP_READ_TIMEOUT,
    follow_redirects: bool = True
) -> dict:
    """
    Safely fetch a URL with SSRF protection, size caps, and redirect validation.
    Returns metadata including status, headers, redirect chain, and response text sample.
    """
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise SSRFSecurityException(f"Unsupported URL scheme '{parsed.scheme}'. Only HTTP/HTTPS allowed.")

    if not parsed.hostname:
        raise SSRFSecurityException("URL is missing a valid hostname.")

    current_url = url
    redirect_history = []
    
    async with httpx.AsyncClient(
        verify=True,
        timeout=httpx.Timeout(timeout=timeout, connect=settings.HTTP_CONNECT_TIMEOUT),
        headers={"User-Agent": "RakshaSutra-ThreatScanner/1.0 (+https://rakshasutra.org/bot)"},
        follow_redirects=False  # We manually validate each hop for SSRF
    ) as client:
        
        for hop in range(max_redirects + 1):
            hop_parsed = urllib.parse.urlparse(current_url)
            hop_host = hop_parsed.hostname
            if not hop_host:
                raise SSRFSecurityException("Invalid hostname during request execution.")
                
            # SSRF check on current target
            is_safe, reason, ips = validate_destination_safety(hop_host)
            if not is_safe:
                raise SSRFSecurityException(f"SSRF Protection blocked request to {hop_host}: {reason}")
            
            try:
                if method.upper() == "HEAD":
                    response = await client.head(current_url)
                else:
                    response = await client.get(current_url)
            except httpx.RequestError as exc:
                return {
                    "success": False,
                    "final_url": current_url,
                    "error": f"Network connection error: {str(exc)}",
                    "status_code": None,
                    "redirect_chain": redirect_history,
                    "headers": {},
                    "resolved_ips": ips
                }

            redirect_history.append({
                "url": current_url,
                "status_code": response.status_code,
                "ip": ips[0] if ips else None
            })

            # Check if redirect
            if response.status_code in (301, 302, 303, 307, 308) and follow_redirects:
                location = response.headers.get("location")
                if not location:
                    break
                next_url = urllib.parse.urljoin(current_url, location)
                current_url = next_url
                continue
            else:
                # Terminal response reached
                content_sample = response.text[:10000] if hasattr(response, 'text') else ""
                return {
                    "success": True,
                    "final_url": current_url,
                    "status_code": response.status_code,
                    "headers": dict(response.headers),
                    "redirect_chain": redirect_history,
                    "content_sample": content_sample,
                    "resolved_ips": ips,
                    "content_type": response.headers.get("content-type", "")
                }

        # Redirect loop exceeded
        return {
            "success": False,
            "final_url": current_url,
            "error": "Excessive redirects detected (exceeded maximum hops).",
            "status_code": None,
            "redirect_chain": redirect_history,
            "headers": {},
            "resolved_ips": []
        }
