# 🧩 RakshaSutra Universal AI Cyber Defense Browser Extension

> **Zero-Latency Real-Time Threat Inspection, APK Malware Guard & Anti-Phishing Shield**  
> Built with **W3C WebExtensions Standard & Manifest V3** for 100% compatibility across **all current & future browsers**:
> * **Chromium Family:** Google Chrome, Microsoft Edge, Brave, Opera, Opera GX, Vivaldi, Arc Browser, Kiwi, Yandex.
> * **Gecko Family:** Mozilla Firefox, LibreWolf, Waterfox, Tor Browser, Firefox Android.
> * **WebKit Family:** Apple Safari (macOS, iPadOS, iOS).

---

## ⚡ Key Security Capabilities

1. **Pre-Navigation Zero-Latency Interception:**
   * Inspects suspicious domains and scams *before* the browser opens the connection or downloads malicious bytes.
   * Auto-redirects confirmed phishing/scam lures to a full-screen **Threat Defense Intervention Wall** with plain-English risk breakdown.

2. **Real-Time Traffic Light Browser Action Badge:**
   * 🟢 **SAFE (`✓`)**: Verified legitimate domains with valid cryptographic SSL/TLS certificates.
   * 🟡 **CAUTION (`!`)**: High-risk disposable TLDs (`.xyz`, `.top`, `.tk`), unencrypted HTTP logins, or fresh domains.
   * 🔴 **BLOCKED (`✕`)**: Active phishing traps, malicious banking APK downloads, or typo-squatted clones.

3. **In-Page Active DOM & Link Scanner:**
   * Decorates dangerous links in social media, WhatsApp Web, and Webmail with micro safety pills (`⚠️ FAKE / PHISHING`) before you click.
   * Intercepts accidental clicks with safety confirmation modals.

4. **Malicious Download & APK Trojan Guard:**
   * Intercepts fake electricity bill / banking APK files (`.apk`, `.exe`, `.scr`, `.iso`) downloaded outside official app stores.

5. **Right-Click Context Menu AI Inspector:**
   * Right-click any link on any page ➔ **"🛡️ Check Link with RakshaSutra AI"** for instant toast verdicts.

6. **Cloud SaaS Sync:**
   * Synchronizes with your self-hosted or cloud RakshaSutra SaaS backend for unified enterprise telemetry and unlimited scanning.

---

## 🚀 How to Install & Load in Your Browser (Developer Mode)

### 1. Google Chrome / Brave / Edge / Opera / Arc / Vivaldi:
1. Open your browser and navigate to:
   * **Chrome / Brave:** `chrome://extensions`
   * **Edge:** `edge://extensions`
   * **Opera:** `opera://extensions`
2. Enable the **"Developer mode"** toggle (usually top right).
3. Click the **"Load unpacked"** button.
4. Select the folder: `x:\Rakshasutra\extension`.
5. 🎉 **RakshaSutra Shield is now active on all websites!** Pin the extension icon to your browser toolbar for quick access.

---

### 2. Mozilla Firefox / LibreWolf:
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
2. Click **"Load Temporary Add-on..."**.
3. Select `x:\Rakshasutra\extension\manifest.json`.
4. The extension will activate immediately with full Gecko Manifest V3 support.

---

### 3. Apple Safari (macOS / iOS):
Use Apple's built-in WebExtension converter tool:
```bash
xcrun safari-web-extension-converter x:\Rakshasutra\extension --project-location ./SafariRakshaSutra
```
Open the generated Xcode project and click **Run**. Enable RakshaSutra in Safari Preferences ➔ Extensions.

---

## 📦 Publishing to Extension Stores

### Chrome Web Store:
1. Zip the `extension/` directory (excluding README and python scripts).
2. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
3. Upload the `.zip` package and submit for review.

### Microsoft Edge Add-ons:
1. Go to [Microsoft Partner Center](https://partner.microsoft.com/dashboard/microsoftedge).
2. Upload the same `.zip` package. Edge supports Manifest V3 natively.

### Firefox Add-ons (AMO):
1. Go to [Mozilla Add-on Developer Hub](https://addons.mozilla.org/developers/).
2. Submit your `.zip` archive for automated signing.

---

## 📁 Extension File Architecture

```
extension/
├── manifest.json                  # Universal Manifest V3 specification
├── background.js                  # Background Service Worker (interception, heuristics, badge updates)
├── content.js                     # Content Script (In-page link scanner & click interceptor)
├── content.css                    # In-page badge and toast styling
├── popup/
│   ├── popup.html                 # Sleek cyber popup UI (Traffic light verdict & quick scanner)
│   ├── popup.js                   # Popup controller & settings sync
│   └── popup.css                  # Cyberpunk dark theme stylesheet
├── blocked/
│   ├── blocked.html               # High-impact threat intervention block screen
│   ├── blocked.js                 # Blocked screen controller & bypass logic
│   └── blocked.css                # Shield intervention screen stylesheet
└── icons/
    ├── icon-16.png                # 16x16 toolbar icon
    ├── icon-32.png                # 32x32 high-DPI icon
    ├── icon-48.png                # 48x48 extensions management icon
    ├── icon-128.png               # 128x128 store & notification icon
    └── generate_icons.py          # Python icon generator script
```
