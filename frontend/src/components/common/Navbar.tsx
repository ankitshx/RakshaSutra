import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SubscriptionLimitModal } from './SubscriptionLimitModal';
import { ExtensionInstallModal } from './ExtensionInstallModal';
import {
  Shield,
  Search,
  MessageSquare,
  Globe,
  Radio,
  Bot,
  BookOpen,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  Sliders,
  PhoneCall,
  Sun,
  Moon,
  Code,
  Sparkles,
  Zap,
  Eye,
  Flame
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Command Center', icon: Shield },
    { id: 'url-scanner', label: 'URL Scanner', icon: Search },
    { id: 'message-scanner', label: 'Message Analyzer', icon: MessageSquare },
    { id: 'darkweb', label: 'Dark Web', icon: Eye },
    { id: 'deception', label: 'Hacker Traps', icon: Flame },
    { id: 'website-analyzer', label: 'Website Audit', icon: Globe },
    { id: 'threat-intel', label: 'Threat Intel', icon: Radio },
    { id: 'raksha-ai', label: 'Raksha AI', icon: Bot },
    { id: 'awareness', label: 'Awareness Hub', icon: BookOpen },
    { id: 'api-access', label: 'Pricing & API', icon: Code },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: Sliders });
  }

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  const isPro = user?.subscription_tier === 'pro' || user?.subscription_tier === 'enterprise' || isAdmin;
  const dailyQuota = user?.daily_quota || 6;
  const scansToday = user?.scans_today || 0;
  const scansLeftToday = user ? Math.max(0, dailyQuota - scansToday) : 6;

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/80 dark:bg-slate-950/80 bg-white/80 backdrop-blur-2xl border-b border-cyber-border/80 dark:border-cyber-border/80 border-slate-200 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => handleNavClick('landing')}
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-indigo-600/30 border border-cyan-500/50 group-hover:border-cyan-400 shadow-neon-cyan transition-all">
                <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-white dark:text-white text-slate-900 font-mono">
                    RAKSHA<span className="text-cyan-400">SUTRA</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-950 dark:bg-cyan-950 bg-cyan-100 text-cyan-400 dark:text-cyan-400 text-cyan-700 border border-cyan-500/40 font-mono">
                    CORE 1.0
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-400 text-slate-500 tracking-wide font-medium">
                  Check Before You Click.
                </p>
              </div>
            </div>

            {/* Desktop Nav Items */}
            <nav className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-400 dark:text-cyan-300 text-cyan-700 border border-cyan-500/50 shadow-neon-cyan'
                        : 'text-slate-300 dark:text-slate-300 text-slate-600 hover:text-white dark:hover:text-white hover:text-slate-950 hover:bg-slate-900/80 dark:hover:bg-slate-900/80 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-cyan-400 shadow-neon-cyan" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Action & Auth Area */}
            <div className="hidden lg:flex items-center gap-2.5">
              {/* Subscription Plan Badge & Upgrade Button */}
              {isPro ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{user?.subscription_tier === 'enterprise' ? 'ENTERPRISE' : 'PRO (UNLIMITED)'}</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
                  title="Click to upgrade subscription for unlimited scans"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Free ({scansLeftToday}/6 left today) • Upgrade</span>
                </button>
              )}

              {/* Browser Extension Modal Button */}
              <button
                onClick={() => setIsExtensionModalOpen(true)}
                title="Get Universal AI Browser Extension"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
              >
                <span>🧩 Extension</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                className="p-2 rounded-xl bg-slate-900 dark:bg-slate-900 bg-slate-100 border border-slate-800 dark:border-slate-800 border-slate-300 text-slate-300 dark:text-slate-300 text-slate-700 hover:text-cyan-400 transition-all cursor-pointer shadow-sm"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-cyan-600" />
                )}
              </button>

              {/* Quick Emergency 1930 Pill */}
              <button
                onClick={() => handleNavClick('raksha-ai')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-600/40 text-rose-300 text-xs font-mono font-bold transition-all shadow-neon-red cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                <span>1930</span>
              </button>

              {isAuthenticated && user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-800 dark:border-slate-800 border-slate-300">
                  <button
                    onClick={() => handleNavClick('history')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 dark:text-slate-300 text-slate-600 hover:text-white dark:hover:text-white hover:text-slate-900 cursor-pointer ${
                      activeTab === 'history' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : ''
                    }`}
                  >
                    History
                  </button>
                  <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-xs font-bold font-mono">
                    {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
                  </div>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-800 dark:border-slate-800 border-slate-300">
                  <button
                    onClick={() => handleNavClick('login')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 dark:text-slate-300 text-slate-600 hover:text-white dark:hover:text-white hover:text-slate-900 cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNavClick('register')}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold hover:brightness-110 shadow-neon-cyan transition-all cursor-pointer"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu & Theme Button */}
            <div className="flex xl:hidden items-center gap-2">
              <button
                onClick={() => setIsUpgradeModalOpen(true)}
                className="px-2 py-1 rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-300 text-[10px] font-mono font-bold"
              >
                {isPro ? '⭐ PRO' : `${scansLeftToday}/6 Left Today`}
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-900 dark:bg-slate-900 bg-slate-100 border border-slate-800 dark:border-slate-800 border-slate-300 text-slate-300 dark:text-slate-300 text-slate-700"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-600" />}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl bg-slate-900 dark:bg-slate-900 bg-slate-100 border border-slate-800 dark:border-slate-800 border-slate-300 text-slate-300 dark:text-slate-300 text-slate-700 hover:text-white dark:hover:text-white hover:text-slate-950"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="xl:hidden bg-slate-950/95 dark:bg-slate-950/95 bg-white/95 border-b border-cyber-border dark:border-cyber-border border-slate-200 px-4 pt-2 pb-6 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-400 dark:text-cyan-400 text-cyan-700 border border-cyan-500/50'
                        : 'text-slate-400 dark:text-slate-400 text-slate-600 hover:bg-slate-900/60 dark:hover:bg-slate-900/60 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-800 dark:border-slate-800 border-slate-200 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsUpgradeModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <Zap className="w-4 h-4" />
                <span>{isPro ? 'Manage Subscription' : 'Upgrade to Pro (Unlimited)'}</span>
              </button>

              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="w-full py-2 rounded-xl bg-rose-950/40 text-rose-300 border border-rose-600/40 text-xs font-bold"
                >
                  Sign Out
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleNavClick('login')}
                    className="flex-1 py-2 rounded-xl bg-slate-900 dark:bg-slate-900 bg-slate-100 text-slate-300 dark:text-slate-300 text-slate-700 text-xs font-bold"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNavClick('register')}
                    className="flex-1 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Subscription Upgrade Modal */}
      <SubscriptionLimitModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />

      {/* Browser Extension Install Modal */}
      <ExtensionInstallModal
        isOpen={isExtensionModalOpen}
        onClose={() => setIsExtensionModalOpen(false)}
      />
    </>
  );
};
