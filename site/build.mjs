// Builds the static site from content/ into dist/.
//
//   node build.mjs
//
// content/site.json           – studio settings and copy (edited in the CMS)
// content/projetos/*.json     – one file per project; the filename is the URL slug
// media/                      – master images (uploaded through the CMS)
// static/                     – CSS, JS, logo, admin (copied as-is)
//
// Images are resized here, not in the browser and not in the CMS, so the masters
// in the repo stay untouched and every upload gets the same treatment.

import { readFile, writeFile, mkdir, readdir, cp, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { renderHome, renderWork, renderStudio, renderContact, renderProject, renderNotFound, FORMATOS } from "./templates.mjs";
import { ratioLabel, palette } from "./palette.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, "dist");
const WIDTHS = [640, 1280, 1920];

// ---------------------------------------------------------------- content

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (err) {
    throw new Error(`${path.relative(ROOT, file)}: ${err.message}`);
  }
}

function fail(file, msg) {
  throw new Error(`${file}: ${msg}`);
}

async function loadProjects() {
  const dir = path.join(ROOT, "content/projetos");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  const projects = [];
  for (const f of files) {
    const p = await readJson(path.join(dir, f));
    const slug = f.replace(/\.json$/, "");
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail(f, "o nome do ficheiro tem de ser só letras minúsculas, números e hífenes");
    if (!p.titulo?.trim()) fail(f, "falta o título");
    if (!Number.isInteger(Number(p.ano))) fail(f, "o ano tem de ser um número");
    if (!FORMATOS[p.formato]) fail(f, `formato desconhecido "${p.formato}"`);
    p.fotogramas = (p.fotogramas || []).filter(Boolean);
    if (!p.capa && !p.fotogramas.length) fail(f, "precisa de pelo menos uma imagem (capa ou fotogramas)");
    if (p.publicado === false) continue;
    projects.push({ ...p, slug, ano: Number(p.ano), ordem: Number(p.ordem) || 0, capa: p.capa || p.fotogramas[0] });
  }
  // Newest first; within a year, lower "ordem" first.
  projects.sort((a, b) => b.ano - a.ano || a.ordem - b.ordem || a.titulo.localeCompare(b.titulo, "pt"));
  return projects;
}

// ---------------------------------------------------------------- images

const imageCache = new Map();

/**
 * Returns { src, srcset, width, height } for an image path from the content.
 * Local paths (/media/...) get resized variants; full URLs are passed through.
 */
function image(src) {
  if (!imageCache.has(src)) imageCache.set(src, processImage(src));
  return imageCache.get(src);
}

async function processImage(src) {
  if (/^https?:\/\//.test(src)) return { src, srcset: "", width: null, height: null };
  const rel = src.replace(/^\/+/, "");
  const input = path.join(ROOT, rel);
  if (!existsSync(input)) throw new Error(`imagem não encontrada: ${src}`);

  const meta = await sharp(input).metadata();
  const width = meta.autoOrient?.width ?? meta.width;
  const height = meta.autoOrient?.height ?? meta.height;
  const outDir = path.join(OUT, path.dirname(rel));
  await mkdir(outDir, { recursive: true });
  await cp(input, path.join(OUT, rel));

  const { name } = path.parse(rel);
  const variants = [];
  for (const w of WIDTHS.filter((w) => w < width)) {
    const file = `${name}-${w}.jpg`;
    const dest = path.join(outDir, file);
    if (!(await isFresh(dest, input))) {
      await sharp(input)
        .autoOrient()
        .resize({ width: w })
        // Keep any embedded profile (e.g. Display P3) instead of flattening to sRGB,
        // and keep full chroma resolution: 4:2:0 smears saturated edges.
        .keepIccProfile()
        .jpeg({ quality: 84, chromaSubsampling: "4:4:4", mozjpeg: true, progressive: true })
        .toFile(dest);
    }
    variants.push(`/${path.posix.join(path.posix.dirname(rel), file)} ${w}w`);
  }
  variants.push(`/${rel} ${width}w`);
  // A small raw sample of the frame, for the measured palette of the grade.
  const sample = await sharp(input).autoOrient().resize(64, 36, { fit: "fill" }).removeAlpha().toColourspace("srgb").raw().toBuffer();
  return { src: `/${rel}`, srcset: variants.join(", "), width, height, ratio: ratioLabel(width, height), sample };
}

async function isFresh(dest, input) {
  try {
    const [d, i] = await Promise.all([stat(dest), stat(input)]);
    return d.mtimeMs >= i.mtimeMs;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------- build

async function write(rel, html) {
  const file = path.join(OUT, rel);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html);
}

async function build() {
  const started = Date.now();
  const site = await readJson(path.join(ROOT, "content/site.json"));
  site.url = (site.url || "").replace(/\/+$/, "");
  const projects = await loadProjects();
  const redirects = existsSync(path.join(ROOT, "redirects.json")) ? await readJson(path.join(ROOT, "redirects.json")) : {};

  // Keep generated image variants between local builds; everything else is rebuilt.
  if (existsSync(OUT)) {
    for (const entry of await readdir(OUT)) if (entry !== "media") await rm(path.join(OUT, entry), { recursive: true });
  }
  await mkdir(OUT, { recursive: true });
  await cp(path.join(ROOT, "static"), OUT, { recursive: true });

  // Resolve every image up front (in parallel; sharp queues the work on its own thread pool).
  const all = new Set(projects.flatMap((p) => [p.capa, ...p.fotogramas]));
  const resolved = new Map(await Promise.all([...all].map(async (src) => [src, await image(src)])));
  const img = (src) => resolved.get(src);

  // Session order, and the palette and ratios measured from every still.
  projects.forEach((p, i) => {
    p.sessao = i + 1;
    const frames = (p.fotogramas.length ? p.fotogramas : [p.capa]).map(img).filter(Boolean);
    p.paleta = palette(frames.map((f) => f.sample).filter(Boolean), 6);
    // Every distinct ratio among the stills, most common first ("16:9 · 9:16").
    const counts = new Map();
    for (const f of frames) if (f.ratio) counts.set(f.ratio, (counts.get(f.ratio) || 0) + 1);
    p.proporcao = [...counts].sort((a, b) => b[1] - a[1]).map(([r]) => r).join(" · ");
  });
  const ctx = { site, projects, img, redirects };
  await write("index.html", renderHome(ctx));
  await write("trabalho/index.html", renderWork(ctx));
  await write("estudio/index.html", renderStudio(ctx));
  await write("contacto/index.html", renderContact(ctx));
  for (const [i, p] of projects.entries()) {
    const prev = projects[i - 1] || null;
    const next = projects[i + 1] || null;
    await write(`trabalho/${p.slug}/index.html`, renderProject(ctx, p, prev, next));
  }
  await write("404.html", renderNotFound(ctx));

  const urls = ["/", "/trabalho/", "/estudio/", "/contacto/", ...projects.map((p) => `/trabalho/${p.slug}/`)];
  await write(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url><loc>${site.url}${u}</loc></url>`)
      .join("\n")}\n</urlset>\n`,
  );
  await write("robots.txt", `User-agent: *\nDisallow: /admin/\n\nSitemap: ${site.url}/sitemap.xml\n`);

  console.log(`${projects.length} projetos, ${all.size} imagens, ${((Date.now() - started) / 1000).toFixed(1)}s → dist/`);
}

build().catch((err) => {
  console.error(`\nErro no build: ${err.message}\n`);
  process.exit(1);
});
