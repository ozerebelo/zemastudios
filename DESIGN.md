---
name: zema studios
description: Portfolio of a Lisbon colour grading studio; the graded frames, large and true, on a neutral dark ground.
colors:
  ground: "#0b0b0b"
  frame-black: "#000000"
  lightbox-black: "#050505"
  hairline: "#262626"
  pill-line: "#3a3a3a"
  text: "#ecebe7"
  text-soft: "#d7d6d2"
  muted: "#8f8e8a"
  dim: "#84837f"
  logo-red: "#e35443"
  logo-cream: "#e6e3d4"
typography:
  display:
    fontFamily: "Host Grotesk, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(44px, 6.6vw, 104px)"
    fontWeight: 500
    lineHeight: 0.95
    letterSpacing: "-0.05em"
  headline:
    fontFamily: "Host Grotesk, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(40px, 5.2vw, 88px)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.045em"
  mail:
    fontFamily: "Host Grotesk, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(34px, 5.4vw, 88px)"
    fontWeight: 450
    lineHeight: 1
    letterSpacing: "-0.045em"
  lede:
    fontFamily: "Host Grotesk, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(22px, 2.1vw, 32px)"
    fontWeight: 400
    lineHeight: 1.28
    letterSpacing: "-0.02em"
  nav:
    fontFamily: "Host Grotesk, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Host Grotesk, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "20px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Host Grotesk, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  ui:
    fontFamily: "Host Grotesk, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Host Grotesk, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
    fontFeature: "tnum"
rounded:
  none: "0px"
  dot: "50%"
  pill: "999px"
spacing:
  pad: "clamp(16px, 3vw, 44px)"
  gutter: "16px"
  row-gap: "40px"
  mast: "76px"
  mast-phone: "64px"
  max: "1760px"
components:
  button-pill-solid:
    backgroundColor: "{colors.text}"
    textColor: "{colors.ground}"
    typography: "{typography.ui}"
    rounded: "{rounded.pill}"
    padding: "14px 22px"
  button-pill-solid-disabled:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.ground}"
    rounded: "{rounded.pill}"
  button-pill-outline:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    typography: "{typography.ui}"
    rounded: "{rounded.pill}"
    padding: "11px 20px"
  filter-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.ui}"
    padding: "3px 0"
  filter-toggle-active:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
  active-dot:
    backgroundColor: "{colors.logo-red}"
    rounded: "{rounded.dot}"
    size: "5px"
  input-hairline:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "{rounded.none}"
    padding: "9px 0"
  tile-frame:
    backgroundColor: "{colors.frame-black}"
    rounded: "{rounded.none}"
  masthead:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.text}"
    typography: "{typography.nav}"
    height: "{spacing.mast}"
  mosaic-cell:
    backgroundColor: "{colors.frame-black}"
    rounded: "{rounded.none}"
    gap: "6px"
---

# Design System: zema studios

## Overview

**Creative North Star: "The Work, Large and True"**

The site is a neutral dark room for graded pictures. It opens on a living mosaic: every project's cover in justified rows that fill the first screen exactly, one tile at a time turning to another frame of its project, above the studio statement set large and bold. Under it, one block on how the studio works, and nothing else: the site is not one page. Every project lives on its own Trabalho page in a dense grid, the studio and contact each have a page, and project pages run the stills big. There is no metaphor and no costume: the craft lives in proportion, one well-tuned grotesk, hairlines, and the discipline of never touching a frame. The register is the category standard of dark post-production portfolios (Blacksmith, Electric Theatre Collective, Lol Crawley, Studio Fifteen, Okay), executed with care rather than reinvented.

Density is high where the work is (a 4-up grid of 27 projects, stills packed edge to edge in a 4-column grid) and generous everywhere else (section padding of 80 to 170px, one statement, one very large email address). Colour is withheld from the interface so it belongs entirely to the frames: the ground is an exactly neutral near-black, the only hue the chrome ever shows is the logo's red, and that only as a 5px dot.

Rejected on record by the owner: a light "cinematheque programme" world, ColorChecker / one-sheet / ikebana conceits, and generic dark portfolio templates. Stills only; no video loops.

**Key Characteristics:**
- Exactly neutral near-black ground; pure black only inside frame boxes.
- Frames shown whole: letterboxed on black, never cropped, filtered, dimmed or overlaid.
- One family, Host Grotesk, tight negative tracking on display sizes, tabular numerals for counts and years.
- Measured palettes are shown as colour alone: bars of proportional swatches, never hex codes or captions.
- Hairline rows (1px #262626) do all structural work; no shadows, no cards, no rounding except pills and the active dot.
- Brand always lowercase: "zema studios". No eyebrows, taglines or invented claims.

## Colors

A colourless chrome: neutral greys stepped from black to warm-white, with the logo red held back to a single dot.

### Primary
- **Logo Red** (logo-red): the only accent. Appears solely as the 5px round dot marking the active filter and view in the work bar, and as the caret colour in fields. It never fills a surface, a button or text.

### Neutral
- **Neutral Ground** (ground): page background, masthead (at 88% opacity), sticky work bar, `theme-color`. R, G and B are equal on purpose: a tinted surround would shift how the grades read.
- **Frame Black** (frame-black): the box behind every letterboxed frame (mosaic cell, grid tile, next-project teaser, video embed). The only place pure black appears, so a frame's own blacks read against true black like a masked print.
- **Lightbox Black** (lightbox-black): the full-screen lightbox ground and backdrop, one step below the page so a still in isolation sits in near-darkness.
- **Hairline** (hairline): every rule: work-bar underline, ficha rows, list rows, field underlines, section tops, footer top.
- **Pill Line** (pill-line): the outline of the play pill (showreel, trailer), and the scrollbar thumb.
- **Warm White** (text): primary text, masthead nav, the statement, the tile named in the band, active controls, focus outline, solid pill fill, selection background.
- **Soft White** (text-soft): footer links at rest, one step under full text so hover can brighten them.
- **Muted Grey** (muted): secondary voice: subtitles, credits, counters, years, labels, ficha terms, the line beside the statement, inactive filters, disabled submit.
- **Logo Cream** (logo-cream): lives only inside `logo.svg`; it is never used as an interface colour.

### Named Rules
**The Neutral Surround Rule.** The ground and every grey are R = G = B (or within one warm step for text). Never tint the ground, a frame surround or a surface toward any hue; the grade must read against neutral.

**The One Dot Rule.** Red appears in the interface only as the 5px active dot (and the text caret): on the active filter and view, and beside the nav link of the current page. Its rarity is the point; it is the logo's i-dot, not a brand fill.

**The Black Box Rule.** Pure black is reserved for the box behind a frame. Interface surfaces use the ground, never #000.

## Typography

**Display Font:** Host Grotesk, self-hosted variable (300 to 800), with system-ui fallback
**Body Font:** Host Grotesk
**Label Font:** Host Grotesk with tabular numerals

**Character:** a single contemporary grotesk carries everything; hierarchy comes from size, weight steps of 400 / 450 / 500 / 700 and progressively tighter tracking as size grows, never from a second family. Bold 700 is reserved for what must hit first: the masthead nav, the statement under the mosaic and the tile name in the band.

### Hierarchy
- **Display** (500, clamp(44px, 6.6vw, 104px), 0.95, -0.05em): project title on the project page; the 404 heading at clamp(40px, 6vw, 90px); the next-project title at clamp(34px, 4.6vw, 72px), -0.045em.
- **Mail** (450, clamp(34px, 5.4vw, 88px), 1, -0.045em): the contact email address, the largest call to action on the site.
- **Headline** (700, clamp(40px, 5.2vw, 88px), 0.92, -0.045em, balanced): the home page's h1, the first sentence of the studio intro, under the mosaic. The rest of the intro sits at the right of the band at 17px in muted (16px on phones, below the h1).
- **Nav** (700, 17px, -0.015em; 15px on phones): the three masthead links, in full warm white.
- **Lede** (400, clamp(22px, 2.1vw, 32px), 1.28, -0.02em, max 26ch): studio paragraphs; second and later paragraphs muted. Project subtitles sit near here at clamp(19px, 1.6vw, 24px).
- **Title** (500, 15.5 to 20px, -0.01em): tile titles 500 at 15.5px; list-view titles 500 at clamp(18px, 1.6vw, 24px).
- **Body** (400, 16px, 1.5): base; form fields and contact text at 17px; project notes at 18px, max 62ch.
- **UI** (400, 15px): nav, filters, views, buttons, ficha values, footer (14px).
- **Label** (400, 12.5 to 14px, tabular): counters (01 / 06), years, ficha terms, still captions (number and ratio), field labels. Never uppercase, never letterspaced.

### Named Rules
**The One Family Rule.** Host Grotesk is the only face. Do not introduce a serif, mono or display face; reach for weight 450/500 and negative tracking instead.

**The Tighter As Larger Rule.** Tracking goes from 0 at UI sizes to -0.01em at titles, -0.015em at the nav and -0.045 to -0.05em at the statement and display sizes.

**The Lowercase Brand Rule.** "zema studios" is lowercase in every string, title, alt text and metadata, and nav labels are lowercase (trabalho, estúdio, contacto).

## Layout

- **Container:** content max 1760px, centred; side padding `pad` = clamp(16px, 3vw, 44px). Masthead is sticky, 76px (64px on phones), full bleed.
- **Pages:** `/` (mosaic, then "O nosso trabalho": studio text, technical sheet and onward links to Trabalho and Contacto), `/trabalho/` (every project: work bar, grid or list, then the palette wall), `/estudio/` (studio text, technical sheet, showreel if set), `/contacto/` (email, details, form), and `/trabalho/<slug>/` per project. Old one-page anchors (`/#trabalho`, `/#estudio`, `/#contacto`, `#work`, `#project/<id>`) redirect to these pages.
- **Page head:** inner pages open on a plain h1 (700, clamp(48px, 6.6vw, 112px), 0.92, -0.05em) with clamp 40 to 96px above and 28 to 56px below; no eyebrow, no intro line.
- **Mosaic (first screen):** exactly one screen tall (100svh minus the masthead, at least 560px): the wall of covers takes all the height the band leaves; the band (statement left, intro line right, bottom-aligned) closes it at the fold. Without JavaScript the section is as tall as its wrapped rows.
- **Work grid:** 4 columns, 16px column gap, 40px row gap; 3 columns at 1280px, 2 at 960px (32px / 12px gaps), 1 at 600px.
- **Two-column bands:** studio, contact and project head use a 1.3 : 1 (project 1.25 : 1) split with a clamp(40px, 7vw, 120px) gap, collapsing to one column at 960px.
- **Project stills:** a 4-column packing grid with 16px / 40px gaps: landscape stills span 2, verticals span 1, and a landscape left alone on the last row spans all 4. An all-vertical set lays out in as many equal columns as stills (max 5); on phones it wraps two per row with an odd last still centred.
- **Rhythm:** section padding steps by clamp: roughly 80 to 170px below sections, 100 to 180px above the next-project teaser.
- **Phones (760px and below):** the project lead runs edge to edge (no side padding, still uncropped); the mosaic keeps its side padding with 4px gaps and the band stacks; the work bar stops being sticky; stills go to 2 columns with landscape frames full width; list view drops the director and DOP columns; lightbox arrows move to the bottom.

## Elevation & Depth

The system is flat. There are no shadows anywhere. Depth comes from three tonal planes (lightbox #050505 below, frame black inside boxes, the ground around them), from hairlines, and from the frames themselves. The masthead is opaque ground: nothing, not even a blurred pane, ever sits over a graded frame.

### Named Rules
**The No Shadow Rule.** No box-shadow, glow or drop shadow on any element. Separate with a 1px hairline or with space.

## Shapes

Square by default: frame boxes, tiles, fields, the palette bar and its swatches all have 0 radius. Two exceptions only: pill buttons (999px) and the 5px active dot (50%). Borders are 1px hairlines, almost always a single bottom or top edge rather than a full outline. Arrows are drawn line SVGs (1.3 stroke, 24 by 12 viewbox), and the play icon is a small filled triangle.

## Components

### Buttons
Two pills, used sparingly.
- **Solid pill** (form submit): warm-white fill, ground text, 500 weight, 14px 22px, with a trailing arrow. Hover widens the gap between label and arrow from 14 to 20px over 0.35s on the house ease. Disabled turns muted with a progress cursor.
- **Outline pill** (Ver showreel, Ver trailer): transparent, 1px pill-line border, play triangle leading, 11px 20px. Hover brightens the border to warm white. Clicking replaces the pill in place with a 16:9 black embed box; nothing autoloads.
- **Quiet controls** (lightbox close/prev/next): borderless, muted, brighten to text on hover.

### Links
- **Studio photo:** in "O nosso trabalho" and on /estudio/, the black-and-white studio photo (two colorists from behind, facing the screens; the owner's own photo, cropped by request to 4:5) sits in the left column at 0.8fr with the text and technical sheet stacked on the right; on one-column layouts it caps at 440px. It is not a graded frame, so it carries no black box. Set from the CMS (`sobre.foto`, `sobre.foto_alt`).
- **Copy voice:** factual, about the craft (owner's choice, 2026-11-22): what the studio does and how, never client or brand names outside each project's own credits. The line beside the home h1 is computed from the published projects ("27 projetos entre 2021 e 2026: 15 séries, …"), with numbers bound to their nouns by non-breaking spaces; hyphenated words never split in paragraphs.
- **Onward links:** at the end of the home block and the studio page, the next places to go ("Ver todo o trabalho", "Falar connosco") at clamp(20px, 1.9vw, 28px), 500, each followed by the line arrow; the gap to the arrow widens from 14 to 20px on hover while the hairline draws in. The home block's heading "O nosso trabalho" is an h2 at clamp(32px, 3.6vw, 56px), 700.
- **Hairline draw-in:** every text link (nav, onward links, footer, ficha, project meta, previous-project, 404, list titles) carries a 1px underline that draws in from the left over 0.35s. The email draws a 2px line over 0.5s. Tile titles use a 1px offset underline on hover.

### Work bar (filters and views)
On `/trabalho/`, under the page title; sticky under the masthead on the ground, with a hairline bottom. Contains format filters with superscript tabular counts, and Grelha / Lista toggles pushed right. Inactive toggles are muted; the active one turns text and gains the 5px red dot before its label. The chosen view is remembered per visitor.

### Tiles (grid view)
- **Frame:** 16:9 frame-black box, image contained (letterboxed), 0 radius.
- **Caption:** title (500) and year (muted, tabular) on one row; subtitle, format and client on the next; director and DOP on a third, all muted. Credits are always visible, never revealed on hover.
- **Hover preview:** on hover-capable devices, the box cycles through the project's other frames every 850ms, each crossfading in over 0.45s on top of the cover; leaving restores the cover.

### List view
A full-width table of hairline rows: title (clamp 18 to 24px, 500) with subtitle muted inline, format, director, DOP, measured ratio, year right-aligned in tabular numerals. Column heads 13px muted.

### Ficha rows (credits and technical sheet)
A definition list in hairline rows: term (14px muted) in a 0.8 fraction, value (15px text) in 1.2, 13px vertical padding, a hairline top on the group and below each row. Used for the studio technical sheet, contact details and every project's credits (Realização, Direção de fotografia, Produção, Agência, Cliente / exibição, Cor, Proporção, Fotogramas).

### Inputs / Fields
- **Style:** transparent, no box, 0 radius, a single 1px hairline underline, 17px text, 9px vertical padding; label above at 13px muted.
- **Focus:** the underline turns warm white; no glow, no outline ring.
- **Placeholder:** a muted grey, used once as a hint for the project field.

### Navigation
Masthead: opaque ground, cream logo left (40px tall, 34px on phones), three lowercase links right in bold (700, 17px, 15px on phones) and full warm white with the hairline draw-in. Each link is a page (`/trabalho/`, `/estudio/`, `/contacto/`); the logo is the way home. Alignment is optical and measured from pixels: the middle of the links, from the top of their tallest letters to the baseline, sits on the middle of the logo's two lines (links raised 2.375px, 1.5px on phones; owner's reading of "centred", 2026-11-22), and the logo is pulled 2.4px left (2px on phones) so its letters, not its SVG box, start on the content edge shared with the mosaic. The link of the current page gains the red dot to its left and `aria-current="page"`; on project pages "trabalho" carries the dot without `aria-current`. The home page shows no dot.

### Footer (the close)
A hairline-topped band: the cream logo large (clamp 180 to 380px wide) on the left; email, telephone and social links on the right at clamp 17 to 21px in soft white. Below a second hairline: "zema studios · color grading · Lisboa" in muted and "Voltar ao topo" with a drawn up-arrow. Outside the contact page it is the only contact.

### The colour of each project (signature)
On `/trabalho/`, after the grid and a hairline: one 14px bar of proportional swatches per project, 6px apart, and nothing else: no visible heading (an h2 for assistive technology only), titles, years or codes. Each bar links to its project, with title, year and palette in its accessible name, and grows to 26px on hover or focus. Data comes from the same build-time measurement as the project palette.

### Living mosaic (signature)
Every project's cover in justified rows, led by the six most recently published (automatic: each project carries a publication date, filled in by the CMS on creation; there is no manual highlight): each cell grows in proportion to its frame's ratio, so a row shares one height and no frame is cropped. site.js picks the row height that leaves the least space under the last whole row (weighted toward three or four covers per line and about four rows on tall screens), and covers that do not fit wait out of the page. Every 1.1s one visible tile (never the one under the pointer, never one of the last four) crossfades over 0.8s to the next frame of its project, chosen only among frames within 3% of the cover's ratio, so a cell never changes shape. Pointing at or focusing a tile shows its name inside the tile, at the owner's request: a solid chip of page ground in the lower-left corner (7px 11px padding, no blur, no gradient, no dimming of the frame) with the title (700, 13px, warm white) over format · year (12px, muted), fading in over 0.2s and gone at rest. It is the single sanctioned exception to "no text over an image", and it only exists while the visitor is pointing. Under reduced motion nothing swaps; with the tab hidden the swaps wait.

### Project page
- **Lead:** the first still at its native size and ratio, centred, capped at viewport height, captioned with its number and measured ratio like every other still; click opens the lightbox.
- **Head:** back link and project counter (01 / 27), display title, subtitle, format · client · year in muted, optional trailer pill; on the right the ficha rows and the measured palette.
- **Measured palette (signature):** a 28px bar of up to six swatches whose widths are each colour's measured share of the stills, ordered dark to light. Colour alone: no hex codes, no caption; the bar carries its description for assistive technology. Values are computed from the images at build time, never typed.
- **Stills:** packed as described in Layout, each with a caption of its number and measured ratio label (16:9, 2.39:1, 9:16...).
- **Next project:** a hairline-topped band with the next project's cover in a black box at that frame's own aspect ratio, "Seguinte" label, display-size title and format line; below a hairline, the previous project on the left and "Todo o trabalho" on the right.

### Lightbox
A full-screen native dialog on lightbox black; the still at its own ratio within the viewport minus margins; "Fechar", line-arrow prev/next and a tabular counter in muted. Arrow keys step, clicking the ground closes.

### 404
Display heading "Página não encontrada", one muted line, and a hairline link back to the work.

### Motion
One ease for drawn and spatial movement, cubic-bezier(0.16, 1, 0.3, 1); plain ease for fades. Lazy frames (tiles, stills, next-project cover) fade in over 0.7s once decoded, so a progressive JPEG never paints in bands; the black box holds their place, and without JavaScript they are simply visible. Under `prefers-reduced-motion: reduce` every transition and animation is removed, the mosaic does not swap frames and the tile preview does not run.

## Do's and Don'ts

### Do:
- **Do** letterbox every frame on frame black (object-fit: contain) when its ratio differs from its box.
- **Do** show stills at native aspect ratio on project pages, including all-vertical sets laid out in their own equal columns.
- **Do** keep the ground exactly neutral (#0b0b0b) and reserve #000 for frame boxes.
- **Do** separate content with 1px hairlines (#262626) and space; use the ficha-row pattern for any credits or facts.
- **Do** keep credits (director, DOP) visible on every grid tile and project page.
- **Do** use the 5px red dot as the sole active-state marker for toggles.
- **Do** use tabular numerals for counters, years and ratios.
- **Do** derive measured values (palette, ratio labels) from the images at build time.
- **Do** write "zema studios" in lowercase everywhere.

### Don't:
- **Don't** crop, filter, dim, tint or overlay a graded frame, and don't put text over an image; the one exception is the mosaic tile's name chip, shown only while pointed at or focused.
- **Don't** bring the whole project grid back to the home page; the home page is the mosaic and one block, and everything else has its own page.
- **Don't** tint the ground or any surround toward a hue, and don't use red as a fill, text colour or button.
- **Don't** add shadows, cards or rounded corners beyond pill buttons and the active dot.
- **Don't** add eyebrows, kickers, taglines, marketing claims, or strings not drawn from content or fixed labels.
- **Don't** introduce a second typeface or uppercase letterspaced labels.
- **Don't** autoplay video or use video loops; stills only, embeds load on click.
- **Don't** hide credits behind hover.
