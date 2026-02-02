import { useState } from 'react';
import { GraphVisualization } from '@/app/components/GraphVisualization';
import { AIQueryBar } from '@/app/components/AIQueryBar';
import { GlobalFilters } from '@/app/components/GlobalFilters';
import { NodeInspector } from '@/app/components/NodeInspector';
import { FloatingControls } from '@/app/components/FloatingControls';
import { GraphLegend } from '@/app/components/GraphLegend';
import { DotMatrixBackground } from '@/app/components/DotMatrixBackground';

function App() {
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const handleNodeClick = (node: any) => {
    // Only show inspector for topic nodes
    if (node.type === 'topic') {
      setSelectedNode(node);
    } else {
      setSelectedNode(null);
    }
  };

  const handleCloseInspector = () => {
    setSelectedNode(null);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0b0e14]">
      {/* Dot Matrix Background */}
      <DotMatrixBackground />

      {/* AI Query Bar */}
      <AIQueryBar />

      {/* Left Sidebar - Global Filters */}
      <GlobalFilters />

      {/* Right Sidebar - Node Inspector (conditionally rendered) */}
      {selectedNode && (
        <NodeInspector node={selectedNode} onClose={handleCloseInspector} />
      )}

      {/* Graph Visualization */}
      <div className="absolute inset-0">
        <GraphVisualization 
          onNodeClick={handleNodeClick}
          selectedNodeId={selectedNode?.id}
        />
      </div>

      {/* Floating Controls */}
      <FloatingControls />

      {/* Legend - Centered at Bottom */}
      <GraphLegend />
    </div>
  );
}

export default App;