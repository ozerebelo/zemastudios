---
version: 1
slug: "site-templates-mjs"
primary_target: "site/templates.mjs"
related_targets: ["site/static/site.css","site/static/site.js"]
---

## Scope

Whole site: home (`/`), project pages (`/trabalho/<slug>/`), 404. Mode: Experience (portfolio). Audience: DOPs, directors, production companies and platforms, agencies. Portuguese only. Brand "zema studios" always lowercase.

History: the owner rejected a dark generic portfolio, a cinematheque-programme world (and its refinement), a ColorChecker / one-sheet / ikebana hand, and a dark safer hand of sketches. After a second study they chose, in their own words, a design that is "aesthetically beautiful and appealing, simple but with depth and detail, not super innovative", dark and cinematic, with visual impact and no conceptual metaphor; references picked from a numbered board: dark full-screen image (Lol Crawley, Studio Fifteen, Okay) combined with a dense dark grid of stills (Blacksmith, Electric Theatre). Stills only, no video loops.

## Direction contract

THESIS: The work, large and true, on a neutral dark ground: a living mosaic of every cover filling the first screen, then a dense grid of every project, then project pages where the stills run big. Refuses metaphors and costumes; the craft is in proportion, type and detail.

OWN-WORLD: Neutral near-black ground #0b0b0b, pure black #000 only as the frame box behind letterboxed stills, hairlines #262626, text #ecebe7, muted #8f8e8a, logo red #e35443 only as a 5px active dot. One family, Host Grotesk (self-hosted variable): display 450-500 with tight tracking (-0.03 to -0.05em), UI 400 at 13-16px. No shadows, no rounding except pill buttons, links underline by a 1px hairline that draws in.

STORY: A DOP or producer lands on a wall of graded covers, one tile at a time turning to another frame of its project, reads the studio statement under it, points at a tile to see its name, scans 27 projects in a grid (hovering a tile previews its other frames), filters by format or switches to a list, opens a project, studies the stills at native ratio, sees the measured palette and credits, moves to the next project, writes to info@zemastudios.com.

FIRST VIEWPORT: Sticky masthead (logo left, bold lowercase nav right) over a mosaic of covers in justified rows at native ratio (letterboxed on black, never cropped), packed so whole rows fill the screen down to a band: the h1 statement "Estúdio de color grading em Lisboa." in 700 at clamp(40px, 5.2vw, 88px) left, the rest of the intro muted right (replaced by the pointed tile's title and format · year). Primary action: every tile links to its project. Chosen by the owner from prototypes as "E" (2026-11-22), over a statement-and-frame split, a filmstrip, a montage reel, a projector of titles and a triptych.

FORM: The category standard executed at the craft of Blacksmith, Electric Theatre, Lol Crawley, Studio Fifteen and Okay (canon, safer register, user-steered). seed: none (pinned) "algo estéticamente bonito e apelativo, simplista mas com profundidade e detalhe"; "escuro / cinematográfico"; references 2, 3, 5, 6, 10.

Signature interaction: tiles cycle through the project's other frames on hover (crossfade, 850ms per frame), and the landing mosaic swaps one tile every 1.1s to another same-ratio frame of its project; both stop under reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Constraints

- Never alter graded frames: no filters, overlays, text over images, tinted surrounds; letterbox instead of crop.
- No eyebrows, taglines or invented claims. Every string from content/ or fixed labels.
