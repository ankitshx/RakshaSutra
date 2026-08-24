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
  const isHigh = report.risk_level === 'HIGH' || report.verdict === 'DANGER';
  const isSuspicious = report.risk_level === 'SUSPICIOUS' || report.risk_level === 'MODERATE' || report.verdict === 'CAUTION';

  let bannerBg = 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300';
  let BannerIcon = ShieldCheck;
  let verdictTitle = 'LOOKS NORMAL — NO MAJOR SCAM SIGNS FOUND';
  let verdictSubtitle = 'Our security engine did not find obvious phishing traps or fake brand impersonations.';
  let actionAdvice = 'You can browse normally, but always remember never to give out your banking password or OTP to strangers.';
  let safeAlternative = 'Always make sure you see the official lock icon and double-check spelling before logging in.';

  if (isHigh) {
    bannerBg = 'bg-rose-950/40 border-rose-500/60 text-rose-200';
    BannerIcon = AlertOctagon;
    verdictTitle = '🛑 STOP! THIS IS DANGEROUS (SCAM DETECTED)';
    verdictSubtitle = 'Do NOT click this link, do NOT enter passwords, and do NOT share any OTP codes.';
    actionAdvice = 'Close this page or delete the message right away. Block the sender who sent it to you.';
    safeAlternative = report.technical_details?.brand_impersonated
      ? `If you need your ${report.technical_details.brand_impersonated} account, open your official mobile app or type the verified website address directly into your browser yourself.`
      : 'Contact the official customer support line found on the back of your bank card or official bill.';
  } else if (isSuspicious) {
    bannerBg = 'bg-amber-950/40 border-amber-500/50 text-amber-200';
    BannerIcon = AlertTriangle;
    verdictTitle = '⚠️ BE VERY CAREFUL (SUSPICIOUS ACTIVITY)';
    verdictSubtitle = 'This target shows multiple warning signs commonly used by fraudsters.';
    actionAdvice = 'Do not type sensitive personal information or make payments until you verify with official sources.';
    safeAlternative = 'Do not follow links in unexpected messages. Navigate to the official service directly.';
  }

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Main Big Traffic Light Verdict Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border-2 backdrop-blur-2xl shadow-xl space-y-4 ${bannerBg}`}>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-[#090e1a] border border-slate-800 shadow-md shrink-0">
            <BannerIcon className={`w-8 h-8 ${isHigh ? 'text-rose-400 animate-pulse' : isSuspicious ? 'text-amber-400' : 'text-emerald-400'}`} />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#04070e] border border-slate-800">
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
        <div className="p-5 rounded-2xl bg-[#090e1a] border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider font-mono">
            <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">1</span>
            <span>What is this?</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
            {report.summary}
          </p>
        </div>

        {/* Card 2: What should I do right now? */}
        <div className={`p-5 rounded-2xl border shadow-md space-y-2 ${
          isHigh
            ? 'bg-rose-950/20 border-rose-500/40'
            : 'bg-[#090e1a] border-slate-800'
        }`}>
          <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider font-mono">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
              isHigh ? 'bg-rose-950 text-rose-300 border border-rose-500/40' : 'bg-cyan-950 text-cyan-400 border border-cyan-500/30'
            }`}>2</span>
            <span>What should I do?</span>
          </div>
          <p className="text-xs text-slate-200 font-semibold leading-relaxed font-sans pt-1">
            {actionAdvice}
          </p>
        </div>

        {/* Card 3: Safe alternative */}
        <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 shadow-md space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider font-mono">
            <span className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">3</span>
            <span>How to do it safely</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
            {safeAlternative}
          </p>
        </div>
      </div>

      {/* 3. Red Flags In Plain Words */}
      {report.indicators && report.indicators.length > 0 && (
        <div className="p-6 rounded-3xl bg-[#090e1a] border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Warning Signs Found in Plain Words ({report.indicators.length})
            </h3>
            <span className="text-xs text-slate-500 font-mono">Forensic Indicators</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {report.indicators.map((ind, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#04070e] border border-slate-800 space-y-1.5 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {ind.title || ind.name}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    ind.severity === 'CRITICAL' || ind.severity === 'HIGH'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  }`}>
                    {ind.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  {ind.explanation || ind.detail || ind.evidence}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
