#!/usr/bin/env node
/**
 * Proposes stills from episode files for a post: finds every cut, takes one frame from the middle of each shot
 * (away from transitions), measures it, drops the unusable ones, removes near-duplicates and writes numbered
 * contact sheets for a person to choose from. Nothing is exported at full resolution here; see export-stills.mjs.
 *
 *   node select-stills.mjs <folder-or-video> [--out ./candidatos] [--scene 0.18] [--per-episode 60]
 *
 * Needs ffmpeg and ffprobe on PATH, and sharp (npm i sharp) next to this script or in the project.
 * Reads the videos only; writes small JPEG thumbnails, candidates.json and contact sheets to --out.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readdir, mkdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const run = promisify(execFile);
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const input = args.find((a) => !a.startsWith("--") && !args[args.indexOf(a) - 1]?.startsWith("--"));
if (!input) { console.error("uso: node select-stills.mjs <pasta-ou-video> [--out dir] [--scene 0.18] [--per-episode 60]"); process.exit(1); }
const OUT = path.resolve(opt("--out", "./candidatos"));
const SCENE = Number(opt("--scene", "0.18")); // cuts between similarly lit shots score low; the 1 s minimum shot filters flicker
const PER_EP = Number(opt("--per-episode", "60"));
const VIDEO = /\.(mov|mxf|mp4|m4v|mkv)$/i;
const THUMB_W = 480;

async function videos(p) {
  const s = await stat(p);
  if (s.isFile()) return [p];
  const out = [];
  for (const e of await readdir(p, { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    const full = path.join(p, e.name);
    if (e.isDirectory()) out.push(...(await videos(full)));
    else if (VIDEO.test(e.name)) out.push(full);
  }
  return out.sort();
}

async function probe(file) {
  const { stdout } = await run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries",
    "stream=width,height,pix_fmt,color_transfer,color_primaries,color_space,r_frame_rate:format=duration", "-of", "json", file]);
  const j = JSON.parse(stdout);
  return { ...j.streams[0], duration: Number(j.format.duration) };
}

/** Times of every cut, from ffmpeg's scene score on a small decode. */
async function cuts(file) {
  const { stderr } = await run("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-an", "-vf",
    `scale=320:-2,select='gt(scene,${SCENE})',showinfo`, "-f", "null", "-"], { maxBuffer: 1 << 28 });
  return [...stderr.matchAll(/pts_time:([\d.]+)/g)].map((m) => Number(m[1]));
}

async function frameAt(file, t, w = THUMB_W) {
  const { stdout } = await run("ffmpeg", ["-hide_banner", "-v", "error", "-ss", String(t), "-i", file, "-frames:v", "1",
    "-vf", `scale=${w}:-2:in_range=auto:out_range=pc,format=rgb24`, "-f", "image2pipe", "-vcodec", "png", "-"], { encoding: "buffer", maxBuffer: 1 << 26 });
  return stdout;
}

/** Sharpness (variance of the Laplacian), brightness and colourfulness, all on the thumbnail. */
async function measure(png) {
  const g = await sharp(png).greyscale().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = g.info, d = g.data;
  let sum = 0, sum2 = 0, n = 0, luma = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    const lap = 4 * d[i] - d[i - 1] - d[i + 1] - d[i - w] - d[i + w];
    sum += lap; sum2 += lap * lap; n++;
  }
  for (let i = 0; i < d.length; i++) luma += d[i];
  const rgb = await sharp(png).raw().toBuffer();
  let chroma = 0;
  for (let i = 0; i < rgb.length; i += 3) chroma += Math.max(rgb[i], rgb[i + 1], rgb[i + 2]) - Math.min(rgb[i], rgb[i + 1], rgb[i + 2]);
  // 8x8 difference hash, for near-duplicate shots
  const small = await sharp(png).greyscale().resize(9, 8, { fit: "fill" }).raw().toBuffer();
  let hash = "";
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) hash += small[y * 9 + x] > small[y * 9 + x + 1] ? "1" : "0";
  return { sharp: sum2 / n - (sum / n) ** 2, luma: luma / d.length, chroma: chroma / (rgb.length / 3), hash };
}
const hamming = (a, b) => { let c = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) c++; return c; };

async function sheet(items, file) {
  const W = 300, cols = 5, pad = 8, label = 18;
  const tiles = await Promise.all(items.map(async (c) => sharp(c.thumb).resize({ width: W }).toBuffer({ resolveWithObject: true })));
  const rowH = [];
  for (let r = 0; r < Math.ceil(tiles.length / cols); r++) rowH.push(Math.max(...tiles.slice(r * cols, r * cols + cols).map((t) => t.info.height)));
  const comp = []; let y = 0;
  rowH.forEach((h, r) => {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c; if (!tiles[i]) break;
      comp.push({ input: Buffer.from(`<svg width="${W}" height="${label}"><text x="0" y="13" font-family="sans-serif" font-size="13" fill="#bbb">${items[i].id}  ${items[i].episode} ${items[i].tc}</text></svg>`), left: c * (W + pad), top: y });
      comp.push({ input: tiles[i].data, left: c * (W + pad), top: y + label });
    }
    y += h + label + pad;
  });
  await sharp({ create: { width: cols * (W + pad), height: y, channels: 3, background: "#111" } }).composite(comp).jpeg({ quality: 82 }).toFile(file);
}

const tc = (t) => { const s = Math.floor(t); return `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };

const files = await videos(path.resolve(input));
if (!files.length) { console.error("nenhum vídeo encontrado em", input); process.exit(1); }
await mkdir(path.join(OUT, "thumbs"), { recursive: true });
const all = [];
for (const [e, file] of files.entries()) {
  const info = await probe(file);
  const ep = `E${String(e + 1).padStart(2, "0")}`;
  console.log(`${ep} ${path.basename(file)}  ${info.width}x${info.height} ${info.pix_fmt} ${info.color_transfer || "?"}/${info.color_primaries || "?"}  ${tc(info.duration)}`);
  const c = [0, ...(await cuts(file)), info.duration];
  // the middle of each shot longer than a second, skipping the first and last 2% (logos, credits)
  const shots = [];
  for (let i = 0; i < c.length - 1; i++) {
    const a = c[i], b = c[i + 1];
    const mid = a + (b - a) * 0.45;
    if (b - a < 1 || mid < info.duration * 0.02 || mid > info.duration * 0.98) continue;
    shots.push(mid);
  }
  // spread over the episode when there are more shots than we want to look at
  const step = Math.max(1, Math.floor(shots.length / (PER_EP * 2)));
  const picked = shots.filter((_, i) => i % step === 0);
  let kept = 0;
  for (const t of picked) {
    const png = await frameAt(file, t);
    const m = await measure(png);
    if (m.luma < 14 || m.luma > 235 || m.sharp < 18) continue; // black, blown out or soft
    const thumb = path.join(OUT, "thumbs", `${ep}-${tc(t).replace(/:/g, "")}.jpg`);
    await sharp(png).jpeg({ quality: 85 }).toFile(thumb);
    all.push({ episode: ep, file, t, tc: tc(t), thumb, ...m, color: { transfer: info.color_transfer, primaries: info.color_primaries, pix: info.pix_fmt } });
    kept++;
  }
  console.log(`   ${c.length - 2} cortes, ${picked.length} planos vistos, ${kept} candidatos`);
}
// near-duplicates across everything: keep the sharper one
all.sort((a, b) => b.sharp - a.sharp);
const unique = [];
for (const c of all) if (!unique.some((u) => hamming(u.hash, c.hash) <= 6)) unique.push(c);
unique.sort((a, b) => a.episode.localeCompare(b.episode) || a.t - b.t);
unique.forEach((c, i) => (c.id = String(i + 1).padStart(3, "0")));
await writeFile(path.join(OUT, "candidates.json"), JSON.stringify(unique.map(({ thumb, ...c }) => ({ ...c, thumb: path.relative(OUT, thumb) })), null, 1));
for (let i = 0; i < unique.length; i += 40) await sheet(unique.slice(i, i + 40), path.join(OUT, `folha-${String(i / 40 + 1).padStart(2, "0")}.jpg`));
console.log(`${unique.length} candidatos em ${OUT} (folhas de contacto e candidates.json)`);
