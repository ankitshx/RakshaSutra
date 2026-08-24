import React, { useState } from 'react';
import {
  Inbox,
  Search,
  ShieldCheck,
  Eye,
  ArrowRight,
  Clock
} from 'lucide-react';

export interface SecurityInboxEvent {
  id: string;
  type: 'CRITICAL' | 'ATTENTION' | 'REVIEW' | 'RESOLVED';
  title: string;
  source: string;
  timestamp: string;
  isRead: boolean;
  summary: string;
  evidenceDigest?: string;
  target?: string;
}

interface SecurityInboxProps {
  events?: SecurityInboxEvent[];
  onOpenInvestigation?: (target: string) => void;
  onViewEvidence?: (event: SecurityInboxEvent) => void;
}

export const SecurityInbox: React.FC<SecurityInboxProps> = ({
  events: customEvents,
  onOpenInvestigation,
  onViewEvidence
}) => {
  const defaultEvents: SecurityInboxEvent[] = [
    {
      id: 'evt-001',
      type: 'CRITICAL',
      title: 'Suspicious URL Intercepted in Email',
      source: 'Gmail Extension Hook',
      timestamp: '12 mins ago',
      isRead: false,
      summary: 'Blocked navigation to http://sbi-card-kyc.xyz containing active credential harvesting form.',
      evidenceDigest: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      target: 'http://sbi-card-kyc.xyz'
    },
    {
      id: 'evt-002',
      type: 'ATTENTION',
      title: 'Domain DNS Configuration Changed',
      source: 'Continuous Watchlist Audit',
      timestamp: '2 hours ago',
      isRead: false,
      summary: 'Target myservice.io added 1 new MX mail server record (mail.backup-mx.net).',
      evidenceDigest: 'DNS_DIFF_MX_01',
      target: 'myservice.io'
    },
    {
      id: 'evt-003',
      type: 'REVIEW',
      title: 'Privacy Configuration Advisory Available',
      source: 'Security Score Engine',
      timestamp: 'Yesterday',
      isRead: true,
      summary: 'Enabling DNS-over-HTTPS on your mobile client will elevate network posture score by +6.',
      evidenceDigest: 'NIST_PR_AC_03'
    },
    {
      id: 'evt-004',
      type: 'RESOLVED',
      title: 'Leaked Password Hash Mitigated',
      source: 'Dark Web Monitor',
      timestamp: '3 days ago',
      isRead: true,
      summary: 'Corporate email credential rotated and 2-Step Verification verified.',
      evidenceDigest: 'HIBP_HASH_RANGE_RESOLVED'
    }
  ];

  const [events, setEvents] = useState<SecurityInboxEvent[]>(customEvents || defaultEvents);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toggleReadStatus = (eventId: string) => {
    setEvents(prev =>
      prev.map(e => (e.id === eventId ? { ...e, isRead: !e.isRead } : e))
    );
  };

  const filtered = events.filter(e => {
    if (filterType !== 'ALL' && e.type !== filterType) return false;
    if (!searchQuery.trim()) return true;
    return (
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.source.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
            CRITICAL
          </span>
        );
      case 'ATTENTION':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
            ATTENTION
          </span>
        );
      case 'REVIEW':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
            REVIEW
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
            RESOLVED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#090e1a] border border-slate-800 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Inbox className="w-4 h-4" />
            </span>
            <h3 className="text-base font-black font-mono text-white tracking-wide">
              UNIFIED SECURITY INBOX
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Chronological audit stream of security alerts, verified intercepts, and posture adjustments
          </p>
        </div>

        {/* Quick Filter Pill */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-[11px] font-mono">
          {['ALL', 'CRITICAL', 'ATTENTION', 'REVIEW', 'RESOLVED'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter security events by keywords, domains, or sources..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070b15] border border-slate-800 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Events Table / Feed */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#070b15] border border-slate-800 space-y-2">
            <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-mono">
              No security events matching the selected filter.
            </p>
          </div>
        ) : (
          filtered.map((evt) => (
            <div
              key={evt.id}
              className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                !evt.isRead
                  ? 'bg-[#0e1628] border-cyan-500/30 shadow-md'
                  : 'bg-[#080d19] border-slate-800/80 opacity-80'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${!evt.isRead ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
                  {getEventBadge(evt.type)}
                  <h4 className="text-xs sm:text-sm font-bold text-white font-mono">{evt.title}</h4>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {evt.timestamp}
                  </span>
                  <button
                    onClick={() => toggleReadStatus(evt.id)}
                    className="text-slate-400 hover:text-cyan-400 cursor-pointer"
                  >
                    {evt.isRead ? 'Mark Unread' : 'Mark Reviewed ✓'}
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed pl-4">
                {evt.summary}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 font-mono text-[11px] text-slate-400 pl-4">
                <div className="flex items-center gap-3">
                  <span>Source: <strong className="text-slate-200">{evt.source}</strong></span>
                  {evt.evidenceDigest && (
                    <span className="truncate max-w-[200px] text-slate-500">
                      Digest: {evt.evidenceDigest}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {evt.target && onOpenInvestigation && (
                    <button
                      onClick={() => onOpenInvestigation(evt.target!)}
                      className="text-cyan-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <span>Investigate Target</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                  {onViewEvidence && (
                    <button
                      onClick={() => onViewEvidence(evt)}
                      className="text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-slate-400" />
                      <span>Evidence</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
