#!/usr/bin/env node
/**
 * Prepares an Instagram post and its stories from a project on the site, in the account's house format.
 *
 *   node prepare-post.mjs <slug> --stills 1,2,5,... [--type "TV Show"] [--handles handles.json] [--out dir]
 *
 * --stills   positions in the project's "fotogramas" list (1 = the hero), in carousel order. Up to 10:
 *            the Instagram API publishes carousels of at most 10 items.
 * --type     the caption's second line: TV Show, Documentary, Short Film, Commercial, Music Video.
 * --handles  JSON map from a credited name to its @handle; names without one are written plainly,
 *            as the account already does ("Prod. Company: Advogado do Diabo & Miratecarts").
 *
 * Writes: carrossel/NN.jpg (16:9 kept, 2160 px wide at most, never upscaled), legenda.txt,
 * stories/story-N.jpg (1080x1920, three stills stacked edge to edge, each filling its third),
 * stories/mencoes.txt and a preview sheet. Run from site/ so sharp resolves.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
// sharp is resolved from the folder the script runs in (site/), not from this file's folder.
import { createRequire } from "node:module";
const sharp = createRequire(path.join(process.cwd(), "noop.js"))("sharp");

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const slug = args[0];
if (!slug || !opt("--stills")) { console.error("uso: node prepare-post.mjs <slug> --stills 1,2,3 [--type \"TV Show\"] [--handles f.json] [--out dir]"); process.exit(1); }
const SITE = path.resolve(process.cwd());
const p = JSON.parse(await readFile(path.join(SITE, "content/projetos", slug + ".json"), "utf8"));
const picks = opt("--stills").split(",").map((n) => Number(n.trim()));
if (picks.length > 10) { console.error("o Instagram publica no máximo 10 imagens por carrossel pela API"); process.exit(1); }
const shared = JSON.parse(await readFile(new URL("./handles.json", import.meta.url), "utf8")); // known @handles, from the account's own posts
const handles = { ...shared, ...(opt("--handles") ? JSON.parse(await readFile(opt("--handles"), "utf8")) : {}) };
const TYPE = { "Série": "TV Show", "Documentário": "Documentary", "Curta-metragem": "Short Film", "Longa-metragem": "Feature Film", "Publicidade": "Commercial", "Conteúdo de marca": "Branded Content", "Videoclip": "Music Video", "Entretenimento": "TV Show" };
const type = opt("--type", TYPE[p.formato] || p.formato);
const OUT = path.resolve(opt("--out", `./instagram/${new Date().toISOString().slice(0, 10)}-${slug}`));
await mkdir(path.join(OUT, "carrossel"), { recursive: true });
await mkdir(path.join(OUT, "stories"), { recursive: true });

const who = (s) => (s || "").split(/\s*&\s*/).filter(Boolean).map((n) => handles[n] || n).join(" & ");
const lines = [
  p.subtitulo ? `${p.subtitulo} - ${p.titulo}` : p.titulo,
  `${type} (${p.ano})`,
  p.producao && `Prod. Company: ${who(p.producao)}`,
  p.realizacao && `Director: ${who(p.realizacao)}`,
  p.fotografia ? `DoP: ${who(p.fotografia)}` : "DoP: [por confirmar]",
].filter(Boolean);
await writeFile(path.join(OUT, "legenda.txt"), lines.join("\n") + "\n");

const src = picks.map((n) => {
  const f = p.fotogramas[n - 1];
  if (!f) throw new Error(`não há fotograma ${n} (o projeto tem ${p.fotogramas.length})`);
  return path.join(SITE, f.replace(/^\//, ""));
});

// carousel: the frame as it is, at most 2160 wide, high-quality JPEG
const carousel = [];
for (const [i, f] of src.entries()) {
  const file = path.join(OUT, "carrossel", `${String(i + 1).padStart(2, "0")}.jpg`);
  const info = await sharp(f).resize({ width: 2160, withoutEnlargement: true }).jpeg({ quality: 92, chromaSubsampling: "4:4:4", mozjpeg: true }).toFile(file);
  carousel.push({ file, info });
}

// stories: three stills per story, stacked, each covering a 1080x640 band (sides trimmed a little, as in the archive)
const W = 1080, H = 1920, band = H / 3;
// The hero opens the post and the first story (top third). The other frames are dealt across the stories in
// turn, so each story mixes portraits, exteriors and details instead of three of a kind.
const nStories = Math.min(4, Math.floor(src.length / 3));
const groups = Array.from({ length: nStories }, () => []);
const rest = src.slice(1);
groups[0].push(src[0]);
for (let j = 0, r = 0; j < 3; j++) for (let k = 0; k < nStories; k++) if (!(j === 0 && k === 0)) groups[k].push(rest[r++]);
const stories = [];
for (const group of groups) {
  const parts = await Promise.all(group.map((f, k) =>
    sharp(f).resize(W, Math.round(band * (k + 1)) - Math.round(band * k), { fit: "cover", position: "centre" }).toBuffer()));
  const file = path.join(OUT, "stories", `story-${stories.length + 1}.jpg`);
  await sharp({ create: { width: W, height: H, channels: 3, background: "#000" } })
    .composite(parts.map((input, k) => ({ input, left: 0, top: Math.round(band * k) })))
    .jpeg({ quality: 92, mozjpeg: true }).toFile(file);
  stories.push(file);
}
await writeFile(path.join(OUT, "stories", "mencoes.txt"), "Em todas as stories: @zerebeloo @mariablbraga\n");

// preview: carousel row(s) and the stories side by side
const thumbs = await Promise.all(carousel.map((c) => sharp(c.file).resize({ width: 320 }).toBuffer({ resolveWithObject: true })));
const sthumbs = await Promise.all(stories.map((f) => sharp(f).resize({ width: 240 }).toBuffer({ resolveWithObject: true })));
const cols = 5, gap = 8, th = thumbs[0].info.height, rows = Math.ceil(thumbs.length / cols);
const sh = sthumbs[0]?.info.height || 0;
const width = Math.max(cols * (320 + gap), sthumbs.length * (240 + gap));
const comp = thumbs.map((t, i) => ({ input: t.data, left: (i % cols) * (320 + gap), top: Math.floor(i / cols) * (th + gap) }));
sthumbs.forEach((t, i) => comp.push({ input: t.data, left: i * (240 + gap), top: rows * (th + gap) + 24 }));
await sharp({ create: { width, height: rows * (th + gap) + 24 + sh, channels: 3, background: "#222" } }).composite(comp).jpeg({ quality: 85 }).toFile(path.join(OUT, "pre-visualizacao.jpg"));

console.log(`${OUT}\n  carrossel: ${carousel.length} imagens (${carousel[0].info.width}x${carousel[0].info.height})\n  stories: ${stories.length}\n\n${lines.join("\n")}`);
