import React, { useState } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Building2,
  AlertTriangle,
  Send,
  FileCheck
} from 'lucide-react';

interface BankHelpline {
  name: string;
  tollFree: string;
  category: 'Public Bank' | 'Private Bank' | 'Payment App';
}

const BANK_HELPLINES: BankHelpline[] = [
  { name: 'State Bank of India (SBI)', tollFree: '1800 11 2211', category: 'Public Bank' },
  { name: 'HDFC Bank Emergency Fraud Desk', tollFree: '1800 1600', category: 'Private Bank' },
  { name: 'ICICI Bank 24/7 Security Hotline', tollFree: '1800 1080', category: 'Private Bank' },
  { name: 'Axis Bank Emergency Freeze', tollFree: '1800 419 5959', category: 'Private Bank' },
  { name: 'Punjab National Bank (PNB)', tollFree: '1800 180 2222', category: 'Public Bank' },
  { name: 'Google Pay Fraud Support', tollFree: '1800 419 0157', category: 'Payment App' },
  { name: 'PhonePe Emergency Fraud Desk', tollFree: '080 6872 7374', category: 'Payment App' },
  { name: 'Paytm Payment Bank Fraud Hotline', tollFree: '0120 4456 456', category: 'Payment App' }
];

export const ProductionEmergencyHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'complaint-gen' | 'bank-directory' | 'legal-checklist'>('complaint-gen');

  // Complaint Form State for NCRP (cybercrime.gov.in)
  const [incidentType, setIncidentType] = useState('UPI / Payment Transfer Fraud');
  const [utrNumber, setUtrNumber] = useState('');
  const [amountLost, setAmountLost] = useState('');
  const [victimBank, setVictimBank] = useState('');
  const [suspectIdentifier, setSuspectIdentifier] = useState('');
  const [incidentDetails, setIncidentDetails] = useState('');
  const [copiedDraft, setCopiedDraft] = useState(false);

  const generateComplaintDraft = (): string => {
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    return (
      `FORMAL CYBER CRIME INCIDENT COMPLAINT DRAFT\n` +
      `Submitted to: National Cyber Crime Reporting Portal (cybercrime.gov.in) / 1930 Helpline\n` +
      `Filing Date & Time: ${timestamp} IST\n` +
      `------------------------------------------------------------\n` +
      `1. INCIDENT CLASSIFICATION: ${incidentType}\n` +
      `2. ESTIMATED FINANCIAL LOSS: ₹${amountLost || 'Pending verification'}\n` +
      `3. TRANSACTION UTR / REF ID: ${utrNumber || 'N/A'}\n` +
      `4. AFFECTED BANK / WALLET: ${victimBank || 'Self Account'}\n` +
      `5. SUSPECT ENTITY (UPI ID / Phone / Link): ${suspectIdentifier || 'Provided in evidence attachment'}\n` +
      `6. CHRONOLOGICAL DESCRIPTION OF FRAUD:\n` +
      `${incidentDetails || 'On the stated date, an unauthorized fraudulent transaction was executed through social engineering/phishing. Immediate fund freeze request initiated.'}\n` +
      `------------------------------------------------------------\n` +
      `LEGAL STATUTES APPLICABLE (IT ACT & BNS):\n` +
      `- Section 66C Information Technology Act (Identity Theft)\n` +
      `- Section 66D Information Technology Act (Cheating by Personation using Computer Resource)\n` +
      `- Section 318 Bharatiya Nyaya Sanhita (Cheating & Dishonest Inducement of Property)\n` +
      `------------------------------------------------------------\n` +
      `RELIEF REQUESTED:\n` +
      `1. Immediate issuance of lien/freeze notice to beneficiary bank under Golden Hour protocol.\n` +
      `2. Registration of Formal NCRP Acknowledgment Number for insurance and reversal claims.`
    );
  };

  const handleCopyComplaint = () => {
    navigator.clipboard.writeText(generateComplaintDraft());
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2500);
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl relative overflow-hidden space-y-6 font-sans">
      {/* Background cyber ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300 shadow-sm">
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
              National Cyber Fraud Rapid Response & 1930 Portal
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white font-mono tracking-tight mt-1.5">
            Golden Hour Fraud Recovery & Legal Escalation Center
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Automate NCRP incident reports, freeze unauthorized fund transfers, and access 24/7 bank escalation hotlines.
          </p>
        </div>

        {/* 1930 Immediate Direct Dial Button */}
        <div className="flex items-center gap-3">
          <a
            href="tel:1930"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-mono font-black text-xs tracking-wider flex items-center gap-2 shadow-lg shadow-rose-900/40 transition-all cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            <span>DIAL 1930 TOLL-FREE</span>
          </a>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 rounded-2xl bg-[#070b12] hover:bg-[#141d2e] border border-white/10 text-slate-300 hover:text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <span>cybercrime.gov.in</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3 font-mono text-xs">
        <button
          onClick={() => setActiveTab('complaint-gen')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'complaint-gen'
              ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>NCRP Incident Complaint Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('bank-directory')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'bank-directory'
              ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Bank Emergency Freeze Directory</span>
        </button>

        <button
          onClick={() => setActiveTab('legal-checklist')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'legal-checklist'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Evidence Preservation & IT Act Protocols</span>
        </button>
      </div>

      {/* TAB 1: NCRP Complaint Generator */}
      {activeTab === 'complaint-gen' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Fields (6 cols) */}
          <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-[#030508] border border-white/10">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Send className="w-4 h-4 text-rose-400" />
              <span>Incident Information Intake</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Incident Category</label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0c121e] border border-white/10 text-white outline-none focus:border-rose-500"
                >
                  <option value="UPI / QR Code Reversal Scam">UPI / QR Code Reversal Scam</option>
                  <option value="NetBanking Phishing & Unauthorized OTP Transfer">NetBanking Phishing & Unauthorized OTP Transfer</option>
                  <option value="Credit / Debit Card Online Fraud">Credit / Debit Card Online Fraud</option>
                  <option value="Fake KYC / SIM Swapping Extortion">Fake KYC / SIM Swapping Extortion</option>
                  <option value="Extortion Video Call (Impersonation of Police/CBI)">Extortion Video Call (Impersonation of Police/CBI)</option>
                  <option value="Corporate Email Compromise (BEC)">Corporate Email Compromise (BEC)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Financial Loss Amount (₹)</label>
                  <input
                    type="text"
                    placeholder="e.g. 45000"
                    value={amountLost}
                    onChange={(e) => setAmountLost(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0c121e] border border-white/10 text-white outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Bank UTR / Transaction ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 423910293812"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0c121e] border border-white/10 text-white outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Affected Bank / Payment App</label>
                  <input
                    type="text"
                    placeholder="e.g. SBI / HDFC / PhonePe"
                    value={victimBank}
                    onChange={(e) => setVictimBank(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0c121e] border border-white/10 text-white outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Suspect Phone / UPI / URL</label>
                  <input
                    type="text"
                    placeholder="e.g. +91-98XXX or user@upi"
                    value={suspectIdentifier}
                    onChange={(e) => setSuspectIdentifier(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0c121e] border border-white/10 text-white outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Brief Description of Events</label>
                <textarea
                  rows={3}
                  placeholder="Briefly state what happened (e.g. clicked an SMS link, shared OTP under threat, scanned a fake QR code)..."
                  value={incidentDetails}
                  onChange={(e) => setIncidentDetails(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0c121e] border border-white/10 text-white outline-none focus:border-rose-500 font-sans"
                />
              </div>
            </div>
          </div>

          {/* Generated Legal Complaint Preview (6 cols) */}
          <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-[#070b12] border border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 font-mono text-xs">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <FileCheck className="w-4 h-4" />
                <span>Ready-to-Submit Complaint Draft</span>
              </span>
              <button
                type="button"
                onClick={handleCopyComplaint}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-sutra-glow cursor-pointer transition-all"
              >
                {copiedDraft ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>COPIED TO CLIPBOARD!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPY COMPLAINT TEXT</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-[#030508] border border-white/10 text-slate-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-72 select-all">
              {generateComplaintDraft()}
            </pre>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs font-sans text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                <strong>Next Action:</strong> Copy the text above, visit <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="underline font-bold text-amber-300">cybercrime.gov.in</a>, click &quot;Report Cyber Crime Related to Financial Fraud&quot;, and paste this narrative into the incident description box.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Bank Emergency Directory */}
      {activeTab === 'bank-directory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
              Direct emergency toll-free numbers to freeze net banking and stop outgoing transactions:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {BANK_HELPLINES.map((b) => (
              <div
                key={b.name}
                className="p-4 rounded-2xl bg-[#070b12] border border-white/10 hover:border-amber-500/40 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                  <span className="text-slate-400">{b.category}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                    24/7 Desk
                  </span>
                </div>
                <h4 className="text-xs font-bold font-mono text-white group-hover:text-amber-300">
                  {b.name}
                </h4>
                <a
                  href={`tel:${b.tollFree.replace(/\s/g, '')}`}
                  className="text-sm font-mono font-black text-amber-400 flex items-center gap-1.5 hover:underline"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{b.tollFree}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Evidence Preservation & Legal Protocols */}
      {activeTab === 'legal-checklist' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#070b12] border border-white/10 space-y-3">
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 w-fit">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold font-mono text-white">1. Freeze Transactions (Golden Hour)</h4>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              If reported within 2 hours of an unauthorized debit, banks and payment aggregators can freeze the beneficiary mule account before money is withdrawn at an ATM.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#070b12] border border-white/10 space-y-3">
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 w-fit">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold font-mono text-white">2. Preserve Digital Evidence</h4>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Take complete screenshots showing sender phone numbers, exact timestamps, SMS body, transaction debits, and call logs. Do NOT delete WhatsApp chat threads.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#070b12] border border-white/10 space-y-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 w-fit">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold font-mono text-white">3. Statutory Filing under IT Act</h4>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Section 66C and 66D of the Information Technology Act 2000 classify identity theft and cyber personation as cognizable, non-bailable offenses punishable by up to 3 years imprisonment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
