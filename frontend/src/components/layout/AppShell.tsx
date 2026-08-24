import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CommandPalette } from '../common/CommandPalette';
import {
  Shield,
  Search,
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
  ChevronLeft,
  ChevronRight,
  PhoneCall,
  LogOut,
  Sliders,
  Zap,
  Globe,
  ShieldCheck,
  Compass,
  LayoutGrid,
  Sparkles,
  Radio
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
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('rs_sidebar_collapsed') === 'true';
  });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('rs_sidebar_collapsed', String(next));
      return next;
    });
  };

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

  const navGroups = [
    {
      title: 'COMMAND CENTER',
      items: [
        { id: 'landing', label: 'Command Overview', icon: LayoutGrid },
        { id: 'security-posture', label: 'Security Radar', icon: Compass },
        { id: 'monitoring', label: 'Continuous Watchlist', icon: Bell },
        { id: 'dashboard', label: 'Telemetry Stream', icon: Activity }
      ]
    },
    {
      title: 'INVESTIGATE & FORENSICS',
      items: [
        { id: 'investigation-center', label: 'Universal Threat Center', icon: Search, badge: 'Omni' },
        { id: 'url-scanner', label: 'URL & Link Scanner', icon: Zap },
        { id: 'message-scanner', label: 'SMS & Phish Analyzer', icon: FileText },
        { id: 'website-scanner', label: 'Website & TLS Audit', icon: Globe }
      ]
    },
    {
      title: 'ACTIVE DEFENSE & HONEYNET',
      items: [
        { id: 'darkweb', label: 'Dark Web Breach Radar', icon: Eye },
        { id: 'deception', label: 'Honeytoken Deception', icon: Flame, roleGated: true },
        { id: 'emergency-mode', label: 'Emergency Defense', icon: ShieldAlert, highlight: true }
      ]
    },
    {
      title: 'THREAT INTELLIGENCE',
      items: [
        { id: 'threat-intel', label: 'Threat Intelligence', icon: Radio },
        { id: 'osint', label: 'OSINT Footprint Graph', icon: Network },
        { id: 'security-map', label: 'Digital Security Map', icon: Network }
      ]
    },
    {
      title: 'EVIDENCE & AUDITING',
      items: [
        { id: 'evidence-vault', label: 'Evidence Vault', icon: Layers },
        { id: 'reports-center', label: 'Report Dossier Center', icon: FileText },
        { id: 'security-passport', label: 'Security Passport', icon: Award },
        { id: 'developer-playground', label: 'Developer API Gateway', icon: Terminal },
        ...(isAdmin ? [{ id: 'admin', label: 'SOC Operations', icon: Sliders }] : [])
      ]
    },
    {
      title: 'ACADEMY & TRUST',
      items: [
        { id: 'raksha-ai', label: 'RakshaAI Copilot', icon: Sparkles },
        { id: 'awareness', label: 'Security Academy', icon: Award },
        { id: 'trust-center', label: 'Trust & Verification', icon: ShieldCheck }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex bg-[#030508] text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* 1. Left Docked Modular Navigation Rail (RDS 2.0) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 bg-[#070b12]/95 border-r border-white/[0.07] backdrop-blur-2xl transition-all duration-300 flex flex-col justify-between ${
          isCollapsed ? 'w-20' : 'w-64'
        } hidden md:flex`}
      >
        {/* Brand Header with The Sutra Signature */}
        <div>
          <div className="h-16 flex items-center px-4 border-b border-white/[0.07] justify-between relative">
            <div 
              className="flex items-center gap-3 cursor-pointer overflow-hidden group"
              onClick={() => setActiveTab('landing')}
              title="RakhshaSutra Command Center"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-sutra-glow group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col animate-in fade-in duration-200">
                  <span className="text-sm font-black tracking-tight text-white font-mono leading-none flex items-center gap-1">
                    RAKSHA<span className="text-amber-400">SUTRA</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono tracking-tight mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    Protective Intelligence
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-white/10 transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            {/* The Sutra Ambient Line */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          </div>

          {/* Navigation Groups List */}
          <div className="overflow-y-auto max-h-[calc(100vh-140px)] py-4 px-3 space-y-6">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                {!isCollapsed && (
                  <span className="px-3 text-[9px] font-mono font-black tracking-widest text-slate-400 uppercase block">
                    {group.title}
                  </span>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item: any) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center rounded-xl transition-all cursor-pointer group relative ${
                          isCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'
                        } ${
                          isActive
                            ? 'bg-[#141d2e] text-amber-300 border-l-2 border-l-amber-500 border-y border-r border-white/10 shadow-sutra-glow font-bold'
                            : item.highlight
                            ? 'bg-rose-950/30 text-rose-300 border border-rose-500/30 hover:bg-rose-950/60'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-[#0c121e] border border-transparent'
                        }`}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                            isActive ? 'text-amber-400' : item.highlight ? 'text-rose-400' : 'text-slate-400'
                          }`} />
                          {!isCollapsed && (
                            <span className="text-xs font-mono truncate">{item.label}</span>
                          )}
                        </div>

                        {!isCollapsed && item.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-black bg-amber-500 text-slate-950 shadow-sm">
                            {item.badge}
                          </span>
                        )}

                        {/* Collapsed Tooltip */}
                        {isCollapsed && (
                          <div className="absolute left-full ml-2 px-2.5 py-1 rounded-xl bg-[#141d2e] border border-white/10 text-white font-mono text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-2xl">
                            {item.label}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Account / Sign In Footer */}
        <div className="p-3 border-t border-white/[0.07] bg-[#050810]">
          {isAuthenticated && user ? (
            <div className="flex items-center justify-between">
              {!isCollapsed ? (
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-xs font-mono font-bold text-white truncate">
                    {user.full_name || user.email.split('@')[0]}
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-black">
                    {user.subscription_tier || 'ENTERPRISE'} TIER
                  </span>
                </div>
              ) : null}
              <button
                onClick={() => logout()}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {!isCollapsed ? (
                <button
                  onClick={() => setActiveTab('login')}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono text-xs font-black transition-all cursor-pointer text-center shadow-sutra-glow"
                >
                  Access Terminal
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('login')}
                  className="p-2 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-400 hover:text-white transition-colors cursor-pointer flex justify-center shadow-sutra-glow"
                  title="Sign In"
                  aria-label="Sign In"
                >
                  <Lock className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* 2. Main Content Stage */}
      <div className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${
        isCollapsed ? 'md:pl-20' : 'md:pl-64'
      }`}>
        
        {/* Top Operational Command Bar (RDS 2.0) */}
        <header className="sticky top-0 z-30 bg-[#070b12]/90 border-b border-white/[0.07] backdrop-blur-xl h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Left section: Mobile menu + Status ticker */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="md:hidden p-2 rounded-xl bg-[#0c121e] border border-white/10 text-slate-400 hover:text-white cursor-pointer"
              aria-label="Open Mobile Menu"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>

            {/* Live Security Telemetry Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0c121e] border border-white/10 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">DEFENSIVE STATUS:</span>
              <span className="text-emerald-300 font-bold">100% OPERATIONAL</span>
            </div>
          </div>

          {/* Center search trigger (Ctrl + K) */}
          <div className="flex items-center gap-2 flex-1 max-w-md mx-4">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="w-full flex items-center justify-between px-4 py-2 rounded-2xl bg-[#030508] border border-white/10 hover:border-amber-500/40 text-slate-400 hover:text-slate-200 text-xs font-mono transition-all cursor-pointer shadow-inner group"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Search forensics, tools, target...</span>
              </div>
              <kbd className="hidden sm:inline-flex px-2 py-0.5 rounded bg-[#0c121e] border border-white/10 text-[10px] text-amber-400/80 font-mono">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Emergency Defense Button */}
            <button
              onClick={() => setActiveTab('emergency-mode')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold hover:bg-rose-900/60 transition-colors cursor-pointer shadow-sm shadow-rose-950"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span className="hidden lg:inline">Emergency Mode</span>
              <span className="lg:hidden">Emergency</span>
            </button>

            {/* User Authentication Pill */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 bg-[#0c121e] px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-white font-bold max-w-[120px] sm:max-w-[180px] truncate">
                  {user.email}
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded uppercase font-black ${
                  isAdmin ? 'bg-rose-950 text-rose-300 border border-rose-600/40' : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                }`}>
                  {user.role}
                </span>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sutra-glow"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Helpline 1930 */}
            <a
              href="tel:1930"
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c121e] border border-white/10 text-slate-300 font-mono text-xs hover:border-amber-500/40 transition-colors"
              title="National Cyber Financial Fraud Helpline (India)"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span>1930 Helpline</span>
            </a>
          </div>

        </header>

        {/* Main Body View */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* Global Command Palette (Ctrl + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(tab, extra) => {
          setActiveTab(tab, extra);
          setIsCommandPaletteOpen(false);
        }}
      />

      {/* Mobile Drawer Navigation */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-[#030508]/95 backdrop-blur-2xl flex flex-col p-4">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2 font-mono font-black text-white">
              <Shield className="w-5 h-5 text-amber-400" />
              <span>RAKSHASUTRA</span>
            </div>
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className="p-2 rounded-xl bg-[#0c121e] border border-white/10 text-slate-400"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-4 font-mono text-xs">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">{group.title}</span>
                <div className="space-y-1">
                  {group.items.map((item: any) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileNavOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl ${
                          activeTab === item.id
                            ? 'bg-[#141d2e] border-l-2 border-l-amber-500 border-y border-r border-white/10 text-amber-300 font-bold'
                            : 'bg-[#0c121e] border border-white/10 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-amber-400" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500 text-slate-950 font-bold">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
