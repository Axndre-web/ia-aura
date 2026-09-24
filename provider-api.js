import express from 'express';

export function createProviderApi(governor, providers) {
  const router = express.Router();
  router.use(express.json({ limit: '32kb' }));
  const adminToken = process.env.NEON_ADMIN_TOKEN || '';
  const requireAdmin = (req, res, next) => {
    if (!adminToken && process.env.NODE_ENV === 'production') return res.status(503).json({ error: 'ADMIN_AUTH_NOT_CONFIGURED' });
    if (adminToken && req.get('authorization') !== `Bearer ${adminToken}`) return res.status(401).json({ error: 'UNAUTHORIZED' });
    next();
  };

  router.get('/status', async (_req, res) => res.json({
    paypal: await providers.secrets.has('PAYPAL_CLIENT_ID') && await providers.secrets.has('PAYPAL_CLIENT_SECRET'),
    stripe: await providers.secrets.has('STRIPE_SECRET_KEY'),
    computeNode: Boolean(process.env.NEON_COMPUTE_NODE_URL) && await providers.secrets.has('COMPUTE_NODE_SHARED_SECRET'),
    runpod: await providers.secrets.has('RUNPOD_API_KEY'),
    cryptoReadOnly: Boolean(process.env.NEON_EVM_RPC_URL || process.env.NEON_SOLANA_RPC_URL),
    executionPolicy: governor.status().policy
  }));

  router.use(requireAdmin);
  router.post('/paypal/verify', async (req, res, next) => {
    try {
      const result = await providers.paypal.verifyOrder(req.body?.orderID);
      if (!result.verified || result.amountEUR == null) return res.status(422).json({ status: 'NOT_VERIFIED', ...result });
      const pending = await governor.recordPendingSettlement({ provider: result.provider, providerRef: result.providerRef, amountEUR: result.amountEUR, metadata: result });
      const verified = await governor.verifySettlement({ settlementId: pending.id, provider: result.provider, providerRef: result.providerRef, amountEUR: result.amountEUR, verification: result });
      res.json({ status: 'VERIFIED', settlement: verified });
    } catch (e) { next(e); }
  });

  router.post('/stripe/verify', async (req, res, next) => {
    try {
      const result = await providers.stripe.verifyPaymentIntent(req.body?.paymentIntentId);
      if (!result.verified || result.amountEUR == null) return res.status(422).json({ status: 'NOT_VERIFIED', ...result });
      const pending = await governor.recordPendingSettlement({ provider: result.provider, providerRef: result.providerRef, amountEUR: result.amountEUR, metadata: result });
      const verified = await governor.verifySettlement({ settlementId: pending.id, provider: result.provider, providerRef: result.providerRef, amountEUR: result.amountEUR, verification: result });
      res.json({ status: 'VERIFIED', settlement: verified });
    } catch (e) { next(e); }
  });

  router.post('/crypto/evm-balance', async (req, res, next) => {
    try { res.json(await providers.crypto.evmBalance({ rpcUrl: req.body?.rpcUrl || process.env.NEON_EVM_RPC_URL, address: req.body?.address })); } catch (e) { next(e); }
  });
  router.post('/crypto/solana-balance', async (req, res, next) => {
    try { res.json(await providers.crypto.solanaBalance({ rpcUrl: req.body?.rpcUrl || process.env.NEON_SOLANA_RPC_URL, address: req.body?.address })); } catch (e) { next(e); }
  });

  router.post('/compute/runpod', async (req, res, next) => {
    try {
      if (!governor.status().policy.allowSpending) return res.status(403).json({ error: 'SPENDING_DISABLED_BY_GOVERNOR' });
      res.status(202).json(await providers.runpod.submit(req.body));
    } catch (e) { next(e); }
  });

  router.post('/compute/submit', async (req, res, next) => {
    try {
      if (!governor.status().policy.allowSpending) return res.status(403).json({ error: 'SPENDING_DISABLED_BY_GOVERNOR' });
      res.status(202).json(await providers.compute.submit(req.body));
    } catch (e) { next(e); }
  });
  return router;
}
