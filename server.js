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
    version: "11.8.0"
  });
});


import { neonOrbGovernor } from './server/economic-governor.js';
import { discoverConfigured, rankPositiveOpportunities, evaluateOpportunity } from './server/opportunity-engine.js';
import { executeOpportunity, verifySettlement } from './server/external-execution.js';
import { realEconomicRegistry } from './server/real-economic-registry.js';
import { calculateCurrencyConversion, fetchCurrencyQuote, executeCurrencyConversion } from './server/currency-converter.js';
import { calculateConversion, fetchConversionQuote, executeConversion } from './server/asset-router.js';
import { listEconomicSources, verifySourceEvidence } from './server/economic-source-registry.js';
import { fetchSourceEvidence } from './server/external-source-adapter.js';

function adminRequired(req, res, next) {
  const expected = process.env.NEON_ADMIN_TOKEN;
  if (!expected && process.env.NODE_ENV === 'production') return res.status(503).json({ error:'admin_token_not_configured' });
  if (expected && req.get('authorization') !== `Bearer ${expected}`) return res.status(401).json({ error:'unauthorized' });
  next();
}

app.get('/api/economy/status', (_req,res)=>res.json({ok:true,...neonOrbGovernor.snapshot(), economicSources:listEconomicSources()}));
app.get('/api/economy/sources', (_req,res)=>res.json({ok:true,sources:listEconomicSources()}));
app.post('/api/economy/sources/verify', adminRequired, (req,res)=>{
  try {
    const result=verifySourceEvidence({sourceId:req.body?.sourceId,evidence:req.body?.evidence||{}});
    res.status(result.verified?200:422).json({ok:result.verified,...result});
  } catch(error) { res.status(422).json({ok:false,error:String(error?.message||error)}); }
});
app.post('/api/economy/sources/fetch', adminRequired, async (req,res)=>{
  try {
    const result=await fetchSourceEvidence({sourceId:req.body?.sourceId,url:req.body?.url,payload:req.body?.payload||{}});
    res.status(result.verification.verified?200:422).json({ok:result.verification.verified,...result});
  } catch(error) { res.status(502).json({ok:false,error:String(error?.message||error)}); }
});
app.post('/api/economy/pause', adminRequired, (req,res)=>res.json({ok:true,state:neonOrbGovernor.setPaused(true, req.body?.reason||'manual')}));
app.post('/api/economy/resume', adminRequired, (req,res)=>res.json({ok:true,state:neonOrbGovernor.setPaused(false, req.body?.reason||'manual')}));
app.post('/api/economy/discover', adminRequired, async (_req,res)=>{ try { const result=await discoverConfigured(); res.json({ok:true,...result}); } catch(error){ res.status(502).json({ok:false,error:String(error?.message||error)}); } });
app.get('/api/economy/opportunities', (_req,res)=>res.json({ok:true,opportunities:rankPositiveOpportunities()}));
app.get('/api/economy/assets', (_req,res)=>res.json({ok:true,...realEconomicRegistry.snapshot()}));
app.post('/api/economy/opportunities/evaluate', adminRequired, (req,res)=>res.json({ok:true,opportunity:evaluateOpportunity(req.body||{})}));
app.post('/api/economy/opportunities/:id/execute', adminRequired, async (req,res)=>{ const op=neonOrbGovernor.snapshot().opportunities.find(x=>x.id===req.params.id); if(!op)return res.status(404).json({ok:false,error:'opportunity_not_found'}); try { const result=await executeOpportunity(op,req.body||{}); res.status(result.ok?200:409).json(result); } catch(error){ res.status(502).json({ok:false,error:String(error?.message||error)}); } });
app.post('/api/economy/opportunities/:id/settle', adminRequired, async (req,res)=>{ const op=neonOrbGovernor.snapshot().opportunities.find(x=>x.id===req.params.id); if(!op)return res.status(404).json({ok:false,error:'opportunity_not_found'}); try { const result=await verifySettlement(op,req.body||{}); res.status(result.ok?200:409).json(result); } catch(error){ res.status(502).json({ok:false,error:String(error?.message||error)}); } });
app.post('/api/economy/conversion/quote', adminRequired, async (req,res)=>{ try { const body=req.body||{}; const quote=body.quoteUrl ? await fetchConversionQuote(body.quoteUrl,body.payload||{}) : body.quote; if(!quote)return res.status(400).json({ok:false,error:'quote_required'}); const calc=calculateConversion({...body,...quote}); res.json({ok:true,conversion:calc,quote}); } catch(error){ res.status(502).json({ok:false,error:String(error?.message||error)}); } });
app.post('/api/economy/conversion/execute', adminRequired, async (req,res)=>{ try { const body=req.body||{}; const calc=calculateConversion(body); const result=await executeConversion(body.executeUrl,{...calc,...(body.payload||{})}); res.status(result.ok?200:409).json({conversion:calc,...result}); } catch(error){ res.status(502).json({ok:false,error:String(error?.message||error)}); } });
app.post('/api/economy/currency/quote', adminRequired, async (req,res)=>{ try { const body=req.body||{}; const quote=body.quoteUrl ? await fetchCurrencyQuote(body.quoteUrl,body.payload||{}) : body.quote; if(!quote)return res.status(400).json({ok:false,error:'quote_required'}); res.json({ok:true,conversion:calculateCurrencyConversion({...body,...quote}),quote}); } catch(error){ res.status(502).json({ok:false,error:String(error?.message||error)}); } });
app.post('/api/economy/currency/execute', adminRequired, async (req,res)=>{ try { const body=req.body||{}; const result=await executeCurrencyConversion(body.executeUrl,body,body.payload||{}); res.status(result.ok?200:409).json(result); } catch(error){ res.status(502).json({ok:false,error:String(error?.message||error)}); } });

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
});

function shutdown(signal) {
  console.log(`${signal} received; shutting down...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
