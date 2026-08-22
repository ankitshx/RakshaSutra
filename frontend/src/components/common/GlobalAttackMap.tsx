import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Zap,
  Target,
  Shield,
  Filter,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Terminal,
  Radio,
  Flame
} from 'lucide-react';

interface GeoAttackNode {
  id: string;
  name: string;
  country: string;
  code: string;
  flag: string;
  lat: number;
  lng: number;
  sent: number;
  blocked: number;
  threat_level: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

interface GeoAttackStrike {
  id: string;
  threat_name: string;
  type: 'Ransomware' | 'Phishing' | 'DDoS' | 'Zero-Day' | 'Infostealer' | 'AI Voice' | 'C2 Malware';
  origin: GeoAttackNode;
  target: GeoAttackNode & { sector: string };
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: string;
  vector: string;
  color: string;
  timestamp: string;
  port?: number;
}

const REAL_GEO_NODES: Record<string, GeoAttackNode> = {
  US: { id: 'US', name: 'United States', country: 'United States', code: 'US', flag: '🇺🇸', lat: 38.0, lng: -97.0, sent: 18200, blocked: 168400, threat_level: 'HIGH' },
  PT: { id: 'PT', name: 'Portugal', country: 'Portugal', code: 'PT', flag: '🇵🇹', lat: 39.5, lng: -8.0, sent: 4200, blocked: 38400, threat_level: 'MEDIUM' },
  TR: { id: 'TR', name: 'Türkiye', country: 'Türkiye', code: 'TR', flag: '🇹🇷', lat: 39.0, lng: 35.0, sent: 14200, blocked: 58200, threat_level: 'HIGH' },
  IL: { id: 'IL', name: 'Israel', country: 'Israel', code: 'IL', flag: '🇮🇱', lat: 31.5, lng: 35.0, sent: 31400, blocked: 44100, threat_level: 'CRITICAL' },
  RU: { id: 'RU', name: 'Russia', country: 'Russia', code: 'RU', flag: '🇷🇺', lat: 55.75, lng: 37.6, sent: 88900, blocked: 18200, threat_level: 'CRITICAL' },
  IN: { id: 'IN', name: 'India', country: 'India', code: 'IN', flag: '🇮🇳', lat: 21.0, lng: 78.0, sent: 9100, blocked: 182000, threat_level: 'HIGH' },
  CN: { id: 'CN', name: 'China', country: 'China', code: 'CN', flag: '🇨🇳', lat: 35.0, lng: 104.0, sent: 98400, blocked: 41400, threat_level: 'CRITICAL' },
  DE: { id: 'DE', name: 'Germany', country: 'Germany', code: 'DE', flag: '🇩🇪', lat: 51.0, lng: 10.0, sent: 13200, blocked: 98400, threat_level: 'MEDIUM' },
  GB: { id: 'GB', name: 'United Kingdom', country: 'United Kingdom', code: 'GB', flag: '🇬🇧', lat: 54.0, lng: -2.0, sent: 11400, blocked: 119200, threat_level: 'HIGH' },
  JP: { id: 'JP', name: 'Japan', country: 'Japan', code: 'JP', flag: '🇯🇵', lat: 36.0, lng: 138.0, sent: 7100, blocked: 94400, threat_level: 'HIGH' },
  BR: { id: 'BR', name: 'Brazil', country: 'Brazil', code: 'BR', flag: '🇧🇷', lat: -14.0, lng: -51.0, sent: 39800, blocked: 24400, threat_level: 'HIGH' },
  NG: { id: 'NG', name: 'Nigeria', country: 'Nigeria', code: 'NG', flag: '🇳🇬', lat: 9.0, lng: 8.0, sent: 42200, blocked: 6800, threat_level: 'HIGH' },
  SG: { id: 'SG', name: 'Singapore', country: 'Singapore', code: 'SG', flag: '🇸🇬', lat: 1.35, lng: 103.8, sent: 9200, blocked: 88400, threat_level: 'MEDIUM' },
  AU: { id: 'AU', name: 'Australia', country: 'Australia', code: 'AU', flag: '🇦🇺', lat: -25.0, lng: 134.0, sent: 6100, blocked: 64200, threat_level: 'MEDIUM' },
  AE: { id: 'AE', name: 'UAE', country: 'UAE', code: 'AE', flag: '🇦🇪', lat: 24.0, lng: 54.0, sent: 23800, blocked: 54200, threat_level: 'MEDIUM' },
  VN: { id: 'VN', name: 'Vietnam', country: 'Vietnam', code: 'VN', flag: '🇻🇳', lat: 21.0, lng: 105.8, sent: 48200, blocked: 8100, threat_level: 'HIGH' }
};

const BASE_GEO_STRIKES: GeoAttackStrike[] = [
  {
    id: 'atk-sim-1',
    threat_name: 'Transatlantic RDP Exploit Trajectory',
    type: 'Ransomware',
    origin: REAL_GEO_NODES.US,
    target: { ...REAL_GEO_NODES.TR, sector: 'Regional Transit & Energy Node' },
    severity: 'CRITICAL',
    status: 'BLOCKED BY DEFENSE',
    vector: 'RDP Port 3389 Penetration',
    color: '#f59e0b',
    timestamp: 'Just now',
    port: 3389
  },
  {
    id: 'atk-sim-2',
    threat_name: 'Mediterranean Banking Core Gateway Probe',
    type: 'Phishing',
    origin: REAL_GEO_NODES.PT,
    target: { ...REAL_GEO_NODES.IL, sector: 'FinTech Multi-Sig Cloud' },
    severity: 'HIGH',
    status: 'INTERCEPTED',
    vector: 'Malicious Gateway Credential Harvesting',
    color: '#f59e0b',
    timestamp: '1s ago',
    port: 443
  },
  {
    id: 'atk-sim-3',
    threat_name: 'Caspian Critical SCADA Substation Flood',
    type: 'DDoS',
    origin: REAL_GEO_NODES.RU,
    target: { ...REAL_GEO_NODES.TR, sector: 'Eurasian Pipeline Telemetry' },
    severity: 'CRITICAL',
    status: 'MITIGATED',
    vector: 'SYN-Flood Modbus TCP Exploit',
    color: '#f59e0b',
    timestamp: '2s ago',
    port: 502
  },
  {
    id: 'atk-sim-4',
    threat_name: 'Fake UPI Banking Trojan APK Surge',
    type: 'Phishing',
    origin: REAL_GEO_NODES.VN,
    target: { ...REAL_GEO_NODES.IN, sector: 'UPI Gateways & Netbanking OTPs' },
    severity: 'HIGH',
    status: 'BLOCKED BY DEFENSE',
    vector: 'WhatsApp Electricity Smishing APK',
    color: '#f59e0b',
    timestamp: '3s ago',
    port: 443
  },
  {
    id: 'atk-sim-5',
    threat_name: 'Volt Typhoon Critical Infrastructure Probe',
    type: 'Zero-Day',
    origin: REAL_GEO_NODES.CN,
    target: { ...REAL_GEO_NODES.US, sector: 'Federal Energy & Water Grid' },
    severity: 'CRITICAL',
    status: 'BLOCKED BY DEFENSE',
    vector: 'Living-off-the-Land WMI Injection',
    color: '#f59e0b',
    timestamp: '4s ago',
    port: 5985
  },
  {
    id: 'atk-sim-6',
    threat_name: 'Mirai IoT DDoS Blitz (4.2 Tbps)',
    type: 'DDoS',
    origin: REAL_GEO_NODES.BR,
    target: { ...REAL_GEO_NODES.DE, sector: 'Tier-1 Edge DNS Backbone' },
    severity: 'HIGH',
    status: 'MITIGATED',
    vector: 'UDP Reflection Torrent',
    color: '#f59e0b',
    timestamp: '5s ago',
    port: 53
  },
  {
    id: 'atk-sim-7',
    threat_name: 'Lumma Infostealer Payload Drop',
    type: 'Infostealer',
    origin: REAL_GEO_NODES.CN,
    target: { ...REAL_GEO_NODES.JP, sector: 'Semiconductor Fabrication Labs' },
    severity: 'CRITICAL',
    status: 'BLOCKED BY DEFENSE',
    vector: 'Spear-Phishing Macro Dropper',
    color: '#f59e0b',
    timestamp: '6s ago',
    port: 8080
  },
  {
    id: 'atk-sim-8',
    threat_name: 'AI Voice Deepfake CEO Wire Fraud',
    type: 'AI Voice',
    origin: REAL_GEO_NODES.NG,
    target: { ...REAL_GEO_NODES.SG, sector: 'Corporate Escrow & Treasury' },
    severity: 'HIGH',
    status: 'FLAGGED',
    vector: 'Cloned Real-time Audio Phone Call',
    color: '#f59e0b',
    timestamp: '7s ago',
    port: 5060
  }
];

// Project Lat/Lng to SVG Canvas (1000 x 550)
function project(lat: number, lng: number) {
  const x = ((lng + 180) / 360) * 1000;
  const y = 275 - (lat / 90) * 230;
  return {
    x: Math.max(20, Math.min(980, x)),
    y: Math.max(30, Math.min(520, y))
  };
}

export const GlobalAttackMap: React.FC<{ onSelectStrike?: (strike: any) => void }> = ({ onSelectStrike }) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const [activeStrikesPool, setActiveStrikesPool] = useState<GeoAttackStrike[]>(BASE_GEO_STRIKES.slice(0, 6));
  const [selectedStrike, setSelectedStrike] = useState<GeoAttackStrike>(BASE_GEO_STRIKES[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [liveRate, setLiveRate] = useState<number>(18740);
  const [totalIntercepted, setTotalIntercepted] = useState<number>(1498920);
  const [activeLeaderboard, setActiveLeaderboard] = useState<'origins' | 'targets'>('origins');
  const [hoveredNode, setHoveredNode] = useState<GeoAttackNode | null>(null);

  const [terminalLogs, setTerminalLogs] = useState<Array<{ id: string; text: string; type: string; time: string }>>([
    { id: '1', text: 'INTERCEPT: Lockbit 3.0 (US ➔ TR) blocked on Port 3389 RDP', type: 'amber', time: '13:01:10' },
    { id: '2', text: 'DEFENSE: Banking Gateway Probe (PT ➔ IL) intercepted', type: 'amber', time: '13:01:12' },
    { id: '3', text: 'MITIGATE: Caspian SCADA Flood (RU ➔ TR) rate-limited', type: 'amber', time: '13:01:14' },
    { id: '4', text: 'DEFENSE: Fake UPI APK (VN ➔ IN) blocked at switch', type: 'cyan', time: '13:01:16' }
  ]);

  const playCyberSound = (type: 'laser' | 'shield' | 'salvo') => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'laser') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(850, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
      } else if (type === 'shield') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 0.22);
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      } else if (type === 'salvo') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // Audio handled gracefully
    }
  };

  // Continuous multi-strike stream generator
  useEffect(() => {
    const timer = setInterval(() => {
      const shuffled = [...BASE_GEO_STRIKES].sort(() => 0.5 - Math.random());
      const nextBatch = shuffled.slice(0, 5);
      setActiveStrikesPool(nextBatch);

      const focusOne = nextBatch[0];
      setSelectedStrike(focusOne);
      setLiveRate((r) => r + Math.floor(Math.random() * 11) - 5);
      setTotalIntercepted((t) => t + Math.floor(Math.random() * 3) + 1);

      playCyberSound('shield');
      const nowStr = new Date().toLocaleTimeString();
      const logText = `DEFENSE: ${focusOne.threat_name} (${focusOne.origin.code} ➔ ${focusOne.target.code}) - ${focusOne.status}`;
      setTerminalLogs((prev) => [
        { id: `log-${Date.now()}`, text: logText, type: 'amber', time: nowStr },
        ...prev.slice(0, 5)
      ]);
    }, 2500 / speedMultiplier);

    return () => clearInterval(timer);
  }, [speedMultiplier, soundEnabled]);

  const handleLaunchSalvo = () => {
    playCyberSound('salvo');
    const shuffled = [...BASE_GEO_STRIKES].sort(() => 0.5 - Math.random());
    setActiveStrikesPool(shuffled);
    setSelectedStrike(shuffled[0]);
    setLiveRate((r) => r + 50);
    setTotalIntercepted((t) => t + 6);

    const nowStr = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [
      { id: `salvo-${Date.now()}`, text: `🚨 SALVO BURST DETECTED: Multi-vector strikes intercepted across Portugal, Türkiye, Russia, Israel & USA!`, type: 'amber', time: nowStr },
      ...prev.slice(0, 5)
    ]);
  };

  const launchScenario = (scenarioKey: 'TRANSATLANTIC' | 'MEDITERRANEAN' | 'CASPIAN' | 'UPI') => {
    let strike: GeoAttackStrike | undefined;
    if (scenarioKey === 'TRANSATLANTIC') {
      strike = BASE_GEO_STRIKES[0]; // US -> TR
    } else if (scenarioKey === 'MEDITERRANEAN') {
      strike = BASE_GEO_STRIKES[1]; // PT -> IL
    } else if (scenarioKey === 'CASPIAN') {
      strike = BASE_GEO_STRIKES[2]; // RU -> TR
    } else if (scenarioKey === 'UPI') {
      strike = BASE_GEO_STRIKES[3]; // VN -> IN
    }

    if (strike) {
      setActiveStrikesPool((prev) => [strike!, ...prev.slice(0, 5)]);
      setSelectedStrike(strike);
      playCyberSound('laser');
      if (onSelectStrike) onSelectStrike(strike);
    }
  };

  const filteredStrikes = selectedCategory === 'All'
    ? activeStrikesPool
    : activeStrikesPool.filter((s) => s.type.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div className={`w-full rounded-3xl bg-[#0a0a0f] border-2 border-amber-500/40 shadow-2xl overflow-hidden font-mono text-slate-100 select-none flex flex-col transition-all duration-300 ${
      isFullscreen ? 'fixed inset-4 z-[9999] shadow-2xl bg-[#0a0a0f]' : 'relative'
    }`}>
      {/* 1. Header Bar with Radar Ping & DEFCON Status */}
      <div className="p-4 bg-gradient-to-r from-[#07070b] via-[#0f0f18] to-[#07070b] border-b border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-400 animate-pulse" /> Live Cyber Attack World Map Simulation
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/60 animate-pulse">
                REAL GEOGRAPHY RADAR
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Visualizing active cyber strikes, botnet streams & location pins across authentic global landmasses
            </p>
          </div>
        </div>

        {/* Global Strike Velocity Counter & Sound / Fullscreen Controls */}
        <div className="flex items-center gap-3 text-xs">
          <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-500 block">Live Strikes/min</span>
              <span className="text-amber-400 font-bold text-xs">{liveRate.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 hidden sm:flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-500 block">Defended Today</span>
              <span className="text-emerald-400 font-bold text-xs">{totalIntercepted.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute Cyber Audio FX' : 'Enable Cyber Audio FX'}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled ? 'bg-amber-500/20 text-amber-400 border-amber-500/60' : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-white'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Theater Mode' : 'Expand SOC Theater Mode'}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Interactive Map Tool Controls & Attack Scenario Arsenal */}
      <div className="px-4 py-2 bg-[#09090e] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Category Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
          <Filter className="w-3 h-3 text-slate-500 mr-1 shrink-0" />
          {['All', 'Ransomware', 'Phishing', 'DDoS', 'Zero-Day'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Real Strike Scenario Arsenal matching the reference image */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[10px]">
          <button
            onClick={handleLaunchSalvo}
            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider shadow-md transition-all flex items-center gap-1 cursor-pointer"
          >
            <Flame className="w-3 h-3 animate-pulse" />
            <span>Salvo Blitz</span>
          </button>
          <button
            onClick={() => launchScenario('TRANSATLANTIC')}
            className="px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-amber-500/40 font-bold transition-all cursor-pointer"
          >
            🇺🇸 US ➔ 🇹🇷 TR
          </button>
          <button
            onClick={() => launchScenario('MEDITERRANEAN')}
            className="px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-amber-500/40 font-bold transition-all cursor-pointer"
          >
            🇵🇹 Portugal ➔ 🇮🇱 Israel
          </button>
          <button
            onClick={() => launchScenario('CASPIAN')}
            className="px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-amber-500/40 font-bold transition-all cursor-pointer"
          >
            🇷🇺 Russia ➔ 🇹🇷 Türkiye
          </button>
          <button
            onClick={() => launchScenario('UPI')}
            className="px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-amber-500/40 font-bold transition-all cursor-pointer"
          >
            🇻🇳 VN ➔ 🇮🇳 India UPI
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px]">
            <span className="px-1.5 text-slate-500 font-bold">Speed:</span>
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeedMultiplier(spd)}
                className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                  speedMultiplier === spd ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Main Dotted Halftone Matrix Real World Map (Exact Style of Reference Image) */}
      <div className={`relative w-full ${isFullscreen ? 'flex-1 min-h-[500px]' : 'h-[360px] sm:h-[440px] md:h-[500px]'} bg-[#0d0e15] overflow-hidden`}>
        {/* Subtle Pink/Purple Grid Background with Crosshairs */}
        <svg
          viewBox="0 0 1000 550"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
        >
          {/* Vertical grid lines */}
          {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((gx) => (
            <line key={`gx-${gx}`} x1={gx} y1="0" x2={gx} y2="550" stroke="#f43f5e" strokeWidth="0.6" strokeDasharray="3 6" />
          ))}
          {/* Horizontal grid lines */}
          {[110, 220, 330, 440].map((gy) => (
            <line key={`gy-${gy}`} x1="0" y1={gy} x2="1000" y2={gy} stroke="#f43f5e" strokeWidth="0.6" strokeDasharray="3 6" />
          ))}
        </svg>

        {/* Real Dotted Halftone Matrix Continents SVG */}
        <svg
          viewBox="0 0 1000 550"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Halftone Dot Pattern for Realistic Continents */}
            <pattern id="dotMatrixContinent" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="1.8" fill="#475569" opacity="0.85" />
            </pattern>

            {/* Glowing Laser Filter */}
            <filter id="laserGlowAmber" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Arrow Marker */}
            <marker id="arrowAmber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
            </marker>
          </defs>

          {/* Dotted Continents Shapes */}
          <g fill="url(#dotMatrixContinent)" stroke="#334155" strokeWidth="0.5">
            {/* North America */}
            <path d="M 80 90 L 130 60 L 210 50 L 290 80 L 330 140 L 280 190 L 240 250 L 210 280 L 180 260 L 140 190 L 90 160 Z" />
            {/* Greenland */}
            <path d="M 330 40 L 400 30 L 420 70 L 360 100 L 330 80 Z" />
            {/* South America */}
            <path d="M 250 310 L 330 320 L 370 380 L 340 470 L 280 480 L 250 400 L 230 340 Z" />
            {/* Europe */}
            <path d="M 440 80 L 530 70 L 560 110 L 510 170 L 450 170 L 420 120 Z" />
            {/* United Kingdom */}
            <path d="M 430 105 L 450 100 L 445 130 L 425 125 Z" />
            {/* Africa */}
            <path d="M 440 180 L 550 180 L 590 250 L 560 380 L 490 420 L 440 340 L 410 240 Z" />
            {/* Middle East */}
            <path d="M 560 160 L 620 160 L 640 210 L 590 230 L 560 190 Z" />
            {/* Asia & Russia */}
            <path d="M 540 60 L 860 50 L 900 130 L 830 200 L 770 270 L 670 280 L 620 210 L 550 130 Z" />
            {/* India Subcontinent */}
            <path d="M 650 200 L 730 200 L 710 300 L 660 300 L 635 235 Z" />
            {/* Southeast Asia */}
            <path d="M 740 240 L 790 240 L 780 300 L 730 290 Z" />
            {/* Japan */}
            <path d="M 860 150 L 885 140 L 875 200 L 850 200 Z" />
            {/* Australia */}
            <path d="M 770 350 L 880 350 L 910 420 L 850 460 L 770 420 Z" />
          </g>

          {/* Active Glowing Attack Laser Trajectories (Matching the user's reference image!) */}
          {filteredStrikes.map((strike, idx) => {
            const p1 = project(strike.origin.lat, strike.origin.lng);
            const p2 = project(strike.target.lat, strike.target.lng);
            const isSelected = selectedStrike.id === strike.id;

            // Straight or slightly curved attack vector
            const linePath = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;

            return (
              <g
                key={strike.id}
                onClick={() => {
                  setSelectedStrike(strike);
                  playCyberSound('laser');
                  if (onSelectStrike) onSelectStrike(strike);
                }}
                className="cursor-pointer group"
              >
                {/* 1. Underlying Glowing Neon Orange Beam */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={isSelected ? 3.5 : 2}
                  strokeOpacity={isSelected ? 1 : 0.85}
                  filter="url(#laserGlowAmber)"
                />

                {/* 2. Crisp Inner Attack Laser */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth={isSelected ? 2 : 1.2}
                  markerEnd="url(#arrowAmber)"
                />

                {/* 3. Animated Comet Pulse traveling from origin to target */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={isSelected ? 3 : 2}
                  strokeDasharray="20 180"
                  strokeLinecap="round"
                  style={{
                    animation: `laserDash 2.4s linear infinite`,
                    animationDelay: `${idx * 0.35}s`
                  }}
                />
              </g>
            );
          })}

          {/* Real Teardrop Location Pins & Concentric Radar Circles (Exact style of uploaded image!) */}
          {Object.values(REAL_GEO_NODES).map((node) => {
            const p = project(node.lat, node.lng);
            const isSelected = selectedStrike.origin.id === node.id || selectedStrike.target.id === node.id;
            const isHovered = hoveredNode?.id === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${p.x}, ${p.y}) scale(${isSelected || isHovered ? 1.15 : 1})`}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => {
                  setHoveredNode(node);
                  playCyberSound('shield');
                }}
                className="cursor-pointer group"
              >
                {/* Concentric Pulsing Radar Rings at Pin Base */}
                <circle cx="0" cy="0" r={isSelected ? 14 : 10} fill="none" stroke="#f59e0b" strokeWidth={isSelected ? 1.8 : 1.2} opacity="0.7">
                  <animate attributeName="r" values="4;20;4" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2.2s" repeatCount="indefinite" />
                </circle>
                <circle cx="0" cy="0" r={isSelected ? 22 : 18} fill="none" stroke="#f59e0b" strokeWidth="0.8" opacity="0.4">
                  <animate attributeName="r" values="8;28;8" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="2.2s" repeatCount="indefinite" />
                </circle>

                {/* Base Anchor Dot */}
                <circle cx="0" cy="0" r="3.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />

                {/* Teardrop Location Pin (Exact shape from user image!) */}
                <g transform="translate(0, -18) scale(1.2)">
                  <path
                    d="M 0 -12 C -6 -12 -10 -8 -10 -2 C -10 4 0 12 0 12 C 0 12 10 4 10 -2 C 10 -8 6 -12 0 -12 Z"
                    fill="#0f0f18"
                    stroke={isSelected ? "#fbbf24" : "#f59e0b"}
                    strokeWidth={isSelected ? 2.4 : 1.8}
                    filter="url(#laserGlowAmber)"
                  />
                  {/* Inner Pin Dot */}
                  <circle cx="0" cy="-3" r="3.5" fill="#f59e0b" />
                </g>

                {/* Clean Location Text Label Above Pin */}
                <text
                  x="0"
                  y="-34"
                  textAnchor="middle"
                  className="fill-white font-sans text-[11px] font-bold pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wide"
                >
                  {node.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hovered Location Pin Quick Tooltip */}
        {hoveredNode && (
          <div
            className="absolute z-20 p-3 rounded-2xl bg-slate-950/95 border border-amber-500/70 shadow-2xl backdrop-blur-xl pointer-events-none font-mono text-xs space-y-1 transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${project(hoveredNode.lat, hoveredNode.lng).x / 10}%`,
              top: `${project(hoveredNode.lat, hoveredNode.lng).y / 5.5}%`
            }}
          >
            <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
              <span className="text-base">{hoveredNode.flag}</span>
              <strong className="text-white">{hoveredNode.name}</strong>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 font-bold border border-amber-500/40">
                {hoveredNode.threat_level}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[11px] pt-1 text-slate-400">
              <div>
                <span className="text-slate-500 text-[10px] block">Attacks Defended:</span>
                <span className="text-emerald-400 font-bold">{hoveredNode.blocked.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Threats Tracked:</span>
                <span className="text-rose-400 font-bold">{hoveredNode.sent.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Floating Active Strike HUD Box (Bottom Left of Map) */}
        {selectedStrike && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-10 p-3.5 rounded-2xl bg-slate-950/95 border-2 border-amber-500/70 shadow-2xl backdrop-blur-xl space-y-2 font-mono text-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                  REAL GEOGRAPHIC INTERCEPT
                </span>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-600">
                {selectedStrike.type}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold pt-0.5">
              <div className="flex items-center gap-1">
                <span>{selectedStrike.origin.flag}</span>
                <span className="text-slate-300">{selectedStrike.origin.name}</span>
              </div>
              <span className="text-amber-400 font-black">➔</span>
              <div className="flex items-center gap-1">
                <span>{selectedStrike.target.flag}</span>
                <span className="text-white">{selectedStrike.target.name}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 font-sans">
              <strong className="text-white font-mono">{selectedStrike.threat_name}</strong>: Target Sector — <span className="text-amber-300 font-semibold">{selectedStrike.target.sector}</span>
            </p>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
              <span className="truncate max-w-[220px]">⚡ Port {selectedStrike.port || 443} • {selectedStrike.vector}</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                ✓ {selectedStrike.status}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Live Cyber Warfare Intercept Terminal Logs */}
      <div className="p-3 bg-[#07070c] border-t border-slate-800/90 font-mono text-xs space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-900">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold uppercase text-slate-300">Live Global Intercept Telemetry Feed</span>
          </div>
          <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
            <Radio className="w-3 h-3 text-amber-400 animate-pulse" /> SIMULATION STREAMING
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          {terminalLogs.slice(0, 4).map((log) => (
            <div
              key={log.id}
              className="p-2 rounded-xl border bg-amber-950/30 border-amber-500/30 text-amber-200 flex items-center justify-between gap-2"
            >
              <span className="truncate">{log.text}</span>
              <span className="text-[9px] text-slate-500 shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Leaderboard & Targeted Statistics Footer Tabs */}
      <div className="p-3 bg-[#07070b] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveLeaderboard('origins')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
              activeLeaderboard === 'origins' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'text-slate-400'
            }`}
          >
            🔥 Top Attack Origins
          </button>
          <button
            onClick={() => setActiveLeaderboard('targets')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
              activeLeaderboard === 'targets' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'text-slate-400'
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
              <span>3. 🇹🇷 Türkiye (Energy 18%)</span>
              <span>4. 🇮🇱 Israel (Cloud 16%)</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes laserDash {
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
