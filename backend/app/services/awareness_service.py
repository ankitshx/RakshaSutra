from typing import Dict, List, Any

# Curated Cybersecurity Awareness Articles
AWARENESS_ARTICLES = [
    {
        "id": "art-1",
        "slug": "anatomy-of-a-phishing-scam",
        "title": "Anatomy of a Modern Phishing Campaign: From Click to Compromise",
        "category": "Phishing",
        "difficulty": "Beginner",
        "read_time_minutes": 5,
        "summary": "Understand how cybercriminals construct lookalike domains, weaponize psychological urgency, and harvest credentials.",
        "content": """
### The 4 Stages of a Phishing Attack

Phishing remains the #1 initial access vector in cybersecurity incidents worldwide. Threat actors exploit human psychology rather than technical flaws in software.

#### 1. The Lure (Pretexting)
Attackers impersonate a trusted entity — a bank, an IT department, courier service, or streaming platform. They construct a plausible pretext (e.g., *'Unusual sign-in activity detected'* or *'Package on hold for ₹50 duty'*).

#### 2. The Hook (Emotional Urgency)
By creating intense urgency (threat of account closure, legal arrest, or forfeiture of prize money), the attacker bypasses the victim's rational analysis.

#### 3. The Trap (Lookalike Infrastructure)
Victims are led to a replica login portal hosted on a lookalike domain (e.g., `micros0ft-login.xyz` or `sbi-netbanking-update.top`). The page mirrors the legitimate brand's CSS and logos.

#### 4. The Harvest (Credential Exfiltration)
When the user submits their username, password, or OTP, the malicious script relays the data directly to a Telegram bot or command server controlled by the attacker.
        """,
        "key_takeaways": [
            "Always inspect the address bar for the exact domain name before entering credentials.",
            "Urgency and fear are the primary tools used by social engineers.",
            "Use password managers: They automatically refuse to autofill on fake lookalike domains."
        ]
    },
    {
        "id": "art-2",
        "slug": "upi-and-qr-code-frauds-explained",
        "title": "UPI, QR Code, and Digital Payment Frauds: How to Stay Protected",
        "category": "Payment Security",
        "difficulty": "Intermediate",
        "read_time_minutes": 6,
        "summary": "A deep dive into how reverse-collect requests, fake QR codes, and OLX marketplace scams drain bank accounts.",
        "content": """
### Demystifying Digital Payment Traps

With the rapid adoption of instant payment protocols like UPI, attackers have pivoted to financial social engineering.

#### The Golden Rule of UPI
> **Entering your UPI PIN ALWAYS debits money from your account. You NEVER enter a PIN to receive or claim funds.**

#### Common Tactics:
1. **Fake Customer Care Numbers on Search Engines**: Attackers place fake numbers on Google Maps for airlines or banks. When called, they instruct users to install remote screen-sharing tools (AnyDesk/TeamViewer).
2. **Collect Request Impersonation**: Sending a ₹25,000 collect request with the description *'Money Sent to You - Click Approve'*. Clicking approve sends money to the attacker.
3. **Refund QR Codes**: Sending an image of a QR code via WhatsApp with instructions to scan in Google Pay/PhonePe.
        """,
        "key_takeaways": [
            "Never scan a QR code or enter a UPI PIN to receive money.",
            "Never install screen-sharing apps at the behest of an unknown caller.",
            "Look up bank support numbers only from the back of your debit card or official app."
        ]
    },
    {
        "id": "art-3",
        "slug": "mfa-and-passkeys-guide",
        "title": "Beyond Passwords: The Complete Guide to MFA, Authenticator Apps, and Passkeys",
        "category": "Authentication",
        "difficulty": "Intermediate",
        "read_time_minutes": 7,
        "summary": "Why SMS 2FA is no longer enough and how FIDO2 passkeys provide cryptographic protection against phishing.",
        "content": """
### The Evolution of Account Security

Static passwords are systematically compromised through breaches and credential reuse.

#### MFA Hierarchy of Strength:
- **Weakest**: SMS / Email OTP (Vulnerable to SIM swapping and adversary-in-the-middle phishing proxies).
- **Stronger**: Time-based One-Time Passwords (TOTP) via apps like Aegis, 2FAS, Bitwarden, Google Authenticator.
- **Strongest**: FIDO2 / WebAuthn Hardware Keys & Passkeys (Cryptographically bound to the domain; immune to phishing).
        """,
        "key_takeaways": [
            "Migrate from SMS OTP to App-based TOTP or Passkeys wherever supported.",
            "Passkeys bind public-key cryptography directly to the authentic domain.",
            "Keep emergency recovery codes stored offline in a secure location."
        ]
    }
]

# Interactive Phishing Simulation Quiz Items
PHISHING_QUIZ_QUESTIONS = [
    {
        "id": "q1",
        "scenario": "You receive an SMS from 'VK-SBIINB' stating: 'Dear SBI Customer, your YONO account will be blocked today. Update your PAN card now at http://sbi-pan-kyc.top to avoid penalty.'",
        "options": [
            "Click the link immediately to prevent your account from being frozen.",
            "Reply to the SMS with your PAN card number and OTP.",
            "Recognize this as a high-risk phishing scam, do not click, and report to 1930 / bank support.",
            "Forward the link to friends to check if their accounts are also blocked."
        ],
        "correct_index": 2,
        "explanation": "This message exhibits classic phishing traits: artificial urgency ('blocked today'), suspicious non-bank TLD ('.top'), and requests for sensitive personal identifiers. SBI's official portal is 'onlinesbi.sbi'."
    },
    {
        "id": "q2",
        "scenario": "A buyer on an online marketplace agrees to buy your used sofa and says: 'I am sending a QR code for ₹8,000. Just open your Google Pay, scan this QR, and enter your UPI PIN to receive the payment.'",
        "options": [
            "Scan the QR code and enter your PIN quickly to receive the ₹8,000.",
            "Ask the buyer to send ₹1 first, then scan the QR code.",
            "Refuse immediately: You NEVER enter your UPI PIN to receive money. Scanning this QR will debit ₹8,000 from your account.",
            "Share your debit card CVV instead."
        ],
        "correct_index": 2,
        "explanation": "Golden Rule of UPI: Entering a UPI PIN always authorizes money to LEAVE your bank account. Scammers use QR codes to disguise outbound transfer requests."
    },
    {
        "id": "q3",
        "scenario": "You receive an email from 'security@accounts-g00gle.com' with the Google logo, claiming your password was breached and offering a '1-Click Password Reset' button.",
        "options": [
            "Click the button and type your current and new password.",
            "Inspect the sender address: The domain uses zeros ('g00gle.com') instead of 'o's (typosquatting). Delete and report phishing.",
            "Download the attachment to read the security advisory.",
            "Change your recovery email to the address suggested in the email."
        ],
        "correct_index": 1,
        "explanation": "The sender domain 'accounts-g00gle.com' is a classic typosquatting lookalike using numbers to mimic the official 'google.com' domain."
    },
    {
        "id": "q4",
        "scenario": "A caller claiming to be from your internet service provider says your router has a malware infection and asks you to install 'AnyDesk' or 'TeamViewer' so they can clean it.",
        "options": [
            "Install AnyDesk and read out the 9-digit remote access code to the caller.",
            "Refuse and hang up. Installing remote desktop apps allows the caller to view your screen, steal files, and initiate unauthorized transfers.",
            "Ask them to install it for you remotely.",
            "Provide your Wi-Fi password instead."
        ],
        "correct_index": 1,
        "explanation": "Remote access trojan/screen-sharing scams manipulate victims into granting complete device takeover. Legitimate ISPs never require remote desktop software for router management."
    }
]

# Standard Cyber Hygiene Checklists
SECURITY_CHECKLISTS = [
    {
        "category": "Immediate Account Protection",
        "items": [
            "Enable 2-Factor Authentication (TOTP or Passkey) on primary email, banking, and social accounts.",
            "Use a password manager to generate unique, 16+ character passwords for every website.",
            "Check https://haveibeenpwned.com to see if your credentials have leaked in known data breaches."
        ]
    },
    {
        "category": "Mobile & Communication Hygiene",
        "items": [
            "Enable Two-Step Verification inside WhatsApp / Telegram Settings.",
            "Never click shortened links (bit.ly, tinyurl) received via unsolicited SMS or DMs.",
            "Disable automatic file/media downloads on messaging apps from unknown senders."
        ]
    },
    {
        "category": "Financial & UPI Safety",
        "items": [
            "Set daily transaction limits on net banking, debit cards, and UPI apps.",
            "Never enter a UPI PIN unless you are intentionally transferring funds out.",
            "Save your bank's official fraud helpline in your contacts for instant 1-touch calling."
        ]
    }
]
