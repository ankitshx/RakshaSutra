import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Globe,
  Smartphone,
  Network,
  Eye,
  KeyRound,
  ArrowUpRight
} from 'lucide-react';

export interface RadarDimension {
  id: string;
  name: string;
  score: number; // 0-100
  status: 'OPTIMAL' | 'FAIR' | 'AT_RISK';
  icon: React.ElementType;
  reason: string;
  recommendation: string;
  evidence: string;
  delta: number; // e.g. +4 or -2
}

interface SecurityRadarProps {
  dimensions?: RadarDimension[];
  overallScore?: number;
  onSelectDimension?: (dimensionId: string) => void;
}

export const SecurityRadar: React.FC<SecurityRadarProps> = ({
  dimensions: customDimensions,
  overallScore = 84,
  onSelectDimension
}) => {
  const defaultDimensions: RadarDimension[] = [
    {
      id: 'accounts',
      name: 'Accounts & MFA',
      score: 92,
      status: 'OPTIMAL',
      icon: KeyRound,
      reason: 'Biometric MFA & FIDO2 passkeys verified across core credentials.',
      recommendation: 'Ensure emergency backup recovery keys are stored offline in safe vault.',
      evidence: 'Zero credential reuse detected across monitored accounts.',
      delta: +2
    },
    {
      id: 'devices',
      name: 'Devices & Endpoints',
      score: 85,
      status: 'OPTIMAL',
      icon: Smartphone,
      reason: 'Disk encryption enabled, OS patch level current within 14 days.',
      recommendation: 'Review USB debugging & developer options on mobile device.',
      evidence: 'Host integrity verified with zero malicious side-loaded packages.',
      delta: 0
    },
    {
      id: 'websites',
      name: 'Websites & TLS',
      score: 78,
      status: 'FAIR',
      icon: Globe,
      reason: 'Monitored domain certificates valid; 1 domain lacks strict HSTS preload.',
      recommendation: 'Enable HSTS max-age=31536000 with includeSubDomains header.',
      evidence: 'TLS 1.3 negotiated with A+ grade on primary host.',
      delta: -4
    },
    {
      id: 'email',
      name: 'Email & Spoofing',
      score: 90,
      status: 'OPTIMAL',
      icon: Mail,
      reason: 'SPF, DKIM, and DMARC enforcement active on registered email domain.',
      recommendation: 'Maintain strict reject policy (p=reject) on root domain DMARC record.',
      evidence: 'DMARC policy verified active via Certificate Transparency & DNS.',
      delta: +5
    },
    {
      id: 'privacy',
      name: 'Privacy & Anonymity',
      score: 88,
      status: 'OPTIMAL',
      icon: Lock,
      reason: 'k-Anonymity zero-knowledge hashing active; no public PII leaks.',
      recommendation: 'Periodically rotate secondary aliases used for newsletter signups.',
      evidence: 'SHA-1 range prefix verified against 900M+ leak database.',
      delta: +3
    },
    {
      id: 'network',
      name: 'Network & DNS',
      score: 75,
      status: 'FAIR',
      icon: Network,
      reason: 'Encrypted DNS (DoH) active; 2 open ports detected on secondary IP.',
      recommendation: 'Close unneeded inbound administrative ports (e.g. port 8080).',
      evidence: 'Reverse DNS and ASN mapped cleanly to cloud provider.',
      delta: -2
    },
    {
      id: 'exposure',
      name: 'Dark Web Exposure',
      score: 80,
      status: 'OPTIMAL',
      icon: Eye,
      reason: 'No credentials found in recent high-severity credential pastebins.',
      recommendation: 'Keep automated breach alerting active on primary work emails.',
      evidence: 'Last monitored sync completed 42 mins ago with 0 active flags.',
      delta: +1
    }
  ];

  const dimensions = customDimensions || defaultDimensions;
  const [selectedDim, setSelectedDim] = useState<RadarDimension>(dimensions[0]);

  const numSides = dimensions.length;
  const size = 320;
  const center = size / 2;
  const radius = center - 45;

  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 / numSides) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Polygon points for user score
  const polygonPoints = dimensions
    .map((dim, idx) => {
      const { x, y } = getCoordinates(idx, dim.score);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Top The Sutra ambient hairline */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 relative">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-sutra-glow">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h3 className="text-base font-black font-mono text-white tracking-wide">
              SECURITY POSTURE RADAR
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            7-Vector deterministic posture index synthesized from live telemetry & verified assets
          </p>
        </div>

        {/* Overall Posture Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Composite Rating</span>
            <div className="text-2xl font-black font-mono text-white flex items-baseline gap-1">
              <span>{overallScore}</span>
              <span className="text-xs text-slate-400">/100</span>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-jade-glow">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>STABLE POSTURE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left / Center: Interactive SVG Radar */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
          <svg width={size} height={size} className="overflow-visible select-none">
            {/* Concentric rings */}
            {[0.25, 0.5, 0.75, 1.0].map((level, lIdx) => {
              const r = level * radius;
              return (
                <circle
                  key={lIdx}
                  cx={center}
                  cy={center}
                  r={r}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeDasharray="3 3"
                />
              );
            })}

            {/* Axis spokes */}
            {dimensions.map((_, idx) => {
              const { x, y } = getCoordinates(idx, 100);
              return (
                <line
                  key={`spoke-${idx}`}
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.06)"
                />
              );
            })}

            {/* Data Polygon */}
            <polygon
              points={polygonPoints}
              fill="rgba(245, 158, 11, 0.16)"
              stroke="#f59e0b"
              strokeWidth="2"
              className="transition-all duration-500"
              style={{ filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.3))' }}
            />

            {/* Interactive Node Anchors */}
            {dimensions.map((dim, idx) => {
              const { x, y } = getCoordinates(idx, dim.score);
              const isSelected = selectedDim.id === dim.id;
              const labelPos = getCoordinates(idx, 122);

              return (
                <g
                  key={dim.id}
                  onClick={() => {
                    setSelectedDim(dim);
                    onSelectDimension?.(dim.id);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Point circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 6 : 4}
                    fill={isSelected ? '#fbbf24' : '#f59e0b'}
                    stroke="#030508"
                    strokeWidth="2"
                    className="transition-all duration-200 group-hover:r-6"
                  />

                  {/* Dimension Text Label outside */}
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isSelected ? '#fbbf24' : '#94a3b8'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    className="group-hover:fill-amber-300 transition-colors"
                  >
                    {dim.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right: Selected Dimension Focus Card */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-2xl bg-[#070b12] border border-white/10 space-y-4 relative">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[#141d2e] border border-white/10 text-amber-400 shadow-sutra-glow">
                  <selectedDim.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-mono text-white">
                    {selectedDim.name}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    Vector Status: <span className="text-emerald-400 font-bold">{selectedDim.status}</span>
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black font-mono text-white flex items-baseline gap-1">
                  <span>{selectedDim.score}</span>
                  <span className="text-xs text-slate-400">/100</span>
                </div>
                <span className={`text-[10px] font-mono font-bold ${
                  selectedDim.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {selectedDim.delta >= 0 ? `+${selectedDim.delta}pts` : `${selectedDim.delta}pts`}
                </span>
              </div>
            </div>

            {/* Assessment Narrative */}
            <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">
                  Assessed Finding:
                </span>
                <p className="text-slate-200 font-sans leading-relaxed">
                  {selectedDim.reason}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">
                  Telemetry Evidence:
                </span>
                <p className="text-slate-300 font-mono text-[11px] bg-[#030508] p-2.5 rounded-xl border border-white/5">
                  {selectedDim.evidence}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#141d2e] border border-white/10 space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block">
                  Recommended Hardening Action:
                </span>
                <p className="text-slate-200 font-sans text-xs">
                  {selectedDim.recommendation}
                </p>
              </div>
            </div>

            {/* Action Trigger */}
            <button
              onClick={() => onSelectDimension?.(selectedDim.id)}
              className="w-full py-2.5 rounded-xl bg-[#141d2e] hover:bg-[#1b273d] border border-amber-500/30 hover:border-amber-500/60 text-amber-300 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sutra-glow"
            >
              <span>Launch {selectedDim.name} Inspector</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Select Dimension Pill Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 font-mono text-[10px]">
            {dimensions.map((dim) => {
              const isSelected = selectedDim.id === dim.id;
              return (
                <button
                  key={dim.id}
                  onClick={() => {
                    setSelectedDim(dim);
                    onSelectDimension?.(dim.id);
                  }}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-950/80 border-amber-500/50 text-amber-300 font-bold shadow-sutra-glow'
                      : 'bg-[#070b12] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block truncate">{dim.name.split(' ')[0]}</span>
                  <span className="font-black text-white">{dim.score}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
