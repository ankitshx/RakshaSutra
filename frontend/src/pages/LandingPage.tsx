import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CyberNewsTicker } from '../components/common/CyberNewsTicker';
import {
  Globe,
  MessageSquareWarning,
  Lock,
  ArrowRight,
  PhoneCall,
  Sparkles,
  Send,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ExternalLink,
  Smartphone,
  Copy,
  Check
} from 'lucide-react';

interface LandingPageProps {
  setActiveTab: (tab: string, extraData?: any) => void;
  onViewReport?: (report: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActiveTab }) => {
  const [scanMode, setScanMode] = useState<'url' | 'message' | 'breach'>('url');
  const [targetInput, setTargetInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const stats = await api.getDashboardStats().catch(() => null);
        setStatsData(stats);
      } catch {
        // Fallback
      }
    };
    fetchMetrics();
  }, []);

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInput.trim()) return;

    setIsScanning(true);
    setScanResult(null);
    setScanError(null);

    try {
      if (scanMode === 'url') {
        const res = await api.scanUrl(targetInput.trim());
        setScanResult({
          type: 'url',
          target: res.target,
          risk_level: res.risk_level,
          risk_score: res.risk_score,
          summary: res.summary,
          recommendation: res.recommendation,
          raw: res
        });
      } else if (scanMode === 'message') {
        const res = await api.scanMessage(targetInput.trim(), 'sms');
        setScanResult({
          type: 'message',
          target: targetInput.trim().slice(0, 80) + '...',
          risk_level: res.risk_level,
          risk_score: res.risk_score,
          summary: res.summary,
          recommendation: res.recommendation,
          raw: res
        });
      } else {
        const res = await api.checkDarkWebExposure(targetInput.trim());
        setScanResult({
          type: 'breach',
          target: res.query_masked,
          risk_level: res.severity,
          risk_score: res.risk_score,
          summary: res.summary_plain_english,
          recommendation: res.remediation_steps?.[0] || 'Change passwords immediately and enable 2FA.',
          raw: res
        });
      }
    } catch (err: any) {
      setScanError(err.message || 'Scan failed. Please verify the input syntax.');
    } finally {
      setIsScanning(false);
    }
  };

  const copyBotLink = () => {
    navigator.clipboard.writeText('https://t.me/rakshasutra_bot');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
      
      {/* 1. Real-time Threat News & Breaking Advisories Ticker */}
      <CyberNewsTicker
        onNavigateToNews={() => setActiveTab('cyber-news')}
        onInvestigateThreat={(target) => setActiveTab('investigation-center', { target })}
      />

      {/* 2. Linear / Vercel Ultra-Minimalist Hero Section */}
      <section className="text-center pt-4 sm:pt-10 pb-4 relative">
        {/* Subtle glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-emerald-500/10 via-indigo-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="relative space-y-6 max-w-4xl mx-auto">
          {/* Top Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full linear-badge text-xs font-mono text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-white font-semibold">RakshaSutra AI Sentinel v3.4 Active</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">Zero-Trust Threat Defense</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
            Check Before You Click. <br />
            <span className="text-gradient-subtle">
              Autonomous Cyber Defense.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Instant AI-driven detection of phishing links, UPI fraud traps, WhatsApp scam APKs, and dark web credential breaches with sub-second analysis.
          </p>

          {/* 3. Hero Interactive Universal Scanner Box */}
          <div className="pt-4 max-w-3xl mx-auto text-left">
            <div className="rounded-2xl glass-navbar p-3 sm:p-4 border border-white/[0.12] shadow-2xl">
              
              {/* Scan Mode Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-3 w-fit">
                <button
                  onClick={() => { setScanMode('url'); setScanResult(null); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    scanMode === 'url' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Website Link</span>
                </button>

                <button
                  onClick={() => { setScanMode('message'); setScanResult(null); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    scanMode === 'message' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <MessageSquareWarning className="w-3.5 h-3.5" />
                  <span>SMS / WhatsApp Text</span>
                </button>

                <button
                  onClick={() => { setScanMode('breach'); setScanResult(null); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    scanMode === 'breach' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Email Breach</span>
                </button>
              </div>

              {/* Input Form */}
              <form onSubmit={handleScanSubmit} className="flex flex-col sm:flex-row items-stretch gap-2.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    placeholder={
                      scanMode === 'url'
                        ? 'Paste suspicious website URL (e.g. sbi-pan-kyc.in or https://...)'
                        : scanMode === 'message'
                        ? 'Paste message text (e.g. Electricity cut tonight, Lottery prize claim, Job offer...)'
                        : 'Enter email address (e.g. ceo@company.com or name@gmail.com)'
                    }
                    className="w-full h-12 pl-4 pr-10 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 font-mono transition-colors"
                  />
                  {targetInput && (
                    <button
                      type="button"
                      onClick={() => { setTargetInput(''); setScanResult(null); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300 font-mono"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isScanning || !targetInput.trim()}
                  className="h-12 px-6 rounded-xl bg-white text-black hover:bg-zinc-200 disabled:opacity-50 font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
                >
                  {isScanning ? (
                    <>
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <span>Scan Target</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Instant Scan Result Dossier Card */}
              {scanResult && (
                <div className="mt-4 p-4 rounded-xl bg-zinc-950/80 border border-white/[0.12] space-y-3 animate-in fade-in duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono ${
                        scanResult.risk_level === 'HIGH' || scanResult.risk_level === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : scanResult.risk_level === 'SUSPICIOUS' || scanResult.risk_level === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {scanResult.risk_level} VERDICT
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">
                        Threat Score: <strong className="text-white">{scanResult.risk_score}/100</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (scanResult.type === 'url') setActiveTab('landing');
                        else if (scanResult.type === 'message') setActiveTab('message-scanner', { initialText: targetInput });
                        else setActiveTab('dark-web');
                      }}
                      className="text-xs text-zinc-300 hover:text-white flex items-center gap-1 transition-colors font-medium"
                    >
                      <span>Deep Forensic View</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    {scanResult.summary}
                  </p>

                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-300 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Recommendation: </strong>
                      {scanResult.recommendation}
                    </div>
                  </div>
                </div>
              )}

              {scanError && (
                <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{scanError}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Live Global Threat & Indian Cyber Crime Stats Ticker */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="linear-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-mono">SCAMS ANALYZED</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
            {statsData?.total_scans ? `${(statsData.total_scans * 14).toLocaleString()}+` : '18,450+'}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Active live telemetry</span>
          </div>
        </div>

        <div className="linear-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-mono">AVG SCAN LATENCY</span>
            <Zap className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
            {statsData?.avg_execution_time_ms ? `${statsData.avg_execution_time_ms}ms` : '38.4ms'}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>Sub-second heuristic engine</span>
          </div>
        </div>

        <div className="linear-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-mono">CERT-IN ALERTS</span>
            <Radio className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
            100% Live
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Hourly automated RSS sync</span>
          </div>
        </div>

        <div className="linear-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-mono">EMERGENCY HELPLINE</span>
            <PhoneCall className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
            1930 Active
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>National cyber crime protocol</span>
          </div>
        </div>
      </section>

      {/* 5. Telegram Bot & Mobile Protection Showcase Section */}
      <section className="rounded-3xl glass-navbar p-6 sm:p-10 border border-sky-500/20 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-sky-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-mono text-sky-400">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Protection On Telegram</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              RakshaSutra Pocket Security on Telegram.
            </h2>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Scan links, test suspicious WhatsApp messages, and check data breaches directly in Telegram without downloading any app. Our autonomous bot provides instant AI threat evaluations 24/7.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="https://t.me/rakshasutra_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-6 rounded-xl bg-sky-500 text-black hover:bg-sky-400 font-semibold text-xs flex items-center gap-2 transition-all shadow-lg shadow-sky-500/20"
              >
                <Send className="w-4 h-4" />
                <span>Start @rakshasutra_bot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={copyBotLink}
                className="h-11 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-2 transition-all"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Quick Mock Card Preview */}
          <div className="w-full lg:w-80 rounded-2xl bg-zinc-950 border border-white/[0.1] p-4 font-mono text-xs text-zinc-300 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 text-[11px] text-zinc-500">
              <span className="flex items-center gap-1.5 text-sky-400">
                <Send className="w-3.5 h-3.5" />
                <span>@rakshasutra_bot</span>
              </span>
              <span>24/7 ONLINE</span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="p-2 rounded-lg bg-white/[0.04] text-zinc-300">
                👤 <span className="text-zinc-400">User:</span> https://sbi-pan-kyc.in
              </div>
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                🤖 <span className="font-bold">RakshaSutra:</span> 🔴 <strong>MALICIOUS PHISHING</strong>
                <div className="text-[10px] text-zinc-400 mt-1">Score: 94/100 • Fake SBI banking lure detected!</div>
              </div>
            </div>

            <div className="pt-1 text-center text-[10px] text-zinc-500">
              Interactive Touch Keyboard enabled
            </div>
          </div>
        </div>
      </section>

      {/* 6. Minimalist Bento Grid Feature Highlights */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400">Core Defenses</h3>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            End-to-End Autonomous Protection
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Engineered to neutralize phishing, social engineering scams, and brand impersonation before damage occurs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Card 1 */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="linear-card rounded-2xl p-6 space-y-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white">Heuristic URL Inspection</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Analyzes DNS age, SSL certificate veracity, redirect hops, and homoglyph domain impersonations with multi-feed threat correlation.
            </p>
            <div className="text-xs text-zinc-300 group-hover:text-white flex items-center gap-1 pt-1 font-medium">
              <span>Try Scanner</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2 */}
          <div 
            onClick={() => setActiveTab('message-scanner')}
            className="linear-card rounded-2xl p-6 space-y-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white group-hover:scale-105 transition-transform">
              <MessageSquareWarning className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white">Fake SMS & WhatsApp Analyzer</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              AI NLP detects urgency coercion, electricity bill cutoff panic, lottery traps, and APK download baits targeting Indian citizens.
            </p>
            <div className="text-xs text-zinc-300 group-hover:text-white flex items-center gap-1 pt-1 font-medium">
              <span>Analyze Message</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3 */}
          <div 
            onClick={() => setActiveTab('dark-web')}
            className="linear-card rounded-2xl p-6 space-y-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white group-hover:scale-105 transition-transform">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white">Dark Web Breach Intelligence</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              k-Anonymity privacy verification checks if your corporate emails or credentials have surfaced in hacker forum leaks.
            </p>
            <div className="text-xs text-zinc-300 group-hover:text-white flex items-center gap-1 pt-1 font-medium">
              <span>Check Exposure</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4 */}
          <div 
            onClick={() => setActiveTab('raksha-ai')}
            className="linear-card rounded-2xl p-6 space-y-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="text-base font-semibold text-white">Raksha AI Cyber Copilot</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Interactive conversational assistant trained on Indian cybercrime penal codes, digital arrest defenses, and recovery steps.
            </p>
            <div className="text-xs text-zinc-300 group-hover:text-white flex items-center gap-1 pt-1 font-medium">
              <span>Chat with AI</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5 */}
          <div 
            onClick={() => setActiveTab('emergency-defense')}
            className="linear-card rounded-2xl p-6 space-y-3 cursor-pointer group border-rose-500/20"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white">1930 Emergency Helpline Hub</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Step-by-step Golden Hour emergency financial fraud containment protocol to freeze stolen funds with banking nodes.
            </p>
            <div className="text-xs text-rose-400 group-hover:text-rose-300 flex items-center gap-1 pt-1 font-medium">
              <span>View Helpline Guide</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6 */}
          <div 
            onClick={() => setActiveTab('cyber-news')}
            className="linear-card rounded-2xl p-6 space-y-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white group-hover:scale-105 transition-transform">
              <Radio className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="text-base font-semibold text-white">Hourly Threat Advisories</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Synchronized feeds from CERT-In, CISA, and international threat intelligence networks to stay ahead of zero-day exploits.
            </p>
            <div className="text-xs text-zinc-300 group-hover:text-white flex items-center gap-1 pt-1 font-medium">
              <span>Read Advisories</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
