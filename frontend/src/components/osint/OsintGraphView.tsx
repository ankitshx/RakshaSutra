import React, { useState, useRef, useEffect } from 'react';
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Network
} from 'lucide-react';

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  category: string;
  color?: string;
  size?: number;
  url?: string;
  details?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface OsintGraphViewProps {
  graph: GraphData;
  targetLabel: string;
}

export const OsintGraphView: React.FC<OsintGraphViewProps> = ({ graph, targetLabel }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Initialize node positions in a radial layout around the center
  useEffect(() => {
    if (!graph.nodes || graph.nodes.length === 0) return;

    const width = 800;
    const height = 460;
    const centerX = width / 2;
    const centerY = height / 2;

    const initializedNodes = graph.nodes.map((node, idx) => {
      if (node.id === 'target_root' || idx === 0) {
        return { ...node, x: centerX, y: centerY };
      }
      const otherNodesCount = graph.nodes.length - 1;
      const angle = ((idx - 1) / otherNodesCount) * (2 * Math.PI);
      const radius = Math.min(240, 120 + otherNodesCount * 6);
      return {
        ...node,
        x: centerX + radius * Math.cos(angle) + (Math.random() * 20 - 10),
        y: centerY + radius * Math.sin(angle) + (Math.random() * 20 - 10)
      };
    });

    setNodes(initializedNodes);
    setSelectedNode(initializedNodes[0] || null);
  }, [graph]);

  // Handle Dragging Canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'graph-bg') {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    } else if (draggedNodeId) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;

      setNodes((prev) =>
        prev.map((n) => (n.id === draggedNodeId ? { ...n, x: mouseX, y: mouseY } : n))
      );
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setDraggedNodeId(null);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const categories = ['ALL', ...Array.from(new Set(graph.nodes.map((n) => n.category)))];

  const visibleNodes = filterCategory === 'ALL'
    ? nodes
    : nodes.filter((n) => n.id === 'target_root' || n.category === filterCategory);

  const nodeMap = new Map(visibleNodes.map((n) => [n.id, n]));

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-3xl bg-slate-950/95 border-2 border-cyan-500/40 shadow-2xl overflow-hidden font-sans select-none ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-2xl' : 'h-[540px]'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Floating Control Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-cyan-500/30 text-xs font-mono">
          <Network className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-cyan-300 font-bold uppercase">THREAT GRAPH:</span>
          <span className="text-slate-300">{targetLabel}</span>
          <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/30">
            {graph.nodes.length} Entities • {graph.edges.length} Links
          </span>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-800 text-[11px] font-mono">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-neon-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
            title="Zoom In"
            className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.2))}
            title="Zoom Out"
            className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            title="Reset Viewport"
            className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle Fullscreen"
            className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main SVG Graph Canvas */}
      <svg
        id="graph-bg"
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <defs>
          {/* Radial Glow Filters */}
          <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Render Edges */}
          {graph.edges.map((edge, idx) => {
            const src = nodeMap.get(edge.source);
            const tgt = nodeMap.get(edge.target);
            if (!src || !tgt || src.x === undefined || src.y === undefined || tgt.x === undefined || tgt.y === undefined) return null;

            return (
              <g key={`edge-${idx}`}>
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke="url(#edge-gradient)"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                  className="opacity-60"
                />
              </g>
            );
          })}

          {/* Render Nodes */}
          {visibleNodes.map((node) => {
            if (node.x === undefined || node.y === undefined) return null;
            const isSelected = selectedNode?.id === node.id;
            const isRoot = node.id === 'target_root';
            const radius = isRoot ? 24 : 16;
            const color = node.color || '#00f0ff';

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggedNodeId(node.id);
                  setSelectedNode(node);
                }}
              >
                {/* Outer Glow Halo */}
                {isSelected && (
                  <circle
                    r={radius + 8}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    className="animate-ping opacity-50"
                  />
                )}

                {/* Node Body Circle */}
                <circle
                  r={radius}
                  fill="#030712"
                  stroke={color}
                  strokeWidth={isSelected ? 3 : 2}
                  filter={isRoot ? 'url(#glow-cyan)' : undefined}
                  className="transition-all hover:scale-110"
                />

                {/* Inner Icon / Letter */}
                <text
                  textAnchor="middle"
                  dy=".3em"
                  fill="#ffffff"
                  fontSize={isRoot ? 11 : 9}
                  fontWeight="bold"
                  fontFamily="JetBrains Mono, monospace"
                  pointerEvents="none"
                >
                  {isRoot ? '🎯' : node.label.slice(0, 2).toUpperCase()}
                </text>

                {/* Node Label Text */}
                <text
                  y={radius + 14}
                  textAnchor="middle"
                  fill={isSelected ? '#00f0ff' : '#cbd5e1'}
                  fontSize={10}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  fontFamily="Plus Jakarta Sans, sans-serif"
                  className="pointer-events-none drop-shadow"
                >
                  {node.label.length > 20 ? `${node.label.slice(0, 18)}...` : node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Bottom Node Inspector HUD Panel */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-20 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 shadow-2xl space-y-2 font-mono text-xs animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedNode.color || '#00f0ff' }}
              />
              <span className="font-bold text-white tracking-wide">{selectedNode.label}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
              {selectedNode.category}
            </span>
          </div>

          <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
            {selectedNode.details || 'Discovered entity in target footprint network.'}
          </p>

          {selectedNode.url && (
            <div className="pt-1 flex items-center justify-between">
              <a
                href={selectedNode.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <span>Visit Verified Profile</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-[10px] text-slate-500">Live External Endpoint</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
