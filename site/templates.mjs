// HTML templates. Every value that comes from content/ goes through esc().

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

const CREDITOS = [
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
  return `<img${cls ? ` class="${cls}"` : ""} src="${esc(im.src)}"${srcset}${dims} alt="${esc(alt)}"${loading}>`;
}

/** "Artur Ribeiro, Tiago Guedes & X e Y" -> ["Artur Ribeiro", "Tiago Guedes", "X", "Y"] */
const people = (s) =>
  String(s || "")
    .split(/\s*(?:,|&|\be\b|\/)\s*/)
    .map((x) => x.trim())
    .filter(Boolean);

function collaborators(projects, key) {
  const counts = new Map();
  for (const p of projects) for (const n of new Set(people(p[key]))) counts.set(n, (counts.get(n) || 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt")).map(([n]) => n);
}

const metaLine = (p) => [p.formato, p.ano, p.cliente].filter(Boolean).map(esc).join(" · ");

// ---------------------------------------------------------------- layout

function layout(ctx, { title, description, path, image, body, head = "" }) {
  const { site } = ctx;
  const fullTitle = title ? `${title} — ${site.nome}` : `${site.nome} — Color grading, Lisboa`;
  const canonical = site.url + path;
  const og = image ? site.url + image : "";
  return `<!doctype html>
<html lang="pt-PT">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description || site.descricao)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.nome)}">
<meta property="og:title" content="${esc(title || site.nome)}">
<meta property="og:description" content="${esc(description || site.descricao)}">
<meta property="og:url" content="${esc(canonical)}">
${og ? `<meta property="og:image" content="${esc(og)}">\n<meta name="twitter:card" content="summary_large_image">` : ""}
<meta name="theme-color" content="#121212">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/site.css">
${head}
</head>
<body>
<a class="skip" href="#conteudo">Saltar para o conteúdo</a>
<header class="top">
  <a class="brand" href="/" aria-label="${esc(site.nome)}, página inicial"><img src="/logo.svg" alt="" width="104" height="48"></a>
  <nav aria-label="Principal">
    <a href="/#trabalho">Trabalho</a>
    <a href="/#sobre">Sobre</a>
    <a href="/#contacto">Contacto</a>
  </nav>
</header>
<main id="conteudo">
${body}
</main>
<footer class="foot">
  <span>© ${new Date().getFullYear()} ${esc(site.nome)} · Lisboa</span>
  <span class="foot-links">
    ${site.contacto?.email ? `<a href="mailto:${esc(site.contacto.email)}">${esc(site.contacto.email)}</a>` : ""}
    ${site.contacto?.instagram ? `<a href="${esc(site.contacto.instagram)}" rel="me">Instagram</a>` : ""}
    ${site.contacto?.vimeo ? `<a href="${esc(site.contacto.vimeo)}" rel="me">Vimeo</a>` : ""}
  </span>
</footer>
<script src="/site.js" defer></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------- home

function hero(ctx) {
  const featured = ctx.projects.filter((p) => p.destaque);
  if (!featured.length) return "";
  const slides = featured
    .map((p, i) => {
      const im = ctx.img(p.capa);
      const credits = [p.realizacao && `Realização ${esc(p.realizacao)}`, p.fotografia && `Fotografia ${esc(p.fotografia)}`].filter(Boolean).join(" · ");
      return `<figure class="slide"${i ? " hidden" : ""}>
      ${picture(im, { alt: `Fotograma de ${p.titulo}`, sizes: "100vw", eager: i === 0 })}
      <figcaption><a href="/trabalho/${esc(p.slug)}/">${esc(p.titulo)}</a>${credits ? ` <span class="cap-credits">${credits}</span>` : ""}</figcaption>
    </figure>`;
    })
    .join("\n    ");
  const controls =
    featured.length > 1
      ? `<div class="slide-ctl">
      <button type="button" data-slide="prev" aria-label="Imagem anterior">←</button>
      <span class="slide-n" aria-live="polite">1 / ${featured.length}</span>
      <button type="button" data-slide="next" aria-label="Imagem seguinte">→</button>
    </div>`
      : "";
  return `<section class="hero" aria-roledescription="carrossel" aria-label="Trabalhos em destaque">
    ${slides}
    ${controls}
  </section>`;
}

function workSection(ctx) {
  const { projects, img } = ctx;
  const counts = Object.fromEntries(CATEGORIAS.map(([k]) => [k, 0]));
  for (const p of projects) counts[FORMATOS[p.formato]]++;
  const filters = [
    `<button type="button" data-filter="all" aria-pressed="true">Tudo <span>${projects.length}</span></button>`,
    ...CATEGORIAS.filter(([k]) => counts[k]).map(
      ([k, label]) => `<button type="button" data-filter="${k}" aria-pressed="false">${label} <span>${counts[k]}</span></button>`,
    ),
  ].join("\n        ");

  const cards = projects
    .map((p) => {
      const credits = [p.realizacao && `Real. ${esc(p.realizacao)}`, p.fotografia && `Fot. ${esc(p.fotografia)}`].filter(Boolean).join(" · ");
      return `<li class="card" data-cat="${FORMATOS[p.formato]}">
        <a href="/trabalho/${esc(p.slug)}/">
          <div class="card-img">${picture(img(p.capa), { sizes: "(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw" })}</div>
          <h3>${esc(p.titulo)}</h3>
          <p class="card-meta">${esc(p.formato)} · ${p.ano}</p>
          ${credits ? `<p class="card-credits">${credits}</p>` : ""}
        </a>
      </li>`;
    })
    .join("\n      ");

  const rows = projects
    .map(
      (p) => `<tr data-cat="${FORMATOS[p.formato]}">
          <td class="c-ano">${p.ano}</td>
          <th scope="row"><a href="/trabalho/${esc(p.slug)}/">${esc(p.titulo)}</a></th>
          <td>${esc(p.formato)}</td>
          <td class="c-opt">${esc(p.realizacao)}</td>
          <td class="c-opt">${esc(p.fotografia)}</td>
          <td class="c-opt">${esc(p.producao)}</td>
        </tr>`,
    )
    .join("\n        ");

  return `<section id="trabalho" class="work wrap" aria-labelledby="h-trabalho">
    <div class="work-bar">
      <h2 id="h-trabalho">Trabalho</h2>
      <div class="filters" role="group" aria-label="Filtrar por formato">
        ${filters}
      </div>
      <div class="views" role="group" aria-label="Vista">
        <button type="button" data-view="grid" aria-pressed="true">Grelha</button>
        <button type="button" data-view="list" aria-pressed="false">Lista</button>
      </div>
    </div>
    <ul class="grid" data-pane="grid">
      ${cards}
    </ul>
    <div class="list-wrap" data-pane="list" hidden>
      <table class="list">
        <thead><tr><th scope="col" class="c-ano">Ano</th><th scope="col">Título</th><th scope="col">Formato</th><th scope="col" class="c-opt">Realização</th><th scope="col" class="c-opt">Fotografia</th><th scope="col" class="c-opt">Produção</th></tr></thead>
        <tbody>
        ${rows}
        </tbody>
      </table>
    </div>
  </section>`;
}

function aboutSection(ctx) {
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

  return `<section id="sobre" class="about wrap" aria-labelledby="h-sobre">
    <h2 id="h-sobre">Sobre</h2>
    <div class="about-grid">
      <div class="about-text">
        ${paragraphs(s.texto)}
        ${
          team.length
            ? `<ul class="team">${team
                .map(
                  (m) => `<li>${m.foto ? picture(img(m.foto), { alt: m.nome, sizes: "160px" }) : ""}<div><h3>${esc(m.nome)}</h3>${m.funcao ? `<p class="muted">${esc(m.funcao)}</p>` : ""}${paragraphs(m.bio)}</div></li>`,
                )
                .join("")}</ul>`
            : ""
        }
        ${
          tech.length
            ? `<dl class="tech">${tech.map((t) => `<div><dt>${esc(t.rotulo)}</dt><dd>${esc(t.valor)}</dd></div>`).join("")}</dl>`
            : ""
        }
      </div>
      ${s.foto ? `<div class="about-photo">${picture(img(s.foto), { alt: `${site.nome}`, sizes: "(max-width: 900px) 60vw, 25vw" })}</div>` : ""}
    </div>
    ${
      groups.length
        ? `<div class="collab">
      <h3>Com quem trabalhámos</h3>
      <dl>${groups.map(([label, names]) => `<div><dt>${label}</dt><dd>${names.map(esc).join(", ")}</dd></div>`).join("")}</dl>
    </div>`
        : ""
    }
  </section>`;
}

function contactSection(ctx) {
  const c = ctx.site.contacto || {};
  const form = c.formspree
    ? `<form class="form" action="https://formspree.io/f/${esc(c.formspree)}" method="POST">
        <div class="field"><label for="f-nome">Nome</label><input id="f-nome" name="nome" autocomplete="name"></div>
        <div class="field"><label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
        <div class="field"><label for="f-msg">Mensagem</label><textarea id="f-msg" name="mensagem" rows="5" required></textarea></div>
        <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" class="hp">
        <button type="submit">Enviar</button>
        <p class="form-status" role="status"></p>
      </form>`
    : "";
  return `<section id="contacto" class="contact wrap" aria-labelledby="h-contacto">
    <h2 id="h-contacto">Contacto</h2>
    <div class="contact-grid">
      <div>
        ${paragraphs(c.texto)}
        ${c.email ? `<p class="contact-email"><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>` : ""}
        <ul class="contact-list">
          ${c.telefone ? `<li><a href="${esc(telHref(c.telefone))}">${esc(c.telefone)}</a></li>` : ""}
          ${c.instagram ? `<li><a href="${esc(c.instagram)}" rel="me">Instagram</a></li>` : ""}
          ${c.vimeo ? `<li><a href="${esc(c.vimeo)}" rel="me">Vimeo</a></li>` : ""}
          <li>Lisboa, Portugal</li>
        </ul>
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
  const redirectScript = `<script>(function(){var m=${JSON.stringify(redirects)};function go(){var h=location.hash;if(h.indexOf("#project/")===0){var s=m[h.slice(9)];location.replace(s?"/trabalho/"+s+"/":"/#trabalho");}else if(h==="#work"){location.replace("/#trabalho");}}go();addEventListener("hashchange",go);})();</script>`;
  const body = `
  ${hero(ctx)}
  <div class="intro wrap">
    <p>${esc(site.intro)}</p>
    ${reel ? `<button type="button" class="reel-btn" data-embed="${esc(reel)}" data-title="Showreel">Ver showreel</button>` : ""}
  </div>
  ${workSection(ctx)}
  ${aboutSection(ctx)}
  ${contactSection(ctx)}`;
  return layout(ctx, {
    title: "",
    description: site.descricao,
    path: "/",
    image: firstFeatured ? ctx.img(firstFeatured.capa)?.src : "",
    body,
    head: redirectScript,
  });
}

// ---------------------------------------------------------------- project

export function renderProject(ctx, p, prev, next) {
  const { img } = ctx;
  const stills = (p.fotogramas.length ? p.fotogramas : [p.capa]).map((src) => img(src));
  const credits = CREDITOS.filter(([k]) => p[k]).map(([k, label]) => `<div><dt>${label}</dt><dd>${esc(p[k])}</dd></div>`);
  const embed = embedUrl(p.video);
  const cover = img(p.capa);

  const figure = (im, i, sizes) =>
    `<a class="still" href="${esc(im.src)}" data-index="${i}">${picture(im, {
      alt: `${p.titulo}, fotograma ${i + 1}`,
      sizes,
      eager: i === 0,
    })}</a>`;

  const [first, ...rest] = stills;
  const body = `
  <article class="project wrap">
    <p class="back"><a href="/#trabalho">← Trabalho</a></p>
    <header class="project-head">
      <p class="project-meta">${metaLine(p)}</p>
      <h1>${esc(p.titulo)}</h1>
      ${credits.length ? `<dl class="credits">${credits.join("")}</dl>` : ""}
      ${p.notas ? `<div class="notes">${paragraphs(p.notas)}</div>` : ""}
    </header>
    <div class="stills" data-gallery>
      ${figure(first, 0, "(max-width: 1680px) 100vw, 1680px")}
      ${rest.length ? `<div class="stills-rest">${rest.map((im, i) => figure(im, i + 1, "(max-width: 700px) 100vw, 50vw")).join("\n      ")}</div>` : ""}
    </div>
    ${
      embed
        ? `<section class="trailer" aria-label="Trailer">
      <h2>Trailer</h2>
      <button type="button" class="trailer-btn" data-embed="${esc(embed)}" data-title="Trailer de ${esc(p.titulo)}">▶ Ver trailer</button>
    </section>`
        : ""
    }
    <nav class="pager" aria-label="Outros trabalhos">
      ${prev ? `<a class="prev" href="/trabalho/${esc(prev.slug)}/"><span>Anterior</span>${esc(prev.titulo)}</a>` : "<span></span>"}
      ${next ? `<a class="next" href="/trabalho/${esc(next.slug)}/"><span>Seguinte</span>${esc(next.titulo)}</a>` : "<span></span>"}
    </nav>
  </article>
  <dialog class="lightbox" aria-label="Fotogramas">
    <img alt="">
    <p class="lb-n" aria-live="polite"></p>
    <button type="button" class="lb-close" aria-label="Fechar">Fechar</button>
    <button type="button" class="lb-prev" aria-label="Anterior">←</button>
    <button type="button" class="lb-next" aria-label="Seguinte">→</button>
  </dialog>`;

  const description = [p.formato + (p.ano ? `, ${p.ano}` : ""), p.realizacao && `realização de ${p.realizacao}`, p.fotografia && `fotografia de ${p.fotografia}`]
    .filter(Boolean)
    .join(", ");
  return layout(ctx, {
    title: p.titulo,
    description: `${description}. Color grading: ${ctx.site.nome}.`,
    path: `/trabalho/${p.slug}/`,
    image: cover?.src,
    body,
  });
}

export function renderNotFound(ctx) {
  return layout(ctx, {
    title: "Página não encontrada",
    path: "/404.html",
    body: `<div class="wrap notfound"><h1>Página não encontrada</h1><p>Este endereço não existe ou mudou. <a href="/#trabalho">Ver todos os trabalhos</a>.</p></div>`,
  });
}
