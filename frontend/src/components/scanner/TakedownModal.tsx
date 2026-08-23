import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  X,
  Copy,
  ExternalLink,
  Mail,
  Flame,
  FileText,
  Server,
  Sparkles
} from 'lucide-react';

interface TakedownModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUrl: string;
  threatClassification?: string;
}

export const TakedownModal: React.FC<TakedownModalProps> = ({
  isOpen,
  onClose,
  targetUrl,
  threatClassification = "Phishing / Fake Banking Lure"
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [takedownData, setTakedownData] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'email' | 'certin' | 'firewall'>('email');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && targetUrl) {
      loadTakedownPackage();
    }
  }, [isOpen, targetUrl]);

  if (!isOpen) return null;

  const loadTakedownPackage = async () => {
    setIsLoading(true);
    try {
      const res = await api.generateTakedownNotice({
        target_url: targetUrl,
        threat_classification: threatClassification
      });
      setTakedownData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 dark:bg-slate-950 border-2 border-rose-500/60 rounded-3xl shadow-2xl overflow-hidden font-mono text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>AUTONOMOUS THREAT NEUTRALIZATION SWARM</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Automated Domain Takedown & Incident Dossier
          </h2>

          <p className="text-xs text-slate-400 max-w-xl font-sans">
            Instantly generate RFC-compliant legal abuse notices, national CERT-In fraud complaints, and multi-platform firewall rules to take down malicious scam servers.
          </p>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 pt-2 text-xs">
            <button
              onClick={() => setActiveTab('email')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'email' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Registrar Abuse Email</span>
            </button>

            <button
              onClick={() => setActiveTab('certin')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'certin' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>CERT-In / 1930 Dossier</span>
            </button>

            <button
              onClick={() => setActiveTab('firewall')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'firewall' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Firewall & WAF Rules</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-rose-400 animate-spin mx-auto" />
              <div className="text-sm font-bold text-white">Extracting Registrar Abuse Contacts & Generating Cryptographic Dossier...</div>
            </div>
          ) : takedownData ? (
            <>
              {/* Target Info Bar */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Target Host:</span>
                  <strong className="text-rose-400 ml-1.5">{takedownData.domain}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Registrar:</span>
                  <strong className="text-cyan-300 ml-1.5">{takedownData.registrar_name}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Evidence SHA-256:</span>
                  <span className="text-slate-400 font-mono ml-1.5">{takedownData.sha256_evidence_hash.slice(0, 12)}...</span>
                </div>
              </div>

              {/* Tab 1: Registrar Abuse Email */}
              {activeTab === 'email' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Send to: <strong className="text-cyan-400">{takedownData.registrar_abuse_email}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={takedownData.registrar_abuse_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Webform</span>
                      </a>
                      <button
                        onClick={() => copyToClipboard(takedownData.rfc2822_abuse_notice, 'email')}
                        className="px-3 py-1 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedKey === 'email' ? 'Copied!' : 'Copy Notice'}</span>
                      </button>
                    </div>
                  </div>

                  <textarea
                    readOnly
                    rows={12}
                    value={takedownData.rfc2822_abuse_notice}
                    className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none select-all leading-relaxed"
                  />
                </div>
              )}

              {/* Tab 2: CERT-In Dossier */}
              {activeTab === 'certin' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      National Reporting Format: <strong className="text-rose-400">CERT-In & 1930 IT Act 69A</strong>
                    </span>
                    <button
                      onClick={() => copyToClipboard(takedownData.certin_incident_report, 'certin')}
                      className="px-3 py-1 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedKey === 'certin' ? 'Copied!' : 'Copy Dossier'}</span>
                    </button>
                  </div>

                  <textarea
                    readOnly
                    rows={12}
                    value={takedownData.certin_incident_report}
                    className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none select-all leading-relaxed"
                  />
                </div>
              )}

              {/* Tab 3: Multi-Platform Firewall Rules */}
              {activeTab === 'firewall' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-cyan-400 font-bold">Cloudflare WAF Expression:</span>
                      <button
                        onClick={() => copyToClipboard(takedownData.firewall_rules.cloudflare_waf_expression, 'cf')}
                        className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                      >
                        {copiedKey === 'cf' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <input
                      readOnly
                      value={takedownData.firewall_rules.cloudflare_waf_expression}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono select-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-amber-400 font-bold">Windows Defender Firewall Command:</span>
                      <button
                        onClick={() => copyToClipboard(takedownData.firewall_rules.windows_defender_firewall, 'win')}
                        className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                      >
                        {copiedKey === 'win' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <input
                      readOnly
                      value={takedownData.firewall_rules.windows_defender_firewall}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono select-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-emerald-400 font-bold">DNS Sinkhole Entry (/etc/hosts):</span>
                      <button
                        onClick={() => copyToClipboard(takedownData.dns_sinkhole_entry, 'dns')}
                        className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                      >
                        {copiedKey === 'dns' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <input
                      readOnly
                      value={takedownData.dns_sinkhole_entry}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono select-all"
                    />
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Automated evidence complies with RFC 2822 & ISO/IEC 27037 forensic standards</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
