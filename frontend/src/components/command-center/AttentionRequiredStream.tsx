import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  ArrowRight
} from 'lucide-react';

export interface AttentionItem {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  category: string;
  whatHappened: string;
  whyItMatters: string;
  evidence: string;
  ruleId?: string;
  actionLabel: string;
  targetTab?: string;
  actionData?: any;
}

interface AttentionRequiredStreamProps {
  items?: AttentionItem[];
  onAction?: (item: AttentionItem) => void;
}

export const AttentionRequiredStream: React.FC<AttentionRequiredStreamProps> = ({
  items: customItems,
  onAction
}) => {
  const defaultItems: AttentionItem[] = [
    {
      id: 'att-1',
      severity: 'CRITICAL',
      title: 'Suspicious Typosquat Banking Portal Active',
      category: 'Brand Impersonation / Phishing',
      whatHappened: 'A newly registered domain (sbi-kyc-update.top) was detected matching financial keyword heuristics and Levenshtein distance < 2.',
      whyItMatters: 'Fraudulent landing pages actively harvest netbanking credentials, OTP tokens, and debit card PINs.',
      evidence: 'Domain Age: 3 days • Registrar: Namecheap • Resolves to bulletproof host IP: 185.220.101.5',
      ruleId: 'RS-RULE-TYPO-09',
      actionLabel: 'Launch Threat Investigation',
      targetTab: 'investigation-center',
      actionData: { target: 'sbi-kyc-update.top' }
    },
    {
      id: 'att-2',
      severity: 'HIGH',
      title: 'DNS SPF Email Record Permissive (~all instead of -all)',
      category: 'Email Spoofing Risk',
      whatHappened: 'Passive DNS inspection on your registered organization domain revealed SPF set to softfail (~all).',
      whyItMatters: 'Permissive SPF allows malicious actors to forge emails pretending to originate from your exact domain address.',
      evidence: 'TXT Record: v=spf1 include:_spf.google.com ~all [Missing strict -all rejection]',
      ruleId: 'RS-DNS-SPF-04',
      actionLabel: 'Inspect DNS Record Details',
      targetTab: 'osint',
      actionData: { target: 'github.com', type: 'domain' }
    },
    {
      id: 'att-3',
      severity: 'MEDIUM',
      title: 'Web Canary Honeytoken Has Never Been Tripped',
      category: 'Deception & Intrusion Readiness',
      whatHappened: 'You have 1 active honeytoken planted in /root/.env that has been quiet for 45 days.',
      whyItMatters: 'Periodic testing verifies your webhook alerting pipeline and telemetry endpoints are responsive.',
      evidence: 'Token ID: canary_01h8a9 • Status: Armed • Last Ping: None',
      ruleId: 'RS-CANARY-PING-01',
      actionLabel: 'Test Canary Tripwire',
      targetTab: 'deception'
    }
  ];

  const items = customItems || defaultItems;

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black bg-rose-950/80 border border-rose-500/50 text-rose-300 flex items-center gap-1.5 shadow-sm shadow-rose-950">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            CRITICAL ATTENTION
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold bg-amber-950/80 border border-amber-500/50 text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            HIGH PRIORITY
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            MEDIUM ADVISORY
          </span>
        );
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#090e1a] border border-slate-800 shadow-2xl space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <h3 className="text-base font-black font-mono text-white tracking-wide">
              WHAT NEEDS MY ATTENTION?
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Prioritized threat detections, configuration drifts, and risk findings requiring defensive action
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-900 border border-slate-800 text-slate-400">
          {items.length} Active Findings
        </span>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`p-5 sm:p-6 rounded-2xl border transition-all space-y-4 ${
              item.severity === 'CRITICAL'
                ? 'bg-[#110d18] border-rose-500/40 shadow-lg shadow-rose-950/20'
                : item.severity === 'HIGH'
                ? 'bg-[#131118] border-amber-500/30'
                : 'bg-[#0d1527] border-slate-800'
            }`}
          >
            {/* Top row: Badges and Title */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  {getSeverityBadge(item.severity)}
                  <span className="text-xs font-mono text-slate-400">{item.category}</span>
                  {item.ruleId && (
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      [{item.ruleId}]
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold text-white font-mono">{item.title}</h4>
              </div>

              <button
                onClick={() => onAction && onAction(item)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/50 text-cyan-300 text-xs font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <span>{item.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            </div>

            {/* Explanation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="p-3.5 rounded-xl bg-[#070a13] border border-slate-800/80 space-y-1">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold block">
                  What Happened:
                </span>
                <p className="text-slate-200 leading-relaxed">{item.whatHappened}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#070a13] border border-slate-800/80 space-y-1">
                <span className="text-rose-400 font-mono text-[10px] uppercase font-bold block">
                  Why It Matters:
                </span>
                <p className="text-slate-300 leading-relaxed">{item.whyItMatters}</p>
              </div>
            </div>

            {/* Technical Evidence Bar */}
            <div className="p-3 rounded-xl bg-[#04060d] border border-slate-800/80 font-mono text-[11px] text-slate-300 flex items-start gap-2">
              <span className="text-cyan-400 font-bold shrink-0">EVIDENCE:</span>
              <span className="break-all">{item.evidence}</span>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
