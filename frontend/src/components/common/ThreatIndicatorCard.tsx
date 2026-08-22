import React, { useState } from 'react';
import type { ThreatIndicator } from '../../types';
import { AlertCircle, ChevronDown, ChevronUp, ShieldAlert, Sparkles } from 'lucide-react';

interface ThreatIndicatorCardProps {
  indicator: ThreatIndicator;
}

export const ThreatIndicatorCard: React.FC<ThreatIndicatorCardProps> = ({ indicator }) => {
  const [isOpen, setIsOpen] = useState(true);

  const isCritical = indicator.severity === 'CRITICAL';
  const isHigh = indicator.severity === 'HIGH';
  const isMedium = indicator.severity === 'MEDIUM';

  const badgeColor = isCritical
    ? 'bg-rose-950/80 text-rose-300 border-rose-600/50'
    : isHigh
    ? 'bg-red-950/80 text-red-300 border-red-500/40'
    : isMedium
    ? 'bg-amber-950/70 text-amber-300 border-amber-500/40'
    : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30';

  const borderColor = isCritical
    ? 'border-rose-500/30 hover:border-rose-500/60'
    : isHigh
    ? 'border-red-500/30 hover:border-red-500/60'
    : isMedium
    ? 'border-amber-500/30 hover:border-amber-500/60'
    : 'border-slate-800 hover:border-cyan-500/40';

  return (
    <div
      className={`rounded-xl border bg-slate-900/70 backdrop-blur-md p-4 transition-all duration-200 ${borderColor}`}
    >
      <div
        className="flex items-start justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {isCritical || isHigh ? (
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            ) : isMedium ? (
              <AlertCircle className="w-5 h-5 text-amber-400" />
            ) : (
              <Sparkles className="w-5 h-5 text-cyan-400" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeColor}`}>
                {indicator.severity}
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                {indicator.category}
              </span>
              {indicator.score_impact > 0 && (
                <span className="text-xs font-mono text-rose-400 font-semibold">
                  +{indicator.score_impact} pts
                </span>
              )}
            </div>
            <h4 className="text-sm font-semibold text-white tracking-wide">
              {indicator.title}
            </h4>
          </div>
        </div>
        <button
          className="text-slate-400 hover:text-white p-1"
          aria-label="Toggle details"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-800/80 space-y-2.5 text-xs">
          <div>
            <span className="font-semibold text-slate-400 block mb-1">Observed Evidence:</span>
            <div className="bg-slate-950/80 rounded-lg p-2.5 font-mono text-slate-300 border border-slate-800/60 break-all">
              {indicator.evidence}
            </div>
          </div>
          <div>
            <span className="font-semibold text-cyan-400 block mb-1">Why this matters:</span>
            <p className="text-slate-300 leading-relaxed">
              {indicator.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
