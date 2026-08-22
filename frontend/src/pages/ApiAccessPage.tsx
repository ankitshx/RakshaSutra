import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Code,
  KeyRound,
  Copy,
  RefreshCw,
  Zap,
  CheckCircle2,
  Terminal,
  Activity,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

export const ApiAccessPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [quotaData, setQuotaData] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isUpgradingQuota, setIsUpgradingQuota] = useState(false);
  const [activeCodeLang, setActiveCodeLang] = useState<'curl' | 'python' | 'javascript'>('curl');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadQuotaData();
    }
  }, [isAuthenticated]);

  const loadQuotaData = async () => {
    try {
      const data = await api.getQuotaStatus();
      setQuotaData(data);
    } catch {
      // handled
    }
  };

  const handleRegenerateKey = async () => {
    if (!confirm('Are you sure? Any existing applications using this API key will lose access.')) return;
    setIsRegenerating(true);
    try {
      const res = await api.regenerateApiKey();
      setQuotaData((prev: any) => ({ ...prev, api_key: res.api_key }));
      setActionMessage('API Key regenerated successfully!');
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to regenerate key.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRequestUpgrade = async () => {
    setIsUpgradingQuota(true);
    try {
      const res = await api.requestQuotaUpgrade('Developer Integration');
      setActionMessage(res.message || 'Quota boosted to 500 requests/mo!');
      setTimeout(() => setActionMessage(null), 3500);
      loadQuotaData();
    } catch (err: any) {
      alert(err.message || 'Failed to upgrade quota.');
    } finally {
      setIsUpgradingQuota(false);
    }
  };

  const copyApiKey = () => {
    if (quotaData?.api_key) {
      navigator.clipboard.writeText(quotaData.api_key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
    }
  };

  const apiKeyDisplay = quotaData?.api_key || 'rs_demo_developer_key_8899aabbcc';

  const codeSnippets = {
    curl: `curl -X POST "http://127.0.0.1:8000/api/v1/scans/url" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKeyDisplay}" \\
  -d '{"url": "http://login-sbi-pan-update.xyz/verify.php"}'`,

    python: `import httpx

API_KEY = "${apiKeyDisplay}"
URL = "http://127.0.0.1:8000/api/v1/scans/url"

headers = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY
}

payload = {"url": "http://login-sbi-pan-update.xyz/verify.php"}

response = httpx.post(URL, json=payload, headers=headers)
report = response.json()

print(f"Risk Level: {report['risk_level']} (Score: {report['risk_score']}/100)")
print(f"Summary: {report['summary']}")`,

    javascript: `const API_KEY = "${apiKeyDisplay}";

async function checkThreat(targetUrl) {
  const res = await fetch("http://127.0.0.1:8000/api/v1/scans/url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY
    },
    body: JSON.stringify({ url: targetUrl })
  });

  const report = await res.json();
  console.log(\`Verdict: \${report.risk_level} (\${report.risk_score}/100)\`);
  console.log(report.summary);
}

checkThreat("http://login-sbi-pan-update.xyz/verify.php");`
  };

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeLang]);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2500);
  };

  const scansUsed = quotaData?.scans_used ?? 12;
  const scansLimit = quotaData?.monthly_quota === 'Unlimited' ? 'Unlimited' : (quotaData?.monthly_quota ?? 50);
  const pct = scansLimit === 'Unlimited' ? 5 : Math.min(100, Math.round((scansUsed / Number(scansLimit)) * 100));

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8 font-mono">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-500 border border-cyan-500/30">
          <Terminal className="w-3.5 h-3.5" /> Developer Threat API Portal
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          API Keys & Rate Limit Quotas
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Integrate real-time URL heuristic scanners and phishing analyzers directly into your applications, Telegram bots, or backend microservices.
        </p>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Grid: API Key & Quota Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: API Key Box */}
        <div className="md:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-cyan-500" /> Active Secret API Key
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                ACTIVE
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Include this secret key in the <code className="text-cyan-400 bg-slate-950 px-1.5 py-0.5 rounded">X-API-Key</code> HTTP request header for authenticated threat scans.
            </p>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                readOnly
                value={apiKeyDisplay}
                className="w-full pl-3.5 pr-24 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-cyan-600 dark:text-cyan-400 font-bold select-all focus:outline-none"
              />
              <div className="absolute right-2 top-2 flex items-center gap-1">
                <button
                  onClick={() => setShowKey(!showKey)}
                  title={showKey ? 'Hide Key' : 'Reveal Key'}
                  className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={copyApiKey}
                  title="Copy API Key"
                  className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            {copiedKey && <span className="text-[11px] text-emerald-400 block">✓ Key copied to clipboard!</span>}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500">
              Keep your secret key private. Never expose it in client-side repositories.
            </span>
            <button
              onClick={handleRegenerateKey}
              disabled={isRegenerating}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>Roll / Revoke Key</span>
            </button>
          </div>
        </div>

        {/* Right Column: Quota Telemetry */}
        <div className="md:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-500" /> Usage & Rate Limits
              </span>
              <span className="text-xs text-slate-500">Reset: 1st of month</span>
            </div>

            {/* Quota Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Monthly Scans Used:</span>
                <strong className="text-slate-900 dark:text-white font-bold">
                  {scansUsed} / {scansLimit}
                </strong>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden border border-slate-200 dark:border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block">Rate Limit:</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {quotaData?.rate_limit_per_minute ?? 20} req/min
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block">Burst Allowance:</span>
                <span className="text-sm font-bold text-emerald-500 dark:text-emerald-400">
                  50 req/burst
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleRequestUpgrade}
              disabled={isUpgradingQuota}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon-cyan transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isUpgradingQuota ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>⚡ 1-Click Request Quota Boost (500 Scans/mo)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Code Integration Playground */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-cyan-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Live Code Integration Snippets
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setActiveCodeLang('curl')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeCodeLang === 'curl' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400'
                }`}
              >
                cURL
              </button>
              <button
                onClick={() => setActiveCodeLang('python')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeCodeLang === 'python' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400'
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setActiveCodeLang('javascript')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeCodeLang === 'javascript' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400'
                }`}
              >
                Node / JS
              </button>
            </div>

            <button
              onClick={copyCode}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedCurl ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-cyan-300 text-xs overflow-x-auto font-mono leading-relaxed">
          {codeSnippets[activeCodeLang]}
        </pre>
      </div>
    </div>
  );
};
