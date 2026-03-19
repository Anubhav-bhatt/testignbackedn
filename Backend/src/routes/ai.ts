import express from 'express';
import { generateLegalResponse } from '../services/aiService';
import { getCaseInsights } from '../services/insightsService';
import { buildSources, retrieveRelevantChunks } from '../services/ragService';

const router = express.Router();


// GET /api/ai/insights/:caseId
router.get('/insights/:caseId', async (req, res) => {
    try {
        const { caseId } = req.params;
        const insights = await getCaseInsights(caseId);
        res.json(insights);
    } catch (err: any) {
        console.error('[API] Error fetching AI insights for case:', req.params.caseId);
        console.error('[API] Error stack:', err.stack);
        res.status(500).json({
            error: 'Internal Server Error',
            details: err.message,
            path: '/api/ai/insights'
        });
    }
});

// POST /api/ai/query
router.post('/query', async (req, res) => {
    console.log('[API] Received query request:', req.body);
    try {
        const { query, caseId } = req.body;
        const response = await generateLegalResponse(query, caseId);
        console.log('[API] Generated response length:', response.response?.length);
        res.json(response);
        console.log('[API] Response sent.');
    } catch (err: any) {
        console.error('Error querying AI:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/retrieve', async (req, res) => {
    try {
        const { query, caseId, limit } = req.body;
        const retrieval = await retrieveRelevantChunks(query, caseId, Number(limit) || 5);
        res.json({
            scope: retrieval.scope,
            chunkCount: retrieval.chunks.length,
            totalCandidates: retrieval.totalCandidates,
            sources: buildSources(retrieval.chunks),
        });
    } catch (err: any) {
        console.error('Error retrieving AI context:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
