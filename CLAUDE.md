# zema studios

Site and Instagram of zema studios, a colour grading studio. The brand is always written in lowercase: "zema studios". The site and all copy are in Portuguese (pt-PT); Instagram captions follow the English credit format below.

- Site: static generator in `site/` (content in `site/content/`, stills in `site/media/projetos/`), published to Netlify with `tools/deploy/` (see its README). Design rules: `DESIGN.md`. Marketing context: `.agents/product-marketing.md`.
- Never crop, filter or overlay graded frames on the site; letterbox instead. No client or brand names in marketing copy (they stay in each project's credits).

## Instagram posts (@zemastudios.grading)

Whenever the owner asks for Instagram posts, follow this format exactly. It is taken from the account's own archive.

### Feed post (carousel)

- Images: the project's stills at their own 16:9, never cropped, at most 2160 px wide. Open with the hero. 6 to 13 stills on the account; **at most 10** when publishing through the API (its carousel limit).
- Mix portraits or interviews, details, exteriors and wides; no burned-in subtitles or graphics; nothing that gives away key story moments.
- Caption, one credit per line, @handles where known, plain names where not (as in "Prod. Company: Advogado do Diabo & Miratecarts"). Never guess a handle: ask the owner.

```
<Title> - <Episode or subtitle>      (or "@brand - <Title>" for commercials)
<TV Show | Documentary | Short Film | Feature Film | Commercial | Music Video> (<year>)
Prod. Company: @…
Director: @…
DoP: @…
```

### Stories

- 3 to 4 stories per post, published the same day as the post.
- Each story is a collage of **3 stills stacked edge to edge** on a 1080x1920 canvas (each still fills its third; the sides are trimmed slightly, as in the archive). No text burned in.
- Mix the stills across stories (a portrait, an exterior, a detail in each) rather than three of a kind.
- **Every story mentions @zerebeloo and @mariablbraga.**
- The account often adds one more story that shares the post itself; that is done in the app.

### Tooling and publishing

- `site/` → `node ../tools/instagram/prepare-post.mjs <slug> --stills 1,2,5,… [--type "TV Show"] [--handles handles.json] --out <dir>` writes the carousel, `legenda.txt`, the stories, `stories/mencoes.txt` and a preview sheet.
- `tools/stills/` proposes and exports stills from episode files.
- Publishing is public and a feed post cannot be deleted through the API: always show the owner the carousel, caption and stories and publish only after an explicit "publica".
- The Meta access token lives in the cloud environment's network secrets (never in files, commits, memory or chat). If it is missing or refused, ask the owner to enter it through the secure credential form.
