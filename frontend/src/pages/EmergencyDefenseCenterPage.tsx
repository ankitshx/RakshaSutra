import React, { useState } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  Copy,
  Check,
  CreditCard,
  KeyRound,
  FileText,
  ArrowRight,
  Terminal,
  ExternalLink
} from 'lucide-react';

interface IncidentScenario {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  containSteps: string[];
  assessSteps: string[];
  secureSteps: string[];
  recoverSteps: string[];
  monitorSteps: string[];
}

export const EmergencyDefenseCenterPage: React.FC = () => {
  const scenarios: IncidentScenario[] = [
    {
      id: 'clicked_link',
      title: 'I Clicked a Suspicious Link / Visited Phishing Site',
      icon: ExternalLink,
      description: 'You tapped or clicked an unfamiliar or suspicious link via SMS, WhatsApp, or email.',
      containSteps: [
        'Close the browser tab immediately. Do not click "Allow" on any push notification or permission prompts.',
        'Disconnect from active Wi-Fi or mobile data temporarily if you see unexpected file downloads in progress.',
        'Clear your browser cache, active cookies, and local site storage for the past 1 hour.'
      ],
      assessSteps: [
        'Did you enter any usernames, passwords, or personal identity numbers (PAN/Aadhaar)?',
        'Did you submit credit/debit card credentials or OTP tokens?',
        'Did the browser prompt you to download an APK or .exe file?'
      ],
      secureSteps: [
        'If credentials were entered, immediately change the password from a separate clean device.',
        'Enable 2-Factor Authentication (App-based authenticator or FIDO2 key).',
        'If banking data was submitted, immediately freeze your card in your official banking app.'
      ],
      recoverSteps: [
        'Review recent active sessions and tap "Log Out from All Other Devices" on your primary account settings.',
        'Verify your account recovery phone number and backup email were not altered.'
      ],
      monitorSteps: [
        'Monitor your bank SMS statements for the next 72 hours for unauthorized micro-transactions.',
        'Add the destination URL to the RakhshaSutra Threat Investigation Center to verify its infrastructure.'
      ]
    },
    {
      id: 'entered_password',
      title: 'I Entered My Password on an Unfamiliar / Fake Portal',
      icon: KeyRound,
      description: 'You entered your account credentials on a fraudulent landing page (fake banking, fake email login, fake utility portal).',
      containSteps: [
        'Open your official account portal from a trusted bookmark or clean device immediately.',
        'Initiate an immediate password reset on the legitimate service.',
        'Revoke all existing logged-in sessions across all devices.'
      ],
      assessSteps: [
        'Do you reuse this same password across other services (e.g. email, PayPal, netbanking)?',
        'Was SMS OTP requested and submitted on the fake portal?'
      ],
      secureSteps: [
        'Update passwords on ALL other accounts where the same or similar password was utilized.',
        'Upgrade authentication from SMS OTP to Hardware Security Keys or Authenticator App (TOTP).'
      ],
      recoverSteps: [
        'Generate new emergency account backup codes and store them in an offline encrypted vault.',
        'Audit authorized third-party OAuth apps connected to your Google/Microsoft account.'
      ],
      monitorSteps: [
        'Enroll your email in the RakhshaSutra Dark Web Exposure monitor to watch for database leaks.'
      ]
    },
    {
      id: 'downloaded_file',
      title: 'I Downloaded / Opened a Suspicious File or APK',
      icon: Terminal,
      description: 'You downloaded an unexpected attachment, invoice .exe, screen-sharing app (AnyDesk/TeamViewer), or sideloaded APK.',
      containSteps: [
        'Immediately disconnect your device from the internet (toggle Airplane Mode ON).',
        'Do not open or grant Accessibility / Device Administrator permissions to the downloaded application.',
        'If a remote-access app was installed at a caller’s request, uninstall it immediately.'
      ],
      assessSteps: [
        'Did the application prompt for SMS read permissions or accessibility access?',
        'Did your device battery suddenly drain rapidly or overheat?'
      ],
      secureSteps: [
        'Run a full antimalware/antivirus scan using your built-in OS protection (Google Play Protect / Windows Defender).',
        'Check device administrator apps in Settings and revoke unknown authorizations.'
      ],
      recoverSteps: [
        'If suspicious activity persists, back up important documents and perform a factory reset.',
        'Change master passwords from another clean hardware device.'
      ],
      monitorSteps: [
        'Keep Play Protect and automated system updates enabled.'
      ]
    },
    {
      id: 'money_transferred',
      title: 'Money Was Transferred / Unauthorized Banking Fraud',
      icon: CreditCard,
      description: 'Funds were illicitly debited via UPI, fake merchant QR, netbanking, or unauthorized card charges.',
      containSteps: [
        'IMMEDIATELY dial 1930 (National Cyber Financial Fraud Helpline - India). Fast reporting within the "Golden Hour" freezes fund transfers.',
        'Open your official banking app and instantly FREEZE your debit/credit cards, UPI IDs, and netbanking access.',
        'Do not delete any fraudulent SMS, WhatsApp chat, or transaction confirmation notifications.'
      ],
      assessSteps: [
        'Record the exact Transaction Reference Number (UTR / RRN), date, time, and debited amount.',
        'Identify the scammer’s UPI handle, phone number, and beneficiary account details if displayed.'
      ],
      secureSteps: [
        'Visit your bank branch with written communication requesting an immediate chargeback and transaction freeze.',
        'File an official formal complaint on https://cybercrime.gov.in.'
      ],
      recoverSteps: [
        'Request your bank to issue fresh replacement cards with newly generated PINs.',
        'Update your UPI PIN and netbanking login passwords from a secure Wi-Fi network.'
      ],
      monitorSteps: [
        'Keep the cybercrime acknowledgment slip (Acknowledgement Number) for insurance and police follow-ups.'
      ]
    }
  ];

  const [selectedScenario, setSelectedScenario] = useState<IncidentScenario>(scenarios[0]);
  const [copiedText, setCopiedText] = useState(false);

  const bankHelplines = [
    { bank: 'State Bank of India (SBI)', phone: '1800 1234 / 1800 2100', blockSms: 'BLOCK <Account No> to 567676' },
    { bank: 'HDFC Bank', phone: '1800 202 6161 / 1800 1600', blockSms: 'Block card in HDFC Mobile App' },
    { bank: 'ICICI Bank', phone: '1800 1080', blockSms: 'SMS BLOCK <Last 4 digits> to 5676766' },
    { bank: 'Axis Bank', phone: '1860 419 5555 / 1860 500 5555', blockSms: 'SMS BLOCKCARD to 5676782' },
    { bank: 'Punjab National Bank (PNB)', phone: '1800 180 2222', blockSms: 'SMS HOT <Account No> to 5607040' }
  ];

  const [dossierTarget, setDossierTarget] = useState('');
  const [dossierChannel, setDossierChannel] = useState('SMS / Phone');
  const [dossierUtr, setDossierUtr] = useState('');
  const [dossierLoss, setDossierLoss] = useState('');
  const [dossierSummary, setDossierSummary] = useState('');
  const [generatedDraft, setGeneratedDraft] = useState<string | null>(null);

  const handleGenerateDraft = () => {
    const text = `CYBER FRAUD INCIDENT REPORT (DRAFT FOR 1930 / CYBERCRIME.GOV.IN)
----------------------------------------------------------------------
Incident Date/Time : ${new Date().toLocaleString()}
Incident Type      : Financial Cyber Fraud & Phishing Lure
Channel / Source   : ${dossierChannel}
Scammer Identifier : ${dossierTarget || 'Not specified'}
Transaction UTR/ID : ${dossierUtr || 'N/A'}
Approximate Loss   : ${dossierLoss ? 'Rs ' + dossierLoss : 'N/A'}

SUMMARY OF EVENTS:
${dossierSummary || 'Victim was contacted via social engineering and coerced into sharing OTP/visiting a fraudulent portal resulting in unauthorized actions.'}

EVIDENCE PRESERVED:
- Transaction SMS and Bank debit confirmation records
- Screenshots of scam message and destination URL
- Device logs and browser session history

IMMEDIATE CONTAINMENT TAKEN:
1. Contacted Bank customer care to freeze compromised cards/UPI IDs.
2. Dialed National Cyber Fraud Helpline (1930).
3. Generated cryptographic incident artifact on RakhshaSutra Defense Platform.
----------------------------------------------------------------------`;
    setGeneratedDraft(text);
  };

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Emergency Emergency Banner (RDS 2.0) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-rose-950/25 border border-rose-500/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-500/50 text-xs font-mono font-bold flex items-center gap-1.5 shadow-ruby-glow">
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>INCIDENT CONTAINMENT & CRISIS RESPONSE</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white font-mono tracking-tight">
            "Something Happened?" Emergency Response Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-2xl leading-relaxed">
            Follow calm, ordered containment steps. If financial loss occurred, call the National Helpline <strong>1930</strong> immediately within the Golden Hour.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0 relative">
          <a
            href="tel:1930"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-sm font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/30 cursor-pointer"
          >
            <PhoneCall className="w-5 h-5" />
            <span>DIAL 1930 (HELPLINE)</span>
          </a>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-[#0c121e] hover:bg-[#141d2e] border border-white/10 text-slate-200 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-amber-400" />
            <span>cybercrime.gov.in</span>
          </a>
        </div>
      </div>

      {/* Incident Scenario Selector */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold font-mono text-slate-400 uppercase tracking-wider">
          Select Your Incident Scenario:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            const isSelected = selectedScenario.id === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => setSelectedScenario(sc)}
                className={`p-6 rounded-3xl border transition-all cursor-pointer space-y-3 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#141d2e] border-l-2 border-l-amber-500 border-y border-r border-white/10 shadow-sutra-glow'
                    : 'bg-[#0c121e] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="space-y-3">
                  <div className={`p-3 rounded-2xl w-fit ${isSelected ? 'bg-amber-500 text-slate-950 shadow-sutra-glow' : 'bg-[#070b12] text-slate-400 border border-white/5'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold font-mono text-white leading-snug">
                    {sc.title}
                  </h4>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    {sc.description}
                  </p>
                </div>

                <span className={`text-xs font-mono font-bold flex items-center gap-1 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`}>
                  <span>{isSelected ? 'Active Playbook' : 'View Action Steps'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Playbook 5-Stage Checklist */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase">
              Incident Response Checklist
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-mono text-white">
              {selectedScenario.title}
            </h3>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { phase: 'Phase 1: Immediate Containment', list: selectedScenario.containSteps, color: 'text-rose-400', badge: 'CRITICAL' },
            { phase: 'Phase 2: Exposure Assessment', list: selectedScenario.assessSteps, color: 'text-amber-400', badge: 'EVALUATE' },
            { phase: 'Phase 3: Secure & Lock Down', list: selectedScenario.secureSteps, color: 'text-blue-400', badge: 'HARDEN' },
            { phase: 'Phase 4: Account Recovery', list: selectedScenario.recoverSteps, color: 'text-emerald-400', badge: 'RECOVER' },
            { phase: 'Phase 5: Continuous Monitoring', list: selectedScenario.monitorSteps, color: 'text-purple-400', badge: 'MONITOR' }
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-[#070b12] border border-white/10 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <h4 className={`text-sm font-bold ${item.color} flex items-center gap-2`}>
                  <span>{item.phase}</span>
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] bg-[#141d2e] border border-white/10 text-slate-300 font-bold">
                  {item.badge}
                </span>
              </div>

              <ul className="space-y-2 text-slate-300 font-sans text-xs">
                {item.list.map((step, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-2.5">
                    <span className="text-amber-400 font-mono font-bold">{sIdx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Bank Helplines Grid */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 space-y-6 shadow-2xl">
        <div className="space-y-1 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-black font-mono text-white tracking-wide uppercase">
              Major Bank Emergency Card / Netbanking Freeze Helplines
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Direct numbers to freeze accounts and block unauthorized debit cards
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
          {bankHelplines.map((b, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[#070b12] border border-white/10 space-y-2">
              <span className="text-white font-bold block">{b.bank}</span>
              <div className="flex justify-between text-slate-400">
                <span>Helpline:</span>
                <span className="text-amber-400 font-bold">{b.phone}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>SMS Action:</span>
                <span className="text-slate-300 truncate">{b.blockSms}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complaint Generator */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 space-y-6 shadow-2xl">
        <div className="space-y-1 border-b border-white/10 pb-4">
          <h3 className="text-base font-black font-mono text-white tracking-wide uppercase flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Official Cybercrime Report Text Generator</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Draft a formatted incident report ready to paste into cybercrime.gov.in or email to your bank
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <input
            type="text"
            value={dossierTarget}
            onChange={(e) => setDossierTarget(e.target.value)}
            placeholder="Scammer Phone / UPI / Fake URL (e.g. 9876543210 or sbi-pan.top)"
            className="px-4 py-3 rounded-xl bg-[#030508] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <input
            type="text"
            value={dossierUtr}
            onChange={(e) => setDossierUtr(e.target.value)}
            placeholder="Transaction Reference Number (UTR / RRN / Card No)"
            className="px-4 py-3 rounded-xl bg-[#030508] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <input
            type="text"
            value={dossierLoss}
            onChange={(e) => setDossierLoss(e.target.value)}
            placeholder="Loss Amount in INR (e.g. 25,000)"
            className="px-4 py-3 rounded-xl bg-[#030508] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <input
            type="text"
            value={dossierChannel}
            onChange={(e) => setDossierChannel(e.target.value)}
            placeholder="Contact Channel (SMS / WhatsApp / Call / Email)"
            className="px-4 py-3 rounded-xl bg-[#030508] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <textarea
          rows={3}
          value={dossierSummary}
          onChange={(e) => setDossierSummary(e.target.value)}
          placeholder="Brief description of what happened (e.g. Received SMS claiming power cutoff, called number, clicked link, debited money)..."
          className="w-full p-4 rounded-2xl bg-[#030508] border border-white/10 text-white placeholder-slate-500 font-sans text-xs focus:outline-none focus:border-amber-500"
        />

        <button
          onClick={handleGenerateDraft}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sutra-glow"
        >
          <FileText className="w-4 h-4" />
          <span>GENERATE INCIDENT DRAFT</span>
        </button>

        {generatedDraft && (
          <div className="p-5 rounded-2xl bg-[#070b12] border border-amber-500/40 space-y-3 font-mono text-xs animate-in fade-in duration-200">
            <div className="flex justify-between items-center text-amber-400 font-bold">
              <span>Formatted Incident Report:</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedDraft);
                  setCopiedText(true);
                  setTimeout(() => setCopiedText(false), 2000);
                }}
                className="hover:underline cursor-pointer flex items-center gap-1"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Copied ✓' : 'Copy Text'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-[#030508] border border-white/5 text-slate-200 overflow-x-auto text-[11px] whitespace-pre-wrap">
              {generatedDraft}
            </pre>
          </div>
        )}
      </div>

    </div>
  );
};
