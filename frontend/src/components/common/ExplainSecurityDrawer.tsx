import React from 'react';
import {
  X,
  HelpCircle,
  ShieldAlert,
  CheckCircle2,
  Layers,
  Terminal
} from 'lucide-react';

interface ExplainSecurityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  technicalFinding: string;
  whatItMeans: string;
  whyItMatters: string;
  whatYouCanDo: string;
  ruleId?: string;
}

export const ExplainSecurityDrawer: React.FC<ExplainSecurityDrawerProps> = ({
  isOpen,
  onClose,
  title,
  technicalFinding,
  whatItMeans,
  whyItMatters,
  whatYouCanDo,
  ruleId
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-[#090e1a] border border-cyan-500/40 p-6 sm:p-8 space-y-6 shadow-2xl font-mono text-xs">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                Explain Security Finding {ruleId ? `[${ruleId}]` : ''}
              </span>
              <h3 className="text-base font-bold text-white font-sans pt-0.5">{title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4-Part Plain-English Breakdown */}
        <div className="space-y-4 font-sans text-xs">
          {/* 1. Technical Observed Reality */}
          <div className="p-3.5 rounded-2xl bg-[#04070e] border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-mono text-[10px] font-bold uppercase flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              1. Technical Data Observed
            </span>
            <p className="text-slate-300 font-mono text-[11px] leading-relaxed break-all">
              {technicalFinding}
            </p>
          </div>

          {/* 2. What it Means */}
          <div className="p-3.5 rounded-2xl bg-[#04070e] border border-slate-800 space-y-1">
            <span className="text-white font-mono text-[10px] font-bold uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              2. What It Means (Plain English)
            </span>
            <p className="text-slate-300 leading-relaxed">
              {whatItMeans}
            </p>
          </div>

          {/* 3. Why It Matters */}
          <div className="p-3.5 rounded-2xl bg-[#04070e] border border-slate-800 space-y-1">
            <span className="text-amber-400 font-mono text-[10px] font-bold uppercase flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              3. Why It Matters (Security Impact)
            </span>
            <p className="text-slate-300 leading-relaxed">
              {whyItMatters}
            </p>
          </div>

          {/* 4. What You Can Do */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
            <span className="text-cyan-300 font-mono text-[10px] font-bold uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              4. Recommended Defensive Action
            </span>
            <p className="text-slate-200 leading-relaxed">
              {whatYouCanDo}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold cursor-pointer"
          >
            Understood
          </button>
        </div>

      </div>
    </div>
  );
};
