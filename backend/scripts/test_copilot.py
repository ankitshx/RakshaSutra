import httpx
import json

payload = {
    "message": '<scan_data>{"input_type":"url","risk_score":88,"confidence_score":91,"verdict":"DANGER","typosquat_matches":["sbi-verify.xyz (Levenshtein distance 2 from sbi.co.in)"],"whois_age_days":3,"threat_feed_hits":{"urlhaus":"listed","virustotal":"4/70 engines flagged","safe_browsing":"clean"},"tls_details":{"issuer":"Let\'s Encrypt","valid":true}}</scan_data>'
}

res = httpx.post("http://127.0.0.1:8000/api/v1/ai/chat", json=payload)
print("HTTP Status:", res.status_code)
print("--- COPIOT OUTPUT ---")
import sys
sys.stdout.buffer.write(res.json()["response"].encode('utf-8'))
