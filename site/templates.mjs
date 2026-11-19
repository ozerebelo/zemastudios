// HTML templates. Every value that comes from content/ goes through esc().
// The site is set as a cinematheque programme: each project is a screening
// entry with its ficha técnica, the frame shown large and uncropped.

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

const ARROW_LEFT = `<svg class="ico" viewBox="0 0 20 12" aria-hidden="true"><path d="M7 1 2 6l5 5M2 6h17"/></svg>`;
const ARROW_RIGHT = `<svg class="ico" viewBox="0 0 20 12" aria-hidden="true"><path d="M13 1l5 5-5 5M18 6H1"/></svg>`;
const PLAY = `<svg class="ico ico-fill" viewBox="0 0 12 14" aria-hidden="true"><path d="M1 1l10 6-10 6z"/></svg>`;

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

function picture(im, { alt = "", sizes = "100vw", eager = false } = {}) {
  if (!im) return "";
  const dims = im.width ? ` width="${im.width}" height="${im.height}"` : "";
  const srcset = im.srcset ? ` srcset="${esc(im.srcset)}" sizes="${esc(sizes)}"` : "";
  const loading = eager ? ` fetchpriority="high"` : ` loading="lazy" decoding="async"`;
  const tall = im.width && im.height > im.width ? ` class="tall"` : "";
  return `<img${tall} src="${esc(im.src)}"${srcset}${dims} alt="${esc(alt)}"${loading}>`;
}

/** "Artur Ribeiro, Tiago Guedes & X e Y" -> ["Artur Ribeiro", "Tiago Guedes", "X", "Y"] */
const people = (s) =>
  String(s || "")
    .split(/\s*(?:,|&|\be\b|\/)\s*/)
    .map((x) => x.trim())
    .filter(Boolean);

function collaborators(projects, key) {
  const seen = new Map();
  for (const p of projects)
    for (const n of new Set(people(p[key]))) {
      const k = n.toLowerCase();
      const cur = seen.get(k) || { name: n, count: 0 };
      cur.count++;
      seen.set(k, cur);
    }
  return [...seen.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "pt")).map((x) => x.name);
}

const fmtLine = (p) => [p.formato, p.cliente].filter(Boolean).map(esc).join(" · ");
const fullTitle = (p) => (p.subtitulo ? `${p.titulo}, ${p.subtitulo}` : p.titulo);

function ficha(p, keys = FICHA) {
  const rows = keys.filter(([k]) => p[k]).map(([k, label]) => `<div><dt>${label}</dt><dd>${esc(p[k])}</dd></div>`);
  return rows.length ? `<dl class="ficha">${rows.join("")}</dl>` : "";
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
<meta name="theme-color" content="#EEEEEB">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/site.css">
${head}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ""}>
<a class="skip" href="#conteudo">Saltar para o conteúdo</a>
<header class="mast">
  <a class="brand" href="/"><img src="/logo.svg" alt="${esc(site.nome)}" width="104" height="48"></a>
  <nav aria-label="Principal">
    <a href="/#programa">trabalho</a>
    <a href="/#estudio">estúdio</a>
    <a href="/#contacto">contacto</a>
  </nav>
</header>
<main id="conteudo">
${body}
</main>
<footer class="foot">
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

function entry(p, img, first) {
  const href = `/trabalho/${esc(p.slug)}/`;
  return `<li class="entry" data-cat="${FORMATOS[p.formato]}">
        <a class="entry-still" href="${href}" tabindex="-1" aria-hidden="true">${picture(img(p.capa), {
          alt: "",
          sizes: "(max-width: 900px) 100vw, 55vw",
          eager: first,
        })}</a>
        <div class="entry-text">
          <h3><a href="${href}">${esc(p.titulo)}</a></h3>
          ${p.subtitulo ? `<p class="sub">${esc(p.subtitulo)}</p>` : ""}
          <p class="fmt">${fmtLine(p)}</p>
          ${ficha(p, [["realizacao", "Realização"], ["fotografia", "Fotografia"], ["producao", "Produção"]])}
        </div>
      </li>`;
}

function programme(ctx) {
  const { projects, img, site } = ctx;
  const counts = Object.fromEntries(CATEGORIAS.map(([k]) => [k, 0]));
  for (const p of projects) counts[FORMATOS[p.formato]]++;
  const filters = [
    `<button type="button" data-filter="all" aria-pressed="true">Tudo <span>${projects.length}</span></button>`,
    ...CATEGORIAS.filter(([k]) => counts[k]).map(
      ([k, label]) => `<button type="button" data-filter="${k}" aria-pressed="false">${label} <span>${counts[k]}</span></button>`,
    ),
  ].join("\n        ");

  const years = [...new Set(projects.map((p) => p.ano))];
  let first = true;
  const sections = years
    .map((y) => {
      const items = projects.filter((p) => p.ano === y);
      const html = items.map((p) => {
        const e = entry(p, img, first);
        first = false;
        return e;
      });
      return `<section class="year" data-year="${y}" aria-label="${y}">
      <h2 class="yr"><span>${y}</span></h2>
      <ol class="entries">
      ${html.join("\n      ")}
      </ol>
    </section>`;
    })
    .join("\n    ");

  const rows = projects
    .map(
      (p) => `<tr data-cat="${FORMATOS[p.formato]}">
          <td class="c-ano">${p.ano}</td>
          <th scope="row"><a href="/trabalho/${esc(p.slug)}/">${esc(p.titulo)}</a>${p.subtitulo ? ` <span>${esc(p.subtitulo)}</span>` : ""}</th>
          <td>${esc(p.formato)}</td>
          <td class="c-opt">${esc(p.realizacao)}</td>
          <td class="c-opt">${esc(p.fotografia)}</td>
          <td class="c-opt">${esc(p.producao)}</td>
        </tr>`,
    )
    .join("\n        ");

  return `<div class="progline">
    <p class="intro">${esc(site.intro)}</p>
    <div class="controls">
      <div class="filters" role="group" aria-label="Filtrar por formato">
        ${filters}
      </div>
      <div class="views" role="group" aria-label="Vista">
        <button type="button" data-view="programa" aria-pressed="true">Programa</button>
        <button type="button" data-view="indice" aria-pressed="false">Índice</button>
      </div>
    </div>
  </div>
  <div id="programa" class="programme" data-pane="programa">
    ${sections}
  </div>
  <div class="index" data-pane="indice" hidden>
    <table>
      <caption class="vh">Índice de trabalhos</caption>
      <thead><tr><th scope="col" class="c-ano">Ano</th><th scope="col">Título</th><th scope="col">Formato</th><th scope="col" class="c-opt">Realização</th><th scope="col" class="c-opt">Fotografia</th><th scope="col" class="c-opt">Produção</th></tr></thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>
  <p class="empty" hidden>Nenhum trabalho neste formato.</p>`;
}

function studio(ctx) {
  const { site, projects, img } = ctx;
  const s = site.sobre || {};
  const team = (s.equipa || []).filter((m) => m?.nome);
  const tech = (site.tecnico || []).filter((t) => t?.rotulo && t?.valor);
  const groups = [
    ["Realização", collaborators(projects, "realizacao")],
    ["Direção de fotografia", collaborators(projects, "fotografia")],
    ["Produção", collaborators(projects, "producao")],
    ["Clientes e exibição", collaborators(projects, "cliente")],
  ].filter(([, names]) => names.length);

  return `<section id="estudio" class="studio" aria-labelledby="h-estudio">
    <h2 id="h-estudio" class="sect">Estúdio</h2>
    <div class="studio-grid">
      <div class="studio-text">
        ${paragraphs(s.texto)}
        ${s.foto ? `<figure class="studio-photo">${picture(img(s.foto), { alt: "", sizes: "320px" })}</figure>` : ""}
        ${
          team.length
            ? `<ul class="team">${team
                .map(
                  (m) =>
                    `<li>${m.foto ? picture(img(m.foto), { alt: m.nome, sizes: "120px" }) : ""}<div><h3>${esc(m.nome)}</h3>${m.funcao ? `<p class="fmt">${esc(m.funcao)}</p>` : ""}${paragraphs(m.bio)}</div></li>`,
                )
                .join("")}</ul>`
            : ""
        }
      </div>
      ${tech.length ? `<dl class="ficha ficha-tech">${tech.map((t) => `<div><dt>${esc(t.rotulo)}</dt><dd>${esc(t.valor)}</dd></div>`).join("")}</dl>` : ""}
    </div>
    ${
      groups.length
        ? `<div class="credits-index">
      <h3>Com quem trabalhámos</h3>
      <dl>${groups.map(([label, names]) => `<div><dt>${label}</dt><dd>${names.map((n) => `<span>${esc(n)}</span>`).join(" ")}</dd></div>`).join("")}</dl>
    </div>`
        : ""
    }
  </section>`;
}

function contact(ctx) {
  const c = ctx.site.contacto || {};
  const form = c.formspree
    ? `<form class="coupon" action="https://formspree.io/f/${esc(c.formspree)}" method="POST">
        <p class="coupon-title">Pedido de orçamento</p>
        <div class="field"><label for="f-nome">Nome</label><input id="f-nome" name="nome" autocomplete="name"></div>
        <div class="field"><label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
        <div class="field"><label for="f-projeto">Projeto</label><input id="f-projeto" name="projeto" placeholder="Formato, duração, câmara, data de entrega"></div>
        <div class="field"><label for="f-msg">Mensagem</label><textarea id="f-msg" name="mensagem" rows="4" required></textarea></div>
        <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" class="hp">
        <button type="submit">Enviar pedido</button>
        <p class="form-status" role="status"></p>
      </form>`
    : "";
  return `<section id="contacto" class="contact" aria-labelledby="h-contacto">
    <h2 id="h-contacto" class="sect">Contacto</h2>
    <div class="contact-grid">
      <div>
        ${c.email ? `<p class="mail"><a href="mailto:${esc(c.email)}">${esc(c.email).replace("@", "@<wbr>")}</a></p>` : ""}
        ${paragraphs(c.texto)}
        <dl class="ficha ficha-contact">
          ${c.telefone ? `<div><dt>Telefone</dt><dd><a href="${esc(telHref(c.telefone))}">${esc(c.telefone)}</a></dd></div>` : ""}
          ${c.instagram ? `<div><dt>Instagram</dt><dd><a href="${esc(c.instagram)}" rel="me">${esc(c.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, ""))}</a></dd></div>` : ""}
          ${c.vimeo ? `<div><dt>Vimeo</dt><dd><a href="${esc(c.vimeo)}" rel="me">Vimeo</a></dd></div>` : ""}
          <div><dt>Sala</dt><dd>Lisboa</dd></div>
        </dl>
      </div>
      ${form}
    </div>
  </section>`;
}

export function renderHome(ctx) {
  const { site, projects, redirects } = ctx;
  const reel = embedUrl(site.showreel);
  const firstFeatured = projects.find((p) => p.destaque) || projects[0];
  // Old site used #project/<slug> and #work; send those links to the new pages.
  const redirectScript = `<script>(function(){var m=${JSON.stringify(redirects)};function go(){var h=location.hash;if(h.indexOf("#project/")===0){var s=m[h.slice(9)];location.replace(s?"/trabalho/"+s+"/":"/#programa");}else if(h==="#work"){location.replace("/#programa");}}go();addEventListener("hashchange",go);})();</script>`;
  const body = `
  ${programme(ctx)}
  ${reel ? `<section class="reel" aria-label="Showreel"><button type="button" class="play-btn" data-embed="${esc(reel)}" data-title="Showreel">${PLAY} Ver showreel</button></section>` : ""}
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
  const { img } = ctx;
  const stills = (p.fotogramas.length ? p.fotogramas : [p.capa]).map((src) => img(src));
  const embed = embedUrl(p.video);
  const cover = img(p.capa);

  const still = (im, i, sizes) =>
    `<a class="still" href="${esc(im.src)}" data-index="${i}">${picture(im, {
      alt: `${fullTitle(p)}, fotograma ${i + 1}`,
      sizes,
      eager: i === 0,
    })}</a>`;

  const [first, ...rest] = stills;
  const body = `
  <article class="cat">
    <p class="back"><a href="/#programa">${ARROW_LEFT} Programa</a><span class="folio">${ctx.projects.indexOf(p) + 1} / ${ctx.projects.length}</span></p>
    <header class="cat-head">
      <p class="cat-year">${p.ano}</p>
      <div class="cat-title">
        <h1>${esc(p.titulo)}</h1>
        ${p.subtitulo ? `<p class="sub">${esc(p.subtitulo)}</p>` : ""}
        <p class="fmt">${fmtLine(p)}</p>
      </div>
      ${ficha(p)}
    </header>
    ${p.notas ? `<div class="notes">${paragraphs(p.notas)}</div>` : ""}
    <div class="stills" data-gallery>
      ${still(first, 0, "(max-width: 1500px) 100vw, 1440px")}
      ${rest.length ? `<div class="stills-rest">${packStills(rest).map(({ im, span }, i) => `<div class="cell span-${span}">${still(im, i + 1, span === 4 ? "(max-width: 1500px) 100vw, 1440px" : span === 2 ? "(max-width: 760px) 100vw, 50vw" : "(max-width: 760px) 50vw, 25vw")}</div>`).join("\n      ")}</div>` : ""}
    </div>
    ${embed ? `<section class="trailer" aria-label="Trailer"><button type="button" class="play-btn" data-embed="${esc(embed)}" data-title="Trailer de ${esc(fullTitle(p))}">${PLAY} Ver trailer</button></section>` : ""}
    <nav class="pager" aria-label="Outros trabalhos">
      ${prev ? `<a class="prev" href="/trabalho/${esc(prev.slug)}/"><span>${ARROW_LEFT} Sessão anterior</span><b>${esc(prev.titulo)}</b></a>` : "<span></span>"}
      ${next ? `<a class="next" href="/trabalho/${esc(next.slug)}/"><span>Sessão seguinte ${ARROW_RIGHT}</span><b>${esc(next.titulo)}</b></a>` : "<span></span>"}
    </nav>
  </article>
  <dialog class="lightbox" aria-label="Fotogramas">
    <p class="lb-n" aria-live="polite"></p>
    <button type="button" class="lb-close">Fechar</button>
    <button type="button" class="lb-prev" aria-label="Fotograma anterior">${ARROW_LEFT}</button>
    <button type="button" class="lb-next" aria-label="Fotograma seguinte">${ARROW_RIGHT}</button>
  </dialog>`;

  const description = [
    p.formato + (p.ano ? `, ${p.ano}` : ""),
    p.realizacao && `realização de ${p.realizacao}`,
    p.fotografia && `fotografia de ${p.fotografia}`,
  ]
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
    body: `<div class="notfound"><p class="cat-year">404</p><h1>Esta sessão não existe</h1><p>O endereço mudou ou foi escrito com um erro. <a href="/#programa">Ver o programa completo</a>.</p></div>`,
  });
}
