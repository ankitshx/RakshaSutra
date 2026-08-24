import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { MonitoredTarget, MonitoringAlert } from '../types';
import {
  Bell,
  Plus,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Activity,
  Loader2
} from 'lucide-react';

export const MonitoringPage: React.FC = () => {
  const [targets, setTargets] = useState<MonitoredTarget[]>([]);
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [newTarget, setNewTarget] = useState('');
  const [targetType] = useState('domain');
  const [frequency, setFrequency] = useState(24);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [diffModalAlert, setDiffModalAlert] = useState<MonitoringAlert | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tgtRes, alrRes] = await Promise.all([
        api.getMonitoredTargets(),
        api.getMonitoringAlerts()
      ]);
      setTargets(tgtRes || []);
      setAlerts(alrRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarget.trim()) return;

    setIsAdding(true);
    try {
      await api.addMonitoredTarget(newTarget.trim(), targetType, frequency);
      setNewTarget('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to add monitored target.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleCheckNow = async (targetId: string) => {
    setCheckingId(targetId);
    try {
      const res = await api.checkTargetNow(targetId);
      if (res.diff_detected) {
        alert(`Change Detected on ${res.target}:\n\n${res.diffs.join('\n')}`);
      }
      loadData();
    } catch (err: any) {
      alert(err.message || 'Audit check failed.');
    } finally {
      setCheckingId(null);
    }
  };

  const handleDeleteTarget = async (targetId: string) => {
    if (!confirm('Are you sure you want to remove this target from continuous monitoring?')) return;
    try {
      await api.deleteMonitoredTarget(targetId);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove target.');
    }
  };

  return (
    <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-sutra-glow shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              CONTINUOUS THREAT MONITORING
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              24/7 background audit of DNS records, SSL/TLS certificates, IP address changes, and infrastructure drift
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="p-2.5 rounded-xl bg-[#070b12] hover:bg-[#141d2e] border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Refresh Monitoring Data"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Add New Target Bar */}
      <div className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 shadow-xl space-y-4 relative overflow-hidden">
        <form onSubmit={handleAddTarget} className="flex flex-col sm:flex-row items-center gap-3 font-mono">
          <div className="flex-1 w-full relative">
            <input
              type="text"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              placeholder="Enter domain or URL to monitor 24/7 (e.g. sharma1.org or mybrand.com)..."
              className="w-full px-4 py-3.5 rounded-2xl bg-[#030508] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm shadow-inner transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="px-4 py-3.5 rounded-2xl bg-[#030508] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value={6}>Every 6 Hours</option>
              <option value={12}>Every 12 Hours</option>
              <option value={24}>Daily (24 Hours)</option>
              <option value={168}>Weekly (7 Days)</option>
            </select>

            <button
              type="submit"
              disabled={isAdding || !newTarget.trim()}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sutra-glow disabled:opacity-50 transition-all cursor-pointer shrink-0"
            >
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>ADD TARGET</span>
            </button>
          </div>
        </form>
      </div>

      {/* Monitored Targets List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Active Monitored Watchlist ({targets.length})</span>
          </h3>
        </div>

        {targets.length === 0 ? (
          <div className="p-12 text-center bg-[#0c121e] rounded-3xl border border-white/10 space-y-3 font-mono">
            <Bell className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-white font-bold text-sm">No Monitored Targets Added Yet</h4>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              Add your critical corporate domains, personal websites, or vendor portals above to receive automated alerts upon unauthorized DNS or SSL changes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {targets.map((tgt) => (
              <div
                key={tgt.id}
                className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 space-y-4 hover:border-amber-500/40 transition-all shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                          {tgt.target_type} • Every {tgt.check_frequency_hours}h
                        </span>
                      </div>
                      <h4 className="text-base font-black font-mono text-white truncate">
                        {tgt.target}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleDeleteTarget(tgt.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors cursor-pointer"
                      title="Remove Target"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#070b12] border border-white/5 space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Last Checked:</span>
                      <span className="text-slate-200">
                        {tgt.last_checked ? new Date(tgt.last_checked).toLocaleTimeString() : 'Pending'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Status:</span>
                      <span className="text-emerald-400 font-bold">MONITORED</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleCheckNow(tgt.id)}
                    disabled={checkingId === tgt.id}
                    className="w-full py-2.5 rounded-xl bg-[#141d2e] hover:bg-[#1b273d] border border-amber-500/30 text-amber-300 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sutra-glow"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${checkingId === tgt.id ? 'animate-spin' : ''}`} />
                    <span>{checkingId === tgt.id ? 'AUDITING TARGET...' : 'CHECK NOW'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alerts Log */}
      {alerts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Infrastructure Drift Alerts ({alerts.length})</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {alerts.map((alr) => (
              <div
                key={alr.id}
                className="p-5 rounded-2xl bg-[#0c121e] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-500/40 font-bold">
                      {alr.alert_type}
                    </span>
                    <span className="text-slate-400">{new Date(alr.created_at).toLocaleString()}</span>
                  </div>
                  <h4 className="text-white font-bold">{alr.title}</h4>
                  <p className="text-slate-300 font-sans text-xs">{alr.description}</p>
                </div>

                {alr.diff_details && (
                  <button
                    onClick={() => setDiffModalAlert(alr)}
                    className="px-4 py-2 rounded-xl bg-[#070b12] hover:bg-[#141d2e] border border-white/10 text-amber-400 text-xs font-bold cursor-pointer"
                  >
                    View Diff
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diff Details Modal */}
      {diffModalAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030508]/80 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl bg-[#0c121e] border border-white/10 p-6 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h4 className="text-white font-bold">Infrastructure Diff Details</h4>
              <button onClick={() => setDiffModalAlert(null)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-[#030508] border border-white/5 text-amber-300 overflow-x-auto text-[11px]">
              {JSON.stringify(diffModalAlert.diff_details, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
