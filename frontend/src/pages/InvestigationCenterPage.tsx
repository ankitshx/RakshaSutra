import React, { useState } from 'react';
import { api } from '../services/api';
import type { InvestigationResponse } from '../types';
import {
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
  Activity,
  Layers,
  Network,
  Bell,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface InvestigationCenterPageProps {
  initialTarget?: string;
  onNavigateTab?: (tab: string) => void;
}

export const InvestigationCenterPage: React.FC<InvestigationCenterPageProps> = ({
  initialTarget = ''
}) => {
  const [targetInput, setTargetInput] = useState(initialTarget);
  const [isLoading, setIsLoading] = useState(false);
  const [investigation, setInvestigation] = useState<InvestigationResponse | null>(null);
  const [viewMode, setViewMode] = useState<'simple' | 'analyst'>('simple');
  const [selectedEvidenceCategory, setSelectedEvidenceCategory] = useState<string>('ALL');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'evidence' | 'timeline' | 'graph' | 'telemetry'>('evidence');
  const [monitoringAdded, setMonitoringAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartInvestigation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanTarget = targetInput.trim();
    if (!cleanTarget || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);
    setFeedbackSubmitted(false);
    setMonitoringAdded(false);

    try {
      const res = await api.createInvestigation(cleanTarget);
      setInvestigation(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Investigation query failed. Please check network connectivity.');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Header Bar */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-neon-cyan">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white font-mono tracking-wider">
                  THREAT INVESTIGATION CENTER
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                  FLAGSHIP v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Evidence-driven, explainable digital safety & threat intelligence pipeline
              </p>
            </div>
          </div>

          {/* Dual-Mode Toggle */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setViewMode('simple')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                viewMode === 'simple'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Simple Mode
            </button>
            <button
              onClick={() => setViewMode('analyst')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                viewMode === 'analyst'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Analyst Mode
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Search & Target Input Hero */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                What would you like to investigate?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Paste any suspicious URL, domain, IP address, email, or message text to generate a verified evidence dossier.
              </p>
            </div>

            <form onSubmit={handleStartInvestigation} className="relative flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="e.g. sbi-secure-kyc.top, https://bank-verify.xyz, or suspicious SMS text..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-sm shadow-inner transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !targetInput.trim()}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm font-mono tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ANALYZING PIPELINE...</span>
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
              <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Investigation Results View */}
        {investigation && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* Top Dossier Header Card */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300">
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
                  Analysis completed in {investigation.duration_ms}ms • {investigation.findings.length} verifiable evidence items recorded
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <button
                  onClick={handleMonitorTarget}
                  disabled={monitoringAdded}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold font-mono flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{monitoringAdded ? 'Target Monitored ✓' : 'Monitor Target'}</span>
                </button>
                <button
                  onClick={handleDownloadDossier}
                  className="px-4 py-2.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold font-mono flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Dossier (JSON)</span>
                </button>
              </div>
            </div>

            {/* Score & Verdict Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Verdict Card */}
              <div className={`lg:col-span-2 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
                investigation.risk_level === 'DANGER'
                  ? 'bg-rose-950/30 border-rose-500/40 shadow-rose-950/20'
                  : investigation.risk_level === 'CAUTION'
                  ? 'bg-amber-950/30 border-amber-500/40 shadow-amber-950/20'
                  : 'bg-emerald-950/30 border-emerald-500/40 shadow-emerald-950/20'
              } shadow-2xl flex flex-col justify-between space-y-6`}>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {investigation.risk_level === 'DANGER' ? (
                      <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-500/60 flex items-center justify-center text-rose-400 shadow-neon-rose">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                    ) : investigation.risk_level === 'CAUTION' ? (
                      <div className="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-500/60 flex items-center justify-center text-amber-400 shadow-neon-amber">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-neon-green">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                          Explainable Verdict
                        </span>
                      </div>
                      <h4 className={`text-2xl font-black font-mono ${
                        investigation.risk_level === 'DANGER' ? 'text-rose-400' :
                        investigation.risk_level === 'CAUTION' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {investigation.risk_level === 'DANGER' ? '🔴 HIGH RISK / DANGER' :
                         investigation.risk_level === 'CAUTION' ? '🟡 CAUTION ADVISED' : '🟢 LOOKS CLEAN / SAFE'}
                      </h4>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
                    {investigation.plain_explanation}
                  </p>
                </div>

                {/* Recommendations */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    Plain-English Recommendations
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {investigation.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Risk & Confidence Gauges Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col justify-between space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-400 mb-4">
                    Security Scoring Metrics
                  </h4>
                  
                  {/* Risk Score */}
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-mono text-slate-300">Threat Risk Score</span>
                      <span className="text-2xl font-black font-mono text-white">
                        {investigation.risk_score}<span className="text-slate-500 text-sm">/100</span>
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          investigation.risk_score >= 70 ? 'bg-rose-500' :
                          investigation.risk_score >= 30 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.max(5, investigation.risk_score)}%` }}
                      />
                    </div>
                  </div>

                  {/* Confidence Score */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-mono text-slate-300">Evidence Confidence</span>
                      <span className="text-2xl font-black font-mono text-cyan-400">
                        {investigation.confidence_score}%
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                        style={{ width: `${investigation.confidence_score}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span>Evidence Variety:</span>
                    <span className="text-slate-200">{investigation.findings.length} points</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Providers Checked:</span>
                    <span className="text-slate-200">{investigation.evidence_sources_checked.length} engines</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Navigation Tabs (Evidence, Timeline, Relationship Graph, Telemetry) */}
            <div className="border-b border-slate-800 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('evidence')}
                className={`px-4 py-3 border-b-2 text-xs font-bold font-mono transition-colors flex items-center gap-2 ${
                  activeTab === 'evidence'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Evidence Vault ({investigation.findings.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-4 py-3 border-b-2 text-xs font-bold font-mono transition-colors flex items-center gap-2 ${
                  activeTab === 'timeline'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Investigation Timeline</span>
              </button>
              <button
                onClick={() => setActiveTab('graph')}
                className={`px-4 py-3 border-b-2 text-xs font-bold font-mono transition-colors flex items-center gap-2 ${
                  activeTab === 'graph'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Network className="w-4 h-4" />
                <span>Relationship Graph</span>
              </button>
              <button
                onClick={() => setActiveTab('telemetry')}
                className={`px-4 py-3 border-b-2 text-xs font-bold font-mono transition-colors flex items-center gap-2 ${
                  activeTab === 'telemetry'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Raw Telemetry & Headers</span>
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
                        className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                          selectedEvidenceCategory === cat
                            ? 'bg-cyan-950 border border-cyan-500/40 text-cyan-300'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
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
                      className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              finding.severity === 'HIGH' ? 'bg-rose-950 text-rose-300 border border-rose-500/30' :
                              finding.severity === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                              'bg-slate-800 text-slate-300'
                            }`}>
                              {finding.severity}
                            </span>
                            <span className="text-xs font-mono text-cyan-400">
                              {finding.category}
                            </span>
                            {finding.rule_id && (
                              <span className="text-[10px] font-mono text-slate-500">
                                [{finding.rule_id}]
                              </span>
                            )}
                          </div>
                          <h5 className="text-sm font-bold text-white">
                            {finding.title}
                          </h5>
                        </div>

                        <span className="px-2 py-1 rounded bg-slate-950 text-[10px] font-mono text-slate-400 border border-slate-800 shrink-0">
                          {finding.provenance}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 font-mono bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                        {finding.evidence}
                      </p>

                      {viewMode === 'analyst' && finding.explanation && (
                        <p className="text-xs text-slate-400 italic">
                          {finding.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: Chronological Timeline */}
            {activeTab === 'timeline' && (
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                <h4 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Chronological Pipeline Execution Log
                </h4>
                <div className="relative border-l border-slate-800 pl-6 space-y-6 ml-3">
                  {investigation.timeline.map((step, idx) => (
                    <div key={idx} className="relative space-y-1">
                      <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-cyan-400 border-2 border-slate-950" />
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold font-mono text-cyan-300">
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

            {/* TAB 3: Relationship Graph */}
            {activeTab === 'graph' && (
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                    <Network className="w-4 h-4 text-cyan-400" />
                    Entity Relationship Graph Topology
                  </h4>
                  <span className="text-xs text-slate-500 font-mono">
                    {investigation.relationship_graph.nodes.length} nodes • {investigation.relationship_graph.links.length} relationships
                  </span>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-center gap-6 min-h-[260px]">
                  {investigation.relationship_graph.nodes.map((node) => (
                    <div
                      key={node.id}
                      className={`p-4 rounded-2xl border text-center space-y-1 shadow-lg transition-transform hover:scale-105 ${
                        node.type === 'root_target'
                          ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200'
                          : node.risk_level === 'DANGER'
                          ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
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

            {/* TAB 4: Raw Telemetry & Headers */}
            {activeTab === 'telemetry' && (
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 font-mono">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Raw Inspector Telemetry
                </h4>
                <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 overflow-x-auto max-h-[400px]">
                  {JSON.stringify(investigation.raw_telemetry, null, 2)}
                </pre>
              </div>
            )}

            {/* Feedback Widget */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-slate-400 font-mono">
                Was this automated threat investigation accurate and useful?
              </span>
              {feedbackSubmitted ? (
                <span className="text-xs text-emerald-400 font-mono">
                  Thank you! Feedback recorded for threat rule verification.
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFeedback('CORRECT')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Accurate</span>
                  </button>
                  <button
                    onClick={() => handleFeedback('FALSE_POSITIVE')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5 cursor-pointer"
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
    </div>
  );
};
