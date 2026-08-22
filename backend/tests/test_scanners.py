import pytest
from app.scanners.typosquatting import check_brand_impersonation, levenshtein_distance, jaro_winkler_similarity
from app.scanners.url_scanner import analyze_url_structure
from app.scanners.message_analyzer import analyze_message_content
from app.scanners.risk_engine import calculate_risk_score, get_risk_level_info

def test_levenshtein_and_similarity():
    assert levenshtein_distance("paypal", "paypa1") == 1
    assert levenshtein_distance("google", "g00gle") == 2
    assert jaro_winkler_similarity("paypal", "paypa1") > 0.85

def test_brand_impersonation_detection():
    # Typosquatting
    res1 = check_brand_impersonation("paypa1.com", "paypa1.com")
    assert res1["is_impersonation"] is True
    assert res1["brand"] == "paypal"

    # Compound lure spoofing
    res2 = check_brand_impersonation("sbi-kyc-verify.top", "sbi-kyc-verify.top")
    assert res2["is_impersonation"] is True
    assert res2["brand"] == "sbi"

    # Legitimate brand
    res3 = check_brand_impersonation("google.com", "google.com")
    assert res3["is_impersonation"] is False
    assert res3["is_legitimate_brand"] is True

def test_url_structure_heuristics():
    # IP host with suspicious keywords
    res = analyze_url_structure("http://192.0.2.1/banking/login/verify.php")
    assert res["is_ip"] is True
    assert res["structure_score"] > 25
    assert any(f["category"] == "TLS / Transport Security" for f in res["findings"])

    # Executable payload
    res_exe = analyze_url_structure("https://example.com/downloads/invoice_update.exe")
    assert any(f["category"] == "Malware Risk" for f in res_exe["findings"])

@pytest.mark.asyncio
async def test_message_analyzer_heuristics():
    phishing_msg = "URGENT: Your SBI bank account will be suspended within 24 hours. Click http://sbi-verify.top and enter OTP to restore."
    res = await analyze_message_content(phishing_msg, channel="sms")
    assert res["risk_score"] >= 75
    assert res["risk_level"] == "HIGH"
    assert len(res["detected_techniques"]) >= 2

def test_risk_scoring_bounds():
    assert calculate_risk_score(10, 10, 0, 0, 0) == 20
    level, _ = get_risk_level_info(20)
    assert level == "LOW"

    assert calculate_risk_score(25, 20, 35, 35, 10) == 100
    level_high, _ = get_risk_level_info(100)
    assert level_high == "HIGH"
