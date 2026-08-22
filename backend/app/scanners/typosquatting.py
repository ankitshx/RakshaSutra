import unicodedata
import idna
from typing import Dict, List, Optional, Tuple

# Comprehensive database of top targeted global and regional brands
HIGH_VALUE_BRANDS = {
    # Tech & OS & Cloud
    "google": ["google.com", "accounts.google.com", "gmail.com"],
    "microsoft": ["microsoft.com", "login.microsoftonline.com", "live.com", "office.com", "outlook.com"],
    "apple": ["apple.com", "icloud.com", "appleid.apple.com"],
    "amazon": ["amazon.com", "aws.amazon.com", "amazon.in"],
    "meta": ["meta.com", "facebook.com", "instagram.com", "whatsapp.com"],
    "facebook": ["facebook.com", "fb.com"],
    "instagram": ["instagram.com"],
    "whatsapp": ["whatsapp.com", "web.whatsapp.com"],
    "telegram": ["telegram.org", "t.me"],
    "netflix": ["netflix.com"],
    "spotify": ["spotify.com"],
    "adobe": ["adobe.com"],
    "dropbox": ["dropbox.com"],
    "github": ["github.com"],
    "linkedin": ["linkedin.com"],
    "twitter": ["twitter.com", "x.com"],
    "zoom": ["zoom.us"],
    "steam": ["steampowered.com", "steamcommunity.com"],
    
    # Financial, Global Banks & Payments
    "paypal": ["paypal.com", "paypal-objects.com"],
    "stripe": ["stripe.com"],
    "chase": ["chase.com"],
    "wellsfargo": ["wellsfargo.com"],
    "bankofamerica": ["bankofamerica.com", "bofa.com"],
    "citibank": ["citi.com", "citibank.com"],
    "hsbc": ["hsbc.com"],
    "barclays": ["barclays.co.uk"],
    "americanexpress": ["americanexpress.com", "amex.com"],
    "visa": ["visa.com"],
    "mastercard": ["mastercard.com"],
    
    # Indian Banking, UPI & Government Portals
    "sbi": ["onlinesbi.sbi", "sbi.co.in"],
    "onlinesbi": ["onlinesbi.sbi"],
    "hdfc": ["hdfcbank.com", "netbanking.hdfcbank.com"],
    "hdfcbank": ["hdfcbank.com"],
    "icici": ["icicibank.com"],
    "icicibank": ["icicibank.com"],
    "axisbank": ["axisbank.com"],
    "kotak": ["kotak.com"],
    "punjabanationalbank": ["pnbindia.in"],
    "pnb": ["pnbindia.in"],
    "paytm": ["paytm.com"],
    "phonepe": ["phonepe.com"],
    "googlepay": ["pay.google.com"],
    "bhim": ["bhimupi.org.in"],
    "npci": ["npci.org.in"],
    "incometax": ["incometax.gov.in"],
    "uidai": ["uidai.gov.in"],
    "epfindia": ["epfindia.gov.in"],
    
    # Crypto & Web3 Exchanges
    "binance": ["binance.com"],
    "coinbase": ["coinbase.com"],
    "kraken": ["kraken.com"],
    "metamask": ["metamask.io"],
    "trustwallet": ["trustwallet.com"],
    "bybit": ["bybit.com"],
    "kucoin": ["kucoin.com"],
}

# Homoglyph character substitutions (Latin vs Cyrillic / Greek / Numbers)
HOMOGLYPH_MAP = {
    'а': 'a', 'a': 'a', '0': 'o', 'о': 'o', 'o': 'o',
    '1': 'l', 'l': 'l', 'i': 'l', '!': 'i', '|': 'l',
    'e': 'e', 'е': 'e', '3': 'e', 'с': 'c', 'c': 'c',
    'р': 'p', 'p': 'p', 'у': 'y', 'y': 'y', 'x': 'x',
    'х': 'x', 'd': 'd', 'q': 'q', 'v': 'v', 'w': 'w',
    'vv': 'w', 'rn': 'm', 'm': 'm', '5': 's', '$': 's',
    '8': 'b', 'b': 'b', '@': 'a',
}

def levenshtein_distance(s1: str, s2: str) -> int:
    """Standard dynamic programming Levenshtein edit distance."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row

    return previous_row[-1]

def jaro_winkler_similarity(s1: str, s2: str) -> float:
    """Calculate Jaro-Winkler string similarity (0.0 to 1.0)."""
    if s1 == s2:
        return 1.0
    len1, len2 = len(s1), len(s2)
    if len1 == 0 or len2 == 0:
        return 0.0

    match_distance = max(len1, len2) // 2 - 1
    s1_matches = [False] * len1
    s2_matches = [False] * len2
    matches = 0
    transpositions = 0

    for i in range(len1):
        start = max(0, i - match_distance)
        end = min(i + match_distance + 1, len2)
        for j in range(start, end):
            if s2_matches[j]:
                continue
            if s1[i] != s2[j]:
                continue
            s1_matches[i] = True
            s2_matches[j] = True
            matches += 1
            break

    if matches == 0:
        return 0.0

    k = 0
    for i in range(len1):
        if not s1_matches[i]:
            continue
        while not s2_matches[k]:
            k += 1
        if s1[i] != s2[k]:
            transpositions += 1
        k += 1

    transpositions //= 2
    jaro = (matches / len1 + matches / len2 + (matches - transpositions) / matches) / 3.0

    # Winkler prefix bonus (up to 4 chars)
    prefix = 0
    for i in range(min(4, min(len1, len2))):
        if s1[i] == s2[i]:
            prefix += 1
        else:
            break

    return jaro + (prefix * 0.1 * (1.0 - jaro))

def normalize_homoglyphs(text: str) -> str:
    """Convert internationalized/punycode and homoglyph lookalikes to standardized ASCII."""
    # Attempt Punycode decoding if IDN
    if text.startswith("xn--"):
        try:
            text = idna.decode(text)
        except Exception:
            pass

    normalized = unicodedata.normalize('NFKD', text)
    result = []
    for char in normalized:
        char_lower = char.lower()
        if char_lower in HOMOGLYPH_MAP:
            result.append(HOMOGLYPH_MAP[char_lower])
        elif unicodedata.category(char) != 'Mn':
            result.append(char_lower)
    return "".join(result)

def check_brand_impersonation(domain: str, full_host: str) -> Dict:
    """
    Inspect domain and subdomains for typosquatting, IDN homoglyphs, and deceptive brand placement.
    Returns match details and confidence scores.
    """
    domain_clean = domain.lower()
    host_clean = full_host.lower()
    
    # Extract domain name without TLD (e.g., 'paypa1' from 'paypa1.com')
    domain_parts = domain_clean.split(".")
    second_level = domain_parts[0] if domain_parts else domain_clean
    normalized_second_level = normalize_homoglyphs(second_level)
    
    # Check if punycode homoglyph was used
    is_idn_punycode = host_clean.startswith("xn--") or ".xn--" in host_clean
    
    # Check legitimate brand exact matches first
    for brand, legits in HIGH_VALUE_BRANDS.items():
        for legit in legits:
            if domain_clean == legit or domain_clean.endswith("." + legit):
                return {
                    "is_impersonation": False,
                    "is_legitimate_brand": True,
                    "brand": brand,
                    "confidence": 100,
                    "reason": f"Matches official verified brand domain ({legit})."
                }

    # Detect Deceptive Subdomain Impersonation (e.g. 'login.microsoft.com.attacker.xyz')
    for brand, legits in HIGH_VALUE_BRANDS.items():
        # Check if brand is embedded as a misleading subdomain in an unrelated domain
        if brand in host_clean and not (domain_clean in legits or any(domain_clean.endswith("." + l) for l in legits)):
            # Look for subdomains containing brand + login/auth/verify
            if any(term in host_clean for term in ["login", "signin", "verify", "secure", "auth", "account", "update", "support"]):
                return {
                    "is_impersonation": True,
                    "is_legitimate_brand": False,
                    "brand": brand,
                    "impersonation_type": "DECEPTIVE_SUBDOMAIN",
                    "confidence": 95,
                    "target_brand": brand.capitalize(),
                    "evidence": f"Host '{host_clean}' contains brand keyword '{brand}' on unauthorized parent domain '{domain_clean}'.",
                    "explanation": f"Attackers frequently craft subdomains like '{brand}.attacker.com' to deceive users into believing they are visiting {brand.capitalize()}."
                }

    # Detect Typosquatting / Homoglyphs on the Registered Domain
    best_match = None
    min_dist = 999
    highest_sim = 0.0

    for brand in HIGH_VALUE_BRANDS.keys():
        # Check normalized homoglyph string
        dist_raw = levenshtein_distance(second_level, brand)
        dist_norm = levenshtein_distance(normalized_second_level, brand)
        effective_dist = min(dist_raw, dist_norm)
        
        sim = jaro_winkler_similarity(second_level, brand)
        sim_norm = jaro_winkler_similarity(normalized_second_level, brand)
        effective_sim = max(sim, sim_norm)

        # Brand substring check with combi-words (e.g. 'sbi-update', 'paypal-security', 'netflix-billing')
        is_compound = (
            (brand in second_level or brand in normalized_second_level) and 
            second_level != brand and 
            any(w in second_level for w in ["login", "verify", "secure", "update", "pay", "bank", "portal", "help", "auth", "kyc", "card", "otp", "billing"])
        )

        if is_compound:
            return {
                "is_impersonation": True,
                "is_legitimate_brand": False,
                "brand": brand,
                "impersonation_type": "COMPOUND_BRAND_SPOOFING",
                "confidence": 92,
                "target_brand": brand.capitalize(),
                "evidence": f"Domain name '{second_level}' combines targeted brand '{brand}' with high-risk lure keyword.",
                "explanation": f"Fraudulent websites frequently combine well-known brand names with words like 'login', 'kyc', or 'verify' to trick victims."
            }

        # Typosquatting distance threshold (1 or 2 character typo on brands >= 4 chars)
        if len(brand) >= 4 and effective_dist in (1, 2) and effective_sim >= 0.88:
            if effective_dist < min_dist:
                min_dist = effective_dist
                highest_sim = effective_sim
                best_match = brand

    if best_match:
        return {
            "is_impersonation": True,
            "is_legitimate_brand": False,
            "brand": best_match,
            "impersonation_type": "TYPOSQUATTING",
            "distance": min_dist,
            "similarity": round(highest_sim, 3),
            "confidence": 90 if min_dist == 1 else 78,
            "target_brand": best_match.capitalize(),
            "evidence": f"Domain '{second_level}' has edit distance {min_dist} (similarity {round(highest_sim*100, 1)}%) to legitimate brand '{best_match}'.",
            "explanation": f"The domain appears intentionally mis-spelled to resemble {best_match.capitalize()}, a classic typosquatting and phishing tactic."
        }

    if is_idn_punycode:
        return {
            "is_impersonation": True,
            "is_legitimate_brand": False,
            "impersonation_type": "IDN_HOMOGLYPH_PUNYCODE",
            "confidence": 85,
            "target_brand": "Unknown/Mixed-Script",
            "evidence": f"Domain uses internationalized Punycode encoding ({host_clean}).",
            "explanation": "Punycode/IDN domains are often used to display characters from non-Latin scripts that visually mimic standard letters."
        }

    return {
        "is_impersonation": False,
        "is_legitimate_brand": False,
        "confidence": 0
    }
