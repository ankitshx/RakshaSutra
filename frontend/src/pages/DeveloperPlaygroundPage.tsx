import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { APIKey } from '../types';
import {
  Code,
  Terminal,
  Play,
  KeyRound,
  Loader2,
  Zap
} from 'lucide-react';

export const DeveloperPlaygroundPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'playground' | 'keys' | 'webhooks' | 'docs'>('playground');
  const [selectedEndpoint, setSelectedEndpoint] = useState<'url_scan' | 'investigate' | 'osint' | 'darkweb'>('investigate');
  
  // Playground form
  const [requestUrl, setRequestUrl] = useState('https://suspicious-banking-verify.xyz/login.php');
  const [isExecuting, setIsExecuting] = useState(false);
  const [responseJson, setResponseJson] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  // API Keys & Webhooks state
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdRawKey, setCreatedRawKey] = useState<string | null>(null);
  const [isCreatingKey, setIsCreatingKey] = useState(false);

  useEffect(() => {
    loadKeysAndWebhooks();
  }, []);

  const loadKeysAndWebhooks = async () => {
    try {
      const kRes = await api.listApiKeys().catch(() => []);
      setKeys(kRes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecutePlayground = async () => {
    setIsExecuting(true);
    const t0 = performance.now();
    try {
      if (selectedEndpoint === 'investigate') {
        const res = await api.createInvestigation(requestUrl);
        setResponseJson(res);
        setResponseStatus(200);
      } else if (selectedEndpoint === 'url_scan') {
        const res = await api.scanUrl(requestUrl);
        setResponseJson(res);
        setResponseStatus(200);
      } else if (selectedEndpoint === 'osint') {
        const res = await api.osintScanDomain(requestUrl.replace(/https?:\/\//, '').split('/')[0]);
        setResponseJson(res);
        setResponseStatus(200);
      } else {
        const res = await api.checkDarkWebExposure({ query: requestUrl, query_type: 'email' });
        setResponseJson(res);
        setResponseStatus(200);
      }
    } catch (err: any) {
      setResponseJson({ error: err.message || 'API request failed' });
      setResponseStatus(err.status || 500);
    } finally {
      setLatencyMs(Math.round(performance.now() - t0));
      setIsExecuting(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setIsCreatingKey(true);
    try {
      const res = await api.createApiKey(newKeyName.trim());
      setCreatedRawKey(res.api_key);
      setNewKeyName('');
      loadKeysAndWebhooks();
    } catch (err: any) {
      alert(err.message || 'Failed to generate API token.');
    } finally {
      setIsCreatingKey(false);
    }
  };

  return (
    <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Header (RDS 2.0) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-sutra-glow shrink-0">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              DEVELOPER PLAYGROUND & LIVE API RUNNER
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Live HTTP request execution sandbox, webhook delivery simulation, and API token generation
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0c121e] border border-white/10 w-fit font-mono text-xs">
        {[
          { id: 'playground', label: 'HTTP Live Sandbox', icon: Play },
          { id: 'keys', label: 'API Keys Management', icon: KeyRound },
          { id: 'webhooks', label: 'Webhooks & Telemetry', icon: Zap }
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

      {/* Tab 1: Playground */}
      {activeTab === 'playground' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Request Configurator */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0c121e] border border-white/10 space-y-4 shadow-xl font-mono text-xs">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>Request Parameters</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Target Endpoint</label>
                <select
                  value={selectedEndpoint}
                  onChange={(e) => setSelectedEndpoint(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#030508] border border-white/10 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="investigate">POST /v1/investigate (Deep Recon)</option>
                  <option value="url_scan">POST /v1/scan/url (Heuristic Check)</option>
                  <option value="osint">POST /v1/osint/domain (OSINT Graph)</option>
                  <option value="darkweb">POST /v1/darkweb/check (k-Anonymity)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Payload Target</label>
                <input
                  type="text"
                  value={requestUrl}
                  onChange={(e) => setRequestUrl(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#030508] border border-white/10 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={handleExecutePlayground}
                disabled={isExecuting || !requestUrl.trim()}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black uppercase tracking-wider shadow-sutra-glow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all mt-4"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>EXECUTING CALL...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>SEND HTTP REQUEST</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Response Output */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0c121e] border border-white/10 space-y-4 shadow-xl font-mono text-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-slate-400 font-bold uppercase">JSON Response Body</span>
                {responseStatus && (
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">HTTP {responseStatus}</span>
                    <span className="text-slate-500">{latencyMs}ms</span>
                  </div>
                )}
              </div>

              <pre className="mt-3 p-4 rounded-2xl bg-[#030508] border border-white/5 text-amber-300 overflow-x-auto max-h-[400px] text-[11px]">
                {responseJson ? JSON.stringify(responseJson, null, 2) : '// Response payload will appear here after execution.'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Keys */}
      {activeTab === 'keys' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 space-y-6 shadow-xl font-mono text-xs">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active API Keys ({keys.length})</h3>
          </div>

          <form onSubmit={handleCreateKey} className="flex gap-3">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key Name (e.g. 'Production Scanner Bot')..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#030508] border border-white/10 text-white focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={isCreatingKey || !newKeyName.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black uppercase shadow-sutra-glow cursor-pointer disabled:opacity-50"
            >
              CREATE KEY
            </button>
          </form>

          {createdRawKey && (
            <div className="p-4 rounded-2xl bg-[#070b12] border border-amber-500/40 space-y-2">
              <span className="text-amber-400 font-bold">Copy Secret API Key (Shown only once):</span>
              <pre className="p-2 rounded bg-[#030508] text-white text-[11px] select-all">{createdRawKey}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
