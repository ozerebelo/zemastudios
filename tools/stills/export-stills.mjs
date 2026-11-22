#!/usr/bin/env node
/**
 * Exports the chosen candidates at the source's full resolution, as the site and Instagram take them.
 *
 *   node export-stills.mjs <candidatos-dir> <id,id,...> --name portugal-criminal [--out ./stills]
 *
 * Colour: an SDR Rec.709 source is converted from video range to full range without touching the grade
 * (Rec.709 code values written into an untagged JPEG, as a grading suite exports stills). An HDR source
 * (PQ or HLG) is tone-mapped to SDR Rec.709 first and reported, since the grade's SDR trim is the better
 * source for that: export from the SDR deliverable when there is one.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const run = promisify(execFile);
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const [dir, ids] = args;
const NAME = opt("--name", "still");
const OUT = path.resolve(opt("--out", "./stills"));
if (!dir || !ids) { console.error("uso: node export-stills.mjs <candidatos-dir> <id,id,...> --name <slug> [--out dir]"); process.exit(1); }

const cands = JSON.parse(await readFile(path.join(dir, "candidates.json"), "utf8"));
const wanted = ids.split(",").map((s) => s.trim().padStart(3, "0"));
await mkdir(OUT, { recursive: true });

for (const [k, id] of wanted.entries()) {
  const c = cands.find((x) => x.id === id);
  if (!c) { console.error("candidato inexistente:", id); continue; }
  const hdr = ["smpte2084", "arib-std-b67"].includes(c.color.transfer);
  const vf = hdr
    ? "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=pc,format=rgb24"
    : "scale=in_range=auto:out_range=pc,format=rgb24";
  const { stdout } = await run("ffmpeg", ["-hide_banner", "-v", "error", "-ss", String(c.t), "-i", c.file, "-frames:v", "1", "-vf", vf,
    "-f", "image2pipe", "-vcodec", "png", "-"], { encoding: "buffer", maxBuffer: 1 << 30 });
  const file = path.join(OUT, `${NAME}-${String(k + 1).padStart(2, "0")}.jpg`);
  const info = await sharp(stdout).jpeg({ quality: 95, chromaSubsampling: "4:4:4", mozjpeg: true }).toFile(file);
  console.log(`${path.basename(file)}  ${info.width}x${info.height}  ${c.episode} ${c.tc}${hdr ? "  (HDR convertido para SDR)" : ""}`);
}
