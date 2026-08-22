import React from 'react';
import {
  AlertOctagon,
  PhoneCall,
  X,
  CreditCard,
  KeyRound,
  ExternalLink
} from 'lucide-react';

interface EmergencyPanicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyPanicModal: React.FC<EmergencyPanicModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-950 border-2 border-rose-500/60 p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/80 border border-rose-500/40 text-rose-600 dark:text-rose-400">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-200">
                Emergency Guide
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white pt-1 font-sans">
                I Clicked a Fake Link or Shared Info — What Do I Do?
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
          <strong>Do not panic.</strong> Follow these 3 critical steps right now to prevent financial loss and secure your accounts:
        </p>

        {/* 3 Steps */}
        <div className="space-y-4">
          {/* Step 1: Block Cards / Freeze Bank */}
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 space-y-2">
            <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200 font-bold text-xs uppercase tracking-wider font-mono">
              <CreditCard className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Step 1: Freeze Your Bank Account / Cards</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              If you entered bank card numbers or shared an OTP, open your official mobile banking app immediately and tap <strong>"Temporarily Block Card"</strong> or call your bank's 24/7 fraud helpline number (found on the back of your physical card).
            </p>
          </div>

          {/* Step 2: Call Cyber Helpline 1930 */}
          <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-900 dark:text-cyan-200 font-bold text-xs uppercase tracking-wider font-mono">
                <PhoneCall className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Step 2: Report Financial Fraud to 1930</span>
              </div>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono">
                Within 2 Hours!
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              In India, call <strong>1930</strong> (Citizen Financial Cyber Fraud Helpline) or register a complaint on{' '}
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline inline-flex items-center gap-0.5"
              >
                cybercrime.gov.in <ExternalLink className="w-3 h-3" />
              </a>
              . Fast reporting can block transactions before money leaves the banking system.
            </p>
          </div>

          {/* Step 3: Change Passwords */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider font-mono">
              <KeyRound className="w-4 h-4 text-amber-500" />
              <span>Step 3: Change Your Passwords Immediately</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              If you typed your password into a fake website, change your password for your email, netbanking, and social accounts immediately from a clean device. Enable <strong>Two-Factor Authentication (2FA)</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Remember: Legitimate banks will never ask you for your OTP or password over phone/email.
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs uppercase tracking-wider cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
