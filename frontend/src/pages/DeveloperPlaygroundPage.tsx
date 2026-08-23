import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { APIKey, WebhookEndpoint, WebhookDelivery } from '../types';
import {
  Code,
  Terminal,
  Play,
  Copy,
  Check,
  Zap,
  KeyRound,
  Plus,
  CheckCircle2,
  Activity,
  Loader2
} from 'lucide-react';

export const DeveloperPlaygroundPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'playground' | 'keys' | 'webhooks' | 'docs'>('playground');
  const [selectedEndpoint, setSelectedEndpoint] = useState<'url_scan' | 'investigate' | 'osint' | 'darkweb'>('investigate');
  
  // Playground form
  const [requestUrl, setRequestUrl] = useState('https://suspicious-banking-verify.xyz/login.php');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [responseJson, setResponseJson] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // API Keys & Webhooks state
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdRawKey, setCreatedRawKey] = useState<string | null>(null);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [isAddingWebhook, setIsAddingWebhook] = useState(false);
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);

  useEffect(() => {
    loadKeysAndWebhooks();
  }, []);

  const loadKeysAndWebhooks = async () => {
    try {
      const [kRes, wRes, dRes] = await Promise.all([
        api.listApiKeys().catch(() => []),
        api.listWebhookEndpoints().catch(() => []),
        api.listWebhookDeliveries().catch(() => [])
      ]);
      setKeys(kRes || []);
      setWebhooks(wRes || []);
      setDeliveries(dRes || []);
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
        const res = await api.checkDarkWebExposure(requestUrl);
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
      alert(err.message || 'Failed to create API key');
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl.trim()) return;
    setIsAddingWebhook(true);
    try {
      await api.createWebhookEndpoint(newWebhookUrl.trim());
      setNewWebhookUrl('');
      loadKeysAndWebhooks();
    } catch (err: any) {
      alert(err.message || 'Failed to register webhook endpoint');
    } finally {
      setIsAddingWebhook(false);
    }
  };

  const handleTestWebhook = async (id: string) => {
    setTestingWebhookId(id);
    try {
      const res = await api.testWebhookPing(id);
      alert(`Webhook Ping Sent!\nStatus: HTTP ${res.status_code}\nSignature: ${res.signature}`);
      loadKeysAndWebhooks();
    } catch (err: any) {
      alert(err.message || 'Ping failed');
    } finally {
      setTestingWebhookId(null);
    }
  };

  const getCurlCode = () => {
    const authHeader = apiKeyInput ? `Authorization: Bearer ${apiKeyInput}` : `Authorization: Bearer rs_live_your_secret_key`;
    if (selectedEndpoint === 'investigate') {
      return `curl -X POST "https://api.rakshasutra.org/api/v1/investigations/create" \\\n  -H "Content-Type: application/json" \\\n  -H "${authHeader}" \\\n  -d '{"target": "${requestUrl}"}'`;
    }
    return `curl -X POST "https://api.rakshasutra.org/api/v1/scans/url" \\\n  -H "Content-Type: application/json" \\\n  -H "${authHeader}" \\\n  -d '{"url": "${requestUrl}"}'`;
  };

  const getPythonCode = () => {
    const token = apiKeyInput || "rs_live_your_secret_key";
    return `import requests\n\nurl = "https://api.rakshasutra.org/api/v1/investigations/create"\nheaders = {\n    "Authorization": "Bearer ${token}",\n    "Content-Type": "application/json"\n}\npayload = {"target": "${requestUrl}"}\n\nresponse = requests.post(url, json=payload, headers=headers)\nprint(response.json())`;
  };

  const handleCopySnippet = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                <Code className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-black text-white font-mono tracking-wider">
                DEVELOPER API & WEBHOOK GATEWAY
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Interactive request explorer, code snippet generators, hashed API keys, and HMAC webhooks
            </p>
          </div>

          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
            <button
              onClick={() => setActiveTab('playground')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'playground' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Playground
            </button>
            <button
              onClick={() => setActiveTab('keys')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'keys' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              API Keys ({keys.length})
            </button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'webhooks' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Webhooks ({webhooks.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* TAB 1: API Playground */}
        {activeTab === 'playground' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-mono">
            
            {/* Request Builder */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  Request Builder
                </h3>
                <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                  HTTP POST
                </span>
              </div>

              {/* Endpoint Selector */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400">Target Endpoint</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedEndpoint('investigate')}
                    className={`p-3 rounded-xl text-xs font-bold border text-left transition-colors ${
                      selectedEndpoint === 'investigate'
                        ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    /v1/investigations/create
                  </button>
                  <button
                    onClick={() => setSelectedEndpoint('url_scan')}
                    className={`p-3 rounded-xl text-xs font-bold border text-left transition-colors ${
                      selectedEndpoint === 'url_scan'
                        ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    /v1/scans/url
                  </button>
                </div>
              </div>

              {/* Target Parameter */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400">Target URL / Indicator</label>
                <input
                  type="text"
                  value={requestUrl}
                  onChange={(e) => setRequestUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* API Key (Optional) */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400">API Key Header (Optional)</label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="rs_live_... (uses session token if blank)"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                onClick={handleExecutePlayground}
                disabled={isExecuting || !requestUrl.trim()}
                className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
              >
                {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                <span>EXECUTE REQUEST</span>
              </button>

              {/* Code Snippets Accordion */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Generated Code Snippets</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopySnippet(getCurlCode(), 'curl')}
                      className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCode === 'curl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>cURL</span>
                    </button>
                    <button
                      onClick={() => handleCopySnippet(getPythonCode(), 'python')}
                      className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCode === 'python' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Python</span>
                    </button>
                  </div>
                </div>

                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto">
                  {getCurlCode()}
                </pre>
              </div>
            </div>

            {/* Response Viewer */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Live Response Viewer
                  </h3>
                  {responseStatus && (
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        responseStatus === 200 ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950 text-rose-300'
                      }`}>
                        HTTP {responseStatus}
                      </span>
                      {latencyMs && <span className="text-[10px] text-slate-400">{latencyMs}ms</span>}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 min-h-[420px] max-h-[500px] overflow-auto">
                  {responseJson ? (
                    <pre className="text-xs text-cyan-300 leading-relaxed">
                      {JSON.stringify(responseJson, null, 2)}
                    </pre>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-600 text-xs text-center">
                      Click "EXECUTE REQUEST" to send a live test payload and inspect the response.
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-500 flex justify-between">
                <span>Account Rate Limit: 10 req/min</span>
                <span>Production Endpoint: api.rakshasutra.org</span>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: API Keys */}
        {activeTab === 'keys' && (
          <div className="space-y-6 font-mono">
            {createdRawKey && (
              <div className="p-6 rounded-3xl bg-emerald-950/30 border border-emerald-500/50 space-y-3 shadow-2xl">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>API Key Created Successfully!</span>
                </div>
                <p className="text-xs text-slate-300">
                  Please copy and store your API secret key now. For your security, it will never be displayed again.
                </p>
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 flex justify-between items-center text-xs text-emerald-300">
                  <code className="break-all">{createdRawKey}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdRawKey);
                      alert('API key copied to clipboard!');
                    }}
                    className="p-2 bg-emerald-950 rounded-lg hover:bg-emerald-900 text-emerald-200 cursor-pointer ml-3 shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Create Key Box */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-cyan-400" />
                Generate New Cryptographic API Key
              </h3>
              <form onSubmit={handleCreateKey} className="flex gap-3">
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Key description (e.g. CI/CD Scanner, Staging Backend)"
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={isCreatingKey || !newKeyName.trim()}
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer disabled:opacity-50"
                >
                  {isCreatingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>GENERATE KEY</span>
                </button>
              </form>
            </div>

            {/* Keys Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {keys.map((k) => (
                <div key={k.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-white">{k.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      {k.status}
                    </span>
                  </div>
                  <p className="text-xs text-cyan-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    {k.key_prefix}...****************
                  </p>
                  <div className="text-[11px] text-slate-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Rate Limit:</span>
                      <span>{k.rate_limit_per_min} req/min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>{new Date(k.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Webhooks */}
        {activeTab === 'webhooks' && (
          <div className="space-y-6 font-mono">
            {/* Create Webhook */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                Register Outgoing Webhook Endpoint
              </h3>
              <form onSubmit={handleCreateWebhook} className="flex gap-3">
                <input
                  type="url"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  placeholder="https://your-server.com/api/rakshasutra-webhook"
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={isAddingWebhook || !newWebhookUrl.trim()}
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer disabled:opacity-50"
                >
                  {isAddingWebhook ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>ADD WEBHOOK</span>
                </button>
              </form>
            </div>

            {/* Webhooks List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {webhooks.map((wh) => (
                <div key={wh.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white truncate max-w-[280px]">{wh.url}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      HMAC SHA-256
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    Secret: {wh.secret_preview || 'whsec_••••••••••••'}
                  </p>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-500">
                      Events: {wh.subscribed_events.join(', ')}
                    </span>
                    <button
                      onClick={() => handleTestWebhook(wh.id)}
                      disabled={testingWebhookId === wh.id}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Play className="w-3 h-3" />
                      <span>{testingWebhookId === wh.id ? 'Sending...' : 'Test Ping'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Deliveries History */}
            {deliveries.length > 0 && (
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Recent Delivery Log
                </h4>
                <div className="space-y-2 text-xs">
                  {deliveries.slice(0, 10).map((d) => (
                    <div key={d.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.success ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                        }`}>
                          HTTP {d.status_code || 'Err'}
                        </span>
                        <span className="text-slate-300">{d.event_type}</span>
                      </div>
                      <span className="text-slate-500 text-[11px]">+{d.duration_ms}ms • {new Date(d.created_at).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
