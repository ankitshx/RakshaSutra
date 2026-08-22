import React, { useState } from 'react';
import { api } from '../../services/api';
import type { ScanResponse } from '../../types';
import { Search, Loader2, AlertTriangle, Sparkles } from 'lucide-react';

interface QuickScanHeroProps {
  onScanComplete: (report: ScanResponse) => void;
}

export const QuickScanHero: React.FC<QuickScanHeroProps> = ({ onScanComplete }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepMessage, setStepMessage] = useState<string>('');

  const sampleLinks = [
    { label: 'SBI Banking Phish Demo', url: 'http://login-sbi-pan-update.xyz/verify.php' },
    { label: 'PayPal Lookalike Demo', url: 'http://paypa1-security-auth.top/signin' },
    { label: 'Clean Domain Demo', url: 'https://github.com' }
  ];

  const handleScan = async (targetUrl?: string) => {
    const inputUrl = (targetUrl || url).trim();
    if (!inputUrl) {
      setError('Please enter a valid URL to analyze.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStepMessage('Enforcing SSRF guards & validating destination IP...');

    const steps = [
      'Normalizing syntax & checking Punycode/homoglyphs...',
      'Running typosquatting & brand impersonation heuristics...',
      'Inspecting TLD risk metrics & DNS records...',
      'Querying multi-engine threat intelligence feeds...',
      'Calculating deterministic 0–100 explainable risk score...'
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setStepMessage(steps[stepIndex]);
        stepIndex++;
      }
    }, 280);

    try {
      const report = await api.scanUrl(inputUrl);
      clearInterval(interval);
      onScanComplete(report);
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || 'Unable to scan target URL. Please verify address.');
    } finally {
      setIsLoading(false);
      setStepMessage('');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Search Bar Container */}
      <div className="relative group">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 opacity-40 group-hover:opacity-75 blur-lg transition duration-500" />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScan();
          }}
          className="relative flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl bg-slate-950/90 border border-cyber-border backdrop-blur-2xl shadow-2xl"
        >
          <div className="flex items-center gap-3 w-full px-4 py-2">
            <Search className="w-5 h-5 text-cyan-400 shrink-0" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a suspicious link or domain (e.g. login-sbi.xyz/pan)..."
              disabled={isLoading}
              className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-neon-cyan transition-all disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Now</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Real-time scanning progress indicator */}
      {isLoading && (
        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-3 text-xs text-cyan-300 animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
          <span className="font-mono">{stepMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-center gap-3 text-xs text-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Demo Links */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-400">
        <span className="font-medium">Try Sample Demos:</span>
        {sampleLinks.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setUrl(sample.url);
              handleScan(sample.url);
            }}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-md bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition-colors font-mono text-[11px]"
          >
            {sample.label}
          </button>
        ))}
      </div>
    </div>
  );
};
