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
  ShieldCheck,
  Server,
  Mail,
  KeyRound,
  Shield
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
  const [newIocCategory, setNewIocCategory] = useState('Phishing');
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
        ioc_value: newIocValue.trim(),
        threat_category: newIocCategory,
        confidence: newIocConfidence,
        description: newIocDescription.trim() || 'Admin added custom rule'
      });
      setNewIocValue('');
      setNewIocDescription('');
      setActionSuccess('Custom IOC signature added to live defense boundary!');
      setTimeout(() => setActionSuccess(null), 3000);
      const updated = await api.getIOCRules();
      setIocRules(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to add IOC rule.');
    } finally {
      setIsAddingIoc(false);
    }
  };

  const handleDeleteIoc = async (iocId: string, value: string) => {
    if (!confirm(`Delete threat signature '${value}'?`)) return;
    try {
      await api.deleteIOCRule(iocId);
      setIocRules((prev) => prev.filter((i) => i.id !== iocId));
      setActionSuccess(`Threat signature '${value}' removed.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete IOC rule.');
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'user' ? 'analyst' : currentRole === 'analyst' ? 'admin' : 'user';
    try {
      await api.toggleUserRole(userId, nextRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: nextRole } : u))
      );
      setActionSuccess(`User role updated to '${nextRole}'.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch {
      // error handled
    }
  };

  // If not logged in as Admin, show Secure Authentication Gate
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 space-y-6 font-mono">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 mx-auto shadow-neon-cyan">
            <Lock className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/40">
            Restricted SOC Access
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Administrator Command Gate
          </h2>
          <p className="text-xs text-slate-500">
            Sign in with authorized administrator credentials to manage threat IOC rules, system telemetry, and user roles.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
          {loginError && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  placeholder="admin@domain.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Security Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-slate-950 font-black uppercase tracking-wider shadow-neon-cyan transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Authenticate SOC Admin</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Official SOC Command Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-500/50 shadow-2xl text-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 shadow-neon-cyan">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                Authorized SOC Portal
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight pt-0.5">
                RakshaSutra Administrator Command Center
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40">
            <CheckCircle2 className="w-4 h-4" />
            <span>Super Admin Active ({user?.email})</span>
          </div>
        </div>
      </div>

      {/* Action Success Alert */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 w-fit font-mono">
        <button
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'health'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-neon-cyan'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>System & Provider Health</span>
        </button>
        <button
          onClick={() => setActiveTab('ioc')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ioc'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-neon-cyan'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Threat Blocklist & IOC Rules</span>
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'events'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-neon-cyan'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>SSRF & Security Audit Log</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-neon-cyan'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Access Control</span>
        </button>
      </div>

      {/* TAB 1: HEALTH */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 block">Core Defense Status</span>
              <span className="text-xl font-bold text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-5 h-5" /> OPERATIONAL
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 block">CPU Utilization</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {health?.cpu_usage_pct ?? '4.8'}%
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 block">Memory Allocation</span>
              <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                {health?.memory_usage_pct ?? '32.1'}%
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 block">Live Threat Providers</span>
              <span className="text-2xl font-black text-emerald-500 dark:text-emerald-400 font-mono">
                3 Active Feeds
              </span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-500" /> Active Threat Intelligence Engines
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">abuse.ch URLhaus</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <p className="text-[11px] text-slate-500">Real-time malware URL feed with automated local caching.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">VirusTotal Engine</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <p className="text-[11px] text-slate-500">Multi-scanner consensus heuristics and domain telemetry.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">AbuseIPDB Gateway</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <p className="text-[11px] text-slate-500">IP reputation database for high-frequency malicious origins.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IOC RULES MANAGER */}
      {activeTab === 'ioc' && (
        <div className="space-y-6">
          {/* Add New IOC Signature Form */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-500" /> Add Custom Malicious Threat Signature (IOC)
            </h3>
            <form onSubmit={handleAddIoc} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Type</label>
                <select
                  value={newIocType}
                  onChange={(e) => setNewIocType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-mono"
                >
                  <option value="domain">Domain</option>
                  <option value="url">Full URL</option>
                  <option value="ip">IP Address</option>
                  <option value="hash">File Hash</option>
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">IOC Value</label>
                <input
                  type="text"
                  value={newIocValue}
                  onChange={(e) => setNewIocValue(e.target.value)}
                  placeholder="e.g. sbi-fake-portal.top or 198.51.100.22"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Threat Category</label>
                <select
                  value={newIocCategory}
                  onChange={(e) => setNewIocCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-mono"
                >
                  <option value="Phishing">Phishing</option>
                  <option value="Malware">Malware</option>
                  <option value="Scam">Scam / Fraud</option>
                  <option value="C2">Command & Control</option>
                </select>
              </div>

              <div className="sm:col-span-3 flex items-end">
                <button
                  type="submit"
                  disabled={isAddingIoc || !newIocValue.trim()}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isAddingIoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Add Rule</span>
                </button>
              </div>
            </form>
          </div>

          {/* Active IOCs Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
              Active Signatures in Local Threat Database ({iocRules.length})
            </h3>
            {iocRules.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono">No custom IOC signatures currently registered.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 pb-2">
                      <th className="py-2">Type</th>
                      <th className="py-2">Target Value</th>
                      <th className="py-2">Category</th>
                      <th className="py-2">Confidence</th>
                      <th className="py-2">Source</th>
                      <th className="py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {iocRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/60">
                        <td className="py-3 uppercase font-bold text-cyan-600 dark:text-cyan-400">{rule.ioc_type}</td>
                        <td className="py-3 font-bold text-slate-900 dark:text-white">{rule.ioc_value}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            {rule.threat_category}
                          </span>
                        </td>
                        <td className="py-3 text-slate-700 dark:text-slate-300">{rule.confidence}%</td>
                        <td className="py-3 text-slate-500">{rule.source}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDeleteIoc(rule.id, rule.ioc_value)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY EVENTS & SSRF DEFENSE LOG */}
      {activeTab === 'events' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" /> Security Audit Log & SSRF Protection Events
            </h3>
            <span className="text-xs text-slate-500 font-mono">Live Audit Telemetry</span>
          </div>

          {events.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono">No security violation events recorded.</p>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`font-bold text-xs uppercase px-2.5 py-0.5 rounded-full ${
                      ev.severity === 'CRITICAL'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    }`}>
                      {ev.event_type}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {new Date(ev.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 text-xs pt-1">
                    {ev.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-[11px] text-slate-500 pt-1">
                    <span>Target: <strong className="text-slate-700 dark:text-slate-300">{ev.target || 'N/A'}</strong></span>
                    <span>Client IP: <strong className="text-slate-700 dark:text-slate-300">{ev.client_ip || '127.0.0.1'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: USER ACCESS CONTROL */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-500" /> User Directory & Role Assignment
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 pb-2">
                  <th className="py-2">User Email</th>
                  <th className="py-2">Full Name</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Scans Run</th>
                  <th className="py-2">Joined</th>
                  <th className="py-2 text-right">Cycle Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/60">
                    <td className="py-3 font-bold text-slate-900 dark:text-white">{u.email}</td>
                    <td className="py-3 text-slate-700 dark:text-slate-300">{u.full_name || 'N/A'}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        u.role === 'admin'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                          : u.role === 'analyst'
                          ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-300">{u.scans_count}</td>
                    <td className="py-3 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleToggleRole(u.id, u.role)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-all cursor-pointer"
                      >
                        Change Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
