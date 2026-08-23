import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { MonitoredTarget, MonitoringAlert } from '../types';
import {
  Bell,
  Shield,
  Plus,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Activity,
  ArrowRight,
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                <Bell className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-black text-white font-mono tracking-wider">
                CONTINUOUS THREAT MONITORING
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Automated periodic audits detecting DNS re-routing, certificate alterations, and reputation drops
            </p>
          </div>

          <button
            onClick={loadData}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-mono font-bold text-slate-300 flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh State</span>
          </button>
        </div>
      </div>

      <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Add Monitored Target Widget */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" />
            Add Target to Continuous Watchlist
          </h3>
          <form onSubmit={handleAddTarget} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <input
                type="text"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                placeholder="e.g. company-portal.com, api.myservice.io"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <select
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value={6}>Every 6 Hours (Pro)</option>
                <option value={12}>Every 12 Hours</option>
                <option value={24}>Every 24 Hours (Default)</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isAdding || !newTarget.trim()}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs font-mono flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer transition-colors"
            >
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>MONITOR TARGET</span>
            </button>
          </form>
        </div>

        {/* Change Alerts / Evidence Diffs */}
        {alerts.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-base font-black font-mono text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Recent Infrastructure & Risk Change Alerts ({alerts.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                      {alert.alert_type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(alert.created_at).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {alert.title}
                  </h4>
                  <p className="text-xs text-slate-300 font-mono whitespace-pre-line bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    {alert.description}
                  </p>
                  <button
                    onClick={() => setDiffModalAlert(alert)}
                    className="text-xs text-cyan-400 hover:underline font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect Evidence Diff (Before vs After)</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monitored Targets Table */}
        <div className="space-y-4">
          <h3 className="text-base font-black font-mono text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            Active Target Watchlist ({targets.length})
          </h3>

          {targets.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <Activity className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400 font-mono">
                No targets currently under continuous monitoring. Add a domain above to begin tracking.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {targets.map((tgt) => (
                <div
                  key={tgt.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">
                        {tgt.target_type}
                      </span>
                      <h4 className="text-sm font-bold text-white font-mono truncate max-w-[220px]">
                        {tgt.target}
                      </h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      tgt.last_verdict === 'DANGER' ? 'bg-rose-950 text-rose-300 border border-rose-500/30' :
                      tgt.last_verdict === 'CAUTION' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                      'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {tgt.last_verdict} ({tgt.last_risk_score}/100)
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <div className="flex justify-between">
                      <span>Frequency:</span>
                      <span className="text-slate-200">Every {tgt.check_frequency_hours}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Checked:</span>
                      <span className="text-slate-200">
                        {tgt.last_checked_at ? new Date(tgt.last_checked_at).toLocaleTimeString() : 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleCheckNow(tgt.id)}
                      disabled={checkingId === tgt.id}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${checkingId === tgt.id ? 'animate-spin' : ''}`} />
                      <span>Check Now</span>
                    </button>
                    <button
                      onClick={() => handleDeleteTarget(tgt.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove Target"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Evidence Diff Inspection Modal */}
      {diffModalAlert && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Evidence Diff Inspector
              </h4>
              <button
                onClick={() => setDiffModalAlert(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Previous Baseline State
                </span>
                <pre className="text-slate-300 overflow-x-auto text-[11px]">
                  {JSON.stringify(diffModalAlert.previous_state, null, 2)}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                  Current Detected State
                </span>
                <pre className="text-amber-200 overflow-x-auto text-[11px]">
                  {JSON.stringify(diffModalAlert.current_state, null, 2)}
                </pre>
              </div>
            </div>

            <button
              onClick={() => setDiffModalAlert(null)}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
            >
              Close Diff
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
