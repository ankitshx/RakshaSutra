import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  ShieldAlert,
  Zap,
  CheckCircle2,
  Lock,
  X,
  Sparkles,
  Shield,
  CreditCard,
  Building,
  Check
} from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export const SubscriptionLimitModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Free Scan Limit Reached (10/10 Used)",
  subtitle = "You have exhausted your 10 free community scans. Subscribe to RakshaSutra Pro for unlimited scans, deep AI analysis, and developer API keys."
}) => {
  const { user, refreshUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'enterprise'>('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = async (planId: 'pro' | 'enterprise') => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      if (user) {
        const res = await api.instantUpgrade(planId);
        await refreshUser();
        setSuccessMessage(res.message || `Upgraded to ${planId.toUpperCase()} Unlimited!`);
        setTimeout(() => {
          setIsProcessing(false);
          if (onSuccess) onSuccess();
          onClose();
        }, 1500);
      } else {
        // If not logged in, prompt redirect to login/register with return url
        window.location.href = '/login?redirect=pricing';
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Upgrade failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 dark:bg-slate-950 border-2 border-cyan-500/60 rounded-3xl shadow-2xl overflow-hidden font-sans text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>SUBSCRIPTION REQUIRED</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mt-2 leading-relaxed">
            {subtitle}
          </p>

          {/* Billing Toggle */}
          <div className="mt-4 inline-flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                billingCycle === 'annual' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 text-[10px] font-black">20% OFF</span>
            </button>
          </div>
        </div>

        {/* Modal Body: Pricing Cards */}
        <div className="p-6 overflow-y-auto space-y-4">
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-center text-sm font-bold flex items-center justify-center gap-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-center text-sm font-bold flex items-center justify-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pro Plan Card */}
            <div className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
              selectedPlan === 'pro'
                ? 'bg-cyan-950/30 border-cyan-500 shadow-lg ring-2 ring-cyan-500/20'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-xs font-mono font-bold">
                    ⭐ MOST POPULAR
                  </span>
                  <Shield className="w-5 h-5 text-cyan-400" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">Pro Cyber Defender</h3>
                  <p className="text-xs text-slate-400">For security professionals, researchers & power users</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {billingCycle === 'monthly' ? '₹499' : '₹4,990'}
                  </span>
                  <span className="text-xs text-slate-400">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                  <span className="text-xs text-slate-500 ml-1">($9/mo)</span>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2 font-bold text-cyan-300">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>UNLIMITED Threat Scans (URL, APK, Message)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>5,000 API Requests/mo (Developer API Key)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Priority Raksha AI Copilot Incident Assistant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Downloadable Incident Threat Dossiers</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedPlan('pro');
                  handleUpgrade('pro');
                }}
                disabled={isProcessing}
                className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessing && selectedPlan === 'pro' ? 'Activating Pro...' : 'Upgrade to Pro (Unlimited)'}</span>
              </button>
            </div>

            {/* Enterprise Plan Card */}
            <div className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
              selectedPlan === 'enterprise'
                ? 'bg-purple-950/30 border-purple-500 shadow-lg ring-2 ring-purple-500/20'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 text-xs font-mono font-bold">
                    🏢 ENTERPRISE SOC
                  </span>
                  <Building className="w-5 h-5 text-purple-400" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">Organization & SOC Suite</h3>
                  <p className="text-xs text-slate-400">For enterprises, banks, colleges & SOC teams</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {billingCycle === 'monthly' ? '₹4,999' : '₹49,990'}
                  </span>
                  <span className="text-xs text-slate-400">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                  <span className="text-xs text-slate-500 ml-1">($59/mo)</span>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2 font-bold text-purple-300">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>UNLIMITED Everything & High-Throughput API</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Multi-Seat Analyst & Admin Team Management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Custom Employee Phishing Simulation Engine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>24/7 Priority Emergency Support SLA</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedPlan('enterprise');
                  handleUpgrade('enterprise');
                }}
                disabled={isProcessing}
                className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>{isProcessing && selectedPlan === 'enterprise' ? 'Activating Enterprise...' : 'Get Enterprise SOC'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-cyan-400" />
            <span>Instant Activation • Cancel Anytime • 100% Secure Checkout</span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white underline cursor-pointer"
          >
            Continue with free tier
          </button>
        </div>
      </div>
    </div>
  );
};
