import React, { useState } from 'react';
import { api } from '../services/api';
import type { ScanResponse } from '../types';
import { ScanReportView } from '../components/scanner/ScanReportView';
import { Loader2, AlertTriangle, Sparkles, Zap } from 'lucide-react';

interface UrlScannerPageProps {
  onAskAI: (scanId: string) => void;
}

export const UrlScannerPage: React.FC<UrlScannerPageProps> = ({ onAskAI }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ScanResponse | null>(null);
  const [step, setStep] = useState('');

  const sampleScans = [
    { label: 'SBI KYC Phish', url: 'http://login-sbi-pan-update.xyz/verify.php' },
    { label: 'PayPal Spoofing', url: 'http://paypa1-security-auth.top/signin' },
    { label: 'Apple ID Harvesting', url: 'http://appleid-support-verify.club/login' },
    { label: 'Malware Exe Drop', url: 'https://example.com/downloads/invoice_update.exe' },
    { label: 'Legitimate Domain', url: 'https://github.com' }
  ];

  const handleScan = async (targetUrl?: string) => {
    const input = (targetUrl || url).trim();
    if (!input) {
      setError('Please provide a URL to inspect.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport(null);
    setStep('Validating URL and applying SSRF safety controls...');

    const stepMessages = [
      'Normalizing syntax and parsing IDN/Punycode...',
      'Checking typosquatting & brand lookalike signatures...',
      'Analyzing domain reputation, TLD risk, and DNS records...',
      'Querying threat feeds and redirect unmaskers...',
      'Synthesizing final explainable risk report...'
    ];

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < stepMessages.length) {
        setStep(stepMessages[idx]);
        idx++;
      }
    }, 300);

    try {
      const res = await api.scanUrl(input);
      clearInterval(interval);
      setReport(res);
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || 'Failed to analyze target URL.');
    } finally {
      setIsLoading(false);
      setStep('');
    }
  };

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-sutra-glow shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              URL & DOMAIN SECURITY SCANNER
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Deterministic inspection for typosquatting, IDN homoglyphs, high-risk TLDs, and executable payloads
            </p>
          </div>
        </div>
      </div>

      {/* Input Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-xl space-y-4 relative overflow-hidden">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScan();
          }}
          className="space-y-3 font-mono"
        >
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Target URL or Hostname
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://login-sbi-verify.xyz/otp or suspicious-host.top"
              className="flex-1 px-4 py-3.5 rounded-2xl bg-[#030508] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm shadow-inner transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs tracking-wider flex items-center justify-center gap-2 shadow-sutra-glow disabled:opacity-50 transition-all cursor-pointer shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>ANALYZING...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>SCAN LINK</span>
                </>
              )}
            </button>
          </div>

          {step && (
            <div className="flex items-center gap-2 text-xs text-amber-300/90 pt-1 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>{step}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Sample Scans */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">Quick Tests:</span>
            {sampleScans.map((s) => (
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

      {/* Report Result */}
      {report && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <ScanReportView report={report} onAskAI={onAskAI} />
        </div>
      )}
    </div>
  );
};
