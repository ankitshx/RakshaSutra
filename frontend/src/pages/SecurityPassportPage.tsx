import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { SecurityScorecard, SecurityPassport } from '../types';
import {
  Share2,
  RefreshCw,
  Award
} from 'lucide-react';

export const SecurityPassportPage: React.FC = () => {
  const [scorecard, setScorecard] = useState<SecurityScorecard | null>(null);
  const [passport, setPassport] = useState<SecurityPassport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [scoreRes, passRes] = await Promise.all([
        api.getSecurityScore(),
        api.getSecurityPassport()
      ]);
      setScorecard(scoreRes);
      setPassport(passRes);
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
    <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Header (RDS 2.0) */}
      <div className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-sutra-glow shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              PERSONAL SECURITY SCORE & PASSPORT
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Privacy-safe digital safety posture rating with zero sensitive information exposure
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2.5 rounded-xl bg-[#141d2e] hover:bg-[#1b273d] border border-amber-500/40 text-xs font-mono font-bold text-amber-300 flex items-center gap-2 cursor-pointer transition-colors shadow-sutra-glow"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied Link ✓' : 'Share Passport'}</span>
          </button>
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-[#070b12] border border-white/10 hover:bg-[#141d2e] text-slate-400 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Passport Card + Scorecard Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. Official Security Passport Card */}
        {passport && (
          <div className="lg:col-span-1 p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-amber-500/40 shadow-2xl shadow-amber-950/20 flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black font-mono text-xs shadow-sutra-glow">
                    RS
                  </div>
                  <div>
                    <span className="text-xs font-bold font-mono text-white tracking-wider block">
                      RAKSHASUTRA
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      VERIFIED DEFENSE PASSPORT
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                  VERIFIED ACTIVE
                </span>
              </div>

              <div className="py-6 text-center space-y-2 border-y border-white/10">
                <span className="text-xs font-mono text-slate-400 uppercase">Composite Rating</span>
                <div className="text-5xl font-black font-mono text-white tracking-tight">
                  {passport.score}
                  <span className="text-lg text-slate-500">/100</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 block">
                  {passport.grade} Level Hardened Perimeter
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Owner Identifier:</span>
                  <span className="text-white font-bold">{passport.owner_display}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Issued On:</span>
                  <span className="text-slate-200">{new Date(passport.issued_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Zero-Knowledge Hash:</span>
                  <span className="text-amber-300 font-bold truncate max-w-[140px]">{passport.passport_id}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Cryptographic Proof</span>
              <span className="text-emerald-400 font-bold">SHA-256 Signed ✓</span>
            </div>
          </div>
        )}

        {/* 2. Vector Assessment Breakdown */}
        {scorecard && (
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Evaluated Vector Categories ({scorecard.categories?.length || 4})
                </h3>
                <p className="text-xs text-slate-400">
                  Multi-vector composite grading based on live assets and scan findings
                </p>
              </div>
            </div>

            <div className="space-y-4 font-mono text-xs">
              {(scorecard.categories || []).map((cat: any) => (
                <div key={cat.name} className="p-4 rounded-2xl bg-[#070b12] border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold">{cat.name}</span>
                    <span className="text-amber-400 font-bold">{cat.score}/100</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#030508] overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500 shadow-sutra-glow"
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                  <p className="text-slate-400 font-sans text-[11px] pt-1">{cat.description || cat.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
