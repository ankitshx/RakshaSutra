import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2
} from 'lucide-react';

export const ReportsCenterPage: React.FC = () => {
  const [reportType, setReportType] = useState<'executive' | 'technical' | 'incident' | 'compliance'>('executive');

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const reportData = {
      report_title: reportType === 'executive' ? 'Executive Digital Security Summary' :
                    reportType === 'technical' ? 'Technical Threat & Forensics Dossier' :
                    reportType === 'incident' ? 'Formal Incident Response Dossier' : 'NIST CSF 2.0 Compliance Posture Report',
      generated_at: new Date().toISOString(),
      platform: 'RakhshaSutra Personal Digital Security Command Center',
      overall_security_score: 84,
      posture_verdict: 'STABLE',
      active_monitored_targets: 6,
      zero_knowledge_verified: true,
      executive_summary: 'Overall digital security perimeter remains stable with an 84/100 composite index. Zero active credential exposures detected across 900M+ dark web databases.',
      top_recommendations: [
        'Enforce strict DMARC reject (p=reject) on root domain mail records.',
        'Review secondary port bindings on external IP hosts.',
        'Maintain monthly dark web breach scans for all associated aliases.'
      ]
    };

    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `RakshaSutra_${reportType}_Report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Header (RDS 2.0) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sutra-glow shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white font-mono tracking-wider">
              SECURITY REPORTS & DOSSIER EXPORT CENTER
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Formal executive summaries, forensic investigation dossiers, and audit compliance packages
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-[#070b12] hover:bg-[#141d2e] border border-white/10 text-slate-200 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Report (PDF)</span>
          </button>
          <button
            onClick={handleExportJson}
            className="px-4 py-2.5 rounded-xl bg-[#141d2e] hover:bg-[#1b273d] border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-sutra-glow"
          >
            <Download className="w-4 h-4" />
            <span>Download JSON</span>
          </button>
        </div>
      </div>

      {/* Report Template Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        {[
          { id: 'executive', title: 'Executive Posture Summary', desc: 'High-level safety score, deltas, and strategic recommendations' },
          { id: 'technical', title: 'Technical Threat Dossier', desc: 'Deep DNS, TLS, header audits, and forensic indicators' },
          { id: 'incident', title: 'Incident Response Package', desc: 'CERT-In formatted notice and registrar abuse letter' },
          { id: 'compliance', title: 'NIST CSF 2.0 Assessment', desc: 'Organizational control mapping and posture ratings' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setReportType(t.id as any)}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer space-y-2 ${
              reportType === t.id
                ? 'bg-[#141d2e] border-l-2 border-l-amber-500 border-y border-r border-white/10 shadow-sutra-glow font-bold'
                : 'bg-[#0c121e] border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <h4 className="text-sm font-bold text-white font-mono">{t.title}</h4>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">{t.desc}</p>
          </button>
        ))}
      </div>

      {/* Preview Sheet Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl space-y-8 max-w-4xl mx-auto font-sans">
        <div className="flex justify-between items-start border-b border-white/10 pb-6">
          <div>
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block">
              RAKSHASUTRA AUDIT REPORT
            </span>
            <h2 className="text-2xl font-black text-white font-mono mt-1">
              {reportType === 'executive' && 'Executive Digital Security Summary'}
              {reportType === 'technical' && 'Technical Threat & Forensics Dossier'}
              {reportType === 'incident' && 'Formal Incident Response Dossier'}
              {reportType === 'compliance' && 'NIST CSF 2.0 Compliance Assessment'}
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Generated: {new Date().toLocaleString()} • Platform v1.0.0-PROD
            </span>
          </div>

          <div className="text-right font-mono">
            <span className="text-xs text-slate-400 uppercase block">Composite Index</span>
            <span className="text-3xl font-black text-emerald-400">84/100</span>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-200 leading-relaxed">
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
              Executive Evaluation Narrative
            </h4>
            <p className="text-slate-300">
              The audited digital perimeter exhibits hardened defensive controls across core identity vectors. All primary domain assets maintain valid TLS transport certificates and cryptographic k-Anonymity privacy lookups confirm zero leaked plaintext passwords in monitored breach registers.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/10 font-mono text-xs">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Prescribed Strategic Recommendations
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Enforce strict DMARC reject (<code className="text-amber-300">p=reject</code>) policy on root domain email records.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Review secondary open port bindings on monitored external cloud IP addresses.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Maintain automated monthly dark web monitoring for all registered developer aliases.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};
