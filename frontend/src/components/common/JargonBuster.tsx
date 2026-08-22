import React, { useState } from 'react';
import { HelpCircle, X, Info } from 'lucide-react';

const GLOSSARY: Record<string, { title: string; explanation: string; example: string }> = {
  'otp': {
    title: 'OTP (One-Time Password)',
    explanation: 'A temporary secret security code sent to your phone or email. Real banks and companies will NEVER call or text you asking you to tell them your OTP.',
    example: 'Example: "Share OTP to receive cashback" is ALWAYS a scam. You never need an OTP to RECEIVE money.'
  },
  'phishing': {
    title: 'Phishing Scam',
    explanation: 'A fake message, email, or website created by scammers to trick you into revealing passwords, credit card numbers, or bank account details.',
    example: 'Example: A fake message claiming your Netflix or bank account is suspended.'
  },
  'typosquatting': {
    title: 'Lookalike / Fake Link (Typosquatting)',
    explanation: 'A scam website address deliberately misspelled to look almost identical to a real, trusted company.',
    example: 'Example: "paypa1-login.com" using the number "1" instead of the letter "l" in "paypal.com".'
  },
  'urgency': {
    title: 'Urgency Pressure Tactic',
    explanation: 'Scammers create fake panics (like "Your electricity will be cut in 1 hour" or "Account blocked tonight") so you rush and make mistakes without thinking.',
    example: 'Rule of thumb: Any message threatening immediate disconnection or arrest is almost always fraud.'
  },
  'upi_qr': {
    title: 'UPI / QR Code Scam',
    explanation: 'Scanning a QR code or entering your UPI PIN always SENDS money out of your bank account. You NEVER need to enter your PIN to receive money.',
    example: 'Rule of thumb: If someone on OLX/Marketplace asks you to scan a QR to get paid, it is a 100% scam.'
  },
  'tld': {
    title: 'Website Extension (TLD)',
    explanation: 'The ending of a website address (like .com, .org, or .xyz). Cheap disposable endings like .xyz, .top, or .club are frequently used by scammers.',
    example: 'Real bank: sbi.co.in vs Scam site: sbi-pan-update.xyz'
  }
};

export const JargonBuster: React.FC<{ termKey: string; customLabel?: string }> = ({
  termKey,
  customLabel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const data = GLOSSARY[termKey.toLowerCase()] || {
    title: customLabel || termKey,
    explanation: 'A security term used in threat analysis.',
    example: ''
  };

  return (
    <span className="inline-flex items-center gap-1 relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:underline font-semibold cursor-pointer"
      >
        <span>{customLabel || data.title}</span>
        <HelpCircle className="w-3.5 h-3.5 text-cyan-500 inline" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-cyan-500/50 p-5 space-y-3 shadow-2xl animate-in fade-in zoom-in-95 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {data.title}
                </h4>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              {data.explanation}
            </p>

            {data.example && (
              <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-500/30 text-[11px] text-cyan-900 dark:text-cyan-200">
                <strong>💡 Tip:</strong> {data.example}
              </div>
            )}

            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold uppercase tracking-wider hover:bg-cyan-400 cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </span>
  );
};
