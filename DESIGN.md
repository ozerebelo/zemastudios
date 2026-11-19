---
name: zema studios
description: Portfolio of a Lisbon colour grading studio, set as a cinematheque programme.
colors:
  paper: "#eeeeeb"
  ink: "#141414"
  navy: "#102d4f"
  red: "#e35443"
  muted: "#5a5a55"
  screen: "#101010"
  screen-ink: "#c9c9c6"
  screen-muted: "#9a9a96"
typography:
  display:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(64px, 10.4vw, 168px)"
    fontWeight: 800
    lineHeight: 0.8
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 62"
  headline:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(56px, 8vw, 96px)"
    fontWeight: 800
    lineHeight: 0.86
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 62"
  headline-catalogue:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(42px, 6.4vw, 96px)"
    fontWeight: 800
    lineHeight: 0.86
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 68"
  headline-mail:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(34px, 4.7vw, 76px)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 68"
  title:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(30px, 3.1vw, 50px)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 68"
  lead:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(19px, 1.6vw, 23px)"
    fontWeight: 450
    lineHeight: 1.3
  subtitle:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.32
  body:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "'lnum'"
    fontVariation: "'wdth' 100"
  credit:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.35
  label:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.35
rounded:
  none: "0px"
spacing:
  still-gap: "14px"
  pad: "clamp(16px, 3.5vw, 48px)"
  gap: "clamp(20px, 2.6vw, 40px)"
  year-column: "clamp(150px, 16vw, 250px)"
  section-end: "clamp(56px, 8vw, 112px)"
  max: "1680px"
components:
  nav-link:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  filter:
    textColor: "{colors.muted}"
    padding: "4px 0"
  filter-active:
    textColor: "{colors.ink}"
  year-numeral:
    textColor: "{colors.navy}"
    typography: "{typography.display}"
  entry-title:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
  ficha-label:
    textColor: "{colors.muted}"
    typography: "{typography.label}"
  ficha-value:
    textColor: "{colors.ink}"
    typography: "{typography.credit}"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "12px 22px 11px"
  button-primary-hover:
    backgroundColor: "{colors.navy}"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px 20px 11px"
  button-outline-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  input-field:
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "7px 0"
  coupon:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "22px 24px 24px"
  lightbox:
    backgroundColor: "{colors.screen}"
    textColor: "{colors.screen-ink}"
---

# Design System: zema studios

## Overview

**Creative North Star: "The Cinematheque Programme"**

The site is a printed screening programme on uncoated, neutral stock. Every project is an entry: a large frame at its native ratio, a condensed heavy title in caps, and a ficha técnica naming who directed, shot and produced it. Projects run under giant navy year numerals that hold their place while the reader scrolls through that year. Hierarchy comes from width and weight inside one type family and from solid black rules, never from colour fields, cards or shadows.

The frames carry all the colour. The paper is neutral so it cannot tint how a grade reads; black ink and logo navy carry text and structure; logo red appears only as a thin underline mark. Density is generous but not airy: credits are always visible, the frame is the largest thing in every row, and nothing hides behind a hover.

**Key Characteristics:**
- Neutral off-white paper, black ink, navy as the second ink, red only as a mark.
- One variable family, Archivo: condensed 800 caps for display, normal-width 400 for reading, 500 for labels.
- Solid 1px and 2px black rules divide everything; zero radius, zero shadow.
- Frames sit directly on the paper, uncropped and unfiltered.
- Lowercase "zema studios", Portuguese labels, plain factual copy.

## Colors

Two inks on neutral paper, with a red mark and one dark viewing room.

### Primary
- **Logo Navy** (`navy`): the second ink. Year numerals (home and catalogue page), the contact email at display size, text selection, focus outlines, the focused-field underline and the hover fill of the submit button.

### Secondary
- **Logo Red** (`red`): a mark, never a fill and never body text. The 2–4px underline under the active filter or view, and under links and titles on hover.

### Neutral
- **Programme Paper** (`paper`): every page background, and the browser theme colour. Off-white with R, G and B within 3 of each other, never cream.
- **Press Black** (`ink`): text, every rule, the coupon border and the submit button fill.
- **Grey Credit** (`muted`): ficha and table labels, the format line, inactive filters, the folio and pager labels, placeholder text, the disabled button.
- **Viewing Room** (`screen`): the lightbox surface and backdrop, with `screen-ink` for its controls and `screen-muted` for the frame counter. Video embeds sit on pure black (#000) while they load.

### Named Rules
**The Neutral Surround Rule.** Any surface a frame sits on stays neutral: `paper` on the page, `screen` in the lightbox. No cream, no tint and no brand colour behind a still.

**The Red Mark Rule.** Red appears only as an underline mark: active filter/view, or hover. It never fills a shape, never sets a word and never appears near a frame as decoration.

## Typography

**Display Font:** Archivo variable (self-hosted woff2, `wdth` 62–125, `wght` 100–900), with Arial Narrow as the fallback
**Body Font:** Archivo at normal width (`wdth` 100), with lining numerals
**Label/Mono Font:** none; labels are Archivo 500

**Character:** One family set two ways, like a programme printed with a single typeface: condensed extra-bold caps that call the screenings, and a plain grotesque that lists the credits.

### Hierarchy
- **Display** (800, `wdth` 62, clamp 64–168px, lh 0.8, navy): the year numeral, sticky at the top of its year on the home page. The same style is used for the year at the head of the catalogue page and for "404".
- **Headline** (800, `wdth` 62, clamp 56–96px, lh 0.86, caps): section heads, Estúdio and Contacto.
- **Headline, catalogue** (800, `wdth` 68, clamp 42–96px, lh 0.86, caps, balanced): the project title on its own page, and the 404 heading (40–88px).
- **Headline, mail** (800, `wdth` 68, clamp 34–76px, navy): the contact email address, breaking at the @.
- **Title** (800, `wdth` 68, clamp 30–50px, lh 0.92, caps, balanced): entry titles. The same voice at smaller sizes sets the credits-index head (28–38px), the coupon title (30px), the pager titles (26–40px), the index-table titles (22px) and the button labels (20–22px).
- **Lead** (450, clamp 19–23px, lh 1.3, max 46ch): the single programme line under the masthead. Studio paragraphs use the same weight at 20–25px, max 36ch.
- **Subtitle** (500, 18px, lh 1.32): episode or work subtitle under a title.
- **Body** (400, 17px, lh 1.5): running text, nav, notes (18px, max 62ch).
- **Credit** (400, 16px, lh 1.35): ficha values and collaborator names.
- **Label** (500, 14px, muted, sentence case): ficha labels (Realização, Fotografia, Produção…), table heads (13px), form labels. The format line is 15px muted at 400.

### Named Rules
**The Two Widths Rule.** Display text is condensed (`wdth` 62–68) heavy caps; everything read in sentences is normal width. Nothing is set in between, and no second family is introduced.

**The Sentence-Case Label Rule.** Labels are short, muted, 500 weight and in sentence case. There are no tracked-out uppercase kickers above titles.

## Layout

A centred column (max 1680px, side padding `pad`) on a two-track programme grid: a `year-column` track (150–250px) holding the sticky numeral, then the content track, separated by `gap`. The programme line (intro and controls) aligns to the content track so the year column reads as a margin.

Each entry is its own grid: frame (1.55fr) and ficha (min 250px, 1fr). The frame is the widest element in the row and takes full track width at its native ratio; vertical frames are capped at 78vh tall and keep their width. Entries are separated by a 1px black rule; years by a 2px rule. The catalogue page header uses three tracks (year, title 1.5fr, ficha 1fr); notes indent to the content track.

Project stills: the lead still at full width, then a 4-column grid with a 14px gap where a landscape frame spans 2 columns and a vertical one spans 1. A landscape frame left alone on the last row spans all 4, so there are no holes and no frames are cropped. Studio and contact use a 1.35fr / 1fr split. Sections end with `section-end` space.

Responsive behaviour:
- **≤1180px:** the credits index goes to 2 columns; the catalogue ficha drops under the title.
- **≤900px:** everything is one column. The year numeral becomes a 60px sticky band on paper with a 1px bottom rule, sitting above its entries. Studio and contact stack.
- **≤760px:** the stills grid goes to 2 columns (landscape frames full width); optional index columns hide; the pager stacks; the lightbox arrows move below the frame beside the counter.
- **≤560px:** a smaller logo (38px); the credits index goes to 1 column; ficha labels stack over their values.

## Elevation & Depth

The system is flat. There are no shadows, gradients or blurs anywhere. Depth exists only in two places: the sticky year numeral, which stays at the top of its year while the entries scroll under it (on paper with a rule on narrow screens), and the lightbox, which replaces the page with a neutral dark room.

### Named Rules
**The Letterpress Rule.** Structure is drawn with solid black rules: 2px between major blocks (masthead, years, sections, catalogue head, pager, footer) and 1px between entries, ficha rows and table rows. There are no hairline greys and no boxes, except the coupon's 2px border.

## Shapes

Every shape is square: 0px radius on frames, buttons, inputs and the coupon. Frames are never clipped, masked, cropped by `object-fit` or given a border. The only icons are three inline stroke SVGs drawn at text size (left arrow, right arrow, filled play triangle). The logo is the supplied navy/red wordmark SVG, at 46px tall (38px on phones).

## Components

### Masthead
- **Style:** the logo on the left and the nav on the right (trabalho, estúdio, contacto: lowercase, 500, no underline), with 20px/18px vertical padding. A 2px rule follows.
- **Hover:** a 2px red underline offset 0.3em. The footer links behave the same way.

### Programme line, filters and views
- **Style:** the intro line in the lead style, then two button groups split across the row: format filters with a superscript count (12px), and the Programa / Índice view switch. They are plain text buttons (16px, 500, muted), with no box and no fill.
- **State:** `aria-pressed="true"` sets ink text plus a 3px red underline at a 0.35em offset; hover sets ink text. The filter hides entries of other formats and removes any year left empty; the view choice is remembered in localStorage.

### Year section and entry
- **Year:** a two-track grid with a 2px top rule; the sticky navy numeral sits in the left track.
- **Entry:** the frame is a link (removed from the tab order, since the title carries the link) and is shown at native ratio with no treatment. The ficha column holds the title (caps, links to the catalogue page), subtitle, format · client line, and a short ficha (Realização, Fotografia, Produção).
- **Hover:** hovering the frame or the title gives the title a 3px red underline. The frame itself never changes.

### Ficha
- **Style:** a definition list where each row is a label (40% min 7.5em, muted 14px/500) beside a value (16px). Rows are 9px apart in entries. In the studio and contact blocks, rows are ruled with 1px black above and below and have 10px vertical padding. On phones, labels stack over values.

### Index table
- **Style:** a full-width table under a 2px rule, 1px ink rules under each row, cells 11px/18px. Titles are in the title voice at 22px caps with the subtitle muted below; the year column is 500 weight. Hover gives the title a 2px red underline. Below 760px the director, DOP and production columns hide.

### Studio
- **Style:** the section head, then lead paragraphs beside a ruled technical ficha. Below, the "Com quem trabalhámos" credits index (1px top rule) lists collaborators by role in 4 columns, with names separated by a muted " ·".

### Contact and coupon form
- **Contact:** the email in navy at display size, plain paragraphs, and a ruled contact ficha.
- **Coupon:** a 2px black-bordered box (padding 22/24px). It has a title in the title voice and fields with no box: a muted 14px label over an input with only a 1px ink bottom rule.
- **Focus:** the bottom rule becomes 2px navy.
- **Submit:** ink fill, paper text, caps title voice at 20px. It turns navy on hover and muted while sending; a status line below reports the result in plain Portuguese.

### Play button (showreel, trailer)
- **Style:** transparent with a 2px ink border, caps title voice at 22px, and a filled play triangle. It inverts to an ink fill with paper text on hover. Clicking replaces it with a 16:9 embed; nothing loads before the click.

### Catalogue page
- **Back row:** "← Programa" on the left and a tabular-numeral folio ("3 / 27", muted) on the right.
- **Head:** a 2px rule, the navy year numeral, the title at catalogue size with subtitle and format line, then the full ficha (Realização, Direção de fotografia, Produção, Agência, Cliente / exibição, Cor).
- **Then:** optional notes, the stills packed as described in Layout (each still opens the lightbox, cursor zoom-in), the trailer button, and the pager.

### Pager
- **Style:** a 2px rule, two columns: "← Sessão anterior" / "Sessão seguinte →" in muted 15px/500 over the neighbouring title in the title voice. The next item aligns right; both stack left-aligned below 760px.
- **Hover:** a 3px red underline on the title.

### Lightbox
- **Style:** a full-viewport native `<dialog>` on `screen`. The frame is centred and fits within the viewport less 144px horizontally and 120px vertically, never upscaled past its box and never cropped. Controls are text and arrow buttons in `screen-ink` (white on hover): Fechar at the top right, arrows at mid-height on each side, and a muted counter at the bottom centre.
- **Behaviour:** arrow keys step through the stills, Escape or a click on the backdrop closes, and a single still hides the arrows. On phones the arrows sit below the frame.

### Footer and 404
- **Footer:** a 2px rule, the line "zema studios · color grading · Lisboa" at 15px, and the email, Instagram and Vimeo links on the right.
- **404:** a 2px rule, a navy "404" in the display numeral style, a catalogue-size caps heading, and one plain sentence linking back to the programme.

### Motion
Motion is minimal. Colour, underline-colour and background changes ease over 0.15s on filters, views, buttons and the play button. The year change is carried by native sticky positioning, with no animation. Under `prefers-reduced-motion: reduce`, all transitions are removed.

## Do's and Don'ts

### Do:
- **Do** show every frame uncropped at its native ratio, directly on `paper` or `screen`, with no filter, overlay, border, radius or text on it.
- **Do** keep the paper neutral (#eeeeeb, R/G/B within 3) and the lightbox neutral dark (#101010).
- **Do** set titles, section heads and numerals in Archivo 800 condensed caps (`wdth` 62–68), and everything read in sentences in Archivo at normal width.
- **Do** divide with solid black rules: 2px between blocks, 1px between rows.
- **Do** use navy for the year numerals, the contact email, focus and selection; use red only as an underline mark for active and hover states.
- **Do** keep credits visible in the ficha at all times, labels in muted 14px/500 sentence case.
- **Do** write the brand as "zema studios", always lowercase, including in alt text and titles.

### Don't:
- **Don't** crop, tint, filter, round or overlay a graded frame, or use `object-fit: cover` on one.
- **Don't** use a cream or tinted surround; the logo's cream (#E6E3D4) is not a page colour.
- **Don't** add shadows, gradients, rounded corners, cards or grey hairlines.
- **Don't** fill shapes or set text in red.
- **Don't** add eyebrows or kickers above titles, section numbers, taglines or marketing superlatives.
- **Don't** introduce a second typeface or a mid-width display cut.
- **Don't** hide credits behind hover.
