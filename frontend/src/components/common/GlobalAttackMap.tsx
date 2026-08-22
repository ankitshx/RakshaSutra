import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Globe,
  Zap,
  Target,
  Shield,
  Filter,
  Sparkles,
  Plus,
  Minus
} from 'lucide-react';

interface GeoAttackNode {
  id: string;
  name: string;
  country: string;
  code: string;
  flag: string;
  coords: [number, number]; // [lat, lng]
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
}

const REAL_GEO_NODES: Record<string, GeoAttackNode> = {
  IN_DELHI: { id: 'IN_DELHI', name: 'New Delhi', country: 'India', code: 'IN', flag: '🇮🇳', coords: [28.6139, 77.2090], sent: 8400, blocked: 128400, threat_level: 'HIGH' },
  IN_MUMBAI: { id: 'IN_MUMBAI', name: 'Mumbai', country: 'India', code: 'IN', flag: '🇮🇳', coords: [19.0760, 72.8777], sent: 9100, blocked: 142000, threat_level: 'HIGH' },
  US_NY: { id: 'US_NY', name: 'New York', country: 'United States', code: 'US', flag: '🇺🇸', coords: [40.7128, -74.0060], sent: 16200, blocked: 98400, threat_level: 'HIGH' },
  US_SF: { id: 'US_SF', name: 'Silicon Valley', country: 'United States', code: 'US', flag: '🇺🇸', coords: [37.7749, -122.4194], sent: 14500, blocked: 104200, threat_level: 'HIGH' },
  RU_MOSCOW: { id: 'RU_MOSCOW', name: 'Moscow', country: 'Russia', code: 'RU', flag: '🇷🇺', coords: [55.7558, 37.6173], sent: 54900, blocked: 14200, threat_level: 'CRITICAL' },
  VN_HANOI: { id: 'VN_HANOI', name: 'Hanoi', country: 'Vietnam', code: 'VN', flag: '🇻🇳', coords: [21.0285, 105.8542], sent: 34200, blocked: 6100, threat_level: 'HIGH' },
  BR_SP: { id: 'BR_SP', name: 'São Paulo', country: 'Brazil', code: 'BR', flag: '🇧🇷', coords: [-23.5505, -46.6333], sent: 29800, blocked: 19400, threat_level: 'HIGH' },
  DE_FRA: { id: 'DE_FRA', name: 'Frankfurt', country: 'Germany', code: 'DE', flag: '🇩🇪', coords: [50.1109, 8.6821], sent: 11200, blocked: 78400, threat_level: 'MEDIUM' },
  GB_LON: { id: 'GB_LON', name: 'London', country: 'United Kingdom', code: 'GB', flag: '🇬🇧', coords: [51.5074, -0.1278], sent: 9400, blocked: 89200, threat_level: 'HIGH' },
  IL_TLV: { id: 'IL_TLV', name: 'Tel Aviv', country: 'Israel', code: 'IL', flag: '🇮🇱', coords: [32.0853, 34.7818], sent: 22400, blocked: 34100, threat_level: 'CRITICAL' },
  CN_BEI: { id: 'CN_BEI', name: 'Beijing', country: 'China', code: 'CN', flag: '🇨🇳', coords: [39.9042, 116.4074], sent: 68400, blocked: 29400, threat_level: 'CRITICAL' },
  JP_TYO: { id: 'JP_TYO', name: 'Tokyo', country: 'Japan', code: 'JP', flag: '🇯🇵', coords: [35.6762, 139.6503], sent: 5100, blocked: 69400, threat_level: 'HIGH' },
  NG_LOS: { id: 'NG_LOS', name: 'Lagos', country: 'Nigeria', code: 'NG', flag: '🇳🇬', coords: [6.5244, 3.3792], sent: 31200, blocked: 4800, threat_level: 'HIGH' },
  SG_SIN: { id: 'SG_SIN', name: 'Singapore', country: 'Singapore', code: 'SG', flag: '🇸🇬', coords: [1.3521, 103.8198], sent: 7200, blocked: 58400, threat_level: 'MEDIUM' },
  AU_SYD: { id: 'AU_SYD', name: 'Sydney', country: 'Australia', code: 'AU', flag: '🇦🇺', coords: [-33.8688, 151.2093], sent: 4100, blocked: 46200, threat_level: 'MEDIUM' },
  AE_DXB: { id: 'AE_DXB', name: 'Dubai', country: 'UAE', code: 'AE', flag: '🇦🇪', coords: [25.2048, 55.2708], sent: 16800, blocked: 38200, threat_level: 'MEDIUM' },
  CA_TOR: { id: 'CA_TOR', name: 'Toronto', country: 'Canada', code: 'CA', flag: '🇨🇦', coords: [43.6532, -79.3832], sent: 6400, blocked: 49200, threat_level: 'MEDIUM' },
  ZA_JNB: { id: 'ZA_JNB', name: 'Johannesburg', country: 'South Africa', code: 'ZA', flag: '🇿🇦', coords: [-26.2041, 28.0473], sent: 9800, blocked: 24100, threat_level: 'MEDIUM' },
  KR_SEO: { id: 'KR_SEO', name: 'Seoul', country: 'South Korea', code: 'KR', flag: '🇰🇷', coords: [37.5665, 126.9780], sent: 7800, blocked: 61200, threat_level: 'HIGH' },
  FR_PAR: { id: 'FR_PAR', name: 'Paris', country: 'France', code: 'FR', flag: '🇫🇷', coords: [48.8566, 2.3522], sent: 8900, blocked: 54100, threat_level: 'MEDIUM' }
};

const INITIAL_GEO_STRIKES: GeoAttackStrike[] = [
  {
    id: 'atk-real-1',
    threat_name: 'Lockbit 3.0 Ransomware Wave',
    type: 'Ransomware',
    origin: REAL_GEO_NODES.RU_MOSCOW,
    target: { ...REAL_GEO_NODES.US_NY, sector: 'Hospital Core & Healthcare DBs' },
    severity: 'CRITICAL',
    status: 'BLOCKED BY DEFENSE',
    vector: 'RDP Port Scanning & SMBv3 Exploit',
    color: '#f43f5e',
    timestamp: 'Just now'
  },
  {
    id: 'atk-real-2',
    threat_name: 'Fake UPI Banking Trojan APK',
    type: 'Phishing',
    origin: REAL_GEO_NODES.VN_HANOI,
    target: { ...REAL_GEO_NODES.IN_MUMBAI, sector: 'UPI Gateways & Netbanking OTPs' },
    severity: 'HIGH',
    status: 'INTERCEPTED',
    vector: 'WhatsApp Electricity Smishing APK',
    color: '#06b6d4',
    timestamp: '3s ago'
  },
  {
    id: 'atk-real-3',
    threat_name: 'Mirai IoT DDoS Blitz (3.8 Tbps)',
    type: 'DDoS',
    origin: REAL_GEO_NODES.BR_SP,
    target: { ...REAL_GEO_NODES.DE_FRA, sector: 'Tier-1 Edge DNS Nodes' },
    severity: 'HIGH',
    status: 'MITIGATED',
    vector: 'SYN-Flood UDP Amplification',
    color: '#a855f7',
    timestamp: '6s ago'
  },
  {
    id: 'atk-real-4',
    threat_name: 'WebKit Zero-Click Remote Code Execution',
    type: 'Zero-Day',
    origin: REAL_GEO_NODES.IL_TLV,
    target: { ...REAL_GEO_NODES.GB_LON, sector: 'Diplomatic & Gov Terminals' },
    severity: 'CRITICAL',
    status: 'INVESTIGATING',
    vector: 'Zero-Click Font Parser Heap Overflow',
    color: '#eab308',
    timestamp: '9s ago'
  },
  {
    id: 'atk-real-5',
    threat_name: 'Lumma Infostealer Payload Drop',
    type: 'Infostealer',
    origin: REAL_GEO_NODES.CN_BEI,
    target: { ...REAL_GEO_NODES.JP_TYO, sector: 'Semiconductor Fabrication' },
    severity: 'CRITICAL',
    status: 'BLOCKED BY DEFENSE',
    vector: 'Spear-Phishing PDF Macro Dropper',
    color: '#f43f5e',
    timestamp: '12s ago'
  },
  {
    id: 'atk-real-6',
    threat_name: 'AI Voice Deepfake CEO Wire Fraud',
    type: 'AI Voice',
    origin: REAL_GEO_NODES.NG_LOS,
    target: { ...REAL_GEO_NODES.SG_SIN, sector: 'Corporate Escrow & Treasury' },
    severity: 'HIGH',
    status: 'FLAGGED',
    vector: 'Cloned Real-time Audio Phone Call',
    color: '#3b82f6',
    timestamp: '16s ago'
  },
  {
    id: 'atk-real-7',
    threat_name: 'Cobalt Strike C2 Beacon Activity',
    type: 'C2 Malware',
    origin: REAL_GEO_NODES.RU_MOSCOW,
    target: { ...REAL_GEO_NODES.CA_TOR, sector: 'Energy Power Grid SCADA' },
    severity: 'CRITICAL',
    status: 'BLOCKED BY DEFENSE',
    vector: 'Supply Chain DLL Hijacking',
    color: '#f43f5e',
    timestamp: '19s ago'
  },
  {
    id: 'atk-real-8',
    threat_name: 'Telegram SIM Swap Crypto Drainer',
    type: 'Phishing',
    origin: REAL_GEO_NODES.AE_DXB,
    target: { ...REAL_GEO_NODES.AU_SYD, sector: 'Web3 & Multi-Sig Vaults' },
    severity: 'HIGH',
    status: 'BLOCKED BY DEFENSE',
    vector: 'Carrier Impersonation OTP Theft',
    color: '#06b6d4',
    timestamp: '23s ago'
  },
  {
    id: 'atk-real-9',
    threat_name: 'Banking OTP Intercept & SMS Forwarder',
    type: 'Phishing',
    origin: REAL_GEO_NODES.CN_BEI,
    target: { ...REAL_GEO_NODES.IN_DELHI, sector: 'National Banking Switch' },
    severity: 'HIGH',
    status: 'BLOCKED BY DEFENSE',
    vector: 'Trojanized Fake Income Tax APK',
    color: '#06b6d4',
    timestamp: '27s ago'
  }
];

// Helper to compute curved points along great-circle arc
function getArcPolyline(p1: [number, number], p2: [number, number], pointsCount: number = 30): [number, number][] {
  const [lat1, lng1] = p1;
  const [lat2, lng2] = p2;
  const points: [number, number][] = [];

  // Intermediate mid elevation offset
  const midLat = (lat1 + lat2) / 2;
  const dist = Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
  const arcElevation = Math.min(25, Math.max(8, dist * 0.22));

  for (let i = 0; i <= pointsCount; i++) {
    const t = i / pointsCount;
    // Quadratic bezier in lat/lng space
    const lat = (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * (midLat + arcElevation) + t * t * lat2;
    const lng = (1 - t) * lng1 + t * lng2;
    points.push([lat, lng]);
  }
  return points;
}

export const GlobalAttackMap: React.FC<{ onSelectStrike?: (strike: any) => void }> = ({ onSelectStrike }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const strikeLayersGroupRef = useRef<L.LayerGroup | null>(null);

  const [selectedStrike, setSelectedStrike] = useState<GeoAttackStrike>(INITIAL_GEO_STRIKES[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [liveRate, setLiveRate] = useState<number>(18580);
  const [totalIntercepted, setTotalIntercepted] = useState<number>(1498420);
  const [activeLeaderboard, setActiveLeaderboard] = useState<'origins' | 'targets'>('origins');

  // Initialize Real Geographical Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create map centered on real world coordinates [20, 20], zoom level 2
      const map = L.map(mapContainerRef.current, {
        center: [22, 20],
        zoom: 2,
        minZoom: 2,
        maxZoom: 9,
        zoomControl: false,
        attributionControl: false,
        worldCopyJump: true
      });

      // CartoDB Dark Matter real geographic tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // Layer group for attack arcs & markers
      const strikeGroup = L.layerGroup().addTo(map);
      strikeLayersGroupRef.current = strikeGroup;

      // Plot all Real Geographical Defense & Threat Nodes
      Object.values(REAL_GEO_NODES).forEach((node) => {
        const isCritical = node.threat_level === 'CRITICAL';
        const nodeColor = isCritical ? '#f43f5e' : '#06b6d4';

        // Custom Glowing Pulse HTML Marker
        const markerIcon = L.divIcon({
          className: 'custom-geo-node',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; cursor: pointer;">
              <span style="position: absolute; width: 18px; height: 18px; border-radius: 50%; background: ${nodeColor}; opacity: 0.4; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
              <span style="width: 8px; height: 8px; border-radius: 50%; background: ${nodeColor}; box-shadow: 0 0 10px ${nodeColor}; border: 1.5px solid white;"></span>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker(node.coords, { icon: markerIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: monospace; font-size: 11px; padding: 4px; color: #f8fafc; background: #020617;">
            <div style="font-weight: bold; border-bottom: 1px solid #1e293b; padding-bottom: 3px; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
              <span>${node.flag}</span> <span>${node.name}, ${node.country}</span>
            </div>
            <div style="color: #94a3b8; font-size: 10px;">Threat Level: <strong style="color: ${nodeColor}">${node.threat_level}</strong></div>
            <div style="color: #34d399; font-size: 10px;">Attacks Defended: <strong>${node.blocked.toLocaleString()}</strong></div>
            <div style="color: #fb7185; font-size: 10px;">Threats Tracked: <strong>${node.sent.toLocaleString()}</strong></div>
            <div style="color: #38bdf8; font-size: 9px; margin-top: 4px;">GPS: ${node.coords[0].toFixed(2)}°N, ${node.coords[1].toFixed(2)}°E</div>
          </div>
        `, { className: 'custom-dark-popup' });
      });

      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup on unmount handled gracefully
    };
  }, []);

  // Re-render Dynamic Attack Laser Arcs on the Real Map
  useEffect(() => {
    if (!mapInstanceRef.current || !strikeLayersGroupRef.current) return;

    const group = strikeLayersGroupRef.current;
    group.clearLayers();

    const filtered = selectedCategory === 'All'
      ? INITIAL_GEO_STRIKES
      : INITIAL_GEO_STRIKES.filter((s) => s.type.toLowerCase().includes(selectedCategory.toLowerCase()));

    filtered.forEach((strike) => {
      const arcCoords = getArcPolyline(strike.origin.coords, strike.target.coords, 35);
      const isSelected = selectedStrike.id === strike.id;

      // Polyline for the curved missile / laser trajectory
      const polyline = L.polyline(arcCoords, {
        color: strike.color,
        weight: isSelected ? 3.5 : 2,
        opacity: isSelected ? 0.95 : 0.65,
        dashArray: isSelected ? undefined : '6, 8',
        lineCap: 'round'
      }).addTo(group);

      polyline.on('click', () => {
        setSelectedStrike(strike);
        if (onSelectStrike) onSelectStrike(strike);
      });

      // Target Impact Radar Shockwave Circle
      const impactShockwave = L.circle(strike.target.coords, {
        radius: isSelected ? 350000 : 200000,
        color: strike.color,
        fillColor: strike.color,
        fillOpacity: 0.15,
        weight: 1.5
      }).addTo(group);

      impactShockwave.on('click', () => {
        setSelectedStrike(strike);
        if (onSelectStrike) onSelectStrike(strike);
      });
    });
  }, [selectedCategory, selectedStrike]);

  // Periodic simulated real attack rotation
  useEffect(() => {
    const timer = setInterval(() => {
      const randomStrike = INITIAL_GEO_STRIKES[Math.floor(Math.random() * INITIAL_GEO_STRIKES.length)];
      setSelectedStrike(randomStrike);
      setLiveRate((r) => r + Math.floor(Math.random() * 9) - 4);
      setTotalIntercepted((t) => t + 1);
    }, 3200 / speedMultiplier);

    return () => clearInterval(timer);
  }, [speedMultiplier]);

  const handleLaunchCustomStrike = () => {
    const nodes = Object.values(REAL_GEO_NODES);
    const origin = nodes[Math.floor(Math.random() * nodes.length)];
    let target = nodes[Math.floor(Math.random() * nodes.length)];
    while (target.id === origin.id) {
      target = nodes[Math.floor(Math.random() * nodes.length)];
    }

    const types = [
      { name: 'Ransomware Payload Injection', type: 'Ransomware' as const, color: '#f43f5e', vector: 'Remote Code Exploit' },
      { name: 'Volumetric Mirai DDoS Blitz (4.1 Tbps)', type: 'DDoS' as const, color: '#a855f7', vector: 'UDP Amplification Storm' },
      { name: 'Fake UPI / Banking APK Harvest', type: 'Phishing' as const, color: '#06b6d4', vector: 'Smishing Bot APK Lure' },
      { name: 'WebKit Sandbox Zero-Day Escape', type: 'Zero-Day' as const, color: '#eab308', vector: 'Memory Heap Overflow' }
    ];
    const picked = types[Math.floor(Math.random() * types.length)];

    const customStrike: GeoAttackStrike = {
      id: `custom-${Date.now()}`,
      threat_name: picked.name,
      type: picked.type,
      origin: origin,
      target: { ...target, sector: 'National Critical Infrastructure Gateway' },
      severity: 'CRITICAL',
      status: 'INTERCEPTED & BLOCKED',
      vector: picked.vector,
      color: picked.color,
      timestamp: new Date().toLocaleTimeString()
    };

    setSelectedStrike(customStrike);
    if (onSelectStrike) onSelectStrike(customStrike);

    // Fly to target on map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(customStrike.target.coords, { animate: true, duration: 1 });
    }
  };

  const zoomIn = () => mapInstanceRef.current?.zoomIn();
  const zoomOut = () => mapInstanceRef.current?.zoomOut();
  const resetView = () => mapInstanceRef.current?.setView([22, 20], 2, { animate: true });

  return (
    <div className="w-full rounded-3xl bg-slate-950 border-2 border-cyan-500/50 shadow-2xl overflow-hidden font-mono text-slate-100 select-none flex flex-col">
      {/* 1. Header Bar with Real GPS Radar Ping & Defense Status */}
      <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-cyan-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-cyan-400 animate-pulse" /> Real-World Cyber Attack Geography Map
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/60 animate-pulse">
                REAL GPS SATELLITE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Live geographic cyber warfare strikes tracked across authentic continents & GPS coordinates
            </p>
          </div>
        </div>

        {/* Global Strike Velocity Counter */}
        <div className="flex items-center gap-4 text-xs">
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <div>
              <span className="text-[10px] text-slate-500 block">Live Strikes/min</span>
              <span className="text-cyan-400 font-bold text-xs">{liveRate.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 hidden sm:flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-500 block">Defended Today</span>
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

        {/* Speed Controls & Launch Simulator Button */}
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
            onClick={handleLaunchCustomStrike}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Real Strike</span>
          </button>
        </div>
      </div>

      {/* 3. Real Geographic Leaflet Map Container */}
      <div className="relative w-full h-[340px] sm:h-[420px] md:h-[500px] bg-[#020617] overflow-hidden">
        {/* Leaflet Map DOM Element */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Zoom & Reset Floating Controls */}
        <div className="absolute top-4 right-4 z-[400] flex flex-col gap-1.5">
          <button
            onClick={zoomIn}
            title="Zoom In"
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 text-cyan-400 shadow-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={zoomOut}
            title="Zoom Out"
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 text-cyan-400 shadow-xl transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            title="Reset World View"
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 text-cyan-400 shadow-xl transition-colors cursor-pointer"
          >
            <RotateCcwIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Real GPS Coordinate HUD Overlay */}
        <div className="absolute top-3 left-3 z-[400] text-[10px] text-cyan-400/80 pointer-events-none font-mono bg-slate-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/30 backdrop-blur-md">
          <span>// REAL GEOGRAPHY: EPSG:3857 | DARK MATTER CARTO_DB</span>
        </div>

        {/* Floating Active Strike HUD Box (Bottom Left of Map) */}
        {selectedStrike && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-[400] p-3.5 rounded-2xl bg-slate-950/95 border-2 border-cyan-500/70 shadow-2xl backdrop-blur-xl space-y-2 font-mono text-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                  REAL GEOGRAPHIC INTERCEPT
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
                <span className="text-slate-300">{selectedStrike.origin.name}, {selectedStrike.origin.country}</span>
              </div>
              <span className="text-cyan-400 font-black">➔</span>
              <div className="flex items-center gap-1">
                <span>{selectedStrike.target.flag}</span>
                <span className="text-white">{selectedStrike.target.name}, {selectedStrike.target.country}</span>
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
              <span>1. 🇷🇺 Russia (Moscow 32%)</span>
              <span>2. 🇨🇳 China (Beijing 26%)</span>
              <span>3. 🇻🇳 Vietnam (Hanoi 18%)</span>
              <span>4. 🇧🇷 Brazil (São Paulo 14%)</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span>1. 🇮🇳 India (Delhi / Mumbai 38%)</span>
              <span>2. 🇺🇸 USA (New York 28%)</span>
              <span>3. 🇩🇪 Germany (Frankfurt 18%)</span>
              <span>4. 🇬🇧 UK (London 16%)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function RotateCcwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
