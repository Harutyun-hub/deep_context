import React, { useEffect, useState, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const getColor = (group) => {
  const colorMap = {
    'Person': '#00d4ff',
    'Organization': '#00ff88',
    'Event': '#ff3366',
    'Location': '#ffcc00',
    'Ad': '#ff6699',
    'Platform': '#00d4ff',
    'Campaign': '#00ff88',
    'AdSet': '#ff3366',
    'Creative': '#ffcc00',
    'Account': '#9966ff',
    'default': '#00d4ff'
  };
  return colorMap[group] || colorMap['default'];
};

function GraphDashboard() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const graphRef = useRef();

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch('/api/graph');
        if (!response.ok) {
          throw new Error('Failed to fetch graph data');
        }
        const data = await response.json();
        setGraphData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchGraphData();
  }, []);

  const nodeCanvasObject = useCallback((node, ctx, globalScale) => {
    const label = node.caption || node.id;
    const fontSize = 12 / globalScale;
    const nodeRadius = 8;
    const color = getColor(node.group);

    ctx.save();

    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius * 0.6, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();

    ctx.font = `${fontSize}px 'Segoe UI', sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, node.x + nodeRadius + 4, node.y);

    ctx.restore();
  }, []);

  const nodePointerAreaPaint = useCallback((node, color, ctx) => {
    const nodeRadius = 12;
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
        color: '#00d4ff',
        fontSize: '1.5rem',
        fontFamily: "'Segoe UI', sans-serif"
      }}>
        <div style={{
          padding: '2rem 3rem',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          boxShadow: '0 0 30px rgba(0, 212, 255, 0.1)'
        }}>
          Loading graph data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
        color: '#ff3366',
        fontSize: '1.2rem',
        fontFamily: "'Segoe UI', sans-serif"
      }}>
        <div style={{
          padding: '2rem 3rem',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 51, 102, 0.3)',
          boxShadow: '0 0 30px rgba(255, 51, 102, 0.1)'
        }}>
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)'
    }}>
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 10,
        padding: '1rem 1.5rem',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
        fontFamily: "'Segoe UI', sans-serif"
      }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 500 }}>
          Graph Dashboard
        </h2>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.7 }}>
          {graphData.nodes.length} nodes • {graphData.links.length} connections
        </p>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 10,
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
        fontFamily: "'Segoe UI', sans-serif",
        fontSize: '0.8rem'
      }}>
        <div style={{ marginBottom: '0.5rem', fontWeight: 500, opacity: 0.8 }}>Legend</div>
        {['Ad', 'Platform', 'Campaign', 'AdSet', 'Creative', 'Account'].map(group => (
          <div key={group} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.3rem' }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: getColor(group),
              marginRight: '8px',
              boxShadow: `0 0 8px ${getColor(group)}`
            }} />
            <span>{group}</span>
          </div>
        ))}
      </div>

      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        backgroundColor="rgba(0,0,0,0)"
        nodeCanvasObject={nodeCanvasObject}
        nodePointerAreaPaint={nodePointerAreaPaint}
        linkColor={() => 'rgba(255, 255, 255, 0.15)'}
        linkWidth={1.5}
        linkCurvature={0.2}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={() => 'rgba(0, 212, 255, 0.8)'}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        warmupTicks={50}
        cooldownTicks={100}
        onNodeClick={(node) => {
          if (graphRef.current) {
            graphRef.current.centerAt(node.x, node.y, 500);
            graphRef.current.zoom(2, 500);
          }
        }}
      />
    </div>
  );
}

export default GraphDashboard;
