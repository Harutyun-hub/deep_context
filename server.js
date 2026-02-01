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
    const brandsQuery = `
      MATCH (b:Brand)
      RETURN elementId(b) as id, b.name as name, b.industry as industry
    `;
    
    const topicsQuery = `
      MATCH (t:Topic)<-[ct:COVERS_TOPIC]-(ad:Ad)<-[pub:PUBLISHED]-(b:Brand)
      WITH t, 
           COLLECT(DISTINCT ct.context) as allContexts,
           COLLECT(DISTINCT {
             adId: elementId(ad),
             text: ad.text,
             url: ad.url,
             date: CASE WHEN ad.date IS NOT NULL THEN toString(ad.date) ELSE null END,
             platform: pub.platform
           }) as allEvidence
      RETURN elementId(t) as id, t.name as name, allContexts as contexts, allEvidence as evidence
    `;
    
    const linksQuery = `
      MATCH (b:Brand)-[pub:PUBLISHED]->(ad:Ad)-[ct:COVERS_TOPIC]->(t:Topic)
      WITH b, t, pub.platform as platform, COUNT(DISTINCT ad) as adCount
      RETURN elementId(b) as brandId, elementId(t) as topicId, platform, adCount as value
    `;
    
    const [brandsResult, topicsResult, linksResult] = await Promise.all([
      session.run(brandsQuery),
      session.run(topicsQuery),
      session.run(linksQuery)
    ]);
    
    const nodes = [];
    const links = [];
    
    brandsResult.records.forEach(record => {
      nodes.push({
        id: record.get('id'),
        group: 'Brand',
        caption: record.get('name') || record.get('id'),
        industry: record.get('industry')
      });
    });
    
    topicsResult.records.forEach(record => {
      const contexts = record.get('contexts') || [];
      const evidence = record.get('evidence') || [];
      
      const filteredContexts = contexts.filter(c => c !== null && c !== undefined);
      const filteredEvidence = evidence.filter(e => e !== null && e.text);
      
      nodes.push({
        id: record.get('id'),
        group: 'Topic',
        caption: record.get('name') || record.get('id'),
        contexts: filteredContexts,
        evidence: filteredEvidence
      });
    });
    
    const toInt = (value) => {
      if (value === null || value === undefined) return 1;
      if (typeof value === 'object' && value.toInt) return value.toInt();
      return parseInt(value, 10) || 1;
    };
    
    linksResult.records.forEach(record => {
      links.push({
        source: record.get('brandId'),
        target: record.get('topicId'),
        type: 'COVERS_TOPIC',
        platform: record.get('platform') || 'unknown',
        value: toInt(record.get('value'))
      });
    });
    
    const graphData = { nodes, links };
    
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
