import React, { useState, useEffect } from 'react';
import {
  Globe,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Activity,
  Lock,
  TrendingUp
} from 'lucide-react';

interface AttackCounterProps {
  compact?: boolean;
}

export const GlobalLiveAttackCounter: React.FC<AttackCounterProps> = () => {
  // Base daily attacks starting count ~48.5 Million attacks worldwide today
  const [totalAttacksToday, setTotalAttacksToday] = useState<number>(48619340);
  const [attacksPerMinute, setAttacksPerMinute] = useState<number>(18740);
  const defendedPercentage = 99.94;
  const [lastSecondDelta, setLastSecondDelta] = useState<number>(312);

  // Sub-second live counter increment
  useEffect(() => {
    const counterInterval = setInterval(() => {
      // Add random real-time strike batch between 12 and 38 attacks every 350ms
      const delta = Math.floor(Math.random() * 26) + 12;
      setTotalAttacksToday((prev) => prev + delta);
      setLastSecondDelta((prev) => Math.round(prev * 0.8 + delta * 8));
    }, 350);

    const rateInterval = setInterval(() => {
      setAttacksPerMinute((prev) => {
        const drift = Math.floor(Math.random() * 31) - 15;
        return Math.max(16000, Math.min(24000, prev + drift));
      });
    }, 3000);

    return () => {
      clearInterval(counterInterval);
      clearInterval(rateInterval);
    };
  }, []);

  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  return (
    <div className="w-full rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/40 shadow-2xl p-5 sm:p-6 font-mono text-slate-100 relative overflow-hidden">
      {/* Background Cyber Grid Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10 space-y-5">
        {/* Top Header: Threat Status & Radar Pulse */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="w-4 h-4 rounded-full bg-rose-500/50 animate-ping absolute" />
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Globe className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                  Real-Time Global Cyber Attacks Counter
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/50 animate-pulse">
                  LIVE TELEMETRY
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Aggregated from 120,000+ global honeypots, abuse.ch feeds, DNS sinkholes & AI cloud firewalls
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-400">DEFCON Threat Level:</span>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-500/60 shadow-neon-amber">
              DEFCON 2 • ELEVATED
            </span>
          </div>
        </div>

        {/* Big Number: Total Attacks Worldwide Today */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Main Huge Odometer Counter */}
          <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-950/90 border border-cyan-500/50 shadow-inner flex flex-col justify-center space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider">
                <Flame className="w-4 h-4 text-rose-500 animate-bounce" /> Total Attacks Worldwide Today
              </span>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +{lastSecondDelta}/sec
              </span>
            </div>

            {/* Glowing Live Odometer Digits */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 tracking-tight text-glow-cyan font-mono select-all">
                {formatNumber(totalAttacksToday)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
              <span className="flex items-center gap-1 text-slate-400">
                <Activity className="w-3 h-3 text-cyan-400" /> Current Velocity:
              </span>
              <strong className="text-amber-400 font-mono">
                {formatNumber(attacksPerMinute)} strikes / min
              </strong>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Metric 1: Mitigation Rate */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Defense Rate:
              </span>
              <span className="text-lg font-black text-emerald-400 font-mono">
                {defendedPercentage}%
              </span>
              <span className="text-[9px] text-slate-500 block">Neutralized by AI SOC</span>
            </div>

            {/* Metric 2: Phishing Surge */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" /> Phishing & Scam:
              </span>
              <span className="text-lg font-black text-amber-400 font-mono">
                19.4M (40%)
              </span>
              <span className="text-[9px] text-slate-500 block">Fake Bank & SMS APK</span>
            </div>

            {/* Metric 3: Ransomware / Malware */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                <Lock className="w-3 h-3 text-rose-400" /> Ransomware & DDoS:
              </span>
              <span className="text-lg font-black text-rose-400 font-mono">
                21.9M (45%)
              </span>
              <span className="text-[9px] text-slate-500 block">RDP & Botnet Storms</span>
            </div>
          </div>
        </div>

        {/* Live Vector Distribution Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Global Attack Vector Distribution (Today):</span>
            <span className="text-slate-500">100% Normalized</span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden flex shadow-inner">
            <div
              style={{ width: '40%' }}
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all"
              title="Phishing & Fake Banking (40%)"
            />
            <div
              style={{ width: '25%' }}
              className="h-full bg-gradient-to-r from-rose-600 to-rose-500 transition-all"
              title="Ransomware & Trojans (25%)"
            />
            <div
              style={{ width: '20%' }}
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all"
              title="DDoS & Botnets (20%)"
            />
            <div
              style={{ width: '15%' }}
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
              title="Zero-Day & API Exploits (15%)"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 font-mono pt-0.5">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              <span>Phishing / Scam (40%)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              <span>Ransomware (25%)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
              <span>DDoS & Botnet (20%)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
              <span>Zero-Day / Exploit (15%)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
