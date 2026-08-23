import React, { useState } from 'react';
import { EmergencyPanicModal } from '../components/common/EmergencyPanicModal';
import {
  Search,
  Shield,
  ShieldAlert,
  Award,
  Bell,
  Network,
  Eye,
  ArrowRight,
  PhoneCall,
  Lock,
  Sparkles,
  Terminal
} from 'lucide-react';

interface LandingPageProps {
  setActiveTab: (tab: string) => void;
  onViewReport?: (report: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActiveTab }) => {
  const [quickInput, setQuickInput] = useState('');
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) {
      setActiveTab('investigation-center');
      return;
    }
    setActiveTab('investigation-center');
  };

  const flagshipFeatures = [
    {
      id: 'investigation-center',
      title: 'Threat Investigation Center',
      desc: 'Flagship multi-vector investigation engine generating unique Investigation IDs, evidence provenance, and dual-mode metrics.',
      icon: Search,
      badge: 'Flagship Module'
    },
    {
      id: 'monitoring',
      title: 'Continuous Target Monitoring',
      desc: 'Automated 24/7 audits detecting DNS alterations, certificate changes, and risk escalations with before/after diffs.',
      icon: Bell,
      badge: 'Active Watchlist'
    },
    {
      id: 'security-passport',
      title: 'Personal Security Passport',
      desc: 'Privacy-safe portable digital safety rating and NIST CSF 2.0 posture breakdown with zero credential exposure.',
      icon: Award,
      badge: 'Privacy Rating'
    },
    {
      id: 'osint',
      title: 'OSINT Digital Footprinting',
      desc: 'Passive intelligence probing across 40+ platforms, DNS mail records, and interactive Force-Directed relationship graphs.',
      icon: Network,
      badge: 'OSINT Recon'
    },
    {
      id: 'darkweb',
      title: 'Dark Web Breach Exposure',
      desc: 'Query verified global corporate breaches using NIST / Cloudflare k-Anonymity zero-knowledge SHA-1 range hashing.',
      icon: Eye,
      badge: 'k-Anonymity'
    },
    {
      id: 'developer-playground',
      title: 'Developer REST API Gateway',
      desc: 'Interactive request playground, hashed API keys, code generators, and HMAC-signed webhook delivery logs.',
      icon: Terminal,
      badge: 'Developer Portal'
    }
  ];

  return (
    <div className="space-y-16 pb-24 font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* 1. Hero Section */}
      <section className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800 shadow-2xl backdrop-blur-2xl relative overflow-hidden text-center space-y-8">
          
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>RakshaSutra • Check Before You Click</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Explainable Cybersecurity & <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Threat Investigation SaaS
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Verify suspicious URLs, domains, SMS phishing messages, and breach exposures with transparent evidence, separate risk & confidence scores, and plain-English verdicts.
            </p>
          </div>

          {/* Search Hero Form */}
          <form onSubmit={handleQuickSubmit} className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="Paste any link, domain, or message to investigate..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-cyan-500 shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm font-mono tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>INVESTIGATE</span>
            </button>
          </form>

          {/* Quick Metrics Bar */}
          <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-8 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Zero-Knowledge Privacy</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>NIST CSF 2.0 Aligned</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Multi-Vector Evidence Vault</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Flagship Capabilities Grid */}
      <section className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-wide">
            EXPLORE PLATFORM MODULES
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-mono">
            Deterministic security engines designed for citizens, businesses, and SOC analysts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flagshipFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={() => setActiveTab(feat.id)}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all duration-200 cursor-pointer space-y-4 group shadow-xl hover:shadow-cyan-950/20"
              >
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-cyan-300 group-hover:border-cyan-500/30 transition-colors">
                    {feat.badge}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white font-mono group-hover:text-cyan-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {feat.desc}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-1 text-xs font-mono font-bold text-cyan-400 group-hover:underline">
                  <span>Open Module</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Emergency National Cybercrime Guidance Banner */}
      <section className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-rose-950/20 border border-rose-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
              <h3 className="text-base font-bold text-white font-mono">
                Experienced Financial Cyber Fraud or Unauthorized Transactions?
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Report immediately within the "Golden Hour" to freeze fund transfers across Indian banks and payment gateways.
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
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs font-mono flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Emergency Containment Guide</span>
            </button>
          </div>
        </div>
      </section>

      <EmergencyPanicModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

    </div>
  );
};
