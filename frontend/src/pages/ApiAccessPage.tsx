import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Plan, APIKey, APIUsageSummary } from '../types';
import {
  Code,
  KeyRound,
  Copy,
  Zap,
  CheckCircle2,
  Terminal,
  Check,
  Plus,
  AlertTriangle,
  Loader2
} from 'lucide-react';

export const ApiAccessPage: React.FC = () => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [usageSummary, setUsageSummary] = useState<APIUsageSummary | null>(null);
  
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdSecretKey, setCreatedSecretKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [activeCodeLang, setActiveCodeLang] = useState<'curl' | 'python' | 'typescript'>('curl');
  
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const tier = (user?.subscription_tier || 'free').toLowerCase();
  const isBusinessOrHigher = tier === 'business' || tier === 'enterprise' || user?.role === 'admin' || user?.role === 'super_admin';

  useEffect(() => {
    loadPlans();
    if (isAuthenticated) {
      loadApiKeyData();
    }
  }, [isAuthenticated, tier]);

  const loadPlans = async () => {
    try {
      const res = await api.getPlans();
      setPlans(res.plans);
    } catch {
      // handled
    }
  };

  const loadApiKeyData = async () => {
    try {
      if (isBusinessOrHigher) {
        const [keys, summary] = await Promise.all([
          api.listApiKeys().catch(() => []),
          api.getApiUsageSummary().catch(() => null)
        ]);
        setApiKeys(keys);
        setUsageSummary(summary);
      }
    } catch {
      // handled
    }
  };

  const handleSubscribe = async (plan: Plan) => {
    if (!isAuthenticated) {
      alert('Please sign in or create an account to upgrade your subscription plan.');
      return;
    }

    if (plan.tier === 'free') {
      return;
    }

    if (plan.tier === 'enterprise') {
      alert('Enterprise custom deployment: Please contact our security solutions architects at enterprise@rakshasutra.org to establish custom SLAs and volume licensing.');
      return;
    }

    setProcessingPlanId(plan.id);
    setActionMessage(null);

    try {
      const orderRes = await api.createRazorpayOrder(plan.id);
      
      // Simulate/Trigger Razorpay Checkout
      const simulatedPaymentId = `pay_${Math.random().toString(36).substring(2, 12)}`;
      const simulatedSig = `sig_test_${Math.random().toString(36).substring(2, 12)}`;

      const verifyRes = await api.verifyRazorpayPayment({
        razorpay_order_id: orderRes.order_id,
        razorpay_payment_id: simulatedPaymentId,
        razorpay_signature: simulatedSig,
        plan_id: plan.id
      });

      if (verifyRes.success) {
        setActionMessage(`Successfully upgraded to ${plan.name}! Invoice: ${verifyRes.invoice_number}`);
        await refreshUser();
        loadApiKeyData();
      }
    } catch (err: any) {
      alert(err.message || 'Payment initiation failed. Please try again.');
    } finally {
      setProcessingPlanId(null);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      const res = await api.createApiKey(newKeyName.trim(), 90);
      setCreatedSecretKey(res.raw_api_key);
      setNewKeyName('');
      setIsCreatingKey(false);
      loadApiKeyData();
    } catch (err: any) {
      alert(err.message || 'Failed to generate API key.');
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action is immediate and cannot be undone.')) return;

    try {
      await api.revokeApiKey(keyId);
      loadApiKeyData();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke API key.');
    }
  };

  const codeSnippets = {
    curl: `curl -X POST "https://app.rakshasutra.org/api/v1/scans/url" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_SECRET_API_KEY" \\
  -d '{"url": "http://fake-banking-kyc-update.xyz/verify.php"}'`,

    python: `import httpx

API_KEY = "YOUR_SECRET_API_KEY"
URL = "https://app.rakshasutra.org/api/v1/scans/url"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}

payload = {"url": "http://fake-banking-kyc-update.xyz/verify.php"}

response = httpx.post(URL, json=payload, headers=headers)
report = response.json()

print(f"Verdict: {report['verdict']} | Risk Score: {report['risk_score']}/100")`,

    typescript: `import axios from 'axios';

const API_KEY = 'YOUR_SECRET_API_KEY';

async function verifyUrl(targetUrl: string) {
  const { data } = await axios.post(
    'https://app.rakshasutra.org/api/v1/scans/url',
    { url: targetUrl },
    { headers: { Authorization: \`Bearer \${API_KEY}\` } }
  );

  console.log(\`Verdict: \${data.verdict} (Confidence: \${data.confidence})\`);
}

verifyUrl('http://fake-banking-kyc-update.xyz/verify.php');`
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 font-sans">
      
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
          <Zap className="w-3.5 h-3.5" />
          <span>TRANSPARENT DEFENSE TIERS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Choose Your Defense Tier
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          From free citizen phishing protection to developer REST APIs and Enterprise SOC telemetry.
        </p>
      </div>

      {actionMessage && (
        <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* 1. Official 4-Tier SaaS Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {plans.map((plan) => {
          const isCurrent = tier === plan.tier;
          const isPopular = plan.is_popular;
          const isProcessing = processingPlanId === plan.id;

          return (
            <div
              key={plan.id}
              className={`p-6 sm:p-7 rounded-3xl flex flex-col justify-between space-y-6 transition-all relative ${
                isPopular
                  ? 'bg-slate-900 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/15'
                  : isCurrent
                  ? 'bg-slate-900/90 border-2 border-emerald-500/80 shadow-lg'
                  : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-mono font-extrabold text-[10px] uppercase tracking-wider shadow-md">
                  Most Popular
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-600 text-white font-mono font-extrabold text-[10px] uppercase tracking-wider shadow-md">
                  Current Plan
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white font-sans">{plan.name}</h3>
                  <p className="text-xs text-slate-400 min-h-[32px] leading-relaxed">{plan.description}</p>
                </div>

                <div className="py-2 border-y border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                      {plan.price_inr === 0 ? '₹0' : plan.tier === 'enterprise' ? 'Custom' : `₹${plan.price_inr}`}
                    </span>
                    {plan.price_inr > 0 && plan.tier !== 'enterprise' && (
                      <span className="text-xs text-slate-400 font-mono">/month</span>
                    )}
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono font-bold block mt-1">
                    {plan.badge || (plan.daily_scan_quota > 5000 ? 'Unlimited Scans' : `${plan.daily_scan_quota} Scans/Day`)}
                  </span>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 text-xs text-slate-300">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={isCurrent || isProcessing}
                className={`w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isCurrent
                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 cursor-default'
                    : isPopular
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : isCurrent ? (
                  <span>Active Tier</span>
                ) : plan.tier === 'enterprise' ? (
                  <span>Contact Sales</span>
                ) : (
                  <span>Upgrade to {plan.name.split(' ')[0]}</span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* 2. Developer API Gateway Section (For Business & Enterprise) */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 space-y-8">
        
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Code className="w-6 h-6 text-cyan-400" /> Developer REST API Gateway
            </h2>
            <p className="text-xs text-slate-400">
              Integrate RakshaSutra URL, Message, and Website threat verification into your SIEM, firewalls, and applications.
            </p>
          </div>

          {isBusinessOrHigher && (
            <button
              onClick={() => setIsCreatingKey(true)}
              className="px-4 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Generate API Key</span>
            </button>
          )}
        </div>

        {/* Newly Created Key Alert Box (Shown exactly once) */}
        {createdSecretKey && (
          <div className="p-5 rounded-2xl bg-amber-950/70 border border-amber-500/60 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Copy Your Secret API Key Now</span>
            </div>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              This secret key will <strong>never be shown again</strong>. Please store it securely in your environment variables or key vault.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={createdSecretKey}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-xs font-mono text-white select-all"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(createdSecretKey);
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2000);
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer"
              >
                {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Business & Enterprise Account Quota Gauge */}
        {isBusinessOrHigher && usageSummary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">Monthly API Requests</span>
              <div className="text-xl font-bold text-white font-mono">
                {usageSummary.requests_used_this_month.toLocaleString()} / {usageSummary.monthly_limit.toLocaleString()}
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
                <div
                  className="h-full bg-cyan-500 rounded-full"
                  style={{ width: `${Math.min(100, (usageSummary.requests_used_this_month / usageSummary.monthly_limit) * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">Rate Limit</span>
              <div className="text-xl font-bold text-cyan-400 font-mono">
                {usageSummary.rate_limit_per_minute} req / min
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Per-key enforced limit</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">Active Keys</span>
              <div className="text-xl font-bold text-emerald-400 font-mono">
                {apiKeys.filter((k) => k.status === 'active').length} / 5 Max
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Account-level pooled quota</span>
            </div>
          </div>
        )}

        {/* Active API Keys Table */}
        {isBusinessOrHigher ? (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Deployed API Keys
            </h3>
            {apiKeys.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-center text-xs text-slate-500">
                No active API keys found. Click "Generate API Key" above to deploy your first token.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] uppercase font-mono text-slate-500 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Name / Label</th>
                      <th className="py-2.5 px-3">Key Prefix</th>
                      <th className="py-2.5 px-3">Rate Limit</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Created</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {apiKeys.map((key) => (
                      <tr key={key.id} className="hover:bg-slate-800/20">
                        <td className="py-3 px-3 font-sans font-bold text-white">{key.name}</td>
                        <td className="py-3 px-3 text-slate-300">{key.key_prefix}••••••••</td>
                        <td className="py-3 px-3 text-cyan-400">{key.rate_limit_per_min} req/min</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            key.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-rose-950 text-rose-400 border border-rose-500/40'
                          }`}>
                            {key.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">{key.created_at}</td>
                        <td className="py-3 px-3 text-right">
                          {key.status === 'active' && (
                            <button
                              onClick={() => handleRevokeKey(key.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-bold transition-all cursor-pointer"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 w-fit mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">API Access is Reserved for Business & Enterprise Tiers</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Upgrade to the <strong>Business Team Suite</strong> (₹999/mo) to unlock 1,000 monthly API requests, 10 req/min rate limits, and multi-user team seats.
              </p>
            </div>
            <button
              onClick={() => {
                const bPlan = plans.find((p) => p.tier === 'business');
                if (bPlan) handleSubscribe(bPlan);
              }}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer"
            >
              Upgrade to Business Tier
            </button>
          </div>
        )}

        {/* 3. Interactive Code Snippets */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" /> Integration Code Samples
            </h3>
            
            <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-mono">
              {(['curl', 'python', 'typescript'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveCodeLang(lang)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeCodeLang === lang
                      ? 'bg-cyan-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-x-auto">
            <button
              onClick={() => {
                navigator.clipboard.writeText(codeSnippets[activeCodeLang]);
                setCopiedCurl(true);
                setTimeout(() => setCopiedCurl(false), 2000);
              }}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCurl ? 'Copied' : 'Copy'}</span>
            </button>
            <pre className="pt-2">{codeSnippets[activeCodeLang]}</pre>
          </div>
        </div>

      </div>

      {/* Create Key Modal */}
      {isCreatingKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Generate Secret API Key</h3>
              <p className="text-xs text-slate-400">
                Provide a descriptive label for this key to identify its integration.
              </p>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Key Label / Application Name
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Production SIEM Ingestion"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingKey(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold"
                >
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
