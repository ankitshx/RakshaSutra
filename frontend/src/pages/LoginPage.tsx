import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Lock,
  Mail,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<AuthPageProps> = ({ onSuccess, onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Authenticating...');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your registered email address and password.');
      return;
    }

    setIsLoading(true);
    setLoadingStep('Authenticating...');
    setError(null);

    const timer = setTimeout(() => {
      setLoadingStep('Verifying credentials & session security...');
    }, 400);

    try {
      await login(email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please verify your credentials and try again.');
    } finally {
      clearTimeout(timer);
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsLoading(true);
    setLoadingStep('Authenticating Demo Persona...');
    setError(null);

    try {
      await login(demoEmail, demoPass);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Demo authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-sans selection:bg-amber-500 selection:text-slate-950">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Side: Brand Identity & Security Value Prop (RDS 2.0) */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold shadow-sutra-glow">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>OPERATIONAL DEFENSE COMMAND CENTER</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-sans">
              Check Before <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
                You Click.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto lg:mx-0 font-sans leading-relaxed">
              Sign in to access persistent threat investigations, dark web breach alerts, active deception canaries, and cryptographic API keys.
            </p>
          </div>

          {/* Value Highlights */}
          <div className="space-y-3 pt-2 text-left max-w-md mx-auto lg:mx-0 font-mono text-xs">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#0c121e] border border-white/10 shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-slate-300">Continuous 24/7 background domain & SSL drift monitoring</span>
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#0c121e] border border-white/10 shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-slate-300">k-Anonymity zero-knowledge dark web exposure audits</span>
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#0c121e] border border-white/10 shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-slate-300">Active decoy honeytokens & intruder tripwires</span>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Box (RDS 2.0 Bastion Panel) */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                SECURE SIGN IN
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Enter your credentials to enter your command console
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@security.org"
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#030508] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                  Security Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    disabled={isLoading}
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#030508] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sutra-glow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{loadingStep}</span>
                  </>
                ) : (
                  <>
                    <span>AUTHENTICATE & ENTER</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Logins */}
            <div className="pt-2 border-t border-white/10 space-y-2 font-mono text-xs">
              <span className="text-[11px] text-slate-400 uppercase font-bold block text-center">
                1-Click Quick Demo Access
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('demo@sharma1.org', 'DemoUser123!')}
                  className="p-2.5 rounded-xl bg-[#070b12] hover:bg-[#141d2e] border border-white/10 text-slate-300 hover:text-amber-300 transition-colors text-center text-[11px] cursor-pointer"
                >
                  Demo User
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin@sharma1.org', 'AdminSOC2026!')}
                  className="p-2.5 rounded-xl bg-[#070b12] hover:bg-[#141d2e] border border-white/10 text-slate-300 hover:text-amber-300 transition-colors text-center text-[11px] cursor-pointer"
                >
                  Admin SOC
                </button>
              </div>
            </div>

            <div className="text-center font-mono text-xs pt-1">
              <span className="text-slate-400">Need a new defense account? </span>
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-amber-400 hover:underline font-bold cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
