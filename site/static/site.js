// Progressive enhancement only: every page works without this file.
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };

  // ---------------------------------------------------------- programme: filter + view
  var body = document.body;
  if (body.classList.contains("home")) {
    var filterBtns = document.querySelectorAll("[data-filter]");
    var viewBtns = document.querySelectorAll("[data-view]");
    var items = document.querySelectorAll("[data-cat]");
    var years = document.querySelectorAll(".year");
    var empty = document.querySelector(".empty");
    var current = "all";

    var applyFilter = function (f) {
      current = f;
      filterBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.filter === f)); });
      var shown = 0;
      items.forEach(function (el) {
        var on = f === "all" || el.dataset.cat === f;
        if (on) { el.removeAttribute("data-hide"); if (el.tagName === "LI") shown++; }
        else el.setAttribute("data-hide", "");
      });
      // A year with nothing left in it disappears from the programme.
      years.forEach(function (y) {
        var any = y.querySelector(".entry:not([data-hide])");
        if (any) y.removeAttribute("data-hide"); else y.setAttribute("data-hide", "");
      });
      if (empty) empty.hidden = shown > 0;
    };
    var applyView = function (v) {
      viewBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.view === v)); });
      document.querySelectorAll("[data-pane]").forEach(function (p) { p.hidden = p.dataset.pane !== v; });
    };
    document.addEventListener("click", function (e) {
      var f = e.target.closest("[data-filter]");
      if (f) applyFilter(f.dataset.filter);
      var v = e.target.closest("[data-view]");
      if (v) { applyView(v.dataset.view); store.set("zema-view", v.dataset.view); }
    });
    if (store.get("zema-view") === "indice") applyView("indice");
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

  // ---------------------------------------------------------- lightbox
  var gallery = document.querySelector("[data-gallery]");
  var dialog = document.querySelector(".lightbox");
  if (gallery && dialog && typeof dialog.showModal === "function") {
    var links = Array.prototype.slice.call(gallery.querySelectorAll(".still"));
    // Created on first open, so the page never carries an <img> without a source.
    var lbImg = null;
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
    gallery.addEventListener("click", function (e) {
      var a = e.target.closest(".still");
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
  var form = document.querySelector(".coupon");
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
          status.textContent = "Pedido enviado. Respondemos por email.";
        })
        .catch(function () {
          status.textContent = "Não foi possível enviar. Escreva diretamente para o email ao lado.";
        })
        .then(function () { submit.disabled = false; });
    });
  }
})();
