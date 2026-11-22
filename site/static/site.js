// Progressive enhancement only: every page works without this file.
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover)").matches;

  // ---------------------------------------------------------- frames appear once decoded
  document.querySelectorAll("img.fade").forEach(function (img) {
    var show = function () { img.classList.add("ok"); };
    if (img.complete && img.naturalWidth) show();
    else { img.addEventListener("load", show); img.addEventListener("error", show); }
  });

  // ---------------------------------------------------------- nav: the red dot follows the section in view
  var spyLinks = document.querySelectorAll(".mast [data-spy]");
  var spyTargets = Array.prototype.map.call(spyLinks, function (a) { return document.getElementById(a.dataset.spy); }).filter(Boolean);
  if (spyTargets.length) {
    var ticking = false;
    var mark = function () {
      ticking = false;
      // The last section whose top has passed the upper third of the screen is the current one.
      var current = "";
      spyTargets.forEach(function (t) { if (t.getBoundingClientRect().top < window.innerHeight * 0.35) current = t.id; });
      spyLinks.forEach(function (a) {
        var on = a.dataset.spy === current;
        a.classList.toggle("on", on);
        if (on) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
      });
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(mark); } }, { passive: true });
    mark();
  }

  // ---------------------------------------------------------- mosaic: whole rows fill the first screen
  var mo = document.querySelector(".mosaic");
  if (mo) {
    var wall = mo.querySelector(".m-wall");
    var cells = Array.prototype.slice.call(wall.querySelectorAll(".m-cell"));
    var ratios = cells.map(function (c) { return parseFloat(c.style.getPropertyValue("--r")) || 16 / 9; });
    var spare = document.createElement("div"); // cells that do not fit this screen wait here, out of the page
    spare.hidden = true;
    mo.appendChild(spare);
    var lastW = 0, lastH = 0;

    // Greedy justified rows for a target height h: a row closes once its height (width over the sum of ratios) drops to h.
    var rowsFor = function (W, g, h) {
      var rows = [], row = [], sum = 0;
      for (var i = 0; i < cells.length; i++) {
        row.push(i); sum += ratios[i];
        var rh = (W - (row.length - 1) * g) / sum;
        if (rh <= h) { rows.push({ items: row, h: rh }); row = []; sum = 0; }
      }
      return rows;
    };
    var pack = function () {
      var W = wall.clientWidth, H = wall.clientHeight;
      if (!W || !H || (W === lastW && H === lastH)) return;
      lastW = W; lastH = H;
      var g = parseFloat(getComputedStyle(mo).getPropertyValue("--gap")) || 6;
      var perRow = W < 1100 ? 3 : 4;
      // Preferred row height: a 16:9 cover sits perRow to a line, but never fewer than about four rows on a tall screen.
      var pref = Math.min((W - (perRow - 1) * g) / perRow / 1.78, H / 3.6);
      var best = null;
      for (var h = Math.round(pref * 0.6); h <= Math.round(pref * 1.7); h++) {
        var rows = rowsFor(W, g, h), used = 0, n = 0;
        while (n < rows.length && used + rows[n].h + (n ? g : 0) <= H) { used += rows[n].h + (n ? g : 0); n++; }
        if (!n) continue;
        // Least empty space under the last row wins; among near ties, the size closest to the preferred one.
        var score = H - used + Math.abs(h - pref) * 0.35;
        if (!best || score < best.score) best = { score: score, rows: rows.slice(0, n) };
      }
      if (!best) return;
      var frag = document.createDocumentFragment(), shown = {};
      best.rows.forEach(function (r) {
        var line = document.createElement("div");
        line.className = "m-row";
        r.items.forEach(function (i) { line.appendChild(cells[i]); shown[i] = true; });
        frag.appendChild(line);
      });
      cells.forEach(function (c, i) { if (!shown[i]) spare.appendChild(c); });
      wall.textContent = "";
      wall.appendChild(frag);
      wall.classList.add("packed");
    };
    pack();
    if (window.ResizeObserver) new ResizeObserver(function () { requestAnimationFrame(pack); }).observe(wall);
    else window.addEventListener("resize", function () { requestAnimationFrame(pack); });

    // Pointing at a tile names it in the band.
    var cap = mo.querySelector(".m-cap");
    var naming = function (c) {
      if (c) { cap.firstChild.textContent = c.dataset.t; cap.lastChild.textContent = c.dataset.m; }
      mo.classList.toggle("m-naming", !!c);
    };
    cells.forEach(function (c) {
      c.addEventListener("mouseenter", function () { naming(c); });
      c.addEventListener("mouseleave", function () { naming(null); });
      c.addEventListener("focus", function () { naming(c); });
      c.addEventListener("blur", function () { naming(null); });
    });

    // One tile at a time turns to another frame of its project, crossfading over the one it replaces.
    if (!reduceMotion) {
      var recent = [];
      var turn = function () {
        if (document.hidden) return;
        var pool = cells.filter(function (c) { return c.dataset.frames && c.parentNode !== spare && recent.indexOf(c) < 0 && !c.matches(":hover"); });
        if (!pool.length) return;
        var c = pool[Math.floor(Math.random() * pool.length)];
        recent.push(c); if (recent.length > 4) recent.shift();
        var list = c._frames || (c._frames = JSON.parse(c.dataset.frames));
        c._k = ((c._k || 0) + 1) % list.length;
        var cur = c.querySelector("img:last-child");
        var next = document.createElement("img");
        next.className = "m-in";
        next.alt = "";
        next.sizes = cur.sizes || "30vw";
        if (list[c._k][1]) next.srcset = list[c._k][1];
        next.src = list[c._k][0];
        var swap = function () {
          if (!next.naturalWidth) return;
          c.appendChild(next);
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              next.classList.remove("m-in");
              setTimeout(function () { Array.prototype.forEach.call(c.querySelectorAll("img"), function (im) { if (im !== next) im.remove(); }); }, 900);
            });
          });
        };
        if (next.decode) next.decode().then(swap, function () {}); else next.onload = swap;
      };
      setInterval(turn, 1100);
    }
  }

  // ---------------------------------------------------------- tiles: preview the other frames on hover
  if (canHover && !reduceMotion) {
    document.querySelectorAll(".tile-frame[data-frames]").forEach(function (box) {
      var srcs = box.dataset.frames.split(" ");
      var peek = null, k = -1, t = null;
      var step = function () {
        k = (k + 1) % srcs.length;
        var src = srcs[k];
        var pre = new Image();
        pre.onload = function () {
          if (!t) return;
          if (!peek) { peek = document.createElement("img"); peek.className = "peek"; peek.alt = ""; box.appendChild(peek); }
          peek.src = src;
          peek.classList.add("on");
        };
        pre.src = src;
      };
      var link = box.closest("a");
      link.addEventListener("mouseenter", function () { if (t) return; t = setInterval(step, 850); step(); });
      link.addEventListener("mouseleave", function () {
        clearInterval(t); t = null; k = -1;
        if (peek) peek.classList.remove("on");
      });
    });
  }

  // ---------------------------------------------------------- work: filter + view
  var workEl = document.getElementById("trabalho");
  if (workEl) {
    var filterBtns = workEl.querySelectorAll("[data-filter]");
    var viewBtns = workEl.querySelectorAll("[data-view]");
    var items = workEl.querySelectorAll("[data-cat]");
    var applyFilter = function (f) {
      filterBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.filter === f)); });
      items.forEach(function (el) {
        if (f === "all" || el.dataset.cat === f) el.removeAttribute("data-hide"); else el.setAttribute("data-hide", "");
      });
    };
    var applyView = function (v) {
      viewBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.view === v)); });
      workEl.querySelectorAll("[data-pane]").forEach(function (p) { p.hidden = p.dataset.pane !== v; });
    };
    workEl.addEventListener("click", function (e) {
      var f = e.target.closest("[data-filter]");
      if (f) applyFilter(f.dataset.filter);
      var v = e.target.closest("[data-view]");
      if (v) { applyView(v.dataset.view); store.set("zema-view", v.dataset.view); }
    });
    if (store.get("zema-view") === "lista") applyView("lista");
  }

  // ---------------------------------------------------------- video (click to load)
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-embed]");
    if (!btn) return;
    var iframe = document.createElement("iframe");
    iframe.src = btn.dataset.embed;
    iframe.title = btn.dataset.title || "Vídeo";
    iframe.allow = "autoplay; fullscreen; picture-in-picture; encrypted-media";
    iframe.allowFullscreen = true;
    var box = document.createElement("div");
    box.className = "embed";
    box.appendChild(iframe);
    btn.replaceWith(box);
  });

  // ---------------------------------------------------------- lightbox (project pages)
  var dialog = document.querySelector(".lightbox");
  var links = Array.prototype.slice.call(document.querySelectorAll(".project-page .still"));
  if (dialog && links.length && typeof dialog.showModal === "function") {
    var lbImg = null; // created on first open, so the page never carries an <img> without a source
    var lbN = dialog.querySelector(".lb-n");
    var idx = 0;
    var open = function (i) {
      idx = (i + links.length) % links.length;
      if (!lbImg) { lbImg = document.createElement("img"); dialog.insertBefore(lbImg, dialog.firstChild); }
      var thumb = links[idx].querySelector("img");
      lbImg.src = links[idx].getAttribute("href");
      lbImg.alt = thumb ? thumb.alt : "";
      lbN.textContent = idx + 1 + " / " + links.length;
      if (!dialog.open) dialog.showModal();
    };
    document.addEventListener("click", function (e) {
      var a = e.target.closest(".project-page .still");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      open(links.indexOf(a));
    });
    dialog.querySelector(".lb-close").addEventListener("click", function () { dialog.close(); });
    dialog.querySelector(".lb-prev").addEventListener("click", function () { open(idx - 1); });
    dialog.querySelector(".lb-next").addEventListener("click", function () { open(idx + 1); });
    dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") open(idx - 1);
      if (e.key === "ArrowRight") open(idx + 1);
    });
    var single = links.length < 2;
    dialog.querySelector(".lb-prev").hidden = single;
    dialog.querySelector(".lb-next").hidden = single;
  }

  // ---------------------------------------------------------- contact form
  var form = document.querySelector(".form");
  if (form && window.fetch) {
    var status = form.querySelector(".form-status");
    var submit = form.querySelector("button[type=submit]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      submit.disabled = true;
      status.textContent = "A enviar…";
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error(String(r.status));
          form.reset();
          status.textContent = "Mensagem enviada. Respondemos por email.";
        })
        .catch(function () { status.textContent = "Não foi possível enviar. Escreva diretamente para o email ao lado."; })
        .then(function () { submit.disabled = false; });
    });
  }
})();
