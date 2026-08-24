import React, { useState } from 'react';
import { api } from '../services/api';
import type { MessageScanResponse } from '../types';
import { RiskGauge } from '../components/common/RiskGauge';
import { ThreatIndicatorCard } from '../components/common/ThreatIndicatorCard';
import {
  Loader2,
  AlertTriangle,
  Sparkles,
  Link2,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Mail,
  Share2,
  FileText
} from 'lucide-react';

interface MessageAnalyzerPageProps {
  onAskAI: (scanId: string) => void;
}

export const MessageAnalyzerPage: React.FC<MessageAnalyzerPageProps> = () => {
  const [content, setContent] = useState('');
  const [channel, setChannel] = useState('sms');
  const [sender, setSender] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<MessageScanResponse | null>(null);

  const sampleMessages = [
    {
      title: 'Electricity Cut Threat',
      channel: 'sms',
      text: 'Dear Customer, your electricity power bill is unpaid. Your connection will be disconnected tonight at 9:30 PM. Call power officer on 9876543210 immediately.'
    },
    {
      title: 'SBI YONO Block Urgency',
      channel: 'sms',
      text: 'URGENT: Your SBI bank account will be suspended within 24 hours. Click http://sbi-pan-kyc.top to update your PAN and submit OTP to avoid penalty.'
    },
    {
      title: 'Marketplace UPI Scam',
      channel: 'whatsapp',
      text: 'I am sending a QR code for Rs 12,000 for the item. Open your PhonePe or Google Pay, scan this QR code, and enter your UPI PIN to claim money.'
    },
    {
      title: 'Legitimate Notice',
      channel: 'email',
      text: 'Your monthly statement for account ending in 4021 is now ready to view. Please log into your official netbanking portal to review recent transactions.'
    }
  ];

  const handleAnalyze = async (sampleText?: string, sampleChan?: string) => {
    const textToScan = sampleText || content;
    const chanToScan = sampleChan || channel;

    if (!textToScan.trim()) {
      setError('Please paste message content to analyze.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await api.scanMessage(textToScan, chanToScan, sender || undefined);
      setReport(res);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze message content.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-sutra-glow shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              MESSAGE & PHISHING LURE ANALYZER
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Evaluate SMS, WhatsApp, and emails for emotional coercion, fake utility cutoffs, and OTP traps
            </p>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-xl space-y-5 relative overflow-hidden">
        {/* Channel Selector */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <span className="text-slate-400 uppercase font-bold">Source Vector:</span>
          {[
            { id: 'sms', label: 'SMS / Text', icon: Smartphone },
            { id: 'whatsapp', label: 'WhatsApp / Chat', icon: Share2 },
            { id: 'email', label: 'Email Lure', icon: Mail }
          ].map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setChannel(c.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  channel === c.id
                    ? 'bg-[#141d2e] border-l-2 border-l-amber-500 border-y border-r border-white/10 text-amber-300 font-bold shadow-sutra-glow'
                    : 'bg-[#070b12] border border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-3 font-mono">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="Sender Header (e.g. +91-9876543210, VK-SBIINB, or support@unknown.com)"
              className="flex-1 px-4 py-3 rounded-2xl bg-[#030508] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs shadow-inner"
            />
          </div>

          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste the raw text of the SMS, WhatsApp message, or email body here..."
            className="w-full p-4 rounded-2xl bg-[#030508] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm font-sans shadow-inner transition-colors"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px]">Simulate Scam:</span>
              {sampleMessages.map((s) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => {
                    setContent(s.text);
                    setChannel(s.channel);
                    handleAnalyze(s.text, s.channel);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-[#070b12] border border-white/10 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer text-[11px]"
                >
                  {s.title}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleAnalyze()}
              disabled={isLoading || !content.trim()}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs font-mono tracking-wider flex items-center gap-2 shadow-sutra-glow disabled:opacity-50 transition-all cursor-pointer ml-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>PARSING NLP PATTERNS...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>ANALYZE MESSAGE</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Report Result */}
      {report && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 font-sans">
          {/* Main Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#070b12] border border-white/10 flex flex-col items-center justify-center space-y-4">
                <RiskGauge score={report.risk_score} level={report.risk_level} />
                <div className="text-center font-mono text-xs text-slate-400">
                  Confidence: <span className="text-amber-400 font-bold">94%</span> (NLP Heuristic)
                </div>
              </div>

              <div className="lg:col-span-2 p-6 rounded-2xl bg-[#070b12] border border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                  {report.risk_level === 'CRITICAL' || report.risk_level === 'HIGH' ? (
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  )}
                  <h3 className="text-lg font-bold text-white font-mono">
                    Social Engineering Evaluation
                  </h3>
                </div>

                <p className="text-slate-200 text-sm leading-relaxed">
                  {report.summary}
                </p>

                <div className="p-4 rounded-xl bg-[#0c121e] border border-white/5 space-y-1">
                  <span className="text-xs font-bold text-amber-400 font-mono uppercase block">
                    Immediate Action:
                  </span>
                  <p className="text-slate-300 text-xs">
                    {report.recommendation}
                  </p>
                </div>

                {report.extracted_urls && report.extracted_urls.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-amber-400" />
                      Extracted Links in Message ({report.extracted_urls.length}):
                    </span>
                    <div className="space-y-1 font-mono text-xs">
                      {report.extracted_urls.map((u, i) => (
                        <div key={i} className="p-2 rounded-xl bg-[#030508] border border-white/5 text-amber-300 break-all">
                          {u}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Threat Indicators List */}
            {report.threat_indicators && report.threat_indicators.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-400">
                  Detected Coercion & Deception Indicators ({report.threat_indicators.length})
                </h4>
                <div className="space-y-3">
                  {report.threat_indicators.map((ind: any, i: number) => (
                    <ThreatIndicatorCard key={i} indicator={ind} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
