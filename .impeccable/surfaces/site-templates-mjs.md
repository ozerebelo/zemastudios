---
version: 1
slug: "site-templates-mjs"
primary_target: "site/templates.mjs"
related_targets: ["site/static/site.css","site/static/site.js"]
---

## Scope

Whole site: home (`/`), project pages (`/trabalho/<slug>/`), 404. Mode: Experience (portfolio). Audience: DOPs, directors, production companies and platforms, agencies. Language: Portuguese only. Brand "zema studios" always lowercase.

User rejected the previous redesign as generic, with weak typography/hierarchy, and work that did not impress (small images). Chosen direction: the IMPECCABLE'S PICK card, "Programa da Cinemateca".

## Direction contract

THESIS: The studio's work printed as a cinematheque programme: every project is a screening entry with its ficha técnica, the frame shown large and uncropped. Refuses the category default of a dark full-bleed reel over a uniform thumbnail grid.

OWN-WORLD: Uncoated programme stock in neutral off-white (#EEEEEB, equal-ish RGB, never cream), black ink #141414 for text and 2px rules, logo navy #102D4F as the second ink for the giant year numerals and links, logo red #E35443 only for marks (active filter, featured mark). One family, Archivo variable: titles in condensed heavy caps (wdth 62-75, wght 700-800), body in normal width 400, credits labels small in 500. Hairline-free: rules are solid 1px/2px black like letterpress programme rules. Frames sit directly on the paper, no shadows, no rounding, no filters.

STORY: A DOP or producer sees in one viewport that this is a grading studio with Prime Video/RTP series, recognises the frames and the people credited, scrolls the programme by year, filters by format, opens an entry, studies the stills at full size, and writes to info@zemastudios.com.

FIRST VIEWPORT: Masthead row: logo left, nav right (trabalho, estúdio, contacto). 2px black rule. A single programme line: what the studio is, and the format index as filters with counts. Then a three-column programme band: giant navy year numeral "2026" (sticky, ~200px condensed) left; the first entry's still at native ratio ~60% of the width; the entry's ficha right (condensed caps title ~44px, subtitle, formato · cliente, Realização / Fotografia / Produção). The next entry's still begins above the fold. Primary action: open an entry (the still and title are the link); contact sits in the nav and at the close.

FORM: Cinemateca programme leaflet / festival catalogue entry; position 1 on the ordered grounded list (IMPECCABLE'S PICK, chosen over the assigned 35 mm contact sheet). seed:e8c3da70bec22fe0

Signature interaction: the sticky year numeral changes as the reader scrolls from one year's entries to the next (numerals slide up, exponential ease-out; instant under reduced motion), and the format filter rewrites the programme, hiding empty years. Project page: the entry becomes a catalogue page, with title at display scale, ficha técnica, then the stills large in sequence at native ratio, a lightbox, trailer on demand, and previous/next screening.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Constraints

- Never alter graded frames: no filters, overlays, text on images, tinted surrounds. Stills uncropped at native ratio on project pages and in programme entries.
- No eyebrows, no section numbers, no taglines, no invented claims.
- CMS-editable content only (Sveltia): every string on the page comes from content/ or the fixed labels.
