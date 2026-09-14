"""
RakshaSutra Dedicated End-User Telegram Cyber Defense Bot Service.
Targeted 100% at citizens and general users for instant pocket cybersecurity.
Bot Token: Configured via settings.TELEGRAM_USER_BOT_TOKEN (@rakshasutra_bot)
"""

import asyncio
import datetime
import re
import logging
from typing import Optional, Dict, Any, List
import httpx

from app.core.config import settings
from app.core.database import SessionLocal
from app.scanners.url_scanner import inspect_url_comprehensive
from app.scanners.risk_engine import synthesize_risk_report
from app.threat_intel.registry import threat_intel_registry
from app.scanners.message_analyzer import analyze_message_content
from app.services.cyber_news_service import cyber_news_service
from app.services.ai_assistant import generate_ai_security_response

logger = logging.getLogger("RakshaSutra.UserBot")

USER_BOT_KEYBOARD: Dict[str, Any] = {
    "keyboard": [
        [{"text": "🔗 Website / Link Check"}, {"text": "📩 SMS / Fraud Check"}],
        [{"text": "🕵️ Data Breach Lookup"}, {"text": "📰 Latest Cyber Warnings"}],
        [{"text": "🤖 Ask Raksha AI"}, {"text": "🚨 Emergency 1930 Helpline"}],
        [{"text": "💡 Cyber Safety Tips"}, {"text": "ℹ️ Bot Guide & Help"}]
    ],
    "resize_keyboard": True,
    "is_persistent": True
}

SAFETY_TIPS = [
    (
        "💡 *Golden UPI Rule:*\n"
        "UPI PIN hamesha sirf *PAISA BHEJNE* ke liye dala jata hai, *PAISA LENE* ke liye KABHI NAHI!\n"
        "Agar koi bole ki 'Paisa receive karne ke liye UPI PIN daalo ya QR code scan karo', to wo *100% FRAUD* hai!"
    ),
    (
        "💡 *APK / App Download Trap:*\n"
        "WhatsApp ya SMS par aayi kisi bhi `.apk` file (jaise `e-Challan.apk`, `PM_Yojna.apk`, `SBI_Reward.apk`) ko install NA karein!\n"
        "Ye malware hote hain jo aapke phone ke saare SMS aur bank OTP chura lete hain."
    ),
    (
        "💡 *Digital Arrest Fraud Warning:*\n"
        "Police, CBI, ED ya Mumbai Crime Branch KABHI bhi WhatsApp video call par kisi ko 'Digital Arrest' nahi karti aur na hi paisa transfer karne ko bolti hai!\n"
        "Aise video calls ko turant kaatein aur 1930 par report karein."
    ),
    (
        "💡 *Screen Sharing App Alert:*\n"
        "AnyDesk, TeamViewer, RustDesk ya QuickSupport jaise apps kisi anjaan caller ke bolne par KABHI download na karein!\n"
        "Aapki screen unhe dikhne lagti hai aur wo aapka net banking password dekh lete hain."
    ),
    (
        "💡 *WhatsApp 2-Step Verification:*\n"
        "Apne WhatsApp me Settings > Account > Two-Step Verification ON karein.\n"
        "Isse koi bhi doosra insaan aapka WhatsApp bina aapke secret 6-digit PIN ke hack nahi kar sakta."
    )
]

_tip_index = 0

def get_next_safety_tip() -> str:
    global _tip_index
    tip = SAFETY_TIPS[_tip_index % len(SAFETY_TIPS)]
    _tip_index += 1
    return tip


async def dispatch_user_bot_message(
    chat_id: str,
    text: str,
    reply_markup: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Sends message to user via @rakshasutra_bot with markdown fallback."""
    token = (settings.TELEGRAM_USER_BOT_TOKEN or "").strip()
    if not token:
        return {"success": False, "error": "TELEGRAM_USER_BOT_TOKEN not configured"}

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown",
        "disable_web_page_preview": True,
        "reply_markup": reply_markup or USER_BOT_KEYBOARD
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                return {"success": True, "result": resp.json()}
            else:
                # Retry without markdown if special characters failed parsing
                payload.pop("parse_mode", None)
                retry_resp = await client.post(url, json=payload)
                return {"success": retry_resp.status_code == 200, "result": retry_resp.text}
    except Exception as exc:
        logger.error(f"UserBot dispatch error: {exc}")
        return {"success": False, "error": str(exc)}


async def handle_url_scan(target_url: str) -> str:
    """Scans URL with comprehensive threat intelligence."""
    clean_url = target_url.strip()
    if not clean_url.startswith(("http://", "https://")):
        clean_url = "https://" + clean_url

    try:
        inspection = await inspect_url_comprehensive(clean_url)
        domain = inspection.get("registered_domain") or inspection.get("hostname", "")
        target_ip = inspection["resolved_ips"][0] if inspection.get("resolved_ips") else ""

        threat_intel = await threat_intel_registry.query_all(domain, "domain")
        if target_ip and not threat_intel.get("has_threat_intel_hit"):
            ip_intel = await threat_intel_registry.query_all(target_ip, "ip")
            if ip_intel.get("has_threat_intel_hit"):
                threat_intel = ip_intel

        report = synthesize_risk_report(
            target=inspection["normalized_url"],
            structure_score=inspection["structure_score"],
            domain_score=inspection["domain_score"],
            impersonation_score=inspection["impersonation_score"],
            threat_intel_result=threat_intel,
            redirect_score=inspection["redirect_score"],
            indicators=inspection["findings"],
            impersonation_info=inspection["impersonation_info"]
        )

        lvl = report["risk_level"].upper()
        score = report["risk_score"]

        if lvl == "HIGH":
            badge = "🔴 *KHATARNAK (MALICIOUS / PHISHING)*"
            rec = "⚠️ Is link ko KABHI NA KHOLEIN! Ye aapka bank data ya passwords chura sakta hai."
        elif lvl == "SUSPICIOUS":
            badge = "🟡 *SANDIGDH (SUSPICIOUS)*"
            rec = "⚠️ Is link par savdhaani bartein. OTP ya personal details bilkul share na karein."
        else:
            badge = "🟢 *SURAKSHIT (SAFE / LOW RISK)*"
            rec = "✅ Is website me koi direct threat ya phishing signature nahi mili."

        findings = []
        for ind in report.get("indicators", [])[:3]:
            findings.append(f"• {ind.get('description')}")
        findings_str = "\n".join(findings) if findings else "• Normal baseline domain characteristics."

        ssl_status = "✅ Valid & Encrypted" if inspection.get("has_ssl") else "❌ No SSL / Suspicious"

        msg = (
            f"🛡️ *RakshaSutra Website Threat Analysis*\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            f"🎯 *Target Link:* `{inspection['normalized_url']}`\n"
            f"⚖️ *Nateeja (Verdict):* {badge}\n"
            f"📊 *Khatra Score (Risk):* `{score}/100`\n"
            f"🌐 *Domain:* `{domain}`\n"
            f"🔒 *SSL Security:* `{ssl_status}`\n\n"
            f"📋 *Key Findings:*\n{findings_str}\n\n"
            f"💡 *Salah (Advice):* {rec}"
        )
        return msg
    except Exception as exc:
        return f"⚠️ *Scan Error:* Link ko analyze karne me dikkat aayi: `{str(exc)}`"


async def handle_message_scan(text_content: str) -> str:
    """Scans message text for fraudulent coercion, urgency, and OTP/UPI baits."""
    try:
        result = await analyze_message_content(content=text_content, channel="sms")
        lvl = result["risk_level"].upper()
        score = result["risk_score"]

        if lvl == "HIGH":
            badge = "🔴 *HIGH FRAUD RISK (100% SCAM)*"
        elif lvl == "SUSPICIOUS":
            badge = "🟡 *POTENTIAL SCAM (SUSPICIOUS)*"
        else:
            badge = "🟢 *SAFE / INFORMATIONAL*"

        techniques = []
        for t in result.get("detected_techniques", []):
            techniques.append(f"• *{t.get('name')}:* {t.get('description')}")
        techniques_str = "\n".join(techniques) if techniques else "• Koi suspicious social engineering tactic nahi mili."

        msg = (
            f"📩 *RakshaSutra Fake Message / SMS Analyzer*\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            f"⚖️ *Scam Likelihood:* {badge}\n"
            f"📊 *Scam Score:* `{score}/100`\n\n"
            f"⚠️ *Detected Fraud Tactics:*\n{techniques_str}\n\n"
            f"📝 *Summary:* {result.get('summary')}\n\n"
            f"💡 *Actionable Advice:* {result.get('recommendation')}"
        )
        return msg
    except Exception as exc:
        return f"⚠️ *Message Analysis Error:* `{str(exc)}`"


async def handle_breach_lookup(query: str) -> str:
    """Checks if an email or domain has appeared in global data breaches."""
    clean = query.strip().lower()
    from app.api.v1.darkweb import fetch_live_hibp_breaches, check_password_leak_count

    try:
        if "@" in clean:
            domain_part = clean.split("@")[-1]
            breaches = await fetch_live_hibp_breaches()
            matched = [b for b in breaches if domain_part in b.get("Domain", "").lower() or domain_part in b.get("Name", "").lower()][:4]

            if matched:
                b_lines = [f"• *{b.get('Title')}* ({b.get('BreachDate')}): {', '.join(b.get('DataClasses', [])[:3])}" for b in matched]
                msg = (
                    f"🕵️ *Data Breach Alert for `{clean}`*\n"
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                    f"⚠️ Aapka email provider/domain *{len(matched)}+ major global breaches* me dekha gaya hai:\n\n"
                    + "\n".join(b_lines) + "\n\n"
                    "💡 *Turant Ye Karein:*\n"
                    "1. Is email ka password turant change karein.\n"
                    "2. Sabhi important accounts par Two-Factor Authentication (2FA) activate karein.\n"
                    "3. Ek hi password ko har jagah use na karein."
                )
            else:
                msg = (
                    f"✅ *Breach Check: Surakshit!*\n"
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                    f"Humare database me `{clean}` se judi koi critical dark web breach exposure nahi mili.\n"
                    "Surakshit rehne ke liye hamesha strong password aur 2FA ka prayog karein."
                )
            return msg
        else:
            return "📧 Kripya apna email bhein (jaise: `name@gmail.com`) check karne ke liye."
    except Exception as exc:
        return f"⚠️ *Breach Lookup Error:* `{str(exc)}`"


async def handle_breaking_cyber_news() -> str:
    """Fetches real-time cyber crime news and advisories."""
    try:
        articles = cyber_news_service.get_breaking_news(limit=4)
        if not articles:
            return "📰 Abhi koi critical breaking advisory nahi hai. Sabhi systems surakshit hain."

        lines = [
            "📰 *Breaking Cyber Threat Advisories & News*",
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        ]
        for idx, art in enumerate(articles, 1):
            title = art.get("title", "Cyber Alert")
            summary = art.get("summary", "")[:120] + "..." if len(art.get("summary", "")) > 120 else art.get("summary", "")
            lines.append(f"{idx}. *{title}*")
            lines.append(f"   _{summary}_\n")

        lines.append("🛡️ *Savdhaan Rahein, Surakshit Rahein!*")
        return "\n".join(lines)
    except Exception as exc:
        return f"⚠️ *News Error:* `{str(exc)}`"


def handle_emergency_helpline() -> str:
    """Returns official Indian National Cyber Crime Helpline & Golden Hour rules."""
    return (
        "🚨 *NATIONAL CYBER CRIME HELPLINE & EMERGENCY GUIDE*\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "📞 *Helpline Number:* `1930` (Toll-Free, 24x7 Active)\n"
        "🌐 *Official Portal:* `https://cybercrime.gov.in`\n\n"
        "⏰ *Golden Hour Protocol (Pehle 2-3 Ghante Sabse Jaruri):*\n"
        "Agar aapke sath koi financial fraud (UPI/Bank/ATM) hua hai:\n\n"
        "1️⃣ *Turant 1930 par call karein:* Apne bank ka naam aur transaction UTR / Reference Number batayein.\n"
        "2️⃣ *Bank ko call karein:* Apne bank ke helpline par call karke card/UPI ko block karwayein.\n"
        "3️⃣ *Screenshot & Evidence:* Fraud message, transaction receipt aur caller number ka screenshot lein.\n"
        "4️⃣ *Portal par Report:* `cybercrime.gov.in` par jakar 'Report Financial Fraud' me case darj karein.\n\n"
        "⚠️ *Dhyan Dein:* Police ya Bank aapse KABHI bhi phone par OTP ya UPI PIN nahi maangti!"
    )


def handle_bot_guide() -> str:
    """Returns comprehensive guide on how to use the bot."""
    return (
        "ℹ️ *RakshaSutra Bot Ko Kaise Use Karein?*\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "Aap niche diye gaye kisi bhi button par tap kar sakte ho:\n\n"
        "• 🔗 *Website / Link Check:* Kisi bhi suspicious link ko scan karne ke liye.\n"
        "• 📩 *SMS / Fraud Check:* Fake message ya lottery SMS ko test karne ke liye.\n"
        "• 🕵️ *Data Breach Lookup:* Apna email daalkar check karein ki data leak hua hai ya nahi.\n"
        "• 📰 *Latest Cyber Warnings:* Bharat me chal rahe latest cyber crimes ki jankari.\n"
        "• 🤖 *Ask Raksha AI:* Cyber fraud se juda koi bhi sawal poochne ke liye.\n"
        "• 🚨 *Emergency 1930 Helpline:* Fraud hone par paise bachane ka guide.\n"
        "• 💡 *Cyber Safety Tips:* Daily suraksha tips.\n\n"
        "👉 *Direct Scan Trick:* Aap koi bhi Link ya Message seedhe chat me bhej do, bot khud samajh kar scan kar dega!"
    )


_user_last_update_id: int = 0

async def process_user_telegram_updates():
    """Polls and processes messages for @rakshasutra_bot."""
    global _user_last_update_id
    token = (settings.TELEGRAM_USER_BOT_TOKEN or "").strip()
    if not token:
        return

    url = f"https://api.telegram.org/bot{token}/getUpdates"
    params = {"timeout": 2}
    if _user_last_update_id:
        params["offset"] = _user_last_update_id + 1

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(url, params=params)
            if resp.status_code != 200:
                return
            data = resp.json()
            updates = data.get("result", [])

            for upd in updates:
                upd_id = upd.get("update_id", 0)
                if upd_id > _user_last_update_id:
                    _user_last_update_id = upd_id

                msg = upd.get("message") or upd.get("edited_message")
                if not msg:
                    continue

                chat = msg.get("chat", {})
                chat_id = str(chat.get("id", ""))
                from_user = msg.get("from", {})
                first_name = from_user.get("first_name", "Sathi")
                raw_text = (msg.get("text") or "").strip()
                text = raw_text.lower()

                if not chat_id:
                    continue

                # 1. Start / Welcome / Help
                if any(text.startswith(c) for c in ["/start", "start", "hi", "hello", "hey", "hlo", "/help", "help", "ℹ️ bot guide & help"]):
                    welcome = (
                        f"🛡️ *Namaste {first_name}! Main RakshaSutra Cyber Defense Bot Hoon.*\n"
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                        "Main aapka personal **Pocket Cyber Security Guard** hoon jo aapko online fraud, fake links, aur UPI scams se bachane ke liye 24/7 taiyar hai.\n\n"
                        "👇 *Aap niche diye gaye buttons se shuru kar sakte hain:*\n"
                        "• 🔗 Kisi link ko check karna\n"
                        "• 📩 Fake WhatsApp/SMS message scan karna\n"
                        "• 🕵️ Email data leak check karna\n"
                        "• 🤖 Cyber security se juda koi sawal poochna\n\n"
                        "💡 *Tip:* Aap koi bhi link ya message seedhe paste karke bhi bhej sakte ho!"
                    )
                    await dispatch_user_bot_message(chat_id, welcome)

                # 2. Website / URL Scan Button or Trigger
                elif text in ["🔗 website / link check", "/scan", "scan", "link check"]:
                    prompt = (
                        "🔗 *Website / Link Scanner Active!*\n\n"
                        "Bhai, koi bhi website link ya domain yahan paste karke bhej do (jaise: `https://example.com` ya `sbi-pan-kyc.in`).\n"
                        "RakshaSutra AI use turant scan karke batayega ki wo surakshit hai ya fake phishing link."
                    )
                    await dispatch_user_bot_message(chat_id, prompt)

                # 3. Direct URL Detected (User pasted any link)
                elif "http://" in text or "https://" in text or (len(raw_text.split()) == 1 and "." in raw_text and not raw_text.startswith(("/", "@"))):
                    target_url = raw_text.strip().split()[0]
                    await dispatch_user_bot_message(chat_id, f"⏳ *Checking `{target_url}` with RakshaSutra AI Threat Engine...*")
                    result_card = await handle_url_scan(target_url)
                    await dispatch_user_bot_message(chat_id, result_card)

                # 4. Message / Fraud Check Button or Trigger
                elif text in ["📩 sms / fraud check", "/message", "message check", "sms check"]:
                    prompt = (
                        "📩 *SMS & WhatsApp Fraud Detector Active!*\n\n"
                        "Aapko WhatsApp ya SMS par jo message sandigdh (suspicious) lag raha hai, **use yahan paste karke bhej dijiye**.\n"
                        "(Jaise: Bijli cut hone ka message, Lottery, Part-time job, ya Bank account block ka message).\n\n"
                        "Humara AI use scan karke batayega ki wo fraud hai ya nahi."
                    )
                    await dispatch_user_bot_message(chat_id, prompt)

                # 5. Data Breach Lookup Button or Trigger
                elif text in ["🕵️ data breach lookup", "/breach", "breach check"]:
                    prompt = (
                        "🕵️ *Dark Web & Data Breach Checker Active!*\n\n"
                        "Apna email address yahan bhein (jaise: `yourname@gmail.com`).\n"
                        "Hum check karke batayenge ki aapka data kisi cybercrime breach me leak to nahi hua."
                    )
                    await dispatch_user_bot_message(chat_id, prompt)

                # 6. Direct Email Detected (User pasted an email)
                elif "@" in text and "." in text and len(raw_text.split()) == 1:
                    await dispatch_user_bot_message(chat_id, f"⏳ *Checking breach exposure for `{raw_text}`...*")
                    breach_card = await handle_breach_lookup(raw_text)
                    await dispatch_user_bot_message(chat_id, breach_card)

                # 7. Latest Cyber News & Threats
                elif text in ["📰 latest cyber warnings", "/news", "news", "threats"]:
                    news_card = await handle_breaking_cyber_news()
                    await dispatch_user_bot_message(chat_id, news_card)

                # 8. Emergency 1930 Helpline
                elif text in ["🚨 emergency 1930 helpline", "/helpline", "1930", "helpline", "emergency"]:
                    helpline_card = handle_emergency_helpline()
                    await dispatch_user_bot_message(chat_id, helpline_card)

                # 9. Cyber Safety Tips
                elif text in ["💡 cyber safety tips", "/tips", "tips", "safety tip"]:
                    tip = get_next_safety_tip()
                    await dispatch_user_bot_message(chat_id, tip)

                # 10. Ask Raksha AI Button
                elif text in ["🤖 ask raksha ai", "/ask", "ask ai", "ai"]:
                    prompt = (
                        "🤖 *Raksha AI Cyber Copilot Online!*\n\n"
                        "Cyber security ya online fraud se juda koi bhi sawal poochiye!\n"
                        "Jaise:\n"
                        "• _'Mera phone hack ho gaya hai kya karu?'_\n"
                        "• _'Fake call par OTP de diya ab kya karein?'_\n"
                        "• _'Digital arrest scam kya hota hai?'_\n\n"
                        "Seedhe apna sawal yahan likh kar bhein!"
                    )
                    await dispatch_user_bot_message(chat_id, prompt)

                # 11. Multi-word message analysis or AI question answer
                elif len(raw_text.split()) > 3:
                    # If it looks like a typical scam text (contains typical scam lures)
                    scam_triggers = ["bill", "bijli", "electricity", "lottery", "win", "won", "prize", "job", "earn", "salary", "account blocked", "kyc", "pan card", "challan", "update immediately", "apk", "call this number", "officer"]
                    if any(trig in text for trig in scam_triggers):
                        await dispatch_user_bot_message(chat_id, "⏳ *Analyzing message for fraud patterns and social engineering...*")
                        msg_card = await handle_message_scan(raw_text)
                        await dispatch_user_bot_message(chat_id, msg_card)
                    else:
                        # Otherwise treat as an AI question to Raksha AI
                        await dispatch_user_bot_message(chat_id, "🤖 *Raksha AI soch raha hai...*")
                        try:
                            ai_res = generate_ai_security_response(query=raw_text)
                            resp_text = (
                                f"🤖 *Raksha AI Jawaab:*\n"
                                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                                f"{ai_res.get('response')}\n\n"
                                "💡 *Zaroori Tip:* Kisi bhi anjaan link par click na karein aur OTP kabhi share na karein."
                            )
                            await dispatch_user_bot_message(chat_id, resp_text)
                        except Exception as e:
                            await dispatch_user_bot_message(chat_id, f"⚠️ *AI Response Error:* `{str(e)}`")

                # 12. Fallback
                else:
                    help_card = handle_bot_guide()
                    await dispatch_user_bot_message(chat_id, help_card)

    except Exception as exc:
        logger.debug(f"UserBot polling: {exc}")


async def run_user_telegram_bot_loop():
    """Continuous background loop for @rakshasutra_bot."""
    token = (settings.TELEGRAM_USER_BOT_TOKEN or "").strip()
    if not token:
        logger.warning("TELEGRAM_USER_BOT_TOKEN not provided. UserBot loop will not start.")
        return

    logger.info("Starting RakshaSutra Public Citizen Telegram Bot Loop (@rakshasutra_bot)...")
    await asyncio.sleep(2)
    await process_user_telegram_updates()

    while True:
        try:
            await process_user_telegram_updates()
            await asyncio.sleep(3)
        except asyncio.CancelledError:
            logger.info("User Telegram Bot Loop cancelled.")
            break
        except Exception as exc:
            logger.error(f"Error in User Telegram Bot Loop: {exc}")
            await asyncio.sleep(10)
