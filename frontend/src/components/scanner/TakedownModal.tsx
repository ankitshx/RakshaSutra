import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { IncidentDossier } from '../../types';
import {
  X,
  Copy,
  Mail,
  Shield,
  FileText,
  Server,
  PhoneCall,
  Check,
  Loader2,
  Hash
} from 'lucide-react';

interface IncidentResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUrl: string;
  threatClassification?: string;
}

export const IncidentResponseModal: React.FC<IncidentResponseModalProps> = ({
  isOpen,
  onClose,
  targetUrl,
  threatClassification = 'Phishing / Fake Banking Lure'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dossier, setDossier] = useState<IncidentDossier | null>(null);
  const [activeTab, setActiveTab] = useState<'evidence' | 'email' | 'certin' | 'firewall'>('evidence');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && targetUrl) {
      loadDossier();
    }
  }, [isOpen, targetUrl]);

  if (!isOpen) return null;

  const loadDossier = async () => {
    setIsLoading(true);
    try {
      const res = await api.generateIncidentDossier(targetUrl, threatClassification);
      setDossier(res);
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
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden font-mono text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-mono">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>INCIDENT RESPONSE ASSISTANT</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
            Incident Response Dossier & Escalation Pack
          </h2>

          <p className="text-xs text-slate-400 max-w-xl font-sans">
            Assisted reporting package containing cryptographic SHA-256 evidence digests, RFC 2822 abuse complaint letters, and CERT-In / 1930 Cyber Fraud escalation guidance.
          </p>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 pt-2 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('evidence')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'evidence' ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>Evidence Digest</span>
            </button>

            <button
              onClick={() => setActiveTab('email')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'email' ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Registrar Abuse Email</span>
            </button>

            <button
              onClick={() => setActiveTab('certin')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'certin' ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>CERT-In & 1930 Report</span>
            </button>

            <button
              onClick={() => setActiveTab('firewall')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'firewall' ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Firewall Defenses</span>
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-cyan-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-slate-400 text-xs">Synthesizing incident dossier & registrar signatures...</span>
            </div>
          ) : !dossier ? (
            <div className="text-center py-12 text-slate-500">
              Unable to generate incident dossier. Please verify the target URL and try again.
            </div>
          ) : (
            <>
              {/* Tab 1: Evidence Digest */}
              {activeTab === 'evidence' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Cryptographic Target Fingerprint</div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-500">Target URL:</span>
                        <span className="text-rose-400 font-bold">{dossier.target_url}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-500">Resolved Domain:</span>
                        <span className="text-white font-bold">{dossier.domain}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-500">SHA-256 Digest:</span>
                        <span className="text-cyan-400 font-mono text-[11px] select-all">{dossier.sha256_evidence_hash}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-500">Registrar Identified:</span>
                        <span className="text-white font-bold">{dossier.registrar_name} ({dossier.registrar_abuse_email})</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-200 space-y-2">
                    <div className="font-bold flex items-center gap-1.5 text-xs">
                      <PhoneCall className="w-4 h-4 text-amber-400" />
                      <span>Immediate Cyber Fraud Helpline Protocol</span>
                    </div>
                    <p className="text-xs text-amber-200/90 leading-relaxed font-sans">
                      {dossier.cybercrime_1930_guidance}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: RFC 2822 Abuse Email */}
              {activeTab === 'email' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Send to Registrar Trust & Safety: <strong>{dossier.registrar_abuse_email}</strong></span>
                    <button
                      onClick={() => copyToClipboard(dossier.rfc2822_abuse_notice || dossier.notice || '', 'email')}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey === 'email' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'email' ? 'Copied' : 'Copy Letter'}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 whitespace-pre-wrap text-[11px] leading-relaxed select-all">
                    {dossier.rfc2822_abuse_notice}
                  </pre>
                </div>
              )}

              {/* Tab 3: CERT-In Incident Report */}
              {activeTab === 'certin' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Submit report via <strong>incident@cert-in.org.in</strong> or <strong>cybercrime.gov.in</strong></span>
                    <button
                      onClick={() => copyToClipboard(dossier.certin_incident_report, 'certin')}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey === 'certin' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'certin' ? 'Copied' : 'Copy Report'}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 whitespace-pre-wrap text-[11px] leading-relaxed select-all">
                    {dossier.certin_incident_report}
                  </pre>
                </div>
              )}

              {/* Tab 4: Firewall Defenses */}
              {activeTab === 'firewall' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Defensive block rules for edge gateways, web servers, and DNS sinkholes.</span>
                  </div>

                  <div className="space-y-2">
                    {Object.entries(dossier.firewall_rules).map(([ruleName, ruleCode]) => (
                      <div key={ruleName} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                          <span>{ruleName.replace('_', ' ')}</span>
                          <button
                            onClick={() => copyToClipboard(ruleCode, ruleName)}
                            className="text-cyan-400 hover:text-cyan-300"
                          >
                            {copiedKey === ruleName ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <code className="text-cyan-300 text-xs select-all block">{ruleCode}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="truncate max-w-md font-sans">
            {dossier?.notice || "Assisted workflow for reporting to authorized authorities."}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export const TakedownModal = IncidentResponseModal;
