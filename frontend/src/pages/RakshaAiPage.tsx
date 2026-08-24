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
        "### 🛡️ Welcome to Rakhsha AI Copilot\n\nI am your dedicated **defensive cybersecurity assistant**. You can ask me to:\n\n- Explain why a specific URL or message is hazardous.\n- Guide you step-by-step through an **Incident Response Playbook** if you clicked a link or entered your password.\n- Explain cybersecurity concepts like MFA, UPI fraud mechanisms, and homoglyph attacks.\n\n*How can I assist your digital defense today?*",
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
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header (RDS 2.0) */}
      <div className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-sutra-glow shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              RAKHSHA AI — GROUNDED COPILOT
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Evidence-grounded explanations, plain-language translations, and instant crisis containment
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Playbooks & Guidelines */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-[#0c121e] border border-white/10 shadow-xl space-y-4 font-mono text-xs">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Incident Response Guides</span>
            </h3>

            <div className="space-y-2">
              {playbooks.map((pb) => (
                <button
                  key={pb.id}
                  onClick={() => setSelectedPlaybook(pb)}
                  className="w-full p-3 rounded-2xl bg-[#070b12] hover:bg-[#141d2e] border border-white/5 text-left text-slate-300 hover:text-white transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">{pb.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-rose-950/30 border border-rose-500/40 space-y-2 font-mono text-xs shadow-ruby-glow">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <PhoneCall className="w-4 h-4 text-rose-400" />
              <span>Urgent Financial Fraud?</span>
            </div>
            <p className="text-slate-300 font-sans text-[11px] leading-relaxed">
              If you have lost money via unauthorized transaction or UPI, dial <strong>1930</strong> immediately.
            </p>
          </div>
        </div>

        {/* Right Side: Chat Messenger */}
        <div className="lg:col-span-3 p-6 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl flex flex-col h-[650px] justify-between relative overflow-hidden">
          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 font-mono text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sutra-glow shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl max-w-2xl font-sans text-sm space-y-2 ${
                    m.role === 'user'
                      ? 'bg-[#141d2e] border border-amber-500/30 text-white font-mono text-xs'
                      : 'bg-[#070b12] border border-white/10 text-slate-200 leading-relaxed'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>

                  {/* Suggested Question Chips */}
                  {m.suggested_questions && m.suggested_questions.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1.5 font-mono text-[11px]">
                      {m.suggested_questions.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleSend(q)}
                          className="px-2.5 py-1 rounded-xl bg-[#0c121e] border border-white/10 hover:border-amber-500/40 text-amber-300 transition-colors cursor-pointer"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-[#141d2e] border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-3 text-amber-400 font-mono text-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>RakshaAI is generating grounded explanation...</span>
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
            className="pt-4 border-t border-white/10 flex gap-2 font-mono"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Rakhsha AI about a suspicious URL, scam tactic, or defense action..."
              className="flex-1 px-4 py-3.5 rounded-2xl bg-[#030508] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-inner"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs uppercase flex items-center gap-2 shadow-sutra-glow disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>ASK</span>
            </button>
          </form>
        </div>
      </div>

      {/* Selected Playbook Modal */}
      {selectedPlaybook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030508]/85 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl bg-[#0c121e] border border-white/10 p-6 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h4 className="text-white font-bold">{selectedPlaybook.title}</h4>
              <button onClick={() => setSelectedPlaybook(null)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>
            <p className="text-slate-300 font-sans">{selectedPlaybook.description}</p>
            <div className="space-y-2">
              <span className="text-amber-400 font-bold uppercase">Ordered Action Steps:</span>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-200 font-sans">
                {selectedPlaybook.action_steps.map((st: string, i: number) => (
                  <li key={i}>{st}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
