import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Plan, APIKey, APIUsageSummary } from '../types';
import {
  Code,
  KeyRound,
  Copy,
  CheckCircle2,
  Terminal,
  Check,
  Plus,
  Loader2,
  Trash2
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
      alert(err.message || 'Payment processing simulation failed.');
    } finally {
      setProcessingPlanId(null);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setIsCreatingKey(true);
    try {
      const res = await api.createApiKey(newKeyName.trim());
      setCreatedSecretKey(res.api_key);
      setNewKeyName('');
      loadApiKeyData();
    } catch (err: any) {
      alert(err.message || 'Failed to generate API token.');
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to immediately revoke and invalidate this API key?')) return;
    try {
      await api.revokeApiKey(keyId);
      loadApiKeyData();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke key.');
    }
  };

  const codeSnippets = {
    curl: `curl -X POST https://api.rakshasutra.org/v1/scan/url \\
  -H "Authorization: Bearer rs_live_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{"target": "https://suspicious-login-sbi.xyz/verify"}'`,
    python: `import requests

url = "https://api.rakshasutra.org/v1/scan/url"
headers = {
    "Authorization": "Bearer rs_live_your_api_key",
    "Content-Type": "application/json"
}
payload = {"target": "https://suspicious-login-sbi.xyz/verify"}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print("Risk Score:", data["risk_score"])
print("Verdict:", data["verdict"])`,
    typescript: `import axios from 'axios';

const response = await axios.post(
  'https://api.rakshasutra.org/v1/scan/url',
  { target: 'https://suspicious-login-sbi.xyz/verify' },
  {
    headers: {
      Authorization: 'Bearer rs_live_your_api_key',
      'Content-Type': 'application/json'
    }
  }
);

console.log(response.data.verdict);`
  };

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header (RDS 2.0) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sutra-glow shrink-0">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              DEVELOPER API & ENTERPRISE ACCESS
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Integrate automated URL inspection, NLP message analysis, and OSINT reconnaissance into your production pipeline
            </p>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Subscription Pricing Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
          API & Defense Platform Tiers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isCurrent = (user?.subscription_tier || 'free').toLowerCase() === p.tier.toLowerCase();
            return (
              <div
                key={p.id}
                className={`p-6 sm:p-8 rounded-3xl bg-[#0c121e] border space-y-6 flex flex-col justify-between shadow-2xl transition-all ${
                  isCurrent ? 'border-amber-500 shadow-sutra-glow' : 'border-white/10'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-black text-white font-mono">{p.name}</h4>
                      <p className="text-xs text-slate-400 font-sans mt-1">{p.description}</p>
                    </div>
                    {isCurrent && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] font-mono shadow-sutra-glow">
                        CURRENT TIER
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-3xl font-black text-white">
                      {p.price_inr === 0 ? 'Free' : `₹${p.price_inr}`}
                    </span>
                    {p.price_inr > 0 && <span className="text-xs text-slate-400">/{p.billing_period}</span>}
                  </div>

                  <ul className="space-y-2 text-xs text-slate-300 font-sans">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSubscribe(p)}
                  disabled={isCurrent || processingPlanId === p.id}
                  className={`w-full py-3.5 rounded-2xl font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#070b12] text-slate-500 border border-white/5 cursor-default'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-sutra-glow'
                  }`}
                >
                  {processingPlanId === p.id ? 'PROCESSING PAYMENT...' : isCurrent ? 'ACTIVE PLAN' : `UPGRADE TO ${p.name.toUpperCase()}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Business Tier: API Key Manager */}
      {isBusinessOrHigher && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 space-y-6 shadow-2xl font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                Production API Credentials ({apiKeys.length})
              </h3>
            </div>

            {usageSummary && (
              <span className="text-slate-400">
                Monthly Quota: <strong className="text-amber-400">{usageSummary.requests_this_month} / {usageSummary.monthly_quota}</strong> requests
              </span>
            )}
          </div>

          <form onSubmit={handleCreateApiKey} className="flex gap-2">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key Name (e.g. 'Security Ingestion Microservice')..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#030508] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={isCreatingKey || !newKeyName.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black uppercase text-xs shadow-sutra-glow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isCreatingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>GENERATE KEY</span>
            </button>
          </form>

          {createdSecretKey && (
            <div className="p-4 rounded-2xl bg-[#070b12] border border-amber-500/40 space-y-2">
              <div className="flex justify-between items-center text-amber-400 font-bold">
                <span>Secret API Key (Copy now — never displayed again):</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdSecretKey);
                    setCopiedKey(true);
                    setTimeout(() => setCopiedKey(false), 2000);
                  }}
                  className="hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-2.5 rounded-xl bg-[#030508] text-white text-[11px] select-all">{createdSecretKey}</pre>
            </div>
          )}

          <div className="space-y-2">
            {apiKeys.map((k) => (
              <div key={k.id} className="p-3.5 rounded-xl bg-[#070b12] border border-white/5 flex justify-between items-center">
                <div>
                  <span className="text-white font-bold">{k.name}</span>
                  <span className="text-slate-500 text-[10px] block">Created {new Date(k.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-[10px]">{k.key_prefix}...</span>
                  <button
                    onClick={() => handleRevokeKey(k.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code Quickstart Integration */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl space-y-6 font-mono text-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-black text-white">INTEGRATION CODE SNIPPETS</h3>
          </div>

          <div className="flex items-center gap-2">
            {(['curl', 'python', 'typescript'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveCodeLang(lang)}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${
                  activeCodeLang === lang
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sutra-glow font-black'
                    : 'bg-[#070b12] text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <pre className="p-5 rounded-2xl bg-[#030508] border border-white/10 text-amber-300 font-mono text-[11px] overflow-x-auto">
            {codeSnippets[activeCodeLang]}
          </pre>
          <button
            onClick={() => {
              navigator.clipboard.writeText(codeSnippets[activeCodeLang]);
              setCopiedCurl(true);
              setTimeout(() => setCopiedCurl(false), 2000);
            }}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-[#141d2e] border border-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer text-[10px]"
          >
            {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCurl ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
