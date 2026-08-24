import React, { useState } from 'react';
import {
  Layers,
  Search,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';

export interface EvidenceRecord {
  id: string;
  findingTitle: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  provenance: 'DIRECT_OBSERVATION' | 'THIRD_PARTY_INTEL' | 'HEURISTIC' | 'AI_EXPLANATION';
  sourceName: string;
  ruleId: string;
  evidenceDigest: string;
  target: string;
  investigationId: string;
  confidence: number;
  timestamp: string;
}

export const EvidenceVaultPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedProvenance, setSelectedProvenance] = useState<string>('ALL');
  const [activeEvidence, setActiveEvidence] = useState<EvidenceRecord | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const defaultRecords: EvidenceRecord[] = [
    {
      id: 'ev-01',
      findingTitle: 'Typosquatting Lookalike Domain Registered',
      category: 'Brand Impersonation',
      severity: 'CRITICAL',
      provenance: 'HEURISTIC',
      sourceName: 'Levenshtein Typosquat Engine',
      ruleId: 'RS-RULE-TYPO-09',
      evidenceDigest: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      target: 'http://login-sbi-pan-update.xyz/verify.php',
      investigationId: 'inv_88294a',
      confidence: 96,
      timestamp: 'Today, 14:20:10'
    },
    {
      id: 'ev-02',
      findingTitle: 'High-Risk Suspicious TLD (.xyz / .top) Detected',
      category: 'Reputation Analysis',
      severity: 'HIGH',
      provenance: 'DIRECT_OBSERVATION',
      sourceName: 'IANA & Spamhaus TLD Feed',
      ruleId: 'RS-RULE-TLD-02',
      evidenceDigest: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      target: 'http://login-sbi-pan-update.xyz/verify.php',
      investigationId: 'inv_88294a',
      confidence: 90,
      timestamp: 'Today, 14:20:11'
    },
    {
      id: 'ev-03',
      findingTitle: 'DMARC Softfail Policy Configuration Drift',
      category: 'Email Spoofing',
      severity: 'MEDIUM',
      provenance: 'DIRECT_OBSERVATION',
      sourceName: 'Passive DNS Resolver (DoH)',
      ruleId: 'RS-DNS-DMARC-01',
      evidenceDigest: 'sha256:4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      target: 'myservice.io',
      investigationId: 'inv_4102b',
      confidence: 100,
      timestamp: 'Yesterday, 09:15:00'
    },
    {
      id: 'ev-04',
      findingTitle: 'Verified HaveIBeenPwned Corporate Breach Match',
      category: 'Dark Web Exposure',
      severity: 'HIGH',
      provenance: 'THIRD_PARTY_INTEL',
      sourceName: 'HaveIBeenPwned API v3 (k-Anonymity)',
      ruleId: 'RS-HIBP-EXPOSURE-03',
      evidenceDigest: 'sha256:5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      target: 'victim_demo@example.com',
      investigationId: 'inv_9931a',
      confidence: 99,
      timestamp: 'Aug 18, 2026'
    }
  ];

  const [records] = useState<EvidenceRecord[]>(defaultRecords);

  const filtered = records.filter(r => {
    if (selectedSeverity !== 'ALL' && r.severity !== selectedSeverity) return false;
    if (selectedProvenance !== 'ALL' && r.provenance !== selectedProvenance) return false;
    if (!searchQuery.trim()) return true;
    return (
      r.findingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ruleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.sourceName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header (RDS 2.0) */}
      <div className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-sutra-glow shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              EVIDENCE VAULT & PROVENANCE REGISTRY
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Tamper-evident forensic artifact repository with SHA-256 integrity verification
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-5 rounded-3xl bg-[#0c121e] border border-white/10 shadow-xl space-y-4 font-mono text-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by rule ID, finding title, target, or provider..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#030508] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-3 rounded-2xl bg-[#030508] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="INFO">Info</option>
            </select>

            <select
              value={selectedProvenance}
              onChange={(e) => setSelectedProvenance(e.target.value)}
              className="px-3 py-3 rounded-2xl bg-[#030508] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">All Provenance Types</option>
              <option value="DIRECT_OBSERVATION">Direct Observation</option>
              <option value="THIRD_PARTY_INTEL">Third-Party Intel</option>
              <option value="HEURISTIC">Heuristic</option>
            </select>
          </div>
        </div>
      </div>

      {/* Evidence Records Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono text-xs">
        {filtered.map((record) => (
          <div
            key={record.id}
            onClick={() => setActiveEvidence(record)}
            className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 hover:border-amber-500/40 transition-all space-y-4 shadow-xl cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      record.severity === 'CRITICAL' || record.severity === 'HIGH'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                    }`}>
                      {record.severity}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-[#070b12] px-2 py-0.5 rounded border border-white/5">
                      {record.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">{record.findingTitle}</h4>
                </div>

                <span className="text-amber-400 font-bold text-xs">{record.confidence}% Conf.</span>
              </div>

              <p className="text-slate-300 font-sans text-xs truncate">Target: {record.target}</p>

              <div className="p-3 rounded-2xl bg-[#070b12] border border-white/5 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Rule ID:</span>
                  <span className="text-white">{record.ruleId}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Source:</span>
                  <span className="text-slate-200">{record.sourceName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Provenance:</span>
                  <span className="text-amber-400 font-bold">{record.provenance}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-slate-500">
              <span className="truncate max-w-[200px]">{record.evidenceDigest}</span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <span>View Full Digest</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Full Modal View */}
      {activeEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030508]/85 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-3xl bg-[#0c121e] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl font-mono text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 block">Cryptographic Evidence Dossier</span>
                <h3 className="text-base font-black text-white">{activeEvidence.findingTitle}</h3>
              </div>
              <button onClick={() => setActiveEvidence(null)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#070b12] border border-white/5 space-y-2">
                <span className="text-slate-400 text-[11px] block uppercase font-bold">SHA-256 Evidence Digest:</span>
                <div className="flex items-center justify-between text-amber-300 text-[11px] break-all">
                  <span>{activeEvidence.evidenceDigest}</span>
                  <button onClick={() => copyHash(activeEvidence.evidenceDigest)} className="p-1 hover:text-white ml-2">
                    {copiedHash === activeEvidence.evidenceDigest ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#070b12] border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Target:</span>
                  <span className="text-white font-bold truncate block">{activeEvidence.target}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#070b12] border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Investigation ID:</span>
                  <span className="text-white font-bold">{activeEvidence.investigationId}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveEvidence(null)}
              className="w-full py-3 rounded-xl bg-[#141d2e] hover:bg-[#1b273d] border border-white/10 text-white font-bold cursor-pointer"
            >
              Close Dossier
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
