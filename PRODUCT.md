# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People deciding who grades their picture, all of them confirmed audiences:

- **Directors of photography**, who choose or recommend the colourist and judge a grade by the frames.
- **Directors** of features, series, documentaries and music videos.
- **Production companies and platforms** (e.g. See My Dreams, Many Takes, Galo Bravo, Coral Europa, Prime Video, RTP), who close the budget.
- **Agencies and brands** commissioning commercials and branded content.

They arrive from a recommendation, a credit or Instagram, look at the work, check who shot and directed it, and get in touch.

## Product Purpose

The portfolio site of zema studios, a colour grading studio in Lisbon run by two colourists. It exists to show the grade itself (stills at their true colour and aspect ratio, with full credits) and to make getting in touch obvious. Success is a DOP, director or producer recognising work and collaborators they trust and writing to the studio.

## Positioning

A Lisbon grading studio whose credits span Portuguese streaming series, features, documentaries, music videos and commercials, with the collaborators named on every project. The studio presents itself as the brand, not as individuals.

## Operating Context

- Content is edited by the studio in Sveltia CMS at `/admin/` (Git-based; each save is a commit) and the site is generated statically by `site/build.mjs`.
- Hosting: the domain is connected to Netlify.
- Grading in DaVinci Resolve Studio in a calibrated room in Lisbon, also remote sessions.

## Capabilities and Constraints

- Site language: **Portuguese only**.
- Project pages show stills uncropped at native aspect ratio (1.5 to 2.39:1, and some vertical) and unfiltered; the site must never alter the colour of the work (no filters, tints, overlays on images, and a neutral surround).
- Each project: title, year, format, client/platform, director, DOP, production, agency, optional colourist credit, cover, stills, optional YouTube/Vimeo trailer, notes.
- Formats: série, longa-metragem, curta-metragem, documentário, videoclip, publicidade, conteúdo de marca.
- Later: automatic link with Instagram (undecided direction; site as source of truth recommended).

## Brand Commitments

- The name is **always lowercase: "zema studios"**, in copy, titles, metadata and alt text.
- No individual names or portraits on the site; the studio is the brand.
- Existing logo (`site/static/logo.svg`): lowercase "zema / studios" wordmark, the "i" drawn as a red dot over a red bar. Brand colours from the logo: navy #102D4F, red #E35443, cream #E6E3D4.
- Voice: factual and plain. No taglines or marketing superlatives.
- Look (chosen by the owner after three rejected rounds, 2026-11-20): dark and cinematic, direct and elegant rather than conceptual; simple, with depth and detail. Combines full-screen image impact with a dense grid of stills. Craft references: Blacksmith (blacksmith.tv), Electric Theatre Collective (electrictheatre.com), Lol Crawley (lolcrawley.com), Studio Fifteen (studiofifteenpost.com), Okay Studio (okaystudio.co.uk). Stills only; no video loops.

## Evidence on Hand

- 27 projects with credits and 159 graded stills in `site/content/projetos/` and `site/media/projetos/`.
- Contact: info@zemastudios.com, +351 915 118 676, Instagram @zemastudios.grading.
- No showreel link yet, no testimonials, no awards or press: do not fabricate any.

## Product Principles

1. The frame is the product: nothing on the site may change how a graded image is perceived.
2. Credits are proof: who shot it, who directed it and who produced it is shown, never hidden behind hover.
3. Plain speech over claims.
4. The studio can maintain the site alone, without touching code.
