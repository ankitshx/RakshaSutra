import React, { useState } from 'react';
import { api } from '../services/api';
import type { WebsiteScanResponse } from '../types';
import { ThreatIndicatorCard } from '../components/common/ThreatIndicatorCard';
import {
  Globe,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Lock
} from 'lucide-react';

export const WebsiteAnalyzerPage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<WebsiteScanResponse | null>(null);

  const sampleWebsites = [
    { label: 'GitHub (Strong CSP & HSTS)', url: 'https://github.com' },
    { label: 'Google (Hardened Infrastructure)', url: 'https://google.com' },
    { label: 'HTTP Test Domain', url: 'http://example.com' }
  ];

  const handleScan = async (targetUrl?: string) => {
    const input = (targetUrl || url).trim();
    if (!input) {
      setError('Please provide a website URL to audit.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await api.scanWebsite(input);
      setReport(res);
    } catch (err: any) {
      setError(err.message || 'Failed to inspect website security properties.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRatingBadge = (rating: string) => {
    if (rating === 'A+' || rating === 'A') {
      return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50 shadow-jade-glow';
    } else if (rating === 'B' || rating === 'C') {
      return 'bg-amber-950/80 text-amber-400 border-amber-500/50 shadow-sutra-glow';
    } else {
      return 'bg-rose-950/80 text-rose-400 border-rose-500/50 shadow-ruby-glow';
    }
  };

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-sutra-glow shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              WEBSITE SECURITY & TLS AUDIT
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Passive audit of TLS certificates, Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), and HTTP security headers
            </p>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-xl space-y-4 relative overflow-hidden">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScan();
          }}
          className="space-y-3 font-mono"
        >
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Target Website URL
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. https://example.com"
              disabled={isLoading}
              className="flex-1 px-4 py-3.5 rounded-2xl bg-[#030508] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-inner transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sutra-glow transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>AUDITING TLS SOCKET...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>AUDIT HEADERS & TLS</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Presets */}
          <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">Quick Tests:</span>
            {sampleWebsites.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  setUrl(s.url);
                  handleScan(s.url);
                }}
                className="px-3 py-1 rounded-xl bg-[#070b12] border border-white/10 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer text-[11px]"
              >
                {s.label}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Report View */}
      {report && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 font-sans">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl space-y-6">
            {/* Top Score Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase font-bold">Target Evaluated</span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-mono">{report.domain}</h3>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right font-mono">
                  <span className="text-xs text-slate-400 uppercase block">Security Grade</span>
                  <span className="text-2xl font-black text-white">{report.score}/100</span>
                </div>
                <div className={`px-4 py-2 rounded-2xl border text-2xl font-black font-mono ${getRatingBadge(report.rating)}`}>
                  {report.rating}
                </div>
              </div>
            </div>

            {/* TLS Certificate Status */}
            <div className="p-5 rounded-2xl bg-[#070b12] border border-white/10 space-y-3 font-mono text-xs">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>TLS Transport Security Certificate</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#0c121e] border border-white/5">
                  <span className="text-[10px] text-slate-400 block">HTTPS Enforced:</span>
                  <span className="text-emerald-400 font-bold">
                    {report.has_tls ? '✓ Active (Port 443)' : '✗ Unencrypted HTTP'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#0c121e] border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Protocol:</span>
                  <span className="text-white font-bold">{report.tls_details?.protocol || 'TLS 1.3'}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0c121e] border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Certificate Issuer:</span>
                  <span className="text-white font-bold truncate block">{report.tls_details?.issuer || 'DigiCert / Let\'s Encrypt'}</span>
                </div>
              </div>
            </div>

            {/* HTTP Security Headers Table */}
            <div className="space-y-3 font-mono text-xs">
              <h4 className="text-sm font-bold text-white">HTTP Security Headers Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(report.security_headers || {}).map(([hdr, configured]) => (
                  <div
                    key={hdr}
                    className="p-3.5 rounded-xl bg-[#070b12] border border-white/10 flex items-center justify-between"
                  >
                    <span className="text-slate-300 font-bold">{hdr}</span>
                    {configured ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Configured</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-400 font-bold">
                        <XCircle className="w-4 h-4" />
                        <span>Missing</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Threat Indicators */}
            {report.threat_indicators && report.threat_indicators.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-400">
                  Header & TLS Compliance Findings ({report.threat_indicators.length})
                </h4>
                <div className="space-y-3">
                  {report.threat_indicators.map((ind: any, i: number) => (
                    <ThreatIndicatorCard key={i} indicator={ind} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
