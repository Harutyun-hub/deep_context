import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const NODE_COLORS = {
  Brand: '#3b82f6',
  Topic: '#a855f7',
  Platform: '#f97316',
  default: '#64748b'
};

const getNodeColor = (nodeType) => NODE_COLORS[nodeType] || NODE_COLORS.default;

function GraphDashboard() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState(null);
  const graphRef = useRef();

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
      
      fg.d3Force('charge').strength(-400);
      fg.d3Force('link').distance(120);
      
      fg.d3ReheatSimulation();
    }
  }, [graphData]);

  const getNodeSize = useCallback((node) => {
    const nodeType = node.label || node.group;
    if (nodeType === 'Brand') return 20;
    const weight = node.weight || node.degree || 1;
    return Math.sqrt(weight) * 3 + 4;
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
      graphRef.current.zoom(2.5, 500);
    }
  }, []);

  const nodeCanvasObject = useCallback((node, ctx, globalScale) => {
    const label = node.name || node.caption || node.id;
    const nodeSize = getNodeSize(node);
    const nodeType = node.label || node.group;
    const color = getNodeColor(nodeType);
    const fontSize = Math.max(10 / globalScale, 2);
    
    const isHighlighted = highlightNodes.size === 0 || highlightNodes.has(node.id);
    const opacity = isHighlighted ? 1 : 0.15;
    
    ctx.save();
    
    if (nodeType === 'Brand') {
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;
    }
    
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize * 0.5, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fill();
    
    if (globalScale > 0.5 && isHighlighted) {
      ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.9})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      const displayLabel = label.length > 15 ? label.substring(0, 15) + '...' : label;
      ctx.fillText(displayLabel, node.x, node.y + nodeSize + 3);
    }
    
    ctx.restore();
  }, [highlightNodes, getNodeSize]);

  const nodePointerAreaPaint = useCallback((node, color, ctx) => {
    const nodeSize = getNodeSize(node);
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize + 4, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
  }, [getNodeSize]);

  const getLinkColor = useCallback((link) => {
    if (highlightNodes.size === 0) {
      return 'rgba(148, 163, 184, 0.3)';
    }
    return highlightLinks.has(link) 
      ? 'rgba(148, 163, 184, 0.8)' 
      : 'rgba(148, 163, 184, 0.05)';
  }, [highlightNodes, highlightLinks]);

  const getLinkWidth = useCallback((link) => {
    const baseWidth = Math.sqrt(link.value || link.weight || 1) + 1;
    return highlightLinks.has(link) ? baseWidth * 1.5 : baseWidth;
  }, [highlightLinks]);

  const nodeVal = useCallback((node) => {
    return getNodeSize(node);
  }, [getNodeSize]);

  if (loading) {
    return (
      <div className="rounded-2xl shadow-lg overflow-hidden bg-white/40 backdrop-blur-xl border border-white/60">
        <div 
          className="flex justify-center items-center h-96"
          style={{ backgroundColor: '#0f172a' }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-400 border-t-transparent mx-auto mb-4"></div>
            <p className="text-slate-400 text-sm font-medium">Loading Strategic Map...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl shadow-lg overflow-hidden bg-white/40 backdrop-blur-xl border border-white/60">
        <div 
          className="flex justify-center items-center h-96"
          style={{ backgroundColor: '#0f172a' }}
        >
          <div className="text-center">
            <div className="text-red-400 text-4xl mb-4">⚠</div>
            <p className="text-red-400 text-sm font-medium">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl shadow-lg overflow-hidden bg-white/40 backdrop-blur-xl border border-white/60">
      <div className="px-6 py-4 border-b border-white/60 bg-white/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Strategic Map</h2>
            <p className="text-sm text-gray-500">
              {graphData.nodes.length} entities • {graphData.links.length} connections
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: NODE_COLORS.Brand, boxShadow: `0 0 6px ${NODE_COLORS.Brand}` }}></span>
              <span className="text-gray-600">Brands</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: NODE_COLORS.Topic }}></span>
              <span className="text-gray-600">Topics</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: NODE_COLORS.Platform }}></span>
              <span className="text-gray-600">Platforms</span>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ backgroundColor: '#0f172a', height: '500px', position: 'relative' }}>
        {hoverNode && (
          <div 
            className="absolute top-4 left-4 z-10 px-4 py-3 rounded-lg backdrop-blur-md"
            style={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: `1px solid ${getNodeColor(hoverNode.label || hoverNode.group)}40`
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span 
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: getNodeColor(hoverNode.label || hoverNode.group) }}
              ></span>
              <span className="text-white font-medium text-sm">
                {hoverNode.name || hoverNode.caption || hoverNode.id}
              </span>
            </div>
            <div className="text-slate-400 text-xs">
              {hoverNode.label || hoverNode.group} • {hoverNode.neighbors?.size || 0} connections
            </div>
          </div>
        )}
        
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          backgroundColor="#0f172a"
          nodeCanvasObject={nodeCanvasObject}
          nodePointerAreaPaint={nodePointerAreaPaint}
          nodeVal={nodeVal}
          linkColor={getLinkColor}
          linkWidth={getLinkWidth}
          linkCurvature={0.15}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.25}
          warmupTicks={100}
          cooldownTicks={200}
          onNodeHover={handleNodeHover}
          onNodeClick={handleNodeClick}
          onBackgroundClick={() => {
            setHighlightNodes(new Set());
            setHighlightLinks(new Set());
            setHoverNode(null);
          }}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          minZoom={0.3}
          maxZoom={8}
        />
      </div>
    </div>
  );
}

export default GraphDashboard;
