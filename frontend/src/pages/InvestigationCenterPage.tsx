import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { InvestigationResponse } from '../types';
import {
  ShieldAlert,
  Loader2,
  AlertTriangle,
  Layers,
  Search,
  Network,
  Sparkles,
  Bell,
  Download,
  ShieldCheck,
  Clock,
  Activity,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface InvestigationCenterPageProps {
  initialTarget?: string;
  onNavigateTab?: (tab: string, extraData?: any) => void;
}

export const InvestigationCenterPage: React.FC<InvestigationCenterPageProps> = ({
  initialTarget = '',
  onNavigateTab: _onNavigateTab
}) => {
  const [targetInput, setTargetInput] = useState(initialTarget);
  const [isLoading, setIsLoading] = useState(false);
  const [investigation, setInvestigation] = useState<InvestigationResponse | null>(null);
  const [viewMode, setViewMode] = useState<'simple' | 'analyst'>('simple');
  const [selectedEvidenceCategory, setSelectedEvidenceCategory] = useState<string>('ALL');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'evidence' | 'timeline' | 'graph' | 'telemetry' | 'network'>('evidence');
  const [monitoringAdded, setMonitoringAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialTarget && initialTarget.trim()) {
      setTargetInput(initialTarget.trim());
      handleStartInvestigation(undefined, initialTarget.trim());
    }
  }, [initialTarget]);

  const handleStartInvestigation = async (e?: React.FormEvent, overrideTarget?: string) => {
    if (e) e.preventDefault();
    const cleanTarget = (overrideTarget || targetInput).trim();
    if (!cleanTarget || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);
    setFeedbackSubmitted(false);
    setMonitoringAdded(false);

    try {
      const res = await api.createInvestigation(cleanTarget);
      setInvestigation(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Investigation pipeline failed. Please verify connectivity.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMonitorTarget = async () => {
    if (!investigation) return;
    try {
      await api.addMonitoredTarget(investigation.normalized_target || investigation.target);
      setMonitoringAdded(true);
      setTimeout(() => setMonitoringAdded(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to add target to monitoring.');
    }
  };

  const handleFeedback = async (rating: string) => {
    if (!investigation) return;
    try {
      await api.submitInvestigationFeedback(investigation.investigation_id, rating);
      setFeedbackSubmitted(true);
    } catch {
      setFeedbackSubmitted(true);
    }
  };

  const handleDownloadDossier = () => {
    if (!investigation) return;
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(investigation, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `${investigation.investigation_id}_Threat_Dossier.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredFindings = investigation?.findings.filter(f => {
    if (selectedEvidenceCategory === 'ALL') return true;
    return f.category.toUpperCase().includes(selectedEvidenceCategory);
  }) || [];

  return (
    <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Header Card (RDS 2.0) */}
      <div className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-sutra-glow shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                UNIVERSAL THREAT INVESTIGATION CENTER
              </h1>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black bg-amber-500 text-slate-950 shadow-sutra-glow">
                THE SUTRA PIPELINE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Deterministic, explainable security analysis • Provenance-backed evidence vault
            </p>
          </div>
        </div>

        {/* View Mode Toggle: Simple vs Deep Analyst */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#030508] border border-white/10 font-mono text-xs">
          <button
            onClick={() => setViewMode('simple')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-bold ${
              viewMode === 'simple'
                ? 'bg-amber-500 text-slate-950 shadow-sutra-glow font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Simple Mode
          </button>
          <button
            onClick={() => setViewMode('analyst')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-bold ${
              viewMode === 'analyst'
                ? 'bg-amber-500 text-slate-950 shadow-sutra-glow font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Deep Analyst Mode
          </button>
        </div>
      </div>

      {/* Target Search Hero Bar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-amber-500/30 shadow-2xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 text-center sm:text-left relative">
          <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2 justify-center sm:justify-start">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Target Identifier to Audit</span>
          </h2>
          <p className="text-xs text-slate-400">
            Paste any suspicious URL, domain name, email address, IP host, or SMS phishing message.
          </p>
        </div>

        <form onSubmit={handleStartInvestigation} className="flex flex-col sm:flex-row items-center gap-3 relative">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder="e.g. sbi-kyc-update.top, https://paypal-security-auth.club, or suspicious SMS text..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#030508] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono text-sm shadow-inner transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !targetInput.trim()}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-sm font-mono tracking-wider flex items-center justify-center gap-2 shadow-sutra-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>EVALUATING PIPELINE...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>INVESTIGATE TARGET</span>
              </>
            )}
          </button>
        </form>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Investigation Results View */}
      {investigation && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Top Dossier Header Card */}
          <div className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-950/80 border border-amber-500/40 text-amber-300 shadow-sutra-glow">
                  ID: {investigation.investigation_id}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Engine v{investigation.engine_version} • Ruleset {investigation.ruleset_version}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-mono break-all">
                {investigation.normalized_target || investigation.target}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Pipeline execution completed in {investigation.duration_ms}ms • {investigation.findings.length} verifiable evidence items recorded
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleMonitorTarget}
                disabled={monitoringAdded}
                className="px-4 py-2.5 rounded-xl bg-[#070b12] hover:bg-[#141d2e] border border-white/10 text-slate-200 text-xs font-bold font-mono flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>{monitoringAdded ? 'Target Monitored ✓' : 'Add to Watchlist'}</span>
              </button>
              <button
                onClick={handleDownloadDossier}
                className="px-4 py-2.5 rounded-xl bg-[#141d2e] hover:bg-[#1b273d] border border-amber-500/40 text-amber-300 text-xs font-bold font-mono flex items-center gap-2 transition-colors cursor-pointer shadow-sutra-glow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Dossier (JSON)</span>
              </button>
            </div>
          </div>

          {/* Verdict Banner + Risk/Confidence Gauges */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Verdict Card */}
            <div className={`lg:col-span-2 p-6 sm:p-8 rounded-3xl border shadow-2xl flex flex-col justify-between space-y-6 ${
              investigation.risk_level === 'DANGER'
                ? 'bg-rose-950/20 border-rose-500/50 shadow-rose-950/20'
                : investigation.risk_level === 'CAUTION'
                ? 'bg-amber-950/20 border-amber-500/50 shadow-amber-950/20'
                : 'bg-emerald-950/20 border-emerald-500/50 shadow-emerald-950/20'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {investigation.risk_level === 'DANGER' ? (
                    <div className="p-3 rounded-2xl bg-rose-500 text-slate-950 shadow-lg">
                      <ShieldAlert className="w-7 h-7" />
                    </div>
                  ) : investigation.risk_level === 'CAUTION' ? (
                    <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 shadow-lg">
                      <AlertTriangle className="w-7 h-7" />
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-emerald-500 text-slate-950 shadow-lg">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                  )}

                  <div>
                    <span className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
                      Final Verified Determination
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                      VERDICT: {investigation.risk_level}
                    </h2>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-slate-200 font-sans leading-relaxed">
                  {investigation.plain_explanation}
                </p>
              </div>

              {/* Step-by-Step Guidance */}
              <div className="p-4 rounded-2xl bg-[#070b12]/80 border border-white/10 space-y-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  Prescribed Actions for Target:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                  {investigation.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Risk & Confidence Scoring Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl flex flex-col justify-between space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-400 mb-4">
                  Deterministic Scoring Curves
                </h4>
                
                {/* Risk Score */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-mono text-slate-300">Threat Risk Score</span>
                    <span className="text-2xl font-black font-mono text-white">
                      {investigation.risk_score}<span className="text-slate-500 text-sm">/100</span>
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#030508] border border-white/10 overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        investigation.risk_score >= 70 ? 'bg-rose-500 shadow-ruby-glow' :
                        investigation.risk_score >= 30 ? 'bg-amber-500 shadow-sutra-glow' : 'bg-emerald-500 shadow-jade-glow'
                      }`}
                      style={{ width: `${Math.max(5, investigation.risk_score)}%` }}
                    />
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-mono text-slate-300">Evidence Confidence</span>
                    <span className="text-2xl font-black font-mono text-amber-400">
                      {investigation.confidence_score}%
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#030508] border border-white/10 overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full bg-amber-400 shadow-sutra-glow transition-all duration-500"
                      style={{ width: `${investigation.confidence_score}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#070b12] border border-white/10 text-[11px] text-slate-400 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Findings Logged:</span>
                  <span className="text-slate-200 font-bold">{investigation.findings.length} points</span>
                </div>
                <div className="flex justify-between">
                  <span>Engines / Feeds Audited:</span>
                  <span className="text-slate-200 font-bold">{investigation.evidence_sources_checked.length} providers</span>
                </div>
              </div>
            </div>

          </div>

          {/* Navigation Tabs (Evidence, Timeline, Relationship Graph, Deep Telemetry) */}
          <div className="border-b border-white/10 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-4 py-3 border-b-2 text-xs font-bold font-mono transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'evidence'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Evidence Vault ({investigation.findings.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-3 border-b-2 text-xs font-bold font-mono transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'timeline'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Execution Timeline</span>
            </button>
            <button
              onClick={() => setActiveTab('graph')}
              className={`px-4 py-3 border-b-2 text-xs font-bold font-mono transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'graph'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>Relationship Graph</span>
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`px-4 py-3 border-b-2 text-xs font-bold font-mono transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'telemetry'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Raw Telemetry & Deep Headers</span>
            </button>
          </div>

          {/* TAB 1: Evidence Items with Provenance */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {['ALL', 'BRAND', 'DNS', 'TLS', 'THREAT INTEL', 'CREDENTIAL'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedEvidenceCategory(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                        selectedEvidenceCategory === cat
                          ? 'bg-[#141d2e] border-l-2 border-l-amber-500 border-y border-r border-white/10 text-amber-300 font-bold'
                          : 'bg-[#0c121e] border border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  Showing {filteredFindings.length} of {investigation.findings.length} findings
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFindings.map((finding, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#0c121e] border border-white/10 space-y-3 hover:border-amber-500/40 transition-colors shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            finding.severity === 'CRITICAL' || finding.severity === 'HIGH'
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                              : finding.severity === 'MEDIUM'
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {finding.severity}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-[#070b12] px-2 py-0.5 rounded border border-white/5">
                            {finding.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white font-mono">
                          {finding.title}
                        </h4>
                      </div>

                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {finding.source}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {finding.description}
                    </p>

                    {finding.technical_detail && (
                      <div className="bg-[#070b12] p-3 rounded-xl border border-white/5 font-mono text-[11px] text-amber-300/90 overflow-x-auto">
                        <pre>{JSON.stringify(finding.technical_detail, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Execution Timeline */}
          {activeTab === 'timeline' && (
            <div className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h4 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Chronological Pipeline Trace
                </h4>
                <span className="text-xs text-slate-400 font-mono">
                  Total Latency: {investigation.duration_ms}ms
                </span>
              </div>

              <div className="relative border-l border-white/10 pl-6 space-y-6 ml-3">
                {investigation.timeline.map((step, idx) => (
                  <div key={idx} className="relative space-y-1">
                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-[#0c121e]" />
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold font-mono text-amber-300">
                        {step.step_name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        +{step.duration_ms}ms
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Relationship Graph Topology */}
          {activeTab === 'graph' && (
            <div className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h4 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                  <Network className="w-4 h-4 text-amber-400" />
                  Entity Relationship Graph Topology
                </h4>
                <span className="text-xs text-slate-400 font-mono">
                  {investigation.relationship_graph.nodes.length} nodes • {investigation.relationship_graph.links.length} relationships
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-[#070b12] border border-white/10 flex flex-wrap items-center justify-center gap-6 min-h-[260px]">
                {investigation.relationship_graph.nodes.map((node) => (
                  <div
                    key={node.id}
                    className={`p-4 rounded-2xl border text-center space-y-1 shadow-lg transition-transform hover:scale-105 ${
                      node.type === 'root_target'
                        ? 'bg-amber-950/60 border-amber-500/50 text-amber-200 shadow-sutra-glow'
                        : node.risk_level === 'DANGER'
                        ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                        : 'bg-[#141d2e] border-white/10 text-slate-300'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block">
                      {node.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-mono font-bold block max-w-[200px] truncate">
                      {node.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Deep Telemetry & Inspector */}
          {activeTab === 'telemetry' && (
            <div className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 space-y-4 font-mono">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                Raw Telemetry & Response Inspection
              </h4>
              <pre className="p-4 rounded-2xl bg-[#070b12] border border-white/10 text-xs text-amber-300/90 overflow-x-auto max-h-[440px]">
                {JSON.stringify(investigation.raw_telemetry, null, 2)}
              </pre>
            </div>
          )}

          {/* Accuracy Feedback Bar */}
          <div className="p-4 rounded-2xl bg-[#0c121e] border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-slate-400 font-mono">
              Was this automated threat investigation accurate and useful?
            </span>
            {feedbackSubmitted ? (
              <span className="text-xs text-emerald-400 font-mono font-bold">
                ✓ Thank you! Feedback recorded for threat rule verification.
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFeedback('CORRECT')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#070b12] hover:bg-[#141d2e] text-xs font-mono text-slate-200 flex items-center gap-1.5 cursor-pointer border border-white/10 hover:border-emerald-500/40"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Accurate Verdict</span>
                </button>
                <button
                  onClick={() => handleFeedback('FALSE_POSITIVE')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#070b12] hover:bg-[#141d2e] text-xs font-mono text-slate-200 flex items-center gap-1.5 cursor-pointer border border-white/10 hover:border-rose-500/40"
                >
                  <ThumbsDown className="w-3.5 h-3.5 text-rose-400" />
                  <span>False Positive</span>
                </button>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
