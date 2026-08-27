import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Radio,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  Sparkles,
  X
} from 'lucide-react';

interface NewsItem {
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

interface CyberNewsTickerProps {
  onNavigateToNews?: () => void;
  onInvestigateThreat?: (title: string) => void;
}

export const CyberNewsTicker: React.FC<CyberNewsTickerProps> = ({
  onNavigateToNews,
  onInvestigateThreat
}) => {
  const [breakingItems, setBreakingItems] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    fetchBreakingNews();
  }, []);

  const fetchBreakingNews = async () => {
    try {
      const data = await api.getBreakingCyberNews(6);
      if (Array.isArray(data) && data.length > 0) {
        setBreakingItems(data);
      }
    } catch {
      // Graceful fallback
    }
  };

  useEffect(() => {
    if (breakingItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingItems.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [breakingItems.length]);

  if (breakingItems.length === 0) return null;

  const currentItem = breakingItems[currentIndex];

  const getSeverityBadge = (sev: string) => {
    switch (sev?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-950/80 text-rose-400 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/40';
      default:
        return 'bg-blue-950/80 text-blue-400 border-blue-500/40';
    }
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d1424] via-[#090d16] to-[#0d1424] border border-amber-500/30 p-2.5 sm:p-3 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          
          {/* Live Pulsing Label */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-[11px] font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="hidden sm:inline">LIVE INTEL</span>
              <Radio className="w-3 h-3 sm:hidden" />
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase hidden md:inline">
              Hourly Threat Feed
            </span>
          </div>

          {/* Current Headline */}
          <div
            onClick={() => setSelectedNews(currentItem)}
            className="flex-1 flex items-center gap-2 overflow-hidden cursor-pointer group"
          >
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${getSeverityBadge(currentItem.severity)}`}>
              {currentItem.source}
            </span>
            <p className="text-xs font-mono font-medium text-slate-200 group-hover:text-amber-300 transition-colors truncate">
              {currentItem.title}
            </p>
          </div>

          {/* Controls & Full Feed Link */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + breakingItems.length) % breakingItems.length)}
              className="p-1 rounded-lg bg-[#030508] hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 cursor-pointer"
              title="Previous Alert"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % breakingItems.length)}
              className="p-1 rounded-lg bg-[#030508] hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 cursor-pointer"
              title="Next Alert"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {onNavigateToNews && (
              <button
                onClick={onNavigateToNews}
                className="ml-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Full Feed</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Intelligence Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0c121e] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedNews(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-[#030508] text-slate-400 hover:text-white border border-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${getSeverityBadge(selectedNews.severity)}`}>
                  {selectedNews.severity} SEVERITY
                </span>
                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300">
                  {selectedNews.source}
                </span>
                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
                  {selectedNews.category}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold font-mono text-white leading-snug">
                {selectedNews.title}
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-[#030508] border border-white/10 space-y-2 text-xs font-sans text-slate-300 leading-relaxed">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">
                Executive Threat Summary
              </span>
              <p>{selectedNews.summary}</p>
            </div>

            {selectedNews.affected_systems?.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">
                  Affected Target Systems:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNews.affected_systems.map((sys, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-900 border border-white/10 text-slate-300 text-[11px] font-mono">
                      {sys}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedNews.mitigation_action && (
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1 text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-bold font-mono">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Immediate Defensive Action Required:</span>
                </div>
                <p className="text-slate-300 font-sans">{selectedNews.mitigation_action}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
              <a
                href={selectedNews.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:underline font-mono font-bold"
              >
                <span>Read Full Authoritative Advisory</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {onInvestigateThreat && (
                <button
                  onClick={() => {
                    const t = selectedNews.title;
                    setSelectedNews(null);
                    onInvestigateThreat(t);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 cursor-pointer shadow-sutra-glow"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Investigate with RakshaAI</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
