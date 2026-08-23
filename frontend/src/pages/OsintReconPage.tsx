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
  Server,
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
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
          <Network className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>AUTONOMOUS OSINT RECONNAISSANCE & THREAT GRAPH</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Unmask Threat Actors & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400">Trace Digital Footprints</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Autonomous multi-vector digital reconnaissance. Investigate usernames across 40+ platforms, map DNS infrastructure, detect email tenants, and resolve telecom carriers with real-time interactive threat graphs.
        </p>
      </div>

      {/* Main Recon Search Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/90 border-2 border-cyan-500/40 shadow-2xl space-y-6">
        {/* Tab Selection */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 max-w-2xl mx-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'all' ? 'bg-cyan-500 text-slate-950 shadow-neon-cyan font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            🎯 Auto Detect
          </button>
          <button
            onClick={() => setActiveTab('username')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'username' ? 'bg-cyan-500 text-slate-950 shadow-neon-cyan font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            🧑‍💻 Usernames
          </button>
          <button
            onClick={() => setActiveTab('domain')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'domain' ? 'bg-cyan-500 text-slate-950 shadow-neon-cyan font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            🌐 Domain / DNS
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'email' ? 'bg-cyan-500 text-slate-950 shadow-neon-cyan font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            📧 Email
          </button>
          <button
            onClick={() => setActiveTab('phone')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'phone' ? 'bg-cyan-500 text-slate-950 shadow-neon-cyan font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            📞 Phone
          </button>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteRecon();
          }}
          className="flex flex-col sm:flex-row gap-3 max-w-4xl mx-auto"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
              <Search className="w-5 h-5 text-cyan-400" />
            </div>
            <input
              type="text"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder="Enter handle (e.g. torvalds), domain (github.com), email or phone..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm sm:text-base font-mono focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !targetInput.trim()}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-neon-cyan transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Scanning 40+ Nodes...</span>
              </>
            ) : (
              <>
                <Network className="w-4 h-4" />
                <span>Launch OSINT Recon</span>
              </>
            )}
          </button>
        </form>

        {/* Presets Chips */}
        <div className="flex items-center justify-center gap-2 flex-wrap text-xs font-mono">
          <span className="text-slate-500">Fast Demo Targets:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setTargetInput(p.value);
                setActiveTab(p.type as any);
                handleExecuteRecon(p.value, p.type);
              }}
              className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono text-center flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results Section */}
      {report && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-300 font-bold">
                RECON TARGET: <span className="text-cyan-400">{targetInput}</span>
              </span>
            </div>
            <button
              onClick={handleExportDossier}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold border border-cyan-500/30 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export OSINT Dossier (JSON)</span>
            </button>
          </div>

          {/* Interactive Force-Directed Threat Graph Canvas */}
          {report.graph && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <Network className="w-5 h-5 text-cyan-400 animate-pulse" />
                  Interactive Force-Directed Intelligence Threat Graph
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Drag nodes to inspect relationships & cross-references
                </span>
              </div>
              <OsintGraphView graph={report.graph} targetLabel={targetInput} />
            </div>
          )}

          {/* Vector 1: Username Footprint Grid */}
          {report.matches && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-400" />
                  Verified Social & Developer Profiles ({report.found_count} of {report.total_probes} Probed)
                </h3>
                <span className="text-xs text-emerald-400 font-mono font-bold">
                  {Math.round((report.found_count / report.total_probes) * 100)}% Match Rate
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {report.matches.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 transition-all space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {item.platform}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                        {item.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 truncate font-mono">
                      {item.url}
                    </p>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => copyToClipboard(item.url)}
                        className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-mono cursor-pointer"
                      >
                        {copiedLink === item.url ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedLink === item.url ? 'Copied' : 'Copy'}</span>
                      </button>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vector 2: Domain Infrastructure & DNS */}
          {report.ip_addresses && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* DNS Records */}
              <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                    <Server className="w-4 h-4 text-cyan-400" />
                    DNS & Mail Infrastructure
                  </h3>
                  <span className="text-xs text-cyan-400 font-mono font-bold">
                    {report.cloud_provider}
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block mb-1">A (IP Addresses):</span>
                    <div className="text-emerald-400 font-bold">
                      {report.ip_addresses.join(', ') || 'None'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block mb-1">MX (Mail Exchangers):</span>
                    <div className="text-cyan-300">
                      {report.mail_servers.length > 0 ? report.mail_servers.join('\n') : 'No MX records'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block mb-1">Email Spoofing Protection (DMARC / SPF):</span>
                    <div className="text-amber-300">{report.dmarc_status}</div>
                  </div>
                </div>
              </div>

              {/* Discovered Subdomains */}
              <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-400" />
                    Discovered Subdomains ({report.subdomain_count})
                  </h3>
                  <span className="text-xs text-purple-400 font-mono">Certificate Transparency</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 max-h-60 overflow-y-auto space-y-2 font-mono text-xs">
                  {report.subdomains && report.subdomains.length > 0 ? (
                    report.subdomains.map((sub: string, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-slate-300 border-b border-slate-900 pb-1">
                        <span>{sub}</span>
                        <span className="text-[10px] text-purple-400 bg-purple-950 px-2 py-0.5 rounded-full border border-purple-800">
                          Active
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 text-center py-6">No subdomains exposed in public CT logs.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Vector 3: Email Tenant Profiler */}
          {report.tenant_provider && (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  Email Identity & Tenant Footprint
                </h3>
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                  report.is_disposable ? 'bg-rose-950 text-rose-300 border border-rose-500' : 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                }`}>
                  {report.is_disposable ? '⚠️ DISPOSABLE / BURNER EMAIL' : 'VERIFIED INBOX DOMAIN'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-500">Target Address:</span>
                  <div className="text-white font-bold">{report.email}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-500">Identified Mail Provider:</span>
                  <div className="text-cyan-400 font-bold">{report.tenant_provider}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-500">Public Gravatar Footprint:</span>
                  <div className="text-emerald-400 font-bold">{report.has_gravatar ? 'Profile Detected' : 'No Public Avatar'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Vector 4: Phone & Telecom Intelligence */}
          {report.carrier && (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  Telecom & Carrier Scam Radar
                </h3>
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                  report.scam_risk === 'SUSPICIOUS' ? 'bg-amber-950 text-amber-300 border border-amber-500' : 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                }`}>
                  {report.line_type}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-500">Normalized Number:</span>
                  <div className="text-white font-bold">{report.e164_format}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-500">Telecom Operator:</span>
                  <div className="text-emerald-400 font-bold">{report.carrier}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-500">Registered Circle / State:</span>
                  <div className="text-cyan-400 font-bold">{report.telecom_circle}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-500">Country:</span>
                  <div className="text-white font-bold">{report.country}</div>
                </div>
              </div>

              {report.advisory && (
                <p className="text-xs text-amber-400/90 font-mono bg-amber-950/40 p-3 rounded-xl border border-amber-500/30">
                  ⚠️ {report.advisory}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
