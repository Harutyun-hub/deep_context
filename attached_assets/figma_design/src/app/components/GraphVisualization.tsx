import { useRef, useEffect, useState, useCallback } from 'react';
import { Graph } from 'react-d3-graph';

interface Node {
  id: string;
  name: string;
  color: string;
  size?: number;
  type: 'brand' | 'topic';
}

interface Link {
  source: string;
  target: string;
  value?: number;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

interface GraphVisualizationProps {
  onNodeClick?: (node: Node) => void;
  selectedNodeId?: string | null;
}

// Generate mock graph data with brands and topics
const generateGraphData = (): GraphData => {
  const nodes: Node[] = [];
  const links: Link[] = [];

  // Create brand nodes
  const brands = [
    { id: 'fast_bank', name: 'Fast Bank', color: '#3b82f6', size: 500, type: 'brand' as const },
    { id: 'ameriabank', name: 'Ameriabank', color: '#3b82f6', size: 450, type: 'brand' as const },
    { id: 'id_bank', name: 'ID Bank', color: '#3b82f6', size: 400, type: 'brand' as const },
    { id: 'vtb_armenia', name: 'VTB Armenia', color: '#3b82f6', size: 350, type: 'brand' as const },
  ];

  // Create topic nodes
  const topics = [
    'Student Loans',
    'Mortgage Rates',
    'Business Credit',
    'Savings Account',
    'Credit Cards',
    'Investment Plans',
    'Personal Loans',
    'Mobile Banking',
    'Online Security',
    'Customer Service',
    'Interest Rates',
    'Fee Structure',
  ];

  nodes.push(...brands);

  topics.forEach((topicName, index) => {
    nodes.push({
      id: `topic_${index}`,
      name: topicName,
      color: '#a855f7',
      size: 250,
      type: 'topic',
    });
  });

  // Create connections between brands and topics
  brands.forEach((brand) => {
    // Connect each brand to random topics
    const numConnections = Math.floor(Math.random() * 4) + 3;
    const shuffledTopics = [...topics].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < numConnections; i++) {
      const topicIndex = topics.indexOf(shuffledTopics[i]);
      links.push({
        source: brand.id,
        target: `topic_${topicIndex}`,
        value: Math.floor(Math.random() * 3) + 1, // 1-3 for thickness
      });
    }
  });

  // Add some topic-to-topic connections
  for (let i = 0; i < 8; i++) {
    const source = Math.floor(Math.random() * topics.length);
    const target = Math.floor(Math.random() * topics.length);
    if (source !== target) {
      links.push({
        source: `topic_${source}`,
        target: `topic_${target}`,
        value: 1,
      });
    }
  }

  return { nodes, links };
};

export function GraphVisualization({ onNodeClick, selectedNodeId }: GraphVisualizationProps) {
  const [graphData] = useState<GraphData>(generateGraphData());
  const [dimensions, setDimensions] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    const node = graphData.nodes.find(n => n.id === nodeId);
    if (onNodeClick && node) {
      onNodeClick(node as Node);
    }
  }, [onNodeClick, graphData.nodes]);

  // Configuration for the graph
  const graphConfig = {
    automaticRearrangeAfterDropNode: false,
    directed: false,
    height: dimensions.height,
    width: dimensions.width,
    nodeHighlightBehavior: true,
    node: {
      color: '#a855f7',
      size: 250,
      highlightStrokeColor: '#fbbf24',
      highlightStrokeWidth: 3,
      highlightFontSize: 14,
      highlightFontWeight: 'bold',
      labelProperty: 'name',
      renderLabel: true,
      fontSize: 11,
      fontColor: 'rgba(255, 255, 255, 0.9)',
      labelPosition: 'bottom',
      strokeColor: 'rgba(255, 255, 255, 0.3)',
      strokeWidth: 1.5,
    },
    link: {
      color: 'rgba(255, 255, 255, 0.15)',
      highlightColor: 'rgba(168, 85, 247, 0.4)',
      renderLabel: false,
      semanticStrokeWidth: true,
      strokeWidth: 1,
    },
    d3: {
      gravity: -300,
      linkLength: 150,
      linkStrength: 0.4,
      disableLinkForce: false,
    },
  };

  // Update node colors based on selection
  const updatedNodes = graphData.nodes.map(node => ({
    ...node,
    color: selectedNodeId === node.id ? '#fbbf24' : node.color,
    strokeColor: selectedNodeId === node.id ? '#fbbf24' : 'rgba(255, 255, 255, 0.3)',
  }));

  // Update link widths based on value
  const updatedLinks = graphData.links.map(link => ({
    ...link,
    strokeWidth: (link.value || 1) * 1.5,
  }));

  return (
    <div className="w-full h-full">
      <Graph
        id="graph-visualization"
        data={{
          nodes: updatedNodes,
          links: updatedLinks,
        }}
        config={graphConfig}
        onClickNode={handleNodeClick}
      />
    </div>
  );
}
