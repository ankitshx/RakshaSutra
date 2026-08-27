import React, { useState, useEffect } from 'react';
import {
  Network,
  Search,
  ZoomIn,
  ZoomOut,
  Info,
  Globe,
  RefreshCw
} from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: string;
  criticality: string;
  risk_score: number;
  risk_level: string;
  environment: string;
  ip?: string;
  tech: string[];
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  confidence: number;
  evidence?: string;
}

export const SecurityAssetGraphPage: React.FC = () => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [search, setSearch] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/assets/graph');
      if (res.ok) {
        const data = await res.json();
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
      }
    } catch (err) {
      console.error('Failed to load asset graph:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  const filteredNodes = nodes.filter(n =>
    n.label.toLowerCase().includes(search.toLowerCase()) ||
    (n.ip && n.ip.includes(search))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0c121e] border border-white/10 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Network className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
              Security Asset Graph 2.0
            </h1>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400 font-sans max-w-2xl">
            Interactive topology mapping relationships across domain hierarchy, IP resolutions, SSL certificates, exposed APIs, and vulnerabilities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchGraphData}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-slate-300 hover:text-white font-mono text-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Topology</span>
          </button>
        </div>
      </div>

      {/* Graph Visual Canvas Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Canvas & Controls */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0c121e] border border-white/10 p-6 flex flex-col justify-between min-h-[500px] relative overflow-hidden shadow-2xl">
          
          {/* Top Bar Controls */}
          <div className="flex items-center justify-between z-10">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search node or IP..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#030508] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 1.5))}
                className="p-2 rounded-lg bg-[#030508] border border-white/10 text-slate-400 hover:text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.6))}
                className="p-2 rounded-lg bg-[#030508] border border-white/10 text-slate-400 hover:text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Node Grid Visualization */}
          <div
            className="flex-1 my-6 flex flex-wrap items-center justify-center gap-6 p-4 transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {filteredNodes.length === 0 ? (
              <div className="text-center text-slate-500 font-mono text-xs">
                No asset topology nodes available.
              </div>
            ) : (
              filteredNodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 shadow-lg flex flex-col items-center gap-2 w-48 text-center ${
                    selectedNode?.id === node.id
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-cyan-500/20 scale-105'
                      : 'bg-[#030508] border-white/10 hover:border-white/30 hover:scale-102'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${
                    node.type === 'domain' ? 'bg-amber-500/10 text-amber-400' :
                    node.type === 'subdomain' ? 'bg-cyan-500/10 text-cyan-400' :
                    'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    <Globe className="w-5 h-5" />
                  </div>

                  <span className="text-xs font-mono font-bold text-white truncate max-w-[150px]">
                    {node.label}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      node.risk_score >= 60 ? 'bg-rose-950 text-rose-300' :
                      node.risk_score >= 30 ? 'bg-amber-950 text-amber-300' : 'bg-emerald-950 text-emerald-300'
                    }`}>
                      Risk: {node.risk_score}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      {node.type}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Graph Legend */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-white/5 pt-3">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Apex Domain
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Subdomain
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> API / Endpoint
              </span>
            </div>
            <span>{nodes.length} Nodes • {edges.length} Relationships</span>
          </div>
        </div>

        {/* Side-Sheet Node Inspector */}
        <div className="rounded-2xl bg-[#0c121e] border border-white/10 p-6 space-y-4 shadow-2xl">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Info className="w-4 h-4" />
            <span>Node Inspector</span>
          </div>

          {selectedNode ? (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-[#030508] border border-white/10 space-y-2">
                <span className="text-slate-500 text-[10px]">SELECTED ENTITY</span>
                <h4 className="text-base font-bold text-white break-all">{selectedNode.label}</h4>
                <p className="text-slate-400 uppercase text-[11px]">{selectedNode.type} • {selectedNode.environment}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#030508] border border-white/10">
                  <span className="text-slate-500 text-[10px]">CRITICALITY</span>
                  <p className="font-bold text-amber-400 mt-0.5">{selectedNode.criticality}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#030508] border border-white/10">
                  <span className="text-slate-500 text-[10px]">RISK SCORE</span>
                  <p className={`font-bold mt-0.5 ${
                    selectedNode.risk_score >= 60 ? 'text-rose-400' :
                    selectedNode.risk_score >= 30 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {selectedNode.risk_score} / 100
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#030508] border border-white/10">
                <span className="text-slate-500 text-[10px]">RESOLVED IP</span>
                <p className="text-slate-200 font-bold mt-0.5">{selectedNode.ip || 'Unresolved'}</p>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-2">TECHNOLOGIES</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.tech && selectedNode.tech.length > 0 ? (
                    selectedNode.tech.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-[#030508] border border-white/10 text-slate-300 text-[11px]">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500">None detected</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-500 font-mono text-xs">
              Click on any node in the topology graph to inspect its properties and threat linkages.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
