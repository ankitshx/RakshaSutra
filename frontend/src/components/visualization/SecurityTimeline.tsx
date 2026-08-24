import React from 'react';
import { TrendingUp } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  date: string;
  scoreChange: number;
  currentScore: number;
  title: string;
  description: string;
  resolvedFindings: number;
  newFindings: number;
}

export const SecurityTimeline: React.FC = () => {
  const events: TimelineEvent[] = [
    {
      id: 'tl-1',
      date: 'Today, Aug 23, 2026',
      scoreChange: +4,
      currentScore: 84,
      title: 'Security Posture Re-Assessed & Improved',
      description: 'Zero credential leaks found across dark web radar; DoH DNS confirmed operational.',
      resolvedFindings: 2,
      newFindings: 0
    },
    {
      id: 'tl-2',
      date: 'Aug 14, 2026',
      scoreChange: +8,
      currentScore: 80,
      title: 'Leaked Password Mitigated & 2FA Enforced',
      description: 'Rotated leaked netbanking credentials and enabled FIDO2 passkey authentication.',
      resolvedFindings: 1,
      newFindings: 0
    },
    {
      id: 'tl-3',
      date: 'Aug 02, 2026',
      scoreChange: -6,
      currentScore: 72,
      title: 'DMARC Softfail Configuration Drift Detected',
      description: 'Passive DNS inspection noted domain mail records altered to permissive policy.',
      resolvedFindings: 0,
      newFindings: 2
    },
    {
      id: 'tl-4',
      date: 'Jul 20, 2026',
      scoreChange: +12,
      currentScore: 78,
      title: 'Baseline RakhshaSutra Security Environment Established',
      description: 'Initial posture audit completed across 2 mobile devices and 3 organizational domains.',
      resolvedFindings: 3,
      newFindings: 1
    }
  ];

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#090e1a] border border-slate-800 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-base font-black font-mono text-white tracking-wide">
              POSTURE HISTORY & TIMELINE (BEFORE vs NOW)
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Audit trail of safety score progression, resolved vulnerabilities, and newly detected indicators
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold">
          <span>+12% 30-Day Score Improvement</span>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative border-l border-slate-800 pl-6 space-y-8 ml-3 font-mono text-xs">
        {events.map((evt) => (
          <div key={evt.id} className="relative space-y-2">
            {/* Timeline Dot */}
            <div className={`absolute -left-[31px] top-1 w-3 h-3 rounded-full border-2 border-[#090e1a] ${
              evt.scoreChange >= 0 ? 'bg-emerald-400' : 'bg-rose-400'
            }`} />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{evt.title}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  evt.scoreChange > 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                }`}>
                  {evt.scoreChange > 0 ? `+${evt.scoreChange} pts` : `${evt.scoreChange} pts`}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">{evt.date}</span>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {evt.description}
            </p>

            <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
              <span>Score Index: <strong className="text-cyan-400">{evt.currentScore}/100</strong></span>
              <span>•</span>
              <span className="text-emerald-400">{evt.resolvedFindings} Issues Resolved</span>
              {evt.newFindings > 0 && (
                <>
                  <span>•</span>
                  <span className="text-rose-400">{evt.newFindings} Issues Detected</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
