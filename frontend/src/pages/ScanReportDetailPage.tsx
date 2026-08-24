import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ScanResponse } from '../types';
import { ScanReportView } from '../components/scanner/ScanReportView';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';

interface ScanReportDetailPageProps {
  scanId: string;
  onBack: () => void;
  onAskAI: (scanId: string) => void;
}

export const ScanReportDetailPage: React.FC<ScanReportDetailPageProps> = ({
  scanId,
  onBack,
  onAskAI
}) => {
  const [report, setReport] = useState<ScanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    api
      .getScanById(scanId)
      .then(setReport)
      .catch((err) => setError(err.message || 'Report not found.'))
      .finally(() => setIsLoading(false));
  }, [scanId]);

  return (
    <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24 font-sans selection:bg-amber-500 selection:text-slate-950">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-mono text-amber-400 hover:underline cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard / History</span>
      </button>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-amber-400 font-mono text-xs">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span>Retrieving Security Report #{scanId.slice(0, 8)}...</span>
        </div>
      ) : error ? (
        <div className="p-6 rounded-3xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 space-y-2 font-mono">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" /> Unable to Load Report
          </div>
          <p>{error}</p>
        </div>
      ) : report ? (
        <ScanReportView report={report} onAskAI={onAskAI} />
      ) : null}
    </div>
  );
};
