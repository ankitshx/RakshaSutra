import React, { useState } from 'react';
import type { ScanResponse } from '../../types';
import { RiskGauge } from '../common/RiskGauge';
import { RiskBadge } from '../common/RiskBadge';
import { ThreatIndicatorCard } from '../common/ThreatIndicatorCard';
import { SimpleVerdictCard } from '../common/SimpleVerdictCard';
import { TakedownModal } from './TakedownModal';
import {
  ShieldCheck,
  Globe,
  Copy,
  Check,
  Bot,
  Server,
  Layers,
  FileText,
  Sparkles,
  SlidersHorizontal,
  Flame
} from 'lucide-react';

interface ScanReportViewProps {
  report: ScanResponse;
  onAskAI?: (scanId: string) => void;
}

export const ScanReportView: React.FC<ScanReportViewProps> = ({ report, onAskAI }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'simple' | 'technical'>('simple');
  const [techTab, setTechTab] = useState<'overview' | 'indicators' | 'telemetry'>('overview');
  const [isTakedownModalOpen, setIsTakedownModalOpen] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tech = report.technical_details;

  return (
    <div className="space-y-6">
      {/* Top Header with Mode Switcher */}
      <div className="rounded-3xl border border-slate-200 dark:border-cyber-border bg-white/90 dark:bg-slate-950/85 backdrop-blur-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/40">
                REPORT #{report.request_id}
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {new Date(report.created_at).toLocaleString()}
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight break-all font-mono">
              {report.target_display}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 break-all font-mono">
              <Globe className="w-4 h-4 text-cyan-500 shrink-0" />
              <span>{report.target}</span>
            </div>
          </div>

          {/* Action Buttons & View Mode Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Simple vs Technical View Mode Switcher */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('simple')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'simple'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simple View (Easy)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('technical')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'technical'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Technical Mode</span>
              </button>
            </div>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-800 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={() => setIsTakedownModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white uppercase tracking-wider shadow-md transition-all cursor-pointer"
              title="Generate automated registrar abuse takedown package and firewall rules"
            >
              <Flame className="w-4 h-4" />
              <span>Automate Takedown</span>
            </button>

            {onAskAI && (
              <button
                onClick={() => onAskAI(report.scan_id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>Ask Raksha AI</span>
              </button>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* MODE 1: SIMPLE USER-FRIENDLY VIEW (DEFAULT FOR EVERYONE)     */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'simple' && (
          <div className="animate-in fade-in duration-200">
            <SimpleVerdictCard report={report} />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODE 2: TECHNICAL ANALYST VIEW                                */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'technical' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Sub-tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 w-fit">
              <button
                onClick={() => setTechTab('overview')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  techTab === 'overview'
                    ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Speedometer & Metrics
              </button>
              <button
                onClick={() => setTechTab('indicators')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  techTab === 'indicators'
                    ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Raw Indicators ({report.indicators.length})
              </button>
              <button
                onClick={() => setTechTab('telemetry')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  techTab === 'telemetry'
                    ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Network & DNS Telemetry
              </button>
            </div>

            {techTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
                <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800">
                  <RiskGauge score={report.risk_score} level={report.risk_level} size={190} />
                  <div className="mt-4">
                    <RiskBadge level={report.risk_level} score={report.risk_score} size="md" />
                  </div>
                </div>

                <div className="md:col-span-8 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 mb-2 flex items-center gap-1.5 font-mono">
                      <FileText className="w-4 h-4" /> Technical Summary
                    </h3>
                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                      {report.summary}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5 font-mono">
                      <ShieldCheck className="w-4 h-4" /> Remediation Recommendation
                    </h3>
                    <p className="text-sm text-emerald-900 dark:text-emerald-200/90 leading-relaxed bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-500/40 p-4 rounded-2xl">
                      {report.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {techTab === 'indicators' && (
              <div className="space-y-3 pt-2">
                {report.indicators.map((ind, idx) => (
                  <ThreatIndicatorCard key={idx} indicator={ind} />
                ))}
              </div>
            )}

            {techTab === 'telemetry' && tech && (
              <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-slate-50 dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h5 className="text-cyan-700 dark:text-cyan-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                    <Server className="w-4 h-4" /> Domain & Network Resolution
                  </h5>
                  <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Registered Domain:</span>
                    <span className="text-slate-900 dark:text-slate-200 font-bold">{tech.domain}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">TLD Risk Tier:</span>
                    <span className="text-slate-900 dark:text-slate-200">{tech.tld_reputation_tier} (.{tech.tld})</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Target IP(s):</span>
                    <span className="text-slate-900 dark:text-slate-200">{tech.ip_addresses?.join(', ') || 'Protected DNS'}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500 dark:text-slate-400">HTTPS Transport:</span>
                    <span className={tech.https_enabled ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                      {tech.https_enabled ? 'Enforced' : 'Plaintext HTTP'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h5 className="text-cyan-700 dark:text-cyan-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Heuristic & Redirect Telemetry
                  </h5>
                  <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Brand Impersonated:</span>
                    <span className={tech.brand_impersonated ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500'}>
                      {tech.brand_impersonated || 'None Detected'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Levenshtein Distance:</span>
                    <span className="text-slate-900 dark:text-slate-200">{tech.levenshtein_distance ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Redirect Hops:</span>
                    <span className="text-slate-900 dark:text-slate-200">{tech.redirect_chain?.length || 0}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500 dark:text-slate-400">HTTP Status Code:</span>
                    <span className="text-slate-900 dark:text-slate-200">{tech.status_code || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Autonomous Takedown Modal */}
      <TakedownModal
        isOpen={isTakedownModalOpen}
        onClose={() => setIsTakedownModalOpen(false)}
        targetUrl={report.target || report.target_display}
        threatClassification={report.risk_level || 'Phishing / Fake Banking Lure'}
      />
    </div>
  );
};
