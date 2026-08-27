import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  RefreshCw,
  Shield
} from 'lucide-react';

interface SecurityAlert {
  id: string;
  title: string;
  alert_type: string;
  severity: string;
  confidence: number;
  status: string;
  source: string;
  description: string;
  asset_id?: string;
  asset_name?: string;
  incident_id?: string;
  recommended_action?: string;
  occurrence_count: number;
  created_at?: string;
}

export const AlertsCenterPage: React.FC = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [sevFilter, setSevFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const res = await fetch(`/api/v1/alerts/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchAlerts();
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      a.alert_type.toLowerCase().includes(search.toLowerCase());
    const matchesSev = sevFilter === 'all' || a.severity === sevFilter;
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesSev && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0c121e] border border-white/10 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
              SOC Alerts Pipeline
            </h1>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400 font-sans max-w-2xl">
            Real-time security event pipeline with automated severity triage, multi-source deduplication, and single-click incident escalation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAlerts}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-slate-300 hover:text-white font-mono text-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0c121e] border border-white/10">
          <span className="text-[11px] font-mono text-slate-400">TOTAL INGESTED</span>
          <p className="text-2xl font-mono font-bold text-white mt-1">{alerts.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#0c121e] border border-white/10">
          <span className="text-[11px] font-mono text-rose-400">CRITICAL / HIGH</span>
          <p className="text-2xl font-mono font-bold text-rose-300 mt-1">
            {alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#0c121e] border border-white/10">
          <span className="text-[11px] font-mono text-amber-400">UNRESOLVED</span>
          <p className="text-2xl font-mono font-bold text-amber-300 mt-1">
            {alerts.filter(a => a.status === 'NEW' || a.status === 'ACKNOWLEDGED').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#0c121e] border border-white/10">
          <span className="text-[11px] font-mono text-emerald-400">RESOLVED</span>
          <p className="text-2xl font-mono font-bold text-emerald-300 mt-1">
            {alerts.filter(a => a.status === 'RESOLVED').length}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-xl bg-[#0c121e] border border-white/10">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alert title, type, description..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#030508] border border-white/10 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={sevFilter}
            onChange={(e) => setSevFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="NEW">New</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0c121e] border border-white/10 text-slate-500 font-mono text-xs">
            No security alerts matching active filter criteria.
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className="p-5 rounded-2xl bg-[#0c121e] border border-white/10 hover:border-white/20 transition-all shadow-lg space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    alert.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' :
                    alert.severity === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {alert.severity}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 uppercase">
                    {alert.alert_type}
                  </span>
                  {alert.occurrence_count > 1 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-amber-500/20">
                      ×{alert.occurrence_count} events
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg ${
                    alert.status === 'NEW' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                    alert.status === 'ACKNOWLEDGED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {alert.status}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold font-mono text-white">{alert.title}</h3>
                <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">{alert.description}</p>
              </div>

              {alert.recommended_action && (
                <div className="p-3 rounded-xl bg-[#030508] border border-white/5 text-xs font-mono text-slate-300 flex items-start gap-2">
                  <Shield className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Recommended:</strong> {alert.recommended_action}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-mono text-slate-500">
                <span>Source: {alert.source} • Confidence: {alert.confidence}%</span>
                
                <div className="flex items-center gap-2">
                  {alert.status === 'NEW' && (
                    <button
                      onClick={() => handleUpdateStatus(alert.id, 'ACKNOWLEDGED')}
                      className="px-2.5 py-1 rounded bg-[#030508] border border-white/10 hover:border-amber-500/50 text-slate-300 hover:text-white cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  )}
                  {alert.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleUpdateStatus(alert.id, 'RESOLVED')}
                      className="px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-950 cursor-pointer"
                    >
                      Mark Resolved
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
