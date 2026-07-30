import express from 'express';
import cors from 'cors';
import { db } from './db/index';
import { flows } from './db/schema';
import { eq } from 'drizzle-orm';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Get all flows
app.get('/api/flows', async (_req, res) => {
  try {
    const dbFlows = await db.select().from(flows);
    // Parse successRate decimal to float for compatibility with mockFlows interface
    const formattedFlows = dbFlows.map((flow) => ({
      ...flow,
      successRate: parseFloat(flow.successRate || '0.00'),
    }));
    res.json(formattedFlows);
  } catch (error) {
    console.error('Error fetching flows:', error);
    res.status(500).json({ error: 'Failed to fetch flows' });
  }
});

// Save or Update flow (Upsert)
app.post('/api/flows', async (req, res) => {
  try {
    const { id, name, description, status, runs, successRate, nodes, edges } = req.body;

    if (!id || !name) {
      res.status(400).json({ error: 'Missing required fields: id and name' });
      return;
    }

    // Clean up node data by stripping onDataChange if it exists to make it JSON serializable
    const cleanedNodes = (nodes || []).map((node: any) => {
      if (node.data) {
        const { onDataChange, ...restData } = node.data;
        return { ...node, data: restData };
      }
      return node;
    });

    const flowData = {
      id,
      name,
      description: description || '',
      status: status || 'draft',
      runs: runs || 0,
      successRate: successRate !== undefined ? successRate.toString() : '0.00',
      nodes: cleanedNodes,
      edges: edges || [],
      updatedAt: new Date(),
    };

    await db.insert(flows).values(flowData).onConflictDoUpdate({
      target: flows.id,
      set: {
        name: flowData.name,
        description: flowData.description,
        status: flowData.status,
        runs: flowData.runs,
        successRate: flowData.successRate,
        nodes: flowData.nodes,
        edges: flowData.edges,
        updatedAt: flowData.updatedAt,
      },
    });

    res.json({ success: true, message: 'Flow saved successfully' });
  } catch (error) {
    console.error('Error saving flow:', error);
    res.status(500).json({ error: 'Failed to save flow' });
  }
});

// Delete flow
app.delete('/api/flows/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(flows).where(eq(flows.id, id));
    res.json({ success: true, message: 'Flow deleted successfully' });
  } catch (error) {
    console.error('Error deleting flow:', error);
    res.status(500).json({ error: 'Failed to delete flow' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
});
