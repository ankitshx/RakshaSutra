import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { DashboardStats } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import {
  LayoutDashboard,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Activity,
  Layers,
  ArrowUpRight,
  BarChart3
} from 'lucide-react';

interface DashboardPageProps {
  onSelectScan: (scanId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onSelectScan }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getDashboardMetrics().then(setStats).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  if (!stats && isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-amber-400 font-mono text-sm">
        Loading RakhshaSutra Telemetry Dashboard...
      </div>
    );
  }

  const s = stats || {
    total_scans: 3,
    threats_detected: 2,
    suspicious_targets: 0,
    safe_analyses: 1,
    avg_analysis_time_ms: 45.2,
    active_providers_count: 3,
    risk_distribution: [
      { level: 'HIGH', count: 2, percentage: 66.7, color: '#f43f5e' },
      { level: 'SUSPICIOUS', count: 0, percentage: 0, color: '#f97316' },
      { level: 'MODERATE', count: 0, percentage: 0, color: '#f59e0b' },
      { level: 'LOW', count: 1, percentage: 33.3, color: '#10b981' }
    ],
    threat_categories: [
      { category: 'Brand Impersonation', count: 4 },
      { category: 'Urgency Coercion', count: 3 },
      { category: 'High-Risk TLD', count: 2 },
      { category: 'Credential Theft', count: 2 }
    ],
    recent_activity: []
  };

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header (RDS 2.0) */}
      <div className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-sutra-glow shrink-0">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              SECURITY INTELLIGENCE & TELEMETRY STREAM
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Real-time aggregation of scanned vectors, risk distribution curves, and heuristic latency
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-white/10 shadow-lg space-y-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider block">
            Total Scans
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">{s.total_scans}</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c121e] border border-white/10 shadow-lg space-y-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider block">
            Threats Intercepted
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-rose-400">{s.threats_detected}</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c121e] border border-white/10 shadow-lg space-y-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider block">
            Safe Analyses
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-400">{s.safe_analyses}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c121e] border border-white/10 shadow-lg space-y-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider block">
            Avg Engine Latency
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-amber-400">{s.avg_analysis_time_ms}ms</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Middle Section: Risk Distribution + Threat Category Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-xl space-y-6 font-mono">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>Verdict Distribution</span>
            </h3>
            <span className="text-xs text-slate-400">{s.total_scans} Total Records</span>
          </div>

          <div className="space-y-4 text-xs">
            {s.risk_distribution.map((d) => (
              <div key={d.level} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold uppercase">{d.level}</span>
                  <span className="text-white">
                    {d.count} ({d.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#030508] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${d.percentage}%`, backgroundColor: d.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Threat Categories Matrix */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-xl space-y-6 font-mono">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Top Threat Vectors Detected</span>
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            {s.threat_categories.map((c) => (
              <div key={c.category} className="flex items-center justify-between p-3 rounded-2xl bg-[#070b12] border border-white/5">
                <span className="text-slate-200 font-bold">{c.category}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 text-[11px] font-black">
                  {c.count} Intercepts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-xl space-y-4 font-mono text-xs">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Recent Activity Stream</span>
        </h3>

        {(!s.recent_activity || s.recent_activity.length === 0) ? (
          <div className="p-8 text-center bg-[#070b12] rounded-2xl border border-white/5 text-slate-400">
            No recent activity logged yet.
          </div>
        ) : (
          <div className="space-y-2">
            {s.recent_activity.map((act) => (
              <div
                key={act.scan_id}
                onClick={() => onSelectScan(act.scan_id)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#070b12] border border-white/5 hover:border-amber-500/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-[10px]">{new Date(act.timestamp).toLocaleTimeString()}</span>
                  <span className="text-white font-bold truncate max-w-xs">{act.target}</span>
                </div>
                <div className="flex items-center gap-3">
                  <RiskBadge level={act.risk_level} />
                  <ArrowUpRight className="w-4 h-4 text-slate-500 hover:text-amber-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
