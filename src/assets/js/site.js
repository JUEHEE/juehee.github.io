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

  /* ---------- 첫 화면 포스터: 아래는 사진, 위로는 점으로 부서져 번집니다 ---------- */
  const posterEl = document.querySelector("[data-poster]");
  if (posterEl) poster(posterEl);

  async function poster(el) {
    const img = el.querySelector(".poster-img"), cv = el.querySelector(".poster-cv");
    try { await img.decode(); } catch { /* 아래에서 확인 */ }
    if (!img.naturalWidth) return;
    const ctx = cv.getContext("2d");
    let W = 0, H = 0, dpr = 1, cell = 8, split = 0, cells = [], map = null, t0 = 0, raf = 0, visible = true, until = 0;
    const ptr = { x: -1e4, y: -1e4 };

    function layout() {
      const r = el.getBoundingClientRect();
      W = r.width; H = r.height; dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      split = img.offsetTop;
      cell = Math.max(6, Math.round(W / (W < 700 ? 46 : 92)));
      const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
      map = { s, x: (W - img.naturalWidth * s) / 2, y: (H - img.naturalHeight * s) / 2 };

      const cols = Math.ceil(W / cell), rows = Math.ceil(H / cell);
      const tiny = document.createElement("canvas");
      tiny.width = cols; tiny.height = rows;
      const tc = tiny.getContext("2d", { willReadFrequently: true });
      tc.drawImage(img, map.x / cell, map.y / cell, img.naturalWidth * s / cell, img.naturalHeight * s / cell);
      let d;
      try { d = tc.getImageData(0, 0, cols, rows).data; } catch { return false; }

      // 배경색(위쪽 가장자리의 평균)과 얼마나 다른지 = 눈에 띄는 정도
      let br = 0, bg = 0, bb = 0, n = 0;
      for (let y = 0; y < Math.max(1, Math.round(rows * .12)); y++) for (let x = 0; x < cols; x++) { const i = (y * cols + x) * 4; br += d[i]; bg += d[i + 1]; bb += d[i + 2]; n++; }
      br /= n; bg /= n; bb /= n;
      const all = [];
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4, R = d[i], G = d[i + 1], B = d[i + 2];
        all.push({ x: x * cell, y: y * cell, col: `rgb(${R},${G},${B})`, lum: (R * .3 + G * .59 + B * .11) / 255, sal: Math.hypot(R - br, G - bg, B - bb) / 255 });
      }
      const sorted = all.map(c => c.sal).sort((a, b) => a - b);
      const thr = sorted[Math.floor(sorted.length * .45)];
      cells = [];
      for (const c of all) {
        const cy = c.y + cell / 2;
        let p;
        if (cy < split) {
          const fall = cy / split;                          // 0 = 맨 위, 1 = 사진 경계
          p = c.sal > thr ? Math.pow(fall, 1.1) * .95 : (fall > .92 ? .35 : 0);
          c.above = true;
        } else {
          const fall = 1 - (cy - split) / ((H - split) * .6); // 사진 안쪽으로 갈수록 줄어듦
          p = fall > 0 && c.sal > thr ? fall * .8 : 0;
        }
        if (Math.random() < p) { c.t = Math.random() * 900 + (c.above ? (1 - cy / split) * 900 : (cy - split) / (H - split) * 500); cells.push(c); }
      }
      return true;
    }

    function draw(el2) {
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.beginPath(); ctx.rect(0, split, W, H - split); ctx.clip();
      ctx.drawImage(img, map.x, map.y, img.naturalWidth * map.s, img.naturalHeight * map.s);
      ctx.restore();
      const sq = cell * .8, off = (cell - sq) / 2, R = cell * 6;
      ctx.lineWidth = 1;
      for (const c of cells) {
        if (el2 < c.t) continue;
        let x = c.x + off, y = c.y + off;
        const dx = x - ptr.x, dy = y - ptr.y, dist = Math.hypot(dx, dy);
        if (dist < R) { const f = (1 - dist / R) * cell * 1.6; x += dx / (dist || 1) * f; y += dy / (dist || 1) * f; }
        if (c.above) {
          if (c.lum > .78) { ctx.strokeStyle = c.col; ctx.strokeRect(x + .5, y + .5, sq - 1, sq - 1); }
          else { ctx.fillStyle = c.col; ctx.fillRect(x, y, sq, sq); }
        } else if (c.lum > .45) {
          ctx.fillStyle = C.paper; ctx.fillRect(x, y, sq, sq);
          ctx.strokeStyle = C.ink; ctx.strokeRect(x + .5, y + .5, sq - 1, sq - 1);
        } else { ctx.fillStyle = C.ink; ctx.fillRect(x, y, sq, sq); }
      }
    }

    function loop(t) {
      if (!t0) t0 = t;
      draw(reduce ? 1e9 : t - t0);
      if (visible && t < until) raf = requestAnimationFrame(loop);
    }
    const kick = ms => { until = Math.max(until, performance.now() + ms); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); };

    if (!layout()) return;
    el.classList.add("is-drawn");
    kick(reduce ? 0 : 2400);
    if (fine && !reduce) {
      el.addEventListener("pointermove", e => { const r = el.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; kick(600); }, { passive: true });
      el.addEventListener("pointerleave", () => { ptr.x = ptr.y = -1e4; kick(400); });
    }
    let rt;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { layout(); t0 = 0; kick(reduce ? 0 : 900); }, 150); });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(300); }).observe(el);
  }

  /* ---------- 작업 페이지 큰 사진: 윗부분이 점으로 흩어져 올라갑니다 ---------- */
  document.querySelectorAll("[data-spill]").forEach(fig => {
    const frame = fig.querySelector(".frame"), img = frame && frame.querySelector("img");
    if (!img) return;
    const go = () => {
      const fr = frame.getBoundingClientRect();
      const prev = fig.previousElementSibling;
      const above = prev ? Math.max(...[...prev.children].map(c => c.getBoundingClientRect().bottom)) : fr.top - 80;
      const h = Math.min(fr.height * .4, fr.top - above - 12);
      if (h < 24 || !img.naturalWidth) return;
      const cell = Math.max(6, Math.round(fr.width / (fr.width < 700 ? 46 : 92)));
      const cols = Math.ceil(fr.width / cell), rows = Math.floor(h / cell);
      const dpr = Math.min(2, devicePixelRatio || 1);
      const c = document.createElement("canvas");
      c.className = "spill"; c.setAttribute("aria-hidden", "true");
      c.width = Math.round(fr.width * dpr); c.height = Math.round(rows * cell * dpr);
      c.style.height = rows * cell + "px";
      frame.appendChild(c);
      const ctx = c.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // 사진의 맨 윗줄 색을 가져와 위로 흩뿌립니다
      const band = 6, t = document.createElement("canvas");
      t.width = cols; t.height = band;
      const tc = t.getContext("2d", { willReadFrequently: true });
      const s = Math.max(fr.width / img.naturalWidth, fr.height / img.naturalHeight);
      const ox = (fr.width - img.naturalWidth * s) / 2, oy = (fr.height - img.naturalHeight * s) / 2;
      tc.drawImage(img, ox / cell, oy / cell, img.naturalWidth * s / cell, img.naturalHeight * s / cell);
      let d;
      try { d = tc.getImageData(0, 0, cols, band).data; } catch { c.remove(); return; }
      const list = [];
      for (let k = 0; k < rows; k++) for (let x = 0; x < cols; x++) {
        const p = Math.pow(1 - (k + 1) / (rows + 1), 2.2) * .85;
        if (Math.random() > p) continue;
        const i = (Math.floor(Math.random() * band) * cols + x) * 4;
        list.push({ x: x * cell, y: (rows - 1 - k) * cell, col: `rgb(${d[i]},${d[i + 1]},${d[i + 2]})`, lum: (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255, t: k * 70 + Math.random() * 300 });
      }
      const sq = cell * .8, off = (cell - sq) / 2;
      let t0 = 0;
      const frameFn = now => {
        if (!t0) t0 = now;
        const el = reduce ? 1e9 : now - t0;
        ctx.clearRect(0, 0, c.width, c.height);
        for (const q of list) {
          if (el < q.t) continue;
          if (q.lum > .78) { ctx.strokeStyle = q.col; ctx.strokeRect(q.x + off + .5, q.y + off + .5, sq - 1, sq - 1); }
          else { ctx.fillStyle = q.col; ctx.fillRect(q.x + off, q.y + off, sq, sq); }
        }
        if (el < rows * 70 + 400) requestAnimationFrame(frameFn);
      };
      requestAnimationFrame(frameFn);
    };
    if (img.complete && img.naturalWidth) setTimeout(go, 600); else img.addEventListener("load", () => setTimeout(go, 600), { once: true });
  });

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
