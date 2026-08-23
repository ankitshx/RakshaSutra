/**
 * RakshaSutra Threat Intervention Page Controller
 */

const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const targetUrl = urlParams.get('url') || 'http://unknown-destination.xyz';
  const threatReason = urlParams.get('reason') || 'High-risk suspicious phishing domain detected.';
  const threatName = urlParams.get('threat') || 'Active Phishing / Malware Trap';

  document.getElementById('blocked-url').textContent = targetUrl;
  document.getElementById('blocked-reason').textContent = threatReason;
  document.getElementById('threat-type').textContent = threatName;

  // Go Back to Safety
  document.getElementById('btn-go-back').addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'https://www.google.com';
    }
  });

  // Report 1930
  document.getElementById('btn-report-1930').addEventListener('click', () => {
    window.open('https://cybercrime.gov.in', '_blank');
  });

  // Toggle Bypass
  const bypassToggle = document.getElementById('btn-show-bypass');
  const bypassPanel = document.getElementById('bypass-panel');

  bypassToggle.addEventListener('click', () => {
    const isHidden = bypassPanel.style.display === 'none';
    bypassPanel.style.display = isHidden ? 'flex' : 'none';
    bypassToggle.textContent = isHidden
      ? 'Hide Advanced Bypass ▲'
      : 'Advanced: I understand the risks and want to view this site ▼';
  });

  // Proceed Unsafe
  document.getElementById('btn-proceed-unsafe').addEventListener('click', async () => {
    try {
      const u = new URL(targetUrl);
      const { whitelisted_domains = [] } = await browserAPI.storage.local.get('whitelisted_domains');
      if (!whitelisted_domains.includes(u.hostname)) {
        whitelisted_domains.push(u.hostname);
        await browserAPI.storage.local.set({ whitelisted_domains });
      }
      window.location.href = targetUrl;
    } catch {
      window.location.href = targetUrl;
    }
  });
});
