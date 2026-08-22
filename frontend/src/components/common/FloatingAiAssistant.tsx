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
      content: "👋 Hi, I'm **Raksha AI Copilot**. How can I help secure your session or analyze a threat?"
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
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Chat Window */}
      {isOpen ? (
        <div className="w-[380px] sm:w-[420px] h-[520px] rounded-3xl bg-slate-950/95 border border-cyan-500/40 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-neon-cyan">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                  Raksha AI Copilot
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
                </h4>
                <span className="text-[10px] text-slate-400">Defensive Incident Assistant</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onOpenFullPage}
                title="Expand to Full Page"
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Drawer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Helplines Strip */}
          <div className="px-4 py-2 bg-rose-950/40 border-b border-rose-900/30 flex items-center justify-between text-[10px] font-mono">
            <span className="text-rose-300 font-bold flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-rose-400" />
              Emergency Fraud Line:
            </span>
            <span className="text-rose-200 font-bold px-1.5 py-0.5 rounded bg-rose-900/60">
              Dial 1930
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs leading-relaxed">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[85%] whitespace-pre-line ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-semibold'
                      : 'bg-slate-900 border border-slate-800 text-slate-200'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center text-cyan-400 text-xs font-mono">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Raksha AI thinking...</span>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a security question..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold transition-all disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        /* Floating Button */
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-neon-cyan transition-all duration-300 cursor-pointer transform hover:scale-105"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <span className="hidden sm:inline font-mono">Ask Raksha AI</span>
        </button>
      )}
    </div>
  );
};
