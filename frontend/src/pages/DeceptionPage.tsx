import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Flame,
  Plus,
  Trash2,
  Radio,
  KeyRound,
  FileCode,
  FileText,
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
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans pb-24 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Banner (RDS 2.0) */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold shadow-ruby-glow">
          <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
          <span>ACTIVE DECEPTION & INTRUDER HONEYTOKEN NETWORK</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Plant Traps & Catch <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500">Intruders Red-Handed</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Generate realistic canary tokens, decoy AWS credentials, and trigger URLs. If a malware stealer or unauthorized actor touches them, you receive instant forensic telemetry.
        </p>
      </div>

      {/* Generator Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />

        <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
          <Plus className="w-5 h-5 text-amber-400" />
          <span>Arm New Deception Tripwire</span>
        </h3>

        {/* Type Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          {[
            { id: 'web_canary', label: 'HTTP Web Canary', icon: Globe },
            { id: 'decoy_aws_key', label: 'Decoy AWS Key', icon: KeyRound },
            { id: 'fake_db_credential', label: 'Fake DB Password', icon: FileCode },
            { id: 'canary_document', label: 'Canary Doc Webhook', icon: FileText }
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTokenType(t.id as any)}
                className={`p-4 rounded-2xl border text-left space-y-2 transition-all cursor-pointer ${
                  tokenType === t.id
                    ? 'bg-[#141d2e] border-l-2 border-l-amber-500 border-y border-r border-white/10 text-amber-300 font-bold shadow-sutra-glow'
                    : 'bg-[#070b12] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 text-amber-400" />
                <span className="block">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form onSubmit={handleCreateToken} className="space-y-4 font-mono">
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Memo / Placement Location (e.g. 'Left in desktop downloads folder as AWS_creds.txt')..."
            className="w-full px-4 py-3.5 rounded-2xl bg-[#030508] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 shadow-inner"
          />

          <button
            type="submit"
            disabled={isCreating || !memo.trim()}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-sutra-glow disabled:opacity-50 transition-all cursor-pointer"
          >
            <Flame className="w-4 h-4" />
            <span>{isCreating ? 'ARMING CANARY...' : 'ARM & DEPLOY CANARY'}</span>
          </button>
        </form>

        {/* Newly Created Token Display */}
        {createdToken && (
          <div className="p-5 rounded-2xl bg-[#070b12] border border-amber-500/40 space-y-3 font-mono text-xs animate-in fade-in duration-200">
            <div className="flex justify-between items-center text-amber-400 font-bold">
              <span>Trap Successfully Armed! Copy Decoy Payload Below:</span>
              <button
                onClick={() => copyPayload(createdToken.payload, 'new')}
                className="hover:underline cursor-pointer"
              >
                {copiedId === 'new' ? 'Copied ✓' : 'Copy Payload'}
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#030508] border border-white/5 text-slate-200 overflow-x-auto text-[11px]">
              {createdToken.payload}
            </pre>
          </div>
        )}
      </div>

      {/* Active Traps Grid */}
      <div className="space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-400" />
            <span>Deployed Active Honeytokens ({tokens.length})</span>
          </h3>
          <button onClick={loadTokens} className="text-slate-400 hover:text-white cursor-pointer">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {tokens.length === 0 ? (
          <div className="p-8 text-center bg-[#0c121e] rounded-3xl border border-white/10 text-slate-400">
            No honeytokens active. Deploy a decoy trap above to catch unauthorized intruders.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tokens.map((tok) => (
              <div
                key={tok.id}
                className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 space-y-4 shadow-xl"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 block">{tok.token_type}</span>
                    <h4 className="text-white font-bold text-sm">{tok.memo}</h4>
                    <span className="text-[10px] text-slate-500">Created {new Date(tok.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {tok.hit_count > 0 ? (
                      <span className="px-2.5 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-500/50 font-bold animate-pulse">
                        TRIPWIRE TRIPPED ({tok.hit_count}x)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-[#070b12] text-slate-400 border border-white/5">
                        ARMED & WAITING
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteToken(tok.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#070b12] border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Decoy String / URL</span>
                    <button
                      onClick={() => copyPayload(tok.payload, tok.id)}
                      className="text-amber-400 hover:underline cursor-pointer"
                    >
                      {copiedId === tok.id ? 'Copied ✓' : 'Copy'}
                    </button>
                  </div>
                  <pre className="text-slate-300 text-[11px] overflow-x-auto truncate">
                    {tok.payload}
                  </pre>
                </div>

                {tok.token_type === 'web_canary' && (
                  <button
                    onClick={() => triggerTestPing(tok.payload)}
                    className="w-full py-2 rounded-xl bg-[#070b12] hover:bg-[#141d2e] border border-white/10 text-slate-300 hover:text-amber-400 text-xs font-bold cursor-pointer"
                  >
                    Simulate Attacker Click (Test Alarm)
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
