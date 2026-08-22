import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Globe,
  Zap,
  Target,
  Shield,
  Filter,
  Plus,
  Minus,
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
  port?: number;
}

const REAL_GEO_NODES: Record<string, GeoAttackNode> = {
  US: { id: 'US', name: 'United States', country: 'United States', code: 'US', flag: '🇺🇸', coords: [38.0, -97.0], sent: 18200, blocked: 168400, threat_level: 'HIGH' },
  PT: { id: 'PT', name: 'Portugal', country: 'Portugal', code: 'PT', flag: '🇵🇹', coords: [39.5, -8.0], sent: 4200, blocked: 38400, threat_level: 'MEDIUM' },
  TR: { id: 'TR', name: 'Türkiye', country: 'Türkiye', code: 'TR', flag: '🇹🇷', coords: [39.0, 35.0], sent: 14200, blocked: 58200, threat_level: 'HIGH' },
  IL: { id: 'IL', name: 'Israel', country: 'Israel', code: 'IL', flag: '🇮🇱', coords: [31.5, 35.0], sent: 31400, blocked: 44100, threat_level: 'CRITICAL' },
  RU: { id: 'RU', name: 'Russia', country: 'Russia', code: 'RU', flag: '🇷🇺', coords: [55.75, 37.6], sent: 88900, blocked: 18200, threat_level: 'CRITICAL' },
  IN: { id: 'IN', name: 'India', country: 'India', code: 'IN', flag: '🇮🇳', coords: [21.0, 78.0], sent: 9100, blocked: 182000, threat_level: 'HIGH' },
  CN: { id: 'CN', name: 'China', country: 'China', code: 'CN', flag: '🇨🇳', coords: [35.0, 104.0], sent: 98400, blocked: 41400, threat_level: 'CRITICAL' },
  DE: { id: 'DE', name: 'Germany', country: 'Germany', code: 'DE', flag: '🇩🇪', coords: [51.0, 10.0], sent: 13200, blocked: 98400, threat_level: 'MEDIUM' },
  GB: { id: 'GB', name: 'United Kingdom', country: 'United Kingdom', code: 'GB', flag: '🇬🇧', coords: [54.0, -2.0], sent: 11400, blocked: 119200, threat_level: 'HIGH' },
  JP: { id: 'JP', name: 'Japan', country: 'Japan', code: 'JP', flag: '🇯🇵', coords: [36.0, 138.0], sent: 7100, blocked: 94400, threat_level: 'HIGH' },
  BR: { id: 'BR', name: 'Brazil', country: 'Brazil', code: 'BR', flag: '🇧🇷', coords: [-14.0, -51.0], sent: 39800, blocked: 24400, threat_level: 'HIGH' },
  NG: { id: 'NG', name: 'Nigeria', country: 'Nigeria', code: 'NG', flag: '🇳🇬', coords: [9.0, 8.0], sent: 42200, blocked: 6800, threat_level: 'HIGH' },
  SG: { id: 'SG', name: 'Singapore', country: 'Singapore', code: 'SG', flag: '🇸🇬', coords: [1.35, 103.8], sent: 9200, blocked: 88400, threat_level: 'MEDIUM' },
  AU: { id: 'AU', name: 'Australia', country: 'Australia', code: 'AU', flag: '🇦🇺', coords: [-25.0, 134.0], sent: 6100, blocked: 64200, threat_level: 'MEDIUM' },
  AE: { id: 'AE', name: 'UAE', country: 'UAE', code: 'AE', flag: '🇦🇪', coords: [24.0, 54.0], sent: 23800, blocked: 54200, threat_level: 'MEDIUM' },
  VN: { id: 'VN', name: 'Vietnam', country: 'Vietnam', code: 'VN', flag: '🇻🇳', coords: [21.0, 105.8], sent: 48200, blocked: 8100, threat_level: 'HIGH' }
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

function getArcPolyline(p1: [number, number], p2: [number, number], pointsCount: number = 36): [number, number][] {
  const [lat1, lng1] = p1;
  const [lat2, lng2] = p2;
  const points: [number, number][] = [];

  const midLat = (lat1 + lat2) / 2;
  const dist = Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
  const arcElevation = Math.min(22, Math.max(6, dist * 0.18));

  for (let i = 0; i <= pointsCount; i++) {
    const t = i / pointsCount;
    const lat = (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * (midLat + arcElevation) + t * t * lat2;
    const lng = (1 - t) * lng1 + t * lng2;
    points.push([lat, lng]);
  }
  return points;
}

// Calculate angle (bearing in degrees) from p1 to p2
function calculateBearing(p1: [number, number], p2: [number, number]): number {
  const lat1 = (p1[0] * Math.PI) / 180;
  const lat2 = (p2[0] * Math.PI) / 180;
  const dLng = ((p2[1] - p1[1]) * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

export const GlobalAttackMap: React.FC<{ onSelectStrike?: (strike: any) => void }> = ({ onSelectStrike }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const strikeLayersGroupRef = useRef<L.LayerGroup | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [activeStrikesPool, setActiveStrikesPool] = useState<GeoAttackStrike[]>(BASE_GEO_STRIKES.slice(0, 5));
  const [selectedStrike, setSelectedStrike] = useState<GeoAttackStrike>(BASE_GEO_STRIKES[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [liveRate, setLiveRate] = useState<number>(18780);
  const [totalIntercepted, setTotalIntercepted] = useState<number>(1498990);
  const [activeLeaderboard, setActiveLeaderboard] = useState<'origins' | 'targets'>('origins');

  const [terminalLogs, setTerminalLogs] = useState<Array<{ id: string; text: string; type: string; time: string }>>([
    { id: '1', text: 'INTERCEPT: Lockbit 3.0 (US ➔ TR) blocked on Port 3389 RDP', type: 'amber', time: '13:07:10' },
    { id: '2', text: 'DEFENSE: Banking Gateway Probe (PT ➔ IL) intercepted', type: 'amber', time: '13:07:12' },
    { id: '3', text: 'MITIGATE: Caspian SCADA Flood (RU ➔ TR) rate-limited', type: 'amber', time: '13:07:14' },
    { id: '4', text: 'DEFENSE: Fake UPI APK (VN ➔ IN) blocked at switch', type: 'cyan', time: '13:07:16' }
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

  // Initialize Real Geographical Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [30, 20],
        zoom: 2,
        minZoom: 2,
        maxZoom: 9,
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

  // Update Location Pins & Directional Arrow Trajectories
  useEffect(() => {
    if (!mapInstanceRef.current || !strikeLayersGroupRef.current) return;

    const group = strikeLayersGroupRef.current;
    group.clearLayers();

    // 1. Plot all Location Pins with dynamic ATTACK ORIGIN vs TARGET HIT badges!
    Object.values(REAL_GEO_NODES).forEach((node) => {
      const isOrigin = selectedStrike.origin.id === node.id;
      const isTarget = selectedStrike.target.id === node.id;

      const markerIcon = L.divIcon({
        className: 'custom-teardrop-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;">
            <!-- Concentric Radar Rings -->
            <span style="position: absolute; bottom: 0; width: ${isOrigin || isTarget ? '32px' : '22px'}; height: ${isOrigin || isTarget ? '32px' : '22px'}; border-radius: 50%; border: ${isOrigin ? '2px solid #ef4444' : isTarget ? '2px solid #06b6d4' : '1.5px solid #f59e0b'}; opacity: 0.7; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>

            <!-- Direction Role Pinpoint Badge (ORIGIN vs TARGET) -->
            ${isOrigin ? `
              <span style="background: #991b1b; color: #fecaca; border: 1px solid #ef4444; font-family: monospace; font-size: 8px; font-weight: 900; padding: 1px 4px; border-radius: 4px; margin-bottom: 2px; text-transform: uppercase; white-space: nowrap; box-shadow: 0 0 8px #ef4444;">
                🚀 ATTACK ORIGIN
              </span>
            ` : isTarget ? `
              <span style="background: #083344; color: #a5f3fc; border: 1px solid #06b6d4; font-family: monospace; font-size: 8px; font-weight: 900; padding: 1px 4px; border-radius: 4px; margin-bottom: 2px; text-transform: uppercase; white-space: nowrap; box-shadow: 0 0 8px #06b6d4;">
                🎯 TARGET DEFENSE
              </span>
            ` : ''}

            <!-- Clean Location Text Label Above Pin -->
            <span style="color: #ffffff; font-family: sans-serif; font-size: 11px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.9); margin-bottom: 2px; white-space: nowrap;">
              ${node.name}
            </span>

            <!-- Teardrop Location Pin SVG -->
            <svg width="24" height="30" viewBox="0 0 24 30" fill="none" style="filter: drop-shadow(0 0 8px ${isOrigin ? '#ef4444' : isTarget ? '#06b6d4' : '#f59e0b'});">
              <path d="M12 2C7.58 2 4 5.58 4 10C4 16 12 28 12 28C12 28 20 16 20 10C20 5.58 16.42 2 12 2Z" fill="#0f0f18" stroke="${isOrigin ? '#ef4444' : isTarget ? '#06b6d4' : '#f59e0b'}" stroke-width="2.2"/>
              <circle cx="12" cy="10" r="4" fill="${isOrigin ? '#ef4444' : isTarget ? '#06b6d4' : '#f59e0b'}"/>
            </svg>
          </div>
        `,
        iconSize: [110, 65],
        iconAnchor: [55, 60]
      });

      const marker = L.marker(node.coords, { icon: markerIcon }).addTo(group);
      marker.bindPopup(`
        <div style="font-family: monospace; font-size: 11px; padding: 6px; color: #f8fafc; background: #020617; border-radius: 8px; border: 1px solid #f59e0b;">
          <div style="font-weight: bold; border-bottom: 1px solid #1e293b; padding-bottom: 4px; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between; gap: 6px;">
            <span>${node.flag} ${node.name}</span>
            <span style="color: #f59e0b; font-size: 9px; font-weight: 800;">${node.threat_level}</span>
          </div>
          <div style="color: #34d399; font-size: 10px;">Attacks Defended: <strong>${node.blocked.toLocaleString()}</strong></div>
          <div style="color: #fb7185; font-size: 10px;">Threats Tracked: <strong>${node.sent.toLocaleString()}</strong></div>
          <div style="color: #cbd5e1; font-size: 9px; margin-top: 4px;">GPS: ${node.coords[0].toFixed(2)}°N, ${node.coords[1].toFixed(2)}°E</div>
        </div>
      `, { className: 'custom-dark-popup' });
    });

    // 2. Plot Directional Attack Trajectory Arcs with Arrowheads & Direction Indicators
    const filtered = selectedCategory === 'All'
      ? activeStrikesPool
      : activeStrikesPool.filter((s) => s.type.toLowerCase().includes(selectedCategory.toLowerCase()));

    filtered.forEach((strike) => {
      const arcCoords = getArcPolyline(strike.origin.coords, strike.target.coords, 36);
      const isSelected = selectedStrike.id === strike.id;

      // 1. Underlying Glowing Laser Beam
      const polylineGlow = L.polyline(arcCoords, {
        color: isSelected ? '#f59e0b' : '#f97316',
        weight: isSelected ? 4.8 : 3,
        opacity: isSelected ? 0.98 : 0.75,
        lineCap: 'round'
      }).addTo(group);

      // 2. Crisp Core Attack Line with Directional Dashes
      const polylineCore = L.polyline(arcCoords, {
        color: '#fbbf24',
        weight: isSelected ? 2.6 : 1.8,
        opacity: 1,
        dashArray: isSelected ? undefined : '8, 12',
        lineCap: 'round'
      }).addTo(group);

      const handleClick = () => {
        setSelectedStrike(strike);
        playCyberSound('laser');
        if (onSelectStrike) onSelectStrike(strike);
      };

      polylineGlow.on('click', handleClick);
      polylineCore.on('click', handleClick);

      // 3. Directional Arrowhead Pointer right before the target coordinate
      const lastPoint = arcCoords[arcCoords.length - 2] || strike.origin.coords;
      const targetPoint = strike.target.coords;
      const bearing = calculateBearing(lastPoint, targetPoint);

      const arrowIcon = L.divIcon({
        className: 'custom-arrowhead-marker',
        html: `
          <div style="transform: rotate(${bearing}deg); display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M 4 4 L 20 12 L 4 20 L 8 12 Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.5" style="filter: drop-shadow(0 0 6px #f59e0b);"/>
            </svg>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker(lastPoint, { icon: arrowIcon }).addTo(group);

      // 4. Mid-Flight Direction Indicator (▶▶)
      const midPoint = arcCoords[Math.floor(arcCoords.length / 2)];
      const midBearing = calculateBearing(arcCoords[Math.floor(arcCoords.length / 2) - 1], midPoint);
      const midChevronIcon = L.divIcon({
        className: 'custom-mid-chevron',
        html: `
          <div style="transform: rotate(${midBearing}deg); display: flex; align-items: center; justify-content: center; width: 18px; height: 18px; background: #0f0f18; border-radius: 50%; border: 1px solid #f59e0b; box-shadow: 0 0 6px #f59e0b;">
            <span style="color: #fbbf24; font-size: 9px; font-weight: 900;">▶</span>
          </div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });
      L.marker(midPoint, { icon: midChevronIcon }).addTo(group);

      // 5. Concentric Target Shockwave Rings at Destination
      const impactShockwave = L.circle(strike.target.coords, {
        radius: isSelected ? 380000 : 220000,
        color: '#06b6d4',
        fillColor: '#06b6d4',
        fillOpacity: isSelected ? 0.24 : 0.12,
        weight: isSelected ? 2.5 : 1
      }).addTo(group);

      impactShockwave.on('click', handleClick);
    });
  }, [selectedCategory, selectedStrike, activeStrikesPool]);

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

      // Fly to target on map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(strike.target.coords, 4, { duration: 1.2 });
      }
    }
  };

  const zoomIn = () => mapInstanceRef.current?.zoomIn();
  const zoomOut = () => mapInstanceRef.current?.zoomOut();
  const resetView = () => mapInstanceRef.current?.setView([30, 20], 2, { animate: true });

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
                <Globe className="w-4 h-4 text-amber-400 animate-pulse" /> Real-World Directional Cyber Attack Map
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/60 animate-pulse">
                PINPOINT VECTOR RADAR
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Pinpointing exact strike origins, directional trajectory arrowheads & defended target hubs
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

        {/* Real Strike Scenario Arsenal */}
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

      {/* 3. Real Geographic Leaflet Map with Directional Arrowheads & Origin/Target Pin Badges */}
      <div className={`relative w-full ${isFullscreen ? 'flex-1 min-h-[500px]' : 'h-[360px] sm:h-[440px] md:h-[500px]'} bg-[#020617] overflow-hidden`}>
        {/* Leaflet Map DOM Element */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Explicit Trajectory Direction Banner at Top Center */}
        {selectedStrike && (
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-[400] px-3.5 py-1.5 rounded-2xl bg-slate-950/90 border border-amber-500/50 shadow-2xl backdrop-blur-md flex items-center gap-2.5 font-mono text-xs text-white pointer-events-none">
            <div className="flex items-center gap-1.5 text-rose-400 font-bold">
              <span className="text-sm">{selectedStrike.origin.flag}</span>
              <span>{selectedStrike.origin.name}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-500/40 uppercase">
                ATTACKER
              </span>
            </div>

            <div className="flex items-center gap-1 text-amber-400 font-black">
              <span className="text-xs">════▶</span>
            </div>

            <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
              <span className="text-sm">{selectedStrike.target.flag}</span>
              <span>{selectedStrike.target.name}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 uppercase">
                DEFENDER
              </span>
            </div>
          </div>
        )}

        {/* Zoom & Reset Floating Controls */}
        <div className="absolute top-4 right-4 z-[400] flex flex-col gap-1.5">
          <button
            onClick={zoomIn}
            title="Zoom In"
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 text-amber-400 shadow-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={zoomOut}
            title="Zoom Out"
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 text-amber-400 shadow-xl transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            title="Reset World View"
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 text-amber-400 shadow-xl transition-colors cursor-pointer"
          >
            <RotateCcwIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Active Strike HUD Box (Bottom Left of Map) */}
        {selectedStrike && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-[400] p-3.5 rounded-2xl bg-slate-950/95 border-2 border-amber-500/70 shadow-2xl backdrop-blur-xl space-y-2 font-mono text-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                  PINPOINT INTERCEPT TELEMETRY
                </span>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-600">
                {selectedStrike.type}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold pt-0.5">
              <div className="flex items-center gap-1">
                <span>{selectedStrike.origin.flag}</span>
                <span className="text-rose-400 font-black">{selectedStrike.origin.name} (ATTACKER)</span>
              </div>
              <span className="text-amber-400 font-black">➔</span>
              <div className="flex items-center gap-1">
                <span>{selectedStrike.target.flag}</span>
                <span className="text-cyan-300 font-black">{selectedStrike.target.name} (TARGET)</span>
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
            <Radio className="w-3 h-3 text-amber-400 animate-pulse" /> PINPOINT SATELLITE RADAR
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
