#!/usr/bin/env node
/**
 * Publishes a post prepared by prepare-post.mjs on @zemastudios.grading through the Instagram Graph API
 * (graph.facebook.com, token from a Facebook Login for a Page linked to the Instagram professional account).
 *
 *   node publish.mjs <prepared-dir> --base-url https://zemastudios.com/ig/<folder>/ [--what post|stories|all] [--check]
 *
 * The images must already be reachable at --base-url (carrossel/NN.jpg, stories/story-N.jpg): Instagram
 * downloads them from there. --check only resolves the account and verifies every URL, publishing nothing.
 * Stories carry the mentions in stories/mencoes.txt as user tags; if the API refuses them, no story is published.
 * Token: Authorization header from NETLIFY-style proxy injection or META_TOKEN.
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const dir = args[0];
const base = opt("--base-url");
const what = opt("--what", "all");
const check = args.includes("--check");
if (!dir || !base) { console.error("uso: node publish.mjs <pasta> --base-url https://…/ [--what post|stories|all] [--check]"); process.exit(1); }
const G = "https://graph.facebook.com";
const auth = { Authorization: `Bearer ${process.env.META_TOKEN || "proxy-injected"}` };

async function graph(method, url, params) {
  const body = params ? new URLSearchParams(Object.entries(params).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) : undefined;
  const r = await fetch(G + url, { method, headers: auth, body });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(`${method} ${url.split("?")[0]}: ${r.status} ${JSON.stringify(j.error || j)}`);
  return j;
}
async function ready(id) {
  for (let i = 0; i < 60; i++) {
    const s = await graph("GET", `/${id}?fields=status_code,status`);
    if (s.status_code === "FINISHED") return;
    if (s.status_code === "ERROR" || s.status_code === "EXPIRED") throw new Error(`contentor ${id}: ${s.status_code} ${s.status || ""}`);
    await new Promise((ok) => setTimeout(ok, 3000));
  }
  throw new Error(`contentor ${id} não ficou pronto`);
}

// the Instagram professional account linked to one of the token's Pages
const pages = await graph("GET", "/me/accounts?fields=name,instagram_business_account{id,username}");
const ig = pages.data.map((p) => p.instagram_business_account).find((a) => a && a.username === "zemastudios.grading");
if (!ig) throw new Error("a conta zemastudios.grading não está ligada a nenhuma Página deste token: " + JSON.stringify(pages.data.map((p) => [p.name, p.instagram_business_account?.username])));
console.log(`conta: @${ig.username} (${ig.id})`);

const caption = (await readFile(path.join(dir, "legenda.txt"), "utf8")).trim();
const carousel = (await readdir(path.join(dir, "carrossel"))).filter((f) => f.endsWith(".jpg")).sort();
const stories = (await readdir(path.join(dir, "stories"))).filter((f) => f.endsWith(".jpg")).sort();
const mentions = ((await readFile(path.join(dir, "stories", "mencoes.txt"), "utf8")).match(/@[\w.]+/g) || []).map((m) => m.slice(1));
const url = (f) => new URL(f, base).href;

// The cloud session's proxy may not allow the site's own host; then the images can't be checked from here
// (verify them through the Netlify API instead) and Instagram, which fetches them itself, reports any missing one.
for (const f of [...carousel.map((c) => "carrossel/" + c), ...stories.map((s) => "stories/" + s)]) {
  let r;
  try { r = await fetch(url(f), { method: "HEAD" }); } catch (e) { console.warn(`aviso: não foi possível verificar ${url(f)} daqui (${e.cause?.message || e.message})`); continue; }
  if (r.status === 403 && /agent proxy/i.test(r.statusText)) { console.warn(`aviso: o proxy desta sessão não deixa verificar ${url(f)}`); continue; }
  if (!r.ok || !(r.headers.get("content-type") || "").startsWith("image/jpeg")) throw new Error(`imagem não acessível: ${url(f)} (${r.status})`);
}
console.log(`${carousel.length} imagens do carrossel e ${stories.length} stories acessíveis; menções: ${mentions.map((m) => "@" + m).join(" ")}`);
if (check) process.exit(0);

if (what === "post" || what === "all") {
  if (carousel.length > 10) throw new Error("máximo de 10 imagens por carrossel");
  const children = [];
  for (const c of carousel) children.push((await graph("POST", `/${ig.id}/media`, { image_url: url("carrossel/" + c), is_carousel_item: "true" })).id);
  for (const id of children) await ready(id);
  const box = await graph("POST", `/${ig.id}/media`, { media_type: "CAROUSEL", children: children.join(","), caption });
  await ready(box.id);
  const post = await graph("POST", `/${ig.id}/media_publish`, { creation_id: box.id });
  const link = await graph("GET", `/${post.id}?fields=permalink`);
  console.log(`post publicado: ${link.permalink}`);
}

if (what === "stories" || what === "all") {
  // create every story first, with the mentions as user tags; publish only if all of them were accepted
  const boxes = [];
  for (const s of stories) {
    const box = await graph("POST", `/${ig.id}/media`, { media_type: "STORIES", image_url: url("stories/" + s), user_tags: mentions.map((username) => ({ username })) });
    boxes.push(box.id);
  }
  for (const id of boxes) await ready(id);
  for (const id of boxes) {
    const st = await graph("POST", `/${ig.id}/media_publish`, { creation_id: id });
    console.log(`story publicada: ${st.id}`);
  }
}
