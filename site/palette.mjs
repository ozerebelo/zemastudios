// Measured colour data for the programme: the aspect ratio of each still and
// the palette of each grade. Both are read from the actual images at build
// time, never typed in, so they stay true when a project's stills change.

const NAMED_RATIOS = [
  ["2.39:1", 2.39],
  ["2.35:1", 2.35],
  ["2:1", 2.0],
  ["1.90:1", 1.9],
  ["1.85:1", 1.85],
  ["16:9", 16 / 9],
  ["3:2", 1.5],
  ["4:3", 4 / 3],
  ["1:1", 1],
  ["4:5", 0.8],
  ["3:4", 3 / 4],
  ["9:16", 9 / 16],
];

/** "2.39:1", "16:9", "9:16"… or the measured value, e.g. "2.15:1". */
export function ratioLabel(width, height) {
  if (!width || !height) return "";
  const r = width / height;
  for (const [label, value] of NAMED_RATIOS) if (Math.abs(r - value) < 0.02) return label;
  return r >= 1 ? `${r.toFixed(2)}:1` : `1:${(1 / r).toFixed(2)}`;
}

function mean(box) {
  const s = box.reduce((a, p) => [a[0] + p[0], a[1] + p[1], a[2] + p[2]], [0, 0, 0]);
  return s.map((v) => v / box.length);
}

/**
 * Median-cut quantisation over raw RGB samples.
 * Returns up to `count` colours with the share of pixels each one stands for,
 * ordered dark to light so the bar reads like a tonal ramp of the grade.
 */
export function palette(samples, count = 6) {
  const px = [];
  for (const buf of samples) for (let i = 0; i + 2 < buf.length; i += 3) px.push([buf[i], buf[i + 1], buf[i + 2]]);
  if (!px.length) return [];
  let boxes = [px];
  while (boxes.length < count) {
    let best = -1;
    let bestScore = 0;
    let bestCh = 0;
    boxes.forEach((box, i) => {
      if (box.length < 2) return;
      for (let ch = 0; ch < 3; ch++) {
        let lo = 255;
        let hi = 0;
        for (const p of box) { if (p[ch] < lo) lo = p[ch]; if (p[ch] > hi) hi = p[ch]; }
        const score = (hi - lo) * Math.sqrt(box.length);
        if (score > bestScore) { bestScore = score; best = i; bestCh = ch; }
      }
    });
    if (best < 0) break;
    const box = boxes[best].sort((a, b) => a[bestCh] - b[bestCh]);
    const mid = box.length >> 1;
    boxes.splice(best, 1, box.slice(0, mid), box.slice(mid));
  }
  // Median cut seeds the colours with equal pixel counts by construction, so a few
  // k-means passes move each centre to where the pixels really are and give each
  // colour its true share of the frame.
  let centres = boxes.filter((b) => b.length).map((b) => mean(b));
  let counts = [];
  for (let pass = 0; pass < 6; pass++) {
    const sums = centres.map(() => [0, 0, 0]);
    counts = centres.map(() => 0);
    for (const p of px) {
      let k = 0;
      let d = Infinity;
      centres.forEach((c, i) => {
        const dd = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2;
        if (dd < d) { d = dd; k = i; }
      });
      sums[k][0] += p[0]; sums[k][1] += p[1]; sums[k][2] += p[2];
      counts[k]++;
    }
    centres = centres.map((c, i) => (counts[i] ? sums[i].map((v) => v / counts[i]) : c));
  }
  const total = px.length;
  return centres
    .map((c, i) => {
      const rgb = c.map((v) => Math.round(v));
      return { hex: "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join(""), share: counts[i] / total, luma: 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2] };
    })
    .filter((c) => c.share > 0.01)
    .sort((a, b) => a.luma - b.luma);
}
