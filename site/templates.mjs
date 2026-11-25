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
  "Entretenimento": "entretenimento",
};

const CATEGORIAS = [
  ["series", "Séries"],
  ["cinema", "Cinema"],
  ["documentario", "Documentário"],
  ["videoclip", "Videoclips"],
  ["entretenimento", "Entretenimento"],
  ["publicidade", "Publicidade"],
];

/** How each category is counted in running copy: singular and plural. */
const CONTAGEM = {
  series: ["série", "séries"],
  cinema: ["filme", "filmes"],
  documentario: ["documentário", "documentários"],
  videoclip: ["videoclip", "videoclips"],
  entretenimento: ["programa de entretenimento", "programas de entretenimento"],
  publicidade: ["campanha", "campanhas"],
};

/** How each category is named in running prose ("projetos de séries, cinema e publicidade"). */
const GENERO = {
  series: "séries",
  cinema: "cinema",
  documentario: "documentário",
  videoclip: "videoclips",
  entretenimento: "entretenimento",
  publicidade: "publicidade",
};

/**
 * Facts for running copy, computed from the published projects so a line like
 * "27 projetos entre 2021 e 2026: 15 séries, ..." can never go stale or overstate.
 */
function facts(projects) {
  const anos = projects.map((p) => p.ano).filter(Boolean);
  const counts = {};
  for (const p of projects) counts[FORMATOS[p.formato]] = (counts[FORMATOS[p.formato]] || 0) + 1;
  const parts = CATEGORIAS.filter(([k]) => counts[k]).map(([k]) => `${counts[k]}\u00A0${CONTAGEM[k][counts[k] === 1 ? 0 : 1]}`);
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} e ${parts[parts.length - 1]}` : parts[0] || "";
  const de = Math.min(...anos), ate = Math.max(...anos);
  const periodo = de === ate ? `em ${de}` : `entre ${de} e ${ate}`;
  const g = CATEGORIAS.filter(([k]) => counts[k]).map(([k]) => GENERO[k]);
  const generos = g.length > 1 ? `${g.slice(0, -1).join(", ")} e ${g[g.length - 1]}` : g[0] || "";
  return { n: projects.length, list, periodo, desde: de, generos };
}

const FICHA = [
  ["realizacao", "Realização"],
  ["fotografia", "Direção de fotografia"],
  ["producao", "Produção"],
  ["agencia", "Agência"],
  ["cliente", "Cliente"],
  ["cor", "Cor"],
];

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ESC[c]);

const paragraphs = (text) =>
  String(text || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${keep(p).replace(/\n/g, "<br>")}</p>`) // hyphenated words (faz-se, G-SHOCK) never split
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

function picture(im, { alt = "", sizes = "100vw", eager = false, cls = "", fade = false } = {}) {
  if (!im) return "";
  const dims = im.width ? ` width="${im.width}" height="${im.height}"` : "";
  const srcset = im.srcset ? ` srcset="${esc(im.srcset)}" sizes="${esc(sizes)}"` : "";
  const loading = eager ? ` fetchpriority="high"` : ` loading="lazy" decoding="async"`;
  const classes = [cls, fade ? "fade" : "", im.width && im.height > im.width ? "tall" : ""].filter(Boolean).join(" ");
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

const fmtLine = (p) => [p.formato, p.cliente].filter(Boolean).map((x) => keep(x)).join(" · ");
const fullTitle = (p) => (p.subtitulo ? `${p.titulo}, ${p.subtitulo}` : p.titulo);
const frames = (p, img) => (p.fotogramas.length ? p.fotogramas : [p.capa]).map(img).filter(Boolean);
const people = (p) => [p.realizacao && `Realização ${esc(p.realizacao)}`, p.fotografia && `Fotografia ${esc(p.fotografia)}`].filter(Boolean).join(" · ");

/** The studio address as lines, and a map link: the one set in the CMS, or a Google Maps search for the address. */
const addressLines = (s) => String(s || "").split(/\n+/).map((l) => l.trim()).filter(Boolean);
const mapHref = (c) => c.mapa || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLines(c.morada).join(", "))}`;

/** A heading's closing full stop in its own span, so a theme can colour it (the light trial paints it orange). */
const stopped = (t) => esc(t).replace(/\.$/, '<span class="stop">.</span>');

function ficha(rows, cls = "") {
  const items = rows.filter(([, v]) => v);
  return items.length ? `<dl class="ficha${cls ? " " + cls : ""}">${items.map(([l, v]) => `<div><dt>${l}</dt><dd>${v}</dd></div>`).join("")}</dl>` : "";
}

/** The measured palette of the grade: a thin bar of proportional swatches and their codes. */
const swatches = (p) => p.paleta.map((c) => `<span style="flex:${c.share.toFixed(4)} 1 0;background:${c.hex}"></span>`).join("");
const paletteLabel = (p) => p.paleta.map((c) => `${c.hex} ${Math.round(c.share * 100)}%`).join(", ");

/** The measured palette of the grade: colour only, no visible text (the label is for screen readers). */
function palette(p) {
  if (!p.paleta?.length) return "";
  return `<div class="palette bar" role="img" aria-label="Paleta da grade, da sombra à luz: ${paletteLabel(p)}">${swatches(p)}</div>`;
}

// ---------------------------------------------------------------- layout

function layout(ctx, { title, description, path, image, body, head = "", bodyClass = "", current = "" }) {
  const { site } = ctx;
  const docTitle = title ? `${title} · ${site.nome}` : `${site.nome} · color grading`;
  const canonical = site.url + path;
  const og = image ? site.url + image : "";
  const c = site.contacto || {};
  // The light trial uses the logo in its own blue; the dark site keeps the cream logo.
  const ed = ctx.versao === "editorial";
  const logo = ed ? "/logo-tinta.svg" : ctx.tema === "claro" ? "/logo-azul.svg" : "/logo.svg";
  const morada = addressLines(c.morada);
  return `<!doctype html>
<html lang="pt-PT"${ctx.tema && !ed ? ` data-tema="${esc(ctx.tema)}"` : ""}${ed ? ' data-versao="editorial"' : ""}>
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
<meta name="theme-color" content="${ctx.tema === "claro" ? "#F2EEE4" : ctx.tema === "azul" ? "#0F2645" : "#0b0b0b"}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/host-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin>${ed ? '\n<link rel="preload" href="/fonts/instrument-serif-latin.woff2" as="font" type="font/woff2" crossorigin>' : ""}
<link rel="stylesheet" href="${esc(ctx.assets?.css || "/site.css")}">
${head}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ""}>
<a class="skip" href="#conteudo">Saltar para o conteúdo</a>
<header class="mast" id="topo">
  <a class="brand" href="/"><img src="${logo}" alt="${esc(site.nome)}" width="104" height="48"></a>
  <nav aria-label="Principal">
    ${[["trabalho", "trabalho"], ["estudio", "estúdio"], ["contacto", "contacto"]]
      .map(([id, label]) => {
        // The red dot marks the section; aria-current only where the link is this very page.
        const on = current === id ? ' class="on"' : "";
        const here = path === `/${id}/` ? ' aria-current="page"' : "";
        return `<a href="/${id}/"${on}${here}>${label}</a>`;
      })
      .join("\n    ")}
  </nav>
</header>
<main id="conteudo">
${body}
</main>
${ed ? colophon(ctx, { c, morada, logo }) : `<footer class="foot">
  <div class="foot-top">
    <a class="foot-brand" href="/" aria-label="${esc(site.nome)}, início"><img src="${logo}" alt="" width="104" height="48"></a>
    <div class="foot-cols">
      <nav class="foot-col" aria-label="Contacto">
        <p class="foot-h">Contacto</p>
        <ul class="foot-links">
          ${c.email ? `<li><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>` : ""}
          ${c.telefone ? `<li><a href="${esc(telHref(c.telefone))}">${esc(c.telefone)}</a></li>` : ""}
        </ul>
      </nav>
      ${morada.length ? `<div class="foot-col">
        <p class="foot-h">Morada</p>
        <address class="foot-links"><a href="${esc(mapHref(c))}" rel="noopener" target="_blank">${morada.map(esc).join("<br>")}</a></address>
      </div>` : ""}
      ${c.instagram || c.vimeo ? `<nav class="foot-col" aria-label="Redes">
        <p class="foot-h">Redes</p>
        <ul class="foot-links">
          ${c.instagram ? `<li><a href="${esc(c.instagram)}" rel="me">Instagram</a></li>` : ""}
          ${c.vimeo ? `<li><a href="${esc(c.vimeo)}" rel="me">Vimeo</a></li>` : ""}
        </ul>
      </nav>` : ""}
      <nav class="foot-col" aria-label="Páginas">
        <p class="foot-h">Páginas</p>
        <ul class="foot-links">
          <li><a href="/trabalho/">Trabalho</a></li>
          <li><a href="/estudio/">Estúdio</a></li>
          <li><a href="/contacto/">Contacto</a></li>
        </ul>
      </nav>
    </div>
  </div>
  <div class="foot-base">
    <p>© ${new Date().getFullYear()} ${esc(site.nome)} · color grading</p>
    <a class="foot-top-link" href="#topo">Voltar ao topo <svg class="ico ico-up" viewBox="0 0 12 24" aria-hidden="true"><path d="M1 7l5-5 5 5M6 2v21"/></svg></a>
  </div>
</footer>`}
<script src="${esc(ctx.assets?.js || "/site.js")}" defer></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------- home

/**
 * The living mosaic: every project's cover in justified rows at its native
 * ratio (never cropped), and under it the studio statement. Without
 * JavaScript the rows simply wrap; site.js packs them so whole rows fill the
 * first screen, and swaps one tile at a time to another frame of the same
 * project, chosen only among frames of the cover's own ratio.
 */
function mosaic(ctx) {
  const { site, projects, img, reel } = ctx;
  const byDate = (a, b) => (b.data || "").localeCompare(a.data || "");
  const list = [...projects.filter((p) => p.destaque).sort(byDate), ...projects.filter((p) => !p.destaque)];
  const sizes = "(max-width: 760px) 50vw, 30vw";
  const cells = list
    .map((p, i) => {
      const im = img(p.capa);
      if (!im) return "";
      const r = im.width && im.height ? im.width / im.height : 16 / 9;
      const same = frames(p, img).filter((f) => f.src !== im.src && f.width && Math.abs(f.width / f.height - r) / r < 0.03);
      const alt = same.length ? [im, ...same].map((f) => [f.src, f.srcset]) : null;
      const meta = [p.formato, p.ano].filter(Boolean).join(" · ");
      // The name shows inside the tile only while it is pointed at or focused, on a solid chip in the corner.
      const name = `<span class="m-name" aria-hidden="true"><b>${keep(p.titulo)}</b><span>${esc(meta)}</span></span>`;
      return `<a class="m-cell" href="/trabalho/${esc(p.slug)}/" style="--r:${r.toFixed(4)}" aria-label="${esc(fullTitle(p))}"${alt ? ` data-frames="${esc(JSON.stringify(alt))}"` : ""}>${picture(im, { alt: "", sizes, eager: i < 8, fade: i >= 8 })}${name}</a>`;
    })
    .join("");
  // The headline is the owner's sentence from the CMS; the line beside it is computed, so its numbers stay true.
  const head = String(site.intro || "").trim();
  const f = facts(projects);
  const rest = `Estúdio de color grading em Lisboa. Desde ${f.desde}, demos cor a vários projetos de ${f.generos}.`;
  return `<section class="mosaic" aria-label="Trabalhos">
    <div class="m-wall">${cells}</div>
    <div class="m-band">
      <div class="m-lead"><h1 class="m-h">${stopped(head)}</h1>${reel ? `<button type="button" class="play-btn" data-embed="${esc(reel)}" data-title="Showreel">${PLAY} Ver showreel</button>` : ""}</div>
      ${rest ? `<p class="m-side">${esc(rest)}</p>` : ""}
    </div>
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
            fade: true,
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
          <td>${keep(p.formato)}</td>
          <td class="c-opt">${esc(p.realizacao)}</td>
          <td class="c-opt">${esc(p.fotografia)}</td>
          <td class="c-opt c-ratio">${esc(p.proporcao)}</td>
          <td class="c-ano">${p.ano}</td>
        </tr>`,
    )
    .join("\n        ");
  return `<section id="trabalho" class="work" aria-label="Todos os projetos">
    <div class="work-bar">
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
        <thead><tr><th scope="col">Título</th><th scope="col">Formato</th><th scope="col" class="c-opt">Realização</th><th scope="col" class="c-opt">Fotografia</th><th scope="col" class="c-opt c-ratio">Proporção</th><th scope="col" class="c-ano">Ano</th></tr></thead>
        <tbody>
        ${rows}
        </tbody>
      </table>
    </div>
  </section>`;
}

/** The studio text beside the technical sheet; on the home page under a visible heading, on /estudio/ under the page title. */
function studioGrid(ctx, after = "") {
  const { site, img } = ctx;
  const tech = (site.tecnico || []).filter((t) => t?.rotulo && t?.valor);
  const foto = site.sobre?.foto ? img(site.sobre.foto) : null;
  const sheet = ficha(tech.map((t) => [esc(t.rotulo), esc(t.valor)]), "ficha-rows");
  const text = `<div class="studio-text">${paragraphs(site.sobre?.texto)}</div>`;
  // With the studio photo: photo on the left, text and technical sheet stacked on the right.
  return foto
    ? `<div class="studio-grid has-photo">
      <figure class="studio-photo">${picture(foto, { alt: site.sobre.foto_alt || "", sizes: "(max-width: 960px) 100vw, 36vw", fade: true })}</figure>
      <div class="studio-body">${text}${sheet}${after}</div>
    </div>`
    : `<div class="studio-grid">
      ${text}
      <div>${sheet}${after}</div>
    </div>`;
}

/** Onward links in the large voice, each with a drawn arrow. */
const onward = (links) =>
  `<p class="onward">${links.map(([href, label]) => `<a href="${href}">${label} ${ARROW_RIGHT}</a>`).join("")}</p>`;

/** Inner pages open on a plain title; a count, when given, sits raised beside it like the filter counts. */
const pageHead = (title, count) =>
  `<header class="page-head"><h1>${esc(title)}<span class="stop page-stop" aria-hidden="true">.</span>${count ? `<sup>${count}</sup>` : ""}</h1></header>`;

function contact(ctx) {
  const c = ctx.site.contacto || {};
  const ig = c.instagram ? c.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "") : "";
  const form = c.formspree
    ? `<form class="form" data-email="${esc(c.email || "")}" action="https://formspree.io/f/${esc(c.formspree)}" method="POST">
        <div class="field"><label for="f-nome">Nome</label><input id="f-nome" name="nome" autocomplete="name"></div>
        <div class="field"><label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
        <div class="field"><label for="f-projeto">Projeto</label><input id="f-projeto" name="projeto" placeholder="Formato, duração, câmara, data de entrega"></div>
        <div class="field"><label for="f-msg">Mensagem</label><textarea id="f-msg" name="mensagem" rows="4" required></textarea></div>
        <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" class="hp">
        <button type="submit">Enviar pedido ${ARROW_RIGHT}</button>
        <p class="form-status" role="status"></p>
      </form>`
    : "";
  return `<section id="contacto" class="contact" aria-label="Contacto">
    <div class="contact-grid">
      <div class="contact-main">
        ${c.email ? `<p class="mail"><a href="mailto:${esc(c.email)}">${esc(c.email).replace("@", '<span class="stop">@</span><wbr>')}</a></p>` : ""}
        ${paragraphs(c.texto)}
        ${ficha(
          [
            ["Telefone", c.telefone ? `<a href="${esc(telHref(c.telefone))}">${esc(c.telefone)}</a>` : ""],
            ["Instagram", c.instagram ? `<a href="${esc(c.instagram)}" rel="me">${esc(ig)}</a>` : ""],
            ["Vimeo", c.vimeo ? `<a href="${esc(c.vimeo)}" rel="me">Vimeo</a>` : ""],
            ["Morada", addressLines(c.morada).length ? `<a href="${esc(mapHref(c))}" rel="noopener" target="_blank">${addressLines(c.morada).map(esc).join("<br>")}</a>` : ""],
          ],
          "ficha-rows",
        )}
      </div>
      ${form}
    </div>
  </section>`;
}

export function renderHome(ctx) {
  const { site, projects, redirects } = ctx;
  if (ctx.versao === "editorial") return renderHomeEditorial(ctx);
  const reel = embedUrl(site.showreel);
  const firstFeatured = projects.find((p) => p.destaque) || projects[0];
  // Older versions lived on one page: #project/<slug>, #work and the section anchors now go to their own pages.
  const pages = { "#work": "/trabalho/", "#trabalho": "/trabalho/", "#cor": "/trabalho/", "#estudio": "/estudio/", "#contacto": "/contacto/" };
  const redirectScript = `<script>(function(){var m=${JSON.stringify(redirects)},p=${JSON.stringify(pages)};function go(){var h=location.hash;if(h.indexOf("#project/")===0){var s=m[h.slice(9)];location.replace(s?"/trabalho/"+s+"/":"/trabalho/");}else if(p[h]){location.replace(p[h]);}}go();addEventListener("hashchange",go);})();</script>`;
  const body = `
  ${mosaic({ ...ctx, reel })}
  <section class="studio" aria-labelledby="h-nosso">
    <h2 id="h-nosso" class="sec-h">${stopped(site.sobre?.titulo || "O nosso trabalho")}</h2>
    ${studioGrid(ctx, onward([["/trabalho/", "Ver todo o trabalho"], ["/contacto/", "Pedir orçamento"]]))}
  </section>`;
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

export function renderWork(ctx) {
  const { projects } = ctx;
  const first = projects.find((p) => p.destaque) || projects[0];
  return layout(ctx, {
    title: "Trabalho",
    description: (() => { const f = facts(projects); return `Os ${f.n} projetos de color grading da ${ctx.site.nome} ${f.periodo}: ${f.list}.`; })(),
    path: "/trabalho/",
    image: first ? ctx.img(first.capa)?.src : "",
    body: `
  ${pageHead("Trabalho")}
  ${work(ctx)}`,
    current: "trabalho",
    bodyClass: "page-work",
  });
}

// ---------------------------------------------------------------- editorial version (VERSAO=editorial, 2026-11-25)
// A film catalogue in print: paper and ink, a serif display face, the latest work as the issue's cover with a
// caption, the studio text set as a lead with a drop cap, the whole body of work as an index whose rows call up their
// cover, two recent projects as spreads with their credits set like a film's, and a colophon for a footer.
// Frames stay whole: at their own ratio, never cropped, filtered or written over.

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

function renderHomeEditorial(ctx) {
  const { site, projects, img } = ctx;
  const recent = projects.filter((p) => p.destaque);
  const cover = recent[0] || projects[0];
  const coverIm = cover ? img(cover.capa) : null;
  const d = new Date();
  const people = (p) => [p.realizacao && `realização de ${esc(p.realizacao)}`, p.fotografia && `fotografia de ${esc(p.fotografia)}`].filter(Boolean).join(", ");

  const head = `<section class="e-cover" aria-labelledby="h-e">
    <h1 id="h-e" class="e-h">Fazemos a <em>cor</em> de séries, filmes e publicidade<span class="stop">.</span></h1>
    ${coverIm ? `<figure class="e-cover-fig">
      <a href="/trabalho/${esc(cover.slug)}/">${picture(coverIm, { alt: `${fullTitle(cover)}, fotograma`, sizes: "100vw", eager: true })}</a>
      <figcaption><span><em>Na capa:</em> ${keep(fullTitle(cover))} (${esc([cover.formato, cover.ano].filter(Boolean).join(", "))})${people(cover) ? `, ${people(cover)}` : ""}.</span><span>Lisboa, ${MESES[d.getMonth()]} de ${d.getFullYear()}</span></figcaption>
    </figure>` : ""}
  </section>`;

  const texto = String(site.sobre?.texto || "").split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean);
  const lead = `<section class="e-lead" aria-labelledby="h-e-lead">
    <h2 id="h-e-lead" class="e-h2">${stopped(site.sobre?.titulo || "")}</h2>
    <div class="e-lead-text">${texto.map((t, i) => `<p${i ? "" : ' class="e-drop"'}>${esc(t)}</p>`).join("")}</div>
  </section>`;

  const rows = projects.map((p, i) => {
    const im = img(p.capa);
    return `<li><a class="e-row" href="/trabalho/${esc(p.slug)}/"${im ? ` data-src="${esc(im.src)}" data-srcset="${esc(im.srcset || "")}"` : ""}>
        <span class="e-n">${pad2(i + 1)}</span>
        <span class="e-t">${keep(p.titulo)}${p.subtitulo ? ` <em>${esc(p.subtitulo)}</em>` : ""}</span>
        <span class="e-f">${esc(p.formato || "")}</span>
        <span class="e-y">${p.ano}</span>
        ${im ? `<span class="e-thumb" aria-hidden="true">${picture(im, { alt: "", sizes: "120px", fade: true })}</span>` : ""}
      </a></li>`;
  }).join("\n      ");
  const index = `<section class="e-index" aria-labelledby="h-e-index">
    <div class="e-index-head"><h2 id="h-e-index" class="e-h2">Índice<sup>${projects.length}</sup></h2><a class="e-more" href="/trabalho/">Ver em grelha</a></div>
    <ol class="e-rows">${rows}</ol>
    <div class="e-peek" aria-hidden="true"><img alt=""></div>
  </section>`;

  const credits = (p) => [["Realização", p.realizacao], ["Direção de fotografia", p.fotografia], ["Produção", p.producao], ["Cliente", p.cliente]].filter(([, v]) => v);
  const spreads = recent.slice(1, 3).map((p, k) => {
    const fr = frames(p, img);
    const big = fr[0], small = fr.slice(1, 3);
    return `<article class="e-spread${k % 2 ? " flip" : ""}">
      <figure class="e-sp-big"><a href="/trabalho/${esc(p.slug)}/">${picture(big, { alt: `${fullTitle(p)}, fotograma`, sizes: "(max-width: 960px) 100vw, 60vw", fade: true })}</a></figure>
      <div class="e-sp-text">
        <h3 class="e-sp-t"><a href="/trabalho/${esc(p.slug)}/">${keep(p.titulo)}</a></h3>
        <p class="e-sp-f">${esc([p.formato, p.ano].filter(Boolean).join(", "))}</p>
        <dl class="e-credits">${credits(p).map(([r, v]) => `<div><dt>${esc(r)}</dt><dd>${esc(v)}</dd></div>`).join("")}<div><dt>Cor</dt><dd>zema studios</dd></div></dl>
        <div class="e-sp-small">${small.map((im) => `<figure>${picture(im, { alt: "", sizes: "(max-width: 960px) 50vw, 18vw", fade: true })}</figure>`).join("")}</div>
      </div>
    </article>`;
  }).join("");
  const detail = spreads ? `<section class="e-detail" aria-labelledby="h-e-detail"><h2 id="h-e-detail" class="e-h2">Em pormenor</h2>${spreads}</section>` : "";

  return layout(ctx, {
    title: "",
    description: site.descricao,
    path: "/",
    image: coverIm ? coverIm.src : "",
    body: head + lead + index + detail,
    bodyClass: "home e-home",
  });
}

/** The footer as a magazine's colophon: who, how, where, and the email set large. */
function colophon(ctx, { c, morada, logo }) {
  const { site } = ctx;
  const tech = (site.tecnico || []).filter((t) => t?.rotulo && t?.valor);
  return `<footer class="e-foot">
  <p class="e-foot-ask">Tem um projeto? Escreva-nos.</p>
  ${c.email ? `<p class="e-foot-mail"><a href="mailto:${esc(c.email)}">${esc(c.email).replace("@", '<span class="stop">@</span><wbr>')}</a></p>` : ""}
  <div class="e-colo">
    <div><h2>Colofão</h2><a class="e-foot-brand" href="/" aria-label="${esc(site.nome)}, início"><img src="${logo}" alt="" width="104" height="48"></a></div>
    <dl>${tech.map((t) => `<div><dt>${esc(t.rotulo)}</dt><dd>${esc(t.valor)}</dd></div>`).join("")}</dl>
    <dl>
      ${c.telefone ? `<div><dt>Telefone</dt><dd><a href="${esc(telHref(c.telefone))}">${esc(c.telefone)}</a></dd></div>` : ""}
      ${morada.length ? `<div><dt>Morada</dt><dd><a href="${esc(mapHref(c))}" rel="noopener" target="_blank">${morada.map(esc).join("<br>")}</a></dd></div>` : ""}
      ${c.instagram ? `<div><dt>Instagram</dt><dd><a href="${esc(c.instagram)}" rel="me">${esc(c.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, ""))}</a></dd></div>` : ""}
    </dl>
    <nav aria-label="Páginas"><ul><li><a href="/trabalho/">Trabalho</a></li><li><a href="/estudio/">Estúdio</a></li><li><a href="/contacto/">Contacto</a></li><li><a href="#topo">Voltar ao topo</a></li></ul></nav>
  </div>
  <p class="e-foot-base">© ${new Date().getFullYear()} ${esc(site.nome)}, color grading, Lisboa</p>
</footer>`;
}

export function renderStudio(ctx) {
  const { site } = ctx;
  const reel = embedUrl(site.showreel);
  return layout(ctx, {
    title: "Estúdio",
    description: site.descricao,
    path: "/estudio/",
    body: `
  ${pageHead("Estúdio")}
  <section class="studio" aria-labelledby="h-sobre">
    <h2 id="h-sobre" class="sec-h">${stopped(site.sobre?.titulo || "O nosso trabalho")}</h2>
    ${studioGrid(ctx, (reel ? `<p class="studio-reel"><button type="button" class="play-btn" data-embed="${esc(reel)}" data-title="Showreel">${PLAY} Ver showreel</button></p>` : "") + onward([["/trabalho/", "Ver todo o trabalho"], ["/contacto/", "Pedir orçamento"]]))}
  </section>`,
    current: "estudio",
  });
}

export function renderContact(ctx) {
  const { site } = ctx;
  return layout(ctx, {
    title: "Contacto",
    description: site.contacto?.texto || site.descricao,
    path: "/contacto/",
    body: `
  ${pageHead("Contacto")}
  ${contact(ctx)}`,
    current: "contacto",
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
      fade: true,
    })}</a><figcaption><span>${pad2(i + 1)}</span><span>${esc(im.ratio || "")}</span></figcaption></figure>`;

  const [first, ...rest] = stills;
  const nextIm = next ? img(next.capa) : null;
  const body = `
  <article class="project-page">
    <div class="lead">
      <figure class="lead-fig">
        <a class="still lead-frame" href="${esc(first.src)}" data-index="0">${picture(first, { alt: `${fullTitle(p)}, fotograma 1`, sizes: "100vw", eager: true })}</a>
        <figcaption><span>${pad2(1)} / ${pad2(total)}</span><span>${esc(first.ratio || "")}</span></figcaption>
      </figure>
    </div>
    <header class="p-head">
      <div class="p-title">
        <p class="p-meta"><a href="/trabalho/">${ARROW_LEFT} Trabalho</a><span>${pad2(idx)} / ${pad2(projects.length)}</span></p>
        <h1>${keep(p.titulo)}</h1>
        ${p.subtitulo ? `<p class="sub">${esc(p.subtitulo)}</p>` : ""}
        <p class="fmt">${fmtLine(p)} · ${p.ano}</p>
        ${embed ? `<div class="trailer"><button type="button" class="play-btn" data-embed="${esc(embed)}" data-title="Trailer de ${esc(fullTitle(p))}">${PLAY} Ver trailer</button></div>` : ""}
      </div>
      <div class="p-side">
        ${ficha(FICHA.map(([k, l]) => [l, esc(p[k] || "")]), "ficha-rows")}
        ${palette(p)}
      </div>
    </header>
    ${p.notas ? `<div class="notes">${paragraphs(p.notas)}</div>` : ""}
    ${
      rest.length
        ? `<div class="stills${rest.every((im) => im.height > im.width) ? ` stills-tall" style="--cols:${Math.min(rest.length, 5)}` : ""}" data-gallery>
      ${(rest.every((im) => im.height > im.width) ? rest.map((im) => ({ im, span: 1 })) : packStills(rest))
        .map(({ im, span }, i) => `<div class="cell span-${span}">${still(im, i + 1, span === 4 ? "100vw" : span === 2 ? "(max-width: 760px) 100vw, 50vw" : "(max-width: 760px) 50vw, 25vw")}</div>`)
        .join("\n      ")}
    </div>`
        : ""
    }
    <nav class="next" aria-label="Outros trabalhos">
      ${
        next
          ? `<a class="next-link" href="/trabalho/${esc(next.slug)}/">
        <span class="next-frame" style="aspect-ratio:${nextIm.width || 16} / ${nextIm.height || 9}">${picture(nextIm, { alt: "", sizes: "(max-width: 900px) 100vw, 60vw", fade: true })}</span>
        <span class="next-text"><span class="next-label">Seguinte ${ARROW_RIGHT}</span><b>${keep(next.titulo)}</b><span>${fmtLine(next)} · ${next.ano}</span></span>
      </a>`
          : ""
      }
      <p class="next-row">
        ${prev ? `<a class="prev-link" href="/trabalho/${esc(prev.slug)}/">${ARROW_LEFT} ${esc(prev.titulo)}</a>` : "<span></span>"}
        <a class="prev-link" href="/trabalho/">Todo o trabalho</a>
      </p>
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
    description: `${description}. Color grading da ${ctx.site.nome}, em Lisboa.`,
    path: `/trabalho/${p.slug}/`,
    image: cover?.src,
    body,
    bodyClass: "project",
    current: "trabalho",
  });
}

export function renderNotFound(ctx) {
  return layout(ctx, {
    title: "Página não encontrada",
    path: "/404.html",
    body: `<div class="notfound"><h1>Página não encontrada</h1><p>O endereço mudou ou foi escrito com um erro.</p><p><a href="/trabalho/">${ARROW_LEFT} Ver todo o trabalho</a></p></div>`,
  });
}
