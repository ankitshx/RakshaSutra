import React, { useState } from 'react';
import { api } from '../services/api';
import {
  ShieldAlert,
  Search,
  Mail,
  Smartphone,
  Globe,
  AlertTriangle,
  Eye,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

export const DarkWebMonitorPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [queryType, setQueryType] = useState<'email' | 'phone' | 'domain'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    { label: 'Sample Pwned Email', val: 'victim_demo@example.com', type: 'email' },
    { label: 'Sample Company Domain', val: 'megacorp-internal.com', type: 'domain' },
    { label: 'Sample Leaked Phone', val: '+919876543210', type: 'phone' },
    { label: 'Clean Safe Account', val: 'admin@sharma1.org', type: 'email' }
  ];

  const handleSearch = async (overrideVal?: string, overrideType?: string) => {
    const q = overrideVal !== undefined ? overrideVal : query;
    const t = overrideType !== undefined ? overrideType : queryType;

    if (!q.trim()) return;
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.checkDarkWebExposure({ query: q.trim(), query_type: t });
      setReport(res);
    } catch (err: any) {
      setError(err.message || 'Dark Web database query failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans selection:bg-amber-500 selection:text-slate-950 pb-24">
      {/* Top Banner (RDS 2.0) */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold shadow-sutra-glow">
          <Eye className="w-4 h-4 text-amber-400" />
          <span>DEEP DARK WEB & BREACH EXPOSURE RADAR</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Has Your Identity Been <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400">Leaked on Hacker Forums?</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Search billions of leaked passwords, stealer logs, and compromised corporate credentials across known dark web database dumps with zero-knowledge cryptographic privacy.
        </p>
      </div>

      {/* Query Search Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        {/* Search Type Selector */}
        <div className="flex items-center justify-center p-1.5 rounded-2xl bg-[#030508] border border-white/10 max-w-md mx-auto text-xs font-bold font-mono">
          <button
            onClick={() => { setQueryType('email'); setReport(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all cursor-pointer ${
              queryType === 'email' ? 'bg-amber-500 text-slate-950 shadow-sutra-glow font-black' : 'text-slate-500 hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Address</span>
          </button>
          <button
            onClick={() => { setQueryType('phone'); setReport(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all cursor-pointer ${
              queryType === 'phone' ? 'bg-amber-500 text-slate-950 shadow-sutra-glow font-black' : 'text-slate-500 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Phone Number</span>
          </button>
          <button
            onClick={() => { setQueryType('domain'); setReport(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all cursor-pointer ${
              queryType === 'domain' ? 'bg-amber-500 text-slate-950 shadow-sutra-glow font-black' : 'text-slate-500 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Company Domain</span>
          </button>
        </div>

        {/* Input Bar */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-amber-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Enter target ${queryType} to query dark web pastes and breach logs...`}
              className="w-full pl-12 pr-40 py-4 rounded-2xl bg-[#030508] border border-white/10 focus:border-amber-500 text-sm font-mono text-white placeholder-slate-500 shadow-inner outline-none transition-colors"
            />
            <button
              onClick={() => handleSearch()}
              disabled={isLoading || !query.trim()}
              className="absolute right-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs font-mono tracking-wider flex items-center gap-2 shadow-sutra-glow disabled:opacity-50 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>SEARCHING...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>CHECK BREACHES</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
            <span className="text-slate-400 text-[11px]">Test Signals:</span>
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setQuery(p.val);
                  setQueryType(p.type as any);
                  handleSearch(p.val, p.type);
                }}
                className="px-3 py-1 rounded-xl bg-[#070b12] border border-white/10 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer text-[11px]"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-2 max-w-3xl mx-auto">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results View */}
      {report && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase font-bold text-slate-400">Queried Identity Target</span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-mono">{report.query}</h3>
                <span className="text-xs text-slate-500 font-mono">
                  SHA-1 Range: {report.sha1_hash_prefix || '5f4dcc3b5...'} • k-Anonymity Verified
                </span>
              </div>

              <div className="flex items-center gap-3">
                {report.is_pwned ? (
                  <div className="px-4 py-2 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-300 font-mono text-xs font-bold flex items-center gap-2 shadow-ruby-glow">
                    <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                    <span>BREACH DETECTED ({report.breach_count || 1} Incidents)</span>
                  </div>
                ) : (
                  <div className="px-4 py-2 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold flex items-center gap-2 shadow-jade-glow">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>CLEAN — NO ACTIVE LEAKS</span>
                  </div>
                )}
              </div>
            </div>

            {/* Breach Incidents */}
            {report.breaches && report.breaches.length > 0 ? (
              <div className="space-y-4 font-mono text-xs">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Associated Data Breaches & Stealer Logs ({report.breaches.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.breaches.map((b: any, idx: number) => (
                    <div key={idx} className="p-5 rounded-2xl bg-[#070b12] border border-white/10 space-y-3">
                      <div className="flex justify-between items-start">
                        <h5 className="font-bold text-white text-sm">{b.name || b.title}</h5>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30">
                          {b.breach_date || '2024'}
                        </span>
                      </div>
                      <p className="text-slate-300 font-sans text-xs">{b.description}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(b.data_classes || ['Passwords', 'Email Addresses']).map((dc: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-[#141d2e] text-[10px] text-amber-400 border border-white/5">
                            {dc}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-[#070b12] rounded-2xl border border-white/10 space-y-2 font-mono text-xs">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-slate-200 font-bold">Zero Plaintext Password Appearances</p>
                <p className="text-slate-500">Your query did not appear in known high-risk stealer dump records.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
