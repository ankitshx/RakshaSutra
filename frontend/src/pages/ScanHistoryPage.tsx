import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { RiskBadge } from '../components/common/RiskBadge';
import {
  History,
  Trash2,
  Download,
  Filter,
  Loader2,
  Clock
} from 'lucide-react';

interface ScanHistoryPageProps {
  onSelectScan: (scanId: string) => void;
}

export const ScanHistoryPage: React.FC<ScanHistoryPageProps> = ({ onSelectScan }) => {
  const { isAuthenticated } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, [filterType, filterRisk, isAuthenticated]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await api.getScanHistory({
        scan_type: filterType || undefined,
        risk_level: filterRisk || undefined
      });
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this scan from your history?')) return;
    setDeletingId(id);
    try {
      await api.deleteScan(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch {
      // error handled
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `rakshasutra_history_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchor.click();
  };

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header (RDS 2.0) */}
      <div className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-sutra-glow shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              SCAN HISTORY & THREAT LOGS
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Review, filter, inspect, and export previous security analysis telemetry
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141d2e] hover:bg-[#1b273d] border border-amber-500/40 text-xs font-mono font-bold text-amber-300 transition-colors cursor-pointer shadow-sutra-glow"
          >
            <Download className="w-4 h-4" />
            <span>Export History JSON</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0c121e] border border-white/10 flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <Filter className="w-4 h-4 text-amber-400" />
          <span>Filters:</span>
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="">All Scan Types</option>
          <option value="url">URL Scans</option>
          <option value="message">Message Analyses</option>
          <option value="website">Website Audits</option>
        </select>

        <select
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="">All Risk Levels</option>
          <option value="SAFE">Safe</option>
          <option value="LOW">Low</option>
          <option value="MODERATE">Moderate</option>
          <option value="SUSPICIOUS">Suspicious</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>

        {(filterType || filterRisk) && (
          <button
            onClick={() => {
              setFilterType('');
              setFilterRisk('');
            }}
            className="text-amber-400 hover:underline cursor-pointer ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* History List */}
      <div className="space-y-3 font-mono text-xs">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
            <span>Loading telemetry history...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center bg-[#0c121e] rounded-3xl border border-white/10 space-y-2 text-slate-400">
            <History className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-bold text-white">No Previous Scans Found</p>
            <p className="text-slate-500 text-xs">Execute an investigation or scan to begin building your forensic log.</p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[#0c121e] border border-white/10 hover:border-amber-500/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md"
            >
              <div
                onClick={() => onSelectScan(item.id)}
                className="space-y-1 flex-1 cursor-pointer min-w-0"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#070b12] border border-white/10 text-slate-400 uppercase font-bold">
                    {item.scan_type}
                  </span>
                  <span className="text-slate-500 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white truncate max-w-2xl">{item.target}</h4>
                <p className="text-slate-400 text-xs font-sans truncate">{item.summary}</p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <RiskBadge level={item.risk_level} />
                  <span className="text-[10px] text-slate-500 block mt-1">Score: {item.risk_score}/100</span>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="text-slate-500 hover:text-rose-400 p-2 cursor-pointer transition-colors"
                  title="Delete Scan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
