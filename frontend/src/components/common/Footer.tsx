import React from 'react';
import { Shield, Lock } from 'lucide-react';

export const Footer: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  return (
    <footer className="bg-slate-950 border-t border-cyber-border mt-20 text-slate-400 text-xs">
      <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
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
              AI-Powered Cybersecurity & Explainable Threat Detection Platform. Check Before You Click.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[11px] text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SSRF-Protected Network Layer
            </div>
          </div>

          {/* Quick Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Defensive Scanners
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab('url-scanner')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  URL Security Scanner
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('message-scanner')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Message & Phishing Analyzer
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('website-analyzer')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Website Security & TLS Audit
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('threat-intel')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Threat Intelligence Center
                </button>
              </li>
            </ul>
          </div>

          {/* Copilot & Learn */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              AI & Education
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab('raksha-ai')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Raksha AI Security Copilot
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('awareness')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Security Awareness Hub
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('awareness')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Phishing Simulation Quiz
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Global Threat Metrics
                </button>
              </li>
            </ul>
          </div>

          {/* Defensive Principles */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Security Philosophy
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed mb-3">
              RakshaSutra adheres to the principle of <strong className="text-slate-300">Defense in Depth</strong>. We explain the exact evidence behind every threat finding rather than rendering opaque black-box verdicts.
            </p>
            <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
              <Lock className="w-3.5 h-3.5" />
              <span>Zero credentials or sensitive messages logged.</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 RakshaSutra Cybersecurity Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Deterministic Multi-Signal Engine v1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
