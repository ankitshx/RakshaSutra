import React, { useState } from 'react';
import { api } from '../services/api';
import type { MessageScanResponse } from '../types';
import { RiskGauge } from '../components/common/RiskGauge';
import { RiskBadge } from '../components/common/RiskBadge';
import { ThreatIndicatorCard } from '../components/common/ThreatIndicatorCard';
import {
  MessageSquare,
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
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            Message & Phishing Analyzer
          </h1>
        </div>
        <p className="text-sm text-slate-400 max-w-2xl">
          Evaluate SMS, WhatsApp messages, emails, and social media DMs for emotional coercion, fake utility threats, OTP harvesting traps, and embedded malicious links.
        </p>
      </div>

      {/* Input Form */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-cyber-border backdrop-blur-xl shadow-xl space-y-5">
        {/* Channel Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mr-2">
            Channel:
          </span>
          {[
            { id: 'sms', label: 'SMS', icon: Smartphone },
            { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
            { id: 'email', label: 'Email', icon: Mail },
            { id: 'telegram', label: 'Telegram / Social', icon: Share2 }
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = channel === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setChannel(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-neon-cyan'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sender (Optional) & Text Area */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="Sender identifier (optional, e.g. +91 98765 43210 or VK-SBIINB)"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste suspicious email, SMS, or WhatsApp message text here..."
            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono leading-relaxed"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800">
          <span className="text-[11px] text-slate-400 font-mono">
            🔒 Privacy First: Message contents are analyzed ephemerally without persistent credential storage.
          </span>
          <button
            type="button"
            onClick={() => handleAnalyze()}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-neon-cyan transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Content...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Message</span>
              </>
            )}
          </button>
        </div>

        {/* Sample Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <span className="font-semibold">Sample Lures:</span>
          {sampleMessages.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setContent(sample.text);
                setChannel(sample.channel);
                handleAnalyze(sample.text, sample.channel);
              }}
              disabled={isLoading}
              className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 font-mono text-[11px] transition-colors"
            >
              {sample.title}
            </button>
          ))}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-center gap-3 text-xs text-rose-300">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      {report && (
        <div className="space-y-6">
          {/* Main Assessment Card */}
          <div className="rounded-2xl border border-cyber-border bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  {report.channel.toUpperCase()} ANALYSIS #{report.request_id}
                </span>
                <p className="text-xs text-slate-400 pt-1">
                  Analysis completed in {report.execution_time_ms} ms
                </p>
              </div>
              <RiskBadge level={report.risk_level} score={report.risk_score} size="lg" />
            </div>

            {/* Gauge and Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <RiskGauge score={report.risk_score} level={report.risk_level} size={160} />
              </div>
              <div className="md:col-span-8 space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Threat Evaluation
                  </h3>
                  <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-800">
                    {report.summary}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Recommended User Action
                  </h3>
                  <p className="text-sm text-emerald-200/90 leading-relaxed bg-emerald-950/30 border border-emerald-500/30 p-3.5 rounded-xl">
                    {report.recommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* Detected Techniques Pill list */}
            {report.detected_techniques.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Detected Social Engineering Techniques:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {report.detected_techniques.map((tech, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-400">{tech.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {tech.confidence}% Conf.
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{tech.description}</p>
                      <div className="pt-1 font-mono text-[11px] text-cyan-300">
                        Trigger: "{tech.matched_phrase}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Embedded URLs */}
            {report.extracted_urls.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                  Extracted Links Analyzed ({report.extracted_urls.length})
                </h4>
                <div className="space-y-2">
                  {report.extracted_urls.map((u, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 break-all flex items-center justify-between"
                    >
                      <span>{u}</span>
                      <span className="text-[10px] text-rose-400 uppercase font-bold pl-2">
                        Cross-Examined
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Indicators list */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              Observed Social Engineering Signals ({report.indicators.length})
            </h3>
            <div className="space-y-3">
              {report.indicators.map((ind, idx) => (
                <ThreatIndicatorCard key={idx} indicator={ind} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
