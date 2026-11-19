// Progressive enhancement only: every page works without this file.
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------------------------------------------------------- hero slides
  var hero = document.querySelector(".hero");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".slide"));
    var counter = hero.querySelector(".slide-n");
    var current = 0;
    var timer = null;
    var userTook = false;
    slides.forEach(function (s, i) {
      s.hidden = false;
      s.classList.toggle("on", i === 0);
      if (i !== 0) s.setAttribute("aria-hidden", "true");
    });
    var warm = function (i) {
      var img = slides[i] && slides[i].querySelector("img");
      if (img) img.loading = "eager";
    };
    var show = function (i) {
      i = (i + slides.length) % slides.length;
      slides[current].classList.remove("on");
      slides[current].setAttribute("aria-hidden", "true");
      slides[i].classList.add("on");
      slides[i].removeAttribute("aria-hidden");
      current = i;
      if (counter) counter.textContent = i + 1 + " / " + slides.length;
      warm(i + 1);
    };
    var start = function () {
      if (reduceMotion || userTook || slides.length < 2 || timer) return;
      timer = setInterval(function () { show(current + 1); }, 6500);
    };
    var stop = function () { clearInterval(timer); timer = null; };
    warm(1);
    hero.addEventListener("click", function (e) {
      var b = e.target.closest("[data-slide]");
      if (!b) return;
      userTook = true; // once someone navigates manually, stop auto-advancing
      stop();
      show(current + (b.dataset.slide === "next" ? 1 : -1));
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    hero.addEventListener("focusin", stop);
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    start();
  }

  // ---------------------------------------------------------- work: filter + view
  var work = document.getElementById("trabalho");
  if (work) {
    var filterBtns = work.querySelectorAll("[data-filter]");
    var viewBtns = work.querySelectorAll("[data-view]");
    var items = work.querySelectorAll("[data-cat]");
    var applyFilter = function (f) {
      filterBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.filter === f)); });
      items.forEach(function (el) {
        if (f === "all" || el.dataset.cat === f) el.removeAttribute("data-hide");
        else el.setAttribute("data-hide", "");
      });
    };
    var applyView = function (v) {
      viewBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.view === v)); });
      work.querySelectorAll("[data-pane]").forEach(function (p) { p.hidden = p.dataset.pane !== v; });
    };
    work.addEventListener("click", function (e) {
      var f = e.target.closest("[data-filter]");
      if (f) applyFilter(f.dataset.filter);
      var v = e.target.closest("[data-view]");
      if (v) { applyView(v.dataset.view); store.set("zema-view", v.dataset.view); }
    });
    if (store.get("zema-view") === "list") applyView("list");
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
    var lbImg = dialog.querySelector("img");
    var lbN = dialog.querySelector(".lb-n");
    var idx = 0;
    var open = function (i) {
      idx = (i + links.length) % links.length;
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
        .catch(function () {
          status.textContent = "Não foi possível enviar. Escreva diretamente para o email acima.";
        })
        .then(function () { submit.disabled = false; });
    });
  }
})();
