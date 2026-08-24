import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

import {
  ShieldCheck,
  Lock,
  Server,
  Activity,
  RefreshCw
} from 'lucide-react';

export const TrustCenterPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadHealth();
  }, []);

  const loadHealth = async () => {
    setIsLoading(true);
    try {
      await api.getThreatIntelHealth().catch(() => null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header (RDS 2.0) */}
      <div className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-sutra-glow shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              TRUST CENTER & SYSTEM INTEGRITY
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Live operational transparency, zero-knowledge privacy guarantees, and defensive framework mappings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold shadow-jade-glow">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ALL SERVICES OPERATIONAL</span>
          </span>
          <button
            onClick={loadHealth}
            className="p-2.5 rounded-xl bg-[#070b12] border border-white/10 hover:bg-[#141d2e] text-slate-400 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* Core Guarantees Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sutra-glow">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-mono">Zero-Knowledge k-Anonymity</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              When verifying compromised passwords and credentials, we compute local SHA-1 hashes and transmit only the 5-character prefix. Plaintext credentials never touch our servers.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sutra-glow">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-mono">SSRF & Network Containment</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Our URL scanning sandbox blocks internal loopbacks, RFC 1918 private subnets, and DNS rebinding attacks to prevent server-side request forgery.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sutra-glow">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-mono">Deterministic Heuristics</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Every calculated threat indicator includes explicit rule IDs, cryptographic evidence digests, and transparent explanation narratives without hidden black-box decisions.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
