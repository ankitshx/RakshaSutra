import React, { useState, useEffect } from 'react';
import {
  Globe,
  Plus,
  Search,
  Sparkles,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  asset_type: string;
  environment: string;
  criticality: string;
  ip_address?: string;
  asn?: string;
  hosting_provider?: string;
  location_country?: string;
  risk_score: number;
  risk_level: string;
  is_monitored: boolean;
  technologies: string[];
  open_ports: number[];
  tags: string[];
  first_seen_at?: string;
  last_seen_at?: string;
  vulnerabilities_count: number;
  alerts_count: number;
}

export const AttackSurfacePage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [critFilter, setCritFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDiscoverModalOpen, setIsDiscoverModalOpen] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Form states
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetType, setNewAssetType] = useState('domain');
  const [newEnvironment, setNewEnvironment] = useState('production');
  const [newCriticality, setNewCriticality] = useState('HIGH');
  const [newTechnologies, setNewTechnologies] = useState('');
  const [seedDomain, setSeedDomain] = useState('');
  const [discovering, setDiscovering] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<any>(null);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/assets');
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      }
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const res = await fetch('/api/v1/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: newAssetName,
          asset_type: newAssetType,
          environment: newEnvironment,
          criticality: newCriticality,
          technologies: newTechnologies.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewAssetName('');
        fetchAssets();
      }
    } catch (err) {
      console.error('Create asset failed:', err);
    }
  };

  const handleDiscover = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setDiscovering(true);
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const res = await fetch('/api/v1/assets/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ seed_domain: seedDomain })
      });
      if (res.ok) {
        const data = await res.json();
        setDiscoveryResult(data);
        fetchAssets();
      }
    } catch (err) {
      console.error('Discovery failed:', err);
    } finally {
      setDiscovering(false);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!confirm('Are you sure you want to remove this asset from inventory?')) return;
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      await fetch(`/api/v1/assets/${id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      fetchAssets();
      if (selectedAsset?.id === id) setSelectedAsset(null);
    } catch (err) {
      console.error('Delete asset error:', err);
    }
  };

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || (a.ip_address && a.ip_address.includes(search));
    const matchesType = typeFilter === 'all' || a.asset_type === typeFilter;
    const matchesCrit = critFilter === 'all' || a.criticality === critFilter;
    return matchesSearch && matchesType && matchesCrit;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0c121e] border border-white/10 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Globe className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
              Attack Surface Management (ASM)
            </h1>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400 font-sans max-w-2xl">
            Inventory, track, and monitor all authorized digital assets, certificates, subdomains, and exposed interfaces with continuous risk scoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { setIsDiscoverModalOpen(true); setDiscoveryResult(null); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 font-mono text-xs font-bold transition-all cursor-pointer shadow-inner"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Passive Discovery</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono text-xs font-black transition-all cursor-pointer shadow-sutra-glow"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0c121e] border border-white/10">
          <span className="text-[11px] font-mono text-slate-400">TOTAL ASSETS</span>
          <p className="text-2xl font-mono font-bold text-white mt-1">{assets.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#0c121e] border border-white/10">
          <span className="text-[11px] font-mono text-rose-400">CRITICAL ASSETS</span>
          <p className="text-2xl font-mono font-bold text-rose-300 mt-1">
            {assets.filter(a => a.criticality === 'CRITICAL').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#0c121e] border border-white/10">
          <span className="text-[11px] font-mono text-amber-400">ACTIVE ALERTS</span>
          <p className="text-2xl font-mono font-bold text-amber-300 mt-1">
            {assets.reduce((sum, a) => sum + (a.alerts_count || 0), 0)}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#0c121e] border border-white/10">
          <span className="text-[11px] font-mono text-emerald-400">CONTINUOUSLY MONITORED</span>
          <p className="text-2xl font-mono font-bold text-emerald-300 mt-1">
            {assets.filter(a => a.is_monitored).length}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-xl bg-[#0c121e] border border-white/10">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search domain, IP address, tag..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#030508] border border-white/10 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            <option value="all">All Asset Types</option>
            <option value="domain">Domains</option>
            <option value="subdomain">Subdomains</option>
            <option value="api_endpoint">API Endpoints</option>
            <option value="ip_address">IP Addresses</option>
          </select>

          <select
            value={critFilter}
            onChange={(e) => setCritFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            <option value="all">All Criticalities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <button
            onClick={fetchAssets}
            className="p-2 rounded-xl bg-[#030508] border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Asset Inventory Table */}
      <div className="overflow-hidden rounded-2xl bg-[#0c121e] border border-white/10 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#030508]/80 text-slate-400 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">ASSET NAME</th>
                <th className="py-3 px-4">TYPE</th>
                <th className="py-3 px-4">CRITICALITY</th>
                <th className="py-3 px-4">ENV</th>
                <th className="py-3 px-4">IP / LOCATION</th>
                <th className="py-3 px-4">RISK</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-mono">
                    No matching assets found in attack surface inventory.
                  </td>
                </tr>
              ) : (
                filteredAssets.map(asset => (
                  <tr key={asset.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <span>{asset.name}</span>
                      {asset.is_monitored && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Monitored" />
                      )}
                    </td>
                    <td className="py-3.5 px-4 uppercase text-[11px] text-slate-400">
                      {asset.asset_type}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        asset.criticality === 'CRITICAL' ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40' :
                        asset.criticality === 'HIGH' ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40' :
                        'bg-slate-800 text-slate-300 border border-white/10'
                      }`}>
                        {asset.criticality}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 uppercase text-[11px] text-slate-400">
                      {asset.environment}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {asset.ip_address || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-bold ${
                        asset.risk_score >= 60 ? 'text-rose-400' :
                        asset.risk_score >= 30 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {asset.risk_score} / 100
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedAsset(asset)}
                          className="px-2.5 py-1 rounded bg-[#030508] border border-white/10 hover:border-amber-500/50 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="p-1 rounded bg-[#030508] border border-white/10 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Inspection Drawer */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end">
          <div className="w-full max-w-lg bg-[#0c121e] border-l border-white/10 h-full p-6 overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">ASSET INSPECTION</span>
                <h3 className="text-lg font-bold font-mono text-white mt-0.5">{selectedAsset.name}</h3>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="px-3 py-1 rounded-lg bg-[#030508] border border-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#030508] border border-white/10">
                <div>
                  <span className="text-slate-500">Asset Type</span>
                  <p className="text-white font-bold uppercase">{selectedAsset.asset_type}</p>
                </div>
                <div>
                  <span className="text-slate-500">Criticality</span>
                  <p className="text-amber-400 font-bold">{selectedAsset.criticality}</p>
                </div>
                <div>
                  <span className="text-slate-500">Environment</span>
                  <p className="text-white font-bold uppercase">{selectedAsset.environment}</p>
                </div>
                <div>
                  <span className="text-slate-500">Risk Score</span>
                  <p className="text-rose-400 font-bold">{selectedAsset.risk_score} / 100</p>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-2">DETECTED TECHNOLOGIES</span>
                <div className="flex flex-wrap gap-2">
                  {selectedAsset.technologies && selectedAsset.technologies.length > 0 ? (
                    selectedAsset.technologies.map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#030508] border border-white/10 text-slate-300 text-[11px]">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500">No technology fingerprints detected.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0c121e] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold font-mono text-white">Register Digital Asset</h3>
            <form onSubmit={handleCreateAsset} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Asset Target / Identifier *</label>
                <input
                  type="text"
                  required
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  placeholder="e.g. app.rakshasutra.org"
                  className="w-full px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Asset Type</label>
                  <select
                    value={newAssetType}
                    onChange={(e) => setNewAssetType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="domain">Domain</option>
                    <option value="subdomain">Subdomain</option>
                    <option value="api_endpoint">API Endpoint</option>
                    <option value="ip_address">IP Address</option>
                    <option value="cloud_resource">Cloud Resource</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Criticality</label>
                  <select
                    value={newCriticality}
                    onChange={(e) => setNewCriticality(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Environment</label>
                <select
                  value={newEnvironment}
                  onChange={(e) => setNewEnvironment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Technologies (Comma-separated)</label>
                <input
                  type="text"
                  value={newTechnologies}
                  onChange={(e) => setNewTechnologies(e.target.value)}
                  placeholder="e.g. Nginx, React 19, Cloudflare"
                  className="w-full px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#030508] border border-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Passive Discovery Modal */}
      {isDiscoverModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0c121e] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold font-mono text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Passive Attack Surface Discovery</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Enter an apex domain to query public Certificate Transparency (CT) logs and passive DNS records.
            </p>
            <form onSubmit={handleDiscover} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Apex Domain *</label>
                <input
                  type="text"
                  required
                  value={seedDomain}
                  onChange={(e) => setSeedDomain(e.target.value)}
                  placeholder="e.g. rakshasutra.org"
                  className="w-full px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {discoveryResult && (
                <div className="p-3 rounded-xl bg-[#030508] border border-emerald-500/30 text-emerald-300 text-xs">
                  ✓ Discovered {discoveryResult.discovered_total} endpoint(s), added {discoveryResult.newly_added_to_inventory} to inventory.
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDiscoverModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#030508] border border-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={discovering}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer disabled:opacity-50"
                >
                  {discovering ? 'Discovering...' : 'Start Discovery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
