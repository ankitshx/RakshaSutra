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
  ShieldAlert,
  Info
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
      return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50 shadow-neon-emerald';
    } else if (rating === 'B' || rating === 'C') {
      return 'bg-amber-950/80 text-amber-400 border-amber-500/50';
    } else {
      return 'bg-rose-950/80 text-rose-400 border-rose-500/50';
    }
  };

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <Globe className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            Website Security Configuration Audit
          </h1>
        </div>
        <p className="text-sm text-slate-400 max-w-2xl">
          Non-intrusive passive audit of TLS certificates, Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), and client-side defensive HTTP headers.
        </p>
      </div>

      {/* Input */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-cyber-border backdrop-blur-xl shadow-xl space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScan();
          }}
          className="space-y-3"
        >
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Target Website URL
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. https://example.com"
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-neon-cyan transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Auditing Headers...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Audit Website</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <span className="font-semibold">Test Sample Targets:</span>
          {sampleWebsites.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setUrl(sample.url);
                handleScan(sample.url);
              }}
              disabled={isLoading}
              className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 font-mono text-[11px] transition-colors"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-center gap-3 text-xs text-rose-300">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Audit Report */}
      {report && (
        <div className="space-y-6">
          {/* Main Hygiene Card */}
          <div className="rounded-2xl border border-cyber-border bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  WEBSITE AUDIT #{report.request_id}
                </span>
                <h3 className="text-lg font-bold text-white font-mono mt-2 break-all">
                  {report.target_url}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-xl border text-center font-mono ${getRatingBadge(report.hygiene_rating)}`}>
                  <span className="text-2xl font-black block">{report.hygiene_rating}</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold">Grade</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
                  <span className="text-xl font-bold text-white block">{report.hygiene_score}/100</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Hygiene</span>
                </div>
              </div>
            </div>

            {/* TLS Certificate Status */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 block mb-1">TLS Transport:</span>
                <span className={report.tls_details.enabled ? 'text-emerald-400 font-bold flex items-center gap-1' : 'text-rose-400 font-bold flex items-center gap-1'}>
                  {report.tls_details.enabled ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {report.tls_details.enabled ? `${report.tls_details.version || 'HTTPS Enforced'}` : 'Unencrypted HTTP'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Certificate Authority:</span>
                <span className="text-slate-200">{report.tls_details.issuer || 'Standard Public CA'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">HSTS Preload/Header:</span>
                <span className={report.tls_details.hsts_active ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {report.tls_details.hsts_active ? 'Active & Enforced' : 'Missing / Inactive'}
                </span>
              </div>
            </div>

            {/* Explanation */}
            <div className="space-y-3">
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-800">
                {report.summary}
              </p>
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Distinction Note:</strong> Missing security headers represent defense-in-depth configuration hygiene weaknesses, not confirmed malicious intent.
                </span>
              </div>
            </div>

            {/* Security Headers Table */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                HTTP Security Headers Compliance Matrix
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Security Header</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Importance</th>
                      <th className="p-3">Guidance / Best Practice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {report.headers_audit.map((hdr, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="p-3 font-semibold text-white">
                          {hdr.name}
                        </td>
                        <td className="p-3">
                          {hdr.present ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                              <XCircle className="w-3.5 h-3.5" /> MISSING
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            hdr.importance === 'CRITICAL'
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {hdr.importance}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300 font-sans text-xs">
                          {hdr.recommendation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Indicators list */}
          {report.indicators.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                Security Findings & Recommendations ({report.indicators.length})
              </h3>
              <div className="space-y-3">
                {report.indicators.map((ind, idx) => (
                  <ThreatIndicatorCard key={idx} indicator={ind} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
