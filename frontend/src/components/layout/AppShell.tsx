import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../services/api';
import { CommandPalette } from '../common/CommandPalette';
import {
  Shield,
  Search,
  Activity,
  Globe,
  MessageSquareWarning,
  Flame,
  FileText,
  Lock,
  PhoneCall,
  LogOut,
  Sparkles,
  Bug,
  Menu,
  X,
  ChevronDown,
  Send,
  Radio,
  Sliders,
  Network
} from 'lucide-react';

interface AppShellProps {
  activeTab: string;
  setActiveTab: (tab: string, extraData?: any) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  setActiveTab,
  children
}) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const navRef = useRef<HTMLDivElement>(null);

  // Measure backend latency & connection heartbeat
  useEffect(() => {
    const checkPing = async () => {
      const t0 = performance.now();
      try {
        const res = await fetch(`${API_BASE}/health`);
        if (res.ok) {
          setLatencyMs(Math.round(performance.now() - t0));
          setIsOnline(true);
        } else {
          setIsOnline(false);
        }
      } catch {
        setIsOnline(false);
      }
    };
    checkPing();
    const interval = setInterval(checkPing, 20000);
    return () => clearInterval(interval);
  }, []);

  // Global keyboard shortcut Ctrl + K / Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    setActiveDropdown(null);
    setIsMobileNavOpen(false);
  };

  const navCategories = [
    {
      label: 'Scanners',
      id: 'scanners',
      items: [
        { id: 'landing', label: 'Website & URL Scanner', desc: 'Real-time phishing & malware engine', icon: Globe },
        { id: 'message-scanner', label: 'SMS & Fraud Analyzer', desc: 'Detect UPI traps, lottery & fake APK baits', icon: MessageSquareWarning },
        { id: 'scan-history', label: 'Scan Dossier History', desc: 'Review past security evaluations', icon: FileText }
      ]
    },
    {
      label: 'Intelligence',
      id: 'intel',
      items: [
        { id: 'cyber-news', label: 'Threat News & Advisories', desc: 'Live hourly feeds & CERT-In alerts', icon: Radio },
        { id: 'dark-web', label: 'Dark Web Leak Monitor', desc: 'Check compromised corporate emails & credentials', icon: Lock },
        { id: 'threat-intel', label: 'Live Global Threat Feeds', desc: 'Real-time malicious IOCs and C2 telemetry', icon: Flame },
        { id: 'investigation-center', label: 'OSINT Forensic Desk', desc: 'Deep IP, DNS & infrastructure analysis', icon: Search }
      ]
    },
    {
      label: 'Defense Ops',
      id: 'defense',
      items: [
        { id: 'dashboard', label: 'Security Command Center', desc: 'SOC metrics & defensive posture scorecard', icon: Activity },
        { id: 'security-posture', label: 'Security Posture Score', desc: 'Compliance hygiene & CERT-In scorecards', icon: Shield },
        { id: 'attack-surface', label: 'Attack Surface Management', desc: 'Discover external subdomains & open ports', icon: Network },
        { id: 'vulnerabilities', label: 'Vulnerability Intelligence', desc: 'CVE database, CVSS scores & remediations', icon: Bug },
        { id: 'deception', label: 'Deception Honeytokens', desc: 'Plant decoy tokens to trap active attackers', icon: Sliders },
        { id: 'emergency-defense', label: '1930 Emergency Defense', desc: 'National cyber helpline & incident playbooks', icon: PhoneCall }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#050608] text-zinc-100 flex flex-col font-sans selection:bg-white selection:text-black">
      
      {/* 1. Top Floating Glassmorphic Navbar */}
      <header className="sticky top-3 z-50 w-full px-3 sm:px-6 lg:px-8 pointer-events-none">
        <div 
          ref={navRef}
          className="max-w-7xl mx-auto glass-navbar rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4 pointer-events-auto shadow-2xl transition-all duration-300"
        >
          {/* Brand Logo */}
          <div 
            onClick={() => navigateTo('landing')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5 font-mono">
                RakshaSutra
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.08] text-zinc-400 font-sans border border-white/[0.08]">
                  v3.4
                </span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono tracking-wide">Autonomous Cyber Defense</span>
            </div>
          </div>

          {/* Desktop Navigation Links & Dropdowns */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => navigateTo('landing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'landing' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => navigateTo('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'dashboard' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              Dashboard
            </button>

            {/* Dropdown Menus */}
            {navCategories.map(cat => {
              const isCatActive = cat.items.some(i => i.id === activeTab);
              const isOpen = activeDropdown === cat.id;

              return (
                <div key={cat.id} className="relative">
                  <button
                    onClick={() => setActiveDropdown(isOpen ? null : cat.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isCatActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Card */}
                  {isOpen && (
                    <div className="absolute top-full left-0 mt-2 w-72 rounded-xl bg-zinc-950/95 backdrop-blur-2xl border border-white/[0.1] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="space-y-1">
                        {cat.items.map(item => {
                          const Icon = item.icon;
                          const isItemActive = activeTab === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => navigateTo(item.id)}
                              className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-all ${
                                isItemActive 
                                  ? 'bg-white/[0.08] text-white' 
                                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                              }`}
                            >
                              <div className={`p-1.5 rounded-md mt-0.5 ${isItemActive ? 'bg-white text-black' : 'bg-white/[0.06] text-zinc-300'}`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium leading-tight">{item.label}</div>
                                <div className="text-[10px] text-zinc-500 truncate mt-0.5">{item.desc}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Raksha AI Copilot Link */}
            <button
              onClick={() => navigateTo('raksha-ai')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'raksha-ai' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Raksha AI</span>
            </button>

            {/* Admin Console Link (if admin) */}
            {isAdmin && (
              <button
                onClick={() => navigateTo('admin')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Sentinel</span>
              </button>
            )}
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Command Palette Trigger Button */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-400 transition-colors"
              title="Quick Search (Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono">Search</span>
              <kbd className="text-[9px] bg-white/[0.08] px-1.5 py-0.5 rounded text-zinc-400 border border-white/[0.06]">
                Ctrl K
              </kbd>
            </button>

            {/* Direct Telegram Bot Shortcut */}
            <a
              href="https://t.me/rakshasutra_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 text-xs text-sky-400 transition-all font-medium"
              title="Open @rakshasutra_bot on Telegram"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-mono">@rakshasutra_bot</span>
            </a>

            {/* Latency / Engine Status Badge */}
            <div 
              className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono text-zinc-400"
              title={`API Latency: ${latencyMs !== null ? `${latencyMs}ms` : 'Connecting...'}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span>{latencyMs !== null ? `${latencyMs}ms` : 'online'}</span>
            </div>

            {/* Auth / Account Profile */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08]">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-medium text-zinc-200 truncate max-w-[110px] leading-tight">
                    {user?.full_name || user?.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-zinc-500 capitalize">{user?.role || 'User'}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigateTo('login')}
                className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-all shadow-sm"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08]"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileNavOpen && (
          <div className="lg:hidden max-w-7xl mx-auto mt-2 rounded-2xl glass-navbar p-4 pointer-events-auto border border-white/[0.1] shadow-2xl animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => navigateTo('landing')}
                className="p-2.5 rounded-lg bg-white/[0.04] text-left font-medium text-zinc-200"
              >
                🏠 Home / Scanner
              </button>
              <button
                onClick={() => navigateTo('dashboard')}
                className="p-2.5 rounded-lg bg-white/[0.04] text-left font-medium text-zinc-200"
              >
                📊 Security Dashboard
              </button>
              <button
                onClick={() => navigateTo('message-scanner')}
                className="p-2.5 rounded-lg bg-white/[0.04] text-left font-medium text-zinc-200"
              >
                📩 SMS & Fraud Check
              </button>
              <button
                onClick={() => navigateTo('dark-web')}
                className="p-2.5 rounded-lg bg-white/[0.04] text-left font-medium text-zinc-200"
              >
                🔒 Dark Web Leak Monitor
              </button>
              <button
                onClick={() => navigateTo('cyber-news')}
                className="p-2.5 rounded-lg bg-white/[0.04] text-left font-medium text-zinc-200"
              >
                📰 Breaking Cyber Alerts
              </button>
              <button
                onClick={() => navigateTo('raksha-ai')}
                className="p-2.5 rounded-lg bg-white/[0.04] text-left font-medium text-zinc-200"
              >
                ✨ Raksha AI Copilot
              </button>
              <button
                onClick={() => navigateTo('emergency-defense')}
                className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-left font-medium text-rose-300"
              >
                🚨 Emergency 1930 Helpline
              </button>
              {isAdmin && (
                <button
                  onClick={() => navigateTo('admin')}
                  className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-left font-medium text-amber-300"
                >
                  🛡️ Admin Sentinel Console
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. Full-Width Expansive Content Stage */}
      <main className="flex-1 w-full pt-6 sm:pt-8 pb-16">
        {children}
      </main>

      {/* 3. Global Command Palette Modal (Ctrl + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setActiveTab}
      />

      {/* 4. Minimalist Modern Footer */}
      <footer className="w-full border-t border-white/[0.06] bg-[#050608] py-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-zinc-400" />
            <span className="font-semibold text-zinc-300 font-mono">RakshaSutra</span>
            <span>— Autonomous Cyber Defense & Threat Intelligence OS</span>
          </div>
          <div className="flex items-center gap-6">
            <a 
              href="https://t.me/rakshasutra_bot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>@rakshasutra_bot</span>
            </a>
            <button onClick={() => navigateTo('emergency-defense')} className="hover:text-white transition-colors">
              National Helpline 1930
            </button>
            <button onClick={() => navigateTo('privacy')} className="hover:text-white transition-colors">
              Privacy
            </button>
            <button onClick={() => navigateTo('terms')} className="hover:text-white transition-colors">
              Terms
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};
