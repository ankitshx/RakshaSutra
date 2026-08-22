import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import type { IncidentPlaybook } from '../types';
import {
  Bot,
  Send,
  Loader2,
  ShieldAlert,
  PhoneCall,
  User,
  ChevronRight
} from 'lucide-react';

interface ChatMessageItem {
  role: 'user' | 'assistant';
  content: string;
  suggested_questions?: string[];
  related_playbook?: IncidentPlaybook | null;
}

export const RakshaAiPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      role: 'assistant',
      content:
        "### 🛡️ Welcome to Raksha AI Copilot\n\nI am your dedicated **defensive cybersecurity assistant**. You can ask me to:\n\n- Explain why a specific URL or message is hazardous.\n- Guide you step-by-step through an **Incident Response Playbook** if you clicked a link or entered your password.\n- Explain cybersecurity concepts like MFA, UPI fraud mechanisms, and homoglyph attacks.\n\n*How can I assist your digital defense today?*",
      suggested_questions: [
        'How do I recognize a phishing message?',
        'I clicked a suspicious link, what should I do now?',
        'How do UPI & QR code scams steal money?',
        'What is MFA and why is SMS OTP vulnerable?'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playbooks, setPlaybooks] = useState<IncidentPlaybook[]>([]);
  const [selectedPlaybook, setSelectedPlaybook] = useState<IncidentPlaybook | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getPlaybooks().then(setPlaybooks).catch(() => {});
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (userText?: string) => {
    const textToSend = (userText || input).trim();
    if (!textToSend) return;

    const newMessages = [...messages, { role: 'user' as const, content: textToSend }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = newMessages.map((m) => ({ role: m.role, content: m.content }));
      const res = await api.chatWithAI(textToSend, undefined, historyPayload);

      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: res.response,
          suggested_questions: res.suggested_questions,
          related_playbook: res.related_playbook
        }
      ]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'I encountered an error connecting to security intelligence. Please try again.',
          suggested_questions: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <Bot className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            Raksha AI — Security Copilot
          </h1>
        </div>
        <p className="text-sm text-slate-400 max-w-2xl">
          Defensive AI cybersecurity assistant for explaining scan findings, decoding social engineering tactics, and executing emergency incident response containment playbooks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chat Area */}
        <div className="lg:col-span-8 flex flex-col h-[640px] rounded-2xl border border-cyber-border bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-1 shadow-neon-cyan">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-semibold'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 shadow-lg'
                  }`}
                >
                  <div className="whitespace-pre-line prose-sm">{m.content}</div>

                  {/* Playbook Trigger if present */}
                  {m.related_playbook && (
                    <div className="mt-3 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                          {m.related_playbook.title}
                        </span>
                        <button
                          onClick={() => setSelectedPlaybook(m.related_playbook!)}
                          className="px-2.5 py-1 rounded bg-rose-900/60 hover:bg-rose-800 text-[11px] font-bold uppercase transition-colors"
                        >
                          View Steps
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Suggested Question Chips */}
                  {m.suggested_questions && m.suggested_questions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                      {m.suggested_questions.map((sq, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSend(sq)}
                          disabled={isLoading}
                          className="px-2.5 py-1 rounded-full bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 text-[11px] border border-cyan-500/30 transition-colors cursor-pointer"
                        >
                          {sq}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-cyan-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Raksha AI analyzing threat intelligence...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Raksha AI a security question or paste a suspicious situation..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-slate-950 font-bold transition-all disabled:opacity-40 cursor-pointer shadow-neon-cyan"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Sidebar: Incident Playbooks & Helplines */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyber-border backdrop-blur-xl shadow-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Emergency Incident Playbooks
            </h3>
            <div className="space-y-2">
              {playbooks.map((pb) => (
                <div
                  key={pb.id}
                  onClick={() => setSelectedPlaybook(pb)}
                  className="p-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-rose-500/40 cursor-pointer transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-rose-400">
                      {pb.title}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {pb.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* National Helplines Box */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyber-border backdrop-blur-xl space-y-3 text-xs font-mono">
            <h3 className="font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <PhoneCall className="w-3.5 h-3.5" /> Emergency Cyber Helplines
            </h3>
            <div className="space-y-2 text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-rose-400 font-bold block">1930 (India)</span>
                <span className="text-[11px] text-slate-400 font-sans">
                  Citizen Financial Cyber Fraud Reporting System
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-cyan-400 font-bold block">cybercrime.gov.in</span>
                <span className="text-[11px] text-slate-400 font-sans">
                  National Cyber Crime Reporting Portal
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Playbook Modal */}
      {selectedPlaybook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-950 border border-rose-500/50 p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                {selectedPlaybook.title}
              </h3>
              <button
                onClick={() => setSelectedPlaybook(null)}
                className="text-slate-400 hover:text-white font-mono text-sm px-2 py-1"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-slate-300">{selectedPlaybook.description}</p>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 font-mono">
                Immediate Action Steps (Containment):
              </h4>
              <div className="space-y-2">
                {selectedPlaybook.immediate_steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-600/30 text-xs text-rose-200 font-medium"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                Secondary Protective Measures:
              </h4>
              <div className="space-y-2">
                {selectedPlaybook.secondary_steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-right">
              <button
                onClick={() => setSelectedPlaybook(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
