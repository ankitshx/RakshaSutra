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
  apt_group?: string;
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
  IN_DELHI: { id: 'IN_DELHI', name: 'New Delhi', country: 'India', code: 'IN', flag: '🇮🇳', coords: [28.6139, 77.2090], sent: 8400, blocked: 158400, threat_level: 'HIGH', apt_group: 'National Cyber Defense Command (CERT-In)' },
  IN_MUMBAI: { id: 'IN_MUMBAI', name: 'Mumbai', country: 'India', code: 'IN', flag: '🇮🇳', coords: [19.0760, 72.8777], sent: 9100, blocked: 182000, threat_level: 'HIGH', apt_group: 'UPI Gateway SOC & NPCI Shield' },
  IN_BLR: { id: 'IN_BLR', name: 'Bengaluru', country: 'India', code: 'IN', flag: '🇮🇳', coords: [12.9716, 77.5946], sent: 5400, blocked: 114000, threat_level: 'HIGH', apt_group: 'Tech Innovation & Cloud SOC' },
  US_NY: { id: 'US_NY', name: 'New York', country: 'United States', code: 'US', flag: '🇺🇸', coords: [40.7128, -74.0060], sent: 16200, blocked: 138400, threat_level: 'HIGH', apt_group: 'Wall St Financial Exchange Node' },
  US_SF: { id: 'US_SF', name: 'Silicon Valley', country: 'United States', code: 'US', flag: '🇺🇸', coords: [37.7749, -122.4194], sent: 14500, blocked: 144200, threat_level: 'HIGH', apt_group: 'Cloud Edge Global Backbone' },
  US_DC: { id: 'US_DC', name: 'Washington D.C.', country: 'United States', code: 'US', flag: '🇺🇸', coords: [38.9072, -77.0369], sent: 18200, blocked: 168400, threat_level: 'CRITICAL', apt_group: 'CISA National Threat Ops' },
  RU_MOSCOW: { id: 'RU_MOSCOW', name: 'Moscow', country: 'Russia', code: 'RU', flag: '🇷🇺', coords: [55.7558, 37.6173], sent: 88900, blocked: 18200, threat_level: 'CRITICAL', apt_group: 'APT28 / Sandworm / Lockbit Hive' },
  VN_HANOI: { id: 'VN_HANOI', name: 'Hanoi', country: 'Vietnam', code: 'VN', flag: '🇻🇳', coords: [21.0285, 105.8542], sent: 48200, blocked: 8100, threat_level: 'HIGH', apt_group: 'APT32 / OceanLotus Cell' },
  BR_SP: { id: 'BR_SP', name: 'São Paulo', country: 'Brazil', code: 'BR', flag: '🇧🇷', coords: [-23.5505, -46.6333], sent: 39800, blocked: 24400, threat_level: 'HIGH', apt_group: 'Mirai Botnet Syndicate v6' },
  DE_FRA: { id: 'DE_FRA', name: 'Frankfurt', country: 'Germany', code: 'DE', flag: '🇩🇪', coords: [50.1109, 8.6821], sent: 13200, blocked: 98400, threat_level: 'MEDIUM', apt_group: 'DE-CIX Internet Core Node' },
  GB_LON: { id: 'GB_LON', name: 'London', country: 'United Kingdom', code: 'GB', flag: '🇬🇧', coords: [51.5074, -0.1278], sent: 11400, blocked: 119200, threat_level: 'HIGH', apt_group: 'NCSC Strategic Cyber Command' },
  IL_TLV: { id: 'IL_TLV', name: 'Tel Aviv', country: 'Israel', code: 'IL', flag: '🇮🇱', coords: [32.0853, 34.7818], sent: 31400, blocked: 44100, threat_level: 'CRITICAL', apt_group: 'Unit 8200 & Exploit Research' },
  CN_BEI: { id: 'CN_BEI', name: 'Beijing', country: 'China', code: 'CN', flag: '🇨🇳', coords: [39.9042, 116.4074], sent: 98400, blocked: 41400, threat_level: 'CRITICAL', apt_group: 'APT41 / Volt Typhoon / RedAlpha' },
  JP_TYO: { id: 'JP_TYO', name: 'Tokyo', country: 'Japan', code: 'JP', flag: '🇯🇵', coords: [35.6762, 139.6503], sent: 7100, blocked: 94400, threat_level: 'HIGH', apt_group: 'NISC Cyber Taskforce' },
  NG_LOS: { id: 'NG_LOS', name: 'Lagos', country: 'Nigeria', code: 'NG', flag: '🇳🇬', coords: [6.5244, 3.3792], sent: 42200, blocked: 6800, threat_level: 'HIGH', apt_group: 'SilverTerrier / BEC Syndicate' },
  SG_SIN: { id: 'SG_SIN', name: 'Singapore', country: 'Singapore', code: 'SG', flag: '🇸🇬', coords: [1.3521, 103.8198], sent: 9200, blocked: 88400, threat_level: 'MEDIUM', apt_group: 'ASEAN Cyber Defense Gateway' },
  AU_SYD: { id: 'AU_SYD', name: 'Sydney', country: 'Australia', code: 'AU', flag: '🇦🇺', coords: [-33.8688, 151.2093], sent: 6100, blocked: 64200, threat_level: 'MEDIUM', apt_group: 'ASD Cyber Security Directorate' },
  AE_DXB: { id: 'AE_DXB', name: 'Dubai', country: 'UAE', code: 'AE', flag: '🇦🇪', coords: [25.2048, 55.2708], sent: 23800, blocked: 54200, threat_level: 'MEDIUM', apt_group: 'Middle East FinTech Shield' },
  CA_TOR: { id: 'CA_TOR', name: 'Toronto', country: 'Canada', code: 'CA', flag: '🇨🇦', coords: [43.6532, -79.3832], sent: 8400, blocked: 69200, threat_level: 'MEDIUM', apt_group: 'CCCS Critical Cyber Node' },
  ZA_JNB: { id: 'ZA_JNB', name: 'Johannesburg', country: 'South Africa', code: 'ZA', flag: '🇿🇦', coords: [-26.2041, 28.0473], sent: 13800, blocked: 34100, threat_level: 'MEDIUM', apt_group: 'Pan-African Threat Ops' },
  KR_SEO: { id: 'KR_SEO', name: 'Seoul', country: 'South Korea', code: 'KR', flag: '🇰🇷', coords: [37.5665, 126.9780], sent: 11800, blocked: 89200, threat_level: 'HIGH', apt_group: 'KISA National Cyber Center' },
  FR_PAR: { id: 'FR_PAR', name: 'Paris', country: 'France', code: 'FR', flag: '🇫🇷', coords: [48.8566, 2.3522], sent: 11100, blocked: 78100, threat_level: 'MEDIUM', apt_group: 'ANSSI Strategic Defense' }
};

const EXPANDED_GEO_STRIKES: GeoAttackStrike[] = [
  {
    id: 'atk-real-1',
    threat_name: 'Lockbit 3.0 Ransomware Surge',
    type: 'Ransomware',
    origin: REAL_GEO_NODES.RU_MOSCOW,
    target: { ...REAL_GEO_NODES.US_NY, sector: 'Hospital Core & Healthcare DBs' },
    severity: 'CRITICAL',
    status: 'BLOCKED BY DEFENSE',
    vector: 'RDP Port 3389 Exploit (CVE-2024-21413)',
    color: '#f43f5e',
    timestamp: 'Just now',
    port: 3389
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
    timestamp: '1s ago',
    port: 443
  },
  {
    id: 'atk-real-3',
    threat_name: 'Mirai IoT DDoS Blitz (4.2 Tbps)',
    type: 'DDoS',
    origin: REAL_GEO_NODES.BR_SP,
    target: { ...REAL_GEO_NODES.DE_FRA, sector: 'Tier-1 Edge DNS Backbone' },
    severity: 'HIGH',
    status: 'MITIGATED',
    vector: 'SYN-Flood UDP 53 Amplification',
    color: '#a855f7',
    timestamp: '2s ago',
    port: 53
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
    timestamp: '3s ago',
    port: 8443
  },
  {
    id: 'atk-real-5',
    threat_name: 'Lumma Infostealer Payload Drop',
    type: 'Infostealer',
    origin: REAL_GEO_NODES.CN_BEI,
    target: { ...REAL_GEO_NODES.JP_TYO, sector: 'Semiconductor Fabrication Labs' },
    severity: 'CRITICAL',
    status: 'BLOCKED BY DEFENSE',
    vector: 'Spear-Phishing PDF Macro Dropper',
    color: '#f43f5e',
    timestamp: '4s ago',
    port: 8080
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
    timestamp: '5s ago',
    port: 5060
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
    timestamp: '6s ago',
    port: 4444
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
    timestamp: '7s ago',
    port: 443
  },
  {
    id: 'atk-real-9',
    threat_name: 'Banking OTP Intercept & SMS Forwarder',
    type: 'Phishing',
    origin: REAL_GEO_NODES.CN_BEI,
    target: { ...REAL_GEO_NODES.IN_DELHI, sector: 'National Banking Switch (NPCI)' },
    severity: 'HIGH',
    status: 'BLOCKED BY DEFENSE',
    vector: 'Trojanized Fake Income Tax APK',
    color: '#06b6d4',
    timestamp: '8s ago',
    port: 80
  },
  {
    id: 'atk-real-10',
    threat_name: 'Volt Typhoon Critical Infrastructure Probe',
    type: 'C2 Malware',
    origin: REAL_GEO_NODES.CN_BEI,
    target: { ...REAL_GEO_NODES.US_DC, sector: 'Federal Water & Energy Grid' },
    severity: 'CRITICAL',
    status: 'BLOCKED BY DEFENSE',
    vector: 'Living-off-the-Land WMI / PowerShell Injection',
    color: '#f43f5e',
    timestamp: '9s ago',
    port: 5985
  },
  {
    id: 'atk-real-11',
    threat_name: 'BlackCat / ALPHV Double Extortion',
    type: 'Ransomware',
    origin: REAL_GEO_NODES.RU_MOSCOW,
    target: { ...REAL_GEO_NODES.FR_PAR, sector: 'Aviation & Airport Logistics' },
    severity: 'CRITICAL',
    status: 'MITIGATED',
    vector: 'Zero-Day VPN Gateway Penetration',
    color: '#f43f5e',
    timestamp: '10s ago',
    port: 1194
  },
  {
    id: 'atk-real-12',
    threat_name: 'Aadhaar / KYC Credential Harvester',
    type: 'Phishing',
    origin: REAL_GEO_NODES.NG_LOS,
    target: { ...REAL_GEO_NODES.IN_BLR, sector: 'E-Governance & Aadhaar Portal' },
    severity: 'HIGH',
    status: 'INTERCEPTED',
    vector: 'Phishing Lure via Telegram Bot Ring',
    color: '#06b6d4',
    timestamp: '11s ago',
    port: 443
  },
  {
    id: 'atk-real-13',
    threat_name: 'Lazarus Group Crypto Drainer Wave',
    type: 'Zero-Day',
    origin: REAL_GEO_NODES.KR_SEO,
    target: { ...REAL_GEO_NODES.US_SF, sector: 'Decentralized Smart Contract Bridges' },
    severity: 'CRITICAL',
    status: 'BLOCKED BY DEFENSE',
    vector: 'Malicious npm Package Supply Chain',
    color: '#eab308',
    timestamp: '12s ago',
    port: 8545
  },
  {
    id: 'atk-real-14',
    threat_name: 'Substation SCADA Modbus Flooder',
    type: 'DDoS',
    origin: REAL_GEO_NODES.RU_MOSCOW,
    target: { ...REAL_GEO_NODES.IN_DELHI, sector: 'Northern Power Transmission Grid' },
    severity: 'CRITICAL',
    status: 'BLOCKED BY DEFENSE',
    vector: 'Modbus TCP Port 502 Exploitation',
    color: '#a855f7',
    timestamp: '13s ago',
    port: 502
  }
];

function getArcPolyline(p1: [number, number], p2: [number, number], pointsCount: number = 36): [number, number][] {
  const [lat1, lng1] = p1;
  const [lat2, lng2] = p2;
  const points: [number, number][] = [];

  const midLat = (lat1 + lat2) / 2;
  const dist = Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
  const arcElevation = Math.min(26, Math.max(9, dist * 0.22));

  for (let i = 0; i <= pointsCount; i++) {
    const t = i / pointsCount;
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
  const audioContextRef = useRef<AudioContext | null>(null);

  const [activeStrikesPool, setActiveStrikesPool] = useState<GeoAttackStrike[]>(EXPANDED_GEO_STRIKES.slice(0, 8));
  const [selectedStrike, setSelectedStrike] = useState<GeoAttackStrike>(EXPANDED_GEO_STRIKES[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [liveRate, setLiveRate] = useState<number>(18720);
  const [totalIntercepted, setTotalIntercepted] = useState<number>(1498850);
  const [activeLeaderboard, setActiveLeaderboard] = useState<'origins' | 'targets'>('origins');
  const [terminalLogs, setTerminalLogs] = useState<Array<{ id: string; text: string; type: string; time: string }>>([
    { id: '1', text: 'INTERCEPT: Lockbit 3.0 (RU ➔ US) blocked on Port 3389 RDP', type: 'rose', time: '12:57:10' },
    { id: '2', text: 'DEFENSE: Fake UPI APK (VN ➔ IN) intercepted at gateway', type: 'cyan', time: '12:57:12' },
    { id: '3', text: 'MITIGATE: Mirai DDoS 4.2 Tbps (BR ➔ DE) UDP rate-limited', type: 'purple', time: '12:57:14' },
    { id: '4', text: 'AUDIT: WebKit Zero-Day (IL ➔ GB) isolated by sandbox', type: 'amber', time: '12:57:16' }
  ]);

  // Audio synthesizer engine for cyber sound effects
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
      // audio handled gracefully
    }
  };

  // Initialize Real Geographical Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [22, 20],
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

      // Plot all Real Geographical Defense & Threat Nodes
      Object.values(REAL_GEO_NODES).forEach((node) => {
        const isCritical = node.threat_level === 'CRITICAL';
        const nodeColor = isCritical ? '#f43f5e' : '#06b6d4';

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
          <div style="font-family: monospace; font-size: 11px; padding: 6px; color: #f8fafc; background: #020617; border-radius: 8px; border: 1px solid #06b6d4;">
            <div style="font-weight: bold; border-bottom: 1px solid #1e293b; padding-bottom: 4px; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between; gap: 6px;">
              <span>${node.flag} ${node.name}, ${node.country}</span>
              <span style="color: ${nodeColor}; font-size: 9px; font-weight: 800;">${node.threat_level}</span>
            </div>
            <div style="color: #94a3b8; font-size: 10px;">SOC Unit: <strong style="color: #38bdf8">${node.apt_group || 'Active Command Node'}</strong></div>
            <div style="color: #34d399; font-size: 10px;">Attacks Defended: <strong>${node.blocked.toLocaleString()}</strong></div>
            <div style="color: #fb7185; font-size: 10px;">Threats Tracked: <strong>${node.sent.toLocaleString()}</strong></div>
            <div style="color: #cbd5e1; font-size: 9px; margin-top: 4px;">GPS: ${node.coords[0].toFixed(2)}°N, ${node.coords[1].toFixed(2)}°E</div>
          </div>
        `, { className: 'custom-dark-popup' });
      });

      mapInstanceRef.current = map;
    }
  }, []);

  // Re-render Active Laser Arcs on the Real Map
  useEffect(() => {
    if (!mapInstanceRef.current || !strikeLayersGroupRef.current) return;

    const group = strikeLayersGroupRef.current;
    group.clearLayers();

    const filtered = selectedCategory === 'All'
      ? activeStrikesPool
      : activeStrikesPool.filter((s) => s.type.toLowerCase().includes(selectedCategory.toLowerCase()));

    filtered.forEach((strike) => {
      const arcCoords = getArcPolyline(strike.origin.coords, strike.target.coords, 35);
      const isSelected = selectedStrike.id === strike.id;

      // 1. Curved Missile / Laser Trajectory Polyline
      const polyline = L.polyline(arcCoords, {
        color: strike.color,
        weight: isSelected ? 3.8 : 2.2,
        opacity: isSelected ? 0.98 : 0.7,
        dashArray: isSelected ? undefined : '6, 8',
        lineCap: 'round'
      }).addTo(group);

      polyline.on('click', () => {
        setSelectedStrike(strike);
        playCyberSound('laser');
        if (onSelectStrike) onSelectStrike(strike);
      });

      // 2. Target Impact Shockwave Ring
      const impactShockwave = L.circle(strike.target.coords, {
        radius: isSelected ? 400000 : 250000,
        color: strike.color,
        fillColor: strike.color,
        fillOpacity: isSelected ? 0.28 : 0.15,
        weight: isSelected ? 2.5 : 1.2
      }).addTo(group);

      impactShockwave.on('click', () => {
        setSelectedStrike(strike);
        playCyberSound('shield');
        if (onSelectStrike) onSelectStrike(strike);
      });
    });
  }, [selectedCategory, selectedStrike, activeStrikesPool]);

  // Continuous multi-strike stream generator
  useEffect(() => {
    const timer = setInterval(() => {
      // Pick 6-8 strikes randomly from the expanded pool
      const shuffled = [...EXPANDED_GEO_STRIKES].sort(() => 0.5 - Math.random());
      const nextBatch = shuffled.slice(0, 8);
      setActiveStrikesPool(nextBatch);

      const focusOne = nextBatch[0];
      setSelectedStrike(focusOne);
      setLiveRate((r) => r + Math.floor(Math.random() * 11) - 5);
      setTotalIntercepted((t) => t + Math.floor(Math.random() * 3) + 1);

      playCyberSound('shield');
      const nowStr = new Date().toLocaleTimeString();
      const logText = `DEFENSE: ${focusOne.threat_name} (${focusOne.origin.code} ➔ ${focusOne.target.code}) - ${focusOne.status}`;
      setTerminalLogs((prev) => [
        { id: `log-${Date.now()}`, text: logText, type: focusOne.severity === 'CRITICAL' ? 'rose' : 'cyan', time: nowStr },
        ...prev.slice(0, 5)
      ]);
    }, 2400 / speedMultiplier);

    return () => clearInterval(timer);
  }, [speedMultiplier, soundEnabled]);

  // 1. Launch Salvo Burst (Simulates 5 concurrent cyber attacks)
  const handleLaunchSalvo = () => {
    playCyberSound('salvo');
    const shuffled = [...EXPANDED_GEO_STRIKES].sort(() => 0.5 - Math.random());
    const salvoStrikes = shuffled.slice(0, 6);
    setActiveStrikesPool(salvoStrikes);
    setSelectedStrike(salvoStrikes[0]);
    setLiveRate((r) => r + 45);
    setTotalIntercepted((t) => t + 6);

    const nowStr = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [
      { id: `salvo-${Date.now()}`, text: `🚨 SALVO BURST DETECTED: 6 multi-vector strikes intercepted simultaneously across global defense nodes!`, type: 'rose', time: nowStr },
      ...prev.slice(0, 5)
    ]);
  };

  // 2. Launch Specific Attack Scenario
  const launchScenario = (scenarioKey: 'UPI' | 'LOCKBIT' | 'DDOS' | 'ZERODAY' | 'AI_VOICE') => {
    let strike: GeoAttackStrike | undefined;
    if (scenarioKey === 'UPI') {
      strike = EXPANDED_GEO_STRIKES.find(s => s.id === 'atk-real-2');
    } else if (scenarioKey === 'LOCKBIT') {
      strike = EXPANDED_GEO_STRIKES.find(s => s.id === 'atk-real-1');
    } else if (scenarioKey === 'DDOS') {
      strike = EXPANDED_GEO_STRIKES.find(s => s.id === 'atk-real-3');
    } else if (scenarioKey === 'ZERODAY') {
      strike = EXPANDED_GEO_STRIKES.find(s => s.id === 'atk-real-4');
    } else if (scenarioKey === 'AI_VOICE') {
      strike = EXPANDED_GEO_STRIKES.find(s => s.id === 'atk-real-6');
    }

    if (strike) {
      setActiveStrikesPool((prev) => [strike!, ...prev.slice(0, 7)]);
      setSelectedStrike(strike);
      playCyberSound('laser');
      if (onSelectStrike) onSelectStrike(strike);

      // Smooth camera pan to target GPS
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(strike.target.coords, 4, { duration: 1.2 });
      }
    }
  };

  const focusCity = (nodeKey: string) => {
    const node = REAL_GEO_NODES[nodeKey];
    if (node && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(node.coords, 5, { duration: 1.2 });
    }
  };

  const zoomIn = () => mapInstanceRef.current?.zoomIn();
  const zoomOut = () => mapInstanceRef.current?.zoomOut();
  const resetView = () => mapInstanceRef.current?.setView([22, 20], 2, { animate: true });

  return (
    <div className={`w-full rounded-3xl bg-slate-950 border-2 border-cyan-500/50 shadow-2xl overflow-hidden font-mono text-slate-100 select-none flex flex-col transition-all duration-300 ${
      isFullscreen ? 'fixed inset-4 z-[9999] shadow-2xl bg-slate-950' : 'relative'
    }`}>
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
              Live multi-vector cyber warfare strikes tracked across authentic continents & GPS coordinates
            </p>
          </div>
        </div>

        {/* Global Strike Velocity Counter & Sound / Fullscreen Controls */}
        <div className="flex items-center gap-3 text-xs">
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

          {/* Sound FX Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute Cyber Audio FX' : 'Enable Cyber Audio FX'}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/60' : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-white'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fullscreen Expand Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Theater Mode' : 'Expand SOC Theater Mode'}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Interactive Map Tool Controls & Attack Scenario Arsenal */}
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

        {/* Real Strike Scenario Arsenal */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[10px]">
          <span className="text-slate-500 font-bold hidden sm:inline">Scenario:</span>
          <button
            onClick={handleLaunchSalvo}
            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-wider shadow-md transition-all flex items-center gap-1 cursor-pointer"
          >
            <Flame className="w-3 h-3 animate-pulse" />
            <span>Salvo Blitz (6 Strikes)</span>
          </button>
          <button
            onClick={() => launchScenario('UPI')}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 border border-cyan-500/40 font-bold transition-all cursor-pointer"
          >
            🇮🇳 UPI Trojan
          </button>
          <button
            onClick={() => launchScenario('LOCKBIT')}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-rose-500 hover:text-slate-950 text-rose-400 border border-rose-500/40 font-bold transition-all cursor-pointer"
          >
            🏥 Lockbit 3.0
          </button>
          <button
            onClick={() => launchScenario('DDOS')}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-purple-500 hover:text-slate-950 text-purple-400 border border-purple-500/40 font-bold transition-all cursor-pointer"
          >
            ⚡ 4.2 Tbps DDoS
          </button>
          <button
            onClick={() => launchScenario('ZERODAY')}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-amber-500/40 font-bold transition-all cursor-pointer"
          >
            📱 Zero-Day
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
                  speedMultiplier === spd ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Real Geographic Leaflet Map Container */}
      <div className={`relative w-full ${isFullscreen ? 'flex-1 min-h-[500px]' : 'h-[360px] sm:h-[440px] md:h-[520px]'} bg-[#020617] overflow-hidden`}>
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
        <div className="absolute top-3 left-3 z-[400] text-[10px] text-cyan-400/90 pointer-events-none font-mono bg-slate-950/85 px-2.5 py-1 rounded-lg border border-cyan-500/30 backdrop-blur-md flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>REAL CARTOGRAPHY // MULTI-VECTOR SATELLITE INTERCEPT ENGINE</span>
        </div>

        {/* Quick Regional Focus Bottom-Right Buttons */}
        <div className="absolute top-14 left-3 z-[400] flex flex-col gap-1 text-[10px]">
          <button onClick={() => focusCity('IN_MUMBAI')} className="px-2 py-1 rounded-lg bg-slate-950/90 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/40 text-cyan-300 font-bold backdrop-blur-md transition-all cursor-pointer">
            🇮🇳 India SOC
          </button>
          <button onClick={() => focusCity('US_NY')} className="px-2 py-1 rounded-lg bg-slate-950/90 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/40 text-cyan-300 font-bold backdrop-blur-md transition-all cursor-pointer">
            🇺🇸 USA Hub
          </button>
          <button onClick={() => focusCity('RU_MOSCOW')} className="px-2 py-1 rounded-lg bg-slate-950/90 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/40 text-cyan-300 font-bold backdrop-blur-md transition-all cursor-pointer">
            🇷🇺 Russia
          </button>
          <button onClick={() => focusCity('DE_FRA')} className="px-2 py-1 rounded-lg bg-slate-950/90 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/40 text-cyan-300 font-bold backdrop-blur-md transition-all cursor-pointer">
            🇪🇺 Europe
          </button>
          <button onClick={() => focusCity('CN_BEI')} className="px-2 py-1 rounded-lg bg-slate-950/90 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/40 text-cyan-300 font-bold backdrop-blur-md transition-all cursor-pointer">
            🇨🇳 China
          </button>
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
              <span className="truncate max-w-[220px]">⚡ Port {selectedStrike.port || 443} • {selectedStrike.vector}</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                ✓ {selectedStrike.status}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Live Cyber Warfare Intercept Terminal Logs */}
      <div className="p-3 bg-slate-950/95 border-t border-slate-800/90 font-mono text-xs space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-900">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold uppercase text-slate-300">Live Global Intercept Telemetry Feed</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> CONTINUOUS STREAMING
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          {terminalLogs.slice(0, 4).map((log) => (
            <div
              key={log.id}
              className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${
                log.type === 'rose'
                  ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                  : log.type === 'purple'
                  ? 'bg-purple-950/40 border-purple-500/30 text-purple-300'
                  : log.type === 'amber'
                  ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                  : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300'
              }`}
            >
              <span className="truncate">{log.text}</span>
              <span className="text-[9px] text-slate-500 shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Leaderboard & Targeted Statistics Footer Tabs */}
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
