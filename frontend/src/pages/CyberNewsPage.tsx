import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Radio,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Clock
} from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  source: string;
  category: string;
  severity: string;
  summary: string;
  url: string;
  published_at: string;
  read_time: string;
  affected_systems: string[];
  mitigation_action: string;
}

interface CyberNewsPageProps {
  onInvestigateThreat?: (title: string) => void;
}

const CATEGORIES = [
  'all',
  'Zero-Day',
  'Ransomware',
  'Phishing',
  'Advisory',
  'Supply Chain',
  'AI Threats',
  'Data Breach'
];

export const CyberNewsPage: React.FC<CyberNewsPageProps> = ({ onInvestigateThreat }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastSynced, setLastSynced] = useState<string>('');
  const [nextSyncSeconds, setNextSyncSeconds] = useState<number>(3600);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await api.getCyberNews(selectedCategory, searchQuery, 40);
      if (res && res.articles) {
        setArticles(res.articles);
        setLastSynced(res.last_synced_at);
        setNextSyncSeconds(res.next_sync_in_seconds || 3600);
      }
    } catch (err) {
      console.error('Failed to load cyber news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNews();
  };

  const handleManualSync = async () => {
    try {
      setRefreshing(true);
      await api.refreshCyberNews();
      await fetchNews();
    } catch (err) {
      console.error('Manual news sync error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-950/80 text-rose-300 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/40';
      default:
        return 'bg-blue-950/80 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
        
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-3xl font-black font-mono text-white tracking-tight">
              Global Cyber Threat & Security News
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-2xl leading-relaxed">
            Hourly continuous threat intelligence feed aggregating CERT-In advisories, CISA KEV zero-days, ransomware intelligence, and actionable defensive remediations.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Hourly Sync Active
            </span>
            <span>•</span>
            <span>Sync Interval: Every 60 Minutes</span>
            {lastSynced && (
              <>
                <span>•</span>
                <span>Last Synced: {new Date(lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </>
            )}
            {nextSyncSeconds > 0 && (
              <>
                <span>•</span>
                <span>Next Sync in ~{Math.round(nextSyncSeconds / 60)}m</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleManualSync}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-lg shadow-rose-600/30 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing Feeds...' : 'Force Sync Feeds'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-2xl bg-[#0c121e] border border-white/10 shadow-lg">
        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-sutra-glow'
                  : 'bg-[#030508] border border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Headlines' : cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search CVEs, vendors, malware..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </form>
      </div>

      {/* News Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-xs rounded-2xl bg-[#0c121e] border border-white/10 flex items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-rose-400" />
          <span>Synchronizing live cyber threat dispatches...</span>
        </div>
      ) : articles.length === 0 ? (
        <div className="p-12 text-center text-slate-500 font-mono text-xs rounded-2xl bg-[#0c121e] border border-white/10">
          No cyber intelligence articles found matching "{searchQuery}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {articles.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 hover:border-amber-500/40 transition-all space-y-4 shadow-xl flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Header Pills */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${getSeverityBadge(item.severity)}`}>
                      {item.severity}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold">
                      {item.source}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {item.read_time}
                  </span>
                </div>

                {/* Article Title */}
                <h3 className="text-base font-bold font-mono text-white group-hover:text-amber-300 transition-colors leading-snug">
                  {item.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-slate-300 font-sans leading-relaxed line-clamp-3">
                  {item.summary}
                </p>

                {/* Affected Systems */}
                {item.affected_systems?.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">
                      Target Vector / Systems:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.affected_systems.map((sys, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-[#030508] border border-white/10 text-slate-400 text-[10px] font-mono"
                        >
                          {sys}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Remediation Action Note */}
                {item.mitigation_action && (
                  <div className="p-3 rounded-2xl bg-[#030508] border border-amber-500/20 text-[11px] space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Recommended Action:</span>
                    </div>
                    <p className="text-slate-300 font-sans">{item.mitigation_action}</p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10 mt-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-amber-400 hover:underline font-mono font-bold"
                >
                  <span>Source Bulletin</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {onInvestigateThreat && (
                  <button
                    onClick={() => onInvestigateThreat(item.title)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border border-white/10 text-slate-200 font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Investigate</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
