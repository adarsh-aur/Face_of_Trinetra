import { useState, useMemo, useEffect, Suspense, lazy } from 'react';
import { Network, SlidersHorizontal, Download } from 'lucide-react';
import { type GraphFilterState } from '../types/graph';
import { mockGraphNodes } from '../lib/mock-data/graph-nodes';
import { mockGraphEdges } from '../lib/mock-data/graph-edges';
import { graphSnapshots } from '../lib/mock-data/graph-snapshots';

// Components
import { FilterPanel } from '../components/graph/filter-panel';
import { NodeDetailPanel } from '../components/graph/node-detail-panel';
import { EdgeDetailPanel } from '../components/graph/edge-detail-panel';
import { TemporalBar } from '../components/graph/temporal-bar';
import { GraphCanvasLoader } from '../components/graph/graph-canvas-loader';

// Lazy load Cytoscape canvas
const GraphCanvas = lazy(() => import('../components/graph/graph-canvas'));

const neo4jTypeMap: Record<string, string> = {
  User: 'user', VM: 'vm', IP: 'ip',
  CVE: 'cve', Role: 'role', Container: 'container',
};

const deriveProvider = (nodeId: string): 'aws' | 'azure' | 'gcp' => {
  if (nodeId.includes('_az') || nodeId.includes('az_')) return 'azure';
  if (nodeId.includes('gcp')) return 'gcp';
  return 'aws';
};

const adaptNode = (n: any, index: number) => ({
  id: n.node_id,
  type: neo4jTypeMap[n.node_type] ?? 'user',
  label: n.node_id.replace(/_/g, ' '),
  score: n.threat_score ?? 0,
  severity: n.severity ?? 'Low',
  provider: deriveProvider(n.node_id),
  highRisk: (n.threat_score ?? 0) >= 0.43,
  summary: n.summary ?? '',
  riskScore: n.risk_score ?? 0,
  exploitProb: n.exploit_prob ?? 0,
  x: (index % 8) * 120,
  y: Math.floor(index / 8) * 120,
  shap: { log: 0.18, cve: n.risk_score ? 0.22 : 0.05, risk: 0.12, exploit: 0.08, identity: 0.10 },
  mitre: [],
  attackPath: [],
});

const adaptEdge = (e: any, i: number) => ({
  id: `backend-edge-${i}`,
  type: (e.relation ?? 'connects_to').toLowerCase(),
  source: e.source,
  target: e.target,
  label: e.relation ?? '',
  weight: 1,
});

export function AttackGraph() {
  // State
  const [filters, setFilters] = useState<GraphFilterState>({
    search: '',
    nodeTypes: ['user', 'vm', 'container', 'ip', 'role', 'cve', 'cloudAccount'],
    edgeTypes: ['assumes_role', 'access', 'connects_to', 'exploits', 'has_vulnerability', 'deployed_on', 'belongs_to', 'cross_cloud_access', 'authenticates_as', 'routes_to'],
    providers: ['aws', 'azure', 'gcp'],
    scoreRange: [0.0, 1.0],
    temporalSnapshot: 't19',
    layout: 'cose',
    attackPathHighlight: false
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSubgraphMode, setIsSubgraphMode] = useState(false);
  const [backendNodes, setBackendNodes] = useState<any[] | null>(null);
  const [backendEdges, setBackendEdges] = useState<any[] | null>(null);
  const [dataSource, setDataSource] = useState<'neo4j-live' | 'seeded-fallback' | 'mock'>('mock');

  // Handle window resize for mobile state
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // When node changes, reset subgraph mode
  useEffect(() => {
    setIsSubgraphMode(false);
  }, [selectedNodeId]);

  useEffect(() => {
    const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
    const token = localStorage.getItem('trinetra_token');
    if (!token) return;

    fetch(`${BASE}/api/graph`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.nodes) && data.nodes.length > 0) {
          setBackendNodes(data.nodes.map(adaptNode));
          setBackendEdges((data.edges ?? []).map(adaptEdge));
          setDataSource(data.source ?? 'seeded-fallback');
        }
      })
      .catch(() => { /* keep mock data */ });
  }, []);

  // Derived Data (Filtering)
  // const { filteredNodes, filteredEdges } = useMemo(() => {
  //   // 1. Temporal filtering
  //   // Snapshots are cumulative. If t=8 is selected, we need nodes/edges from t0, t4, t8.
  //   const snapshotKeys = ['t0', 't4', 't8', 't14', 't19'];
  //   const selectedIndex = snapshotKeys.indexOf(filters.temporalSnapshot);
  //   const activeKeys = snapshotKeys.slice(0, selectedIndex + 1);

  //   let activeNodeIds = new Set<string>();
  //   let activeEdgeIds = new Set<string>();

  //   activeKeys.forEach(k => {
  //     const snap = graphSnapshots[k as keyof typeof graphSnapshots];
  //     snap.nodes.forEach(id => activeNodeIds.add(id));
  //     snap.edges.forEach(id => activeEdgeIds.add(id));
  //   });

  //   // 2. Apply other filters
  //   const nodes = mockGraphNodes.filter(n => {
  //     if (!activeNodeIds.has(n.id)) return false;
  //     if (!filters.nodeTypes.includes(n.type)) return false;
  //     if (!filters.providers.includes(n.provider)) return false;
  //     if (n.score < filters.scoreRange[0] || n.score > filters.scoreRange[1]) return false;
  //     // Search is handled visually in GraphCanvas (dimming), not by removing nodes
  //     return true;
  //   });

  //   const validNodeIds = new Set(nodes.map(n => n.id));

  //   const edges = mockGraphEdges.filter(e => {
  //     if (!activeEdgeIds.has(e.id)) return false;
  //     if (!filters.edgeTypes.includes(e.type)) return false;
  //     // Edge must connect two visible nodes
  //     if (!validNodeIds.has(e.source) || !validNodeIds.has(e.target)) return false;
  //     return true;
  //   });

  //   return { filteredNodes: nodes, filteredEdges: edges };
  // }, [filters]);

  const { filteredNodes, filteredEdges } = useMemo(() => {
    // ── Backend data path (Neo4j live or seeded) ──────────────────────────
    if (backendNodes && backendEdges) {
      const nodes = backendNodes.filter((n: any) => {
        if (!filters.nodeTypes.includes(n.type)) return false;
        if (!filters.providers.includes(n.provider)) return false;
        if (n.score < filters.scoreRange[0] || n.score > filters.scoreRange[1]) return false;
        if (filters.search && !n.label.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
      });
      const validIds = new Set(nodes.map((n: any) => n.id));
      const edges = backendEdges.filter((e: any) =>
        filters.edgeTypes.includes(e.type) &&
        validIds.has(e.source) &&
        validIds.has(e.target)
      );
      return { filteredNodes: nodes, filteredEdges: edges };
    }

    // ── Original mock data path (unchanged) ───────────────────────────────
    const snapshotKeys = ['t0', 't4', 't8', 't14', 't19'];
    const selectedIndex = snapshotKeys.indexOf(filters.temporalSnapshot);
    const activeKeys = snapshotKeys.slice(0, selectedIndex + 1);

    let activeNodeIds = new Set<string>();
    let activeEdgeIds = new Set<string>();
    activeKeys.forEach(k => {
      const snap = graphSnapshots[k as keyof typeof graphSnapshots];
      snap.nodes.forEach((id: string) => activeNodeIds.add(id));
      snap.edges.forEach((id: string) => activeEdgeIds.add(id));
    });

    const nodes = mockGraphNodes.filter((n: any) => {
      if (!activeNodeIds.has(n.id)) return false;
      if (!filters.nodeTypes.includes(n.type)) return false;
      if (!filters.providers.includes(n.provider)) return false;
      if (n.score < filters.scoreRange[0] || n.score > filters.scoreRange[1]) return false;
      return true;
    });

    const validNodeIds = new Set(nodes.map((n: any) => n.id));
    const edges = mockGraphEdges.filter((e: any) => {
      if (!activeEdgeIds.has(e.id)) return false;
      if (!filters.edgeTypes.includes(e.type)) return false;
      if (!validNodeIds.has(e.source) || !validNodeIds.has(e.target)) return false;
      return true;
    });

    return { filteredNodes: nodes, filteredEdges: edges };
  }, [filters, backendNodes, backendEdges]);

  // Selected item data
  const selectedNode = selectedNodeId ? mockGraphNodes.find(n => n.id === selectedNodeId) : null;
  const selectedEdge = selectedEdgeId ? mockGraphEdges.find(e => e.id === selectedEdgeId) : null;

  // Connected nodes for the detail panel
  const connectedNodes = useMemo(() => {
    if (!selectedNodeId) return [];
    const connected: { id: string; label: string; type: string; edgeType: string }[] = [];

    mockGraphEdges.forEach(e => {
      if (e.source === selectedNodeId) {
        const target = mockGraphNodes.find(n => n.id === e.target);
        if (target) connected.push({ id: target.id, label: target.label, type: target.type, edgeType: e.type });
      } else if (e.target === selectedNodeId) {
        const source = mockGraphNodes.find(n => n.id === e.source);
        if (source) connected.push({ id: source.id, label: source.label, type: source.type, edgeType: e.type });
      }
    });
    return connected;
  }, [selectedNodeId]);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] relative overflow-hidden">

      {/* Header Bar */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <Network className="w-6 h-6 text-indigo-500" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-none">Attack Graph</h1>
            <p className="text-sm text-slate-500 mt-1 hidden md:block">Interactive heterogeneous knowledge graph visualization</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Stats Pills */}
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300">
              <div className="w-2 h-2 rounded-full bg-blue-500" /> {filteredNodes.length} Nodes
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300">
              <div className="w-3 h-0.5 bg-green-500" /> {filteredEdges.length} Edges
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> {filteredNodes.filter(n => n.highRisk).length} Flagged
            </div>
            {/* Data source badge */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${dataSource === 'neo4j-live'
                ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400'
                : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'
              }`}>
              <div className={`w-2 h-2 rounded-full ${dataSource === 'neo4j-live' ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
              {dataSource === 'neo4j-live' ? 'Neo4j Live' : 'Demo Data'}
            </div>
          </div>

          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="md:hidden h-8 px-3 flex items-center text-xs font-medium rounded-md border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" /> Filters
          </button>

          <button className="h-8 px-3 flex items-center text-xs font-medium rounded-md hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export
          </button>

          {/* Fit to screen triggers via Cytoscape instance inside GraphCanvas, handled there via bottom-right controls */}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0 relative">

        {/* Left Filter Panel (Desktop) */}
        <div className="hidden md:block shrink-0 h-full">
          <FilterPanel filters={filters} setFilters={setFilters} isMobile={false} />
        </div>

        {/* Left Filter Panel (Mobile Overlay) */}
        {isMobileFiltersOpen && isMobile && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)} />
            <div className="relative w-72 h-full bg-white dark:bg-[#12121a] shadow-2xl animate-in slide-in-from-left">
              <FilterPanel filters={filters} setFilters={setFilters} isMobile={true} onCloseMobile={() => setIsMobileFiltersOpen(false)} />
            </div>
          </div>
        )}

        {/* Center Canvas */}
        <div className="flex-1 relative min-w-0 h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-50 via-slate-100 to-slate-200 dark:from-[#1a1a24] dark:via-[#12121a] dark:to-[#0a0a0f]">
          <Suspense fallback={<GraphCanvasLoader />}>
            <GraphCanvas
              nodes={filteredNodes}
              edges={filteredEdges}
              filters={filters}
              onNodeSelect={setSelectedNodeId}
              onEdgeSelect={setSelectedEdgeId}
              selectedNodeId={selectedNodeId}
              selectedEdgeId={selectedEdgeId}
              isSubgraphMode={isSubgraphMode}
            />
          </Suspense>

          {/* Right Detail Panel Overlay */}
          {selectedNode && (
            <NodeDetailPanel
              node={selectedNode}
              onClose={() => setSelectedNodeId(null)}
              onNodeClick={setSelectedNodeId}
              connectedNodes={connectedNodes}
              isSubgraphMode={isSubgraphMode}
              onToggleSubgraph={() => setIsSubgraphMode(!isSubgraphMode)}
            />
          )}

          {selectedEdge && (
            <EdgeDetailPanel
              edge={selectedEdge}
              sourceNode={mockGraphNodes.find(n => n.id === selectedEdge.source)}
              targetNode={mockGraphNodes.find(n => n.id === selectedEdge.target)}
              onClose={() => setSelectedEdgeId(null)}
              onNodeClick={setSelectedNodeId}
            />
          )}
        </div>
      </div>

      {/* Bottom Temporal Bar */}
      <TemporalBar filters={filters} setFilters={setFilters} isMobile={isMobile} />

    </div>
  );
}
