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
      MATCH (b:Brand)
      OPTIONAL MATCH (b)-[pub:PUBLISHED]->(a:Ad)-[ct:COVERS_TOPIC]->(t:Topic)
      RETURN 
        elementId(b) as brandId,
        b.name as brandName,
        b.industry as brandIndustry,
        elementId(t) as topicId,
        t.name as topicName,
        ct.context as context,
        elementId(a) as adId,
        a.text as adText,
        a.url as adUrl,
        CASE WHEN a.date IS NOT NULL THEN toString(a.date) ELSE null END as adDate,
        pub.platform as platform
    `;
    
    const result = await session.run(query);
    
    const brandNodesMap = new Map();
    const topicNodesMap = new Map();
    const linksMap = new Map();
    const processedAdsByTopic = new Map();
    const processedContextsByTopic = new Map();
    
    result.records.forEach(record => {
      const brandId = record.get('brandId');
      const brandName = record.get('brandName');
      const brandIndustry = record.get('brandIndustry');
      const topicId = record.get('topicId');
      const topicName = record.get('topicName');
      const context = record.get('context');
      const adId = record.get('adId');
      const adText = record.get('adText');
      const adUrl = record.get('adUrl');
      const adDate = record.get('adDate');
      const platform = record.get('platform');
      
      if (!brandId) return;
      
      if (!brandNodesMap.has(brandId)) {
        brandNodesMap.set(brandId, {
          id: brandId,
          group: 'Brand',
          caption: brandName || brandId,
          industry: brandIndustry
        });
      }
      
      if (topicId) {
        if (!topicNodesMap.has(topicId)) {
          topicNodesMap.set(topicId, {
            id: topicId,
            group: 'Topic',
            caption: topicName || topicId,
            contexts: [],
            evidence: []
          });
          processedAdsByTopic.set(topicId, new Set());
          processedContextsByTopic.set(topicId, new Set());
        }
        
        const topicNode = topicNodesMap.get(topicId);
        const topicAds = processedAdsByTopic.get(topicId);
        const topicContexts = processedContextsByTopic.get(topicId);
        
        if (context && !topicContexts.has(context)) {
          topicContexts.add(context);
          topicNode.contexts.push(context);
        }
        
        if (adId && !topicAds.has(adId)) {
          topicAds.add(adId);
          if (adText) {
            topicNode.evidence.push({
              adId: adId,
              text: adText,
              url: adUrl,
              date: adDate,
              platform: platform
            });
          }
        }
        
        const linkKey = `${brandId}->${topicId}::${platform || 'unknown'}`;
        if (!linksMap.has(linkKey)) {
          linksMap.set(linkKey, {
            source: brandId,
            target: topicId,
            type: 'COVERS_TOPIC',
            platform: platform || 'unknown',
            value: 1
          });
        } else {
          linksMap.get(linkKey).value += 1;
        }
      }
    });
    
    const nodes = [
      ...Array.from(brandNodesMap.values()),
      ...Array.from(topicNodesMap.values())
    ];
    
    const graphData = {
      nodes: nodes,
      links: Array.from(linksMap.values())
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
