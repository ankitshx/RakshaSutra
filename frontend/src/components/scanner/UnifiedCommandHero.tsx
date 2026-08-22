import React, { useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { SubscriptionLimitModal } from '../common/SubscriptionLimitModal';
import type { ScanResponse, MessageScanResponse, WebsiteScanResponse } from '../../types';
import {
  Link2,
  MessageSquareText,
  ShieldCheck,
  Search,
  Loader2,
  AlertTriangle,
  Sparkles,
  Smartphone,
  Mail,
  Share2,
  Zap,
  Globe
} from 'lucide-react';

interface UnifiedCommandHeroProps {
  onUrlScanComplete: (report: ScanResponse) => void;
  onMessageScanComplete?: (report: MessageScanResponse) => void;
  onWebsiteScanComplete?: (report: WebsiteScanResponse) => void;
  onNavigateTab: (tab: string) => void;
}

export const UnifiedCommandHero: React.FC<UnifiedCommandHeroProps> = ({
  onUrlScanComplete,
  onNavigateTab
}) => {
  const { user, isAdmin, refreshUser } = useAuth();
  const [activeVector, setActiveVector] = useState<'url' | 'message' | 'website' | 'ioc'>('url');
  
  // URL Input State
  const [urlInput, setUrlInput] = useState('');
  
  // Message Input State
  const [msgContent, setMsgContent] = useState('');
  const [msgChannel, setMsgChannel] = useState('sms');
  
  // Website Input State
  const [siteInput, setSiteInput] = useState('');

  // IOC Input State
  const [iocInput, setIocInput] = useState('');
  const [iocResult, setIocResult] = useState<any | null>(null);

  // Common UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const isPro = user?.subscription_tier === 'pro' || user?.subscription_tier === 'enterprise' || isAdmin;
  const scansLeft = user ? Math.max(0, (user.monthly_quota || 10) - (user.scans_used || 0)) : 10;

  const urlPresets = [
    { label: 'Fake SBI Banking Link', url: 'http://login-sbi-pan-update.xyz/verify.php' },
    { label: 'Fake PayPal Link', url: 'http://paypa1-security-auth.top/signin' },
    { label: 'Safe Official Website (GitHub)', url: 'https://github.com' }
  ];

  const msgPresets = [
    {
      label: 'Fake Electricity Cut Threat',
      text: 'Dear Customer, your electricity power bill is unpaid. Your connection will be disconnected tonight at 9:30 PM. Call power officer on 9876543210 immediately.',
      channel: 'sms'
    },
    {
      label: 'Fake SBI Account Block Alert',
      text: 'URGENT: Your SBI bank account will be blocked tonight. Click http://sbi-pan-kyc.top to update PAN and submit OTP immediately.',
      channel: 'sms'
    },
    {
      label: 'OLX / QR Code Payment Trap',
      text: 'I sent QR code for Rs 15,000 for your item. Scan QR code in Google Pay and enter UPI PIN to receive money.',
      channel: 'whatsapp'
    }
  ];

  const websitePresets = [
    { label: 'GitHub.com (Safe Official)', url: 'https://github.com' },
    { label: 'Google.com (Safe Official)', url: 'https://google.com' },
    { label: 'Unencrypted Test Site', url: 'http://example.com' }
  ];

  const handleExecuteScan = async () => {
    setError(null);
    setIocResult(null);

    // Pre-check free limit
    if (user && !isPro && scansLeft <= 0) {
      setIsUpgradeModalOpen(true);
      return;
    }

    if (activeVector === 'url') {
      const target = urlInput.trim();
      if (!target) {
        setError('Please paste a link or website address to check.');
        return;
      }

      setIsLoading(true);
      setStatusMessage('Checking website address against known scam databases...');

      const steps = [
        'Checking if this is a lookalike fake brand address...',
        'Inspecting whether the website is newly created or disposable...',
        'Checking against global scam & phishing threat lists...',
        'Generating easy-to-understand safety verdict...'
      ];

      let idx = 0;
      const interval = setInterval(() => {
        if (idx < steps.length) {
          setStatusMessage(steps[idx]);
          idx++;
        }
      }, 300);

      try {
        const report = await api.scanUrl(target);
        clearInterval(interval);
        await refreshUser();
        onUrlScanComplete(report);
      } catch (err: any) {
        clearInterval(interval);
        if (err.message && (err.message.includes('SUBSCRIPTION_REQUIRED') || err.message.includes('quota') || err.message.includes('402'))) {
          setIsUpgradeModalOpen(true);
        } else {
          setError(err.message || 'Unable to analyze this link. Please check spelling.');
        }
      } finally {
        setIsLoading(false);
        setStatusMessage('');
      }
    } else if (activeVector === 'message') {
      if (!msgContent.trim()) {
        setError('Please paste the message text you received.');
        return;
      }
      setIsLoading(true);
      setStatusMessage('Analyzing message for fake urgency, OTP traps, or scam wording...');

      try {
        await api.scanMessage(msgContent.trim(), msgChannel);
        await refreshUser();
        onNavigateTab('message-scanner');
      } catch (err: any) {
        if (err.message && (err.message.includes('SUBSCRIPTION_REQUIRED') || err.message.includes('quota') || err.message.includes('402'))) {
          setIsUpgradeModalOpen(true);
        } else {
          setError(err.message || 'Failed to check message.');
        }
      } finally {
        setIsLoading(false);
        setStatusMessage('');
      }
    } else if (activeVector === 'website') {
      const target = siteInput.trim();
      if (!target) {
        setError('Please enter the website address to audit.');
        return;
      }
      setIsLoading(true);
      setStatusMessage('Checking website security certificate and encryption...');

      try {
        await api.scanWebsite(target);
        await refreshUser();
        onNavigateTab('website-analyzer');
      } catch (err: any) {
        if (err.message && (err.message.includes('SUBSCRIPTION_REQUIRED') || err.message.includes('quota') || err.message.includes('402'))) {
          setIsUpgradeModalOpen(true);
        } else {
          setError(err.message || 'Failed to inspect website.');
        }
      } finally {
        setIsLoading(false);
        setStatusMessage('');
      }
    } else if (activeVector === 'ioc') {
      const query = iocInput.trim();
      if (!query) {
        setError('Please enter a phone number, website, or keyword to search.');
        return;
      }
      setIsLoading(true);
      setStatusMessage('Searching global cyber fraud records...');

      try {
        const res = await api.searchIOC(query);
        setIocResult(res);
      } catch (err: any) {
        setError(err.message || 'Failed to search records.');
      } finally {
        setIsLoading(false);
        setStatusMessage('');
      }
    }
  };

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 bg-white border border-cyan-500/30 dark:border-cyan-500/30 border-slate-200 shadow-2xl p-6 sm:p-10 transition-all duration-300">
        {/* Background glow accents */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/10 dark:bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-blue-600/10 dark:bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          {/* Header Tagline & Subscription Quota Pill */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 dark:bg-cyan-500/10 bg-cyan-50 border border-cyan-500/30 dark:border-cyan-500/30 border-cyan-200 text-cyan-400 dark:text-cyan-400 text-cyan-800 text-xs font-mono font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>AI CYBER DEFENSE SCANNER</span>
              </div>

              {/* Free Scans Remaining vs Pro Badge */}
              {isPro ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PRO UNLIMITED SCANS</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 hover:bg-amber-900/80 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{scansLeft} of 10 Free Scans Left • Upgrade</span>
                </button>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white dark:text-white text-slate-900">
              Is It Safe? <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Check Before You Click.</span>
            </h1>
            
            <p className="text-sm sm:text-base text-slate-400 dark:text-slate-400 text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Paste any suspicious link, WhatsApp message, or SMS to verify if it's safe or an active cyber fraud.
            </p>
          </div>

          {/* Unified Vector Tabs */}
          <div className="flex items-center justify-center p-1.5 rounded-2xl bg-slate-950 dark:bg-slate-950 bg-slate-100 border border-slate-800 dark:border-slate-800 border-slate-200 max-w-xl mx-auto shadow-inner">
            <button
              onClick={() => { setActiveVector('url'); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeVector === 'url'
                  ? 'bg-cyan-500 text-slate-950 shadow-neon-cyan font-black'
                  : 'text-slate-400 dark:text-slate-400 text-slate-600 hover:text-white dark:hover:text-white hover:text-slate-950'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>Link / URL</span>
            </button>

            <button
              onClick={() => { setActiveVector('message'); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeVector === 'message'
                  ? 'bg-cyan-500 text-slate-950 shadow-neon-cyan font-black'
                  : 'text-slate-400 dark:text-slate-400 text-slate-600 hover:text-white dark:hover:text-white hover:text-slate-950'
              }`}
            >
              <MessageSquareText className="w-4 h-4" />
              <span>SMS / Message</span>
            </button>

            <button
              onClick={() => { setActiveVector('website'); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeVector === 'website'
                  ? 'bg-cyan-500 text-slate-950 shadow-neon-cyan font-black'
                  : 'text-slate-400 dark:text-slate-400 text-slate-600 hover:text-white dark:hover:text-white hover:text-slate-950'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Website Audit</span>
            </button>

            <button
              onClick={() => { setActiveVector('ioc'); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeVector === 'ioc'
                  ? 'bg-cyan-500 text-slate-950 shadow-neon-cyan font-black'
                  : 'text-slate-400 dark:text-slate-400 text-slate-600 hover:text-white dark:hover:text-white hover:text-slate-950'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Fraud DB</span>
            </button>
          </div>

          {/* Interactive Input Form */}
          <div className="bg-slate-950/90 dark:bg-slate-950/90 bg-slate-50 border border-slate-800 dark:border-slate-800 border-slate-200 rounded-3xl p-5 sm:p-7 shadow-inner space-y-4">
            {activeVector === 'url' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                      <Link2 className="w-5 h-5 text-cyan-400" />
                    </div>
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleExecuteScan()}
                      placeholder="Paste link e.g. http://login-sbi-update.xyz or bank-kyc.top"
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-900 dark:bg-slate-900 bg-white border border-slate-700 dark:border-slate-700 border-slate-300 text-white dark:text-white text-slate-900 placeholder-slate-500 text-sm sm:text-base font-mono focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    onClick={handleExecuteScan}
                    disabled={isLoading || !urlInput.trim()}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Checking...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>Scan Link</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Preset Fast Testing Chips */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[11px] text-slate-400 font-mono">Try Example:</span>
                  {urlPresets.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setUrlInput(p.url)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-900 bg-slate-200 hover:bg-slate-800 dark:hover:bg-slate-800 border border-slate-700 dark:border-slate-700 border-slate-300 text-[11px] text-slate-300 dark:text-slate-300 text-slate-700 font-mono transition-colors cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeVector === 'message' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1">
                  <span className="text-xs text-slate-400 font-mono">Channel:</span>
                  {[
                    { id: 'sms', label: 'SMS', icon: Smartphone },
                    { id: 'whatsapp', label: 'WhatsApp', icon: Share2 },
                    { id: 'email', label: 'Email', icon: Mail }
                  ].map((c) => {
                    const CIcon = c.icon;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setMsgChannel(c.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          msgChannel === c.id
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        <CIcon className="w-3.5 h-3.5" />
                        <span>{c.label}</span>
                      </button>
                    );
                  })}
                </div>

                <textarea
                  rows={3}
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                  placeholder="Paste suspicious SMS or WhatsApp message (e.g. 'Your electricity bill unpaid, connection cutoff tonight...')"
                  className="w-full p-3.5 rounded-2xl bg-slate-900 dark:bg-slate-900 bg-white border border-slate-700 dark:border-slate-700 border-slate-300 text-white dark:text-white text-slate-900 placeholder-slate-500 text-xs sm:text-sm font-sans focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none"
                  disabled={isLoading}
                />

                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-mono">Presets:</span>
                    {msgPresets.map((m, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setMsgContent(m.text); setMsgChannel(m.channel); }}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono hover:text-white transition-colors cursor-pointer"
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleExecuteScan}
                    disabled={isLoading || !msgContent.trim()}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquareText className="w-4 h-4" />}
                    <span>Analyze Message</span>
                  </button>
                </div>
              </div>
            )}

            {activeVector === 'website' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                      <Globe className="w-5 h-5 text-cyan-400" />
                    </div>
                    <input
                      type="url"
                      value={siteInput}
                      onChange={(e) => setSiteInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleExecuteScan()}
                      placeholder="Enter website domain e.g. https://mybank.com"
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-900 dark:bg-slate-900 bg-white border border-slate-700 dark:border-slate-700 border-slate-300 text-white dark:text-white text-slate-900 placeholder-slate-500 text-sm sm:text-base font-mono focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    onClick={handleExecuteScan}
                    disabled={isLoading || !siteInput.trim()}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Globe className="w-5 h-5" />}
                    <span>Audit Website</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[11px] text-slate-400 font-mono">Try Example:</span>
                  {websitePresets.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSiteInput(p.url)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-slate-300 font-mono transition-colors cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeVector === 'ioc' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                      <Search className="w-5 h-5 text-cyan-400" />
                    </div>
                    <input
                      type="text"
                      value={iocInput}
                      onChange={(e) => setIocInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleExecuteScan()}
                      placeholder="Search phone number, domain, UPI ID or scam keyword..."
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-900 dark:bg-slate-900 bg-white border border-slate-700 dark:border-slate-700 border-slate-300 text-white dark:text-white text-slate-900 placeholder-slate-500 text-sm sm:text-base font-mono focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    onClick={handleExecuteScan}
                    disabled={isLoading || !iocInput.trim()}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Search className="w-5 h-5" />}
                    <span>Search Fraud DB</span>
                  </button>
                </div>

                {iocResult && (
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Match Found:</span>
                      <span className="font-bold text-rose-400">{iocResult.threat_category || 'FLAGGED_FRAUD'}</span>
                    </div>
                    <p className="text-slate-300">{iocResult.description || 'Reported multiple times by community & cyber cell telemetry.'}</p>
                  </div>
                )}
              </div>
            )}

            {/* Scanning Progress Banner */}
            {isLoading && (
              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-3 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
                <span className="font-semibold">{statusMessage}</span>
              </div>
            )}

            {/* Error Notification */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Subscription Limit Modal */}
      <SubscriptionLimitModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onSuccess={() => refreshUser()}
      />
    </>
  );
};
