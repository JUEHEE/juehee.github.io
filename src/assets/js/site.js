/* =========================================================
   POIESIS — 화면 움직임
   1) 첫 화면: 흩어진 점(생각)이 모여 단어(형태)가 됩니다
   2) 이미지: 점(모자이크)에서 선명한 이미지로 나타납니다
   3) 그 밖에: 시계, 스크롤 등장, 유튜브 재생, 보기 방식 전환, 목록 미리보기
   ========================================================= */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const css = getComputedStyle(document.documentElement);
  const C = {
    paper: css.getPropertyValue("--paper").trim() || "#EFEEE8",
    ink: css.getPropertyValue("--ink").trim() || "#151513",
    olive: css.getPropertyValue("--olive").trim() || "#6B7A3A",
  };
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* 저장 안 돼도 괜찮아요 */ } },
  };

  /* ---------- 시계 ---------- */
  const clock = document.querySelector("[data-clock]");
  if (clock) {
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit" });
    const tick = () => { clock.textContent = fmt.format(new Date()); };
    tick(); setInterval(tick, 15000);
  }

  /* ---------- 부드러운 스크롤 (Lenis + GSAP ScrollTrigger) ---------- */
  const gsap = window.gsap, ST = window.ScrollTrigger;
  const hasGsap = !!(gsap && ST);
  if (hasGsap) gsap.registerPlugin(ST);
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    if (hasGsap) {
      lenis.on("scroll", ST.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    // 같은 페이지 안의 # 링크도 부드럽게 (본문 건너뛰기 링크는 제외)
    document.addEventListener("click", e => {
      const a = e.target.closest('a[href^="#"]:not(.skip)');
      const target = a && a.hash.length > 1 && document.querySelector(a.hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80 });
    });
  }

  /* ---------- 제목: 한 글자씩 아래에서 올라오며 나타나기 ---------- */
  const TITLES = ".display, .pj-t, .cats-t, .card-t, .intro-h";
  function splitChars(el) {
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    const chars = [];
    const walk = node => {
      for (const n of [...node.childNodes]) {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          for (const part of n.textContent.split(/(\s+)/)) {
            if (!part) continue;
            if (/^\s+$/.test(part)) { frag.append(" "); continue; }
            const w = document.createElement("span");
            w.className = "split-w"; w.setAttribute("aria-hidden", "true");
            for (const ch of part) {
              const o = document.createElement("span"), i = document.createElement("span");
              o.className = "split-c"; i.textContent = ch;
              o.append(i); w.append(o); chars.push(i);
            }
            frag.append(w);
          }
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.matches("sup, br, .badge, svg, img")) walk(n);
      }
    };
    walk(el);
    el.classList.add("is-split");
    return chars;
  }
  if (!reduce) document.querySelectorAll(TITLES).forEach(el => {
    const chars = splitChars(el);
    if (!hasGsap || !chars.length) return;
    gsap.set(chars, { yPercent: 115 });
    ST.create({
      trigger: el, start: "top 92%", once: true,
      onEnter: () => gsap.to(chars, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: Math.min(.045, .7 / chars.length) }),
    });
  });

  /* ---------- 3D 큐브: 스크롤하면 돌다가 펼쳐져 한 장의 이미지가 됩니다 ----------
     데스크톱(761px 이상) + 모션 허용 + GSAP이 있을 때만. 화면 폭이 바뀌면 자동으로 카드 ↔ 큐브 전환 */
  const sel = document.querySelector(".cubes");
  if (sel && hasGsap) {
    const section = sel.closest("section");
    gsap.matchMedia().add("(min-width: 761px) and (prefers-reduced-motion: no-preference)", () => {
      section.classList.add("has-cubes");
      sel.querySelectorAll(".cs").forEach(cs => {
        const cube = cs.querySelector(".cube");
        const q = s => cs.querySelector(s);
        const sides = cs.querySelectorAll(".f-left, .f-right, .f-top, .f-bottom, .f-back");
        const text = cs.querySelectorAll(".cs-text > *");
        const half = () => `50% 50% ${-cube.offsetWidth / 2}px`; // 큐브의 한가운데를 중심으로 회전
        gsap.set(cube, { transformOrigin: half });

        // 모든 동작에 시작값·끝값을 함께 적어 둡니다 (창 크기가 바뀌어 다시 계산해도 어긋나지 않게)
        const ft = (el, from, to, at) => tl.fromTo(el, from, { ...to, immediateRender: at === 0 }, at);
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: cs, start: "top top", end: "+=170%", pin: true, scrub: .8, invalidateOnRefresh: true },
        });
        // 1) 글이 올라오고, 큐브가 돌며 앞면을 향함
        ft(text, { y: 32, opacity: 0 }, { y: 0, opacity: 1, stagger: .025, duration: .18, ease: "power2.out" }, 0);
        ft(cube, { rotationY: -38, scale: .78 }, { rotationY: 360, scale: 1, duration: .5, ease: "power1.inOut" }, 0);
        ft(cube, { rotationX: -26 }, { rotationX: 22, duration: .25, ease: "sine.inOut" }, 0);
        tl.fromTo(cube, { rotationX: 22 }, { rotationX: 0, duration: .25, ease: "sine.inOut", immediateRender: false }, .25);
        // 2) 옆면이 경첩처럼 펼쳐짐 (접힌 상태에서 시작)
        const fold = [[".f-left", "rotationY", -90, .5], [".f-right", "rotationY", 90, .5], [".f-top", "rotationX", 90, .54], [".f-bottom", "rotationX", -90, .54]];
        fold.forEach(([face, prop, deg, at]) => {
          gsap.set(q(face), { [prop]: deg });
          tl.fromTo(q(face), { [prop]: deg }, { [prop]: 0, duration: .22, ease: "power2.inOut", immediateRender: false }, at);
        });
        gsap.set(q(".f-back"), { rotationY: 90, opacity: 1 });
        tl.fromTo(q(".f-back"), { rotationY: 90, opacity: 1 }, { rotationY: 0, opacity: 0, duration: .18, ease: "power2.in", immediateRender: false }, .5);
        gsap.set(sides, { "--shade": .22 });
        tl.fromTo(sides, { "--shade": .22 }, { "--shade": 0, duration: .22, immediateRender: false }, .52);
        // 3) 빈 모서리가 채워져 한 장의 평면 이미지가 됨
        tl.fromTo(cs.querySelectorAll(".f-corner"), { opacity: 0 }, { opacity: 1, duration: .1, stagger: .025, immediateRender: false }, .74);
        tl.to({}, { duration: .1 });
      });
      ST.refresh();
      return () => section.classList.remove("has-cubes");
    });
  }

  /* ---------- 스크롤하면 나타나기 ---------- */
  const revealIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); revealIO.unobserve(e.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll("[data-reveal]").forEach(el => revealIO.observe(el));

  /* ---------- 이미지 모자이크 ---------- */
  function pixelate(img, steps, done) {
    const frame = img.parentElement;
    const r = frame.getBoundingClientRect();
    if (!r.width || !img.naturalWidth) return done();
    const dpr = Math.min(2, devicePixelRatio || 1);
    const c = document.createElement("canvas");
    c.className = "mosaic";
    c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr);
    frame.appendChild(c);
    const ctx = c.getContext("2d");
    const tiny = document.createElement("canvas");
    const tctx = tiny.getContext("2d", { willReadFrequently: true });
    let k = 0;
    const draw = cell => {
      const cols = Math.max(1, Math.ceil(r.width / cell)), rows = Math.max(1, Math.ceil(r.height / cell));
      tiny.width = cols; tiny.height = rows;
      const s = Math.max(cols / img.naturalWidth, rows / img.naturalHeight);
      tctx.drawImage(img, (cols - img.naturalWidth * s) / 2, (rows - img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s);
      const d = tctx.getImageData(0, 0, cols, rows).data;
      const cs = cell * dpr, sq = cs * .8, off = (cs - sq) / 2;
      ctx.fillStyle = C.paper; ctx.fillRect(0, 0, c.width, c.height);
      ctx.lineWidth = Math.max(1, dpr);
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4, col = `rgb(${d[i]},${d[i + 1]},${d[i + 2]})`;
        const lum = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255;
        if (lum > .82 && cell > 8) { ctx.strokeStyle = col; ctx.strokeRect(x * cs + off + .5, y * cs + off + .5, sq - 1, sq - 1); }
        else { ctx.fillStyle = col; ctx.fillRect(x * cs + off, y * cs + off, sq, sq); }
      }
    };
    const next = () => {
      try { draw(steps[k]); } catch { c.remove(); return done(); } // 다른 사이트 이미지 등 읽을 수 없으면 그냥 보여 줍니다
      if (++k < steps.length) return setTimeout(next, 95);
      setTimeout(() => { done(); c.style.opacity = "0"; setTimeout(() => c.remove(), 520); }, 95);
    };
    next();
  }

  const mosaicIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    mosaicIO.unobserve(e.target);
    const img = e.target;
    const show = () => img.classList.add("is-on");
    if (reduce) return show();
    const go = () => pixelate(img, [36, 22, 13, 7], show);
    if (img.complete && img.naturalWidth) go();
    else { img.addEventListener("load", go, { once: true }); img.addEventListener("error", show, { once: true }); }
  }), { rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll("img[data-mosaic]").forEach(img => {
    img.loading = "eager"; // 화면에 들어올 때 바로 그릴 수 있게
    mosaicIO.observe(img);
  });

  // 카드에 마우스를 올리면 잠깐 점으로 흩어졌다 돌아옵니다
  if (fine && !reduce) document.querySelectorAll(".card a, .cats a").forEach(a => {
    let busy = false;
    a.addEventListener("mouseenter", () => {
      const img = a.querySelector("img[data-mosaic].is-on");
      if (!img || busy) return;
      busy = true;
      pixelate(img, [9, 5], () => { busy = false; });
    });
  });

  /* ---------- 유튜브: 누르면 그 자리에서 재생 ---------- */
  document.addEventListener("click", e => {
    const a = e.target.closest("a[data-yt]");
    if (!a || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    const f = document.createElement("iframe");
    f.src = `https://www.youtube-nocookie.com/embed/${a.dataset.yt}?autoplay=1&rel=0&playsinline=1`;
    f.title = a.getAttribute("aria-label") || "YouTube 영상";
    f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    f.allowFullscreen = true;
    a.replaceWith(f);
    f.focus();
  });

  /* ---------- WORKS 보기 방식 (그리드 / 목록) ---------- */
  const wk = document.querySelector(".wk");
  const viewBtns = document.querySelectorAll(".wk-view button");
  const setView = v => {
    if (!wk) return;
    wk.dataset.view = v;
    viewBtns.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.view === v)));
    if (v === "grid") wk.querySelectorAll("[data-reveal]:not(.is-in)").forEach(el => revealIO.observe(el));
    if (hasGsap) ST.refresh();
  };
  viewBtns.forEach(b => b.addEventListener("click", () => { setView(b.dataset.view); store.set("wk-view", b.dataset.view); }));
  if (store.get("wk-view") === "list") setView("list");

  /* ---------- 목록 미리보기 이미지 ---------- */
  if (fine) {
    const pv = document.createElement("div");
    pv.className = "preview"; pv.setAttribute("aria-hidden", "true");
    const pimg = document.createElement("img"); pimg.alt = "";
    pv.appendChild(pimg);
    let on = false;
    document.querySelectorAll("a[data-preview]").forEach(a => {
      a.addEventListener("mouseenter", () => { if (!pv.isConnected) document.body.appendChild(pv); pimg.src = a.dataset.preview; pv.classList.add("is-on"); on = true; });
      a.addEventListener("mouseleave", () => { pv.classList.remove("is-on"); on = false; });
    });
    addEventListener("mousemove", e => {
      if (!on) return;
      const w = pv.offsetWidth, h = pv.offsetHeight;
      const x = Math.min(e.clientX + 28, innerWidth - w - 12), y = Math.max(12, Math.min(e.clientY - h / 2, innerHeight - h - 12));
      pv.style.transform = `translate(${x}px, ${y}px)`;
    }, { passive: true });
  }

  /* ---------- 첫 화면: 점이 모여 단어가 됩니다 ---------- */
  const cv = document.querySelector(".intro-dots");
  if (cv) intro(cv);

  async function intro(canvas) {
    const word = canvas.dataset.word || "POIESIS";
    const ctx = canvas.getContext("2d");
    try { await Promise.race([document.fonts.load('600 100px "Pretendard Variable"'), new Promise(r => setTimeout(r, 1200))]); } catch { /* 기본 글꼴 사용 */ }

    let W = 0, H = 0, dpr = 1, cell = 8, dots = [], visible = true, raf = 0, t0 = 0;
    const ptr = { x: -1e4, y: -1e4 };

    function layout() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(2, devicePixelRatio || 1);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = Math.max(5, Math.round(W / (W < 700 ? 62 : 120)));

      // 단어를 몰래 그려 보고, 글자가 있는 칸을 점의 목적지로 씁니다
      const off = document.createElement("canvas");
      const cols = Math.floor(W / cell), rows = Math.floor(H / cell);
      off.width = cols; off.height = rows;
      const o = off.getContext("2d", { willReadFrequently: true });
      let fs = rows;
      o.font = `600 ${fs}px "Pretendard Variable", Pretendard, sans-serif`;
      const tw = o.measureText(word).width;
      fs = Math.min(rows * 1.05, fs * (cols * .98) / tw);
      o.font = `600 ${fs}px "Pretendard Variable", Pretendard, sans-serif`;
      o.textAlign = "center"; o.textBaseline = "middle"; o.fillStyle = "#000";
      o.fillText(word, cols / 2, rows / 2 + fs * .04);
      const d = o.getImageData(0, 0, cols, rows).data;
      const targets = [];
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (d[(y * cols + x) * 4 + 3] > 110) targets.push([(x + .5) * cell + (W - cols * cell) / 2, (y + .5) * cell + (H - rows * cell) / 2]);

      const old = dots;
      dots = targets.map(([tx, ty], i) => {
        const p = old[i];
        const rnd = Math.random();
        return {
          tx, ty,
          x: p ? p.x : Math.random() * W, y: p ? p.y : Math.random() * H,
          vx: 0, vy: 0,
          delay: p ? 0 : 200 + Math.random() * 1400 + (tx / W) * 500,
          hollow: rnd < .14, accent: rnd > .93,
        };
      });
      // 아직 형태가 되지 않은 생각들: 단어 밖을 떠도는 점
      const strays = Math.round(targets.length * .06);
      for (let i = 0; i < strays; i++) {
        const x = Math.random() * W, y = Math.random() * H;
        dots.push({ tx: x, ty: y, x, y, vx: 0, vy: 0, delay: 0, stray: true, hollow: Math.random() < .5, accent: Math.random() < .3, ph: Math.random() * 6.28 });
      }
    }

    function frame(t) {
      if (!t0) t0 = t;
      const el = t - t0;
      ctx.clearRect(0, 0, W, H);
      const s = cell * .74, R = cell * 7;
      for (const d of dots) {
        let tx = d.tx, ty = d.ty;
        if (d.stray) { tx += Math.sin(el / 2400 + d.ph) * cell * 2; ty += Math.cos(el / 3100 + d.ph) * cell * 2; }
        if (el < d.delay) { tx = d.x; ty = d.y; }
        const dx = d.x - ptr.x, dy = d.y - ptr.y, dist = Math.hypot(dx, dy);
        if (dist < R) { const f = (1 - dist / R) * 2.2; d.vx += dx / (dist || 1) * f; d.vy += dy / (dist || 1) * f; }
        d.vx = (d.vx + (tx - d.x) * .045) * .84;
        d.vy = (d.vy + (ty - d.y) * .045) * .84;
        d.x += d.vx; d.y += d.vy;
        const x = d.x - s / 2, y = d.y - s / 2;
        const col = d.accent ? C.olive : C.ink;
        if (d.hollow) { ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, s - 1, s - 1); }
        else { ctx.fillStyle = col; ctx.fillRect(x, y, s, s); }
      }
      if (visible) raf = requestAnimationFrame(frame);
    }

    function still() {
      ctx.clearRect(0, 0, W, H);
      const s = cell * .74;
      for (const d of dots) {
        const col = d.accent ? C.olive : C.ink;
        if (d.hollow) { ctx.strokeStyle = col; ctx.strokeRect(d.tx - s / 2 + .5, d.ty - s / 2 + .5, s - 1, s - 1); }
        else { ctx.fillStyle = col; ctx.fillRect(d.tx - s / 2, d.ty - s / 2, s, s); }
      }
    }

    layout();
    if (reduce) { still(); addEventListener("resize", () => { layout(); still(); }); return; }

    canvas.addEventListener("pointermove", e => { const r = canvas.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; }, { passive: true });
    canvas.addEventListener("pointerleave", () => { ptr.x = ptr.y = -1e4; });
    // 손가락으로 톡 치면 흩어졌다 다시 모입니다
    canvas.addEventListener("pointerdown", e => {
      const r = canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      for (const d of dots) { const dx = d.x - px, dy = d.y - py, dist = Math.hypot(dx, dy) || 1, f = Math.max(0, 1 - dist / (cell * 26)) * 26; d.vx += dx / dist * f; d.vy += dy / dist * f; }
    });
    let rt;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(layout, 150); });
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
    }).observe(canvas);
  }
})();
