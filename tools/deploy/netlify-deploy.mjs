#!/usr/bin/env node
/**
 * Deploys a built folder to a Netlify site through the API (file-digest method): sends every file's SHA-1,
 * uploads only the files Netlify does not already have, then waits until the deploy is ready.
 *
 *   NETLIFY_AUTH_TOKEN=... node netlify-deploy.mjs <site-id> <dir> [--draft] [--title "..."]
 *
 * Without --draft the deploy goes live on the site's domain. The previous deploy stays in the site's history
 * and can be published again from the Netlify UI (Deploys → the deploy → "Publish deploy").
 * The token is read from NETLIFY_AUTH_TOKEN; where a network proxy injects the Authorization header,
 * any placeholder value works.
 */
import { readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const args = process.argv.slice(2);
const [site, dir] = args;
const draft = args.includes("--draft");
const ti = args.indexOf("--title");
const title = ti >= 0 ? args[ti + 1] : "";
if (!site || !dir) { console.error("uso: node netlify-deploy.mjs <site-id> <dir> [--draft] [--title texto]"); process.exit(1); }
const API = "https://api.netlify.com/api/v1";
const auth = { Authorization: `Bearer ${process.env.NETLIFY_AUTH_TOKEN || "proxy-injected"}` };

async function walk(d, base = d) {
  const out = [];
  for (const e of await readdir(d, { withFileTypes: true })) {
    const full = path.join(d, e.name);
    if (e.isDirectory()) out.push(...(await walk(full, base)));
    else out.push(full);
  }
  return out;
}
async function api(method, url, body, headers = {}) {
  for (let attempt = 1; ; attempt++) {
    const r = await fetch(API + url, { method, headers: { ...auth, ...headers }, body });
    if (r.ok) return r.status === 204 ? null : r.json();
    if (attempt < 4 && (r.status === 429 || r.status >= 500)) { await new Promise((ok) => setTimeout(ok, 2000 * attempt)); continue; }
    throw new Error(`${method} ${url}: ${r.status} ${await r.text()}`);
  }
}

const files = {};
const byHash = {};
for (const f of await walk(path.resolve(dir))) {
  const rel = "/" + path.relative(path.resolve(dir), f).split(path.sep).join("/");
  const sha = createHash("sha1").update(await readFile(f)).digest("hex");
  files[rel] = sha;
  (byHash[sha] ||= []).push({ rel, f });
}
console.log(`${Object.keys(files).length} ficheiros`);
const deploy = await api("POST", `/sites/${site}/deploys`, JSON.stringify({ files, draft, title: title || undefined }), { "Content-Type": "application/json" });
console.log(`deploy ${deploy.id} criado (${draft ? "rascunho" : "produção"}); ${deploy.required.length} ficheiros a enviar`);

// upload what Netlify asks for, a few at a time
const todo = deploy.required.map((sha) => byHash[sha][0]);
let done = 0;
async function worker() {
  while (todo.length) {
    const { rel, f } = todo.shift();
    await api("PUT", `/deploys/${deploy.id}/files${encodeURI(rel)}`, await readFile(f), { "Content-Type": "application/octet-stream" });
    if (++done % 50 === 0) console.log(`  ${done}/${deploy.required.length}`);
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
console.log(`enviados ${done}`);

for (let i = 0; i < 90; i++) {
  const d = await api("GET", `/deploys/${deploy.id}`);
  if (d.state === "ready") { console.log(`pronto: ${d.state}  ${draft ? d.deploy_ssl_url : d.ssl_url || d.url}  (permalink ${d.deploy_ssl_url})`); process.exit(0); }
  if (d.state === "error") { console.error("erro no deploy:", d.error_message); process.exit(1); }
  await new Promise((ok) => setTimeout(ok, 2000));
}
console.error("o deploy não ficou pronto a tempo; ver na Netlify");
process.exit(1);
