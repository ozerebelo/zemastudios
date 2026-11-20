// HTML templates. Every value that comes from content/ goes through esc().
// Dark and cinematic: a full-width frame up top, a dense grid of the work,
// and project pages that let the stills run large. Frames are shown whole:
// any frame wider or narrower than its box is letterboxed, never cropped.

export const FORMATOS = {
  "Série": "series",
  "Longa-metragem": "cinema",
  "Curta-metragem": "cinema",
  "Documentário": "documentario",
  "Videoclip": "videoclip",
  "Publicidade": "publicidade",
  "Conteúdo de marca": "publicidade",
};

const CATEGORIAS = [
  ["series", "Séries"],
  ["cinema", "Cinema"],
  ["documentario", "Documentário"],
  ["videoclip", "Videoclips"],
  ["publicidade", "Publicidade"],
];

const FICHA = [
  ["realizacao", "Realização"],
  ["fotografia", "Direção de fotografia"],
  ["producao", "Produção"],
  ["agencia", "Agência"],
  ["cliente", "Cliente / exibição"],
  ["cor", "Cor"],
];

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ESC[c]);

const paragraphs = (text) =>
  String(text || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("\n");

const telHref = (t) => "tel:" + String(t).replace(/[^\d+]/g, "");
const pad2 = (n) => String(n).padStart(2, "0");

const ARROW_LEFT = `<svg class="ico" viewBox="0 0 24 12" aria-hidden="true"><path d="M7 1 2 6l5 5M2 6h21"/></svg>`;
const ARROW_RIGHT = `<svg class="ico" viewBox="0 0 24 12" aria-hidden="true"><path d="M17 1l5 5-5 5M22 6H1"/></svg>`;
const PLAY = `<svg class="ico ico-play" viewBox="0 0 12 14" aria-hidden="true"><path d="M1 1l10 6-10 6z"/></svg>`;

// ---------------------------------------------------------------- video

/** Accepts a YouTube or Vimeo URL (or a bare YouTube id) and returns an embed URL. */
export function embedUrl(url) {
  if (!url) return "";
  const u = String(url).trim();
  let m;
  if (/^[\w-]{11}$/.test(u)) return `https://www.youtube-nocookie.com/embed/${u}?autoplay=1&rel=0`;
  if ((m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/)))
    return `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0`;
  if ((m = u.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/(\w+))?(?:.*[?&]h=(\w+))?/))) {
    const hash = m[2] || m[3];
    return `https://player.vimeo.com/video/${m[1]}?autoplay=1&dnt=1${hash ? `&h=${hash}` : ""}`;
  }
  return "";
}

// ---------------------------------------------------------------- pieces

function picture(im, { alt = "", sizes = "100vw", eager = false, cls = "" } = {}) {
  if (!im) return "";
  const dims = im.width ? ` width="${im.width}" height="${im.height}"` : "";
  const srcset = im.srcset ? ` srcset="${esc(im.srcset)}" sizes="${esc(sizes)}"` : "";
  const loading = eager ? ` fetchpriority="high"` : ` loading="lazy" decoding="async"`;
  const classes = [cls, im.width && im.height > im.width ? "tall" : ""].filter(Boolean).join(" ");
  return `<img${classes ? ` class="${classes}"` : ""} src="${esc(im.src)}"${srcset}${dims} alt="${esc(alt)}"${loading}>`;
}

/** The variant closest to `w` pixels wide, for hover previews and thumbnails. */
function variant(im, w = 640) {
  const list = (im.srcset || "")
    .split(",")
    .map((s) => s.trim().split(" "))
    .filter((x) => x[0])
    .map(([u, d]) => [u, parseInt(d, 10) || 0]);
  const pick = list.find(([, d]) => d >= w) || list[list.length - 1];
  return pick ? pick[0] : im.src;
}

/** Escaped text where hyphenated words (G-SHOCK) never break at the hyphen. */
const keep = (t) => esc(t).replace(/(\S+-\S+)/g, '<span class="nw">$1</span>');

const fmtLine = (p) => [p.formato, p.cliente].filter(Boolean).map(esc).join(" · ");
const fullTitle = (p) => (p.subtitulo ? `${p.titulo}, ${p.subtitulo}` : p.titulo);
const frames = (p, img) => (p.fotogramas.length ? p.fotogramas : [p.capa]).map(img).filter(Boolean);
const people = (p) => [p.realizacao && `Realização ${esc(p.realizacao)}`, p.fotografia && `Fotografia ${esc(p.fotografia)}`].filter(Boolean).join(" · ");

function ficha(rows, cls = "") {
  const items = rows.filter(([, v]) => v);
  return items.length ? `<dl class="ficha${cls ? " " + cls : ""}">${items.map(([l, v]) => `<div><dt>${l}</dt><dd>${v}</dd></div>`).join("")}</dl>` : "";
}

/** The measured palette of the grade: a thin bar of proportional swatches and their codes. */
function palette(p) {
  if (!p.paleta?.length) return "";
  const n = p.fotogramas.length || 1;
  const list = p.paleta.map((c) => `${c.hex} ${Math.round(c.share * 100)}%`).join(", ");
  return `<figure class="palette">
        <div class="bar" role="img" aria-label="Paleta da grade: ${list}">${p.paleta.map((c) => `<span style="flex:${c.share.toFixed(4)} 1 0;background:${c.hex}"></span>`).join("")}</div>
        <figcaption><span>Paleta da grade, medida em ${n} ${n === 1 ? "fotograma" : "fotogramas"}</span><span class="hexes">${p.paleta.map((c) => `<i style="--c:${c.hex}"></i>${c.hex}`).join(" ")}</span></figcaption>
      </figure>`;
}

// ---------------------------------------------------------------- layout

function layout(ctx, { title, description, path, image, body, head = "", bodyClass = "" }) {
  const { site } = ctx;
  const docTitle = title ? `${title} · ${site.nome}` : `${site.nome} · color grading, Lisboa`;
  const canonical = site.url + path;
  const og = image ? site.url + image : "";
  const c = site.contacto || {};
  return `<!doctype html>
<html lang="pt-PT">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(docTitle)}</title>
<meta name="description" content="${esc(description || site.descricao)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.nome)}">
<meta property="og:title" content="${esc(title || site.nome)}">
<meta property="og:description" content="${esc(description || site.descricao)}">
<meta property="og:url" content="${esc(canonical)}">
${og ? `<meta property="og:image" content="${esc(og)}">\n<meta name="twitter:card" content="summary_large_image">` : ""}
<meta name="theme-color" content="#0b0b0b">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/host-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/site.css">
${head}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ""}>
<a class="skip" href="#conteudo">Saltar para o conteúdo</a>
<header class="mast">
  <a class="brand" href="/"><img src="/logo.svg" alt="${esc(site.nome)}" width="104" height="48"></a>
  <nav aria-label="Principal">
    <a href="/#trabalho">trabalho</a>
    <a href="/#estudio">estúdio</a>
    <a href="/#contacto">contacto</a>
  </nav>
</header>
<main id="conteudo">
${body}
</main>
<footer class="foot">
  <img src="/logo.svg" alt="" width="70" height="32">
  <p>${esc(site.nome)} · color grading · Lisboa</p>
  <p class="foot-links">
    ${c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : ""}
    ${c.instagram ? `<a href="${esc(c.instagram)}" rel="me">Instagram</a>` : ""}
    ${c.vimeo ? `<a href="${esc(c.vimeo)}" rel="me">Vimeo</a>` : ""}
  </p>
</footer>
<script src="/site.js" defer></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------- home

function hero(ctx) {
  const { projects, img } = ctx;
  const featured = projects.filter((p) => p.destaque);
  const list = featured.length ? featured : projects.slice(0, 5);
  const slides = list
    .map((p, i) => {
      const href = `/trabalho/${esc(p.slug)}/`;
      return `<li class="slide${i === 0 ? " on" : ""}"${i ? ' aria-hidden="true"' : ""}>
        <a class="slide-frame" href="${href}" tabindex="${i ? "-1" : "0"}">${picture(img(p.capa), { alt: `Fotograma de ${fullTitle(p)}`, sizes: "100vw", eager: i === 0 })}</a>
        <div class="slide-cap">
          <span class="slide-n">${pad2(i + 1)} <span>/ ${pad2(list.length)}</span></span>
          <a class="slide-title" href="${href}" tabindex="${i ? "-1" : "0"}">${esc(p.titulo)}${p.subtitulo ? ` <span>${esc(p.subtitulo)}</span>` : ""}</a>
          <span class="slide-people">${people(p)}</span>
        </div>
      </li>`;
    })
    .join("\n      ");
  return `<section class="hero" aria-roledescription="carrossel" aria-label="Trabalhos em destaque">
    <ol class="slides">
      ${slides}
    </ol>
    ${
      list.length > 1
        ? `<div class="hero-ctl">
      <button type="button" data-slide="prev" aria-label="Anterior">${ARROW_LEFT}</button>
      <button type="button" data-slide="next" aria-label="Seguinte">${ARROW_RIGHT}</button>
    </div>
    <div class="hero-progress" aria-hidden="true"><i></i></div>`
        : ""
    }
  </section>`;
}

function tile(p, img) {
  const href = `/trabalho/${esc(p.slug)}/`;
  const all = frames(p, img);
  const cover = img(p.capa);
  const others = all.filter((f) => f.src !== cover.src).map((f) => variant(f, 640));
  return `<li class="tile" data-cat="${FORMATOS[p.formato]}">
        <a href="${href}">
          <span class="tile-frame"${others.length ? ` data-frames="${esc(others.join(" "))}"` : ""}>${picture(cover, {
            alt: "",
            sizes: "(max-width: 600px) 100vw, (max-width: 960px) 50vw, (max-width: 1280px) 33vw, 25vw",
          })}</span>
          <span class="tile-cap">
            <span class="tile-row"><b>${keep(p.titulo)}</b><span class="tile-year">${p.ano}</span></span>
            <span class="tile-fmt">${p.subtitulo ? `${esc(p.subtitulo)} · ` : ""}${fmtLine(p)}</span>
            <span class="tile-people">${people(p)}</span>
          </span>
        </a>
      </li>`;
}

function work(ctx) {
  const { projects, img } = ctx;
  const counts = Object.fromEntries(CATEGORIAS.map(([k]) => [k, 0]));
  for (const p of projects) counts[FORMATOS[p.formato]]++;
  const filters = [
    `<button type="button" data-filter="all" aria-pressed="true">Tudo<sup>${projects.length}</sup></button>`,
    ...CATEGORIAS.filter(([k]) => counts[k]).map(([k, label]) => `<button type="button" data-filter="${k}" aria-pressed="false">${label}<sup>${counts[k]}</sup></button>`),
  ].join("\n        ");
  const rows = projects
    .map(
      (p) => `<tr data-cat="${FORMATOS[p.formato]}">
          <th scope="row"><a href="/trabalho/${esc(p.slug)}/">${esc(p.titulo)}</a>${p.subtitulo ? ` <span>${esc(p.subtitulo)}</span>` : ""}</th>
          <td>${esc(p.formato)}</td>
          <td class="c-opt">${esc(p.realizacao)}</td>
          <td class="c-opt">${esc(p.fotografia)}</td>
          <td class="c-ano">${p.ano}</td>
        </tr>`,
    )
    .join("\n        ");
  return `<section id="trabalho" class="work" aria-labelledby="h-trabalho">
    <div class="work-bar">
      <h2 id="h-trabalho">Trabalho</h2>
      <div class="filters" role="group" aria-label="Filtrar por formato">
        ${filters}
      </div>
      <div class="views" role="group" aria-label="Vista">
        <button type="button" data-view="grelha" aria-pressed="true">Grelha</button>
        <button type="button" data-view="lista" aria-pressed="false">Lista</button>
      </div>
    </div>
    <ul class="grid" data-pane="grelha">
      ${projects.map((p) => tile(p, img)).join("\n      ")}
    </ul>
    <div class="list" data-pane="lista" hidden>
      <table>
        <caption class="vh">Lista de trabalhos</caption>
        <thead><tr><th scope="col">Título</th><th scope="col">Formato</th><th scope="col" class="c-opt">Realização</th><th scope="col" class="c-opt">Fotografia</th><th scope="col" class="c-ano">Ano</th></tr></thead>
        <tbody>
        ${rows}
        </tbody>
      </table>
    </div>
  </section>`;
}

function studio(ctx) {
  const { site } = ctx;
  const tech = (site.tecnico || []).filter((t) => t?.rotulo && t?.valor);
  return `<section id="estudio" class="studio" aria-labelledby="h-estudio">
    <h2 id="h-estudio" class="sect">Estúdio</h2>
    <div class="studio-grid">
      <div class="studio-text">${paragraphs(site.sobre?.texto)}</div>
      ${ficha(tech.map((t) => [esc(t.rotulo), esc(t.valor)]), "ficha-rows")}
    </div>
  </section>`;
}

function contact(ctx) {
  const c = ctx.site.contacto || {};
  const ig = c.instagram ? c.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "") : "";
  const form = c.formspree
    ? `<form class="form" action="https://formspree.io/f/${esc(c.formspree)}" method="POST">
        <div class="field"><label for="f-nome">Nome</label><input id="f-nome" name="nome" autocomplete="name"></div>
        <div class="field"><label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
        <div class="field"><label for="f-projeto">Projeto</label><input id="f-projeto" name="projeto" placeholder="Formato, duração, câmara, data de entrega"></div>
        <div class="field"><label for="f-msg">Mensagem</label><textarea id="f-msg" name="mensagem" rows="4" required></textarea></div>
        <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" class="hp">
        <button type="submit">Enviar ${ARROW_RIGHT}</button>
        <p class="form-status" role="status"></p>
      </form>`
    : "";
  return `<section id="contacto" class="contact" aria-labelledby="h-contacto">
    <h2 id="h-contacto" class="sect">Contacto</h2>
    <div class="contact-grid">
      <div class="contact-main">
        ${c.email ? `<p class="mail"><a href="mailto:${esc(c.email)}">${esc(c.email).replace("@", "@<wbr>")}</a></p>` : ""}
        ${paragraphs(c.texto)}
        ${ficha(
          [
            ["Telefone", c.telefone ? `<a href="${esc(telHref(c.telefone))}">${esc(c.telefone)}</a>` : ""],
            ["Instagram", c.instagram ? `<a href="${esc(c.instagram)}" rel="me">${esc(ig)}</a>` : ""],
            ["Vimeo", c.vimeo ? `<a href="${esc(c.vimeo)}" rel="me">Vimeo</a>` : ""],
            ["Sala", "Lisboa"],
          ],
          "ficha-rows",
        )}
      </div>
      ${form}
    </div>
  </section>`;
}

/** First sentence in full white, the rest in the muted voice. */
function statement(text) {
  const t = String(text || "").trim();
  const i = t.indexOf(". ");
  return i < 0 ? esc(t) : `${esc(t.slice(0, i + 1))} <span>${esc(t.slice(i + 2))}</span>`;
}

export function renderHome(ctx) {
  const { site, projects, redirects } = ctx;
  const reel = embedUrl(site.showreel);
  const firstFeatured = projects.find((p) => p.destaque) || projects[0];
  // Old site used #project/<slug> and #work; send those links to the new pages.
  const redirectScript = `<script>(function(){var m=${JSON.stringify(redirects)};function go(){var h=location.hash;if(h.indexOf("#project/")===0){var s=m[h.slice(9)];location.replace(s?"/trabalho/"+s+"/":"/#trabalho");}else if(h==="#work"){location.replace("/#trabalho");}}go();addEventListener("hashchange",go);})();</script>`;
  const body = `
  ${hero(ctx)}
  <section class="intro" aria-label="Apresentação">
    <p class="statement">${statement(site.intro)}</p>
    ${reel ? `<button type="button" class="play-btn" data-embed="${esc(reel)}" data-title="Showreel">${PLAY} Ver showreel</button>` : ""}
  </section>
  ${work(ctx)}
  ${studio(ctx)}
  ${contact(ctx)}`;
  return layout(ctx, {
    title: "",
    description: site.descricao,
    path: "/",
    image: firstFeatured ? ctx.img(firstFeatured.capa)?.src : "",
    body,
    head: redirectScript,
    bodyClass: "home",
  });
}

// ---------------------------------------------------------------- project

/**
 * Lays the stills after the lead on a 4-column grid without cropping: a
 * landscape frame takes 2 columns, a vertical one takes 1. A landscape frame
 * left alone on the last row takes the full width instead of leaving a hole.
 */
function packStills(images) {
  const cells = images.map((im) => ({ im, span: im.width && im.height > im.width ? 1 : 2 }));
  let fill = 0;
  let rowStart = 0;
  cells.forEach((c, i) => {
    if (fill + c.span > 4) { fill = 0; rowStart = i; }
    fill += c.span;
    if (fill === 4) { fill = 0; rowStart = i + 1; }
  });
  const last = cells.slice(rowStart);
  if (last.length === 1 && last[0].span === 2) last[0].span = 4;
  return cells;
}

export function renderProject(ctx, p, prev, next) {
  const { img, projects } = ctx;
  const stills = frames(p, img);
  const embed = embedUrl(p.video);
  const cover = img(p.capa);
  const total = stills.length;
  const idx = projects.indexOf(p) + 1;

  const still = (im, i, sizes) =>
    `<figure class="still-fig"><a class="still" href="${esc(im.src)}" data-index="${i}">${picture(im, {
      alt: `${fullTitle(p)}, fotograma ${i + 1}`,
      sizes,
      eager: i === 0,
    })}</a><figcaption><span>${pad2(i + 1)}</span><span>${esc(im.ratio || "")}</span></figcaption></figure>`;

  const [first, ...rest] = stills;
  const nextIm = next ? img(next.capa) : null;
  const body = `
  <article class="project-page">
    <div class="lead">
      <a class="still lead-frame" href="${esc(first.src)}" data-index="0">${picture(first, { alt: `${fullTitle(p)}, fotograma 1`, sizes: "100vw", eager: true })}</a>
    </div>
    <header class="p-head">
      <div class="p-title">
        <p class="p-meta"><a href="/#trabalho">${ARROW_LEFT} Trabalho</a><span>${pad2(idx)} / ${pad2(projects.length)}</span></p>
        <h1>${keep(p.titulo)}</h1>
        ${p.subtitulo ? `<p class="sub">${esc(p.subtitulo)}</p>` : ""}
        <p class="fmt">${fmtLine(p)} · ${p.ano}</p>
        ${embed ? `<div class="trailer"><button type="button" class="play-btn" data-embed="${esc(embed)}" data-title="Trailer de ${esc(fullTitle(p))}">${PLAY} Ver trailer</button></div>` : ""}
      </div>
      <div class="p-side">
        ${ficha([...FICHA.map(([k, l]) => [l, esc(p[k] || "")]), ["Proporção", esc(p.proporcao)], ["Fotogramas", String(total)]], "ficha-rows")}
        ${palette(p)}
      </div>
    </header>
    ${p.notas ? `<div class="notes">${paragraphs(p.notas)}</div>` : ""}
    ${
      rest.length
        ? `<div class="stills" data-gallery>
      ${packStills(rest)
        .map(({ im, span }, i) => `<div class="cell span-${span}">${still(im, i + 1, span === 4 ? "100vw" : span === 2 ? "(max-width: 760px) 100vw, 50vw" : "(max-width: 760px) 50vw, 25vw")}</div>`)
        .join("\n      ")}
    </div>`
        : ""
    }
    <nav class="next" aria-label="Outros trabalhos">
      ${
        next
          ? `<a class="next-link" href="/trabalho/${esc(next.slug)}/">
        <span class="next-frame">${picture(nextIm, { alt: "", sizes: "(max-width: 900px) 100vw, 60vw" })}</span>
        <span class="next-text"><span class="next-label">Seguinte ${ARROW_RIGHT}</span><b>${keep(next.titulo)}</b><span>${fmtLine(next)} · ${next.ano}</span></span>
      </a>`
          : ""
      }
      ${prev ? `<a class="prev-link" href="/trabalho/${esc(prev.slug)}/">${ARROW_LEFT} ${esc(prev.titulo)}</a>` : ""}
    </nav>
  </article>
  <dialog class="lightbox" aria-label="Fotogramas">
    <p class="lb-n" aria-live="polite"></p>
    <button type="button" class="lb-close">Fechar</button>
    <button type="button" class="lb-prev" aria-label="Fotograma anterior">${ARROW_LEFT}</button>
    <button type="button" class="lb-next" aria-label="Fotograma seguinte">${ARROW_RIGHT}</button>
  </dialog>`;

  const description = [p.formato + (p.ano ? `, ${p.ano}` : ""), p.realizacao && `realização de ${p.realizacao}`, p.fotografia && `fotografia de ${p.fotografia}`]
    .filter(Boolean)
    .join(", ");
  return layout(ctx, {
    title: fullTitle(p),
    description: `${description}. Color grading: ${ctx.site.nome}.`,
    path: `/trabalho/${p.slug}/`,
    image: cover?.src,
    body,
    bodyClass: "project",
  });
}

export function renderNotFound(ctx) {
  return layout(ctx, {
    title: "Página não encontrada",
    path: "/404.html",
    body: `<div class="notfound"><h1>Página não encontrada</h1><p>O endereço mudou ou foi escrito com um erro.</p><p><a href="/#trabalho">${ARROW_LEFT} Ver todo o trabalho</a></p></div>`,
  });
}
