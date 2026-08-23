import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SubscriptionLimitModal } from './SubscriptionLimitModal';
import { ExtensionInstallModal } from './ExtensionInstallModal';
import {
  Shield,
  Search,
  Menu,
  X,
  LogOut,
  Sliders,
  PhoneCall,
  Sun,
  Moon,
  Eye,
  Flame,
  Network,
  Bell,
  Award,
  Terminal,
  ShieldCheck
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

  const tier = (user?.subscription_tier || 'free').toLowerCase();
  const role = (user?.role || 'user').toLowerCase();
  const isPrivileged = role === 'super_admin' || role === 'admin' || role === 'enterprise_admin' || tier === 'enterprise';

  // Structured Core Navigation Items
  const navItems = [
    { id: 'landing', label: 'Command Center', icon: Shield },
    { id: 'investigation-center', label: 'Investigate', icon: Search, badge: 'Flagship' },
    { id: 'monitoring', label: 'Monitor', icon: Bell },
    { id: 'security-passport', label: 'Security Passport', icon: Award },
    { id: 'osint', label: 'OSINT', icon: Network },
    { id: 'darkweb', label: 'Dark Web', icon: Eye },
    { id: 'developer-playground', label: 'Developer API', icon: Terminal },
    { id: 'trust-center', label: 'Trust & Status', icon: ShieldCheck }
  ];

  if (isPrivileged) {
    navItems.push({ id: 'deception', label: 'Honeytokens', icon: Flame });
  }

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'SOC Admin', icon: Sliders });
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-slate-950/80 dark:bg-slate-950/80 bg-white/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
              <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-neon-cyan">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-wider text-slate-900 dark:text-white font-mono">
                  RAKSHA<span className="text-cyan-500">SUTRA</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono tracking-tight hidden sm:block">
                  Check Before You Click
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer relative ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-500 text-slate-950 font-black">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Action Icons & Auth */}
            <div className="flex items-center gap-3">
              
              {/* Emergency Helpline Toll-Free Pill */}
              <a
                href="tel:1930"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold hover:bg-rose-900/60 transition-colors"
                title="National Cyber Financial Fraud Helpline"
              >
                <PhoneCall className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>1930 Helpline</span>
              </a>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title="Toggle UI Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* User Account / Auth Section */}
              {isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden lg:flex flex-col text-right">
                    <span className="text-xs font-mono font-bold text-white max-w-[120px] truncate">
                      {user.full_name || user.email.split('@')[0]}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase">
                      {user.subscription_tier} Tier
                    </span>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('login')}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-mono text-xs font-bold transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setActiveTab('register')}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-black transition-colors cursor-pointer"
                  >
                    Get Started
                  </button>
                </div>
              )}

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-4 pt-2 pb-6 space-y-1 font-mono text-xs animate-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-xl font-bold flex items-center justify-between transition-colors ${
                    isActive ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500 text-slate-950 font-black">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </nav>

      <SubscriptionLimitModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />

      <ExtensionInstallModal
        isOpen={isExtensionModalOpen}
        onClose={() => setIsExtensionModalOpen(false)}
      />
    </>
  );
};
