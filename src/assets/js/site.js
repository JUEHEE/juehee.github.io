/* =========================================================
   juehee — 화면 움직임
   1) 배경: 회색 입자가 천천히 흐르는 곡선 / HOME 첫 화면: 인사하는 캠
   2) 부드러운 스크롤, 제목이 한 글자씩 올라오기
   3) HOME: 큰 로고 → 스크롤하면 작은 로고, 대표 작업 3D 큐브
   4) 그 밖에: 스크롤 등장, 유튜브 재생, 보기 방식 전환, 목록 미리보기
   ========================================================= */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* 저장 안 돼도 괜찮아요 */ } },
  };

  /* ---------- 배경: 회색 입자로 그린 곡선 (천천히 흐름) ----------
     화면 밖까지 이어지는 곡선 몇 개를 따라 작은 점들이 흩어져 있고, 점들이 곡선을 따라 아주 천천히 흘러갑니다.
     곡선 자체도 숨 쉬듯 조금씩 휘어집니다. 매번 같은 모양이 나오도록 정해진 씨앗(seed)으로 난수를 만듭니다.
     점을 하나씩 그리지 않고, 화면 크기의 투명도 지도에 더한 뒤 한 번에 찍어서 가볍게 움직입니다.
     탭이 숨겨지면 멈추고, "움직임 줄이기" 설정이면 한 번만 그립니다. */
  const swirl = document.querySelector(".swirl");
  if (swirl) {
    const ctx = swirl.getContext("2d");
    const CURVES = 7;                            // 곡선 수
    let PER = 9000;                              // 곡선마다 점 수 (화면 크기에 맞춰 정함)
    let W = 0, H = 0, img, acc, base, curves = [], dots, raf = 0, last = 0;
    const setup = () => {
      W = innerWidth; H = innerHeight;
      PER = Math.round(Math.max(4500, Math.min(11000, W * H / (1440 * 900) * 11000)));
      swirl.width = W; swirl.height = H;
      img = ctx.createImageData(W, H);
      acc = new Float32Array(W * H);
      base = new Float32Array(W * H);
      let seed = 7;
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;
      for (let i = 0, n = Math.round(W * H / 380); i < n; i++) base[(rnd() * H | 0) * W + (rnd() * W | 0)] += .05;
      curves = [];
      for (let c = 0; c < CURVES; c++) {
        const pts = [];
        for (let k = 0; k < 5; k++) pts.push([(-0.3 + rnd() * 1.6) * W, (-0.3 + rnd() * 1.6) * H, rnd() * 6.28, .5 + rnd()]);
        curves.push({ pts, speed: (.004 + rnd() * .004) * (rnd() < .5 ? -1 : 1) });
      }
      // 점: [곡선 번호, 곡선 위 위치(0~1), 옆으로 흩어진 정도 x, y, 진하기]
      dots = new Float32Array(CURVES * PER * 5);
      for (let c = 0, o = 0; c < CURVES; c++) for (let i = 0; i < PER; i++, o += 5) {
        dots[o] = c; dots[o + 1] = rnd(); dots[o + 2] = gauss(); dots[o + 3] = gauss(); dots[o + 4] = .045 + rnd() * .11;
      }
    };
    const draw = now => {
      const t = now / 1000;
      acc.set(base);
      const q = (a, b, c, d, f) => .5 * (2 * b + (-a + c) * f + (2 * a - 5 * b + 4 * c - d) * f * f + (-a + 3 * b - 3 * c + d) * f * f * f);
      for (let c = 0; c < CURVES; c++) {
        const { pts, speed } = curves[c];
        // 곡선을 지나는 점들이 숨 쉬듯 조금씩 움직임
        const P = pts.map(([x, y, ph, amp]) => [x + Math.sin(t * .11 * amp + ph) * W * .035, y + Math.cos(t * .09 * amp + ph) * H * .035]);
        const seg = P.length - 3;
        for (let o = c * PER * 5, e = o + PER * 5; o < e; o += 5) {
          let u = (dots[o + 1] + t * speed) % 1; if (u < 0) u += 1;
          const s = u * seg, i = s | 0, f = s - i;
          const x = q(P[i][0], P[i + 1][0], P[i + 2][0], P[i + 3][0], f), y = q(P[i][1], P[i + 1][1], P[i + 2][1], P[i + 3][1], f);
          const spread = 3 + 22 * Math.abs(Math.sin(u * 2600 / 340 + c));
          const px = (x + dots[o + 2] * spread) | 0, py = (y + dots[o + 3] * spread) | 0;
          if (px >= 0 && py >= 0 && px < W && py < H) acc[py * W + px] += dots[o + 4];
        }
      }
      const d = img.data;
      for (let i = 0, j = 0; i < acc.length; i++, j += 4) {
        const a = acc[i];
        if (a) { d[j] = 35; d[j + 1] = 24; d[j + 2] = 21; d[j + 3] = a >= 1 ? 255 : a * 255; } else d[j + 3] = 0;
      }
      ctx.putImageData(img, 0, 0);
    };
    // 1초에 30번 정도만 다시 그립니다 (충분히 부드럽고 가벼움)
    const loop = now => { if (now - last > 33) { last = now; draw(now); } raf = document.hidden ? 0 : requestAnimationFrame(loop); };
    setup(); draw(performance.now());
    if (!reduce) {
      raf = requestAnimationFrame(loop);
      document.addEventListener("visibilitychange", () => { if (!document.hidden && !raf) raf = requestAnimationFrame(loop); });
    }
    let rt, lastW = innerWidth;
    addEventListener("resize", () => { if (Math.abs(innerWidth - lastW) < 2) return; lastW = innerWidth; clearTimeout(rt); rt = setTimeout(() => { setup(); draw(performance.now()); }, 250); });
  }

  /* ---------- HOME 첫 화면: 인사하는 캠 (맥북 화면 모양) ----------
     "Say hi"를 누르면 방문자의 카메라가 켜지고(브라우저가 먼저 허락을 묻습니다),
     화면 속 사람을 찾아 "human" 상자로 따라가고, 손을 흔들면 인사가 돌아옵니다.
     - 사람 찾기: MediaPipe 물체 인식 모델(버튼을 누를 때만 내려받음). 못 불러오면 움직인 부분을 상자로 잡습니다.
     - 손 흔들기: 작은 화면(64×48)에서 움직인 부분의 가운데가 좌우로 몇 번 오가는지로 알아챕니다.
     영상은 이 브라우저 안에서만 쓰이고 어디로도 보내거나 저장하지 않습니다. */
  const cam = document.querySelector(".hicam");
  if (cam) {
    const MP = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21";
    const MODEL = "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite";
    const screen = cam.querySelector(".hicam-screen"), video = cam.querySelector(".hicam-video"), boxes = cam.querySelector(".hicam-boxes");
    const msg = cam.querySelector(".hicam-msg"), clock = cam.querySelector(".hicam-clock");
    const say = (state, html) => { cam.dataset.state = state; msg.innerHTML = html; };
    const tick = () => { clock.textContent = new Date().toLocaleTimeString("en-GB"); };
    tick(); setInterval(tick, 1000);
    // 주희 인사 영상: 첫 화면이 보일 때만 반복 재생 ("움직임 줄이기" 설정이면 멈춘 사진만)
    const me = cam.querySelector(".hicam-me");
    if (me && reduce) { me.removeAttribute("autoplay"); me.pause(); }
    else if (me) new IntersectionObserver(([e]) => { if (e.isIntersecting) me.play().catch(() => {}); else me.pause(); }).observe(me);
    const HELLO = ["Hi! Nice to meet you", "Hello there!", "Welcome in :)"];
    let stream = null, timer = 0, hello = 0, detector = null, loading = null;

    // 사람 찾는 모델은 한 번만 불러옵니다 (GPU가 안 되면 CPU로)
    const loadDetector = () => loading || (loading = (async () => {
      const { FilesetResolver, ObjectDetector } = await import(`${MP}/vision_bundle.mjs`);
      const files = await FilesetResolver.forVisionTasks(`${MP}/wasm`);
      const make = delegate => ObjectDetector.createFromOptions(files, {
        baseOptions: { modelAssetPath: MODEL, delegate }, runningMode: "VIDEO", scoreThreshold: .4, maxResults: 3, categoryAllowlist: ["person"],
      });
      try { detector = await make("GPU"); } catch { detector = await make("CPU"); }
    })().catch(() => { detector = null; }));

    const stop = () => {
      if (stream) stream.getTracks().forEach(tr => tr.stop());
      stream = null; cancelAnimationFrame(timer); video.srcObject = null;
      boxes.getContext("2d").clearRect(0, 0, boxes.width, boxes.height);
      say("idle", "See you around.<br>Wave again?");
    };

    const watch = () => {
      const c = document.createElement("canvas"); c.width = 64; c.height = 48;
      const g = c.getContext("2d", { willReadFrequently: true });
      const bx = boxes.getContext("2d");
      let prev = null, xs = [], lastWave = 0, nudge = performance.now() + 7000, lastDetect = 0;
      let found = [], shown = [], motionBox = null, motionSeen = 0;

      // 영상 좌표(원본) → 화면 좌표 (꽉 채우기 + 거울처럼 뒤집기)
      const toScreen = (x, y, w, h, W, H) => {
        const vw = video.videoWidth, vh = video.videoHeight, s = Math.max(W / vw, H / vh);
        const ox = (W - vw * s) / 2, oy = (H - vh * s) / 2;
        return [W - (ox + (x + w) * s), oy + y * s, w * s, h * s];
      };

      const drawBoxes = (W, H) => {
        bx.clearRect(0, 0, W, H);
        bx.lineWidth = 1.5; bx.font = '400 10px "Josefin Sans", sans-serif'; bx.textBaseline = "middle";
        for (const b of shown) {
          if (b.a < .02) continue;
          bx.globalAlpha = b.a;
          bx.strokeStyle = "#8DB33A"; bx.strokeRect(b.x, b.y, b.w, b.h);
          const label = `human ${b.score.toFixed(2)}`, tw = bx.measureText(label).width + 10, ty = b.y > 15 ? b.y - 14 : b.y;
          bx.fillStyle = "#8DB33A"; bx.fillRect(b.x - .75, ty, tw, 14);
          bx.fillStyle = "#fff"; bx.fillText(label, b.x + 4.5, ty + 8);
        }
        bx.globalAlpha = 1;
      };

      const frame = now => {
        if (!stream) return;
        const W = screen.clientWidth, H = screen.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
        if (boxes.width !== Math.round(W * dpr)) { boxes.width = Math.round(W * dpr); boxes.height = Math.round(H * dpr); bx.setTransform(dpr, 0, 0, dpr, 0, 0); }
        if (video.readyState >= 2 && video.videoWidth) {
          // 1) 움직임: 손 흔들기 + (모델이 없을 때) 움직인 부분 상자
          g.drawImage(video, 0, 0, 64, 48);
          const px = g.getImageData(0, 0, 64, 48).data, cur = new Uint8ClampedArray(64 * 48);
          let cnt = 0, sx = 0, x0 = 64, y0 = 48, x1 = -1, y1 = -1;
          for (let i = 0; i < cur.length; i++) {
            cur[i] = (px[i * 4] * 3 + px[i * 4 + 1] * 6 + px[i * 4 + 2]) / 10;
            if (prev && Math.abs(cur[i] - prev[i]) > 28) {
              const x = i % 64, y = (i / 64) | 0; cnt++; sx += x;
              if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
            }
          }
          prev = cur;
          if (cnt > 40) { const k = video.videoWidth / 64; motionBox = { x: x0 * k, y: y0 * k, w: (x1 - x0 + 1) * k, h: (y1 - y0 + 1) * k, score: Math.min(.99, .55 + cnt / 900) }; motionSeen = now; }
          xs = xs.filter(p => now - p[0] < 1600);
          if (cnt > 40) xs.push([now, sx / cnt]);
          let turns = 0, dir = 0, anchor = xs[0]?.[1];
          for (const [, x] of xs) {
            const dx = x - anchor;
            if (Math.abs(dx) > 4) { const nd = Math.sign(dx); if (dir && nd !== dir) turns++; dir = nd; anchor = x; }
          }
          if (turns >= 3 && now - lastWave > 3500) {
            lastWave = now; xs = [];
            say("waved", HELLO[hello++ % HELLO.length]);
            setTimeout(() => { if (stream && cam.dataset.state === "waved") say("live", "Wave again anytime."); }, 3200);
          } else if (now > nudge && !lastWave) {
            nudge = Infinity; msg.innerHTML = "Give me a wave<br>with your hand.";
          }

          // 2) 사람 찾기 (1초에 약 12번)
          if (detector && now - lastDetect > 80) {
            lastDetect = now;
            try {
              found = detector.detectForVideo(video, now).detections.map(d => ({ ...d.boundingBox, score: d.categories[0]?.score || 0 }))
                .map(b => ({ x: b.originX, y: b.originY, w: b.width, h: b.height, score: b.score }));
            } catch { found = []; }
          } else if (!detector) {
            found = motionBox && now - motionSeen < 900 ? [motionBox] : [];
          }

          // 3) 상자를 부드럽게 따라가게 (갑자기 튀지 않게)
          const target = found.map(b => { const [x, y, w, h] = toScreen(b.x, b.y, b.w, b.h, W, H); return { x, y, w, h, score: b.score }; });
          shown = target.map((t, i) => {
            const p = shown[i];
            if (!p || p.a < .05) return { ...t, a: .2 };
            const k = .35;
            return { x: p.x + (t.x - p.x) * k, y: p.y + (t.y - p.y) * k, w: p.w + (t.w - p.w) * k, h: p.h + (t.h - p.h) * k, score: t.score, a: Math.min(1, p.a + .2) };
          }).concat(shown.slice(target.length).map(p => ({ ...p, a: p.a * .8 })).filter(p => p.a > .02));
          drawBoxes(W, H);
        }
        timer = requestAnimationFrame(frame);
      };
      timer = requestAnimationFrame(frame);
    };

    cam.querySelector(".hicam-btn").addEventListener("click", async () => {
      if (!navigator.mediaDevices?.getUserMedia) { say("denied", "No camera here.<br>Hi anyway!"); return; }
      say("asking", "Allow the camera<br>in your browser.");
      loadDetector();
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
        video.srcObject = stream; await video.play();
        say("live", "I can see you!<br>Wave hello.");
        watch();
      } catch {
        stream = null;
        say("denied", "Camera is off.<br>Hi anyway!");
      }
    });
    cam.querySelector(".hicam-off").addEventListener("click", stop);
    // 첫 화면을 벗어나면 카메라를 끕니다
    new IntersectionObserver(([e]) => { if (!e.isIntersecting && stream) stop(); }, { threshold: 0 }).observe(cam);
    addEventListener("pagehide", () => { if (stream) stream.getTracks().forEach(tr => tr.stop()); });
  }

  /* ---------- HOME: 큰 로고가 화면에서 사라지면 머리의 작은 로고를 보여 줌 ---------- */
  const heroLogo = document.querySelector(".hero-logo");
  if (heroLogo) new IntersectionObserver(([e]) => document.body.classList.toggle("hero-out", !e.isIntersecting), { rootMargin: "-40px 0px 0px 0px" }).observe(heroLogo);

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
  const TITLES = ".huge, .pj-t, .cs-t, .card-t, .vaw-t";
  function splitChars(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll('[aria-hidden="true"]').forEach(n => n.remove());
    el.setAttribute("aria-label", clone.textContent.replace(/\s+/g, " ").trim());
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
        } else if (n.nodeType === 1 && !n.matches('sup, br, .badge, svg, img, [aria-hidden="true"]')) walk(n);
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
          scrollTrigger: { trigger: cs, start: "top top", end: "+=170%", pin: true, scrub: 1.2, invalidateOnRefresh: true },
        });
        // 1) 글이 올라오고, 큐브가 돌며 앞면을 향함
        ft(text, { y: 32, opacity: 0 }, { y: 0, opacity: 1, stagger: .025, duration: .18, ease: "power2.out" }, 0);
        // 한 바퀴 돌리지 않고, 살짝 비스듬한 상태에서 천천히 정면으로 돌아옵니다 (정신없지 않게)
        ft(cube, { rotationY: -32, rotationX: -16, scale: .86 }, { rotationY: 0, rotationX: 0, scale: 1, duration: .45, ease: "power2.inOut" }, 0);
        // 2) 옆면이 경첩처럼 펼쳐짐 (접힌 상태에서 시작)
        const fold = [[".f-left", "rotationY", -90, .48], [".f-right", "rotationY", 90, .48], [".f-top", "rotationX", 90, .48], [".f-bottom", "rotationX", -90, .48]];
        fold.forEach(([face, prop, deg, at]) => {
          gsap.set(q(face), { [prop]: deg });
          tl.fromTo(q(face), { [prop]: deg }, { [prop]: 0, duration: .3, ease: "power2.inOut", immediateRender: false }, at);
        });
        const cross = cs.classList.contains("cs--cross");
        gsap.set(q(".f-back"), { rotationY: 90, opacity: 1 });
        // 십자 전개도는 뒷면이 그대로 남고, 펼쳐진 모양이 가운데 오도록 살짝 왼쪽으로 옮김
        tl.fromTo(q(".f-back"), { rotationY: 90, opacity: 1 }, { rotationY: 0, opacity: cross ? 1 : 0, duration: cross ? .3 : .2, ease: cross ? "power2.inOut" : "power2.in", immediateRender: false }, .48);
        if (cross) tl.fromTo(cube, { x: 0 }, { x: () => -cube.offsetWidth / 2, duration: .3, ease: "power2.inOut", immediateRender: false }, .48);
        gsap.set(sides, { "--shade": .22 });
        tl.fromTo(sides, { "--shade": .22 }, { "--shade": 0, duration: .3, immediateRender: false }, .48);
        // 3) 빈 모서리가 채워져 한 장의 평면 이미지가 됨
        const corners = cs.querySelectorAll(".f-corner");
        if (corners.length) tl.fromTo(corners, { opacity: 0 }, { opacity: 1, duration: .16, ease: "power1.out", immediateRender: false }, .7);
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

  /* ---------- 목록: 커서 옆에 대표 이미지가 떠오름 ----------
     커서를 살짝 늦게 따라오고(부드러운 추적), 움직이는 방향으로 조금 기울어집니다. */
  if (fine) {
    const pv = document.createElement("div");
    pv.className = "preview"; pv.setAttribute("aria-hidden", "true");
    const pimg = document.createElement("img"); pimg.alt = ""; pimg.decoding = "async";
    pv.appendChild(pimg);
    const cur = { x: 0, y: 0 }, tgt = { x: 0, y: 0 };
    let on = false, raf = 0, fresh = true, mouse = { x: 0, y: 0 };
    const aim = () => {
      const w = pv.offsetWidth || 280, h = pv.offsetHeight || 200;
      const right = mouse.x + 28 + w < innerWidth - 12;
      tgt.x = right ? mouse.x + 28 : mouse.x - 28 - w;
      tgt.y = Math.max(12, Math.min(mouse.y - h / 2, innerHeight - h - 12));
    };
    const step = () => {
      const k = reduce ? 1 : .16;
      const dx = (tgt.x - cur.x) * k;
      cur.x += dx; cur.y += (tgt.y - cur.y) * k;
      const rot = reduce ? 0 : Math.max(-7, Math.min(7, dx * .35));
      pv.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0) rotate(${rot}deg)`;
      raf = on || Math.abs(tgt.x - cur.x) + Math.abs(tgt.y - cur.y) > .5 ? requestAnimationFrame(step) : 0;
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(step); };
    const links = document.querySelectorAll("a[data-preview]");
    // 처음 목록에 들어올 때 이미지들을 미리 받아 둡니다
    let preloaded = false;
    const preload = () => { if (preloaded) return; preloaded = true; links.forEach(a => { const i = new Image(); i.src = a.dataset.preview; }); };
    links.forEach(a => {
      a.addEventListener("mouseenter", e => {
        preload();
        if (!pv.isConnected) document.body.appendChild(pv);
        mouse = { x: e.clientX, y: e.clientY };
        pimg.src = a.dataset.preview;
        aim();
        if (fresh) { cur.x = tgt.x; cur.y = tgt.y; fresh = false; }
        pv.classList.add("is-on"); on = true; wake();
      });
      a.addEventListener("mouseleave", () => { pv.classList.remove("is-on"); on = false; });
    });
    document.querySelectorAll(".bl-list, .list").forEach(l => l.addEventListener("mouseleave", () => { fresh = true; }));
    addEventListener("mousemove", e => { mouse = { x: e.clientX, y: e.clientY }; if (on) { aim(); wake(); } }, { passive: true });
  }

})();
