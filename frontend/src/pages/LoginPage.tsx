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
  CheckCircle2,
  PhoneCall
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

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Side: Brand Identity & Security Value Prop (Desktop) */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
            <Shield className="w-4 h-4" />
            <span>EXPLAINABLE CYBERSECURITY PLATFORM</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
              Check Before <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">
                You Click.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto lg:mx-0">
              Sign in to access your threat scan history, OSINT investigations, dark web breach monitoring, and developer API keys.
            </p>
          </div>

          {/* Value Highlights */}
          <div className="space-y-3 pt-2 text-left max-w-md mx-auto lg:mx-0">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-slate-200">Traffic Light Verdicts</span>
                <p className="text-slate-400">Zero security jargon: Instant SAFE, CAUTION, or DANGER clarity.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-slate-200">6 Free Scans Daily</span>
                <p className="text-slate-400">Resetting daily at 00:00 UTC with full access to 1930 Helpline advice.</p>
              </div>
            </div>
          </div>

          {/* Emergency Helpline note */}
          <div className="pt-2 flex items-center justify-center lg:justify-start gap-2 text-xs text-slate-500">
            <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
            <span>Immediate cyber fraud victim assistance: Dial <strong>1930</strong> (Toll-Free in India)</span>
          </div>
        </div>

        {/* Right Side: High-Performance Responsive Login Box */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-cyber-border backdrop-blur-xl shadow-2xl space-y-6">
            
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-sans tracking-tight">
                Account Sign In
              </h2>
              <p className="text-xs text-slate-400">
                Enter your credentials to manage your security dashboard.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-start gap-3 text-xs text-rose-300 animate-in fade-in duration-200">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 min-h-[44px] rounded-2xl bg-slate-950/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Password reset instructions: Please contact your security team or support@rakshasutra.org for identity verification.');
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-3 min-h-[44px] rounded-2xl bg-slate-950/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 min-h-[44px] rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{loadingStep}</span>
                  </>
                ) : (
                  <>
                    <span>Sign In Securely</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800/80">
              <span>Don't have an account yet? </span>
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline cursor-pointer ml-1"
              >
                Create Free Account
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
