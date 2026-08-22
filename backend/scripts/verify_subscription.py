import asyncio
import httpx
import uuid

BASE_URL = "http://127.0.0.1:8000/api/v1"

async def test_subscription_flow():
    test_email = f"test_user_{uuid.uuid4().hex[:8]}@example.com"
    test_password = "Password@123!"

    print("=" * 60)
    print("Testing RakshaSutra Subscription & Quota Enforcement")
    print("=" * 60)

    async with httpx.AsyncClient(timeout=10.0) as client:
        # 1. Register new free user
        print(f"\n1. Registering new free user: {test_email}")
        reg_res = await client.post(f"{BASE_URL}/auth/register", json={
            "email": test_email,
            "password": test_password,
            "full_name": "Test Free User"
        })
        print("Register status:", reg_res.status_code)
        assert reg_res.status_code == 201
        data = reg_res.json()
        token = data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Check initial quota status
        print("\n2. Checking quota status (Expect Free Tier with 10 scans):")
        quota_res = await client.get(f"{BASE_URL}/auth/quota/status", headers=headers)
        quota_info = quota_res.json()
        print("Quota info:", quota_info)
        assert quota_info["subscription_tier"] == "free"
        assert quota_info["monthly_quota"] == 10
        assert quota_info["scans_used"] == 0

        # 3. Perform 10 scans
        print("\n3. Performing 10 free scans...")
        for i in range(1, 11):
            scan_res = await client.post(
                f"{BASE_URL}/scans/url",
                json={"url": f"https://example.com/test{i}"},
                headers=headers
            )
            print(f"Scan {i}/10 status: {scan_res.status_code}")
            assert scan_res.status_code == 200

        # 4. Perform 11th scan (Expect 402 Payment Required)
        print("\n4. Performing 11th scan (Expect 402 Limit Reached):")
        blocked_res = await client.post(
            f"{BASE_URL}/scans/url",
            json={"url": "https://example.com/blocked"},
            headers=headers
        )
        print("11th Scan status:", blocked_res.status_code)
        print("11th Scan body:", blocked_res.json())
        assert blocked_res.status_code == 402
        assert "SUBSCRIPTION_REQUIRED" in str(blocked_res.json())
        print("[SUCCESS] Successfully blocked after 10 free scans!")

        # 5. Upgrade to Pro Tier via instant upgrade / checkout
        print("\n5. Upgrading user to Pro Tier (Unlimited)...")
        upgrade_res = await client.post(f"{BASE_URL}/subscription/instant-upgrade?plan_id=pro", headers=headers)
        print("Upgrade status:", upgrade_res.status_code, upgrade_res.json())
        assert upgrade_res.status_code == 200

        # 6. Perform 12th scan as Pro (Expect 200 OK - Unlimited)
        print("\n6. Performing scan as Pro Subscriber (Expect 200 OK):")
        pro_scan_res = await client.post(
            f"{BASE_URL}/scans/url",
            json={"url": "https://example.com/unlimited_pro"},
            headers=headers
        )
        print("Pro Scan status:", pro_scan_res.status_code)
        assert pro_scan_res.status_code == 200
        print("[SUCCESS] Pro Subscriber successfully scanned with unlimited quota!")

    print("\n" + "=" * 60)
    print("ALL SUBSCRIPTION & QUOTA TESTS PASSED PERFECTLY!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_subscription_flow())
