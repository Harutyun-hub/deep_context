import express from 'express';
import cors from 'cors';
import { driver } from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/graph', async (req, res) => {
  const session = driver.session();
  
  try {
    const query = `
      // 1. MATCH: Traverse the full path but keep data server-side
      MATCH (b:Brand)-[:PUBLISHED]->(a:Ad)-[:COVERS_TOPIC]->(t:Topic)
      
      // 2. AGGREGATE: Collapse Ads into weights
      WITH b, t, count(a) AS weight
      WHERE weight >= 1 
      
      // 3. RANKING: Calculate Global Topic Volume to find the "Market Leaders"
      WITH t, sum(weight) AS topicGlobalVol, collect({source: elementId(b), target: elementId(t), value: weight}) AS brandLinks
      ORDER BY topicGlobalVol DESC
      LIMIT 80
      
      // 4. FORMATTING: Build the node lists
      WITH collect(t) AS topics, collect(brandLinks) AS linkGroups, collect(topicGlobalVol) AS volumes
      WITH topics, volumes, [link IN reduce(acc=[], g IN linkGroups | acc + g) | link] AS allLinks
      
      // 5. CLEANUP: Get only the Brands involved in these top topics
      UNWIND allLinks AS l
      MATCH (b:Brand) WHERE elementId(b) = l.source
      WITH topics, volumes, allLinks, collect(DISTINCT b) AS brands
      
      // 6. RETURN: A single, pre-calculated JSON object for React
      RETURN {
        nodes: 
          [brand IN brands | {
            id: elementId(brand), 
            group: 'Brand', 
            label: brand.name, 
            radius: 30,
            color: '#3b82f6'
          }] + 
          [i IN range(0, size(topics)-1) | {
            id: elementId(topics[i]), 
            group: 'Topic', 
            label: topics[i].name, 
            radius: 5 + toInteger(log(volumes[i]) * 5),
            color: '#a855f7'
          }],
        links: allLinks
      } AS graphData
    `;
    
    const result = await session.run(query);
    
    if (result.records.length > 0) {
      const graphData = result.records[0].get('graphData');
      
      const processedNodes = graphData.nodes.map(node => ({
        id: node.id,
        group: node.group,
        label: node.label,
        radius: typeof node.radius === 'object' ? node.radius.toNumber() : node.radius,
        color: node.color
      }));
      
      const processedLinks = graphData.links.map(link => ({
        source: link.source,
        target: link.target,
        value: typeof link.value === 'object' ? link.value.toNumber() : link.value
      }));
      
      res.json({
        nodes: processedNodes,
        links: processedLinks
      });
    } else {
      res.json({ nodes: [], links: [] });
    }
  } catch (error) {
    console.error('Error fetching graph data:', error.message);
    res.status(500).json({ error: 'Failed to fetch graph data', details: error.message });
  } finally {
    await session.close();
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
