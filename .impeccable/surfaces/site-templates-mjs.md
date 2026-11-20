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

THESIS: The work, large and true, on a neutral dark ground: a full-width featured frame that changes on its own, then a dense grid of every project, then project pages where the stills run big. Refuses metaphors and costumes; the craft is in proportion, type and detail.

OWN-WORLD: Neutral near-black ground #0b0b0b, pure black #000 only as the frame box behind letterboxed stills, hairlines #262626, text #ecebe7, muted #8f8e8a, logo red #e35443 only as a 5px active dot. One family, Host Grotesk (self-hosted variable): display 450-500 with tight tracking (-0.03 to -0.05em), UI 400 at 13-16px. No shadows, no rounding except pill buttons, links underline by a 1px hairline that draws in.

STORY: A DOP or producer lands on a full-width graded frame with title and credits, sees six featured projects advance, reads one line of what the studio is, scans 27 projects in a grid (hovering a tile previews its other frames), filters by format or switches to a list, opens a project, studies the stills at native ratio, sees the measured palette and credits, moves to the next project, writes to info@zemastudios.com.

FIRST VIEWPORT: Sticky masthead (logo left, lowercase nav right) over a full-width 16:9 frame box (contained, never cropped) holding the first featured still; under it a caption row: counter 01 / 06, title with subtitle in muted, director and DOP right-aligned, prev/next arrows, a 1px progress line. Primary action: the frame and title link to the project.

FORM: The category standard executed at the craft of Blacksmith, Electric Theatre, Lol Crawley, Studio Fifteen and Okay (canon, safer register, user-steered). seed: none (pinned) "algo estéticamente bonito e apelativo, simplista mas com profundidade e detalhe"; "escuro / cinematográfico"; references 2, 3, 5, 6, 10.

Signature interaction: tiles cycle through the project's other frames on hover (crossfade, 850ms per frame), and the hero advances with a drawn progress line; both stop under reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Constraints

- Never alter graded frames: no filters, overlays, text over images, tinted surrounds; letterbox instead of crop.
- No eyebrows, taglines or invented claims. Every string from content/ or fixed labels.
