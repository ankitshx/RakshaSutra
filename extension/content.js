/**
 * RakshaSutra In-Page Link Scanner & Active DOM Protection Content Script
 */

const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// In-Memory Inspection Cache to avoid duplicate network calls
const inspectedCache = new Map();

// Initialize in-page scanning
(async function initContentScript() {
  const { in_page_badges = true } = await browserAPI.storage.local.get('in_page_badges');
  if (in_page_badges) {
    scanPageLinks();
    observeDynamicLinks();
  }
})();

function scanPageLinks() {
  const links = document.querySelectorAll('a[href^="http"]:not([data-rs-inspected])');
  const batch = Array.from(links).slice(0, 30); // Inspect in small batches to preserve 60fps scrolling

  batch.forEach(async (link) => {
    link.setAttribute('data-rs-inspected', 'true');
    const href = link.href;

    try {
      const parsed = new URL(href);
      const isInternal = parsed.hostname === window.location.hostname;
      if (isInternal) return;

      let verdict;
      if (inspectedCache.has(href)) {
        verdict = inspectedCache.get(href);
      } else {
        verdict = await checkUrlWithBackground(href);
        inspectedCache.set(href, verdict);
      }

      if (verdict && (verdict.status === 'DANGER' || verdict.status === 'SUSPICIOUS')) {
        decorateSuspiciousLink(link, verdict);
      }
    } catch {
      // Invalid URL
    }
  });
}

function checkUrlWithBackground(url) {
  return new Promise((resolve) => {
    browserAPI.runtime.sendMessage({ type: 'CHECK_URL', url }, (res) => {
      resolve(res || { status: 'SAFE' });
    });
  });
}

function decorateSuspiciousLink(linkElement, verdict) {
  const isDanger = verdict.status === 'DANGER';

  const badge = document.createElement('span');
  badge.className = `rs-link-badge ${isDanger ? 'rs-badge-danger' : 'rs-badge-warn'}`;
  badge.innerHTML = isDanger ? '⚠️ FAKE / PHISHING' : '⚠️ SUSPICIOUS';
  badge.title = `RakshaSutra Threat Alert: ${verdict.reason || 'High-Risk link'}`;

  linkElement.style.borderBottom = isDanger ? '2px dashed #ef4444' : '2px dashed #f59e0b';
  linkElement.appendChild(badge);

  // Click Interception for Danger links
  linkElement.addEventListener('click', (e) => {
    if (isDanger) {
      const confirmProceed = confirm(
        `🚨 RAKSHASUTRA CYBER DEFENSE WARNING!\n\nThis link is flagged as a dangerous scam/phishing trap:\n\nURL: ${linkElement.href}\nReason: ${verdict.reason}\n\nDo you really want to proceed at your own risk?`
      );
      if (!confirmProceed) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }, true);
}

// Observe dynamically loaded links (e.g., infinite scroll on social feeds & WhatsApp Web)
function observeDynamicLinks() {
  let timer;
  const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      scanPageLinks();
    }, 1200);
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Listen for background toast messages (e.g. from context menu inspection)
browserAPI.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'SHOW_TOAST' && msg.data) {
    showInPageToast(msg.data);
  }
});

function showInPageToast(data) {
  const existing = document.getElementById('rs-cyber-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'rs-cyber-toast';
  const isSafe = data.verdict === 'SAFE';
  const isDanger = data.verdict === 'DANGER';

  toast.innerHTML = `
    <div style="display:flex; align-items:center; gap:8px;">
      <span style="font-size:18px;">${isSafe ? '🛡️' : isDanger ? '🚨' : '⚠️'}</span>
      <div>
        <div style="font-weight:bold; font-size:13px; color:#fff;">
          RakshaSutra: ${isSafe ? 'Verified Safe Link' : isDanger ? 'Dangerous Scam Link Blocked' : 'Caution Required'}
        </div>
        <div style="font-size:11px; color:#94a3b8; max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          ${data.url}
        </div>
      </div>
    </div>
  `;

  toast.className = `rs-toast ${isSafe ? 'rs-toast-safe' : isDanger ? 'rs-toast-danger' : 'rs-toast-warn'}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('rs-toast-hide');
    setTimeout(() => toast.remove(), 400);
  }, 4500);
}
