import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Flame,
  ShieldAlert,
  Copy,
  Plus,
  Trash2,
  Radio,
  KeyRound,
  FileCode,
  FileText,
  AlertTriangle,
  RefreshCw,
  Globe
} from 'lucide-react';

export const DeceptionPage: React.FC = () => {
  const [tokens, setTokens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [tokenType, setTokenType] = useState<'web_canary' | 'decoy_aws_key' | 'fake_db_credential' | 'canary_document'>('web_canary');
  const [memo, setMemo] = useState('');
  const [createdToken, setCreatedToken] = useState<any | null>(null);

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    setIsLoading(true);
    try {
      const res = await api.getHoneytokens();
      setTokens(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memo.trim()) return;

    setIsCreating(true);
    try {
      const res = await api.createHoneytoken({
        token_type: tokenType,
        memo: memo.trim()
      });
      setCreatedToken(res);
      setMemo('');
      loadTokens();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteToken = async (tokenId: string) => {
    if (!confirm('Are you sure you want to disarm and delete this canary trap?')) return;
    try {
      await api.deleteHoneytoken(tokenId);
      setTokens((prev) => prev.filter((t) => t.id !== tokenId));
      if (createdToken?.id === tokenId) setCreatedToken(null);
    } catch (err) {
      console.error(err);
    }
  };

  const copyPayload = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const triggerTestPing = (url: string) => {
    fetch(url, { mode: 'no-cors' }).then(() => {
      setTimeout(() => {
        loadTokens();
      }, 500);
    });
  };

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
          <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>ACTIVE DECEPTION & INTRUDER HONEYTOKEN NETWORK</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Plant Traps & Catch <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500">Hackers Red-Handed</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Deploy decoy credentials, canary tracking URLs, and poisoned file tokens. If a scammer or intruder steals or accesses them, RakshaSutra instantly logs their IP, browser fingerprint, and location.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Create New Canary Trap */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-mono">
              <Plus className="w-5 h-5 text-amber-500" />
              <span>Deploy New Canary Tripwire</span>
            </h2>
            <p className="text-xs text-slate-500">Choose a trap type and location to monitor.</p>
          </div>

          <form onSubmit={handleCreateToken} className="space-y-4">
            {/* Trap Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                Trap Archetype:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'web_canary', label: 'Web Canary URL', icon: Globe, desc: 'Tracking Link' },
                  { id: 'decoy_aws_key', label: 'Decoy AWS Keys', icon: KeyRound, desc: '.env / Configs' },
                  { id: 'fake_db_credential', label: 'Fake DB String', icon: FileCode, desc: 'Repo Trap' },
                  { id: 'canary_document', label: 'Canary PDF Doc', icon: FileText, desc: 'Desktop Trap' }
                ].map((t) => {
                  const Icon = t.icon;
                  const isSelected = tokenType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTokenType(t.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-md font-bold'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-xs font-bold">{t.label}</span>
                      <span className="text-[10px] opacity-75">{t.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Memo Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                Trap Memo / Deployment Location:
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="e.g. In /root/.env or Fake Staff Payroll Folder"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isCreating || !memo.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isCreating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
              <span>{isCreating ? 'Arming Trap...' : 'Arm Canary Trap Now'}</span>
            </button>
          </form>

          {/* Newly Created Trap Info Box */}
          {createdToken && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 space-y-3 font-mono text-xs animate-in fade-in">
              <div className="flex items-center justify-between text-amber-300 font-bold border-b border-amber-500/30 pb-2">
                <span>✓ Trap Armed: {createdToken.token_type}</span>
                <span className="text-[10px] text-slate-400">{createdToken.id}</span>
              </div>

              <div className="space-y-2">
                <span className="text-slate-400 block text-[11px]">Decoy Artifact Payload:</span>
                <pre className="p-2.5 rounded-xl bg-slate-950 text-amber-400 overflow-x-auto text-[11px] select-all border border-slate-800">
                  {JSON.stringify(createdToken.decoy_payload, null, 2)}
                </pre>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => copyPayload(JSON.stringify(createdToken.decoy_payload, null, 2), createdToken.id)}
                  className="flex-1 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors flex items-center justify-center gap-1 text-[11px] cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedId === createdToken.id ? 'Copied!' : 'Copy Decoy Code'}</span>
                </button>
                <button
                  onClick={() => triggerTestPing(createdToken.canary_url)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-bold transition-colors cursor-pointer"
                  title="Simulate an attacker tripping this trap"
                >
                  ⚡ Test Tripwire
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Active Traps & Intrusion Alarm Stream */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-mono flex items-center gap-2">
              <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
              <span>Active Canary Traps & Intruder Alarms ({tokens.length})</span>
            </h2>
            <button
              onClick={loadTokens}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-white cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {tokens.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-500 space-y-2">
              <ShieldAlert className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs font-mono">No active honeytoken traps deployed yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className={`p-5 rounded-3xl border-2 transition-all space-y-4 ${
                    token.is_tripped
                      ? 'bg-rose-950/20 border-rose-500/60 shadow-lg'
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          token.is_tripped
                            ? 'bg-rose-950 text-rose-300 border border-rose-500 animate-pulse'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                        }`}>
                          {token.is_tripped ? `🚨 TRIPPED (${token.trip_count}x)` : '🟢 ARMED & WAITING'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{token.token_type}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono">{token.memo}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => triggerTestPing(token.canary_url)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-[11px] font-mono border border-slate-800 transition-colors cursor-pointer"
                        title="Simulate attacker clicking/accessing this trap"
                      >
                        ⚡ Test Ping
                      </button>
                      <button
                        onClick={() => handleDeleteToken(token.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Disarm and delete trap"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Intrusion Log Cards if Tripped */}
                  {token.intrusions && token.intrusions.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-mono font-bold text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Recent Intrusion Captures:
                      </span>

                      {token.intrusions.map((alert: any) => (
                        <div
                          key={alert.id}
                          className="p-3 rounded-2xl bg-slate-950 border border-rose-500/40 space-y-1.5 font-mono text-xs"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-rose-400 font-bold">IP: {alert.intruder_ip}</span>
                            <span className="text-slate-500">{alert.triggered_at}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 font-sans">
                            📍 Location: <strong className="text-amber-400">{alert.geo_location}</strong>
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            🖥️ User-Agent: {alert.intruder_user_agent}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                    <span>Token ID: {token.id}</span>
                    <span>Armed On: {token.created_at}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
