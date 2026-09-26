import express from "express";
import compression from "compression";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");
const app = express();

const PORT = Number.parseInt(process.env.PORT ?? "3000", 10);
const HOST = process.env.HOST ?? "0.0.0.0";

app.disable("x-powered-by");

app.use(helmet({
  contentSecurityPolicy: false, // The current UI loads external fonts/streams.
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(express.json({ limit: "256kb" }));

app.get("/healthz", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "neon-player-x",
    version: "11.9.0"
  });
});


import { neonOrbGovernor } from './server/economic-governor.js';
import { discoverConfigured, rankPositiveOpportunities, evaluateOpportunity } from './server/opportunity-engine.js';
import { executeOpportunity } from './server/external-execution.js';
import { calculateConversion, fetchConversionQuote, executeConversion } from './server/asset-router.js';
import { listEconomicSources, validateEconomicObservation } from './server/economic-source-catalog.js';
import { realEconomicRegistry } from './server/real-economic-registry.js';
import { verifyAndRegisterSettlement } from './server/settlement-service.js';
import { autonomousTick } from './server/autonomy-orchestrator.js';

function adminRequired(req, res, next) {
  const expected = process.env.NEON_ADMIN_TOKEN;
  if (!expected && process.env.NODE_ENV === 'production') return res.status(503).json({ error:'admin_token_not_configured' });
  if (expected && req.get('authorization') !== `Bearer ${expected}`) return res.status(401).json({ error:'unauthorized' });
  next();
}

app.get('/api/economy/status', (_req,res)=>res.json({ok:true,...neonOrbGovernor.snapshot(),realAssetRegistry:realEconomicRegistry.snapshot()}));
app.get('/api/economy/assets', (_req,res)=>res.json({ok:true,...realEconomicRegistry.snapshot()}));
app.get('/api/economy/sources', (_req,res)=>res.json({
  ok:true,
  sources:listEconomicSources(),
  configuredFeeds:String(process.env.NEON_OPPORTUNITY_FEEDS||'').split(',').map(s=>s.trim()).filter(Boolean).length
}));
app.post('/api/economy/sources/observe', adminRequired, (req,res)=>{
  const result=validateEconomicObservation(req.body||{});
  res.status(result.ok?200:422).json(result);
});
app.post('/api/economy/pause', adminRequired, (req,res)=>res.json({ok:true,state:neonOrbGovernor.setPaused(true, req.body?.reason||'manual')}));
app.post('/api/economy/resume', adminRequired, (req,res)=>res.json({ok:true,state:neonOrbGovernor.setPaused(false, req.body?.reason||'manual')}));
app.post('/api/economy/discover', adminRequired, async (_req,res)=>{ try { const result=await discoverConfigured(); res.json({ok:true,...result}); } catch(error){ res.status(502).json({ok:false,error:String(error?.message||error)}); } });
app.get('/api/economy/opportunities', (_req,res)=>res.json({ok:true,opportunities:rankPositiveOpportunities()}));
app.post('/api/economy/opportunities/evaluate', adminRequired, (req,res)=>res.json({ok:true,opportunity:evaluateOpportunity(req.body||{})}));
app.post('/api/economy/settlements/verify', adminRequired, (req,res)=>{ try { const result=verifyAndRegisterSettlement(req.body||{}); res.status(result.ok?200:409).json(result); } catch(error){ res.status(422).json({ok:false,error:String(error?.message||error)}); } });
app.post('/api/economy/autonomy/tick', adminRequired, async (_req,res)=>{ try { const result=await autonomousTick(); res.status(result.ok?200:409).json(result); } catch(error){ res.status(502).json({ok:false,error:String(error?.message||error)}); } });
app.post('/api/economy/opportunities/:id/execute', adminRequired, async (req,res)=>{ const op=neonOrbGovernor.snapshot().opportunities.find(x=>x.id===req.params.id); if(!op)return res.status(404).json({ok:false,error:'opportunity_not_found'}); try { const result=await executeOpportunity(op,req.body||{}); res.status(result.ok?200:409).json(result); } catch(error){ res.status(502).json({ok:false,error:String(error?.message||error)}); } });
app.post('/api/economy/conversion/quote', adminRequired, async (req,res)=>{ try { const body=req.body||{}; const quote=body.quoteUrl ? await fetchConversionQuote(body.quoteUrl,body.payload||{}) : body.quote; if(!quote)return res.status(400).json({ok:false,error:'quote_required'}); const calc=calculateConversion({...body,...quote}); res.json({ok:true,conversion:calc,quote}); } catch(error){ res.status(502).json({ok:false,error:String(error?.message||error)}); } });
app.post('/api/economy/conversion/execute', adminRequired, async (req,res)=>{ try { const body=req.body||{}; const calc=calculateConversion(body); const result=await executeConversion(body.executeUrl,{...calc,...(body.payload||{})}); res.status(result.ok?200:409).json({conversion:calc,...result}); } catch(error){ res.status(502).json({ok:false,error:String(error?.message||error)}); } });

app.use(express.static(publicDir, {
  index: "index.html",
  extensions: ["html"],
  fallthrough: true,
  etag: true,
  maxAge: process.env.NODE_ENV === "production" ? "1h" : 0,
  setHeaders(res, filePath) {
    if (/\.(?:png|jpe?g|gif|webp|svg|ico|woff2?)$/i.test(filePath)) {
      res.setHeader("Cache-Control", "public, max-age=604800, immutable");
    }
  }
}));

app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "internal_server_error" });
});

const server = app.listen(PORT, HOST, () => {
  console.log(`NEON PLAYER X listening on http://${HOST}:${PORT}`);
  const intervalMs = Number(process.env.NEON_AUTONOMY_INTERVAL_MS || 0);
  if (intervalMs > 0) {
    setInterval(() => autonomousTick().catch(error => console.error('autonomy_tick_failed', error)), Math.max(5000, intervalMs)).unref();
  }
});

function shutdown(signal) {
  console.log(`${signal} received; shutting down...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
