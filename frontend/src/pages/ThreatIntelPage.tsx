import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ProviderStatus, ThreatFeedItem } from '../types';
import {
  Radio,
  Search,
  Loader2,
  Database,
  Activity
} from 'lucide-react';

export const ThreatIntelPage: React.FC = () => {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [feed, setFeed] = useState<ThreatFeedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [provs, feedItems] = await Promise.all([
        api.getProviders(),
        api.getThreatFeed(25)
      ]);
      setProviders(provs);
      setFeed(feedItems);
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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <Radio className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            Threat Intelligence Center
          </h1>
        </div>
        <p className="text-sm text-slate-400 max-w-2xl">
          Aggregated threat telemetry, live provider health, and global IOC repository indexed across URLhaus, VirusTotal, AbuseIPDB, and local heuristic engines.
        </p>
      </div>

      {/* Provider Matrix Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-400" /> Active Intelligence Providers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {providers.map((p) => (
            <div
              key={p.name}
              className="p-5 rounded-2xl bg-slate-900/80 border border-cyber-border backdrop-blur-md space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white font-mono">{p.display_name}</h4>
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                    p.status === 'ACTIVE'
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                      : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                  }`}
                >
                  {p.status === 'ACTIVE' ? 'LIVE' : 'LOCAL ENGINE'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-[10px] block text-slate-500">Queries</span>
                  <span className="text-slate-200 font-bold">{p.total_queries}</span>
                </div>
                <div>
                  <span className="text-[10px] block text-slate-500">Cache Hits</span>
                  <span className="text-cyan-400 font-bold">{p.cache_hits}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* IOC Search Bar */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-cyber-border backdrop-blur-xl shadow-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-cyan-400" /> Query Indicator of Compromise (IOC)
        </h3>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search domain, IPv4, URL, or campaign keyword (e.g. sbi-kyc or evil-phishing-test.top)..."
            disabled={isSearching}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-neon-cyan transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Lookup IOC</span>
          </button>
        </form>

        {/* Search Result Box */}
        {searchResult && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-900">
              <span className="text-slate-400">Target Query: {searchResult.query}</span>
              <span className={searchResult.found ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                {searchResult.found ? 'KNOWN THREAT DETECTED' : 'NO RECORD IN IOC REGISTRY'}
              </span>
            </div>
            <p className="text-slate-300 font-sans text-sm">{searchResult.risk_summary}</p>
            {searchResult.matches?.length > 0 && (
              <div className="space-y-2 pt-2">
                {searchResult.matches.map((m: any) => (
                  <div key={m.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-rose-400 font-bold">{m.threat_category}</span>
                      <span className="text-cyan-400">{m.confidence}% Confidence</span>
                    </div>
                    <p className="text-slate-400 font-sans text-xs">{m.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Global Threat Feed Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-cyan-400" /> Active Global Threat Feed ({feed.length})
          </h3>
          <span className="text-xs text-slate-400 font-mono">Live Telemetry Feed</span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-cyber-border bg-slate-900/70 backdrop-blur-xl shadow-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Threat Indicator (IOC)</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Confidence</th>
                <th className="p-3.5">Telemetry Source</th>
                <th className="p-3.5">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {feed.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-white max-w-[200px] truncate">
                    {item.ioc_value}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-600/40 text-[11px] font-bold">
                      {item.threat_category}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-cyan-400">
                    {item.confidence}%
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {item.source}
                  </td>
                  <td className="p-3.5 text-slate-300 font-sans text-xs max-w-[280px] truncate">
                    {item.description || 'Active threat pattern.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
