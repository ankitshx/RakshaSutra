import React from 'react';
import { Shield, Lock, FileText, PhoneCall, Mail, ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  policyType: 'privacy' | 'terms' | 'refund' | 'security' | 'contact';
  onBack: () => void;
}

export const LegalPages: React.FC<LegalPageProps> = ({ policyType, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-slate-100 space-y-8">
      
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-mono transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </button>

      {policyType === 'privacy' && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <Lock className="w-6 h-6 text-cyan-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Privacy Policy & Telemetry Disclosure</h1>
              <p className="text-xs text-slate-400 font-mono">Last Updated: August 23, 2026</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <h3 className="text-sm font-bold text-white uppercase font-mono">1. Zero-Knowledge Password & Query Hashing</h3>
            <p>
              When evaluating passwords or sensitive credentials for breach exposure, RakshaSutra utilizes NIST-approved k-Anonymity privacy hashing. Only the first 5 hexadecimal characters of the SHA-1 digest are transmitted to external threat indices. Plaintext passwords or queries are never recorded, logged, or transmitted.
            </p>

            <h3 className="text-sm font-bold text-white uppercase font-mono">2. Data Minimization & Telemetry Retention</h3>
            <p>
              We process only the minimal structural indicators required to calculate risk scores (e.g. domain certificates, redirection chains, and HTTP headers). Citizen and organization scan histories can be permanently purged at any time from your account settings.
            </p>

            <h3 className="text-sm font-bold text-white uppercase font-mono">3. No Monetization of User Telemetry</h3>
            <p>
              RakshaSutra strictly does not sell, rent, or trade citizen scan records, submitted emails, or phone numbers to advertisers or data brokers.
            </p>
          </div>
        </div>
      )}

      {policyType === 'terms' && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <FileText className="w-6 h-6 text-cyan-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Terms of Service & Acceptable Use</h1>
              <p className="text-xs text-slate-400 font-mono">Last Updated: August 23, 2026</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <h3 className="text-sm font-bold text-white uppercase font-mono">1. Defensive Use Only</h3>
            <p>
              All RakshaSutra scanners, OSINT reconnaissance modules, threat map visualizations, and developer APIs are provided strictly for defensive cybersecurity analysis, risk mitigation, and educational awareness.
            </p>

            <h3 className="text-sm font-bold text-white uppercase font-mono">2. Prohibition of Offensive Actions</h3>
            <p>
              Users are prohibited from utilizing RakshaSutra systems to disrupt, probe, stress-test, or access third-party digital infrastructure without authorized consent.
            </p>

            <h3 className="text-sm font-bold text-white uppercase font-mono">3. Evidence-Based Recommendations</h3>
            <p>
              Verdicts (SAFE, CAUTION, DANGER) and risk scores are evidence-based algorithmic assessments based on available telemetry and do not constitute absolute legal warranties. Users should exercise standard caution when handling sensitive credentials.
            </p>
          </div>
        </div>
      )}

      {policyType === 'refund' && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <Shield className="w-6 h-6 text-cyan-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Refund & Cancellation Policy</h1>
              <p className="text-xs text-slate-400 font-mono">Last Updated: August 23, 2026</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <p>
              We offer a 7-day money-back guarantee for first-time upgrades to Pro and Business subscriptions. If you are not satisfied with your security suite, you can cancel your subscription directly from your billing portal or contact our support desk for a full refund.
            </p>
          </div>
        </div>
      )}

      {(policyType === 'security' || policyType === 'contact') && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <PhoneCall className="w-6 h-6 text-rose-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Security Inquiries & Emergency Contacts</h1>
              <p className="text-xs text-slate-400 font-mono">24/7 Citizen & Enterprise Assistance</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 space-y-2">
              <div className="font-bold text-rose-300 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-rose-400" />
                <span>National Cyber Fraud Helpline (India)</span>
              </div>
              <p className="text-xs text-rose-200">
                If you have been victimized by financial fraud or UPI scams, immediately call <strong>1930</strong> (Toll-Free) or file an emergency freeze report on <strong>https://cybercrime.gov.in</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>RakshaSutra Security Operations Desk</span>
              </div>
              <p className="text-xs text-slate-400">
                General Support: support@rakshasutra.org<br />
                Security Vulnerabilities: security@rakshasutra.org<br />
                Enterprise Solutions: enterprise@rakshasutra.org
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
