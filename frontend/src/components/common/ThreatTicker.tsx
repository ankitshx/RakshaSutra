import React from 'react';
import { Radio } from 'lucide-react';

export const ThreatTicker: React.FC = () => {
  const alerts = [
    { type: 'threat', label: 'BLOCKED', text: 'http://login-sbi-pan-update.xyz (Phishing / Brand Impersonation)', time: '2m ago' },
    { type: 'warning', label: 'SUSPICIOUS', text: 'SMS Urgency Coercion (+91 98765 43210 Electricity Lure)', time: '5m ago' },
    { type: 'clean', label: 'VERIFIED', text: 'github.com (TLS 1.3 / Strict CSP Enforced - Grade A+)', time: '12m ago' },
    { type: 'threat', label: 'BLOCKED', text: 'http://paypa1-security-auth.top (IDN Homoglyph Spoofing)', time: '18m ago' },
    { type: 'system', label: 'TELEMETRY', text: 'All 3 Threat Intelligence Providers Active (URLhaus, VirusTotal, AbuseIPDB)', time: 'Live' }
  ];

  return (
    <div className="w-full bg-slate-950/90 border-b border-cyan-500/20 py-1.5 px-4 sm:px-6 lg:px-8 overflow-hidden text-[11px] font-mono select-none">
      <div className="max-w-[1780px] mx-auto flex items-center gap-3">
        {/* Live Indicator Pill */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 font-bold shrink-0 shadow-neon-cyan">
          <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span className="tracking-wider uppercase">THREAT TICKER</span>
        </div>

        {/* Marquee Container */}
        <div className="flex-1 overflow-x-hidden relative flex items-center">
          <div className="flex items-center gap-8 whitespace-nowrap animate-ticker">
            {alerts.concat(alerts).map((alert, idx) => (
              <div key={idx} className="inline-flex items-center gap-2 text-slate-300">
                <span
                  className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                    alert.type === 'threat'
                      ? 'bg-rose-950 text-rose-300 border border-rose-600/40'
                      : alert.type === 'warning'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      : alert.type === 'clean'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                  }`}
                >
                  {alert.label}
                </span>
                <span className="text-slate-300">{alert.text}</span>
                <span className="text-slate-500">[{alert.time}]</span>
                <span className="text-slate-700">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
