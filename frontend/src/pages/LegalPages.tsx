import React from 'react';
import { Shield, Lock, FileText, PhoneCall, ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  policyType: 'privacy' | 'terms' | 'refund' | 'security' | 'contact';
  onBack: () => void;
}

export const LegalPages: React.FC<LegalPageProps> = ({ policyType, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-slate-100 space-y-8 pb-24 selection:bg-amber-500 selection:text-slate-950">
      
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0c121e] border border-white/10 text-slate-400 hover:text-white text-xs font-mono transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-amber-400" />
        <span>Return to Command Console</span>
      </button>

      {policyType === 'privacy' && (
        <div className="p-8 rounded-3xl bg-[#0c121e] border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Lock className="w-6 h-6 text-amber-400" />
            <div>
              <h1 className="text-2xl font-bold text-white font-mono">Privacy Policy & Telemetry Disclosure</h1>
              <p className="text-xs text-slate-400 font-mono">Last Updated: August 24, 2026</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
            <h3 className="text-sm font-bold text-white uppercase font-mono">1. Zero-Knowledge Password & Query Hashing</h3>
            <p>
              When evaluating passwords or sensitive credentials for breach exposure, RakhshaSutra utilizes NIST-approved k-Anonymity privacy hashing. Only the first 5 hexadecimal characters of the SHA-1 digest are transmitted to external threat indices. Plaintext passwords or queries are never recorded, logged, or transmitted.
            </p>

            <h3 className="text-sm font-bold text-white uppercase font-mono">2. Data Minimization & Telemetry Retention</h3>
            <p>
              We process only the minimal structural indicators required to calculate risk scores (e.g. domain certificates, redirection chains, and HTTP headers). Citizen and organization scan histories can be permanently purged at any time from your account settings.
            </p>

            <h3 className="text-sm font-bold text-white uppercase font-mono">3. No Monetization of User Telemetry</h3>
            <p>
              RakhshaSutra strictly does not sell, rent, or trade citizen scan records, submitted emails, or phone numbers to advertisers or data brokers.
            </p>
          </div>
        </div>
      )}

      {policyType === 'terms' && (
        <div className="p-8 rounded-3xl bg-[#0c121e] border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <FileText className="w-6 h-6 text-amber-400" />
            <div>
              <h1 className="text-2xl font-bold text-white font-mono">Terms of Service & Acceptable Use</h1>
              <p className="text-xs text-slate-400 font-mono">Last Updated: August 24, 2026</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
            <h3 className="text-sm font-bold text-white uppercase font-mono">1. Defensive Use Only</h3>
            <p>
              All RakhshaSutra scanners, OSINT reconnaissance modules, threat map visualizations, and developer APIs are provided strictly for defensive cybersecurity analysis, risk mitigation, and educational awareness.
            </p>

            <h3 className="text-sm font-bold text-white uppercase font-mono">2. Prohibition of Offensive Actions</h3>
            <p>
              Users are prohibited from utilizing RakhshaSutra systems to disrupt, probe, stress-test, or access third-party digital infrastructure without authorized consent.
            </p>

            <h3 className="text-sm font-bold text-white uppercase font-mono">3. Evidence-Based Recommendations</h3>
            <p>
              Verdicts (SAFE, CAUTION, DANGER) and risk scores are evidence-based algorithmic assessments based on available telemetry and do not constitute absolute legal warranties. Users should exercise standard caution when handling sensitive credentials.
            </p>
          </div>
        </div>
      )}

      {policyType === 'refund' && (
        <div className="p-8 rounded-3xl bg-[#0c121e] border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Shield className="w-6 h-6 text-amber-400" />
            <div>
              <h1 className="text-2xl font-bold text-white font-mono">Refund & Cancellation Policy</h1>
              <p className="text-xs text-slate-400 font-mono">Last Updated: August 24, 2026</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
            <p>
              We offer a 7-day money-back guarantee for first-time upgrades to Pro and Business subscriptions. If you are not satisfied with your security suite, you can cancel your subscription directly from your billing portal or contact our support desk for a full refund.
            </p>
          </div>
        </div>
      )}

      {(policyType === 'security' || policyType === 'contact') && (
        <div className="p-8 rounded-3xl bg-[#0c121e] border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <PhoneCall className="w-6 h-6 text-rose-400" />
            <div>
              <h1 className="text-2xl font-bold text-white font-mono">Emergency Assistance & Contact</h1>
              <p className="text-xs text-slate-400 font-mono">National Cyber Crime Reporting Integration</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
            <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/50 space-y-2">
              <h4 className="text-sm font-bold text-rose-300 font-mono uppercase">Immediate Financial Cyber Fraud?</h4>
              <p>
                In the event of unauthorized banking debits, immediate reporting within 2 hours ("Golden Hour") enables law enforcement to freeze money trails. Dial <strong>1930</strong> (National Cyber Financial Fraud Helpline - India) or file an emergency report at <strong>https://cybercrime.gov.in</strong>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#070b12] border border-white/5 space-y-2 font-mono">
              <h4 className="text-sm font-bold text-white uppercase">Technical Security Desk</h4>
              <p className="text-slate-400">
                Email: <span className="text-amber-400">security@rakshasutra.org</span><br />
                PGP Fingerprint: <span className="text-slate-300">4E92 D91A 83FC 1B02 C890  19E3 5028 9200 AC31 FF12</span>
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
