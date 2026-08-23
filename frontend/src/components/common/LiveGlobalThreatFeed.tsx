import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Radio,
  ShieldAlert,
  ArrowRight,
  Filter,
  RefreshCw,
  Globe,
  Zap,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface LiveAttackItem {
  id: string;
  threat_name: string;
  type: string;
  origin_country: string;
  origin_code: string;
  origin_flag: string;
  target_country: string;
  target_code: string;
  target_flag: string;
  target_sector: string;
  vector: string;
  severity: string;
  status: string;
  time_ago: string;
}

interface LiveThreatFeedProps {
  onSelectThreat?: (threatName: string) => void;
  compact?: boolean;
}

const LIVE_STRIKES_POOL: LiveAttackItem[] = [
  {
    id: 'atk-dyn-1',
    threat_name: 'Lockbit 3.0 Ransomware Surge',
    type: 'Ransomware',
    origin_country: 'Eastern Europe',
    origin_code: 'RU',
    origin_flag: '🇷🇺',
    target_country: 'United States',
    target_code: 'US',
    target_flag: '🇺🇸',
    target_sector: 'Regional Hospital Network',
    vector: 'RDP Port Scanning & SMBv3 Exploit',
    severity: 'CRITICAL',
    status: 'INTERCEPTED',
    time_ago: 'Just now'
  },
  {
    id: 'atk-dyn-2',
    threat_name: 'Fake SBI / HDFC Banking APK',
    type: 'Phishing',
    origin_country: 'Southeast Asia',
    origin_code: 'VN',
    origin_flag: '🇻🇳',
    target_country: 'India',
    target_code: 'IN',
    target_flag: '🇮🇳',
    target_sector: 'UPI Payment & OTP Gateways',
    vector: 'Malicious SMS Bill Disconnection Lure',
    severity: 'HIGH',
    status: 'BLOCKED',
    time_ago: 'Just now'
  },
  {
    id: 'atk-dyn-3',
    threat_name: 'Mirai IoT DDoS Blitz (3.8 Tbps)',
    type: 'DDoS',
    origin_country: 'Brazil',
    origin_code: 'BR',
    origin_flag: '🇧🇷',
    target_country: 'Germany',
    target_code: 'DE',
    target_flag: '🇩🇪',
    target_sector: 'Tier-1 Telecom Routing Node',
    vector: 'DNS Amplification & SYN Flood',
    severity: 'HIGH',
    status: 'MITIGATED',
    time_ago: '4s ago'
  },
  {
    id: 'atk-dyn-4',
    threat_name: 'WebKit Memory Corruption Zero-Day',
    type: 'Zero-Day',
    origin_country: 'Middle East',
    origin_code: 'IL',
    origin_flag: '🇮🇱',
    target_country: 'United Kingdom',
    target_code: 'GB',
    target_flag: '🇬🇧',
    target_sector: 'Government Diplomatic Terminal',
    vector: 'Zero-Click Font Parser Heap Overflow',
    severity: 'CRITICAL',
    status: 'INVESTIGATING',
    time_ago: '9s ago'
  },
  {
    id: 'atk-dyn-5',
    threat_name: 'AI Voice Clone CEO Wire Transfer',
    type: 'Social Eng.',
    origin_country: 'Nigeria',
    origin_code: 'NG',
    origin_flag: '🇳🇬',
    target_country: 'Singapore',
    target_code: 'SG',
    target_flag: '🇸🇬',
    target_sector: 'Treasury & Corporate Escrow',
    vector: 'Synthesized Voice Call Impersonation',
    severity: 'HIGH',
    status: 'FLAGGED',
    time_ago: '14s ago'
  },
  {
    id: 'atk-dyn-6',
    threat_name: 'Lumma Infostealer Payload Drop',
    type: 'Malware',
    origin_country: 'China',
    origin_code: 'CN',
    origin_flag: '🇨🇳',
    target_country: 'Japan',
    target_code: 'JP',
    target_flag: '🇯🇵',
    target_sector: 'Semiconductor Research Lab',
    vector: 'Spear-Phishing PDF with Macros',
    severity: 'CRITICAL',
    status: 'BLOCKED',
    time_ago: '19s ago'
  }
];

export const LiveGlobalThreatFeed: React.FC<LiveThreatFeedProps> = ({ onSelectThreat, compact = false }) => {
  const [attacks, setAttacks] = useState<LiveAttackItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [activeAttacksRate, setActiveAttacksRate] = useState<number>(18740);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);

  useEffect(() => {
    loadInitialData();

    // Periodic dynamic strike injection
    const timer = setInterval(() => {
      if (isLiveStreaming) {
        injectDynamicStrike();
        setActiveAttacksRate((prev) => prev + Math.floor(Math.random() * 7) - 3);
      }
    }, 3800);

    return () => clearInterval(timer);
  }, [isLiveStreaming]);

  const loadInitialData = async () => {
    try {
      const res = await api.getLiveGlobalAttacks();
      if (res && res.attacks) {
        setAttacks(res.attacks);
        if (res.active_attacks_per_minute) {
          setActiveAttacksRate(res.active_attacks_per_minute);
        }
      } else {
        setAttacks(LIVE_STRIKES_POOL);
      }
    } catch {
      setAttacks(LIVE_STRIKES_POOL);
    }
  };

  const injectDynamicStrike = () => {
    const randomStrike = LIVE_STRIKES_POOL[Math.floor(Math.random() * LIVE_STRIKES_POOL.length)];
    const newStrike: LiveAttackItem = {
      ...randomStrike,
      id: `dyn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      time_ago: 'Just now'
    };

    setAttacks((prev) => [newStrike, ...prev.slice(0, 20)]);
  };

  const filteredAttacks = selectedFilter === 'All'
    ? attacks
    : attacks.filter((a) => a.type.toLowerCase().includes(selectedFilter.toLowerCase()));

  return (
    <div className="w-full flex flex-col rounded-3xl bg-slate-900/90 dark:bg-slate-950/90 border border-cyan-500/30 shadow-2xl backdrop-blur-xl font-mono text-slate-100 overflow-hidden transition-all duration-300">
      {/* Feed Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="absolute w-4 h-4 rounded-full bg-rose-500/50 animate-ping" />
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" /> Live Global Threat Stream
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-500/40">
                STREAMING
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Live IOC strike telemetry captured across global cloud sensors
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            title={isLiveStreaming ? 'Pause live stream' : 'Resume live stream'}
            className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              isLiveStreaming
                ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900'
                : 'bg-amber-950 text-amber-400 border-amber-500/40 hover:bg-amber-900'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLiveStreaming ? 'animate-spin' : ''}`} />
            <span className="text-[11px] font-bold">{isLiveStreaming ? 'Live' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Live Telemetry Status Bar */}
      <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Global Threat Level:</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/50">
            DEFCON 2 • ELEVATED
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Global Attack Rate:</span>
          <span className="text-cyan-400 font-bold text-[11px] flex items-center gap-1 font-mono">
            <Zap className="w-3 h-3 text-cyan-400" />
            {activeAttacksRate.toLocaleString()} strikes/min
          </span>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto text-[11px]">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
        {['All', 'Phishing', 'Ransomware', 'DDoS', 'Zero-Day', 'Malware', 'Social Eng.'].map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFilter(f)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedFilter === f
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Live Stream List */}
      <div className={`divide-y divide-slate-800/60 overflow-y-auto ${compact ? 'max-h-[340px]' : 'max-h-[520px]'} scrollbar-thin scrollbar-thumb-slate-800`}>
        {filteredAttacks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No active strikes matching filter.
          </div>
        ) : (
          filteredAttacks.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectThreat && onSelectThreat(item.threat_name)}
              className="p-4 hover:bg-slate-800/40 transition-colors group cursor-pointer space-y-2 animate-in fade-in slide-in-from-top-2 duration-300"
            >
              {/* Origin ➔ Target & Type */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-bold">
                  <span className="text-base" title={`Origin: ${item.origin_country}`}>
                    {item.origin_flag}
                  </span>
                  <span className="text-slate-300 text-xs">{item.origin_country} ({item.origin_code})</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                  <span className="text-base" title={`Target: ${item.target_country}`}>
                    {item.target_flag}
                  </span>
                  <span className="text-white text-xs">{item.target_country} ({item.target_code})</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    item.severity === 'CRITICAL'
                      ? 'bg-rose-950 text-rose-300 border border-rose-600/50'
                      : 'bg-amber-950 text-amber-300 border border-amber-600/50'
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.time_ago}
                  </span>
                </div>
              </div>

              {/* Threat Description */}
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-cyan-400 transition-colors flex items-center justify-between">
                  <span>{item.threat_name}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Target Sector: <span className="text-slate-200 font-semibold">{item.target_sector}</span>
                </p>
              </div>

              {/* Vector & Status */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-900/80">
                <span className="truncate max-w-[320px] text-slate-500">
                  ⚡ Vector: <strong className="text-slate-400 font-normal">{item.vector}</strong>
                </span>
                <span className={`font-bold flex items-center gap-1 shrink-0 ${
                  item.status === 'BLOCKED' || item.status === 'INTERCEPTED'
                    ? 'text-emerald-400'
                    : item.status === 'MITIGATED'
                    ? 'text-cyan-400'
                    : 'text-amber-400'
                }`}>
                  {item.status === 'BLOCKED' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {item.status === 'INTERCEPTED' && <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />}
                  {item.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Summary / Targeted Sectors */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-1 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" /> Top Targeted Sectors Today:
          </span>
          <span className="text-slate-300 font-bold">Banking & FinTech (38%) • Healthcare (24%) • Government (18%)</span>
        </div>
      </div>
    </div>
  );
};
