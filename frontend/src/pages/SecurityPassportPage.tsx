import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { SecurityScorecard, SecurityPassport } from '../types';
import {
  CheckCircle2,
  Share2,
  Sparkles,
  RefreshCw,
  Award,
  Layers,
  Activity
} from 'lucide-react';

export const SecurityPassportPage: React.FC = () => {
  const [scorecard, setScorecard] = useState<SecurityScorecard | null>(null);
  const [passport, setPassport] = useState<SecurityPassport | null>(null);
  const [nistPosture, setNistPosture] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [scoreRes, passRes, nistRes] = await Promise.all([
        api.getSecurityScore(),
        api.getSecurityPassport(),
        api.getNistPosture()
      ]);
      setScorecard(scoreRes);
      setPassport(passRes);
      setNistPosture(nistRes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!passport) return;
    navigator.clipboard.writeText(passport.verification_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                <Award className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-black text-white font-mono tracking-wider">
                PERSONAL SECURITY SCORE & PASSPORT
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Privacy-safe digital safety posture rating with zero sensitive information exposure
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-mono font-bold text-slate-300 flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{copied ? 'Copied Link ✓' : 'Share Passport'}</span>
            </button>
            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Main Grid: Passport Card + Scorecard Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. Official Security Passport Card */}
          {passport && (
            <div className="lg:col-span-1 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-cyan-950/40 to-slate-950 border border-cyan-500/40 shadow-2xl shadow-cyan-950/30 flex flex-col justify-between space-y-6 relative overflow-hidden">
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-950 font-black font-mono text-xs">
                      RS
                    </div>
                    <div>
                      <span className="text-xs font-bold font-mono text-white tracking-wider block">
                        RAKSHASUTRA
                      </span>
                      <span className="text-[10px] text-cyan-400 font-mono">
                        DIGITAL SECURITY PASSPORT
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                    {passport.holder_tier}
                  </span>
                </div>

                <div className="text-center py-6 border-y border-slate-800 space-y-2">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block">
                    Composite Security Index
                  </span>
                  <div className="text-5xl font-black font-mono text-white tracking-tight flex items-baseline justify-center gap-1">
                    <span>{passport.security_score}</span>
                    <span className="text-slate-500 text-lg">/100</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{passport.posture_status} POSTURE</span>
                  </span>
                </div>

                {/* Verified Dimensions List */}
                <div className="space-y-2 font-mono text-xs">
                  {passport.verified_dimensions.map((dim, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">{dim.label}</span>
                      <span className="text-cyan-300 font-bold">{dim.score}/100</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Passport Footer Info */}
              <div className="pt-4 border-t border-slate-800 flex justify-between items-end text-[11px] font-mono text-slate-500">
                <div>
                  <span className="block text-slate-400">Passport ID:</span>
                  <span className="text-white font-bold">{passport.passport_id}</span>
                </div>
                <div className="text-right">
                  <span className="block text-slate-400">Issued Date:</span>
                  <span className="text-slate-300">{passport.issued_at}</span>
                </div>
              </div>

            </div>
          )}

          {/* 2. Scorecard Breakdown & Actionable Guidance */}
          {scorecard && (
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
                <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Posture Dimension Breakdown
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Account Security */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300 font-bold">Account Security & MFA</span>
                      <span className="text-cyan-400">{scorecard.dimensions.account_security}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${scorecard.dimensions.account_security}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Biometric login & 2-factor authentication status
                    </p>
                  </div>

                  {/* Password Exposure */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300 font-bold">Dark Web Exposure</span>
                      <span className="text-emerald-400">{scorecard.dimensions.password_exposure}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${scorecard.dimensions.password_exposure}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      HIBP breach index & leaked password checks
                    </p>
                  </div>

                  {/* Browser Protection */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300 font-bold">Browser Extension Protection</span>
                      <span className="text-cyan-400">{scorecard.dimensions.browser_protection}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${scorecard.dimensions.browser_protection}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Real-time link scanning in Gmail & WhatsApp Web
                    </p>
                  </div>

                  {/* Threat History */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300 font-bold">Threat Audit Activity</span>
                      <span className="text-emerald-400">{scorecard.dimensions.threat_history}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${scorecard.dimensions.threat_history}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Recent investigations and suspicious link verifications
                    </p>
                  </div>

                </div>

                {/* Recommendations */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    How to Improve Your Score
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {scorecard.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 font-mono">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* 3. NIST CSF 2.0 Organizational Posture Alignment */}
        {nistPosture && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div>
              <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                {nistPosture.framework}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {nistPosture.disclaimer}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nistPosture.functions.map((fn: any, idx: number) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                >
                  <div className="flex justify-between items-baseline font-mono">
                    <span className="text-sm font-bold text-white">{fn.name}</span>
                    <span className="text-sm font-black text-cyan-400">{fn.score}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${fn.score}%` }} />
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-400 font-mono">
                    {fn.controls.map((ctrl: string, cIdx: number) => (
                      <li key={cIdx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{ctrl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
