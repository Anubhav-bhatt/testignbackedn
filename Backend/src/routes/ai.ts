import express from 'express';
import { getCaseInsights } from '../../../AI/engine/insights';
import { generateLegalResponse } from '../services/aiService';

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
        console.log('[API] Generated response length:', response?.length);
        res.json({ response });
        console.log('[API] Response sent.');
    } catch (err: any) {
        console.error('Error querying AI:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
