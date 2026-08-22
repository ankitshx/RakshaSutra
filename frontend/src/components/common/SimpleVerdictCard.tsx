import React from 'react';
import type { ScanResponse } from '../../types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon
} from 'lucide-react';

interface SimpleVerdictCardProps {
  report: ScanResponse;
}

export const SimpleVerdictCard: React.FC<SimpleVerdictCardProps> = ({ report }) => {
  const isHigh = report.risk_level === 'HIGH';
  const isSuspicious = report.risk_level === 'SUSPICIOUS' || report.risk_level === 'MODERATE';

  let bannerBg = 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-800 dark:text-emerald-300';
  let BannerIcon = ShieldCheck;
  let verdictTitle = 'LOOKS NORMAL — NO MAJOR SCAM SIGNS FOUND';
  let verdictSubtitle = 'Our security engine did not find obvious phishing traps or fake brand impersonations.';
  let actionAdvice = 'You can browse normally, but always remember never to give out your banking password or OTP to strangers.';
  let safeAlternative = 'Always make sure you see the official lock icon and double-check spelling before logging in.';

  if (isHigh) {
    bannerBg = 'bg-rose-500/10 dark:bg-rose-950/50 border-rose-500/60 text-rose-900 dark:text-rose-200';
    BannerIcon = AlertOctagon;
    verdictTitle = '🛑 STOP! THIS IS DANGEROUS (SCAM DETECTED)';
    verdictSubtitle = 'Do NOT click this link, do NOT enter passwords, and do NOT share any OTP codes.';
    actionAdvice = 'Close this page or delete the message right away. Block the sender who sent it to you.';
    safeAlternative = report.technical_details?.brand_impersonated
      ? `If you need your ${report.technical_details.brand_impersonated} account, open your official mobile app or type the verified website address directly into your browser yourself.`
      : 'Contact the official customer support line found on the back of your bank card or official bill.';
  } else if (isSuspicious) {
    bannerBg = 'bg-amber-500/10 dark:bg-amber-950/50 border-amber-500/50 text-amber-900 dark:text-amber-200';
    BannerIcon = AlertTriangle;
    verdictTitle = '⚠️ BE VERY CAREFUL (SUSPICIOUS ACTIVITY)';
    verdictSubtitle = 'This target shows multiple warning signs commonly used by fraudsters.';
    actionAdvice = 'Do not type sensitive personal information or make payments until you verify with official sources.';
    safeAlternative = 'Do not follow links in unexpected messages. Navigate to the official service directly.';
  }

  return (
    <div className="space-y-6">
      {/* 1. Main Big Traffic Light Verdict Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border-2 backdrop-blur-2xl shadow-xl space-y-4 ${bannerBg}`}>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-md shrink-0">
            <BannerIcon className={`w-8 h-8 ${isHigh ? 'text-rose-500 animate-pulse' : isSuspicious ? 'text-amber-500' : 'text-emerald-500'}`} />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-current">
              Simple Safety Verdict
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-sans tracking-tight pt-1">
              {verdictTitle}
            </h2>
            <p className="text-sm opacity-90 leading-relaxed font-medium">
              {verdictSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Three Simple Questions & Answers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: What is happening? */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider font-mono">
            <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-bold">1</span>
            <span>What is this?</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans pt-1">
            {report.summary}
          </p>
        </div>

        {/* Card 2: What should I do right now? */}
        <div className={`p-5 rounded-2xl border shadow-md space-y-2 ${
          isHigh
            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider font-mono">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
              isHigh ? 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200' : 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400'
            }`}>2</span>
            <span>What should I do?</span>
          </div>
          <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-relaxed font-sans pt-1">
            {actionAdvice}
          </p>
        </div>

        {/* Card 3: Safe alternative */}
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-md space-y-2">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold text-xs uppercase tracking-wider font-mono">
            <span className="w-6 h-6 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 flex items-center justify-center font-bold">3</span>
            <span>How to do it safely</span>
          </div>
          <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed font-sans pt-1">
            {safeAlternative}
          </p>
        </div>
      </div>

      {/* 3. Red Flags In Plain Words */}
      {report.indicators.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Warning Signs Found in Plain Words ({report.indicators.length})
            </h3>
            <span className="text-xs text-slate-500 font-sans">Easy Breakdown</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {report.indicators.map((ind, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {ind.title}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    ind.severity === 'CRITICAL' || ind.severity === 'HIGH'
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  }`}>
                    {ind.severity === 'CRITICAL' ? 'Major Red Flag' : 'Warning Sign'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {ind.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
