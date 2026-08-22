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
  FileText
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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <History className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              Scan History & Reports
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Review, inspect, or delete previous security analysis reports.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer w-fit"
          >
            <Download className="w-4 h-4" />
            <span>Export History JSON</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyber-border backdrop-blur-xl flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span>Filters:</span>
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="">All Scan Types</option>
          <option value="url">URL Scans</option>
          <option value="message">Message Analyses</option>
          <option value="website">Website Audits</option>
        </select>

        <select
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="">All Risk Tiers</option>
          <option value="HIGH">High Risk</option>
          <option value="SUSPICIOUS">Suspicious</option>
          <option value="MODERATE">Moderate</option>
          <option value="LOW">Low Risk</option>
        </select>

        <span className="ml-auto text-slate-500">
          Showing {history.length} records
        </span>
      </div>

      {/* History Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-cyan-400 font-mono text-xs">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span>Loading historical scan telemetry...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <FileText className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No Historical Scans Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {!isAuthenticated
              ? 'Sign in to save, persist, and review your previous scan telemetry.'
              : 'Run your first URL scan or Message analysis to start building your security history.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-cyber-border bg-slate-900/70 backdrop-blur-xl shadow-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Target</th>
                <th className="p-3.5">Risk Score</th>
                <th className="p-3.5">Risk Level</th>
                <th className="p-3.5">Indicators</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase font-bold text-[10px]">
                      {item.scan_type}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-white max-w-[240px] truncate">
                    {item.target_display}
                  </td>
                  <td className="p-3.5 font-bold text-slate-200">
                    {item.risk_score}/100
                  </td>
                  <td className="p-3.5">
                    <RiskBadge level={item.risk_level} size="sm" showScore={false} />
                  </td>
                  <td className="p-3.5 text-cyan-400 font-bold">
                    {item.indicators_count}
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onSelectScan(item.id)}
                        className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-900/60 transition-colors font-bold"
                      >
                        View Report
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        title="Delete from history"
                        className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
