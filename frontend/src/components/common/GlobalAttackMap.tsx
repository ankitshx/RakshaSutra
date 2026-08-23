import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Globe,
  Filter,
  Maximize2,
  Minimize2,
  Terminal,
  Play,
  Pause,
  RotateCcw,
  Info
} from 'lucide-react';

interface GeoAttackNode {
  id: string;
  name: string;
  country: string;
  code: string;
  flag: string;
  coords: [number, number]; // [lat, lng]
  threat_level: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

interface GeoAttackStrike {
  id: string;
  threat_name: string;
  type: 'Ransomware' | 'Phishing' | 'DDoS' | 'Zero-Day' | 'Infostealer' | 'Web Attack' | 'Malware';
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
  US: { id: 'US', name: 'United States', country: 'United States', code: 'US', flag: '🇺🇸', coords: [38.0, -97.0], threat_level: 'HIGH' },
  PT: { id: 'PT', name: 'Portugal', country: 'Portugal', code: 'PT', flag: '🇵🇹', coords: [39.5, -8.0], threat_level: 'MEDIUM' },
  TR: { id: 'TR', name: 'Türkiye', country: 'Türkiye', code: 'TR', flag: '🇹🇷', coords: [39.0, 35.0], threat_level: 'HIGH' },
  IL: { id: 'IL', name: 'Israel', country: 'Israel', code: 'IL', flag: '🇮🇱', coords: [31.5, 35.0], threat_level: 'CRITICAL' },
  RU: { id: 'RU', name: 'Russia', country: 'Russia', code: 'RU', flag: '🇷🇺', coords: [55.75, 37.6], threat_level: 'CRITICAL' },
  IN: { id: 'IN', name: 'India', country: 'India', code: 'IN', flag: '🇮🇳', coords: [21.0, 78.0], threat_level: 'HIGH' },
  CN: { id: 'CN', name: 'China', country: 'China', code: 'CN', flag: '🇨🇳', coords: [35.0, 104.0], threat_level: 'CRITICAL' },
  DE: { id: 'DE', name: 'Germany', country: 'Germany', code: 'DE', flag: '🇩🇪', coords: [51.0, 10.0], threat_level: 'MEDIUM' },
  GB: { id: 'GB', name: 'United Kingdom', country: 'United Kingdom', code: 'GB', flag: '🇬🇧', coords: [54.0, -2.0], threat_level: 'HIGH' },
  JP: { id: 'JP', name: 'Japan', country: 'Japan', code: 'JP', flag: '🇯🇵', coords: [36.0, 138.0], threat_level: 'HIGH' },
  BR: { id: 'BR', name: 'Brazil', country: 'Brazil', code: 'BR', flag: '🇧🇷', coords: [-14.0, -51.0], threat_level: 'HIGH' },
  SG: { id: 'SG', name: 'Singapore', country: 'Singapore', code: 'SG', flag: '🇸🇬', coords: [1.35, 103.8], threat_level: 'MEDIUM' },
  AU: { id: 'AU', name: 'Australia', country: 'Australia', code: 'AU', flag: '🇦🇺', coords: [-25.0, 134.0], threat_level: 'MEDIUM' },
  VN: { id: 'VN', name: 'Vietnam', country: 'Vietnam', code: 'VN', flag: '🇻🇳', coords: [21.0, 105.8], threat_level: 'HIGH' }
};

const BASE_GEO_STRIKES: GeoAttackStrike[] = [
  {
    id: 'atk-sim-1',
    threat_name: 'Simulated Transatlantic RDP Lure',
    type: 'Ransomware',
    origin: REAL_GEO_NODES.US,
    target: { ...REAL_GEO_NODES.TR, sector: 'Regional Transit & Energy Node' },
    severity: 'CRITICAL',
    status: 'BLOCKED BY DEFENSE',
    vector: 'RDP Port 3389 Probe',
    color: '#f59e0b',
    timestamp: 'Just now',
    port: 3389
  },
  {
    id: 'atk-sim-2',
    threat_name: 'Simulated Banking Gateway Phishing Probe',
    type: 'Phishing',
    origin: REAL_GEO_NODES.PT,
    target: { ...REAL_GEO_NODES.IL, sector: 'FinTech Multi-Sig Cloud' },
    severity: 'HIGH',
    status: 'INTERCEPTED',
    vector: 'Credential Harvesting Form',
    color: '#f59e0b',
    timestamp: '1s ago',
    port: 443
  },
  {
    id: 'atk-sim-3',
    threat_name: 'Simulated Substation Volumetric Flood',
    type: 'DDoS',
    origin: REAL_GEO_NODES.RU,
    target: { ...REAL_GEO_NODES.TR, sector: 'Utility SCADA Network' },
    severity: 'CRITICAL',
    status: 'RATE-LIMITED',
    vector: 'NTP Amplification UDP/123',
    color: '#ef4444',
    timestamp: '2s ago',
    port: 123
  },
  {
    id: 'atk-sim-4',
    threat_name: 'Simulated Fake Payment App Campaign',
    type: 'Web Attack',
    origin: REAL_GEO_NODES.VN,
    target: { ...REAL_GEO_NODES.IN, sector: 'Consumer Banking & UPI' },
    severity: 'CRITICAL',
    status: 'BLOCKED BY RAKSHASUTRA',
    vector: 'Typosquatting Banking Impersonation',
    color: '#06b6d4',
    timestamp: '3s ago',
    port: 443
  },
  {
    id: 'atk-sim-5',
    threat_name: 'Simulated Cloud API Credential Exfiltration',
    type: 'Infostealer',
    origin: REAL_GEO_NODES.BR,
    target: { ...REAL_GEO_NODES.DE, sector: 'Automotive Cloud Supply' },
    severity: 'HIGH',
    status: 'DEFENDED',
    vector: 'OAuth Token Abuse',
    color: '#a855f7',
    timestamp: '4s ago',
    port: 8443
  }
];

function generateCurvedArc(start: [number, number], end: [number, number], segments = 50, arcHeight = 0.28): [number, number][] {
  const points: [number, number][] = [];
  const lat1 = (start[0] * Math.PI) / 180;
  const lng1 = (start[1] * Math.PI) / 180;
  const lat2 = (end[0] * Math.PI) / 180;
  const lng2 = (end[1] * Math.PI) / 180;

  const d = 2 * Math.asin(Math.sqrt(
    Math.sin((lat2 - lat1) / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * (Math.sin((lng2 - lng1) / 2) ** 2)
  ));

  for (let i = 0; i <= segments; i++) {
    const f = i / segments;
    const A = Math.sin((1 - f) * d) / (Math.sin(d) || 1);
    const B = Math.sin(f * d) / (Math.sin(d) || 1);

    const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
    const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);

    let lat = (Math.atan2(z, Math.sqrt(x * x + y * y)) * 180) / Math.PI;
    const lng = (Math.atan2(y, x) * 180) / Math.PI;

    const offset = Math.sin(f * Math.PI) * d * (180 / Math.PI) * arcHeight;
    lat = Math.max(-85, Math.min(85, lat + offset));

    points.push([lat, lng]);
  }
  return points;
}

function calculateBearing(p1: [number, number], p2: [number, number]): number {
  const y = Math.sin(((p2[1] - p1[1]) * Math.PI) / 180) * Math.cos((p2[0] * Math.PI) / 180);
  const x =
    Math.cos((p1[0] * Math.PI) / 180) * Math.sin((p2[0] * Math.PI) / 180) -
    Math.sin((p1[0] * Math.PI) / 180) * Math.cos((p2[0] * Math.PI) / 180) * Math.cos(((p2[1] - p1[1]) * Math.PI) / 180);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

export const GlobalAttackMap: React.FC<{ onSelectStrike?: (strike: any) => void }> = ({ onSelectStrike }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const strikeLayersGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeStrikesPool, setActiveStrikesPool] = useState<GeoAttackStrike[]>(BASE_GEO_STRIKES.slice(0, 4));
  const [selectedStrike, setSelectedStrike] = useState<GeoAttackStrike>(BASE_GEO_STRIKES[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const [terminalLogs, setTerminalLogs] = useState<Array<{ id: string; text: string; time: string }>>([
    { id: '1', text: 'SIMULATION: Phishing Lure (US ➔ TR) analyzed and blocked', time: '12:00:01' },
    { id: '2', text: 'SIMULATION: Banking Impersonation (VN ➔ IN) intercepted', time: '12:00:03' },
    { id: '3', text: 'SIMULATION: Substation Flood (RU ➔ TR) rate-limited', time: '12:00:05' }
  ]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [30, 20],
        zoom: 2,
        minZoom: 2,
        maxZoom: 8,
        zoomControl: false,
        attributionControl: false,
        worldCopyJump: true
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      const strikeGroup = L.layerGroup().addTo(map);
      strikeLayersGroupRef.current = strikeGroup;
      mapInstanceRef.current = map;
    }
  }, []);

  // Update Markers & Trajectory Arcs
  useEffect(() => {
    if (!mapInstanceRef.current || !strikeLayersGroupRef.current) return;

    const group = strikeLayersGroupRef.current;
    group.clearLayers();

    // Plot Location Pins
    Object.values(REAL_GEO_NODES).forEach((node) => {
      const isOrigin = selectedStrike.origin.id === node.id;
      const isTarget = selectedStrike.target.id === node.id;

      const markerIcon = L.divIcon({
        className: 'custom-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;">
            <span style="position: absolute; bottom: 0; width: ${isOrigin || isTarget ? '28px' : '18px'}; height: ${isOrigin || isTarget ? '28px' : '18px'}; border-radius: 50%; border: ${isOrigin ? '2px solid #ef4444' : isTarget ? '2px solid #06b6d4' : '1.5px solid #64748b'}; opacity: 0.6; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
            
            ${isOrigin ? `
              <span style="background: #991b1b; color: #fecaca; border: 1px solid #ef4444; font-family: monospace; font-size: 8px; font-weight: 800; padding: 1px 4px; border-radius: 4px; margin-bottom: 2px; text-transform: uppercase;">
                ORIGIN
              </span>
            ` : isTarget ? `
              <span style="background: #083344; color: #a5f3fc; border: 1px solid #06b6d4; font-family: monospace; font-size: 8px; font-weight: 800; padding: 1px 4px; border-radius: 4px; margin-bottom: 2px; text-transform: uppercase;">
                TARGET
              </span>
            ` : ''}

            <span style="color: #ffffff; font-family: sans-serif; font-size: 10px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.9); margin-bottom: 2px; white-space: nowrap;">
              ${node.name}
            </span>

            <svg width="20" height="26" viewBox="0 0 24 30" fill="none">
              <path d="M12 2C7.58 2 4 5.58 4 10C4 16 12 28 12 28C12 28 20 16 20 10C20 5.58 16.42 2 12 2Z" fill="#0f172a" stroke="${isOrigin ? '#ef4444' : isTarget ? '#06b6d4' : '#475569'}" stroke-width="2"/>
              <circle cx="12" cy="10" r="3.5" fill="${isOrigin ? '#ef4444' : isTarget ? '#06b6d4' : '#64748b'}"/>
            </svg>
          </div>
        `,
        iconSize: [90, 55],
        iconAnchor: [45, 50]
      });

      L.marker(node.coords, { icon: markerIcon }).addTo(group);
    });

    // Filter strikes
    const visibleStrikes = activeStrikesPool.filter((s) => {
      if (selectedCategory === 'All') return true;
      return s.type.toLowerCase() === selectedCategory.toLowerCase();
    });

    // Draw Trajectory Arcs
    visibleStrikes.forEach((strike) => {
      const arcCoords = generateCurvedArc(strike.origin.coords, strike.target.coords, 40, 0.25);
      const isSelected = selectedStrike.id === strike.id;

      const pathLine = L.polyline(arcCoords, {
        color: isSelected ? '#06b6d4' : '#f59e0b',
        weight: isSelected ? 3.5 : 1.8,
        opacity: isSelected ? 0.95 : 0.65,
        dashArray: isSelected ? undefined : '5, 8'
      }).addTo(group);

      pathLine.on('click', () => {
        setSelectedStrike(strike);
        if (onSelectStrike) onSelectStrike(strike);
      });

      // Terminal arrowhead
      const lastPoint = arcCoords[arcCoords.length - 1];
      const prevPoint = arcCoords[arcCoords.length - 2];
      const bearing = calculateBearing(prevPoint, lastPoint);

      const arrowIcon = L.divIcon({
        className: 'custom-arrow',
        html: `
          <div style="transform: rotate(${bearing}deg); display: flex; align-items: center; justify-content: center; width: 20px; height: 20px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M 4 4 L 20 12 L 4 20 L 8 12 Z" fill="${isSelected ? '#06b6d4' : '#f59e0b'}" />
            </svg>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      L.marker(lastPoint, { icon: arrowIcon }).addTo(group);
    });
  }, [selectedCategory, selectedStrike, activeStrikesPool]);

  // Simulation playback loop
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      const shuffled = [...BASE_GEO_STRIKES].sort(() => 0.5 - Math.random());
      const nextBatch = shuffled.slice(0, 4);
      setActiveStrikesPool(nextBatch);

      const focusOne = nextBatch[0];
      setSelectedStrike(focusOne);

      const nowStr = new Date().toLocaleTimeString();
      const logText = `SIMULATION: ${focusOne.threat_name} (${focusOne.origin.code} ➔ ${focusOne.target.code}) - ${focusOne.status}`;
      setTerminalLogs((prev) => [
        { id: `sim-${Date.now()}`, text: logText, time: nowStr },
        ...prev.slice(0, 4)
      ]);
    }, 3000 / speedMultiplier);

    return () => clearInterval(timer);
  }, [isPlaying, speedMultiplier]);

  const handleReplay = () => {
    const shuffled = [...BASE_GEO_STRIKES].sort(() => 0.5 - Math.random());
    setActiveStrikesPool(shuffled);
    setSelectedStrike(shuffled[0]);
  };

  return (
    <div className={`w-full rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden font-mono text-slate-100 flex flex-col transition-all ${
      isFullscreen ? 'fixed inset-4 z-[9999]' : 'relative'
    }`}>
      {/* Header Bar */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-cyan-500 animate-ping absolute" />
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <Globe className="w-4 h-4 text-cyan-400" /> Cyber Threat Map
              </h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/50">
                SIMULATION MODE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Demonstrating synthetic global threat vectors and automated defense containment protocols.
            </p>
          </div>
        </div>

        {/* Playback Controls & Speed */}
        <div className="flex items-center gap-2 text-xs">
          
          {/* Play / Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="font-bold">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          {/* Replay */}
          <button
            onClick={handleReplay}
            title="Replay Simulation Batch"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center rounded-xl bg-slate-800 p-0.5 border border-slate-700">
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => setSpeedMultiplier(speed)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  speedMultiplier === speed
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Fullscreen */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>

      {/* Filter Chips Bar */}
      <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <Filter className="w-3 h-3 text-slate-500 mr-1 shrink-0" />
          {['All', 'Ransomware', 'Phishing', 'DDoS', 'Web Attack', 'Infostealer'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Click any trajectory to inspect simulated vector details.</span>
        </div>
      </div>

      {/* Main Map Body & Event Side Inspector */}
      <div className="relative flex-1 min-h-[420px] sm:min-h-[500px]">
        <div ref={mapContainerRef} className="w-full h-full min-h-[420px] sm:min-h-[500px]" />

        {/* Selected Event Details Float Panel */}
        <div className="absolute top-4 left-4 max-w-xs sm:max-w-sm p-4 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-2 z-[500] text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-cyan-400 font-sans">{selectedStrike.threat_name}</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 text-[10px] font-bold border border-rose-500/40">
              {selectedStrike.severity}
            </span>
          </div>

          <div className="space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Origin:</span>
              <span>{selectedStrike.origin.flag} {selectedStrike.origin.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Target Hub:</span>
              <span>{selectedStrike.target.flag} {selectedStrike.target.name} ({selectedStrike.target.sector})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Attack Vector:</span>
              <span className="text-amber-400">{selectedStrike.vector}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Defense Status:</span>
              <span className="text-emerald-400 font-bold">{selectedStrike.status}</span>
            </div>
          </div>
        </div>

        {/* Terminal Telemetry Log at Bottom */}
        <div className="absolute bottom-4 right-4 max-w-sm hidden sm:block p-3 rounded-xl bg-slate-950/90 border border-slate-800 shadow-xl backdrop-blur-md z-[500] text-[10px] text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold border-b border-slate-800 pb-1">
            <Terminal className="w-3 h-3" />
            <span>Simulated Telemetry Feed</span>
          </div>
          {terminalLogs.map((log) => (
            <div key={log.id} className="truncate">
              <span className="text-slate-600">[{log.time}]</span> {log.text}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
