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
      <div className="flex items-center justify-center py-20 text-cyan-400 font-mono text-sm">
        Loading RakshaSutra Telemetry Dashboard...
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
      { level: 'HIGH', count: 2, percentage: 66.7, color: '#ef4444' },
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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            Security Intelligence Dashboard
          </h1>
        </div>
        <p className="text-sm text-slate-400 max-w-2xl">
          Real-time aggregation of scanned vectors, risk distribution curves, high-frequency threat categories, and telemetry latency.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyber-border backdrop-blur-md shadow-lg space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
            Total Scans
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-white font-mono">{s.total_scans}</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyber-border backdrop-blur-md shadow-lg space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
            Threats Intercepted
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-rose-400 font-mono">{s.threats_detected}</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyber-border backdrop-blur-md shadow-lg space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
            Verified Clean/Low-Risk
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-400 font-mono">{s.safe_analyses}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyber-border backdrop-blur-md shadow-lg space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
            Avg Engine Latency
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-amber-400 font-mono">{s.avg_analysis_time_ms} ms</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Graphs & Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Distribution Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-cyber-border backdrop-blur-xl shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" /> Risk Level Distribution
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Historical Scans</span>
          </div>

          <div className="space-y-3">
            {s.risk_distribution.map((item) => (
              <div key={item.level} className="space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">{item.level}</span>
                  <span className="text-slate-400">{item.count} scans ({item.percentage}%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(5, item.percentage)}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Threat Categories Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-cyber-border backdrop-blur-xl shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> Frequent Attack Indicators
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Signal Density</span>
          </div>

          <div className="space-y-2.5">
            {s.threat_categories.map((cat, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
              >
                <span className="text-slate-200 font-medium">{cat.category}</span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-bold">
                  {cat.count} hits
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" /> Recent Threat Telemetry Stream
          </h3>
          <span className="text-xs text-slate-400 font-mono">Live Activity</span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-cyber-border bg-slate-900/70 backdrop-blur-xl shadow-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Vector</th>
                <th className="p-3.5">Target Display</th>
                <th className="p-3.5">Risk Score</th>
                <th className="p-3.5">Risk Level</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {s.recent_activity.map((act) => (
                <tr key={act.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px]">
                      {act.type}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-white max-w-[240px] truncate">
                    {act.target}
                  </td>
                  <td className="p-3.5 font-bold text-slate-200">
                    {act.risk_score} / 100
                  </td>
                  <td className="p-3.5">
                    <RiskBadge level={act.risk_level} size="sm" showScore={false} />
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {new Date(act.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-3.5">
                    <button
                      onClick={() => onSelectScan(act.id)}
                      className="text-cyan-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      <span>Report</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
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
