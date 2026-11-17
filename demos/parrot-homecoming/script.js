/* PARROT Alumni Talk 2026 — interactions
   Progressive enhancement: without JS every section renders fully visible. */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  /* ---------- mobile nav ---------- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");

  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    });

    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- header shadow on scroll ---------- */
  var header = document.getElementById("siteHeader");
  var onScroll = function () {
    if (header) header.classList.toggle("is-stuck", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- reveal on scroll ---------- */
  var targets = document.querySelectorAll(
    ".hero-frame, .hero-sub, .hero-speakers, .keyinfo, .hero-cta," +
    ".page-title, .page-sub," +
    ".section > .wrap > .section-eyebrow, .section > .wrap > .section-title," +
    ".section > .wrap > .section-lead," +
    ".speaker-lead," +
    ".tl-item, .person, .card, .logo-card, .info-card, .map-block, .notice-card, .band-inner," +
    ".foot-note, .disclaimer"
  );

  if (!("IntersectionObserver" in window)) return;

  Array.prototype.forEach.call(targets, function (el, i) {
    el.setAttribute("data-anim", "");
    // stagger siblings a little; reset per group so late sections aren't slow
    el.style.transitionDelay = (i % 6) * 60 + "ms";
  });

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
  );

  Array.prototype.forEach.call(targets, function (el) { io.observe(el); });

  /* ---------- scrollspy ---------- */
  var links = nav ? nav.querySelectorAll("a[href^='#']") : [];
  var sections = [];

  Array.prototype.forEach.call(links, function (link) {
    var section = document.querySelector(link.getAttribute("href"));
    if (section) sections.push({ link: link, el: section });
  });

  if (!sections.length) return;

  var spy = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var match = sections.filter(function (s) { return s.el === entry.target; })[0];
        if (!match) return;
        Array.prototype.forEach.call(links, function (l) { l.classList.remove("is-active"); });
        match.link.classList.add("is-active");
      });
    },
    { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
  );

  sections.forEach(function (s) { spy.observe(s.el); });
})();
