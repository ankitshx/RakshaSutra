import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import {
  Bot,
  X,
  Send,
  Loader2,
  PhoneCall,
  Maximize2
} from 'lucide-react';

interface FloatingAiAssistantProps {
  onOpenFullPage: () => void;
}

export const FloatingAiAssistant: React.FC<FloatingAiAssistantProps> = ({ onOpenFullPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: "👋 Hi, I'm **Raksha AI Copilot**. How can I help explain a scan verdict, evaluate a suspicious message, or guide emergency containment?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const newMsgs = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMsgs);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.chatWithAI(text, undefined, newMsgs);
      setMessages([...newMsgs, { role: 'assistant', content: res.response }]);
    } catch {
      setMessages([...newMsgs, { role: 'assistant', content: 'Connection issue. Please try again or open full Raksha AI view.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Expanded Chat Window */}
      {isOpen ? (
        <div className="w-[380px] sm:w-[420px] h-[520px] rounded-3xl bg-[#0c121e] border border-amber-500/40 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 bg-[#070b12] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sutra-glow">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                  Raksha AI Copilot
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Grounded Incident Assistant</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onOpenFullPage}
                title="Expand to Full Page"
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-[#141d2e] transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Drawer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#141d2e] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Helplines Strip */}
          <div className="px-4 py-2 bg-rose-950/40 border-b border-rose-500/30 flex items-center justify-between text-[10px] font-mono">
            <span className="text-rose-300 font-bold flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-rose-400" />
              Emergency Fraud Line:
            </span>
            <span className="text-rose-200 font-bold px-1.5 py-0.5 rounded bg-rose-900/60">
              Dial 1930
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl ${
                  m.role === 'user'
                    ? 'bg-[#141d2e] border border-amber-500/30 text-white ml-8 font-mono text-xs'
                    : 'bg-[#030508] border border-white/5 text-slate-200 mr-4 font-sans text-xs leading-relaxed whitespace-pre-wrap'
                }`}
              >
                {m.content}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>RakshaAI is reasoning...</span>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-[#070b12] border-t border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2 font-mono"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a threat or URL..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#030508] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black shadow-sutra-glow disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Floating Button */
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#0c121e] hover:bg-[#141d2e] border border-amber-500/50 text-white shadow-2xl shadow-amber-950/40 hover:border-amber-400 transition-all cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sutra-glow">
            <Bot className="w-4 h-4" />
          </div>
          <div className="text-left font-mono">
            <span className="text-xs font-black text-white block tracking-wider">RAKSHA AI</span>
            <span className="text-[10px] text-amber-300">Defensive Copilot</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
        </button>
      )}
    </div>
  );
};
