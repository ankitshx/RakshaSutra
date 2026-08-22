import React, { useState, useEffect } from 'react';
import {
  Globe,
  Zap,
  Target,
  Shield,
  Filter,
  Sparkles
} from 'lucide-react';

interface AttackNode {
  id: string;
  name: string;
  code: string;
  flag: string;
  lat: number;
  lng: number;
  sent: number;
  blocked: number;
  threat_level: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

interface AttackStrike {
  id: string;
  threat_name: string;
  type: 'Ransomware' | 'Phishing' | 'DDoS' | 'Zero-Day' | 'Infostealer' | 'AI Voice' | 'C2 Malware';
  origin: AttackNode;
  target: AttackNode & { sector: string };
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: string;
  vector: string;
  color: string;
  progress?: number;
  duration: number; // in seconds
  timestamp: string;
}

const GLOBAL_NODES: Record<string, AttackNode> = {
  RU: { id: 'RU', name: 'Russia', code: 'RU', flag: '🇷🇺', lat: 55.75, lng: 37.61, sent: 48920, blocked: 12040, threat_level: 'CRITICAL' },
  US_E: { id: 'US_E', name: 'USA (East Coast)', code: 'US', flag: '🇺🇸', lat: 40.71, lng: -74.00, sent: 15400, blocked: 89400, threat_level: 'HIGH' },
  US_W: { id: 'US_W', name: 'USA (Silicon Valley)', code: 'US', flag: '🇺🇸', lat: 37.77, lng: -122.41, sent: 12100, blocked: 94200, threat_level: 'HIGH' },
  IN: { id: 'IN', name: 'India (Cyber Defense)', code: 'IN', flag: '🇮🇳', lat: 20.59, lng: 78.96, sent: 8400, blocked: 114200, threat_level: 'HIGH' },
  VN: { id: 'VN', name: 'Vietnam', code: 'VN', flag: '🇻🇳', lat: 21.02, lng: 105.83, sent: 31200, blocked: 5400, threat_level: 'HIGH' },
  BR: { id: 'BR', name: 'Brazil', code: 'BR', flag: '🇧🇷', lat: -14.23, lng: -51.92, sent: 26800, blocked: 18200, threat_level: 'HIGH' },
  DE: { id: 'DE', name: 'Germany', code: 'DE', flag: '🇩🇪', lat: 51.16, lng: 10.45, sent: 9400, blocked: 62400, threat_level: 'MEDIUM' },
  IL: { id: 'IL', name: 'Israel', code: 'IL', flag: '🇮🇱', lat: 31.04, lng: 34.85, sent: 19800, blocked: 28400, threat_level: 'CRITICAL' },
  GB: { id: 'GB', name: 'United Kingdom', code: 'GB', flag: '🇬🇧', lat: 55.37, lng: -3.43, sent: 7600, blocked: 74200, threat_level: 'HIGH' },
  CN: { id: 'CN', name: 'China', code: 'CN', flag: '🇨🇳', lat: 35.86, lng: 104.19, sent: 62400, blocked: 24800, threat_level: 'CRITICAL' },
  JP: { id: 'JP', name: 'Japan', code: 'JP', flag: '🇯🇵', lat: 36.20, lng: 138.25, sent: 4300, blocked: 58900, threat_level: 'HIGH' },
  NG: { id: 'NG', name: 'Nigeria', code: 'NG', flag: '🇳🇬', lat: 9.08, lng: 8.67, sent: 28400, blocked: 4200, threat_level: 'HIGH' },
  SG: { id: 'SG', name: 'Singapore', code: 'SG', flag: '🇸🇬', lat: 1.35, lng: 103.81, sent: 6100, blocked: 49800, threat_level: 'MEDIUM' },
  AU: { id: 'AU', name: 'Australia', code: 'AU', flag: '🇦🇺', lat: -25.27, lng: 133.77, sent: 3200, blocked: 41200, threat_level: 'MEDIUM' },
  AE: { id: 'AE', name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', lat: 23.42, lng: 53.84, sent: 14200, blocked: 31200, threat_level: 'MEDIUM' },
  CA: { id: 'CA', name: 'Canada', code: 'CA', flag: '🇨🇦', lat: 56.13, lng: -106.34, sent: 5100, blocked: 39400, threat_level: 'MEDIUM' },
  ZA: { id: 'ZA', name: 'South Africa', code: 'ZA', flag: '🇿🇦', lat: -30.55, lng: 22.93, sent: 8900, blocked: 19800, threat_level: 'MEDIUM' },
  KR: { id: 'KR', name: 'South Korea', code: 'KR', flag: '🇰🇷', lat: 35.90, lng: 127.76, sent: 6800, blocked: 53400, threat_level: 'HIGH' },
  FR: { id: 'FR', name: 'France', code: 'FR', flag: '🇫🇷', lat: 46.22, lng: 2.21, sent: 8100, blocked: 46700, threat_level: 'MEDIUM' }
};

const INITIAL_STRIKES: AttackStrike[] = [
  {
    id: 'atk-1',
    threat_name: 'Lockbit 3.0 Ransomware Wave',
    type: 'Ransomware',
    origin: GLOBAL_NODES.RU,
    target: { ...GLOBAL_NODES.US_E, sector: 'Healthcare & Hospital Core' },
    severity: 'CRITICAL',
    status: 'BLOCKED BY DEFENSE',
    vector: 'RDP Port Scanning & SMBv3 Exploit',
    color: '#f43f5e',
    duration: 3.2,
    timestamp: '12:04:18'
  },
  {
    id: 'atk-2',
    threat_name: 'Fake UPI Banking Trojan APK',
    type: 'Phishing',
    origin: GLOBAL_NODES.VN,
    target: { ...GLOBAL_NODES.IN, sector: 'UPI Gateways & Netbanking' },
    severity: 'HIGH',
    status: 'INTERCEPTED',
    vector: 'WhatsApp Bot Smishing APK Distribution',
    color: '#06b6d4',
    duration: 2.8,
    timestamp: '12:04:19'
  },
  {
    id: 'atk-3',
    threat_name: 'Mirai IoT DDoS Blitz (3.8 Tbps)',
    type: 'DDoS',
    origin: GLOBAL_NODES.BR,
    target: { ...GLOBAL_NODES.DE, sector: 'Tier-1 Edge DNS Nodes' },
    severity: 'HIGH',
    status: 'MITIGATED',
    vector: 'SYN-Flood UDP Amplification',
    color: '#a855f7',
    duration: 3.6,
    timestamp: '12:04:20'
  },
  {
    id: 'atk-4',
    threat_name: 'WebKit Zero-Click Remote Code Execution',
    type: 'Zero-Day',
    origin: GLOBAL_NODES.IL,
    target: { ...GLOBAL_NODES.GB, sector: 'Diplomatic & Gov Terminals' },
    severity: 'CRITICAL',
    status: 'INVESTIGATING',
    vector: 'Zero-Click Font Parser Heap Overflow',
    color: '#eab308',
    duration: 2.6,
    timestamp: '12:04:21'
  },
  {
    id: 'atk-5',
    threat_name: 'Lumma Infostealer Payload Drop',
    type: 'Infostealer',
    origin: GLOBAL_NODES.CN,
    target: { ...GLOBAL_NODES.JP, sector: 'Semiconductor Fabrication' },
    severity: 'CRITICAL',
    status: 'BLOCKED BY DEFENSE',
    vector: 'Spear-Phishing PDF Macro Dropper',
    color: '#f43f5e',
    duration: 3.0,
    timestamp: '12:04:22'
  },
  {
    id: 'atk-6',
    threat_name: 'AI Voice Deepfake CEO Wire Transfer',
    type: 'AI Voice',
    origin: GLOBAL_NODES.NG,
    target: { ...GLOBAL_NODES.SG, sector: 'Corporate Treasury Escrow' },
    severity: 'HIGH',
    status: 'FLAGGED',
    vector: 'Cloned Real-time Audio Phone Call',
    color: '#3b82f6',
    duration: 3.4,
    timestamp: '12:04:23'
  },
  {
    id: 'atk-7',
    threat_name: 'Cobalt Strike C2 Beacon Activity',
    type: 'C2 Malware',
    origin: GLOBAL_NODES.RU,
    target: { ...GLOBAL_NODES.CA, sector: 'Energy Power Grid SCADA' },
    severity: 'CRITICAL',
    status: 'BLOCKED BY DEFENSE',
    vector: 'Supply Chain DLL Hijacking',
    color: '#f43f5e',
    duration: 3.1,
    timestamp: '12:04:24'
  },
  {
    id: 'atk-8',
    threat_name: 'Telegram SIM Swap Crypto Drainer',
    type: 'Phishing',
    origin: GLOBAL_NODES.AE,
    target: { ...GLOBAL_NODES.AU, sector: 'Web3 & Multi-Sig Vaults' },
    severity: 'HIGH',
    status: 'BLOCKED BY DEFENSE',
    vector: 'Carrier Impersonation OTP Theft',
    color: '#06b6d4',
    duration: 3.8,
    timestamp: '12:04:25'
  }
];

// Equirectangular / Miller-like projection (1000 x 500)
function project(lat: number, lng: number) {
  const x = ((lng + 180) / 360) * 1000;
  // Scaled latitude mapping to prevent extreme polar distortion
  const y = 250 - (lat / 90) * 220;
  return {
    x: Math.max(20, Math.min(980, x)),
    y: Math.max(30, Math.min(470, y))
  };
}

export const GlobalAttackMap: React.FC<{ onSelectStrike?: (strike: any) => void }> = ({ onSelectStrike }) => {
  const [strikes, setStrikes] = useState<AttackStrike[]>(INITIAL_STRIKES);
  const [selectedStrike, setSelectedStrike] = useState<AttackStrike>(INITIAL_STRIKES[0]);
  const [hoveredNode, setHoveredNode] = useState<AttackNode | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [liveRate, setLiveRate] = useState<number>(18540);
  const [totalIntercepted, setTotalIntercepted] = useState<number>(1498240);
  const [activeLeaderboard, setActiveLeaderboard] = useState<'origins' | 'targets'>('origins');
  const [shockwaves, setShockwaves] = useState<Array<{ id: string; x: number; y: number; color: string }>>([]);

  // Auto-launch simulated strikes periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const randomStrike = INITIAL_STRIKES[Math.floor(Math.random() * INITIAL_STRIKES.length)];
      const targetCoord = project(randomStrike.target.lat, randomStrike.target.lng);

      // Trigger shockwave at target
      const shockId = `sw-${Date.now()}`;
      setShockwaves((prev) => [...prev.slice(-4), { id: shockId, x: targetCoord.x, y: targetCoord.y, color: randomStrike.color }]);
      
      setLiveRate((r) => r + Math.floor(Math.random() * 9) - 4);
      setTotalIntercepted((t) => t + 1);

      // Auto update current focus strike
      setSelectedStrike(randomStrike);
    }, 2800 / speedMultiplier);

    return () => clearInterval(interval);
  }, [speedMultiplier]);

  const handleLaunchSimulatedAttack = () => {
    const keys = Object.keys(GLOBAL_NODES);
    const originKey = keys[Math.floor(Math.random() * keys.length)];
    let targetKey = keys[Math.floor(Math.random() * keys.length)];
    while (targetKey === originKey) {
      targetKey = keys[Math.floor(Math.random() * keys.length)];
    }

    const types = [
      { name: 'Ransomware Blast (Lockbit 3.0)', type: 'Ransomware' as const, color: '#f43f5e', vector: 'Zero-Day RDP Hijack' },
      { name: 'Volumetric Mirai DDoS (4.2 Tbps)', type: 'DDoS' as const, color: '#a855f7', vector: 'UDP Reflection Torrent' },
      { name: 'Credential Harvest Phishing APK', type: 'Phishing' as const, color: '#06b6d4', vector: 'WhatsApp Smishing Bot' },
      { name: 'WebKit Sandbox Escape Zero-Day', type: 'Zero-Day' as const, color: '#eab308', vector: 'Heap Overflow Exploit' }
    ];
    const pickedType = types[Math.floor(Math.random() * types.length)];

    const newStrike: AttackStrike = {
      id: `custom-${Date.now()}`,
      threat_name: pickedType.name,
      type: pickedType.type,
      origin: GLOBAL_NODES[originKey],
      target: { ...GLOBAL_NODES[targetKey], sector: 'Critical Infrastructure / Core Data Gateway' },
      severity: 'CRITICAL',
      status: 'INTERCEPTED & BLOCKED',
      vector: pickedType.vector,
      color: pickedType.color,
      duration: 2.2,
      timestamp: new Date().toLocaleTimeString()
    };

    setStrikes((prev) => [newStrike, ...prev.slice(0, 10)]);
    setSelectedStrike(newStrike);
    const targetCoord = project(newStrike.target.lat, newStrike.target.lng);
    setShockwaves((prev) => [...prev, { id: `sw-${Date.now()}`, x: targetCoord.x, y: targetCoord.y, color: newStrike.color }]);
    if (onSelectStrike) onSelectStrike(newStrike);
  };

  const filteredStrikes = selectedCategory === 'All'
    ? strikes
    : strikes.filter((s) => s.type.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div className="w-full rounded-3xl bg-slate-950 border-2 border-cyan-500/50 shadow-2xl overflow-hidden font-mono text-slate-100 select-none flex flex-col">
      {/* 1. Header Bar with Radar Ping & DEFCON Status */}
      <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-cyan-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-cyan-400 animate-pulse" /> Live Cyber Attack World Map
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/60 animate-pulse">
                DEFCON 2 • ACTIVE INTERCEPT
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Visualizing active cyber strikes, botnet streams & malware trajectories across the world
            </p>
          </div>
        </div>

        {/* Global Strike Velocity Counter */}
        <div className="flex items-center gap-4 text-xs">
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <div>
              <span className="text-[10px] text-slate-500 block">Strikes/min</span>
              <span className="text-cyan-400 font-bold text-xs">{liveRate.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 hidden sm:flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-500 block">Blocked Today</span>
              <span className="text-emerald-400 font-bold text-xs">{totalIntercepted.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Map Tool Controls */}
      <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Category Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
          <Filter className="w-3 h-3 text-slate-500 mr-1 shrink-0" />
          {['All', 'Ransomware', 'Phishing', 'DDoS', 'Zero-Day'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 shadow-neon-cyan'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Simulator Button & Speed Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px]">
            <span className="px-1.5 text-slate-500 font-bold">Speed:</span>
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeedMultiplier(spd)}
                className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                  speedMultiplier === spd ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={handleLaunchSimulatedAttack}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Strike</span>
          </button>
        </div>
      </div>

      {/* 3. Main SVG Interactive World Map */}
      <div className="relative w-full h-[320px] sm:h-[400px] md:h-[480px] bg-[#020617] overflow-hidden">
        {/* Latitude / Longitude Radar Grid Lines */}
        <svg
          viewBox="0 0 1000 500"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
        >
          <line x1="0" y1="125" x2="1000" y2="125" stroke="#06b6d4" strokeDasharray="4 8" strokeWidth="0.8" />
          <line x1="0" y1="250" x2="1000" y2="250" stroke="#06b6d4" strokeWidth="1.2" />
          <line x1="0" y1="375" x2="1000" y2="375" stroke="#06b6d4" strokeDasharray="4 8" strokeWidth="0.8" />
          <line x1="250" y1="0" x2="250" y2="500" stroke="#06b6d4" strokeDasharray="4 8" strokeWidth="0.8" />
          <line x1="500" y1="0" x2="500" y2="500" stroke="#06b6d4" strokeWidth="1.2" />
          <line x1="750" y1="0" x2="750" y2="500" stroke="#06b6d4" strokeDasharray="4 8" strokeWidth="0.8" />
        </svg>

        {/* Global Coordinates HUD */}
        <div className="absolute top-2.5 left-3 text-[10px] text-cyan-400/60 pointer-events-none font-mono">
          <span>// LAT: 28.61°N • LNG: 77.20°E | DEFENSE_NODE_ACTIVE</span>
        </div>
        <div className="absolute top-2.5 right-3 text-[10px] text-rose-400/60 pointer-events-none font-mono">
          <span>GLOBAL_WARFARE_TELEMETRY // STREAM_ON</span>
        </div>

        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Glowing Laser Filter */}
            <filter id="laserGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Glowing Node Filter */}
            <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* High-Definition Stylized Continent Landmasses */}
          <g className="fill-slate-900/90 stroke-cyan-500/30 stroke-[1.2]">
            {/* North America */}
            <path d="M 80 80 L 130 50 L 220 40 L 300 70 L 340 130 L 290 180 L 250 240 L 220 270 L 180 250 L 150 180 L 100 150 Z" />
            {/* Greenland */}
            <path d="M 330 30 L 400 20 L 430 60 L 370 90 L 330 70 Z" />
            {/* Central America Bridge */}
            <path d="M 220 270 L 250 300 L 260 310 L 240 315 L 210 280 Z" />
            {/* South America */}
            <path d="M 260 310 L 340 320 L 380 380 L 350 460 L 290 470 L 260 390 L 240 330 Z" />
            {/* Europe */}
            <path d="M 450 70 L 540 60 L 570 100 L 520 160 L 460 160 L 430 110 Z" />
            {/* United Kingdom & Ireland */}
            <path d="M 440 95 L 460 90 L 455 120 L 435 115 Z" />
            {/* Africa */}
            <path d="M 450 170 L 560 170 L 600 240 L 570 370 L 500 410 L 450 330 L 420 230 Z" />
            {/* Middle East */}
            <path d="M 570 150 L 630 150 L 650 200 L 600 220 L 570 180 Z" />
            {/* Asia & Russia */}
            <path d="M 550 50 L 870 40 L 910 120 L 840 190 L 780 260 L 680 270 L 630 200 L 560 120 Z" />
            {/* India Subcontinent */}
            <path d="M 660 190 L 740 190 L 720 285 L 670 285 L 645 225 Z" />
            {/* Southeast Asia */}
            <path d="M 750 230 L 800 230 L 790 290 L 740 280 Z" />
            {/* Japan Archipelago */}
            <path d="M 870 140 L 895 130 L 885 190 L 860 190 Z" />
            {/* Australia */}
            <path d="M 780 340 L 890 340 L 920 410 L 860 450 L 780 410 Z" />
            {/* New Zealand */}
            <path d="M 930 430 L 950 420 L 940 460 L 920 460 Z" />
          </g>

          {/* Interactive Laser Strike Arcs */}
          {filteredStrikes.map((strike, idx) => {
            const p1 = project(strike.origin.lat, strike.origin.lng);
            const p2 = project(strike.target.lat, strike.target.lng);
            const isSelected = selectedStrike.id === strike.id;

            // Parabolic Bézier Arc Coordinates
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const curvature = Math.min(100, Math.max(35, dist * 0.28));
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
                {/* 1. Underlying Glow Arc */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={strike.color}
                  strokeWidth={isSelected ? 3.5 : 1.6}
                  strokeOpacity={isSelected ? 0.9 : 0.45}
                  filter="url(#laserGlow)"
                />

                {/* 2. Animated Pulsing Laser Dash Beam */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={isSelected ? 2.8 : 1.8}
                  strokeDasharray="16 220"
                  strokeLinecap="round"
                  style={{
                    animation: `dashPulse ${strike.duration / speedMultiplier}s linear infinite`,
                    animationDelay: `${(idx * 0.4)}s`
                  }}
                />

                {/* 3. Origin Blast Ring */}
                <circle cx={p1.x} cy={p1.y} r={isSelected ? 6 : 4} fill={strike.color}>
                  <animate attributeName="r" values="3;9;3" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
                </circle>

                {/* 4. Target Intercept Shield Ring */}
                <circle cx={p2.x} cy={p2.y} r={isSelected ? 8 : 5} fill="#06b6d4">
                  <animate attributeName="r" values="4;12;4" dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.2;1" dur="1.6s" repeatCount="indefinite" />
                </circle>

                {/* Origin Label Flag */}
                <text
                  x={p1.x}
                  y={p1.y - 7}
                  textAnchor="middle"
                  className="fill-slate-200 font-mono text-[9px] font-bold pointer-events-none drop-shadow"
                >
                  {strike.origin.flag} {strike.origin.code}
                </text>

                {/* Target Label Flag */}
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

          {/* Dynamic Shockwaves at Impact Locations */}
          {shockwaves.map((sw) => (
            <g key={sw.id}>
              <circle cx={sw.x} cy={sw.y} r="18" fill="none" stroke={sw.color} strokeWidth="2" opacity="0.8">
                <animate attributeName="r" values="5;35" dur="1.2s" fill="freeze" />
                <animate attributeName="opacity" values="0.9;0" dur="1.2s" fill="freeze" />
              </circle>
            </g>
          ))}

          {/* Country Radar Geographic Nodes */}
          {Object.values(GLOBAL_NODES).map((node) => {
            const p = project(node.lat, node.lng);
            const isHovered = hoveredNode?.id === node.id;

            return (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 3}
                  fill={node.threat_level === 'CRITICAL' ? '#f43f5e' : '#06b6d4'}
                  filter="url(#nodeGlow)"
                />
              </g>
            );
          })}
        </svg>

        {/* Hovered Country Node Flyout Tooltip */}
        {hoveredNode && (
          <div
            className="absolute z-20 p-3 rounded-2xl bg-slate-950/95 border border-cyan-500/70 shadow-2xl backdrop-blur-xl pointer-events-none font-mono text-xs space-y-1 transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${project(hoveredNode.lat, hoveredNode.lng).x / 10}%`,
              top: `${project(hoveredNode.lat, hoveredNode.lng).y / 5}%`
            }}
          >
            <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
              <span className="text-base">{hoveredNode.flag}</span>
              <strong className="text-white">{hoveredNode.name}</strong>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40">
                {hoveredNode.threat_level}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[11px] pt-1 text-slate-400">
              <div>
                <span className="text-slate-500 text-[10px] block">Attacks Blocked:</span>
                <span className="text-emerald-400 font-bold">{hoveredNode.blocked.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Threat Sent:</span>
                <span className="text-rose-400 font-bold">{hoveredNode.sent.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Floating Active Strike HUD Box (Bottom Left of Map) */}
        {selectedStrike && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md p-3.5 rounded-2xl bg-slate-950/95 border border-cyan-500/60 shadow-2xl backdrop-blur-xl space-y-2 font-mono text-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                  ACTIVE INTERCEPTED STRIKE
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

      {/* 4. Leaderboard & Targeted Statistics Footer Tabs */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveLeaderboard('origins')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
              activeLeaderboard === 'origins' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'text-slate-400'
            }`}
          >
            🔥 Top Attack Origins
          </button>
          <button
            onClick={() => setActiveLeaderboard('targets')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
              activeLeaderboard === 'targets' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'text-slate-400'
            }`}
          >
            🛡️ Top Defended Targets
          </button>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400 overflow-x-auto">
          {activeLeaderboard === 'origins' ? (
            <div className="flex items-center gap-3">
              <span>1. 🇷🇺 Russia (32%)</span>
              <span>2. 🇨🇳 China (26%)</span>
              <span>3. 🇻🇳 Vietnam (18%)</span>
              <span>4. 🇧🇷 Brazil (14%)</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span>1. 🇮🇳 India (UPI / FinTech 38%)</span>
              <span>2. 🇺🇸 USA (Healthcare 28%)</span>
              <span>3. 🇩🇪 Germany (Cloud 18%)</span>
              <span>4. 🇬🇧 UK (Gov 16%)</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes dashPulse {
          0% {
            stroke-dashoffset: 240;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};
