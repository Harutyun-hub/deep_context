import express from 'express';
import cors from 'cors';
import { driver } from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/graph', async (req, res) => {
  const topicSession = driver.session();
  const platformSession = driver.session();
  
  try {
    const topicQuery = `
      MATCH (b:Brand)-[:PUBLISHED]->(ad:Ad)-[:COVERS_TOPIC]->(t:Topic)
      WITH b, t, count(ad) as weight
      WHERE weight > 2
      RETURN 
        { id: elementId(b), label: 'Brand', name: b.name } as source,
        { id: elementId(t), label: 'Topic', name: t.name } as target,
        weight, 'FOCUSES_ON' as relType
    `;
    
    const platformQuery = `
      MATCH (b:Brand)-[:PUBLISHED]->(ad:Ad)-[:ON_PLATFORM]->(p:Platform)
      WITH b, p, count(ad) as weight
      WHERE weight > 2
      RETURN 
        { id: elementId(b), label: 'Brand', name: b.name } as source,
        { id: elementId(p), label: 'Platform', name: p.name } as target,
        weight, 'ACTIVE_ON' as relType
    `;
    
    const [topicResult, platformResult] = await Promise.all([
      topicSession.run(topicQuery),
      platformSession.run(platformQuery)
    ]);
    
    const nodesMap = new Map();
    const linksMap = new Map();
    
    // Helper to convert Neo4j integers to JS integers
    const toInt = (value) => {
      if (value === null || value === undefined) return 0;
      if (typeof value === 'object' && value.toInt) return value.toInt();
      return parseInt(value, 10) || 0;
    };
    
    // Process results from both queries
    const processRecords = (records) => {
      records.forEach(record => {
        const source = record.get('source');
        const target = record.get('target');
        const weight = record.get('weight');
        const relType = record.get('relType');
        
        if (!source || !source.id || !target || !target.id) return;
        
        // Add source (Brand) node
        if (!nodesMap.has(source.id)) {
          nodesMap.set(source.id, {
            id: source.id,
            group: source.label,
            caption: source.name || source.id
          });
        }
        
        // Add target (Topic or Platform) node
        if (!nodesMap.has(target.id)) {
          nodesMap.set(target.id, {
            id: target.id,
            group: target.label,
            caption: target.name || target.id
          });
        }
        
        // Add link with integer weight
        const linkKey = `${source.id}->${target.id}`;
        if (!linksMap.has(linkKey)) {
          linksMap.set(linkKey, {
            source: source.id,
            target: target.id,
            type: relType,
            value: toInt(weight)
          });
        }
      });
    };
    
    processRecords(topicResult.records);
    processRecords(platformResult.records);
    
    const graphData = {
      nodes: Array.from(nodesMap.values()),
      links: Array.from(linksMap.values())
    };
    
    res.json(graphData);
  } catch (error) {
    console.error('Error fetching graph data:', error.message);
    res.status(500).json({ error: 'Failed to fetch graph data', details: error.message });
  } finally {
    await topicSession.close();
    await platformSession.close();
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
