import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LiveGlobalThreatFeed } from '../components/common/LiveGlobalThreatFeed';
import type { ProviderStatus } from '../types';
import {
  Radio,
  Search,
  Loader2,
  Activity
} from 'lucide-react';

export const ThreatIntelPage: React.FC = () => {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const provs = await api.getProviders();
      setProviders(provs);
    } catch {
      // fallback
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await api.searchIOC(searchQuery.trim());
      setSearchResult(res);
    } catch {
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header (RDS 2.0) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-sutra-glow shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              THREAT INTELLIGENCE & GLOBAL INTERCEPT CENTER
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Aggregated threat telemetry, real-time cyber attacks feed, live provider health, and global IOC repository indexed across URLhaus, VirusTotal, and AbuseIPDB
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Global Attack Feed */}
        <div className="lg:col-span-5 w-full">
          <LiveGlobalThreatFeed onSelectThreat={(threat) => setSearchQuery(threat)} />
        </div>

        {/* Right Column: Provider Matrix & Search */}
        <div className="lg:col-span-7 w-full space-y-6">
          {/* Provider Matrix Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Active Intelligence Providers</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              {providers.map((p) => (
                <div
                  key={p.name}
                  className="p-4 rounded-2xl bg-[#0c121e] border border-white/10 space-y-2 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{p.display_name}</h4>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                        p.status === 'ACTIVE'
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                          : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {p.status === 'ACTIVE' ? 'LIVE' : 'LOCAL'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans">{p.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* IOC Search Box */}
          <div className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 space-y-4 font-mono text-xs shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-400" />
              <span>Search Global IOC Repository</span>
            </h3>

            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search IOC by IP, domain, MD5/SHA256 hash..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#030508] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black uppercase tracking-wider shadow-sutra-glow cursor-pointer disabled:opacity-50"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>LOOKUP</span>}
              </button>
            </form>

            {searchResult && (
              <div className="p-4 rounded-2xl bg-[#070b12] border border-white/5 space-y-2 animate-in fade-in">
                <span className="text-amber-400 font-bold">IOC Query Result:</span>
                <pre className="text-slate-200 text-[11px] overflow-x-auto">
                  {JSON.stringify(searchResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
