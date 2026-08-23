import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SubscriptionLimitModal } from '../components/common/SubscriptionLimitModal';
import {
  Code,
  KeyRound,
  Copy,
  RefreshCw,
  Zap,
  CheckCircle2,
  Terminal,
  Activity,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  Building,
  Check
} from 'lucide-react';

export const ApiAccessPage: React.FC = () => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [quotaData, setQuotaData] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [activeCodeLang, setActiveCodeLang] = useState<'curl' | 'python' | 'javascript'>('curl');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

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

  const copyApiKey = () => {
    if (quotaData?.api_key || user?.api_key) {
      navigator.clipboard.writeText(quotaData?.api_key || user?.api_key || '');
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
    }
  };

  const apiKeyDisplay = quotaData?.api_key || user?.api_key || 'rs_free_sample_key_2026';
  const isPro = user?.subscription_tier === 'pro' || user?.subscription_tier === 'enterprise' || user?.role === 'admin';
  const dailyQuota = user?.daily_quota || quotaData?.daily_quota || 6;
  const scansToday = user?.scans_today || quotaData?.scans_today || 0;
  const scansUsed = user?.scans_used || quotaData?.scans_used || 0;
  const scansLeftToday = isPro ? 'Unlimited' : Math.max(0, dailyQuota - scansToday);

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
  
  const data = await res.json();
  console.log("Verdict:", data.risk_level, "Score:", data.risk_score);
  return data;
}`
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-10 max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 font-mono text-slate-100">
      {/* Top Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
          <Code className="w-3.5 h-3.5" />
          <span>DEVELOPER PORTAL & SUBSCRIPTIONS</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Plans, Subscriptions & <span className="text-cyan-400">Developer API</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          Manage your active subscription tier, track free scan quotas, generate high-speed developer API keys, and integrate RakshaSutra into your apps.
        </p>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Subscription Plans & Pricing Grid */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Choose Your Subscription Tier
            </h2>
            <p className="text-xs text-slate-400">Upgrade for unlimited threat scans, priority AI analysis, and developer API keys</p>
          </div>

          <div className="inline-flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                billingCycle === 'annual' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 text-[9px] font-black">20% OFF</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Free Community Plan */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold">
                COMMUNITY TIER
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">Free Trial</h3>
                <p className="text-xs text-slate-400">Essential scam checking for individuals</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white font-mono">₹0</span>
                <span className="text-xs text-slate-400">/forever</span>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>6 Free Scans Per Day (Resets Daily)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Traffic Light Scam Verdicts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Emergency 1930 Cyber Fraud Guide</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 text-center text-xs text-slate-400 border border-slate-800">
              {user?.subscription_tier === 'free' ? 'Current Active Tier' : 'Included by Default'}
            </div>
          </div>

          {/* 2. Pro Cyber Defender */}
          <div className="p-6 rounded-3xl bg-cyan-950/30 border-2 border-cyan-500 shadow-xl flex flex-col justify-between space-y-5 relative">
            <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
              MOST POPULAR
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[10px] font-bold">
                  PRO DEFENDER
                </span>
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Pro Unlimited</h3>
                <p className="text-xs text-slate-400">For developers, analysts & power users</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white font-mono">
                  {billingCycle === 'monthly' ? '₹499' : '₹4,990'}
                </span>
                <span className="text-xs text-slate-400">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                <span className="text-xs text-slate-500">($9/mo)</span>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 font-bold text-cyan-300">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>UNLIMITED Link & Message Scans</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>5,000 API Requests/mo (Developer Key)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Priority Raksha AI Copilot Instant Chat</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>PDF & JSON Incident Dossier Exports</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>{user?.subscription_tier === 'pro' ? 'Current Plan (Active)' : 'Upgrade to Pro'}</span>
            </button>
          </div>

          {/* 3. Enterprise SOC Suite */}
          <div className="p-6 rounded-3xl bg-purple-950/30 border border-purple-500/50 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 text-[10px] font-bold">
                  SOC & ORG
                </span>
                <Building className="w-4 h-4 text-purple-400" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Enterprise SOC</h3>
                <p className="text-xs text-slate-400">For companies, banks & colleges</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white font-mono">
                  {billingCycle === 'monthly' ? '₹4,999' : '₹49,990'}
                </span>
                <span className="text-xs text-slate-400">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                <span className="text-xs text-slate-500">($59/mo)</span>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 font-bold text-purple-300">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>UNLIMITED High-Throughput API</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Multi-Seat Analyst & Admin Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Employee Phishing Simulation Engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>24/7 Priority Emergency Support SLA</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{user?.subscription_tier === 'enterprise' ? 'Current Plan (Active)' : 'Get Enterprise'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* API Key Management & Active Plan Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: API Key Box */}
        <div className="md:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-cyan-500" /> Developer API Secret Key
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                {isPro ? 'UNLIMITED PRO' : 'FREE TIER'}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Include this secret key in the <code className="text-cyan-400 bg-slate-950 px-1.5 py-0.5 rounded">X-API-Key</code> HTTP request header for automated threat scans.
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

        {/* Right Column: Telemetry & Active Quota Status */}
        <div className="md:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-500" /> Active Usage & Quota
              </span>
              <span className="text-xs text-cyan-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> {isPro ? 'Pro Active' : 'Free Trial'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Scans Used Today:</span>
                <strong className="text-slate-900 dark:text-white font-bold">
                  {scansToday} / {isPro ? '∞' : dailyQuota} scans
                </strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Remaining Today:</span>
                <span className={`font-bold ${isPro ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isPro ? 'Unlimited' : `${scansLeftToday} of 6 free scans`}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Reset Schedule:</span>
                <span className="text-cyan-500 text-[11px] font-bold">Daily at 00:00 UTC</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block">Total Lifetime Scans:</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {scansUsed} scans
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block">Active Tier:</span>
                <span className="text-sm font-bold text-emerald-400">
                  {isPro ? 'PRO (Unlimited)' : '6 Free/Day'}
                </span>
              </div>
            </div>
          </div>

          {!isPro && (
            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Upgrade to Pro for Unlimited Scans</span>
            </button>
          )}
        </div>
      </div>

      {/* Code Integration Playground */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
              Integration Code Example
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            {(['curl', 'python', 'javascript'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveCodeLang(lang)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeCodeLang === lang
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
            <button
              onClick={() => copyCode(codeSnippets[activeCodeLang])}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors ml-2 cursor-pointer flex items-center gap-1 text-xs"
              title="Copy Code"
            >
              <Copy className="w-4 h-4" />
              {copiedCurl && <span className="text-[10px] text-emerald-400">Copied!</span>}
            </button>
          </div>
        </div>

        <pre className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 overflow-x-auto text-xs text-cyan-300 font-mono leading-relaxed">
          {codeSnippets[activeCodeLang]}
        </pre>
      </div>

      {/* Subscription Modal */}
      <SubscriptionLimitModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onSuccess={() => {
          refreshUser();
          loadQuotaData();
        }}
      />
    </div>
  );
};
