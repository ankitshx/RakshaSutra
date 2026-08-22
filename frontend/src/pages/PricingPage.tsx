import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Check,
  Zap,
  Shield,
  Building2,
  Lock,
  Sparkles,
  CreditCard,
  QrCode,
  Loader2,
  CheckCircle2,
  KeyRound,
  Copy
} from 'lucide-react';

export const PricingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [mySubscription, setMySubscription] = useState<any>(null);
  
  // Checkout Modal State
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    api.getSubscriptionPlans().then((res) => setPlans(res.plans)).catch(() => {});
    if (isAuthenticated) {
      api.getMySubscription().then(setMySubscription).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleOpenCheckout = (plan: any) => {
    if (plan.id === 'free') return;
    setSelectedPlan(plan);
    setCheckoutSuccess(null);
  };

  const handleExecuteCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setIsProcessing(true);
    try {
      const res = await api.processCheckout({
        plan_id: selectedPlan.id,
        billing_cycle: billingCycle,
        payment_method: paymentMethod
      });
      setCheckoutSuccess(res);
      // Refresh subscription
      const updated = await api.getMySubscription();
      setMySubscription(updated);
    } catch (err: any) {
      alert(err.message || 'Payment processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyApiKey = () => {
    if (checkoutSuccess?.new_api_key) {
      navigator.clipboard.writeText(checkoutSuccess.new_api_key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2505);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-500 border border-cyan-500/30">
          <Sparkles className="w-3.5 h-3.5" /> Simple, Transparent Security Plans
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
          Defend Yourself & Your Business
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Free protective tools for citizens and elders. High-throughput threat APIs and security orchestration for businesses and developers.
        </p>

        {/* Currency & Billing Toggles */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 font-mono text-xs">
          {/* Monthly / Annual */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                SAVE 20%
              </span>
            </button>
          </div>

          {/* INR vs USD */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                currency === 'INR'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              ₹ INR
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                currency === 'USD'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              $ USD
            </button>
          </div>
        </div>
      </div>

      {/* Active Subscription Status Banner */}
      {mySubscription && (
        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <span className="text-slate-400">Current Plan: </span>
              <strong className="text-cyan-300 uppercase font-black">{mySubscription.subscription_tier} Tier</strong>
              <span className="text-slate-500 ml-2">({mySubscription.scans_used} / {mySubscription.monthly_quota} scans used)</span>
            </div>
          </div>
          <div className="text-slate-400">
            Active Developer API Key: <code className="text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{mySubscription.api_key?.slice(0, 16)}...</code>
          </div>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch font-mono">
        {/* Tier 1: Free */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Community Starter
            </span>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                {currency === 'INR' ? '₹0' : '$0'}
              </div>
              <p className="text-xs text-slate-500">Free forever for everyone</p>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Essential protection against malicious links, fake bank SMS, and power cutoff scams.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 20 scans per day</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Traffic Light Safety Verdicts</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Emergency 1930 Helpline dialer</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Interactive Phishing Simulation Quiz</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Dual Dark & Light Themes</li>
            </ul>
          </div>

          <button
            disabled
            className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-xs uppercase tracking-wider text-center"
          >
            Included by Default
          </button>
        </div>

        {/* Tier 2: Pro Cyber Defender (Featured) */}
        <div className="relative p-8 rounded-3xl bg-gradient-to-b from-cyan-950/60 to-slate-900 border-2 border-cyan-500 shadow-neon-cyan flex flex-col justify-between space-y-6">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md">
            ⭐ Most Popular
          </div>

          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              Pro Cyber Defender
            </span>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-white flex items-baseline gap-1">
                <span>
                  {currency === 'INR'
                    ? billingCycle === 'annual' ? '₹4,990' : '₹499'
                    : billingCycle === 'annual' ? '$89' : '$9'}
                </span>
                <span className="text-xs text-slate-400 font-normal">
                  /{billingCycle === 'annual' ? 'year' : 'month'}
                </span>
              </div>
              <p className="text-xs text-cyan-400">For power users, fintech apps & developers</p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Automated high-throughput threat API keys, priority Raksha AI Copilot, and downloadable forensic reports.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-200 pt-2 border-t border-cyan-900/60">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Unlimited link & message scans</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> <strong>5,000 API Requests/mo</strong> (Developer API Key)</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Priority Raksha AI Incident Copilot</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> PDF / JSON Threat Dossier Exports</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Zero Rate-Limits on Scanners</li>
            </ul>
          </div>

          <button
            onClick={() => handleOpenCheckout(plans.find((p) => p.id === 'pro') || { id: 'pro', name: 'Pro Cyber Defender', price_inr: 499, price_usd: 9 })}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon-cyan transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Upgrade to Pro</span>
          </button>
        </div>

        {/* Tier 3: Enterprise & SOC */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              SOC & Organization
            </span>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
                <span>
                  {currency === 'INR'
                    ? billingCycle === 'annual' ? '₹49,990' : '₹4,999'
                    : billingCycle === 'annual' ? '$590' : '$59'}
                </span>
                <span className="text-xs text-slate-500 font-normal">
                  /{billingCycle === 'annual' ? 'year' : 'month'}
                </span>
              </div>
              <p className="text-xs text-slate-500">For colleges, banks & enterprises</p>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Organization-wide simulation campaigns, multi-seat SOC control, and brand impersonation alerts.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Unlimited API Calls</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Employee Phishing Training Campaigns</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Brand Typosquatting Alerts</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Multi-Seat RBAC Role Management</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 24/7 Dedicated Emergency SLA</li>
            </ul>
          </div>

          <button
            onClick={() => handleOpenCheckout(plans.find((p) => p.id === 'enterprise') || { id: 'enterprise', name: 'SOC & Organization Suite', price_inr: 4999, price_usd: 59 })}
            className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Get Enterprise Plan</span>
          </button>
        </div>
      </div>

      {/* Interactive Checkout Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-3xl bg-slate-900 border-2 border-cyan-500/50 shadow-2xl p-6 sm:p-8 space-y-6 font-mono text-white relative">
            <button
              onClick={() => setSelectedPlan(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>

            {!checkoutSuccess ? (
              <form onSubmit={handleExecuteCheckout} className="space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                    Secure 256-Bit Checkout
                  </span>
                  <h3 className="text-xl font-black text-white">
                    Upgrade to {selectedPlan.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Billed {billingCycle === 'annual' ? 'Annually (Save 20%)' : 'Monthly'}:{' '}
                    <strong className="text-cyan-400">
                      {currency === 'INR'
                        ? billingCycle === 'annual' ? '₹4,990' : '₹499'
                        : billingCycle === 'annual' ? '$89' : '$9'}
                    </strong>
                  </p>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">Choose Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'upi'
                          ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-neon-cyan'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <QrCode className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-[10px] font-bold block">UPI / QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-neon-cyan'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-[10px] font-bold block">Cards</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('netbanking')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'netbanking'
                          ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-neon-cyan'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Building2 className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-[10px] font-bold block">Netbanking</span>
                    </button>
                  </div>
                </div>

                {/* Payment Input */}
                {paymentMethod === 'upi' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs text-slate-400">Enter UPI Virtual Payment Address (VPA)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. yourname@upi or phone@paytm"
                      required
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-500 block">Instant authorization via Google Pay, PhonePe, or BHIM.</span>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-2 text-xs">
                    <input
                      type="text"
                      placeholder="Card Number (4242 •••• •••• ••••)"
                      defaultValue="4242 4242 4242 4242"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        defaultValue="12/28"
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        defaultValue="888"
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="space-y-1.5 text-xs">
                    <select className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono">
                      <option>State Bank of India (SBI)</option>
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon-cyan transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authorizing Secure Gateway...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Authorize & Upgrade ({currency === 'INR' ? '₹' : '$'}{selectedPlan.price_inr || selectedPlan.price_usd})</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Success Screen */
              <div className="space-y-6 text-center animate-in fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-neon-emerald">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white">Payment Successful!</h3>
                  <p className="text-xs text-slate-400">
                    Transaction ID: <span className="text-cyan-400">{checkoutSuccess.transaction_id}</span>
                  </p>
                  <p className="text-xs text-emerald-400 font-bold pt-1">
                    Your account has been upgraded to {checkoutSuccess.plan_name} with {checkoutSuccess.monthly_quota} scans/mo!
                  </p>
                </div>

                {/* Provisioned API Key Box */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-cyan-400" /> Your Dedicated High-Speed API Key:
                    </span>
                    <button
                      onClick={copyApiKey}
                      className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedKey ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <code className="text-xs text-cyan-300 block bg-slate-900 p-2.5 rounded-xl border border-slate-800 break-all select-all">
                    {checkoutSuccess.new_api_key}
                  </code>
                </div>

                <button
                  onClick={() => setSelectedPlan(null)}
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Start Using Pro Features
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
