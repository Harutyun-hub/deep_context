import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { DotMatrixBackground } from './components/DotMatrixBackground';
import { AIQueryBar } from './components/AIQueryBar';
import { GlobalFilters } from './components/GlobalFilters';
import { NodeInspector } from './components/NodeInspector';
import { FloatingControls } from './components/FloatingControls';
import { GraphLegend } from './components/GraphLegend';

const NODE_COLORS = {
  Brand: '#3b82f6',
  Topic: '#a855f7',
  default: '#64748b'
};

const getNodeColor = (nodeType) => NODE_COLORS[nodeType] || NODE_COLORS.default;

function App() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState(null);
  const graphRef = useRef();

  const [filters, setFilters] = useState({
    selectedTimeframe: 'Last 7 Days',
    selectedBrands: [],
    selectedSentiments: [],
    selectedTactics: [],
    selectedTopics: [],
    connectionThreshold: 0
  });

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch('/api/graph');
        if (!response.ok) {
          throw new Error('Failed to fetch graph data');
        }
        const data = await response.json();
        
        const nodeNeighbors = {};
        const nodeLinks = {};
        
        data.nodes.forEach(node => {
          nodeNeighbors[node.id] = new Set();
          nodeLinks[node.id] = new Set();
        });
        
        data.links.forEach(link => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          
          if (nodeNeighbors[sourceId]) nodeNeighbors[sourceId].add(targetId);
          if (nodeNeighbors[targetId]) nodeNeighbors[targetId].add(sourceId);
          if (nodeLinks[sourceId]) nodeLinks[sourceId].add(link);
          if (nodeLinks[targetId]) nodeLinks[targetId].add(link);
        });
        
        data.nodes.forEach(node => {
          node.neighbors = nodeNeighbors[node.id] || new Set();
          node.links = nodeLinks[node.id] || new Set();
        });
        
        setGraphData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchGraphData();
  }, []);

  useEffect(() => {
    if (graphRef.current && graphData.nodes.length > 0) {
      const fg = graphRef.current;
      fg.d3Force('charge').strength(-300);
      fg.d3Force('link').distance(100);
      fg.d3ReheatSimulation();
    }
  }, [graphData]);

  const brands = useMemo(() => {
    return graphData.nodes
      .filter(n => n.group === 'Brand')
      .map(n => ({ name: n.label || n.name || n.id, count: n.neighbors?.size || 0 }));
  }, [graphData.nodes]);

  const topics = useMemo(() => {
    return graphData.nodes
      .filter(n => n.group === 'Topic')
      .map(n => n.label || n.name || n.id);
  }, [graphData.nodes]);

  const maxLinkWeight = useMemo(() => {
    if (graphData.links.length === 0) return 1;
    return Math.max(...graphData.links.map(l => l.value || l.weight || 1));
  }, [graphData.links]);

  const filteredGraphData = useMemo(() => {
    if (!graphData.nodes.length) return { nodes: [], links: [] };

    const threshold = (filters.connectionThreshold / 100) * maxLinkWeight;
    
    let filteredLinks = graphData.links.filter(link => {
      const weight = link.value || link.weight || 1;
      return weight >= threshold;
    });

    let filteredNodes = [...graphData.nodes];
    
    if (filters.selectedBrands.length > 0) {
      const selectedBrandIds = new Set(
        graphData.nodes
          .filter(n => n.group === 'Brand' && filters.selectedBrands.includes(n.label || n.name))
          .map(n => n.id)
      );
      
      filteredLinks = filteredLinks.filter(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        return selectedBrandIds.has(sourceId) || selectedBrandIds.has(targetId);
      });
      
      filteredNodes = filteredNodes.filter(node => {
        if (node.group === 'Brand') {
          return selectedBrandIds.has(node.id);
        }
        return true;
      });
    }

    if (filters.selectedTopics.length > 0) {
      const selectedTopicIds = new Set(
        graphData.nodes
          .filter(n => n.group === 'Topic' && filters.selectedTopics.includes(n.label || n.name))
          .map(n => n.id)
      );
      
      filteredLinks = filteredLinks.filter(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        return selectedTopicIds.has(sourceId) || selectedTopicIds.has(targetId);
      });
      
      const connectedToTopics = new Set();
      filteredLinks.forEach(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        connectedToTopics.add(sourceId);
        connectedToTopics.add(targetId);
      });
      
      filteredNodes = filteredNodes.filter(node => connectedToTopics.has(node.id));
    }

    if (filters.selectedSentiments.length > 0) {
      const nodesToKeep = new Set();
      
      filteredNodes.forEach(node => {
        if (node.sentiment && filters.selectedSentiments.includes(node.sentiment)) {
          nodesToKeep.add(node.id);
        }
        if (node.group === 'Brand') {
          nodesToKeep.add(node.id);
        }
      });
      
      filteredNodes = filteredNodes.filter(node => nodesToKeep.has(node.id));
      
      const nodeIdSet = new Set(filteredNodes.map(n => n.id));
      filteredLinks = filteredLinks.filter(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        return nodeIdSet.has(sourceId) && nodeIdSet.has(targetId);
      });
    }

    const hasActiveFilters = filters.connectionThreshold > 0 || 
                             filters.selectedBrands.length > 0 || 
                             filters.selectedTopics.length > 0 || 
                             filters.selectedSentiments.length > 0;
    
    if (hasActiveFilters) {
      const connectedNodeIds = new Set();
      filteredLinks.forEach(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        connectedNodeIds.add(sourceId);
        connectedNodeIds.add(targetId);
      });
      
      filteredNodes = filteredNodes.filter(node => connectedNodeIds.has(node.id));
    }

    const finalNodeIds = new Set(filteredNodes.map(n => n.id));
    filteredLinks = filteredLinks.filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return finalNodeIds.has(sourceId) && finalNodeIds.has(targetId);
    });

    const nodeNeighbors = {};
    const nodeLinks = {};
    
    filteredNodes.forEach(node => {
      nodeNeighbors[node.id] = new Set();
      nodeLinks[node.id] = new Set();
    });
    
    filteredLinks.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      if (nodeNeighbors[sourceId]) nodeNeighbors[sourceId].add(targetId);
      if (nodeNeighbors[targetId]) nodeNeighbors[targetId].add(sourceId);
      if (nodeLinks[sourceId]) nodeLinks[sourceId].add(link);
      if (nodeLinks[targetId]) nodeLinks[targetId].add(link);
    });

    const nodesWithNeighbors = filteredNodes.map(node => ({
      ...node,
      neighbors: nodeNeighbors[node.id] || new Set(),
      links: nodeLinks[node.id] || new Set()
    }));

    return {
      nodes: nodesWithNeighbors,
      links: filteredLinks
    };
  }, [graphData, filters, maxLinkWeight]);

  const getNodeSize = useCallback((node) => {
    if (node.group === 'Brand') return 18;
    return 8;
  }, []);

  const handleNodeHover = useCallback((node) => {
    const newHighlightNodes = new Set();
    const newHighlightLinks = new Set();

    if (node) {
      newHighlightNodes.add(node.id);
      if (node.neighbors) {
        node.neighbors.forEach(neighborId => newHighlightNodes.add(neighborId));
      }
      if (node.links) {
        node.links.forEach(link => newHighlightLinks.add(link));
      }
    }

    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);
    setHoverNode(node || null);
  }, []);

  const handleNodeClick = useCallback((node) => {
    if (graphRef.current && node) {
      graphRef.current.centerAt(node.x, node.y, 500);
      graphRef.current.zoom(2, 500);
      setSelectedNode(node);
    }
  }, []);

  const handleCloseInspector = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleZoomIn = useCallback(() => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom * 1.5, 300);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom / 1.5, 300);
    }
  }, []);

  const handleFit = useCallback(() => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400);
    }
  }, []);

  const handleReset = useCallback(() => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400);
      graphRef.current.d3ReheatSimulation();
    }
  }, []);

  const nodeCanvasObject = useCallback((node, ctx, globalScale) => {
    const label = node.label || node.name || node.caption || node.id;
    const nodeSize = getNodeSize(node);
    const nodeType = node.group;
    const color = getNodeColor(nodeType);
    const fontSize = Math.max(12 / globalScale, 3);
    
    const isHighlighted = highlightNodes.size === 0 || highlightNodes.has(node.id);
    const isSelected = selectedNode && selectedNode.id === node.id;
    const opacity = isHighlighted ? 1 : 0.2;
    
    ctx.save();
    
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    
    if (isSelected) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize * 0.4, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();
    
    if (globalScale > 0.4 && isHighlighted) {
      ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.9})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      const displayLabel = label.length > 18 ? label.substring(0, 18) + '...' : label;
      ctx.fillText(displayLabel, node.x, node.y + nodeSize + 4);
    }
    
    ctx.restore();
  }, [highlightNodes, getNodeSize, selectedNode]);

  const nodePointerAreaPaint = useCallback((node, color, ctx) => {
    const nodeSize = getNodeSize(node);
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize + 4, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
  }, [getNodeSize]);

  const getLinkColor = useCallback((link) => {
    const baseColor = '#64748b';
    if (highlightNodes.size === 0) {
      return baseColor + '40';
    }
    return highlightLinks.has(link) 
      ? baseColor + 'AA'
      : baseColor + '15';
  }, [highlightNodes, highlightLinks]);

  const getLinkWidth = useCallback((link) => {
    const weight = link.value || link.weight || 1;
    const baseWidth = Math.sqrt(weight) * 0.8 + 0.5;
    return highlightLinks.has(link) ? baseWidth * 1.5 : baseWidth;
  }, [highlightLinks]);

  if (loading) {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-[#0b0e14]">
        <DotMatrixBackground />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-400 border-t-transparent mx-auto mb-4"></div>
            <p className="text-slate-400 text-sm font-medium">Loading Strategic Map...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-[#0b0e14]">
        <DotMatrixBackground />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 text-4xl mb-4">!</div>
            <p className="text-red-400 text-sm font-medium">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0b0e14]">
      <DotMatrixBackground />
      
      <AIQueryBar />
      
      <GlobalFilters 
        brands={brands}
        topics={topics}
        filters={filters}
        onFilterChange={setFilters}
      />
      
      {selectedNode && (
        <NodeInspector 
          node={selectedNode} 
          onClose={handleCloseInspector}
        />
      )}
      
      <div className="absolute inset-0">
        <ForceGraph2D
          ref={graphRef}
          graphData={filteredGraphData}
          backgroundColor="transparent"
          nodeCanvasObject={nodeCanvasObject}
          nodePointerAreaPaint={nodePointerAreaPaint}
          nodeVal={getNodeSize}
          linkColor={getLinkColor}
          linkWidth={getLinkWidth}
          linkCurvature={0.1}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          warmupTicks={100}
          cooldownTicks={200}
          onNodeHover={handleNodeHover}
          onNodeClick={handleNodeClick}
          onBackgroundClick={() => {
            setHighlightNodes(new Set());
            setHighlightLinks(new Set());
            setHoverNode(null);
            setSelectedNode(null);
          }}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          minZoom={0.3}
          maxZoom={8}
        />
      </div>
      
      {!selectedNode && (
        <FloatingControls 
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFit={handleFit}
          onReset={handleReset}
        />
      )}
      
      <GraphLegend />
    </div>
  );
}

export default App;
