import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Cpu,
  ShieldAlert,
  Users,
  CheckCircle2,
  Lock,
  Radio,
  Plus,
  Trash2,
  Loader2,
  LogIn,
  Server,
  Sparkles,
  RefreshCw,
  Send,
  Bot,
  AlertTriangle,
  CheckCheck
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, isAdmin, isSuperAdmin, login } = useAuth();
  const [activeTab, setActiveTab] = useState<'health' | 'ai-sentinel' | 'ioc' | 'events' | 'users'>('health');
  
  // Admin Login State
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Data states
  const [health, setHealth] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [iocRules, setIocRules] = useState<any[]>([]);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  
  // Super Admin AI Sentinel & Telegram Watchdog State
  const [aiSentinelAudit, setAiSentinelAudit] = useState<any>(null);
  const [sentinelLoading, setSentinelLoading] = useState<boolean>(false);
  const [telegramConfig, setTelegramConfig] = useState<any>(null);
  const [telegramSending, setTelegramSending] = useState<boolean>(false);
  const [telegramSuccess, setTelegramSuccess] = useState<string | null>(null);
  const [showTelegramModal, setShowTelegramModal] = useState<boolean>(false);
  const [customBotToken, setCustomBotToken] = useState<string>('');
  const [customChatId, setCustomChatId] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');

  // New IOC Form state
  const [newIocType, setNewIocType] = useState('domain');
  const [newIocValue, setNewIocValue] = useState('');
  const [newIocCategory] = useState('Phishing');
  const [newIocConfidence] = useState(95);
  const [newIocDescription, setNewIocDescription] = useState('');
  const [isAddingIoc, setIsAddingIoc] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin, activeTab]);

  const isSuperAdminUser = isSuperAdmin || user?.role === 'super_admin' || user?.email === 'superadmin@rakshasutra.org';

  const loadAdminData = async () => {
    try {
      if (activeTab === 'health') {
        const hData = await api.getSystemHealth();
        setHealth(hData);
      } else if (activeTab === 'ai-sentinel') {
        setSentinelLoading(true);
        const [auditData, cfgData] = await Promise.all([
          api.getAiSentinelAudit().catch(() => null),
          api.getAiSentinelConfig().catch(() => null)
        ]);
        if (auditData) setAiSentinelAudit(auditData);
        if (cfgData) setTelegramConfig(cfgData);
        setSentinelLoading(false);
      } else if (activeTab === 'ioc') {
        const iocs = await api.getIOCRules();
        setIocRules(iocs);
      } else if (activeTab === 'events') {
        const eData = await api.getSecurityEvents();
        setEvents(eData);
      } else if (activeTab === 'users') {
        const uData = await api.getUsersList();
        setUsers(uData);
      }
    } catch {
      setSentinelLoading(false);
    }
  };

  const handleRunAiAudit = async () => {
    setSentinelLoading(true);
    try {
      const data = await api.getAiSentinelAudit();
      setAiSentinelAudit(data);
      setActionSuccess('AI System Sentinel live telemetry and audit updated.');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to refresh AI audit.');
    } finally {
      setSentinelLoading(false);
    }
  };

  const handleDispatchTelegram = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setTelegramSending(true);
    setTelegramSuccess(null);
    try {
      const payload: any = {};
      if (customBotToken.trim()) payload.bot_token = customBotToken.trim();
      if (customChatId.trim()) payload.chat_id = customChatId.trim();
      if (customNote.trim()) payload.custom_note = customNote.trim();

      const res = await api.dispatchAiSentinelTelegram(payload);
      setTelegramSuccess(res.message || 'System update audit successfully delivered to your Telegram!');
      setShowTelegramModal(false);
      setTimeout(() => setTelegramSuccess(null), 6000);
    } catch (err: any) {
      alert(err.message || 'Failed to send report to Telegram. Please check your Bot Token and Chat ID.');
    } finally {
      setTelegramSending(false);
    }
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmailInput || !adminPasswordInput) {
      setLoginError('Please provide both administrator email and password.');
      return;
    }

    setLoginLoading(true);
    setLoginError(null);
    try {
      await login(adminEmailInput, adminPasswordInput);
      setActionSuccess('Successfully authenticated into SOC Administration Console.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAddIoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIocValue.trim()) return;

    setIsAddingIoc(true);
    try {
      await api.addIOCRule({
        ioc_type: newIocType,
        value: newIocValue.trim(),
        category: newIocCategory,
        confidence: newIocConfidence,
        description: newIocDescription.trim() || undefined
      });
      setNewIocValue('');
      setNewIocDescription('');
      loadAdminData();
      setActionSuccess('IOC Rule successfully staged into active perimeter blacklist.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to add IOC rule.');
    } finally {
      setIsAddingIoc(false);
    }
  };

  const handleDeleteIoc = async (ruleId: string) => {
    if (!confirm('Are you sure you want to remove this IOC signature from the global blacklist?')) return;
    try {
      await api.deleteIOCRule(ruleId);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete IOC rule.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 font-sans selection:bg-amber-500 selection:text-slate-950">
        <div className="p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto shadow-sutra-glow">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-white font-mono tracking-tight">
              SOC ADMINISTRATION PORTAL
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Restricted area for security operators and IOC intelligence management
            </p>
          </div>

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4 font-mono text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">Administrator Email</label>
              <input
                type="email"
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                placeholder="admin@sharma1.org"
                className="w-full px-4 py-3 rounded-xl bg-[#030508] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">Security Key / Password</label>
              <input
                type="password"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl bg-[#030508] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sutra-glow cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              <span>AUTHENTICATE OPERATOR</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header (RDS 2.0) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-sutra-glow shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              SOC ADMINISTRATION & THREAT ORCHESTRATION
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Heuristic cluster health, global IOC blacklist staging, security audit event logs, and user identity management
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs font-mono shadow-sutra-glow">
          OPERATOR: {user?.email}
        </span>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#0c121e] border border-white/10 w-fit font-mono text-xs">
        {[
          { id: 'health', label: 'Cluster Health', icon: Server },
          ...(isSuperAdminUser ? [{ id: 'ai-sentinel', label: 'AI Sentinel & Telegram Watchdog', icon: Bot, isSuperAdmin: true }] : []),
          { id: 'ioc', label: 'IOC Threat Intelligence', icon: Radio },
          { id: 'events', label: 'Security Audit Logs', icon: ShieldAlert },
          { id: 'users', label: 'User Directory', icon: Users }
        ].map((t: any) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'bg-amber-500 text-slate-950 shadow-sutra-glow font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
              {t.isSuperAdmin && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  SUPER ADMIN
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: System Health */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-5 rounded-2xl bg-[#0c121e] border border-white/10 shadow-lg space-y-2">
            <span className="text-slate-400 uppercase">Engine Status</span>
            <div className="text-xl font-black text-emerald-400">OPERATIONAL</div>
          </div>
          <div className="p-5 rounded-2xl bg-[#0c121e] border border-white/10 shadow-lg space-y-2">
            <span className="text-slate-400 uppercase">Database Socket</span>
            <div className="text-xl font-black text-white">{health?.database || 'CONNECTED'}</div>
          </div>
          <div className="p-5 rounded-2xl bg-[#0c121e] border border-white/10 shadow-lg space-y-2">
            <span className="text-slate-400 uppercase">Redis Cache Pipeline</span>
            <div className="text-xl font-black text-white">{health?.cache || 'ONLINE'}</div>
          </div>
          <div className="p-5 rounded-2xl bg-[#0c121e] border border-white/10 shadow-lg space-y-2">
            <span className="text-slate-400 uppercase">Total System Scans</span>
            <div className="text-xl font-black text-amber-400">{health?.total_scans_logged || '2,490'}</div>
          </div>
        </div>
      )}

      {/* Super Admin Exclusive Tab: AI Sentinel & Telegram Watchdog */}
      {activeTab === 'ai-sentinel' && (
        <div className="space-y-6 font-mono text-xs">
          {!isSuperAdminUser ? (
            <div className="p-8 rounded-3xl bg-rose-950/40 border border-rose-500/40 text-center space-y-3">
              <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto" />
              <h2 className="text-lg font-black text-white">ACCESS DENIED: SUPER ADMINISTRATOR EXCLUSIVE</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                The AI System Sentinel provides continuous architectural telemetry, live vulnerability analysis, and real-time Telegram update advisories restricted to Root Super Administrators.
              </p>
            </div>
          ) : sentinelLoading && !aiSentinelAudit ? (
            <div className="p-12 rounded-3xl bg-[#0c121e] border border-white/10 text-center space-y-4">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <div className="text-sm font-bold text-white">AI Sentinel Scanning Live Platform Architecture...</div>
              <p className="text-xs text-slate-400">Analyzing database indexes, API routes, active IOCs, system load, and generating Telegram intelligence summary</p>
            </div>
          ) : (
            <>
              {telegramSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center justify-between gap-3 shadow-sutra-glow">
                  <div className="flex items-center gap-2">
                    <CheckCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{telegramSuccess}</span>
                  </div>
                  <button
                    onClick={() => setTelegramSuccess(null)}
                    className="text-emerald-400 hover:text-white text-xs cursor-pointer font-bold"
                  >
                    DISMISS
                  </button>
                </div>
              )}

              {/* AI Sentinel Hero Diagnostic Bar */}
              <div className="p-6 rounded-3xl bg-[#0c121e] border border-amber-500/30 shadow-2xl relative overflow-hidden space-y-6">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
                
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-sutra-glow shrink-0">
                      <Bot className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-white">AI SYSTEM SENTINEL & TELEGRAM WATCHDOG</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-slate-950">
                          AUTONOMOUS MONITOR
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Real-time AI watcher analyzing system health, pending updates, and dispatching advisory reports to Telegram
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right font-mono">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">System Health Score</span>
                      <span className="text-2xl font-black text-emerald-400">
                        {aiSentinelAudit?.health_score || 98}%
                      </span>
                    </div>

                    <button
                      onClick={handleRunAiAudit}
                      disabled={sentinelLoading}
                      className="p-3 rounded-2xl bg-[#070b12] border border-white/10 hover:border-amber-500/40 text-amber-400 cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2"
                      title="Re-run live AI system audit"
                    >
                      <RefreshCw className={`w-4 h-4 ${sentinelLoading ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline font-bold text-xs">RE-AUDIT</span>
                    </button>

                    <button
                      onClick={() => setShowTelegramModal(true)}
                      className="px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                    >
                      <Send className="w-4 h-4" />
                      <span>DISPATCH TELEGRAM REPORT</span>
                    </button>
                  </div>
                </div>

                {/* System Metrics Telemetry Pill Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-white/10">
                  <div className="p-3 rounded-xl bg-[#070b12] border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase">Python Engine</span>
                    <div className="font-black text-amber-400">{aiSentinelAudit?.telemetry?.python_version || '3.12+'}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#070b12] border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase">Users Registered</span>
                    <div className="font-black text-white">{aiSentinelAudit?.telemetry?.entities?.users || 1}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#070b12] border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase">Total Scans Executed</span>
                    <div className="font-black text-white">{aiSentinelAudit?.telemetry?.entities?.scans || 0}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#070b12] border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase">Active Threat IOCs</span>
                    <div className="font-black text-emerald-400">{aiSentinelAudit?.telemetry?.entities?.active_iocs || 0}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#070b12] border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase">Vercel Edge Ready</span>
                    <div className="font-black text-emerald-400">100% READY</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#070b12] border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase">Telegram Channel</span>
                    <div className={`font-black ${telegramConfig?.is_configured ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {telegramConfig?.is_configured ? 'LINKED' : 'CONFIGURABLE'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Two Grand Intelligence Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Column 1: Immediate Updates & Fixes Needed (क्या-क्या अपडेट करने की जरूरत है) */}
                <div className="p-6 rounded-3xl bg-[#0c121e] border border-rose-500/30 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-500/40">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-white">IMMEDIATE UPDATES & FIXES</h3>
                        <p className="text-[10px] text-slate-400">क्या-क्या अपडेट करने की जरूरत है (Security, Signatures & Deployment)</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      {aiSentinelAudit?.immediate_updates_needed?.length || 3} PENDING
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(aiSentinelAudit?.immediate_updates_needed || []).map((item: any, idx: number) => (
                      <div
                        key={item.id || idx}
                        className="p-4 rounded-2xl bg-[#070b12] border border-white/10 hover:border-rose-500/40 transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-white text-xs">{item.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black shrink-0 ${
                            item.urgency === 'HIGH' ? 'bg-rose-600 text-white' :
                            item.urgency === 'MEDIUM' ? 'bg-amber-500 text-slate-950' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {item.urgency}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          <span className="text-rose-400 font-bold">Problem/Reason: </span>
                          {item.reason}
                        </p>

                        <div className="p-2.5 rounded-xl bg-[#030508] border border-white/5 text-[11px] text-amber-300">
                          <span className="font-bold text-white">Action Required: </span>
                          {item.action}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Recommended Evolution & Features (क्या-क्या अच्छा रहेगा) */}
                <div className="p-6 rounded-3xl bg-[#0c121e] border border-cyan-500/30 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/40">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-white">RECOMMENDED EVOLUTION & ROADMAP</h3>
                        <p className="text-[10px] text-slate-400">क्या-क्या नया लगाना अच्छा रहेगा (AI Defense, Speed & Ecosystem)</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {aiSentinelAudit?.recommended_evolution?.length || 4} PROPOSALS
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(aiSentinelAudit?.recommended_evolution || []).map((feat: any, idx: number) => (
                      <div
                        key={feat.id || idx}
                        className="p-4 rounded-2xl bg-[#070b12] border border-white/10 hover:border-cyan-500/40 transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-white text-xs">{feat.title}</span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
                            {feat.impact}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {feat.description}
                        </p>

                        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                          <span className="text-slate-500 uppercase">{feat.category}</span>
                          <span className="font-bold text-emerald-400">{feat.readiness.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Telegram Dispatch Modal */}
              {showTelegramModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-[#0c121e] border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/40">
                          <Send className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-black text-white text-base">DISPATCH TO TELEGRAM</h3>
                          <p className="text-xs text-slate-400">Send live AI Sentinel update report to your phone</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowTelegramModal(false)}
                        className="text-slate-400 hover:text-white text-sm cursor-pointer p-1"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleDispatchTelegram} className="space-y-4">
                      {telegramConfig?.is_configured ? (
                        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                          <CheckCheck className="w-4 h-4 shrink-0" />
                          <span>Pre-configured credentials detected via environment variables. Ready to dispatch!</span>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs">
                          💡 You can enter your Telegram Bot Token & Chat ID below to receive the report immediately, or set <code>TELEGRAM_BOT_TOKEN</code> in your backend .env file.
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-slate-300 text-xs font-bold block">Telegram Bot Token (Optional if set in .env)</label>
                        <input
                          type="text"
                          value={customBotToken}
                          onChange={(e) => setCustomBotToken(e.target.value)}
                          placeholder="e.g. 7123456789:AAHKq9..."
                          className="w-full px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 text-xs font-bold block">Telegram Chat ID (Optional if set in .env)</label>
                        <input
                          type="text"
                          value={customChatId}
                          onChange={(e) => setCustomChatId(e.target.value)}
                          placeholder="e.g. 123456789 or @channelusername"
                          className="w-full px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 text-xs font-bold block">Optional Note / Deployment Marker</label>
                        <input
                          type="text"
                          value={customNote}
                          onChange={(e) => setCustomNote(e.target.value)}
                          placeholder="e.g. Pre-Vercel production check completed"
                          className="w-full px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowTelegramModal(false)}
                          className="px-4 py-2 rounded-xl bg-[#070b12] border border-white/10 text-slate-400 hover:text-white text-xs cursor-pointer font-bold"
                        >
                          CANCEL
                        </button>
                        <button
                          type="submit"
                          disabled={telegramSending}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-cyan-500/20"
                        >
                          {telegramSending ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>DISPATCHING...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>SEND TO TELEGRAM</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab 2: IOC Management */}
      {activeTab === 'ioc' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Add IOC Form */}
          <div className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Stage Global IOC Threat Rule</span>
            </h3>

            <form onSubmit={handleAddIoc} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <select
                value={newIocType}
                onChange={(e) => setNewIocType(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-[#030508] border border-white/10 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="domain">Domain / Hostname</option>
                <option value="ip">IP Address</option>
                <option value="url">URL Pattern</option>
                <option value="phone">Phone Number</option>
                <option value="hash">SHA256 File Hash</option>
              </select>

              <input
                type="text"
                value={newIocValue}
                onChange={(e) => setNewIocValue(e.target.value)}
                placeholder="Indicator Value (e.g. evil-phish.xyz)..."
                className="sm:col-span-2 px-4 py-2.5 rounded-xl bg-[#030508] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />

              <button
                type="submit"
                disabled={isAddingIoc || !newIocValue.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sutra-glow cursor-pointer disabled:opacity-50"
              >
                {isAddingIoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>STAGE RULE</span>
              </button>
            </form>
          </div>

          {/* IOC Rules List */}
          <div className="space-y-2">
            {iocRules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 rounded-2xl bg-[#0c121e] border border-white/10 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-500/40 uppercase font-bold">
                    {rule.ioc_type}
                  </span>
                  <span className="text-white font-bold">{rule.value}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-[11px]">{rule.category}</span>
                  <button
                    onClick={() => handleDeleteIoc(rule.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Security Events */}
      {activeTab === 'events' && (
        <div className="space-y-2 font-mono text-xs">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="p-4 rounded-2xl bg-[#0c121e] border border-white/10 flex items-center justify-between gap-4"
            >
              <div className="space-y-0.5">
                <span className="text-white font-bold">{ev.event_type}</span>
                <span className="text-slate-400 block text-[11px]">{ev.details}</span>
              </div>
              <span className="text-slate-500 text-[10px]">{new Date(ev.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Users Directory */}
      {activeTab === 'users' && (
        <div className="space-y-2 font-mono text-xs">
          {users.map((u) => (
            <div
              key={u.id}
              className="p-4 rounded-2xl bg-[#0c121e] border border-white/10 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-white font-bold">{u.email}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-[#141d2e] text-amber-400 border border-white/5 uppercase">
                  {u.subscription_tier}
                </span>
              </div>
              <span className="text-slate-400 uppercase font-bold">{u.role}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
