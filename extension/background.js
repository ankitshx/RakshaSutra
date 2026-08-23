/**
 * RakshaSutra Universal Browser Extension — Background Service Worker
 * Compatible with Chrome, Edge, Brave, Opera, Vivaldi, Arc, Firefox & Safari.
 */

// Universal Cross-Browser WebExtensions API wrapper
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

const API_DEFAULT_BASE = 'http://127.0.0.1:8000/api/v1';

// Known high-risk phishing & smishing signature patterns
const HIGH_RISK_TLDS = ['.xyz', '.top', '.tk', '.ml', '.ga', '.cf', '.gq', '.work', '.icu', '.buzz', '.rest', '.quest', '.sbs', '.cam'];
const SCAM_KEYWORDS = [
  'sbi-pan', 'kyc-update', 'electricity-bill', 'power-disconnect',
  'paytm-kyc', 'hdfc-netbanking', 'login-verify', 'account-blocked',
  'claim-bonus', 'lottery-winner', 'crypto-doubler', 'apk-download',
  'free-recharge', 'telegram-earn', 'part-time-job-daily'
];

const KNOWN_SAFE_DOMAINS = [
  'google.com', 'google.co.in', 'github.com', 'microsoft.com',
  'youtube.com', 'amazon.in', 'amazon.com', 'flipkart.com',
  'sbi.co.in', 'onlinesbi.sbi', 'hdfcbank.com', 'icicibank.com',
  'wikipedia.org', 'apple.com', 'cloudflare.com', 'rakshasutra.org',
  'localhost', '127.0.0.1'
];

// Initialize Storage Defaults on Install
browserAPI.runtime.onInstalled.addListener(async () => {
  const defaults = {
    protection_enabled: true,
    auto_block_scams: true,
    download_guard: true,
    in_page_badges: true,
    api_endpoint: API_DEFAULT_BASE,
    api_key: '',
    whitelisted_domains: [],
    scans_performed_count: 0,
    threats_blocked_count: 0
  };

  const stored = await browserAPI.storage.local.get(Object.keys(defaults));
  const toSet = {};
  for (const [k, v] of Object.entries(defaults)) {
    if (stored[k] === undefined) toSet[k] = v;
  }
  await browserAPI.storage.local.set(toSet);

  // Create Context Menu Item
  browserAPI.contextMenus.create({
    id: 'rakshasutra_inspect_link',
    title: '🛡️ Check Link with RakshaSutra AI',
    contexts: ['link']
  });

  console.log('RakshaSutra Universal Shield installed successfully.');
});

// Handle Context Menu Clicks
browserAPI.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'rakshasutra_inspect_link' && info.linkUrl) {
    const verdict = await evaluateUrlSafety(info.linkUrl);
    if (verdict.status === 'DANGER') {
      const blockUrl = browserAPI.runtime.getURL(`blocked/blocked.html?url=${encodeURIComponent(info.linkUrl)}&reason=${encodeURIComponent(verdict.reason)}&threat=${encodeURIComponent(verdict.threat_name)}`);
      browserAPI.tabs.create({ url: blockUrl, index: tab.index + 1 });
    } else {
      browserAPI.tabs.sendMessage(tab.id, {
        type: 'SHOW_TOAST',
        data: {
          url: info.linkUrl,
          verdict: verdict.status,
          message: verdict.message
        }
      });
    }
  }
});

// Real-Time Pre-Navigation Interception (Halts navigation to malicious sites)
browserAPI.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only inspect top-level frame navigation
  if (details.frameId !== 0) return;

  const url = details.url;
  if (!url || url.startsWith('chrome://') || url.startsWith('edge://') || url.startsWith('about:') || url.startsWith('moz-extension://') || url.startsWith('chrome-extension://')) {
    return;
  }

  const { protection_enabled, auto_block_scams, whitelisted_domains = [] } = await browserAPI.storage.local.get([
    'protection_enabled', 'auto_block_scams', 'whitelisted_domains'
  ]);

  if (!protection_enabled) return;

  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.toLowerCase();

    // Skip whitelisted domains
    if (whitelisted_domains.includes(domain) || KNOWN_SAFE_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))) {
      await updateTabBadge(details.tabId, 'SAFE');
      return;
    }

    const verdict = await evaluateUrlSafety(url);

    if (verdict.status === 'DANGER' && auto_block_scams) {
      // Increment blocked count
      const { threats_blocked_count = 0 } = await browserAPI.storage.local.get('threats_blocked_count');
      await browserAPI.storage.local.set({ threats_blocked_count: threats_blocked_count + 1 });

      await updateTabBadge(details.tabId, 'BLOCK');

      // Redirect to full-screen intervention shield
      const blockUrl = browserAPI.runtime.getURL(
        `blocked/blocked.html?url=${encodeURIComponent(url)}&reason=${encodeURIComponent(verdict.reason)}&threat=${encodeURIComponent(verdict.threat_name)}`
      );
      browserAPI.tabs.update(details.tabId, { url: blockUrl });
    } else if (verdict.status === 'SUSPICIOUS') {
      await updateTabBadge(details.tabId, 'WARN');
    } else {
      await updateTabBadge(details.tabId, 'SAFE');
    }
  } catch (err) {
    console.error('Pre-navigation inspection error:', err);
  }
});

// Update Action Badge when Tab is Activated or Navigated
browserAPI.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await browserAPI.tabs.get(activeInfo.tabId);
    if (tab && tab.url) {
      const verdict = await evaluateUrlSafety(tab.url);
      await updateTabBadge(tab.id, verdict.status);
    }
  } catch (e) {
    // Tab might be closing
  }
});

// Download Guard: Inspect incoming downloads for suspicious APKs or executable traps
if (browserAPI.downloads && browserAPI.downloads.onCreated) {
  browserAPI.downloads.onCreated.addListener(async (downloadItem) => {
    const { download_guard } = await browserAPI.storage.local.get('download_guard');
    if (!download_guard) return;

    const filename = (downloadItem.filename || downloadItem.url || '').toLowerCase();
    const isApk = filename.endsWith('.apk');
    const isSuspiciousExec = filename.endsWith('.exe') || filename.endsWith('.scr') || filename.endsWith('.vbs') || filename.endsWith('.iso');

    if (isApk || isSuspiciousExec) {
      const url = downloadItem.url || downloadItem.finalUrl || '';
      const isKnownStore = url.includes('play.google.com') || url.includes('github.com');

      if (!isKnownStore) {
        // Broadcast danger notification
        browserAPI.notifications?.create({
          type: 'basic',
          iconUrl: 'icons/icon-128.png',
          title: '⚠️ RakshaSutra Download Warning',
          message: `Suspicious download detected: ${filename.split('/').pop() || 'File'}. Sideloaded APKs are often banking trojans!`,
          priority: 2
        });
      }
    }
  });
}

// Core Safety Evaluation Engine (Fast Heuristics + Cloud API Fallback)
async function evaluateUrlSafety(url) {
  if (!url || typeof url !== 'string') {
    return { status: 'SAFE', reason: 'System page', threat_name: 'Internal' };
  }

  let domain = '';
  try {
    const u = new URL(url);
    domain = u.hostname.toLowerCase();
  } catch {
    return { status: 'SAFE', reason: 'Invalid URL', threat_name: 'Unknown' };
  }

  // 1. Safe domain whitelist
  if (KNOWN_SAFE_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))) {
    return {
      status: 'SAFE',
      reason: 'Verified official domain with valid reputation',
      threat_name: 'Verified Safe'
    };
  }

  // 2. High-Risk TLD Heuristic Check
  const matchedTld = HIGH_RISK_TLDS.find(tld => domain.endsWith(tld));
  const matchedKeyword = SCAM_KEYWORDS.find(kw => url.toLowerCase().includes(kw));

  if (matchedKeyword && matchedTld) {
    return {
      status: 'DANGER',
      reason: `High-risk suspicious domain extension (${matchedTld}) combined with sensitive scam lure keywords (${matchedKeyword}).`,
      threat_name: 'Targeted Phishing Lure'
    };
  }

  if (matchedKeyword) {
    return {
      status: 'SUSPICIOUS',
      reason: `URL contains sensitive banking/KYC keywords (${matchedKeyword}) hosted on an unverified domain.`,
      threat_name: 'Suspicious Banking Keyword'
    };
  }

  if (matchedTld) {
    return {
      status: 'SUSPICIOUS',
      reason: `Domain uses high-abuse disposable TLD (${matchedTld}).`,
      threat_name: 'High-Abuse Domain Extension'
    };
  }

  // 3. Optional Cloud Backend Inspection if reachable
  try {
    const { api_endpoint, api_key } = await browserAPI.storage.local.get(['api_endpoint', 'api_key']);
    const endpoint = api_endpoint || API_DEFAULT_BASE;

    const res = await fetch(`${endpoint}/scans/url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(api_key ? { 'X-API-Key': api_key } : {})
      },
      body: JSON.stringify({ url })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.verdict === 'MALICIOUS' || data.risk_score >= 70) {
        return {
          status: 'DANGER',
          reason: data.summary_plain_english || 'Active cyber threat detected by RakshaSutra AI.',
          threat_name: data.classification || 'Phishing / Malware'
        };
      } else if (data.verdict === 'SUSPICIOUS' || data.risk_score >= 40) {
        return {
          status: 'SUSPICIOUS',
          reason: data.summary_plain_english || 'Potential risk indicators found.',
          threat_name: data.classification || 'Suspicious Web Host'
        };
      } else {
        return {
          status: 'SAFE',
          reason: 'No malicious indicators detected in threat databases.',
          threat_name: 'Verified Clean'
        };
      }
    }
  } catch (apiErr) {
    // Offline or cloud endpoint unreachable; fallback gracefully to heuristics
  }

  return {
    status: 'SAFE',
    reason: 'Standard web domain',
    threat_name: 'Normal'
  };
}

// Update Extension Action Badge
async function updateTabBadge(tabId, status) {
  if (!tabId || tabId < 0) return;

  const badgeConfigs = {
    SAFE: { text: '✓', color: '#10b981' },
    WARN: { text: '!', color: '#f59e0b' },
    BLOCK: { text: '✕', color: '#ef4444' }
  };

  const config = badgeConfigs[status] || { text: '', color: '#06b6d4' };

  try {
    await browserAPI.action.setBadgeText({ tabId, text: config.text });
    await browserAPI.action.setBadgeBackgroundColor({ tabId, color: config.color });
  } catch (e) {
    // Ignore if tab is unmanaged
  }
}

// Message Listener for Content Script & Popup Communications
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECK_URL') {
    evaluateUrlSafety(message.url).then(verdict => {
      sendResponse(verdict);
    });
    return true; // Keep channel open for async response
  }

  if (message.type === 'GET_TAB_STATUS') {
    browserAPI.tabs.query({ active: true, currentWindow: true }).then(async (tabs) => {
      if (tabs[0] && tabs[0].url) {
        const verdict = await evaluateUrlSafety(tabs[0].url);
        sendResponse({ url: tabs[0].url, verdict });
      } else {
        sendResponse({ url: '', verdict: { status: 'SAFE', reason: 'No active web page' } });
      }
    });
    return true;
  }
});
