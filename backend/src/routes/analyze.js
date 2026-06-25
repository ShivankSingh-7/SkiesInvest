import express from 'express';
import { runAnalysis } from '../services/analysisService.js';
import { getCompanyHistory } from '../memory/memoryService.js';

const router = express.Router();

// ─── POST /api/analyze — SSE Streaming Analysis ───────────────────────────────
router.post('/analyze', async (req, res) => {
  const { companyName } = req.body;

  if (!companyName || typeof companyName !== 'string' || companyName.trim().length < 2) {
    return res.status(400).json({
      error: 'Invalid company name. Please provide a valid company name.',
    });
  }

  // Set up Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Helper to send SSE events
  const sendEvent = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Progress callback passed to analysis service
  const onProgress = (stage, message, details = {}) => {
    sendEvent('progress', { stage, message, details, timestamp: Date.now() });
  };

  try {
    sendEvent('start', { companyName: companyName.trim(), timestamp: Date.now() });

    const result = await runAnalysis(companyName.trim(), onProgress);

    sendEvent('complete', { success: true, ...result });
  } catch (err) {
    console.error('[Analyze Route Error]', err);
    sendEvent('error', {
      success: false,
      error: err.message || 'Analysis failed',
      companyName: companyName.trim(),
    });
  } finally {
    res.end();
  }
});

// ─── GET /api/history/:companyName — Fetch Previous Analysis ─────────────────
router.get('/history/:companyName', async (req, res) => {
  try {
    const { companyName } = req.params;
    const history = await getCompanyHistory(companyName);

    if (!history) {
      return res.status(404).json({ found: false, message: 'No previous analysis found' });
    }

    res.json({ found: true, history });
  } catch (err) {
    console.error('[History Route Error]', err);
    res.status(500).json({ error: 'Failed to retrieve history' });
  }
});

// ─── GET /api/recent — List Recent Analyses ───────────────────────────────────
router.get('/recent', async (req, res) => {
  try {
    const { getRecentAnalyses } = await import('../memory/memoryService.js');
    const recent = await getRecentAnalyses(10);
    res.json({ analyses: recent });
  } catch (err) {
    console.error('[Recent Route Error]', err);
    res.status(500).json({ error: 'Failed to retrieve recent analyses', analyses: [] });
  }
});

export default router;
