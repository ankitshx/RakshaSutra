import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Shield,
  Zap,
  Activity,
  Award,
  Bell,
  Network,
  Eye,
  Terminal,
  ShieldAlert,
  Flame,
  FileText,
  Lock,
  Layers,
  ArrowRight,
  Sparkles,
  Compass
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, extraData?: any) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commandItems = [
    // Fast Actions
    { id: 'action-scan', category: 'Fast Actions', label: 'Investigate Target (URL, Domain, Email, IP)', icon: Sparkles, action: (q: string) => onNavigate('investigation-center', { target: q }) },
    { id: 'action-emergency', category: 'Emergency Response', label: 'Emergency Defense ("Something Happened?")', icon: ShieldAlert, badge: 'Critical', action: () => onNavigate('emergency-mode') },
    
    // Command Center
    { id: 'landing', category: 'Command Center', label: 'Command Center Overview', icon: Shield, action: () => onNavigate('landing') },
    { id: 'security-posture', category: 'Command Center', label: 'Security Radar & Posture Breakdown', icon: Compass, action: () => onNavigate('security-posture') },
    { id: 'monitoring', category: 'Command Center', label: 'Continuous Target Watchlist & Diffs', icon: Bell, action: () => onNavigate('monitoring') },
    { id: 'dashboard', category: 'Command Center', label: 'Telemetry Stream & System Logs', icon: Activity, action: () => onNavigate('dashboard') },
    
    // Investigation Tools
    { id: 'investigation-center', category: 'Investigate', label: 'Universal Threat Investigation Center', icon: Search, badge: 'Flagship', action: () => onNavigate('investigation-center') },
    { id: 'url-scanner', category: 'Investigate', label: 'URL & Destination Link Scanner', icon: Zap, action: () => onNavigate('url-scanner') },
    { id: 'message-scanner', category: 'Investigate', label: 'SMS & Messaging Scam Analyzer', icon: FileText, action: () => onNavigate('message-scanner') },
    { id: 'website-scanner', category: 'Investigate', label: 'Website Security & TLS Certificate Audit', icon: Lock, action: () => onNavigate('website-scanner') },
    
    // Intelligence & Protect
    { id: 'osint', category: 'Intelligence', label: 'OSINT Footprinting & Interactive Threat Graph', icon: Network, action: () => onNavigate('osint') },
    { id: 'darkweb', category: 'Intelligence', label: 'Dark Web Breach Exposure & k-Anonymity', icon: Eye, action: () => onNavigate('darkweb') },
    { id: 'security-map', category: 'Intelligence', label: 'Interactive Digital Security Map', icon: Network, action: () => onNavigate('security-map') },
    { id: 'threat-intel', category: 'Intelligence', label: 'Global Threat Intelligence Feed', icon: Activity, action: () => onNavigate('threat-intel') },
    { id: 'deception', category: 'Protect', label: 'Active Intruder Honeytokens & Canary Traps', icon: Flame, action: () => onNavigate('deception') },
    { id: 'raksha-ai', category: 'Protect', label: 'Raksha AI Security Copilot & Playbooks', icon: Sparkles, action: () => onNavigate('raksha-ai') },

    // Reports & Learn
    { id: 'evidence-vault', category: 'Reports', label: 'Evidence Vault & Verification Trail', icon: Layers, action: () => onNavigate('evidence-vault') },
    { id: 'reports-center', category: 'Reports', label: 'Security Reports & Export Center', icon: FileText, action: () => onNavigate('reports-center') },
    { id: 'awareness', category: 'Learn', label: 'Security Academy & Interactive Labs', icon: Award, action: () => onNavigate('awareness') },
    { id: 'developer-playground', category: 'Developer', label: 'Developer REST API Gateway & Webhooks', icon: Terminal, action: () => onNavigate('developer-playground') }
  ];

  const filtered = commandItems.filter(item => {
    if (!query.trim()) return true;
    return item.label.toLowerCase().includes(query.toLowerCase()) || item.category.toLowerCase().includes(query.toLowerCase());
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filtered.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action(query);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, query, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-[#030508]/85 backdrop-blur-xl animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[75vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-[#070b12]">
          <Search className="w-5 h-5 text-amber-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, search modules, or enter target to investigate..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 font-mono focus:outline-none"
          />
          <span className="px-2 py-0.5 rounded bg-[#141d2e] text-[10px] font-mono text-slate-400 border border-white/10 ml-2">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-mono">
                No matching security commands found for "{query}".
              </p>
              <button
                onClick={() => {
                  onNavigate('investigation-center', { target: query });
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-mono text-xs font-bold hover:bg-amber-400 cursor-pointer shadow-sutra-glow"
              >
                Investigate "{query}" in Threat Center
              </button>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action(query);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#141d2e] border-l-2 border-l-amber-500 border-y border-r border-white/10 text-amber-200 shadow-md'
                      : 'text-slate-300 hover:bg-[#141d2e]/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border ${
                      isSelected 
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                        : 'bg-[#070b12] border-white/10 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-white">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                        <span>Select</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-[#050810] border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Execute</span>
            <span>ESC Close</span>
          </div>
          <span className="text-amber-400/80 font-bold">RakhshaSutra Command Console</span>
        </div>
      </div>
    </div>
  );
};
