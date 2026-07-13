// Minimal static file server for the built React SPA (frontend/dist).
//
// Deliberately dependency-free (Node's built-in http/fs/path only) rather
// than pulling in a package like `serve` -- the rest of this project avoids
// adding a dependency when a few dozen lines of built-in-only code does the
// job (see print-agent/src/server.ts for the same philosophy applied to the
// print agent's own HTTP API). This also means the on-premise deployment
// has no extra package to fetch, which matters given C-9's "no internet
// dependency for core operation" requirement.
//
// Binds 0.0.0.0 by default so devices elsewhere on the restaurant's LAN can
// reach it -- see deploy/README.md for the LAN-reachability story.

import * as http from "node:http";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROOT = path.resolve(process.env.STATIC_ROOT ?? path.join(__dirname, "..", "frontend", "dist"));
const PORT = Number(process.env.FRONTEND_PORT ?? 4173);
const HOST = process.env.FRONTEND_HOST ?? "0.0.0.0";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

function contentTypeFor(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

/**
 * Resolves a request URL to a file under ROOT, falling back to index.html
 * for any path that isn't a real file on disk (the standard SPA pattern --
 * this app has no client-side routes today, but this keeps the server
 * correct if that changes, and it costs nothing).
 */
function resolveRequestPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const candidate = path.join(ROOT, normalized === "/" ? "index.html" : normalized);

  // Guard against path traversal escaping ROOT.
  if (!candidate.startsWith(ROOT)) {
    return path.join(ROOT, "index.html");
  }

  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return candidate;
  }

  return path.join(ROOT, "index.html");
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");
    return;
  }

  const filePath = resolveRequestPath(req.url ?? "/");

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }

    res.writeHead(200, { "Content-Type": contentTypeFor(filePath) });
    res.end(req.method === "HEAD" ? undefined : data);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`pos-frontend static server listening on http://${HOST}:${PORT}`);
  console.log(`serving ${ROOT}`);
});
