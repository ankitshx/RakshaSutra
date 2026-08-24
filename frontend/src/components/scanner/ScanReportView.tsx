import React, { useState } from 'react';
import type { ScanResponse } from '../../types';
import { RiskGauge } from '../common/RiskGauge';
import { ThreatIndicatorCard } from '../common/ThreatIndicatorCard';
import { SimpleVerdictCard } from '../common/SimpleVerdictCard';
import { IncidentResponseModal } from './TakedownModal';
import {
  Globe,
  Copy,
  Check,
  Bot,
  Sparkles,
  SlidersHorizontal,
  Flame,
  Radio
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
    <div className="space-y-6 font-sans">
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top hairline Sutra accent */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#070b12] border border-white/10 text-slate-400">
                {report.scan_type || 'URL Scan'}
              </span>
              <span className="text-xs font-mono text-slate-500">
                ID: {report.scan_id.slice(0, 10)}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-mono text-white truncate max-w-2xl">
              {report.target}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onAskAI && (
              <button
                onClick={() => onAskAI(report.scan_id)}
                className="px-4 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-sutra-glow"
              >
                <Bot className="w-4 h-4" />
                <span>Explain With RakshaAI</span>
              </button>
            )}

            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-[#070b12] hover:bg-[#141d2e] border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Copy Report Link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Perspective Mode Switcher: Simple Plain-Language vs Deep Technical Inspector */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-2 rounded-2xl bg-[#070b12] border border-white/10">
          <div className="flex items-center gap-1 font-mono text-xs">
            <button
              onClick={() => setViewMode('simple')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'simple'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sutra-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simple Summary (Plain Language)</span>
            </button>

            <button
              onClick={() => setViewMode('technical')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'technical'
                  ? 'bg-[#141d2e] border border-amber-500/40 text-amber-300 font-bold shadow-sutra-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Deep Technical Inspector</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {(report.risk_level === 'HIGH' || report.risk_level === 'CRITICAL' || report.verdict === 'DANGER') && (
              <button
                onClick={() => setIsTakedownModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-ruby-glow"
              >
                <Flame className="w-4 h-4 text-rose-400" />
                <span>Request Takedown</span>
              </button>
            )}
          </div>
        </div>

        {/* View Mode 1: Simple Mode */}
        {viewMode === 'simple' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <SimpleVerdictCard report={report} />
          </div>
        )}

        {/* View Mode 2: Deep Technical Mode */}
        {viewMode === 'technical' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Navigation tabs within Technical View */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 font-mono text-xs">
              <button
                onClick={() => setTechTab('overview')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  techTab === 'overview'
                    ? 'bg-[#141d2e] text-amber-400 font-bold border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Overview & Heuristics
              </button>
              <button
                onClick={() => setTechTab('indicators')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  techTab === 'indicators'
                    ? 'bg-[#141d2e] text-amber-400 font-bold border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Threat Indicators ({report.threat_indicators?.length || 0})
              </button>
              <button
                onClick={() => setTechTab('telemetry')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  techTab === 'telemetry'
                    ? 'bg-[#141d2e] text-amber-400 font-bold border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Raw Telemetry
              </button>
            </div>

            {/* Sub-tab 1: Overview */}
            {techTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Gauge Card */}
                  <div className="p-6 rounded-2xl bg-[#070b12] border border-white/10 flex flex-col items-center justify-center space-y-4 shadow-lg">
                    <RiskGauge score={report.risk_score} level={report.risk_level} />
                    <div className="text-center font-mono text-xs text-slate-400">
                      Engine Verdict:{' '}
                      <span className="text-white font-bold">{report.verdict}</span>
                    </div>
                  </div>

                  {/* Technical Metadata Matrix */}
                  <div className="lg:col-span-2 p-6 rounded-2xl bg-[#070b12] border border-white/10 space-y-4 font-mono text-xs">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Globe className="w-4 h-4 text-amber-400" />
                      <span>Domain & Host Metadata</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-[#0c121e] border border-white/5 space-y-1">
                        <span className="text-[10px] text-slate-400 block">Domain Name:</span>
                        <span className="text-white font-bold truncate block">{report.domain || 'N/A'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#0c121e] border border-white/5 space-y-1">
                        <span className="text-[10px] text-slate-400 block">IP Resolution:</span>
                        <span className="text-white font-bold">{tech?.ip_address || 'Resolved via DNS'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#0c121e] border border-white/5 space-y-1">
                        <span className="text-[10px] text-slate-400 block">TLD Risk Category:</span>
                        <span className="text-white font-bold">{tech?.tld_risk || 'Standard'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#0c121e] border border-white/5 space-y-1">
                        <span className="text-[10px] text-slate-400 block">Brand Impersonation Target:</span>
                        <span className="text-amber-400 font-bold">{tech?.brand_impersonated || 'None Detected'}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0c121e] border border-white/5 space-y-1 text-slate-300 font-sans leading-relaxed">
                      <span className="text-xs font-mono font-bold text-amber-400 uppercase block">
                        Synthesis Narrative:
                      </span>
                      <p>{report.summary}</p>
                    </div>
                  </div>
                </div>

                {/* Threat Feeds Hits */}
                {tech?.threat_feeds && (
                  <div className="p-5 rounded-2xl bg-[#070b12] border border-white/10 space-y-3 font-mono text-xs">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Radio className="w-4 h-4 text-amber-400" />
                      <span>Threat Intelligence Feeds Correlation</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {Object.entries(tech.threat_feeds).map(([feedName, val]: [string, any]) => (
                        <div key={feedName} className="p-3 rounded-xl bg-[#0c121e] border border-white/5 flex justify-between items-center">
                          <span className="text-slate-300 uppercase text-[11px]">{feedName}</span>
                          <span className={`font-bold ${val ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {val ? 'Listed (Flagged)' : 'Clean'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sub-tab 2: Indicators */}
            {techTab === 'indicators' && (
              <div className="space-y-4">
                {(!report.threat_indicators || report.threat_indicators.length === 0) ? (
                  <div className="p-8 text-center bg-[#070b12] rounded-2xl border border-white/10 font-mono text-xs text-slate-400">
                    No discrete hostile threat indicators flagged. Target scored as clean.
                  </div>
                ) : (
                  report.threat_indicators.map((ind: any, i: number) => (
                    <ThreatIndicatorCard key={i} indicator={ind} />
                  ))
                )}
              </div>
            )}

            {/* Sub-tab 3: Raw Telemetry */}
            {techTab === 'telemetry' && (
              <div className="p-4 rounded-2xl bg-[#070b12] border border-white/10 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400 border-b border-white/10 pb-2">
                  <span>Raw Forensic Data Payload (JSON)</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(report, null, 2))}
                    className="hover:text-amber-400 cursor-pointer"
                  >
                    Copy JSON
                  </button>
                </div>
                <pre className="text-amber-300/90 whitespace-pre-wrap overflow-x-auto max-h-96 text-[11px]">
                  {JSON.stringify(report, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      <IncidentResponseModal
        isOpen={isTakedownModalOpen}
        onClose={() => setIsTakedownModalOpen(false)}
        targetUrl={report.target}
      />
    </div>
  );
};
