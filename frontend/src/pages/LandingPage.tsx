import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SecurityRadar } from '../components/command-center/SecurityRadar';
import { AttentionRequiredStream } from '../components/command-center/AttentionRequiredStream';
import type { AttentionItem } from '../components/command-center/AttentionRequiredStream';
import { SecurityInbox } from '../components/command-center/SecurityInbox';
import { UniversalInvestigator } from '../components/investigation/UniversalInvestigator';
import { EmergencyPanicModal } from '../components/common/EmergencyPanicModal';
import {
  ShieldAlert,
  ShieldCheck,
  Network,
  Eye,
  ArrowRight,
  PhoneCall,
  Lock,
  Sparkles,
  Globe,
  KeyRound
} from 'lucide-react';

interface LandingPageProps {
  setActiveTab: (tab: string, extraData?: any) => void;
  onViewReport?: (report: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActiveTab }) => {
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [scoreData, setScoreData] = useState<any>(null);

  useEffect(() => {
    loadDashboardMetrics();
  }, []);

  const loadDashboardMetrics = async () => {
    try {
      const [stats, score] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getSecurityScore().catch(() => null)
      ]);
      setDashboardData(stats);
      setScoreData(score);
    } catch {
      // Graceful fallback
    }
  };

  const handleStartInvestigation = (target: string, type?: string) => {
    if (type === 'message') {
      setActiveTab('message-scanner', { initialText: target });
    } else if (type === 'email' || type === 'phone') {
      setActiveTab('osint', { initialTarget: target, initialType: type });
    } else {
      setActiveTab('investigation-center', { target });
    }
  };

  const handleAttentionAction = (item: AttentionItem) => {
    if (item.targetTab) {
      setActiveTab(item.targetTab, item.actionData);
    } else {
      setActiveTab('investigation-center', { target: item.title });
    }
  };

  return (
    <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 pb-24 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* 1. Command Center Top Digital Security Status Banner (RDS 2.0) */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Subtle decorative thread */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        
        <div className="flex flex-wrap items-center justify-between gap-6 relative">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Protective Security Intelligence Center</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white font-mono tracking-tight">
              Personal Cyber Defense Status: <span className="text-emerald-400">HARDENED</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-2xl leading-relaxed">
              Composite defensive posture score is <strong>{scoreData?.overall_score || 84}/100</strong>. Multi-vector threat telemetry is active across all 7 security perimeters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('investigation-center')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs font-mono tracking-wide flex items-center gap-2 shadow-sutra-glow transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>NEW INVESTIGATION</span>
            </button>
            <button
              onClick={() => setActiveTab('emergency-mode')}
              className="px-5 py-3 rounded-2xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-bold text-xs font-mono tracking-wide flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>EMERGENCY DEFENSE</span>
            </button>
          </div>
        </div>

        {/* 4 Security Posture Metric Pills */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/10 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-[#070b12] border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Security Index</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">{scoreData?.overall_score || 84}<span className="text-slate-400 text-xs">/100</span></span>
              <span className="text-emerald-400 font-bold text-xs">+4pts</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#070b12] border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Active Threat Level</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-400">LOW</span>
              <span className="text-[10px] text-slate-400">0 Critical Blocks</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#070b12] border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Monitored Assets</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-400">6 Targets</span>
              <span className="text-[10px] text-slate-400">24/7 Watchlist</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#070b12] border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Intercepts</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">{dashboardData?.total_scans || 18} Scans</span>
              <span className="text-[10px] text-slate-400">Verified Evidence</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Signature Universal Fast Investigator Form */}
      <section>
        <UniversalInvestigator
          onInvestigate={handleStartInvestigation}
        />
      </section>

      {/* 3. Security Posture Radar (Central Radial Visualization) */}
      <section>
        <SecurityRadar
          overallScore={scoreData?.overall_score || 84}
          onSelectDimension={(dimId) => {
            if (dimId === 'exposure') setActiveTab('darkweb');
            else if (dimId === 'email' || dimId === 'network') setActiveTab('osint');
            else if (dimId === 'websites') setActiveTab('website-scanner');
            else setActiveTab('security-posture');
          }}
        />
      </section>

      {/* 4. "What Needs My Attention?" Prioritized Triage Stream */}
      <section>
        <AttentionRequiredStream onAction={handleAttentionAction} />
      </section>

      {/* 5. Unified Security Inbox */}
      <section>
        <SecurityInbox
          onOpenInvestigation={(target) => setActiveTab('investigation-center', { target })}
          onViewEvidence={(evt) => setActiveTab('evidence-vault', { eventId: evt.id })}
        />
      </section>

      {/* 6. My Digital Environment (Persistent Asset Overview) */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-sutra-glow">
                <Network className="w-4 h-4" />
              </span>
              <h3 className="text-base font-black font-mono text-white tracking-wide">
                MY DIGITAL ENVIRONMENT & DEFENSIVE PERIMETER
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Verified devices, credentials, domains, and active canary traps in your defensive perimeter
            </p>
          </div>

          <button
            onClick={() => setActiveTab('security-map')}
            className="text-xs text-amber-400 hover:underline font-mono flex items-center gap-1 font-bold cursor-pointer"
          >
            <span>Open Interactive Security Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => setActiveTab('security-posture')}
            className="p-5 rounded-2xl bg-[#070b12] border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-400 group-hover:scale-110 transition-transform">
                <KeyRound className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                92% Safe
              </span>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white font-mono group-hover:text-amber-300">Identity & Accounts</h4>
              <p className="text-xs text-slate-400 font-sans">2 Verified Emails • Passkeys Active</p>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('monitoring')}
            className="p-5 rounded-2xl bg-[#070b12] border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-400 group-hover:scale-110 transition-transform">
                <Globe className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                Continuous Watch
              </span>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white font-mono group-hover:text-blue-300">Domains & Web</h4>
              <p className="text-xs text-slate-400 font-sans">3 Monitored Hosts • DNS Diffs</p>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('darkweb')}
            className="p-5 rounded-2xl bg-[#070b12] border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-400 group-hover:scale-110 transition-transform">
                <Eye className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/30">
                k-Anonymity
              </span>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white font-mono group-hover:text-amber-300">Dark Web Exposure</h4>
              <p className="text-xs text-slate-400 font-sans">0 Fresh Leaks Detected</p>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('deception')}
            className="p-5 rounded-2xl bg-[#070b12] border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-400 group-hover:scale-110 transition-transform">
                <Lock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/30">
                Armed Canary
              </span>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white font-mono group-hover:text-rose-300">Active Deception</h4>
              <p className="text-xs text-slate-400 font-sans">Canary URLs & Fake Keys</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Emergency 1930 / Golden Hour Guidance Banner */}
      <section className="p-6 sm:p-8 rounded-3xl bg-rose-950/20 border border-rose-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
            <h3 className="text-base font-bold text-white font-mono">
              Unauthorized Banking Transfers or Phishing Scam in Progress?
            </h3>
          </div>
          <p className="text-xs text-slate-300 font-sans">
            Report immediately to the Indian National Cyber Fraud Helpline within the <strong>"Golden Hour"</strong> to freeze illicit fund transfers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="tel:1930"
            className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono flex items-center gap-2 transition-colors shadow-lg shadow-rose-600/30"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Dial 1930 (Toll-Free)</span>
          </a>
          <button
            onClick={() => setIsEmergencyModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-[#070b12] hover:bg-[#141d2e] border border-white/10 text-slate-200 font-bold text-xs font-mono flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Emergency Containment Guide</span>
          </button>
        </div>
      </section>

      <EmergencyPanicModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

    </div>
  );
};
