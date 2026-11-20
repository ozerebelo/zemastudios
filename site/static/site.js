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

  // ---------------------------------------------------------- hero: featured frames
  var hero = document.querySelector(".hero");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".slide"));
    var bar = hero.querySelector(".hero-progress i");
    var DUR = 6500;
    var current = 0, timer = null, stopped = false;
    var show = function (i) {
      i = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        var on = k === i;
        s.classList.toggle("on", on);
        if (on) s.removeAttribute("aria-hidden"); else s.setAttribute("aria-hidden", "true");
        s.querySelectorAll("a").forEach(function (a) { a.tabIndex = on ? 0 : -1; });
      });
      current = i;
      var nextImg = slides[(i + 1) % slides.length].querySelector("img");
      if (nextImg) nextImg.loading = "eager";
      restartBar();
    };
    var restartBar = function () {
      if (!bar) return;
      bar.classList.remove("run");
      void bar.offsetWidth;
      if (timer && !stopped) { bar.style.setProperty("--dur", DUR + "ms"); bar.classList.add("run"); }
    };
    var start = function () {
      if (reduceMotion || stopped || slides.length < 2 || timer) return;
      timer = setInterval(function () { show(current + 1); }, DUR);
      restartBar();
    };
    var stop = function () { clearInterval(timer); timer = null; if (bar) bar.classList.remove("run"); };
    hero.addEventListener("click", function (e) {
      var b = e.target.closest("[data-slide]");
      if (!b) return;
      stopped = true; // a visitor who steps through by hand keeps control
      stop();
      show(current + (b.dataset.slide === "next" ? 1 : -1));
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    hero.addEventListener("focusin", stop);
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    if (slides.length > 1) { var n = slides[1].querySelector("img"); if (n) n.loading = "eager"; }
    start();
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
