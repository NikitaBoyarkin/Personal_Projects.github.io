import { existsSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = join(import.meta.dir, "..", "dist");
const BASE = process.env.BASE_PATH ?? "/Personal_Projects.github.io";
const PORT = Number(process.env.PORT ?? "4321");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".pdf": "application/pdf",
};

function resolvePath(urlPath) {
  let p = decodeURIComponent(urlPath);
  if (BASE && p.startsWith(BASE)) {
    p = p.slice(BASE.length);
  }
  if (!p.startsWith("/")) p = "/" + p;
  if (p.endsWith("/")) p += "index.html";
  const filePath = join(ROOT, p);
  if (!filePath.startsWith(ROOT)) return null;
  if (!existsSync(filePath)) return null;
  return filePath;
}

const server = Bun.serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/__health") {
      return Response.json({ ok: true, root: ROOT });
    }
    const filePath = resolvePath(url.pathname);
    if (!filePath) return new Response("Not found", { status: 404 });
    const file = Bun.file(filePath);
    const type = MIME[extname(filePath).toLowerCase()] ?? file.type;
    return new Response(file, { headers: type ? { "content-type": type } : {} });
  },
});

console.log(`serving ${ROOT} at http://localhost:${server.port}${BASE}/`);