import express from 'express';

export function createEconomicApi(governor) {
  const router = express.Router();
  router.use(express.json({ limit: '32kb' }));

  const adminToken = process.env.NEON_ADMIN_TOKEN || '';
  const requireAdmin = (req, res, next) => {
    if (!adminToken && process.env.NODE_ENV === 'production') return res.status(503).json({ error: 'ADMIN_AUTH_NOT_CONFIGURED' });
    if (!adminToken) return next();
    const auth = req.get('authorization') || '';
    if (auth !== `Bearer ${adminToken}`) return res.status(401).json({ error: 'UNAUTHORIZED' });
    next();
  };

  router.get('/status', (_req, res) => res.json(governor.status()));
  router.use(requireAdmin);
  router.post('/pause', async (req, res, next) => { try { res.json(await governor.pause(req.body?.reason)); } catch (e) { next(e); } });
  router.post('/resume', async (req, res, next) => { try { res.json(await governor.resume(req.body?.reason)); } catch (e) { next(e); } });
  router.post('/opportunities', async (req, res, next) => { try { res.status(201).json(await governor.registerOpportunity(req.body)); } catch (e) { next(e); } });
  router.post('/plan', async (_req, res, next) => { try { res.json(await governor.plan()); } catch (e) { next(e); } });
  router.post('/settlements/pending', async (req, res, next) => { try { res.status(201).json(await governor.recordPendingSettlement(req.body)); } catch (e) { next(e); } });
  router.post('/settlements/verify', async (req, res, next) => { try { res.json(await governor.verifySettlement(req.body)); } catch (e) { next(e); } });
  router.post('/costs', async (req, res, next) => { try { res.status(201).json(await governor.recordCost(req.body)); } catch (e) { next(e); } });

  return router;
}
