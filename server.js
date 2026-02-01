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
    const result = await session.run('MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 150');
    
    const nodesMap = new Map();
    const links = [];
    
    result.records.forEach(record => {
      const n = record.get('n');
      const r = record.get('r');
      const m = record.get('m');
      
      const nId = n.elementId || n.identity.toString();
      if (!nodesMap.has(nId)) {
        nodesMap.set(nId, {
          id: nId,
          group: n.labels[0] || 'Unknown',
          caption: n.properties.name || n.properties.title || n.properties.id || nId
        });
      }
      
      const mId = m.elementId || m.identity.toString();
      if (!nodesMap.has(mId)) {
        nodesMap.set(mId, {
          id: mId,
          group: m.labels[0] || 'Unknown',
          caption: m.properties.name || m.properties.title || m.properties.id || mId
        });
      }
      
      links.push({
        source: nId,
        target: mId,
        type: r.type
      });
    });
    
    const graphData = {
      nodes: Array.from(nodesMap.values()),
      links: links
    };
    
    res.json(graphData);
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
