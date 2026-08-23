import React, { useState } from 'react';
import { UnifiedCommandHero } from '../components/scanner/UnifiedCommandHero';
import { ScanReportView } from '../components/scanner/ScanReportView';
import { EmergencyPanicModal } from '../components/common/EmergencyPanicModal';
import { LiveGlobalThreatFeed } from '../components/common/LiveGlobalThreatFeed';
import { GlobalAttackMap } from '../components/common/GlobalAttackMap';
import { GlobalLiveAttackCounter } from '../components/common/GlobalLiveAttackCounter';
import type { ScanResponse } from '../types';
import {
  Search,
  MessageSquare,
  Globe,
  Radio,
  Bot,
  ArrowRight,
  AlertOctagon,
  PhoneCall,
  Map,
  List
} from 'lucide-react';

interface LandingPageProps {
  setActiveTab: (tab: string) => void;
  onViewReport: (report: ScanResponse) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActiveTab, onViewReport }) => {
  const [heroReport, setHeroReport] = useState<ScanResponse | null>(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [socActiveTab, setSocActiveTab] = useState<'map' | 'stream'>('map');

  const capabilities = [
    {
      id: 'url-scanner',
      title: 'Check Suspicious Links',
      desc: 'Paste any link you got on WhatsApp, SMS, or email to see if it is a fake banking or shopping website.',
      icon: Search,
      badge: 'Link Checker'
    },
    {
      id: 'message-scanner',
      title: 'Check Suspicious Messages',
      desc: 'Check messages claiming your electricity will be cut, bank account blocked, or asking for OTP / money.',
      icon: MessageSquare,
      badge: 'Message Checker'
    },
    {
      id: 'website-analyzer',
      title: 'Website Safety Audit',
      desc: 'Verify if a website has secure encryption and valid certificates before you make a purchase.',
      icon: Globe,
      badge: 'Website Safety'
    },
    {
      id: 'threat-intel',
      title: 'Known Scam Database',
      desc: 'Search our global list of thousands of blocked scam websites, fake phone numbers, and phishing domains.',
      icon: Radio,
      badge: 'Global Records'
    },
    {
      id: 'raksha-ai',
      title: 'Raksha AI Security Copilot',
      desc: 'Ask your personal AI assistant anything about cyber safety in plain English with zero complicated jargon.',
      icon: Bot,
      badge: 'AI Assistant'
    },
    {
      id: 'awareness',
      title: 'Scam Awareness Hub',
      desc: 'Learn the tricks scammers use and test your knowledge with interactive real-life quizzes.',
      icon: Search,
      badge: 'Training Hub'
    }
  ];

  return (
    <div className="space-y-10 py-4 sm:py-8">
      {/* 1. Top Threat Safety Alert Banner with Emergency 1930 Helpline Button */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-cyan-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/40">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                ⚠️ Electricity Bill & Bank KYC SMS Scams are currently active across India & Southeast Asia
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Banks and electricity boards never ask you to install APK files or share OTPs over WhatsApp.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEmergencyModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Emergency Help</span>
          </button>
        </div>
      </section>

      {/* 2. Real-Time Global Cyber Attacks Counter Bar */}
      <section className="max-w-7xl mx-auto px-4">
        <GlobalLiveAttackCounter />
      </section>

      {/* 3. Main Hero Multi-Vector Command Scanner */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <UnifiedCommandHero
          onUrlScanComplete={(report) => {
            setHeroReport(report);
            onViewReport(report);
          }}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />

        {/* Render Scan Results In-Place on Hero */}
        {heroReport && (
          <div className="text-left animate-in fade-in zoom-in-95 duration-300">
            <ScanReportView
              report={heroReport}
              onAskAI={() => setActiveTab('raksha-ai')}
            />
          </div>
        )}
      </section>

      {/* 4. Real-Time Cyber Warfare Defense Radar & Live Threat Stream */}
      <section className="max-w-7xl mx-auto px-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400 animate-pulse" />
                Live Global Cyber Strike Radar & Threat Stream
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/50 text-[10px] font-mono font-bold animate-pulse">
                REAL-TIME
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Live interception map tracking directional cyber attacks across 16 countries and high-risk critical infrastructure sectors.
            </p>
          </div>

          {/* SOC Tab Switcher */}
          <div className="flex items-center p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-mono">
            <button
              onClick={() => setSocActiveTab('map')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                socActiveTab === 'map'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Attack Radar Map</span>
            </button>

            <button
              onClick={() => setSocActiveTab('stream')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                socActiveTab === 'stream'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Live Threat Feed</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Full-Width Directional Attack Map */}
        {socActiveTab === 'map' && (
          <div className="w-full animate-in fade-in duration-200">
            <GlobalAttackMap
              onSelectStrike={(_strike) => {
                setActiveTab('threat-intel');
              }}
            />
          </div>
        )}

        {/* Tab 2: Live Threat Feed Stream */}
        {socActiveTab === 'stream' && (
          <div className="w-full animate-in fade-in duration-200">
            <LiveGlobalThreatFeed
              onSelectThreat={(_threatName) => {
                setActiveTab('threat-intel');
              }}
            />
          </div>
        )}
      </section>

      {/* 5. Beginner-Friendly 3-Step Guide */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-sans">
              How RakshaSutra Protects You in 3 Simple Steps
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No technical knowledge needed — just copy, paste, and check.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-bold text-base mx-auto">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Paste Any Link or Text
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Got a weird SMS or WhatsApp message? Copy and paste it right here into our search box.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-bold text-base mx-auto">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Get an Instant Plain-English Verdict
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Our AI scans for fake domains, spoofed logins, and malware, showing a simple Green (Safe) or Red (Danger) result.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-bold text-base mx-auto">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Step-by-Step Defense Action
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                If it's dangerous, get clear instructions on how to block the sender and report fraud to 1930 immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. 6-Feature Platform Explorer Grid */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-sans">
            Complete Cyber Protection Suite
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Explore all our tools designed to keep you and your family safe from online fraud.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.id}
                onClick={() => setActiveTab(cap.id)}
                className="p-6 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 hover:shadow-xl transition-all group flex flex-col justify-between space-y-4 cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-mono font-bold">
                      {cap.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                      {cap.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                      {cap.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between text-xs font-bold text-cyan-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>Open Tool</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Emergency Panic Modal */}
      <EmergencyPanicModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
    </div>
  );
};
