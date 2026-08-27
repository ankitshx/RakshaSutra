import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface SecurityReport {
  id: string;
  title: string;
  report_type: string;
  summary: string;
  target_scope?: string;
  overall_posture_score: number;
  findings_summary: Record<string, number>;
  created_at?: string;
  content_markdown?: string;
}

export const ReportsCenterPage: React.FC = () => {
  const [reports, setReports] = useState<SecurityReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedReport, setSelectedReport] = useState<SecurityReport | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('Q3 2026 Comprehensive Security Assessment');
  const [newType, setNewType] = useState('EXECUTIVE_SUMMARY');
  const [newScope, setNewScope] = useState('Entire Digital Infrastructure');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data);
        if (data.length > 0 && !selectedReport) {
          fetchReportDetail(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/reports/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedReport(data);
      }
    } catch (err) {
      console.error('Fetch report detail error:', err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenerating(true);
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const res = await fetch('/api/v1/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: newTitle,
          report_type: newType,
          target_scope: newScope
        })
      });
      if (res.ok) {
        const data = await res.json();
        setIsGenerateModalOpen(false);
        fetchReports();
        fetchReportDetail(data.id);
      }
    } catch (err) {
      console.error('Report generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0c121e] border border-white/10 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
              Security Reports & Dossier Generator
            </h1>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400 font-sans max-w-2xl">
            Generate formal executive summaries, technical vulnerability audits, incident postmortems, and printable compliance dossiers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchReports}
            className="p-2.5 rounded-xl bg-[#030508] border border-white/10 text-slate-400 hover:text-white cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-sutra-glow"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate New Report</span>
          </button>
        </div>
      </div>

      {/* Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Report List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Available Reports ({reports.length})
          </h3>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {reports.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono text-xs rounded-xl bg-[#0c121e] border border-white/10">
                No security reports generated yet.
              </div>
            ) : (
              reports.map(rep => (
                <div
                  key={rep.id}
                  onClick={() => fetchReportDetail(rep.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer shadow-md space-y-2 ${
                    selectedReport?.id === rep.id
                      ? 'bg-blue-950/30 border-blue-500/50'
                      : 'bg-[#0c121e] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-blue-400">{rep.id}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Score: {rep.overall_posture_score}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold font-mono text-white line-clamp-1">{rep.title}</h4>
                  <p className="text-[11px] text-slate-400 font-sans line-clamp-2">{rep.summary}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono text-slate-500">
                    <span>{rep.report_type}</span>
                    <span>{rep.created_at?.split('T')[0]}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Report Markdown & Print Preview */}
        <div className="lg:col-span-8 rounded-2xl bg-[#0c121e] border border-white/10 p-6 shadow-2xl space-y-6">
          {selectedReport ? (
            <div className="space-y-6 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">
                    {selectedReport.id} • {selectedReport.report_type}
                  </span>
                  <h3 className="text-lg font-bold font-mono text-white mt-1">{selectedReport.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#030508] border border-white/10 hover:border-white/30 text-slate-300 hover:text-white cursor-pointer font-bold"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / PDF</span>
                  </button>
                </div>
              </div>

              {/* Markdown Content Viewer */}
              <div className="p-6 rounded-xl bg-[#030508] border border-white/10 text-slate-300 font-sans leading-relaxed whitespace-pre-wrap max-h-[600px] overflow-y-auto">
                {selectedReport.content_markdown || selectedReport.summary}
              </div>
            </div>
          ) : (
            <div className="py-32 text-center text-slate-500 font-mono text-xs">
              Select a report to preview its full markdown content and export options.
            </div>
          )}
        </div>

      </div>

      {/* Generate Report Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0c121e] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold font-mono text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span>Generate Security Report</span>
            </h3>
            <form onSubmit={handleGenerateReport} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Report Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Report Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-white focus:outline-none"
                >
                  <option value="EXECUTIVE_SUMMARY">Executive Summary</option>
                  <option value="SECURITY_ASSESSMENT">Security Assessment</option>
                  <option value="ATTACK_SURFACE">Attack Surface Audit</option>
                  <option value="VULNERABILITY_AUDIT">Vulnerability Audit</option>
                  <option value="INCIDENT_POSTMORTEM">Incident Postmortem</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Scope</label>
                <input
                  type="text"
                  value={newScope}
                  onChange={(e) => setNewScope(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#030508] border border-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {generating ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
