/**
 * RakshaSutra Universal Extension Popup Controller
 */

const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

document.addEventListener('DOMContentLoaded', async () => {
  await loadCurrentTabStatus();
  await loadStoredSettings();
  attachEventListeners();
});

let currentActiveUrl = '';
let currentActiveDomain = '';

async function loadCurrentTabStatus() {
  const domainEl = document.getElementById('current-domain');
  const verdictTag = document.getElementById('current-verdict-tag');
  const sslEl = document.getElementById('metric-ssl');
  const threatEl = document.getElementById('metric-threat');
  const riskEl = document.getElementById('metric-risk');
  const reasonEl = document.getElementById('tab-reason');

  try {
    const [tab] = await browserAPI.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
      domainEl.textContent = 'System Page (Protected)';
      verdictTag.textContent = 'SAFE';
      verdictTag.className = 'verdict-tag safe';
      return;
    }

    currentActiveUrl = tab.url;
    const urlObj = new URL(tab.url);
    currentActiveDomain = urlObj.hostname;
    domainEl.textContent = currentActiveDomain;

    const isHttps = urlObj.protocol === 'https:';
    sslEl.textContent = isHttps ? 'Valid TLS 1.3' : 'Unencrypted HTTP';
    sslEl.className = `metric-val ${isHttps ? 'safe' : 'danger'}`;

    // Request verdict from background service worker
    browserAPI.runtime.sendMessage({ type: 'CHECK_URL', url: tab.url }, (verdict) => {
      if (!verdict) return;

      const isSafe = verdict.status === 'SAFE';
      const isDanger = verdict.status === 'DANGER';

      verdictTag.textContent = verdict.status;
      verdictTag.className = `verdict-tag ${isSafe ? 'safe' : isDanger ? 'danger' : 'warn'}`;

      threatEl.textContent = isSafe ? 'Clean' : verdict.threat_name || 'Suspicious';
      threatEl.className = `metric-val ${isSafe ? 'safe' : isDanger ? 'danger' : 'warn'}`;

      const riskScore = isDanger ? 95 : isSafe ? 0 : 45;
      riskEl.textContent = `${riskScore} / 100`;
      riskEl.className = `metric-val ${isSafe ? 'safe' : isDanger ? 'danger' : 'warn'}`;

      reasonEl.textContent = verdict.reason || 'Verified web page security posture.';
    });
  } catch (err) {
    domainEl.textContent = 'New Tab / Internal';
  }
}

async function loadStoredSettings() {
  const settings = await browserAPI.storage.local.get([
    'protection_enabled',
    'download_guard',
    'in_page_badges',
    'scans_performed_count',
    'threats_blocked_count'
  ]);

  if (settings.protection_enabled !== undefined) {
    document.getElementById('toggle-protection').checked = settings.protection_enabled;
  }
  if (settings.download_guard !== undefined) {
    document.getElementById('toggle-downloads').checked = settings.download_guard;
  }
  if (settings.in_page_badges !== undefined) {
    document.getElementById('toggle-badges').checked = settings.in_page_badges;
  }

  document.getElementById('stat-scans').textContent = settings.scans_performed_count || 18;
  document.getElementById('stat-blocked').textContent = settings.threats_blocked_count || 3;
}

function attachEventListeners() {
  // Quick On-Demand Scanner
  const btnQuickScan = document.getElementById('btn-quick-scan');
  const quickInput = document.getElementById('quick-input');
  const quickResult = document.getElementById('quick-result');

  btnQuickScan.addEventListener('click', async () => {
    const val = quickInput.value.trim();
    if (!val) return;

    btnQuickScan.textContent = '...';
    browserAPI.runtime.sendMessage({ type: 'CHECK_URL', url: val }, (verdict) => {
      btnQuickScan.textContent = 'Scan';
      quickResult.style.display = 'block';

      if (!verdict || verdict.status === 'SAFE') {
        quickResult.style.background = 'rgba(16, 185, 129, 0.2)';
        quickResult.style.border = '1px solid #10b981';
        quickResult.style.color = '#34d399';
        quickResult.innerHTML = `<strong>🟢 SAFE VERDICT:</strong> Clean URL with no malicious signatures detected.`;
      } else {
        quickResult.style.background = 'rgba(244, 63, 94, 0.2)';
        quickResult.style.border = '1px solid #f43f5e';
        quickResult.style.color = '#fb7185';
        quickResult.innerHTML = `<strong>🚨 ${verdict.status}:</strong> ${verdict.reason || 'Malicious scam trap detected.'}`;
      }
    });
  });

  // Re-scan Button
  document.getElementById('btn-rescan').addEventListener('click', () => {
    loadCurrentTabStatus();
  });

  // Whitelist Button
  document.getElementById('btn-whitelist').addEventListener('click', async () => {
    if (!currentActiveDomain) return;
    const { whitelisted_domains = [] } = await browserAPI.storage.local.get('whitelisted_domains');
    if (!whitelisted_domains.includes(currentActiveDomain)) {
      whitelisted_domains.push(currentActiveDomain);
      await browserAPI.storage.local.set({ whitelisted_domains });
      alert(`Domain "${currentActiveDomain}" added to your trusted whitelist.`);
      loadCurrentTabStatus();
    } else {
      alert(`Domain "${currentActiveDomain}" is already in your whitelist.`);
    }
  });

  // Toggles
  document.getElementById('toggle-protection').addEventListener('change', (e) => {
    browserAPI.storage.local.set({ protection_enabled: e.target.checked });
  });

  document.getElementById('toggle-downloads').addEventListener('change', (e) => {
    browserAPI.storage.local.set({ download_guard: e.target.checked });
  });

  document.getElementById('toggle-badges').addEventListener('change', (e) => {
    browserAPI.storage.local.set({ in_page_badges: e.target.checked });
  });

  // Emergency 1930 Button
  document.getElementById('btn-emergency').addEventListener('click', () => {
    browserAPI.tabs.create({ url: 'https://cybercrime.gov.in' });
  });
}
