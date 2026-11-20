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
    fontSize: "clamp(28px, 3.6vw, 56px)"
    fontWeight: 450
    lineHeight: 1.12
    letterSpacing: "-0.03em"
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
    backgroundColor: "rgb(11 11 11 / 0.88)"
    textColor: "{colors.text-soft}"
    height: "{spacing.mast}"
---

# Design System: zema studios

## Overview

**Creative North Star: "The Work, Large and True"**

The site is a neutral dark room for graded pictures. A full-width featured frame changes on its own, then a dense grid of every project, then project pages where the stills run big. There is no metaphor and no costume: the craft lives in proportion, one well-tuned grotesk, hairlines, and the discipline of never touching a frame. The register is the category standard of dark post-production portfolios (Blacksmith, Electric Theatre Collective, Lol Crawley, Studio Fifteen, Okay), executed with care rather than reinvented.

Density is high where the work is (a 4-up grid of 27 projects, stills packed edge to edge in a 4-column grid) and generous everywhere else (section padding of 72 to 170px, a single statement line, one very large email address). Colour is withheld from the interface so it belongs entirely to the frames: the ground is an exactly neutral near-black, the only hue the chrome ever shows is the logo's red, and that only as a 5px dot.

Rejected on record by the owner: a light "cinematheque programme" world, ColorChecker / one-sheet / ikebana conceits, and generic dark portfolio templates. Stills only; no video loops.

**Key Characteristics:**
- Exactly neutral near-black ground; pure black only inside frame boxes.
- Frames shown whole: letterboxed on black, never cropped, filtered, dimmed or overlaid.
- One family, Host Grotesk, tight negative tracking on display sizes, tabular numerals for counts, years and hex codes.
- Hairline rows (1px #262626) do all structural work; no shadows, no cards, no rounding except pills and the active dot.
- Brand always lowercase: "zema studios". No eyebrows, taglines or invented claims.

## Colors

A colourless chrome: neutral greys stepped from black to warm-white, with the logo red held back to a single dot.

### Primary
- **Logo Red** (logo-red): the only accent. Appears solely as the 5px round dot marking the active filter and view in the work bar, and as the caret colour in fields. It never fills a surface, a button or text.

### Neutral
- **Neutral Ground** (ground): page background, masthead (at 88% opacity), sticky work bar, `theme-color`. R, G and B are equal on purpose: a tinted surround would shift how the grades read.
- **Frame Black** (frame-black): the box behind every letterboxed frame (hero slide, grid tile, next-project teaser, video embed). The only place pure black appears, so a frame's own blacks read against true black like a masked print.
- **Lightbox Black** (lightbox-black): the full-screen lightbox ground and backdrop, one step below the page so a still in isolation sits in near-darkness.
- **Hairline** (hairline): every rule: work-bar underline, ficha rows, list rows, field underlines, section tops, footer top, hero progress track.
- **Pill Line** (pill-line): the outline of the play pill (showreel, trailer) and the scrollbar thumb.
- **Warm White** (text): primary text, active controls, focus outline, solid pill fill, hero progress fill, selection background.
- **Soft White** (text-soft): masthead nav and footer links at rest, one step under full text so hover can brighten them.
- **Muted Grey** (muted): secondary voice: subtitles, credits, counters, years, labels, ficha terms, the second sentence of the statement, inactive filters, disabled submit.
- **Logo Cream** (logo-cream): lives only inside `logo.svg`; it is never used as an interface colour.

### Named Rules
**The Neutral Surround Rule.** The ground and every grey are R = G = B (or within one warm step for text). Never tint the ground, a frame surround or a surface toward any hue; the grade must read against neutral.

**The One Dot Rule.** Red appears in the interface only as the 5px active dot (and the text caret). Its rarity is the point; it is the logo's i-dot, not a brand fill.

**The Black Box Rule.** Pure black is reserved for the box behind a frame. Interface surfaces use the ground, never #000.

## Typography

**Display Font:** Host Grotesk, self-hosted variable (300 to 800), with system-ui fallback
**Body Font:** Host Grotesk
**Label Font:** Host Grotesk with tabular numerals

**Character:** a single contemporary grotesk carries everything; hierarchy comes from size, weight steps of 400 / 450 / 500 and progressively tighter tracking as size grows, never from a second family.

### Hierarchy
- **Display** (500, clamp(44px, 6.6vw, 104px), 0.95, -0.05em): project title on the project page; the 404 heading at clamp(40px, 6vw, 90px); the next-project title at clamp(34px, 4.6vw, 72px), -0.045em.
- **Mail** (450, clamp(34px, 5.4vw, 88px), 1, -0.045em): the contact email address, the largest call to action on the site.
- **Headline** (450, clamp(28px, 3.6vw, 56px), 1.12, -0.03em, max 23ch, balanced): the single studio statement under the hero; first sentence in full white, the rest muted.
- **Lede** (400, clamp(22px, 2.1vw, 32px), 1.28, -0.02em, max 26ch): studio paragraphs; second and later paragraphs muted. Project subtitles sit near here at clamp(19px, 1.6vw, 24px).
- **Title** (500, 20px, -0.01em): hero slide title (subtitle inline in muted 400). Tile titles 500 at 15.5px; list-view titles 500 at clamp(18px, 1.6vw, 24px).
- **Body** (400, 16px, 1.5): base; form fields and contact text at 17px; project notes at 18px, max 62ch.
- **UI** (400, 15px): nav, filters, views, buttons, ficha values, footer (14px).
- **Label** (400, 12.5 to 14px, tabular): counters (01 / 06), years, ficha terms, still captions (number and ratio), palette hex codes, field labels. Never uppercase, never letterspaced.

### Named Rules
**The One Family Rule.** Host Grotesk is the only face. Do not introduce a serif, mono or display face; reach for weight 450/500 and negative tracking instead.

**The Tighter As Larger Rule.** Tracking goes from 0 at UI sizes to -0.01em at titles, -0.03em at the statement and -0.045 to -0.05em at display sizes.

**The Lowercase Brand Rule.** "zema studios" is lowercase in every string, title, alt text and metadata, and nav labels are lowercase (trabalho, estúdio, contacto).

## Layout

- **Container:** content max 1760px, centred; side padding `pad` = clamp(16px, 3vw, 44px). Masthead is sticky, 76px (64px on phones), full bleed.
- **Hero:** one 16:9 frame box at full content width, capped at the viewport height minus masthead and caption; a caption row under it (74px counter column, title, credits right-aligned), prev/next arrows at bottom right, and a 1px progress line spanning the content width at the bottom.
- **Work grid:** 4 columns, 16px column gap, 40px row gap; 3 columns at 1280px, 2 at 960px (32px / 12px gaps), 1 at 600px.
- **Two-column bands:** studio, contact and project head use a 1.3 : 1 (project 1.25 : 1) split with a clamp(40px, 7vw, 120px) gap, collapsing to one column at 960px.
- **Project stills:** a 4-column packing grid with 16px / 40px gaps: landscape stills span 2, verticals span 1, and a landscape left alone on the last row spans all 4. An all-vertical set lays out in as many equal columns as stills (max 5); on phones it wraps two per row with an odd last still centred.
- **Rhythm:** section padding steps by clamp: roughly 72 to 150px above the statement, 80 to 170px below sections, 100 to 180px above the next-project teaser.
- **Phones (760px and below):** hero and project lead run edge to edge (no side padding, still uncropped); the hero subtitle hides; the work bar stops being sticky; stills go to 2 columns with landscape frames full width; list view drops the director and DOP columns; lightbox arrows move to the bottom.

## Elevation & Depth

The system is flat. There are no shadows anywhere. Depth comes from three tonal planes (lightbox #050505 below, frame black inside boxes, the ground around them), from hairlines, and from the frames themselves. The one translucent surface is the masthead: the ground at 88% opacity with a 14px backdrop blur (saturation held at 1), so chrome passing over a frame during scroll softens it without tinting it.

### Named Rules
**The No Shadow Rule.** No box-shadow, glow or drop shadow on any element. Separate with a 1px hairline or with space.

## Shapes

Square by default: frame boxes, tiles, fields, the palette bar and its swatches all have 0 radius. Two exceptions only: pill buttons (999px) and the 5px active dot (50%). Borders are 1px hairlines, almost always a single bottom or top edge rather than a full outline. Arrows are drawn line SVGs (1.3 stroke, 24 by 12 viewbox), and the play icon is a small filled triangle.

## Components

### Buttons
Two pills, used sparingly.
- **Solid pill** (form submit): warm-white fill, ground text, 500 weight, 14px 22px, with a trailing arrow. Hover widens the gap between label and arrow from 14 to 20px over 0.35s on the house ease. Disabled turns muted with a progress cursor.
- **Outline pill** (Ver showreel, Ver trailer): transparent, 1px pill-line border, play triangle leading, 11px 20px. Hover brightens the border to warm white. Clicking replaces the pill in place with a 16:9 black embed box; nothing autoloads.
- **Quiet controls** (hero arrows, lightbox close/prev/next): borderless, muted, brighten to text on hover.

### Links
- **Hairline draw-in:** every text link (nav, footer, ficha, project meta, previous-project, 404, list titles) carries a 1px underline that draws in from the left over 0.35s. The email draws a 2px line over 0.5s. Hero and tile titles use a 1px offset underline on hover.

### Work bar (filters and views)
Sticky under the masthead on the ground, with a hairline bottom. Contains the "Trabalho" heading (15px, 500), format filters with superscript tabular counts, and Grelha / Lista toggles pushed right. Inactive toggles are muted; the active one turns text and gains the 5px red dot before its label. The chosen view is remembered per visitor.

### Tiles (grid view)
- **Frame:** 16:9 frame-black box, image contained (letterboxed), 0 radius.
- **Caption:** title (500) and year (muted, tabular) on one row; subtitle, format and client on the next; director and DOP on a third, all muted. Credits are always visible, never revealed on hover.
- **Hover preview:** on hover-capable devices, the box cycles through the project's other frames every 850ms, each crossfading in over 0.45s on top of the cover; leaving restores the cover.

### List view
A full-width table of hairline rows: title (clamp 18 to 24px, 500) with subtitle muted inline, format, director, DOP, year right-aligned in tabular numerals. Column heads 13px muted.

### Ficha rows (credits and technical sheet)
A definition list in hairline rows: term (14px muted) in a 0.8 fraction, value (15px text) in 1.2, 13px vertical padding, a hairline top on the group and below each row. Used for the studio technical sheet, contact details and every project's credits (Realização, Direção de fotografia, Produção, Agência, Cliente / exibição, Cor, Proporção, Fotogramas).

### Inputs / Fields
- **Style:** transparent, no box, 0 radius, a single 1px hairline underline, 17px text, 9px vertical padding; label above at 13px muted.
- **Focus:** the underline turns warm white; no glow, no outline ring.
- **Placeholder:** a muted grey, used once as a hint for the project field.

### Navigation
Masthead: cream logo left (40px tall, 34px on phones), three lowercase links right at 15px in soft white with the hairline draw-in. Footer: small logo, "zema studios · color grading · Lisboa", email and social links right, hairline top.

### Hero carousel (signature)
Up to six featured projects stacked in one grid cell; the active slide fades in over 1.1s. A 1px progress line draws across the track over 6.5s, then advances. Hover or focus pauses; stepping with the arrows hands control to the visitor permanently; the tab being hidden stops it. Only the active slide is focusable.

### Project page
- **Lead:** the first still at its native size and ratio, centred, capped at viewport height; click opens the lightbox.
- **Head:** back link and project counter (01 / 27), display title, subtitle, format · client · year in muted, optional trailer pill; on the right the ficha rows and the measured palette.
- **Measured palette (signature):** a 6px bar of up to six swatches whose widths are each colour's measured share of the stills, ordered dark to light, with a caption "Paleta da grade, medida em N fotogramas" and the hex codes behind 8px squares. Values are computed from the images at build time, never typed.
- **Stills:** packed as described in Layout, each with a caption of its number and measured ratio label (16:9, 2.39:1, 9:16...).
- **Next project:** a hairline-topped band with the next project's cover in a black box at that frame's own aspect ratio, "Seguinte" label, display-size title and format line; a quiet previous-project link below.

### Lightbox
A full-screen native dialog on lightbox black; the still at its own ratio within the viewport minus margins; "Fechar", line-arrow prev/next and a tabular counter in muted. Arrow keys step, clicking the ground closes.

### 404
Display heading "Página não encontrada", one muted line, and a hairline link back to the work.

### Motion
One ease for drawn and spatial movement, cubic-bezier(0.16, 1, 0.3, 1); plain ease for fades. Under `prefers-reduced-motion: reduce` every transition and animation is removed, the hero does not advance and the tile preview does not run.

## Do's and Don'ts

### Do:
- **Do** letterbox every frame on frame black (object-fit: contain) when its ratio differs from its box.
- **Do** show stills at native aspect ratio on project pages, including all-vertical sets laid out in their own equal columns.
- **Do** keep the ground exactly neutral (#0b0b0b) and reserve #000 for frame boxes.
- **Do** separate content with 1px hairlines (#262626) and space; use the ficha-row pattern for any credits or facts.
- **Do** keep credits (director, DOP) visible on every tile and slide.
- **Do** use the 5px red dot as the sole active-state marker for toggles.
- **Do** use tabular numerals for counters, years, ratios and hex codes.
- **Do** derive measured values (palette, ratio labels) from the images at build time.
- **Do** write "zema studios" in lowercase everywhere.

### Don't:
- **Don't** crop, filter, dim, tint or overlay a graded frame, and don't put text over an image.
- **Don't** tint the ground or any surround toward a hue, and don't use red as a fill, text colour or button.
- **Don't** add shadows, cards or rounded corners beyond pill buttons and the active dot.
- **Don't** add eyebrows, kickers, taglines, marketing claims, or strings not drawn from content or fixed labels.
- **Don't** introduce a second typeface or uppercase letterspaced labels.
- **Don't** autoplay video or use video loops; stills only, embeds load on click.
- **Don't** hide credits behind hover.
