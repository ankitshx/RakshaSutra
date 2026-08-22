import React, { useState } from 'react';
import { api } from '../services/api';
import type { ScanResponse } from '../types';
import { ScanReportView } from '../components/scanner/ScanReportView';
import { Search, Loader2, AlertTriangle, Sparkles } from 'lucide-react';

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
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <Search className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            URL Security Scanner
          </h1>
        </div>
        <p className="text-sm text-slate-400 max-w-2xl">
          Deep deterministic inspection for typosquatting, IDN homoglyphs, high-risk TLDs, IP representations, executable downloads, and malicious redirect hops.
        </p>
      </div>

      {/* Input Box */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-cyber-border backdrop-blur-xl shadow-xl space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScan();
          }}
          className="space-y-3"
        >
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Target URL or Hostname
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. http://login-sbi-pan-update.xyz/verify.php"
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
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Inspect URL</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Preset Sample Links */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <span className="font-semibold">Quick Presets:</span>
          {sampleScans.map((sample, idx) => (
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

      {/* Real-time Loader */}
      {isLoading && (
        <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-3 text-xs text-cyan-300 animate-pulse font-mono">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
          <span>{step}</span>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-center gap-3 text-xs text-rose-300">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <span className="font-bold block">Scan Encountered An Error</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Report Result */}
      {report && (
        <div className="space-y-6 pt-2">
          <ScanReportView report={report} onAskAI={onAskAI} />
        </div>
      )}
    </div>
  );
};
