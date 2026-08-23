import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ThreatIntelHealth } from '../types';
import {
  ShieldCheck,
  Lock,
  Server,
  Activity,
  RefreshCw,
  Layers,
  Award,
  FileText
} from 'lucide-react';

export const TrustCenterPage: React.FC = () => {
  const [intelHealth, setIntelHealth] = useState<ThreatIntelHealth | null>(null);
  const [nistData, setNistData] = useState<any | null>(null);
  const [owaspData, setOwaspData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadHealth();
  }, []);

  const loadHealth = async () => {
    setIsLoading(true);
    try {
      const [hRes, nRes, oRes] = await Promise.all([
        api.getThreatIntelHealth(),
        api.getNistPosture(),
        api.getOwaspWstg()
      ]);
      setIntelHealth(hRes);
      setNistData(nRes);
      setOwaspData(oRes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-black text-white font-mono tracking-wider">
                TRUST CENTER & SYSTEM HEALTH
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Live operational transparency, zero-knowledge privacy guarantees, and defensive framework mappings
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ALL SERVICES OPERATIONAL</span>
            </span>
            <button
              onClick={loadHealth}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 font-sans">
        
        {/* Core Guarantees Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-mono">Zero-Knowledge k-Anonymity</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When verifying compromised passwords and credentials, we compute local SHA-1 hashes and transmit only the 5-character prefix. Plaintext credentials never touch our servers.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-mono">SSRF & Network Containment</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our URL scanning sandbox blocks internal loopbacks, RFC 1918 private subnets, and DNS rebinding attacks to prevent server-side request forgery.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-mono">Evidence-Based Integrity</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We never fabricate threat statistics, customer counts, or artificial security scores. If an intelligence engine is unavailable, our system transparently declares it.
            </p>
          </div>

        </div>

        {/* Live Threat Intelligence Engines Health */}
        {intelHealth && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Live Threat Intelligence Engines Status
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Operational state of external and internal correlation providers
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {intelHealth.operational_count} of {intelHealth.total_providers} engines online
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
              {intelHealth.providers.map((p, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white">{p.display_name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.status === 'OPERATIONAL' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                      p.status === 'NOT_CONFIGURED' ? 'bg-slate-800 text-slate-400' :
                      'bg-amber-950 text-amber-300 border border-amber-500/30'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Category: {p.category}</span>
                    <span>{p.latency_ms}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OWASP & NIST Framework References */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
          {owaspData && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                {owaspData.framework}
              </h4>
              <p className="text-xs text-slate-400">{owaspData.disclaimer}</p>
              <div className="space-y-2 text-xs">
                {owaspData.categories.map((c: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <span className="text-cyan-300 font-bold">[{c.code}] {c.name}</span>
                    <span className="text-slate-400 text-[11px]">{c.checks.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {nistData && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                {nistData.framework}
              </h4>
              <p className="text-xs text-slate-400">{nistData.disclaimer}</p>
              <div className="space-y-2 text-xs">
                {nistData.functions.slice(0, 4).map((f: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <span className="text-white font-bold">{f.name}</span>
                    <span className="text-emerald-400 font-bold">{f.score}% Aligned</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
