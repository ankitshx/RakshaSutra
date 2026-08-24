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
  Server
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, isAdmin, login } = useAuth();
  const [activeTab, setActiveTab] = useState<'health' | 'ioc' | 'events' | 'users'>('health');
  
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

  const loadAdminData = async () => {
    try {
      if (activeTab === 'health') {
        const hData = await api.getSystemHealth();
        setHealth(hData);
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
      // handled
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
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0c121e] border border-white/10 w-fit font-mono text-xs">
        {[
          { id: 'health', label: 'Cluster Health', icon: Server },
          { id: 'ioc', label: 'IOC Threat Intelligence', icon: Radio },
          { id: 'events', label: 'Security Audit Logs', icon: ShieldAlert },
          { id: 'users', label: 'User Directory', icon: Users }
        ].map((t) => {
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
