import React, { useState } from 'react';
import { api } from '../services/api';
import {
  ShieldAlert,
  Search,
  Lock,
  Mail,
  Smartphone,
  Globe,
  AlertTriangle,
  KeyRound,
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
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold">
          <Eye className="w-4 h-4 text-rose-400" />
          <span>DEEP DARK WEB & BREACH EXPOSURE RADAR</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Has Your Identity Been <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400">Leaked on Hacker Forums?</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Search billions of leaked passwords, stealer logs, and compromised corporate credentials across known dark web database dumps with zero-knowledge cryptographic privacy.
        </p>
      </div>

      {/* Query Search Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        {/* Search Type Selector */}
        <div className="flex items-center justify-center p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 max-w-md mx-auto text-xs font-bold font-mono">
          <button
            onClick={() => { setQueryType('email'); setReport(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all cursor-pointer ${
              queryType === 'email' ? 'bg-cyan-500 text-slate-950 shadow-md font-black' : 'text-slate-500 hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Address</span>
          </button>
          <button
            onClick={() => { setQueryType('phone'); setReport(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all cursor-pointer ${
              queryType === 'phone' ? 'bg-cyan-500 text-slate-950 shadow-md font-black' : 'text-slate-500 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Phone Number</span>
          </button>
          <button
            onClick={() => { setQueryType('domain'); setReport(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all cursor-pointer ${
              queryType === 'domain' ? 'bg-cyan-500 text-slate-950 shadow-md font-black' : 'text-slate-500 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Company Domain</span>
          </button>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={
                queryType === 'email' ? 'Enter email (e.g. yourname@gmail.com)' :
                queryType === 'phone' ? 'Enter phone (e.g. +91 9876543210)' :
                'Enter company domain (e.g. yourcompany.com)'
              }
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:border-cyan-400 shadow-inner"
            />
            <div className="absolute left-4 top-4 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={isLoading || !query.trim()}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-400 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldAlert className="w-5 h-5" />}
            <span>{isLoading ? 'Scanning Dark Web...' : 'Scan Exposure'}</span>
          </button>
        </div>

        {/* Privacy Note & Preset Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 font-mono">Test Presets:</span>
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setQuery(p.val);
                  setQueryType(p.type as any);
                  handleSearch(p.val, p.type);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-800 text-[11px] font-mono transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> Zero-Knowledge k-Anonymity Hashing Protected
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Exposure Report Results */}
      {report && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Main Verdict Card */}
          <div className={`p-6 sm:p-8 rounded-3xl border-2 shadow-2xl space-y-6 ${
            report.is_compromised
              ? 'bg-rose-950/20 border-rose-500/60 dark:bg-rose-950/20'
              : 'bg-emerald-950/20 border-emerald-500/60 dark:bg-emerald-950/20'
          }`}>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-0.5 rounded-full text-xs font-mono font-black uppercase ${
                    report.is_compromised ? 'bg-rose-950 text-rose-300 border border-rose-500' : 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                  }`}>
                    {report.severity} • {report.is_compromised ? 'COMPROMISED IN LEAKS' : 'CLEAN IDENTITY'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{report.scan_timestamp}</span>
                </div>

                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Target: <span className="font-mono text-cyan-400">{report.query_masked}</span>
                </h2>
              </div>

              {/* Risk Score Circle */}
              <div className="flex items-center gap-3">
                <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-mono font-black border-2 ${
                  report.is_compromised
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                }`}>
                  <span className="text-xl leading-none">{report.risk_score}</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400">RISK</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              {report.summary_plain_english}
            </p>

            {/* Exposed Data Classes */}
            {report.compromised_data_types.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-mono font-bold text-slate-400 block uppercase">
                  Exposed Compromised Data Types:
                </span>
                <div className="flex flex-wrap gap-2">
                  {report.compromised_data_types.map((dt: string) => (
                    <span
                      key={dt}
                      className="px-3 py-1 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold flex items-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-rose-400" />
                      <span>{dt}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Breach List Timeline */}
          {report.breaches.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-mono flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>Verified Breach Records Involving This Identity ({report.total_breaches_found})</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.breaches.map((b: any) => (
                  <div
                    key={b.breach_id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{b.title}</h4>
                        <span className="text-xs text-cyan-500 font-mono">{b.domain}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-600/40">
                        {b.pwn_count.toLocaleString()} Accounts
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                      {b.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span>Breach Date: <strong>{b.breach_date}</strong></span>
                      <span className="text-rose-400 font-bold">{b.severity} SEVERITY</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step-by-Step Incident Remediation Checklist */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-xl space-y-4 font-mono text-slate-100">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>Recommended Security Remediation Checklist:</span>
            </h3>

            <div className="space-y-2.5 text-xs text-slate-300 font-sans">
              {report.remediation_steps.map((step: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold font-mono text-[11px] shrink-0">
                    {idx + 1}
                  </div>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
