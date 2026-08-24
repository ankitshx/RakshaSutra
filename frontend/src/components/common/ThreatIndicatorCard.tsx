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
    : 'bg-[#141d2e] text-amber-300 border-white/10';

  const borderColor = isCritical
    ? 'border-rose-500/30 hover:border-rose-500/60'
    : isHigh
    ? 'border-red-500/30 hover:border-red-500/60'
    : isMedium
    ? 'border-amber-500/30 hover:border-amber-500/60'
    : 'border-white/10 hover:border-amber-500/40';

  return (
    <div
      className={`rounded-2xl border bg-[#0c121e] p-4 transition-all duration-200 shadow-md ${borderColor}`}
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
              <Sparkles className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeColor}`}>
                {indicator.severity}
              </span>
              <span className="text-xs font-mono text-slate-400 bg-[#070b12] px-2 py-0.5 rounded border border-white/5">
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
        <div className="mt-3.5 pt-3.5 border-t border-white/10 space-y-2.5 text-xs">
          <div>
            <span className="font-semibold text-slate-400 block mb-1">Observed Evidence:</span>
            <p className="text-slate-200 font-sans leading-relaxed">{indicator.description}</p>
          </div>

          {indicator.technical_evidence && Object.keys(indicator.technical_evidence).length > 0 && (
            <div className="bg-[#070b12] p-3 rounded-xl border border-white/5 font-mono text-[11px]">
              <span className="text-slate-400 block mb-1 uppercase font-bold">Telemetry Payload:</span>
              <pre className="text-amber-300/90 whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(indicator.technical_evidence, null, 2)}
              </pre>
            </div>
          )}

          {indicator.recommendation && (
            <div className="flex items-start gap-2 bg-[#141d2e]/60 p-2.5 rounded-xl border border-white/5">
              <span className="text-amber-400 font-bold shrink-0">Remedy:</span>
              <span className="text-slate-200">{indicator.recommendation}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
