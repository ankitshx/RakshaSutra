import React, { useState } from 'react';
import { api } from '../services/api';
import { OsintGraphView } from '../components/osint/OsintGraphView';
import {
  Search,
  Globe,
  User,
  Mail,
  Phone,
  Loader2,
  ExternalLink,
  Download,
  Network,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';

export const OsintReconPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'username' | 'domain' | 'email' | 'phone'>('all');
  const [targetInput, setTargetInput] = useState<string>('torvalds');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [report, setReport] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const presets = [
    { label: '🧑‍💻 User: torvalds', value: 'torvalds', type: 'username' },
    { label: '🌐 Domain: github.com', value: 'github.com', type: 'domain' },
    { label: '📧 Email: contact@paypal.com', value: 'contact@paypal.com', type: 'email' },
    { label: '📞 Phone: +91 98101 23456', value: '+91 98101 23456', type: 'phone' }
  ];

  const handleExecuteRecon = async (overrideTarget?: string, overrideType?: string) => {
    const query = (overrideTarget || targetInput).trim();
    const type = overrideType || activeTab;

    if (!query) {
      setError('Please enter a target username, domain, email, or phone number.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let res;
      if (type === 'username') {
        res = await api.osintScanUsername(query);
      } else if (type === 'domain') {
        res = await api.osintScanDomain(query);
      } else if (type === 'email') {
        res = await api.osintScanEmail(query);
      } else if (type === 'phone') {
        res = await api.osintScanPhone(query);
      } else {
        res = await api.osintFullRecon(query, 'auto');
      }
      setReport(res);
    } catch (err: any) {
      setError(err.message || 'OSINT reconnaissance query failed. Please check network connectivity.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(text);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleExportDossier = () => {
    if (!report) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `osint_dossier_${targetInput.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.json`);
    dlAnchor.click();
  };

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header (RDS 2.0) */}
      <div className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-sutra-glow shrink-0">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              AUTONOMOUS OSINT RECONNAISSANCE & THREAT GRAPH
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Multi-vector footprint tracing: Usernames across 40+ platforms, DNS mapping, email tenants & telecom carriers
            </p>
          </div>
        </div>
      </div>

      {/* Target Input & Mode Switcher */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {[
            { id: 'all', label: 'All Vectors (Auto)', icon: Search },
            { id: 'username', label: 'Social Username', icon: User },
            { id: 'domain', label: 'Domain & Infrastructure', icon: Globe },
            { id: 'email', label: 'Email Footprint', icon: Mail },
            { id: 'phone', label: 'Phone & Telecom', icon: Phone }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#141d2e] border-l-2 border-l-amber-500 border-y border-r border-white/10 text-amber-300 font-bold shadow-sutra-glow'
                    : 'bg-[#070b12] border border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 text-amber-400" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 font-mono">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder="Enter target username, domain, email, or telephone number..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#030508] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm shadow-inner transition-colors"
            />
          </div>

          <button
            onClick={() => handleExecuteRecon()}
            disabled={isLoading || !targetInput.trim()}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sutra-glow disabled:opacity-50 transition-all cursor-pointer shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>SCANNING OSINT SOURCES...</span>
              </>
            ) : (
              <>
                <Network className="w-4 h-4" />
                <span>EXECUTE RECON</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
          <span className="text-slate-400 text-[11px]">Quick Tests:</span>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setTargetInput(p.value);
                setActiveTab(p.type as any);
                handleExecuteRecon(p.value, p.type);
              }}
              className="px-3 py-1 rounded-xl bg-[#070b12] border border-white/10 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer text-[11px]"
            >
              {p.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Reconnaissance Results */}
      {report && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 font-sans">
          
          {/* Header Summary Card */}
          <div className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-slate-400 uppercase font-bold">OSINT Entity Footprint</span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-mono">{report.target || targetInput}</h3>
              <p className="text-xs text-slate-400 font-mono">
                Type: <span className="text-amber-400 font-bold uppercase">{report.target_type || activeTab}</span> • {report.summary || 'Footprint mapped across external databases'}
              </p>
            </div>

            <button
              onClick={handleExportDossier}
              className="px-4 py-2.5 rounded-xl bg-[#141d2e] hover:bg-[#1b273d] border border-amber-500/40 text-amber-300 font-mono text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sutra-glow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export OSINT Dossier</span>
            </button>
          </div>

          {/* Social Profiles Grid (if username query) */}
          {report.profiles && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 space-y-4">
              <h4 className="text-sm font-bold font-mono text-white flex items-center gap-2 uppercase tracking-wider">
                <User className="w-4 h-4 text-amber-400" />
                <span>Associated Social & Platform Identities ({report.profiles.length})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
                {report.profiles.map((p: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#070b12] border border-white/10 flex items-center justify-between gap-3 hover:border-amber-500/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="text-white font-bold block truncate">{p.platform}</span>
                      <span className="text-[11px] text-slate-400 truncate block">@{p.username}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => copyToClipboard(p.url)}
                        className="p-1.5 rounded-lg bg-[#141d2e] text-slate-400 hover:text-white"
                        title="Copy URL"
                      >
                        {copiedLink === p.url ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-amber-950 text-amber-400 hover:text-white"
                        title="Open External Profile"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Threat Graph Canvas */}
          {report.graph && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h4 className="text-sm font-bold font-mono text-white flex items-center gap-2 uppercase tracking-wider">
                  <Network className="w-4 h-4 text-amber-400" />
                  <span>Interactive Threat Relationship Topology</span>
                </h4>
                <span className="text-xs text-slate-400 font-mono">
                  {report.graph.nodes?.length || 0} Entities • {report.graph.links?.length || 0} Connections
                </span>
              </div>

              <OsintGraphView graph={report.graph} targetLabel={report.target || targetInput} />
            </div>
          )}

        </div>
      )}
    </div>
  );
};
