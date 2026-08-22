import React, { useState, useEffect } from 'react';
import { Zap, Globe, Target } from 'lucide-react';

interface AttackTrajectory {
  id: string;
  threat_name: string;
  type: string;
  origin: { name: string; code: string; lat: number; lng: number; flag: string };
  target: { name: string; code: string; lat: number; lng: number; flag: string; sector: string };
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: string;
  vector: string;
  color: string;
}

const GLOBAL_NODES: Record<string, { lat: number; lng: number; name: string; flag: string }> = {
  RU: { lat: 55.75, lng: 37.61, name: 'Russia (Moscow)', flag: '🇷🇺' },
  US: { lat: 40.71, lng: -74.00, name: 'United States (NY / DC)', flag: '🇺🇸' },
  US_W: { lat: 37.77, lng: -122.41, name: 'United States (Silicon Valley)', flag: '🇺🇸' },
  IN: { lat: 19.07, lng: 72.87, name: 'India (Mumbai / Delhi)', flag: '🇮🇳' },
  VN: { lat: 21.02, lng: 105.83, name: 'Vietnam (Hanoi)', flag: '🇻🇳' },
  BR: { lat: -23.55, lng: -46.63, name: 'Brazil (São Paulo)', flag: '🇧🇷' },
  DE: { lat: 50.11, lng: 8.68, name: 'Germany (Frankfurt)', flag: '🇩🇪' },
  IL: { lat: 32.08, lng: 34.78, name: 'Israel (Tel Aviv)', flag: '🇮🇱' },
  GB: { lat: 51.50, lng: -0.12, name: 'United Kingdom (London)', flag: '🇬🇧' },
  CN: { lat: 39.90, lng: 116.40, name: 'China (Beijing / Shanghai)', flag: '🇨🇳' },
  JP: { lat: 35.67, lng: 139.65, name: 'Japan (Tokyo)', flag: '🇯🇵' },
  NG: { lat: 6.52, lng: 3.37, name: 'Nigeria (Lagos)', flag: '🇳🇬' },
  SG: { lat: 1.35, lng: 103.81, name: 'Singapore (Central)', flag: '🇸🇬' },
  AU: { lat: -33.86, lng: 151.20, name: 'Australia (Sydney)', flag: '🇦🇺' },
  ZA: { lat: -26.20, lng: 28.04, name: 'South Africa (Johannesburg)', flag: '🇿🇦' },
  CA: { lat: 45.42, lng: -75.69, name: 'Canada (Ottawa)', flag: '🇨🇦' },
  AE: { lat: 25.20, lng: 55.27, name: 'UAE (Dubai)', flag: '🇦🇪' },
  KR: { lat: 37.56, lng: 126.97, name: 'South Korea (Seoul)', flag: '🇰🇷' },
};

const BASE_STRIKES: AttackTrajectory[] = [
  {
    id: 'atk-1',
    threat_name: 'Lockbit 3.0 Ransomware Campaign',
    type: 'Ransomware',
    origin: { ...GLOBAL_NODES.RU, code: 'RU' },
    target: { ...GLOBAL_NODES.US, code: 'US', sector: 'Healthcare & Hospital Core' },
    severity: 'CRITICAL',
    status: 'BLOCKED BY DEFENSE',
    vector: 'RDP Port Scanning & SMBv3 Exploit',
    color: '#f43f5e'
  },
  {
    id: 'atk-2',
    threat_name: 'Fake Banking APK / Electricity Lure',
    type: 'Phishing APK',
    origin: { ...GLOBAL_NODES.VN, code: 'VN' },
    target: { ...GLOBAL_NODES.IN, code: 'IN', sector: 'UPI Gateways & Netbanking' },
    severity: 'HIGH',
    status: 'INTERCEPTED',
    vector: 'WhatsApp Bot Smishing APK Distribution',
    color: '#06b6d4'
  },
  {
    id: 'atk-3',
    threat_name: 'Mirai Botnet v5 DDoS (3.8 Tbps)',
    type: 'DDoS',
    origin: { ...GLOBAL_NODES.BR, code: 'BR' },
    target: { ...GLOBAL_NODES.DE, code: 'DE', sector: 'Tier-1 Edge DNS Nodes' },
    severity: 'HIGH',
    status: 'MITIGATED',
    vector: 'SYN-Flood UDP Amplification',
    color: '#a855f7'
  },
  {
    id: 'atk-4',
    threat_name: 'WebKit Memory Corruption Zero-Day',
    type: 'Zero-Day',
    origin: { ...GLOBAL_NODES.IL, code: 'IL' },
    target: { ...GLOBAL_NODES.GB, code: 'GB', sector: 'Government Diplomatic Terminal' },
    severity: 'CRITICAL',
    status: 'INVESTIGATING',
    vector: 'Zero-Click Font Parser Heap Overflow',
    color: '#eab308'
  },
  {
    id: 'atk-5',
    threat_name: 'Lumma Infostealer Payload Drop',
    type: 'Infostealer',
    origin: { ...GLOBAL_NODES.CN, code: 'CN' },
    target: { ...GLOBAL_NODES.JP, code: 'JP', sector: 'Semiconductor Fabrication' },
    severity: 'CRITICAL',
    status: 'BLOCKED BY DEFENSE',
    vector: 'Spear-Phishing PDF Macro Dropper',
    color: '#f43f5e'
  },
  {
    id: 'atk-6',
    threat_name: 'AI Voice Deepfake CEO Transfer',
    type: 'Social Eng.',
    origin: { ...GLOBAL_NODES.NG, code: 'NG' },
    target: { ...GLOBAL_NODES.SG, code: 'SG', sector: 'Corporate Escrow & Treasury' },
    severity: 'HIGH',
    status: 'FLAGGED',
    vector: 'Cloned Real-time Audio Phone Call',
    color: '#3b82f6'
  },
  {
    id: 'atk-7',
    threat_name: 'Cobalt Strike C2 Beacon Beaconing',
    type: 'C2 Malware',
    origin: { ...GLOBAL_NODES.RU, code: 'RU' },
    target: { ...GLOBAL_NODES.CA, code: 'CA', sector: 'Energy Power Grid SCADA' },
    severity: 'CRITICAL',
    status: 'BLOCKED BY DEFENSE',
    vector: 'Supply Chain DLL Hijacking',
    color: '#f43f5e'
  },
  {
    id: 'atk-8',
    threat_name: 'Telegram SIM Swap Crypto Drainer',
    type: 'Credential Theft',
    origin: { ...GLOBAL_NODES.AE, code: 'AE' },
    target: { ...GLOBAL_NODES.AU, code: 'AU', sector: 'Web3 & Multi-Sig Vaults' },
    severity: 'HIGH',
    status: 'BLOCKED BY DEFENSE',
    vector: 'Carrier Impersonation OTP Theft',
    color: '#06b6d4'
  }
];

// Project Lat/Lng to SVG ViewBox (1000 x 500)
function project(lat: number, lng: number) {
  const x = ((lng + 180) / 360) * 1000;
  // Mercator-like clamping
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = 250 - (mercN / Math.PI) * 230;
  return {
    x: Math.max(10, Math.min(990, x)),
    y: Math.max(20, Math.min(480, y))
  };
}

export const GlobalAttackMap: React.FC<{ onSelectStrike?: (strike: AttackTrajectory) => void }> = ({ onSelectStrike }) => {
  const [activeStrikes] = useState<AttackTrajectory[]>(BASE_STRIKES);
  const [selectedStrike, setSelectedStrike] = useState<AttackTrajectory>(BASE_STRIKES[0]);
  const [liveCounter, setLiveCounter] = useState(18520);

  useEffect(() => {
    // Cycle active strike focus every 3.5s
    const strikeTimer = setInterval(() => {
      setSelectedStrike((prev) => {
        const currentIndex = BASE_STRIKES.findIndex((s) => s.id === prev.id);
        const nextIndex = (currentIndex + 1) % BASE_STRIKES.length;
        return BASE_STRIKES[nextIndex];
      });
      setLiveCounter((c) => c + Math.floor(Math.random() * 9) - 3);
    }, 3500);

    return () => clearInterval(strikeTimer);
  }, []);

  return (
    <div className="relative w-full rounded-3xl bg-slate-950 border border-cyan-500/40 shadow-2xl overflow-hidden font-mono text-slate-100 select-none">
      {/* Map Top Telemetry Bar */}
      <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-cyan-400" /> Live Cyber Attack World Map
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-500/50">
                DEFCON 2
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Real-time cyber warfare, malware payloads & active attack trajectories
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Global Strikes/min:</span>
            <span className="text-cyan-400 font-bold text-[12px] flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> {liveCounter.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive SVG Map Canvas */}
      <div className="relative w-full h-[280px] sm:h-[340px] md:h-[400px] bg-[#030712] overflow-hidden">
        {/* Background Grid & Hex pattern */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #06b6d4 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Global Coordinate Crosshairs Overlay */}
        <div className="absolute top-2 left-3 text-[10px] text-cyan-500/40 pointer-events-none">
          SYS_GEO_INTERCEPT // LAT: 55.75°N • LNG: 37.61°E
        </div>
        <div className="absolute bottom-2 right-3 text-[10px] text-cyan-500/40 pointer-events-none">
          WARFARE_TELEMETRY // MULTI_VECTOR_ACTIVE
        </div>

        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Gradient for Laser Attack Beams */}
            <linearGradient id="laserGradientRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#fb7185" stopOpacity="1" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="laserGradientCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.7" />
            </linearGradient>

            {/* Glowing Laser Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Continents Outlines SVG */}
          <g className="fill-slate-800/40 stroke-cyan-500/20 stroke-[1]">
            {/* North America */}
            <path d="M 120 70 L 220 60 L 270 90 L 320 80 L 340 140 L 290 190 L 250 250 L 230 280 L 190 270 L 150 200 L 120 150 Z" />
            {/* Greenland */}
            <path d="M 330 40 L 410 30 L 430 70 L 370 100 L 340 80 Z" />
            {/* South America */}
            <path d="M 270 290 L 350 310 L 380 370 L 350 460 L 300 470 L 270 380 L 250 320 Z" />
            {/* Europe */}
            <path d="M 450 90 L 550 80 L 580 120 L 530 170 L 460 170 L 440 120 Z" />
            {/* Africa */}
            <path d="M 460 180 L 560 180 L 600 240 L 570 360 L 510 400 L 460 330 L 430 230 Z" />
            {/* Asia & Russia */}
            <path d="M 560 70 L 850 60 L 890 130 L 820 200 L 760 270 L 680 280 L 620 220 L 570 140 Z" />
            {/* India Subcontinent */}
            <path d="M 660 210 L 730 210 L 710 290 L 670 290 L 650 240 Z" />
            {/* Australia */}
            <path d="M 780 340 L 880 340 L 910 410 L 850 440 L 780 400 Z" />
            {/* Japan */}
            <path d="M 860 160 L 890 150 L 880 200 L 850 200 Z" />
            {/* United Kingdom */}
            <path d="M 440 100 L 465 95 L 460 125 L 435 120 Z" />
          </g>

          {/* Active Attack Trajectory Arcs */}
          {activeStrikes.map((strike, idx) => {
            const p1 = project(strike.origin.lat, strike.origin.lng);
            const p2 = project(strike.target.lat, strike.target.lng);
            const isSelected = selectedStrike.id === strike.id;

            // Curved Quadratic Bézier midpoint arc
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            // Arc curve curvature height
            const curvature = Math.min(80, Math.max(30, dist * 0.25));
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2 - curvature;

            const pathD = `M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`;

            return (
              <g
                key={strike.id}
                onClick={() => {
                  setSelectedStrike(strike);
                  if (onSelectStrike) onSelectStrike(strike);
                }}
                className="cursor-pointer group"
              >
                {/* Background shadow beam */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={strike.color}
                  strokeWidth={isSelected ? 3.5 : 1.5}
                  strokeOpacity={isSelected ? 0.9 : 0.4}
                  filter="url(#glow)"
                />

                {/* Animated Dash Laser Beam Trajectory */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={isSelected ? 3 : 1.8}
                  strokeDasharray="12 180"
                  strokeLinecap="round"
                  className="animate-laser-flow"
                  style={{
                    animation: `laserFlow ${2.5 + (idx % 3) * 0.5}s linear infinite`
                  }}
                />

                {/* Origin Radar Ping */}
                <circle cx={p1.x} cy={p1.y} r={isSelected ? 6 : 4} fill={strike.color}>
                  <animate
                    attributeName="r"
                    values="3;8;3"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.9;0.3;0.9"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Target Radar Defense Ping */}
                <circle cx={p2.x} cy={p2.y} r={isSelected ? 7 : 5} fill="#06b6d4">
                  <animate
                    attributeName="r"
                    values="4;11;4"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="1;0.2;1"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Origin Country Label */}
                <text
                  x={p1.x}
                  y={p1.y - 8}
                  textAnchor="middle"
                  className="fill-slate-300 font-mono text-[9px] font-bold pointer-events-none drop-shadow"
                >
                  {strike.origin.flag} {strike.origin.code}
                </text>

                {/* Target Country Label */}
                <text
                  x={p2.x}
                  y={p2.y + 14}
                  textAnchor="middle"
                  className="fill-cyan-300 font-mono text-[9px] font-bold pointer-events-none drop-shadow"
                >
                  {strike.target.flag} {strike.target.code}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Active Strike HUD Box (Bottom Left of Map) */}
        {selectedStrike && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md p-3.5 rounded-2xl bg-slate-950/95 border border-cyan-500/60 shadow-2xl backdrop-blur-xl space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                  INTERCEPTED STRIKE
                </span>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                selectedStrike.severity === 'CRITICAL'
                  ? 'bg-rose-950 text-rose-300 border border-rose-600'
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-600'
              }`}>
                {selectedStrike.type}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold pt-0.5">
              <div className="flex items-center gap-1">
                <span>{selectedStrike.origin.flag}</span>
                <span className="text-slate-300">{selectedStrike.origin.name}</span>
              </div>
              <span className="text-cyan-400 font-black">➔</span>
              <div className="flex items-center gap-1">
                <span>{selectedStrike.target.flag}</span>
                <span className="text-white">{selectedStrike.target.name}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 font-sans">
              <strong className="text-white font-mono">{selectedStrike.threat_name}</strong>: Target Sector — <span className="text-cyan-300 font-semibold">{selectedStrike.target.sector}</span>
            </p>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
              <span className="truncate max-w-[220px]">⚡ Vector: {selectedStrike.vector}</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                ✓ {selectedStrike.status}
              </span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes laserFlow {
          0% {
            stroke-dashoffset: 200;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};
