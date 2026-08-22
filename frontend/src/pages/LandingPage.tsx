import React, { useState } from 'react';
import { UnifiedCommandHero } from '../components/scanner/UnifiedCommandHero';
import { ScanReportView } from '../components/scanner/ScanReportView';
import { EmergencyPanicModal } from '../components/common/EmergencyPanicModal';
import type { ScanResponse } from '../types';
import {
  Search,
  MessageSquare,
  Globe,
  Radio,
  Bot,
  BookOpen,
  ArrowRight,
  AlertOctagon,
  PhoneCall
} from 'lucide-react';

interface LandingPageProps {
  setActiveTab: (tab: string) => void;
  onViewReport: (report: ScanResponse) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActiveTab, onViewReport }) => {
  const [heroReport, setHeroReport] = useState<ScanResponse | null>(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

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
      title: 'Phishing Quiz & Safety Tips',
      desc: 'Play interactive scam identification quizzes to train yourself and your family to spot fake messages.',
      icon: BookOpen,
      badge: 'Learn & Quiz'
    }
  ];

  return (
    <div className="space-y-16 py-6">
      {/* Emergency Immediate Help Banner */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-400 dark:border-rose-500/50 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-xl bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 shrink-0">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                Did you already click a fake link or send money by mistake?
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                Follow our immediate 3-step containment steps and reach national cyber helplines.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEmergencyModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Emergency Help</span>
          </button>
        </div>
      </section>

      {/* Hero Command Center Section */}
      <section className="relative text-center max-w-5xl mx-auto px-4 space-y-6">
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
            Check Before You <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 text-glow-cyan">Click.</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Protect your money, passwords, and personal data. Check any suspicious link or message before you click it.
          </p>
        </div>

        {/* Unified Multi-Vector Command Hero Scanner */}
        <UnifiedCommandHero
          onUrlScanComplete={(report) => {
            setHeroReport(report);
            onViewReport(report);
          }}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />

        {/* Render Scan Results In-Place on Hero */}
        {heroReport && (
          <div className="mt-8 text-left animate-in fade-in zoom-in-95 duration-300">
            <ScanReportView
              report={heroReport}
              onAskAI={() => setActiveTab('raksha-ai')}
            />
          </div>
        )}
      </section>

      {/* Beginner-Friendly 3-Step Guide */}
      <section className="max-w-5xl mx-auto px-4">
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
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-base mx-auto">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Get an Instant Plain-English Verdict
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                We tell you immediately in clear words: Is this a fake bank? Is it a scam? Is it safe?
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-base mx-auto">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Learn How to Stay Safe
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                We give you the official safe way to reach your real bank or service so you never get tricked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Vector Capability Grid */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
            Explore All Security Tools
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Easy-to-use tools built to protect you against modern cyber fraud.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {capabilities.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.id}
                onClick={() => setActiveTab(c.id)}
                className="group p-6 rounded-3xl bg-white dark:bg-slate-950/70 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-cyber-border hover:border-cyan-500/60 transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-gradient-to-br dark:from-cyan-500/20 dark:via-blue-600/20 dark:to-indigo-600/20 border border-cyan-300 dark:border-cyan-500/40 flex items-center justify-center text-cyan-700 dark:text-cyan-400">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                      {c.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors font-sans">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1.5">
                      {c.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-850 flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 group-hover:translate-x-1.5 transition-transform">
                  <span>Open Tool</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Emergency Panic Modal Popup */}
      <EmergencyPanicModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
    </div>
  );
};
