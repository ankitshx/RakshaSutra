import React, { useState, useRef, useEffect } from 'react';
import {
  Network,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';

export interface MapNode {
  id: string;
  label: string;
  type: 'user' | 'device' | 'account' | 'domain' | 'website' | 'email' | 'threat';
  status: 'SAFE' | 'CAUTION' | 'DANGER';
  details: string;
  connectedTo: string[];
  x?: number;
  y?: number;
}

export const DigitalSecurityMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  const initialNodes: MapNode[] = [
    {
      id: 'node-user',
      label: 'Primary Identity (You)',
      type: 'user',
      status: 'SAFE',
      details: 'Composite security posture score 84/100. Zero active credential exposures.',
      connectedTo: ['node-device-1', 'node-device-2', 'node-acc-1', 'node-domain-1'],
      x: 400,
      y: 240
    },
    {
      id: 'node-device-1',
      label: 'MacBook Pro (Host)',
      type: 'device',
      status: 'SAFE',
      details: 'Disk encryption active, firewall enabled, browser extension hook verified.',
      connectedTo: ['node-user'],
      x: 220,
      y: 120
    },
    {
      id: 'node-device-2',
      label: 'Mobile Device (Pixel 8)',
      type: 'device',
      status: 'SAFE',
      details: 'Biometric unlock active, DNS-over-HTTPS configured via Cloudflare 1.1.1.1.',
      connectedTo: ['node-user'],
      x: 220,
      y: 360
    },
    {
      id: 'node-acc-1',
      label: 'corporate-admin@sharma.org',
      type: 'account',
      status: 'SAFE',
      details: 'FIDO2 Hardware key MFA enforced. Zero breach exposure in HIBP database.',
      connectedTo: ['node-user', 'node-email-1'],
      x: 580,
      y: 120
    },
    {
      id: 'node-domain-1',
      label: 'sharma1.org',
      type: 'domain',
      status: 'CAUTION',
      details: 'A+ TLS rating, DNSSEC valid. Notice: DMARC record set to p=none (recommend p=reject).',
      connectedTo: ['node-user', 'node-web-1'],
      x: 580,
      y: 360
    },
    {
      id: 'node-email-1',
      label: 'Google Workspace Tenant',
      type: 'email',
      status: 'SAFE',
      details: 'SPF include:_spf.google.com validated with 2048-bit DKIM signature.',
      connectedTo: ['node-acc-1'],
      x: 740,
      y: 80
    },
    {
      id: 'node-web-1',
      label: 'Production Web Gateway',
      type: 'website',
      status: 'SAFE',
      details: 'HSTS preload active, Cloudflare WAF active, TLS 1.3 enforced.',
      connectedTo: ['node-domain-1'],
      x: 740,
      y: 320
    },
    {
      id: 'node-threat-1',
      label: 'Detected Phish: sbi-kyc.top',
      type: 'threat',
      status: 'DANGER',
      details: 'Typosquatting banking lure blocked by pre-navigation browser extension shield.',
      connectedTo: ['node-device-1'],
      x: 80,
      y: 200
    }
  ];

  const [nodes] = useState<MapNode[]>(initialNodes);

  useEffect(() => {
    setSelectedNode(initialNodes[0]);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'security-map-svg') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getNodeColor = (node: MapNode) => {
    if (node.status === 'DANGER') return '#f43f5e';
    if (node.status === 'CAUTION') return '#f59e0b';
    return '#3b82f6';
  };

  const visibleNodes = filterType === 'ALL'
    ? nodes
    : nodes.filter(n => n.type === filterType || n.type === 'user');

  const nodeMap = new Map(visibleNodes.map(n => [n.id, n]));

  return (
    <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Header (RDS 2.0) */}
      <div className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sutra-glow shrink-0">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white font-mono tracking-wider">
              INTERACTIVE DIGITAL DEFENSE TOPOLOGY
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Visual relationship graph connecting User Identity ➔ Devices ➔ Accounts ➔ Domains ➔ Threats
            </p>
          </div>
        </div>

        {/* Filter Types */}
        <div className="flex items-center gap-1.5 bg-[#030508] p-1 rounded-2xl border border-white/10 text-[11px] font-mono">
          {['ALL', 'device', 'account', 'domain', 'threat'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer uppercase font-bold ${
                filterType === type
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sutra-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        ref={containerRef}
        className="relative w-full h-[580px] rounded-3xl bg-[#030508] border-2 border-white/10 shadow-2xl overflow-hidden select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Controls Toolbar */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[#0c121e]/90 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 text-xs font-mono">
          <button
            onClick={() => setZoom(z => Math.min(2.5, z + 0.2))}
            className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-[#141d2e] cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.4, z - 0.2))}
            className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-[#141d2e] cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-[#141d2e] cursor-pointer"
            title="Reset Map View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <span className="px-2 text-slate-400 text-[10px]">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* SVG Canvas */}
        <svg
          id="security-map-svg"
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Edge lines */}
            {visibleNodes.map(node =>
              node.connectedTo.map(targetId => {
                const targetNode = nodeMap.get(targetId);
                if (!targetNode || !node.x || !node.y || !targetNode.x || !targetNode.y) return null;
                const isThreatEdge = node.status === 'DANGER' || targetNode.status === 'DANGER';

                return (
                  <line
                    key={`${node.id}-${targetId}`}
                    x1={node.x}
                    y1={node.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={isThreatEdge ? 'rgba(244, 63, 94, 0.4)' : 'rgba(245, 158, 11, 0.2)'}
                    strokeWidth={isThreatEdge ? 2 : 1.5}
                    strokeDasharray={isThreatEdge ? '4 4' : undefined}
                  />
                );
              })
            )}

            {/* Nodes */}
            {visibleNodes.map(node => {
              if (!node.x || !node.y) return null;
              const isSelected = selectedNode?.id === node.id;
              const color = getNodeColor(node);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  <circle
                    r={isSelected ? 22 : 16}
                    fill="#0c121e"
                    stroke={isSelected ? '#f59e0b' : color}
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-all duration-200"
                  />
                  <circle
                    r={isSelected ? 8 : 5}
                    fill={color}
                  />
                  <text
                    y={32}
                    textAnchor="middle"
                    fill={isSelected ? '#fbbf24' : '#e2e8f0'}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Selected Node Drawer */}
        {selectedNode && (
          <div className="absolute bottom-4 right-4 z-20 w-80 p-5 rounded-2xl bg-[#0c121e]/95 border border-white/10 backdrop-blur-xl shadow-2xl space-y-2 font-mono text-xs">
            <div className="flex justify-between items-start">
              <h4 className="text-white font-bold">{selectedNode.label}</h4>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                selectedNode.status === 'DANGER' ? 'bg-rose-950 text-rose-300' :
                selectedNode.status === 'CAUTION' ? 'bg-amber-950 text-amber-300' :
                'bg-emerald-950 text-emerald-300'
              }`}>
                {selectedNode.status}
              </span>
            </div>
            <p className="text-slate-300 font-sans text-[11px] leading-relaxed">{selectedNode.details}</p>
          </div>
        )}
      </div>
    </div>
  );
};
