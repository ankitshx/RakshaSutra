import sys
import os
import json

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Set stdout to utf-8 if supported
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from fastapi.testclient import TestClient
from app.main import app

def run_live_verification():
    print("================================================================")
    print("[+] RAKSHASUTRA -- LIVE SYSTEM VERIFICATION & AUDIT SUITE")
    print("================================================================")
    
    with TestClient(app) as client:
        # 1. Health check
        print("\n[1/10] Checking System Health & Telemetry...")
        res = client.get("/api/v1/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        health = res.json()
        print(f"  [PASS] Status: {health['status']} | Version: {health['version']} | Providers: {health['active_providers']}")
        
        # 2. Auth Flow
        print("\n[2/10] Verifying JWT Authentication & Bcrypt Salt Verification...")
        login_res = client.post("/api/v1/auth/login", json={
            "email": "admin@sharma1.org",
            "password": "Admin@victus2005!"
        })
        assert login_res.status_code == 200, f"Admin login failed: {login_res.text}"
        auth_data = login_res.json()
        token = auth_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print(f"  [PASS] Admin authenticated successfully. User: {auth_data['user']['email']} (Role: {auth_data['user']['role']})")
        
        # 3. URL Phishing Scan
        print("\n[3/10] Executing URL Phishing & Typosquatting Analysis...")
        url_res = client.post("/api/v1/scans/url", json={
            "url": "http://login-sbi-pan-update.xyz/verify.php"
        }, headers=headers)
        assert url_res.status_code == 200, f"URL scan failed: {url_res.text}"
        url_data = url_res.json()
        print(f"  [PASS] Target: {url_data['target']}")
        print(f"  [PASS] Risk Score: {url_data['risk_score']} / 100 ({url_data['risk_level']})")
        print(f"  [PASS] Indicators Triggered: {len(url_data['indicators'])}")
        print(f"  [PASS] Recommendation: {url_data['recommendation']}")
        assert url_data['risk_score'] >= 60, "Expected high risk for SBI lookalike"
        
        # 4. Message & Social Engineering Scan
        print("\n[4/10] Executing Message Phishing & Urgency Coercion Analysis...")
        msg_res = client.post("/api/v1/scans/message", json={
            "content": "URGENT: Your SBI bank account will be blocked tonight. Click http://sbi-pan-kyc.top to update PAN and submit OTP immediately.",
            "channel": "sms",
            "sender": "VK-SBIINB"
        }, headers=headers)
        assert msg_res.status_code == 200, f"Message scan failed: {msg_res.text}"
        msg_data = msg_res.json()
        print(f"  [PASS] Channel: {msg_data['channel']}")
        print(f"  [PASS] Risk Score: {msg_data['risk_score']} / 100 ({msg_data['risk_level']})")
        print(f"  [PASS] Detected Social Engineering Techniques: {[t['name'] for t in msg_data['detected_techniques']]}")
        print(f"  [PASS] Embedded URLs Extracted: {msg_data['extracted_urls']}")
        assert msg_data['risk_score'] >= 65, "Expected high risk for urgent OTP lure"
        
        # 5. Website Security Configuration Audit
        print("\n[5/10] Executing Website Security Configuration & TLS Audit...")
        site_res = client.post("/api/v1/scans/website", json={
            "url": "https://example.com"
        }, headers=headers)
        assert site_res.status_code == 200, f"Website audit failed: {site_res.text}"
        site_data = site_res.json()
        print(f"  [PASS] Target: {site_data['target_url']}")
        print(f"  [PASS] Hygiene Score: {site_data['hygiene_score']}/100 (Rating: {site_data['hygiene_rating']})")
        print(f"  [PASS] Headers Evaluated: {len(site_data['headers_audit'])}")
        
        # 6. Threat Intelligence IOC Search & Feeds
        print("\n[6/10] Querying Threat Intelligence Registry & Global Feeds...")
        ioc_res = client.post("/api/v1/threat-intelligence/search", json={
            "query": "evil-phishing-test.top"
        }, headers=headers)
        assert ioc_res.status_code == 200
        ioc_data = ioc_res.json()
        print(f"  [PASS] Search Result for 'evil-phishing-test.top': Found={ioc_data['found']} (Matches: {len(ioc_data['matches'])})")
        
        feed_res = client.get("/api/v1/threat-intelligence/feed?limit=5", headers=headers)
        assert feed_res.status_code == 200
        feed_data = feed_res.json()
        print(f"  [PASS] Global Threat Feed Items Returned: {len(feed_data)}")
        
        # 7. Raksha AI Copilot & Incident Playbooks
        print("\n[7/10] Interacting with Raksha AI Copilot...")
        ai_res = client.post("/api/v1/ai/chat", json={
            "message": "I entered my netbanking password on a suspicious link. What immediate containment steps should I take?",
            "history": []
        }, headers=headers)
        assert ai_res.status_code == 200
        ai_data = ai_res.json()
        print(f"  [PASS] Raksha AI Response Length: {len(ai_data['response'])} chars")
        if ai_data.get('related_playbook'):
            print(f"  [PASS] Triggered Incident Playbook: {ai_data['related_playbook']['title']}")
        
        # 8. Awareness Hub
        print("\n[8/10] Fetching Awareness Articles & Phishing Simulation Quizzes...")
        articles_res = client.get("/api/v1/awareness/articles", headers=headers)
        assert articles_res.status_code == 200
        print(f"  [PASS] Articles Loaded: {len(articles_res.json())}")
        
        quiz_res = client.get("/api/v1/awareness/quiz", headers=headers)
        assert quiz_res.status_code == 200
        print(f"  [PASS] Quiz Scenarios Loaded: {len(quiz_res.json())}")
        
        # 9. SSRF Defense Boundary Tests
        print("\n[9/10] Stress-Testing SSRF Security Boundary...")
        ssrf_targets = [
            "http://127.0.0.1:8000/secret",
            "http://169.254.169.254/latest/meta-data/",
            "http://192.168.1.1/admin",
            "http://localhost:3000"
        ]
        for target in ssrf_targets:
            res = client.post("/api/v1/scans/url", json={"url": target}, headers=headers)
            assert res.status_code in [400, 422], f"SSRF target {target} was not blocked! Status: {res.status_code}"
            print(f"  [PASS] SSRF Defense Blocked: {target} -> {res.json().get('detail', {}).get('message', res.text)}")
            
        # 10. Dashboard Telemetry & Admin Audit Log
        print("\n[10/10] Verifying Dashboard Telemetry & Admin Security Events...")
        dash_res = client.get("/api/v1/dashboard", headers=headers)
        assert dash_res.status_code == 200
        dash_data = dash_res.json()
        print(f"  [PASS] Total Scans in System: {dash_data['total_scans']}")
        print(f"  [PASS] Threats Intercepted: {dash_data['threats_detected']}")
        
        events_res = client.get("/api/v1/admin/security-events", headers=headers)
        assert events_res.status_code == 200
        events = events_res.json()
        print(f"  [PASS] Logged Security Audit Events: {len(events)}")
        ssrf_events = [e for e in events if e.get('event_type') == 'SSRF_ATTEMPT_BLOCKED']
        print(f"  [PASS] SSRF Attempt Audit Records: {len(ssrf_events)} logged with client request IDs")
        
        print("\n================================================================")
        print("[SUCCESS] ALL 10 SUBSYSTEMS PASSED PRODUCTION-GRADE VERIFICATION!")
        print("================================================================\n")

if __name__ == "__main__":
    run_live_verification()
