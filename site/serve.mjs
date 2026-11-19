// Tiny static server for previewing dist/ locally: node serve.mjs [port]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "dist");
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml",
  ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".xml": "application/xml", ".txt": "text/plain", ".yml": "text/yaml" };
const port = Number(process.argv[2]) || 8080;

createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) return res.writeHead(403).end();
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404, { "content-type": TYPES[".html"] });
    res.end(await readFile(path.join(ROOT, "404.html")).catch(() => "404"));
  }
}).listen(port, () => console.log(`http://localhost:${port}`));
