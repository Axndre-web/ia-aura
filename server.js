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
    version: "11.8.1"
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
import { economicCapabilitiesStatus, listEconomicCapabilities, observeEconomicSource } from './server/economic-capabilities.js';
import { startAutonomySupervisor, snapshot as autonomySnapshot, runAutonomyCheck } from './server/autonomy-supervisor.js';
import { startLifeAgent, snapshot as lifeAgentSnapshot, lifeAgentTick } from './server/neon-life-agent.js';
import { walletReadiness } from './server/wallet-vault.js';

function adminRequired(req, res, next) {
  const expected = process.env.NEON_ADMIN_TOKEN;
  if (!expected && process.env.NODE_ENV === 'production') return res.status(503).json({ error:'admin_token_not_configured' });
  if (expected && req.get('authorization') !== `Bearer ${expected}`) return res.status(401).json({ error:'unauthorized' });
  next();
}

app.get('/api/economy/status', (_req,res)=>res.json({ok:true,...neonOrbGovernor.snapshot(), economicSources:listEconomicSources()}));
app.get('/api/bridge/:resource', async (req, res) => {
  const allowed = new Set(['health','wallet','telemetry','work','receipts']);
  const resource = String(req.params.resource || '');
  if (!allowed.has(resource)) return res.status(404).json({ ok:false, error:'bridge_resource_not_found' });
  const base = String(process.env.NEON_BRIDGE_URL || 'http://127.0.0.1:8765').replace(/\/$/, '');
  const token = String(process.env.NEON_BRIDGE_TOKEN || '');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const headers = { Accept: 'application/json' };
    if (token) headers['X-Neon-Bridge-Token'] = token;
    const upstream = await fetch(`${base}/${resource}`, { method:'GET', headers, cache:'no-store', signal:controller.signal });
    const text = await upstream.text();
    let payload;
    try { payload = JSON.parse(text); } catch { payload = { ok:false, error:'bridge_invalid_json' }; }
    res.status(upstream.status).set('Cache-Control','no-store').json(payload);
  } catch (error) {
    res.status(error?.name === 'AbortError' ? 504 : 502).json({ ok:false, error:'bridge_unavailable', detail:error?.name === 'AbortError' ? 'timeout' : String(error?.message || error) });
  } finally { clearTimeout(timer); }
});
app.get('/api/autonomy/status', (_req,res)=>res.json({ok:true,...autonomySnapshot()}));
app.get('/api/life/status', async (_req,res)=>res.json({ok:true,...lifeAgentSnapshot(),wallet:await walletReadiness()}));
app.post('/api/life/tick', adminRequired, async (_req,res)=>{ const result=await lifeAgentTick(); res.status(result.ok?200:502).json(result); });
app.post('/api/autonomy/check', adminRequired, async (_req,res)=>{ const result=await runAutonomyCheck({discover:true}); res.status(result.ok?200:502).json(result); });
app.get('/api/economy/sources', (_req,res)=>res.json({ok:true,sources:listEconomicSources()}));
app.get('/api/economy/capabilities', (_req,res)=>res.json(economicCapabilitiesStatus()));
app.get('/api/economy/capabilities/catalog', (_req,res)=>res.json({ok:true,capabilities:listEconomicCapabilities()}));
app.post('/api/economy/capabilities/:sourceId/observe', adminRequired, async (req,res)=>{ try { const result=await observeEconomicSource({sourceId:req.params.sourceId,payload:req.body?.payload||{},timeoutMs:req.body?.timeoutMs}); res.status(result.verification.verified?200:422).json({ok:result.verification.verified,...result}); } catch(error) { res.status(502).json({ok:false,error:String(error?.message||error)}); } });
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


// LIVE RADIO: same-origin, allowlisted streaming proxy.
// The browser never receives arbitrary upstream URLs, preventing an open SSRF proxy.
const RADIO_UPSTREAMS = Object.freeze([
  "https://playerservices.streamtheworld.com/api/livestream-redirect/Los40.mp3",
  "https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_CLASSIC.mp3",
  "https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_DANCE.mp3",
  "https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_URBAN.mp3",
  "https://one.cloudstreaming.eu/proxy/europa/stream",
  "https://kissfm.kissfmradio.cires21.com/kissfm.mp3",
  "https://playerservices.streamtheworld.com/api/livestream-redirect/RADIOLE.mp3",
  "https://rockfm-cope-rrcast.flumotion.com/cope/rockfm-low.mp3",
  "https://playerservices.streamtheworld.com/api/livestream-redirect/RADIOMARCA_NACIONAL.mp3",
  "https://flucast09-h-cloud.flumotion.com/cope/net1.mp3",
  "https://playerservices.streamtheworld.com/api/livestream-redirect/RAC_1.mp3",
  "https://dispatcher.rndfnk.com/crtve/rne1/mad/mp3/high"
]);

app.get("/api/radio/stream/:id", async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const upstream = Number.isInteger(id) && id >= 0 && id < RADIO_UPSTREAMS.length ? RADIO_UPSTREAMS[id] : null;
  if (!upstream) return res.status(404).json({ ok: false, error: "radio_station_not_found" });

  const controller = new AbortController();
  const abortUpstream = () => controller.abort();
  res.on("close", abortUpstream);

  try {
    const upstreamResponse = await fetch(upstream, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "Accept": "audio/mpeg,audio/aac,audio/*;q=0.9,*/*;q=0.1",
        "User-Agent": "NEON-ORB-Radio/11.8"
      }
    });

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      return res.status(upstreamResponse.status || 502).json({
        ok: false,
        error: "radio_upstream_unavailable",
        upstreamStatus: upstreamResponse.status || 0
      });
    }

    res.status(200);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Type", upstreamResponse.headers.get("content-type") || "audio/mpeg");
    const length = upstreamResponse.headers.get("content-length");
    if (length) res.setHeader("Content-Length", length);

    for await (const chunk of upstreamResponse.body) {
      if (res.destroyed) break;
      res.write(chunk);
    }
    if (!res.destroyed) res.end();
  } catch (error) {
    if (!res.headersSent) {
      res.status(error?.name === "AbortError" ? 499 : 502).json({
        ok: false,
        error: error?.name === "AbortError" ? "radio_client_closed" : "radio_upstream_error"
      });
    } else if (!res.destroyed) {
      res.end();
    }
  } finally {
    res.off("close", abortUpstream);
  }
});

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
  startAutonomySupervisor();
startLifeAgent();
});

function shutdown(signal) {
  console.log(`${signal} received; shutting down...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
