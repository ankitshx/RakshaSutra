import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  RefreshCw,
  Globe,
  Mail,
  Smartphone,
  Server,
  FileText
} from 'lucide-react';

interface UniversalInvestigatorProps {
  onInvestigate: (target: string, type?: string) => void;
  isLoading?: boolean;
}

export const UniversalInvestigator: React.FC<UniversalInvestigatorProps> = ({
  onInvestigate,
  isLoading = false
}) => {
  const [inputVal, setInputVal] = useState('');

  // Fast auto-detection heuristic
  const detectType = (val: string): { type: string; label: string; icon: React.ElementType } => {
    const trimmed = val.trim();
    if (!trimmed) return { type: 'unknown', label: 'Threat Target', icon: Search };

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.includes('/')) {
      return { type: 'url', label: 'URL / Phishing Endpoint', icon: Globe };
    }
    if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) {
      return { type: 'email', label: 'Email / Identity Identifier', icon: Mail };
    }
    if (/^(\+91|\+1|\+44|0)?[6-9]\d{9}$/.test(trimmed.replace(/[\s-]/g, ''))) {
      return { type: 'phone', label: 'Phone Number', icon: Smartphone };
    }
    if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(trimmed)) {
      return { type: 'ip', label: 'IPv4 Origin', icon: Server };
    }
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) {
      return { type: 'domain', label: 'Domain Name', icon: Globe };
    }
    if (trimmed.length > 50 || trimmed.includes('OTP') || trimmed.includes('SBI') || trimmed.includes('KYC') || trimmed.includes('urgent')) {
      return { type: 'message', label: 'SMS / Lure Message Body', icon: FileText };
    }
    return { type: 'general', label: 'Threat Indicator', icon: Search };
  };

  const detected = detectType(inputVal);
  const DetectedIcon = detected.icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onInvestigate(inputVal.trim(), detected.type);
    }
  };

  const presets = [
    { label: 'Fake Banking Lure', value: 'http://login-sbi-pan-update.xyz/verify.php' },
    { label: 'Phishing SMS Message', value: 'Dear SBI User, your YONO account will be blocked today. Click http://sbi-kyc.top to update PAN.' },
    { label: 'Suspicious Domain', value: 'secure-paypal-login-alert.top' },
    { label: 'Corporate Mailbox', value: 'admin@sharma1.org' }
  ];

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl relative overflow-hidden font-sans group">
      {/* Background The Sutra glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      {/* Top Hairline */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      <div className="relative space-y-5">
        {/* Title */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow-sutra-glow">
                The Sutra Threat Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">Real-Time Multi-Vector Forensics</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white font-mono tracking-tight mt-1">
              Universal Security Forensics Bar
            </h2>
          </div>

          {/* Detected Indicator Badge */}
          {inputVal.trim() && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#141d2e] border border-amber-500/30 text-amber-300 font-mono text-xs animate-in fade-in duration-150 shadow-sutra-glow">
              <DetectedIcon className="w-3.5 h-3.5" />
              <span>Target: {detected.label}</span>
            </div>
          )}
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative flex items-center">
            <div className="absolute left-4 text-amber-400 pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Paste any URL, Domain, SMS message, Email, IP address, or Hash to investigate..."
              className="w-full pl-12 pr-40 py-4 rounded-2xl bg-[#030508] border border-white/10 hover:border-amber-500/40 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 text-sm font-mono text-white placeholder-slate-500 transition-all shadow-inner outline-none"
            />
            <div className="absolute right-2 flex items-center gap-2">
              {inputVal.trim() && (
                <button
                  type="button"
                  onClick={() => setInputVal('')}
                  className="px-2.5 py-1 text-slate-400 hover:text-white font-mono text-xs"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                disabled={!inputVal.trim() || isLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono font-black text-xs tracking-wider flex items-center gap-2 shadow-sutra-glow transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>ANALYZE</span>
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
            <span className="text-slate-400 text-[11px]">Quick Tests:</span>
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setInputVal(preset.value)}
                className="px-3 py-1 rounded-xl bg-[#141d2e] border border-white/10 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer text-[11px]"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};
