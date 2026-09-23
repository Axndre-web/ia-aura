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

app.get("/healthz", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "neon-player-x",
    version: "11.7.1"
  });
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
});

function shutdown(signal) {
  console.log(`${signal} received; shutting down...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
