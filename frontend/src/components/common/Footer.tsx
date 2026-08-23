import React from 'react';
import { Shield, Lock, PhoneCall } from 'lucide-react';

export const Footer: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  return (
    <footer className="bg-slate-950 border-t border-cyber-border mt-20 text-slate-400 text-xs font-sans">
      <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-base font-black text-white font-mono tracking-wider">
                RAKSHA<span className="text-cyan-400">SUTRA</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Check Before You Click. AI-Powered, Explainable Cybersecurity SaaS & Scam Mitigation Platform.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[11px] text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>k-Anonymity Zero-Knowledge Privacy</span>
            </div>
          </div>

          {/* Quick Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3 font-mono">
              Core Modules
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab('url-scanner')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  URL & Link Security Scanner
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('osint')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  OSINT Digital Footprinting
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('darkweb')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Dark Web Breach Intelligence
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('message-scanner')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  SMS & Phishing Analyzer
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('api-access')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Developer API & Pricing
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3 font-mono">
              Legal & Disclosures
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab('privacy')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Privacy Policy & Telemetry
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('terms')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Terms of Service & Acceptable Use
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('refund')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Refund & Cancellation Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('security')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Responsible Disclosure & Security
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('contact')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Support & Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Emergency Helpline Guidance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3 font-mono">
              Emergency Escalation
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed mb-3">
              If you have entered sensitive credentials or experienced financial cyber fraud, dial the National Cyber Helpline immediately:
            </p>
            <a
              href="tel:1930"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold text-xs font-mono hover:bg-rose-900/60 transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>Dial 1930 (Toll-Free)</span>
            </a>
            <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px] mt-3">
              <Lock className="w-3.5 h-3.5" />
              <span>Official Indian Cybercrime Portal: cybercrime.gov.in</span>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 RakshaSutra Cybersecurity Platform. All rights reserved.</p>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Deterministic Threat Engine v1.0</span>
            <span>•</span>
            <span className="text-emerald-400">SOC Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
