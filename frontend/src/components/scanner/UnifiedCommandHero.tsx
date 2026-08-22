import React, { useState } from 'react';
import { api } from '../../services/api';
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
  Zap
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
        onUrlScanComplete(report);
      } catch (err: any) {
        clearInterval(interval);
        setError(err.message || 'Unable to analyze this link. Please check spelling.');
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
        onNavigateTab('message-scanner');
      } catch (err: any) {
        setError(err.message || 'Failed to check message.');
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
        onNavigateTab('website-analyzer');
      } catch (err: any) {
        setError(err.message || 'Failed to inspect website.');
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
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Outer Glowing Glass Container */}
      <div className="relative group">
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 opacity-30 dark:opacity-40 group-hover:opacity-60 blur-xl transition duration-500" />
        
        <div className="relative rounded-3xl bg-white/95 dark:bg-slate-950/90 border border-slate-200 dark:border-cyber-border backdrop-blur-2xl p-5 sm:p-7 shadow-2xl space-y-5">
          {/* Friendly Tab Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              {[
                { id: 'url', label: '🔗 Check a Link', icon: Link2 },
                { id: 'message', label: '📩 Check a Message', icon: MessageSquareText },
                { id: 'website', label: '🏢 Check a Website', icon: ShieldCheck },
                { id: 'ioc', label: '🔎 Search Known Scams', icon: Search },
              ].map((tab) => {
                const isActive = activeVector === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveVector(tab.id as any);
                      setError(null);
                      setIocResult(null);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span>🔒 Free & 100% Private</span>
            </div>
          </div>

          {/* TAB 1: CHECK A LINK */}
          {activeVector === 'url' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">
                  Paste the suspicious link you received (from SMS, WhatsApp, or Email):
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative flex items-center w-full">
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleExecuteScan()}
                      placeholder="e.g. login-sbi-pan-update.xyz or paypa1-signin.top..."
                      disabled={isLoading}
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-inner"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleExecuteScan}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Checking...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Check This Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Try sample test links */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400 font-sans">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Try Sample Tests:</span>
                {urlPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setUrlInput(preset.url);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-800 text-xs font-medium cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CHECK A MESSAGE */}
          {activeVector === 'message' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 pb-1">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Where did you receive it?</span>
                {[
                  { id: 'sms', label: 'SMS Text', icon: Smartphone },
                  { id: 'whatsapp', label: 'WhatsApp', icon: Share2 },
                  { id: 'email', label: 'Email', icon: Mail },
                ].map((ch) => {
                  const Icon = ch.icon;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setMsgChannel(ch.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                        msgChannel === ch.id
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{ch.label}</span>
                    </button>
                  );
                })}
              </div>

              <textarea
                rows={3}
                value={msgContent}
                onChange={(e) => setMsgContent(e.target.value)}
                placeholder="Paste the suspicious message text here (e.g. 'Your electricity bill is unpaid, power will be cut tonight at 9:30 PM...')"
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-500 font-semibold">Try sample text:</span>
                  {msgPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setMsgContent(preset.text);
                        setMsgChannel(preset.channel);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-800 text-xs font-medium cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleExecuteScan}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Check Message</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CHECK A WEBSITE */}
          {activeVector === 'website' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">
                  Enter website address to check security and certificate:
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    value={siteInput}
                    onChange={(e) => setSiteInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleExecuteScan()}
                    placeholder="e.g. https://github.com or https://example-shopping.com..."
                    disabled={isLoading}
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-inner"
                  />

                  <button
                    type="button"
                    onClick={handleExecuteScan}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Check Website</span>
                  </button>
                </div>
              </div>

              {/* Sample Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Try Sample:</span>
                {websitePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSiteInput(preset.url)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-800 text-xs font-medium cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SEARCH KNOWN SCAMS */}
          {activeVector === 'ioc' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">
                  Search known scam phone numbers, fake bank websites, or scam names:
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    value={iocInput}
                    onChange={(e) => setIocInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleExecuteScan()}
                    placeholder="e.g. sbi-kyc or evil-phishing-test.top..."
                    disabled={isLoading}
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-inner"
                  />

                  <button
                    type="button"
                    onClick={handleExecuteScan}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Scam Database</span>
                  </button>
                </div>
              </div>

              {iocResult && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-600 dark:text-slate-400">Search: {iocResult.query}</span>
                    <span className={iocResult.found ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                      {iocResult.found ? '⚠️ KNOWN SCAM FOUND IN DATABASE' : '✅ NO SCAM REPORT FOUND'}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-sans">{iocResult.risk_summary}</p>
                </div>
              )}
            </div>
          )}

          {/* Animated Real-time Progress Bar */}
          {isLoading && (
            <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-300 dark:border-cyan-500/30 flex items-center gap-3 text-xs text-cyan-800 dark:text-cyan-300 font-medium animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/40 flex items-center gap-3 text-xs text-rose-800 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
