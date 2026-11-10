/* 화면(HTML) 틀. 디자인 구조를 바꾸고 싶을 때만 여기를 고칩니다. 내용은 works/, content/ 에서 고칩니다.
   화면에 보이는 고정 문구는 영어, 작업 설명(요약·본문)은 index.md에 쓴 그대로(한국어) 나옵니다. */
import { esc, inline, isTodo } from "./markdown.mjs";
import { LOGO } from "./logo.mjs";

let SITE = {};
// 배포할 때마다 바뀌는 번호: 브라우저가 예전 CSS·JS를 붙잡고 있지 않게 주소 뒤에 붙입니다
const VER = Date.now().toString(36);
export const setSite = s => { SITE = s; };
export const u = p => (String(SITE.base || "/").replace(/\/?$/, "/") + String(p).replace(/^\//, ""));
const pad = n => String(n).padStart(2, "0");
const txt = s => inline(s ?? "");
const lines = v => (Array.isArray(v) ? v : v ? [v] : []).map(txt).join("<br>");
const lower = s => esc(String(s ?? "").toLowerCase());

/* ---------- 로고 ----------
   글자마다 따로 된 도형(path)이라 하나씩 나타나게 할 수 있습니다. j의 점은 포인트 색 원. */
function logoSVG(cls = "") {
  const { viewBox, letters, dot } = LOGO;
  return `<svg class="logo ${cls}" viewBox="${viewBox}" aria-hidden="true" focusable="false">${letters.map((d, i) => `<path class="lg-l" style="--i:${i}" d="${d}"/>`).join("")}<circle class="lg-dot" cx="${dot.cx}" cy="${dot.cy}" r="${dot.r}"/></svg>`;
}

/* 제목 마지막 단어와 그림을 한 덩어리로 묶어, 그림만 다음 줄로 떨어지지 않게 합니다 */
function titleWithIcon(p) {
  const words = String(p.title).split(" "), last = words.pop();
  return `${words.length ? esc(words.join(" ")) + " " : ""}<span class="pj-t-last">${esc(last)}<img class="pj-t-icon" src="${p.titleIcon.url}" alt="" aria-hidden="true"></span>`;
}

/* ---------- 공통 틀 ---------- */
function layout({ title, description, image, path = "", body, page = "", jsonld = "" }) {
  const name = SITE.name_en || SITE.name;
  const full = title ? `${title} — ${name}` : `${name} — ${SITE.keyword || "Portfolio"}`;
  const desc = description || SITE.description || "";
  const base = String(SITE.url || "").replace(/\/$/, "");
  const og = image ? (image.startsWith("http") ? image : base + image) : "";
  const nav = [["works", "Works"], ["about", "About"], ["contact", "Contact"]];
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(base + u(path))}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(name)}">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(base + u(path))}">
${og ? `<meta property="og:image" content="${esc(og)}">\n<meta name="twitter:card" content="summary_large_image">` : '<meta name="twitter:card" content="summary">'}
<meta name="theme-color" content="#FFFFFF">
<link rel="icon" href="${u("assets/favicon.svg")}" type="image/svg+xml">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400&family=Montserrat:wght@400;700&family=Roboto:wght@100;300;400;700&display=swap">
<link rel="stylesheet" href="${u("assets/css/style.css")}?v=${VER}">
<script>document.documentElement.classList.add("js");if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("motion")</script>
${jsonld}
</head>
<body class="${page}">
<canvas class="swirl" aria-hidden="true"></canvas>
<a class="skip" href="#main">Skip to content</a>
<header class="hd">
  <a class="hd-mark" href="${u("")}" aria-label="${esc(name)} — Home">${logoSVG("logo--sm")}</a>
  <nav class="hd-nav" aria-label="Main">
    ${nav.map(([k, l]) => `<a href="${u(k + "/")}"${path.startsWith(k) ? ' aria-current="page"' : ""}>${l}</a>`).join("")}
  </nav>
</header>
<main id="main" tabindex="-1">
${body}
</main>
<footer class="ft">
  <p class="ft-line">${esc(SITE.tagline || "")}</p>
  <ul class="ft-links">${contactLinks().map(l => `<li>${l}</li>`).join("")}</ul>
  <p class="ft-copy lbl">© ${new Date().getFullYear()} ${esc(name)}</p>
</footer>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js" defer></script>
<script src="${u("assets/js/site.js")}?v=${VER}" defer></script>
</body>
</html>
`;
}

function contactLinks() {
  const out = [];
  if (SITE.email && !isTodo(SITE.email)) out.push(`<a href="mailto:${esc(SITE.email)}">Email</a>`);
  for (const l of SITE.links || []) if (l.value) out.push(`<a href="${esc(l.value)}" target="_blank" rel="noopener">${esc(l.label)}</a>`);
  return out;
}

const badge = s => s ? ` <span class="badge">${esc(s)}</span>` : "";
/* 작업 이름: 영어(title) + 한국어(title_ko) 두 줄 */
const ko = p => p.titleKo ? `<span class="t-ko" lang="ko">${esc(p.titleKo)}</span>` : "";
// 설명은 한국어로 씀. 목록으로 쓰면 줄마다 나눠 보여 줌 (예: 한 줄 소개 + 수상)
const sub = s => `<span lang="ko">${Array.isArray(s) ? s.map(l => `<span class="ln">${txt(l)}</span>`).join("") : txt(s)}</span>`;

/* ---------- 미디어 ---------- */
function ratioOf(m, o = {}) {
  if (o.ratio) return o.ratio;
  if (m.width && m.height) return `${m.width}/${m.height}`;
  if (m.type === "instagram") return m.post ? "4/5.6" : "9/18.5"; // 인스타그램 화면 위아래 머리·꼬리 포함
  if (m.type === "youtube" || m.type === "vimeo" || m.type === "video") return m.vertical ? "9/16" : "16/9";
  return "4/3";
}
const num = r => { const [a, b] = String(r).split("/").map(Number); return b ? a / b : a || 1; };

function img(m, alt, { sizes = "(max-width: 760px) 100vw, 70vw", eager = false } = {}) {
  return `<img src="${esc(m.url)}"${m.srcset ? ` srcset="${esc(m.srcset)}" sizes="${sizes}"` : ""}${m.width ? ` width="${m.width}" height="${m.height}"` : ""} alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

function ytThumb(id, alt, eager) {
  return `<img src="https://i.ytimg.com/vi/${id}/maxresdefault.jpg" onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${id}/hqdefault.jpg'" alt="${esc(alt)}" ${eager ? "" : 'loading="lazy"'} decoding="async">`;
}

const DOC = /\.(pdf|pptx?|docx?|key|hwp|zip)$/i;

export function mediaHTML(m, o = {}, caption = "", opts = {}) {
  const r = ratioOf(m, o);
  const label = caption || "";
  switch (m.type) {
    case "image":
      return `<div class="frame" style="aspect-ratio:${r}">${img(m, label, opts)}</div>`;
    case "youtube": {
      const watch = `https://www.youtube.com/watch?v=${m.id}`;
      const play = o.flags?.has("thumb") ? "" : ` data-yt="${m.id}"`;
      return `<div class="frame frame--video" style="aspect-ratio:${r}"><a class="yt" href="${watch}" target="_blank" rel="noopener"${play} aria-label="${esc((label || "Video") + " — play")}">${ytThumb(m.id, label, opts.eager)}<span class="yt-play lbl"><i aria-hidden="true"></i>Play</span></a></div>`;
    }
    case "vimeo":
      return `<div class="frame frame--video" style="aspect-ratio:${r}"><iframe src="https://player.vimeo.com/video/${m.id}?dnt=1" title="${esc(label || "Video")}" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
    case "instagram":
      return `<div class="frame frame--video frame--ig" style="aspect-ratio:${r}"><iframe src="https://www.instagram.com/${m.post ? "p" : "reel"}/${m.id}/embed" title="${esc(label || "Instagram")}" loading="lazy" scrolling="no" allowtransparency="true"></iframe></div>`;
    case "audio":
      return `<div class="audio"><span class="audio-mark" aria-hidden="true"></span><audio controls preload="metadata" src="${esc(m.url)}"${label ? ` aria-label="${esc(label)}"` : ""}></audio></div>`;
    case "video": {
      const loop = o.flags?.has("loop");
      return `<div class="frame" style="aspect-ratio:${r}"><video src="${esc(m.url)}" ${loop ? "autoplay muted loop playsinline" : 'controls playsinline preload="metadata"'}${m.poster ? ` poster="${esc(m.poster)}"` : ""}${label ? ` aria-label="${esc(label.split(" | ")[0])}"` : ""}></video></div>`;
    }
    case "doc":
      return `<a class="doc" href="${esc(m.url)}" target="_blank" rel="noopener"><span class="doc-ext lbl">${esc(m.ext || "Link")}</span><span class="doc-t">${esc(label || decodeURI(m.url.split("/").pop()))}</span><span class="doc-arrow" aria-hidden="true">↗</span></a>`;
    default:
      if (DOC.test(m.name || "")) return `<p class="doc doc--missing"><span class="doc-ext lbl">${esc(m.name.split(".").pop().toUpperCase())}</span><span class="doc-t">${esc(label || m.name)} — 파일 필요 (${esc(m.name)})</span><span></span></p>`;
      return `<div class="frame ph" style="aspect-ratio:${r}"><span class="lbl">Image coming soon · ${esc(m.name || label)}</span></div>`;
  }
}

/* 캡션: "제목 | 설명"처럼 쓰면 제목은 굵게, 설명은 그 아래 작은 글로 */
function cap(caption) {
  const i = caption.indexOf(" | ");
  if (i < 0) return `<figcaption>${txt(caption)}</figcaption>`;
  return `<figcaption><strong class="cap-t">${txt(caption.slice(0, i))}</strong><span lang="ko">${txt(caption.slice(i + 3))}</span></figcaption>`;
}

/* 마크다운의 미디어 줄(묶음) → figure */
export function figure(group) {
  const first = group[0];
  const size = first.o.size || "wide";
  if (group.length === 1) {
    const { caption, o, m } = first;
    const isDoc = m.type === "doc" || (m.type === "missing" && DOC.test(m.name || ""));
    const cls = ["m", `m--${isDoc ? "doc" : size}`, o.align && `m--${o.align}`].filter(Boolean).join(" ");
    return `<figure class="${cls}" data-reveal>${mediaHTML(m, o, caption, { sizes: sizesFor(size) })}${caption && !isDoc ? cap(caption) : ""}</figure>`;
  }
  const items = group.map(({ caption, o, m }) => {
    const r = num(ratioOf(m, o));
    return `<figure class="m-cell" style="--r:${r.toFixed(4)}">${mediaHTML(m, o, caption, { sizes: `(max-width: 760px) 100vw, ${Math.round(100 / group.length)}vw` })}${caption && m.type !== "doc" ? cap(caption) : ""}</figure>`;
  });
  return `<div class="m m-row m--${size}" data-reveal>${items.join("")}</div>`;
}
const sizesFor = s => ({ full: "100vw", wide: "(max-width: 760px) 100vw, 86vw", medium: "(max-width: 760px) 100vw, 58vw", small: "(max-width: 760px) 100vw, 36vw" }[s] || "70vw");

/* ---------- 카드 ---------- */
const PH_RATIOS = ["4/5", "4/3", "1/1", "3/2", "5/6"];
function cover(p, i, sizes) {
  const c = p.cover;
  if (c && c.type === "image") return `<div class="frame" style="aspect-ratio:${ratioOf(c)}">${img(c, `${p.title} — cover`, { sizes })}</div>`;
  if (c && c.type === "youtube") return `<div class="frame" style="aspect-ratio:16/9">${ytThumb(c.id, `${p.title} — video`)}</div>`;
  return `<div class="frame ph" style="aspect-ratio:${PH_RATIOS[i % PH_RATIOS.length]}"><span class="lbl">${esc(p.title)}</span></div>`;
}
const coverUrl = p => p.cover?.type === "image" ? p.cover.url : p.cover?.type === "youtube" ? `https://i.ytimg.com/vi/${p.cover.id}/hqdefault.jpg` : "";

function card(p, i, { showCat = true, sizes = "(max-width: 760px) 100vw, 50vw" } = {}) {
  return `<article class="card${p.card ? ` card--${esc(p.card)}` : ""}" data-reveal>
  <a href="${u(`works/${p.slug}/`)}">
    <div class="card-media">${cover(p, i, sizes)}</div>
    <div class="card-cap">
      <p class="lbl card-meta"><span>${pad(i + 1)}</span>${showCat ? `<span>${esc(p.category.label)}</span>` : ""}<span>${esc(p.year)}</span></p>
      <h3 class="card-t">${esc(p.title)}${badge(p.status)}</h3>
      ${ko(p)}
      ${p.summary ? `<p class="card-s">${sub(p.summary)}</p>` : ""}
    </div>
  </a>
</article>`;
}

/* ---------- WORKS 목록 카드: 제목 · #분야 · 같은 비율(4:3) 이미지 ---------- */
function wcard(p, i) {
  // 묶음(PARROT 등)처럼 표지가 없으면 안에 든 첫 작업의 표지를 빌려 씁니다
  const own = p.cover && (p.cover.type === "image" || p.cover.type === "youtube") ? p.cover : null;
  const c = own || (p.children || []).map(ch => ch.cover).find(cv => cv && (cv.type === "image" || cv.type === "youtube"));
  const alt = `${p.title} — cover`;
  const media = c && c.type === "image" ? img(c, alt, { sizes: "(max-width: 760px) 100vw, 34vw" })
    : c && c.type === "youtube" ? ytThumb(c.id, `${p.title} — video`)
    : `<span class="lbl wc-ph">${esc(p.title)}</span>`;
  return `<article class="wc" data-reveal>
  <a href="${u(`works/${p.slug}/`)}">
    <div class="wc-cap">
      <h2 class="wc-t${/[가-힣]/.test(p.title) ? " wc-t--ko" : ""}">${p.titleIcon ? titleWithIcon(p) : esc(p.title)}${badge(p.status)}</h2>
      <p class="wc-tag">#${esc(p.category.label)}${p.parent ? ` · ${esc(p.parent.data.group || p.parent.title)}` : ""}</p>
    </div>
    <div class="wc-media">${media}</div>
  </a>
</article>`;
}

/* ---------- 3D 큐브 (HOME 대표 작업, 데스크톱 전용) ----------
   정육면체의 각 면은 대표 이미지를 3×3으로 나눈 조각입니다. 큐브가 펼쳐지면 조각이 맞춰져 한 장의 이미지가 됩니다.
   앞면을 가운데에 두고, 옆면은 앞면의 모서리에 경첩처럼 붙어 있습니다. (모션은 site.js) */
function cubeStage(p, i, total) {
  const url = p.cubeImg ? p.cubeImg.url : coverUrl(p);
  // cube_net: cross → 모서리 없이 6면이 십자 모양으로 펼쳐짐 (뒷면도 남음). 그림은 가로 4칸 × 세로 3칸
  const cross = p.data.cube_net === "cross";
  const cols = cross ? 4 : 3;
  const tile = (cls, c, r, inner = "") => `<div class="f ${cls}" style="background-position:${c * 100 / (cols - 1)}% ${r * 50}%">${inner}</div>`;
  const corners = cross ? "" : [[0, 0], [2, 0], [0, 2], [2, 2]].map(([c, r]) => tile(`f-corner f-c${c}${r}`, c, r)).join("");
  const href = u(`works/${p.slug}/`);
  return `<article class="cs${url ? "" : " cs--empty"}${cross ? " cs--cross" : ""}"${url ? ` style="--img:url('${esc(url)}')"` : ""}>
  <div class="cs-text">
    <p class="lbl cs-no">${pad(i + 1)} / ${pad(total)}</p>
    <h3 class="cs-t"><a href="${href}">${esc(p.title)}</a>${badge(p.status)}</h3>
    ${ko(p)}
    ${p.subtitle ? `<p class="cs-en">${esc(p.subtitle)}</p>` : ""}
    <p class="lbl cs-meta"><span>${esc(p.category.label)}</span><span>${esc(p.year)}</span></p>
    ${p.summary ? `<p class="cs-s">${sub(p.summary)}</p>` : ""}
    <a class="lbl arrow cs-go" href="${href}" tabindex="-1">View project</a>
  </div>
  <a class="cs-stage" href="${href}" aria-label="${esc(p.title)} — view project">
    <div class="cube">
      ${tile("f-front", 1, 1, [
        tile("f-left", 0, 1),
        tile("f-right", 2, 1, tile("f-back", cross ? 3 : 1, 1)),
        tile("f-top", 1, 0),
        tile("f-bottom", 1, 2),
        corners,
        url ? "" : `<span class="lbl f-label">${esc(p.title)}</span>`,
      ].join(""))}
    </div>
  </a>
</article>`;
}

/* ---------- HOME ---------- */
export function home({ categories, featured, all }) {
  const ld = `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "Person", name: SITE.name_en, alternateName: SITE.name, url: SITE.url, sameAs: (SITE.links || []).map(l => l.value).filter(Boolean) })}</script>`;
  const body = `
<section class="hero" aria-labelledby="hero-h">
  <h1 class="hero-logo" id="hero-h">${logoSVG("logo--lg")}<span class="sr-only">${esc(SITE.name_en || "")} — ${esc(SITE.keyword || "")}</span></h1>
  <p class="hero-hi">${lines(SITE.greeting)}</p>
  <div class="hero-intro">${(Array.isArray(SITE.intro) ? SITE.intro : SITE.intro ? [SITE.intro] : []).map(t => `<p>${txt(t)}</p>`).join("")}</div>
  <figure class="hicam" data-state="idle" aria-label="Say hi with your camera">
    <div class="hicam-mac">
      <div class="hicam-lid">
        <div class="hicam-screen">
          <video class="hicam-video" playsinline muted aria-hidden="true"></video>
          <canvas class="hicam-boxes" aria-hidden="true"></canvas>
          <p class="hicam-msg" aria-live="polite">Hi there.<br>Wave back?</p>
          <button class="hicam-btn" type="button"><i aria-hidden="true"></i>Say hi</button>
          <button class="hicam-off lbl" type="button" aria-label="Turn camera off">Off</button>
          <figure class="hicam-pip">
            <video class="hicam-me" autoplay poster="${u("assets/media/hello.jpg")}" muted loop playsinline preload="metadata" aria-label="Juehee bowing and waving hello"><source src="${u("assets/media/hello.mp4")}" type="video/mp4"><source src="${u("assets/media/hello.webm")}" type="video/webm"></video>
            <figcaption class="lbl">juehee</figcaption>
          </figure>
        </div>
      </div>
      <div class="hicam-base" aria-hidden="true"></div>
    </div>
    <figcaption class="hicam-bar lbl"><span class="hicam-rec"><i></i>Live</span><time class="hicam-clock"></time></figcaption>
    <p class="hicam-note">Your camera stays on your device. Nothing is recorded or sent.</p>
  </figure>
  <p class="hero-scroll lbl" aria-hidden="true">Scroll <i></i></p>
</section>

<section class="sec sel" aria-labelledby="sel-h">
  <div class="sec-hd"><h2 class="lbl br" id="sel-h">selected works</h2></div>
  <div class="cubes">${featured.map((p, i) => cubeStage(p, i, featured.length)).join("")}</div>
  <div class="grid sel-grid">${featured.map((p, i) => card(p, i)).join("")}</div>
</section>

<section class="sec vaw-wrap">
  <a class="vaw" href="${u("works/")}"><span class="vaw-t">View all works</span><sup>${all.length}</sup><span class="vaw-btn" aria-hidden="true"></span></a>
</section>

<section class="sec" aria-labelledby="cat-h">
  <div class="sec-hd"><h2 class="lbl br" id="cat-h">index</h2></div>
  ${bigList(categories, { level: 3, tiles: true })}
</section>

<section class="sec statement" aria-labelledby="st-h">
  <h2 class="lbl br" id="st-h">statement</h2>
  <p class="statement-t">${txt(SITE.statement || "")}</p>
  <a class="lbl arrow" href="${u("about/")}">About</a>
</section>`;
  return layout({ body, page: "pg-home", jsonld: ld, image: featured.find(p => p.cover?.type === "image")?.cover.url });
}

/* ---------- WORKS ---------- */
export function worksPage({ categories, current, list }) {
  // 묶음(PARROT·HUSS·Sogang Intelligence)은 펼쳐서 안의 작업을 하나씩 나열합니다
  const flat = ws => ws.flatMap(p => p.children && p.children.length ? p.children : [p]);
  const total = categories.reduce((n, c) => n + flat(c.works).length, 0);
  list = flat(list);
  const body = `
<section class="wk-hd">
  <h1 class="wk-title">works</h1>
  <p class="lbl br wk-cat">category</p>
  <nav class="wk-filter" aria-label="Categories">
    <a href="${u("works/")}"${current ? "" : ' aria-current="page"'}>All<sub>${total}</sub></a>
    ${categories.map(c => `<a href="${u(`works/${c.key}/`)}"${current === c ? ' aria-current="page"' : ""}>${esc(c.label)}<sub>${flat(c.works).length}</sub></a>`).join("")}
  </nav>
  <div class="wk-view" role="group" aria-label="View">
    <button type="button" data-view="grid" aria-pressed="true">grid</button>
    <button type="button" data-view="list" aria-pressed="false">list</button>
  </div>
</section>
${current && current.description ? `<p class="wk-desc">${txt(current.description)}</p>` : ""}
<div class="wk" data-view="grid">
  <div class="wgrid">${list.map((p, i) => wcard(p, i)).join("")}</div>
  <div class="list">${bigList(current ? [current] : categories, { level: 2, children: true, heading: !current })}</div>
</div>`;
  return layout({ title: current ? current.label : "Works", description: current ? `${current.label} — ${current.sub}` : SITE.works_intro, path: current ? `works/${current.key}/` : "works/", body, page: "pg-works" });
}

/* ---------- 분야별 목록 ----------
   큰 분야 이름 + 작업 목록. 마우스를 올리면 대표 이미지가 커서 옆에 떠오릅니다 (site.js의 data-preview).
   tiles: 분야 옆에 대표 이미지를 펼친 큐브 모양(십자)으로 놓습니다 (HOME). */
const CROSS = [[2, 2], [2, 1], [1, 2], [3, 2], [2, 3]];
function bigList(groups, { level = 3, children = false, heading = true, tiles = false } = {}) {
  const h = `h${level}`;
  const item = (p, child = false) => `<li${child ? ' class="is-child"' : ""}><a href="${u(`works/${p.slug}/`)}"${coverUrl(p) ? ` data-preview="${esc(coverUrl(p))}"` : ""}>
      <span class="bl-t">${child ? '<i aria-hidden="true">↳ </i>' : ""}${esc(p.title)}</span>${badge(p.status)}
      <span class="bl-m"><span class="bl-y">${esc(p.year)}</span>${p.titleKo ? `<span class="bl-ko" lang="ko">${esc(p.titleKo)}</span>` : ""}</span>
    </a></li>`;
  const tileHTML = c => {
    // 작업마다 대표 그림 하나씩, 칸이 남으면 tiles:로 지정한 장면들로 채움
    const main = c.works.filter(p => coverUrl(p)).map(p => ({ p, src: p.thumbImg ? p.thumbImg.url : coverUrl(p) }));
    const extra = c.works.flatMap(p => (p.tileImgs || []).map(m => ({ p, src: m.url })));
    const cells = [...main, ...extra].slice(0, CROSS.length);
    if (!tiles || !cells.length) return "";
    return `<div class="bl-tiles" aria-hidden="true">${cells.map(({ p, src }, i) => `<a href="${u(`works/${p.slug}/`)}" tabindex="-1" style="grid-area:${CROSS[i][1]} / ${CROSS[i][0]}" data-reveal><img src="${esc(src)}" alt="" loading="lazy" decoding="async"></a>`).join("")}</div>`;
  };
  return `<div class="bl${tiles ? " bl--tiles" : ""}">${groups.map(c => `
  <section class="bl-g${tileHTML(c) ? " has-tiles" : ""}" aria-label="${esc(c.label)}">
    <div class="bl-text">
      ${heading ? `<${h} class="bl-h"><a href="${u(`works/${c.key}/`)}"><span class="huge bl-word">${lower(c.label)}</span><sup>${c.works.length}</sup></a></${h}>${c.sub ? `<p class="bl-sub">${esc(c.sub)}</p>` : ""}` : ""}
      <ol class="bl-list">${c.works.map(p => item(p) + (children ? p.children.map(ch => item(ch, true)).join("") : "")).join("")}</ol>
    </div>
    ${tileHTML(c)}
  </section>`).join("")}
</div>`;
}

/* ---------- 작업 상세 ---------- */
export function projectPage({ p, cat, html, gallery, prev, next }) {
  const meta = [["Year", p.year], ["Period", p.period], ["Role", p.role], ["Team", p.team], ["Tools", p.tools], ...p.info.map(x => [x.label, x.value])].filter(([, v]) => v);
  const links = p.links.map(l => l.value
    ? `<li><a href="${esc(l.value)}" target="_blank" rel="noopener">${esc(l.label)}<span aria-hidden="true"> ↗</span><span class="sr-only"> (opens in a new tab)</span></a></li>`
    : `<li><span class="todo">${esc(l.label)} — 링크 필요</span></li>`).join("");
  let hero = "";
  if (p.data.hero !== false && p.cover && (p.cover.type === "image" || p.cover.type === "youtube")) {
    hero = `<figure class="m m--full pj-hero">${mediaHTML(p.cover, {}, p.cover.type === "youtube" ? `${p.title} — video` : `${p.title} — cover`, { sizes: "100vw", eager: true })}</figure>`;
  }
  // 자동 갤러리: 1장, 2장, 1장, 2장 … 리듬으로 배치
  const rows = [];
  for (let i = 0, k = 0; i < gallery.length; k++) { const n = k % 2 ? 2 : 1; rows.push(gallery.slice(i, i + n)); i += n; }
  const galleryHTML = rows.map(r => figure(r.map(m => ({ caption: "", o: { flags: new Set() }, m })))).join("");
  const parent = p.parent;
  const body = `
<article class="pj">
  <header class="pj-hd">
    <p class="lbl br pj-crumb"><a href="${u("works/")}">works</a> / <a href="${u(`works/${cat.key}/`)}">${lower(cat.label)}</a>${parent ? ` / <a href="${u(`works/${parent.slug}/`)}">${lower(parent.title)}</a>` : ""}</p>
    <h1 class="pj-t${/[가-힣]/.test(p.title) ? " pj-t--ko" : ""}">${esc(p.title)}${badge(p.status)}</h1>
    ${p.titleKo ? `<p class="pj-ko" lang="ko">${p.titleIcon ? titleWithIcon({ title: p.titleKo, titleIcon: p.titleIcon }) : esc(p.titleKo)}</p>` : ""}
    ${p.subtitle ? `<p class="pj-en">${esc(p.subtitle)}</p>` : ""}
    <div class="pj-intro">
      ${p.summary ? `<p class="pj-lead">${sub(p.summary)}</p>` : ""}
      ${links ? `<ul class="pj-links" aria-label="Links">${links}</ul>` : ""}
    </div>
    ${meta.length ? `<dl class="pj-meta">${meta.map(([k, v]) => `<div><dt class="lbl">${esc(k)}</dt><dd>${txt(v)}</dd></div>`).join("")}</dl>` : ""}
  </header>
  ${hero}
  <div class="pj-body">${html}${galleryHTML}</div>
  ${p.children.length ? `<section class="pj-children" aria-labelledby="ch-h"><div class="sec-hd"><h2 class="lbl br" id="ch-h">projects <sup>${p.children.length}</sup></h2></div><div class="grid grid--sm">${p.children.map((c, i) => card(c, i, { showCat: false })).join("")}</div></section>` : ""}
  <nav class="pj-nav" aria-label="More works">
    ${prev ? `<a class="pj-prev" href="${u(`works/${prev.slug}/`)}"><span class="lbl">← Prev</span>${esc(prev.title)}</a>` : "<span></span>"}
    <a class="pj-up lbl" href="${u(parent ? `works/${parent.slug}/` : `works/${cat.key}/`)}">${esc(parent ? parent.title : cat.label)}</a>
    ${next ? `<a class="pj-next" href="${u(`works/${next.slug}/`)}"><span class="lbl">Next →</span>${esc(next.title)}</a>` : "<span></span>"}
  </nav>
</article>`;
  const plain = [p.subtitle, [].concat(p.summary).join(" ").replace(/\[[^\]]*\]/g, "").trim()].filter(Boolean).join(" — ");
  return layout({ title: p.title, description: plain, image: coverUrl(p), path: `works/${p.slug}/`, body, page: "pg-project" });
}

/* ---------- ABOUT ---------- */
export function aboutPage({ data, html, portrait }) {
  const body = `
<section class="pg-hd ab-hd">
  <p class="lbl br">about</p>
  <h1 class="huge">${lower(data.title || "about")}</h1>
  ${portrait && portrait.type === "image" ? `<figure class="ab-portrait">${mediaHTML(portrait, {}, data.portrait_alt || `Portrait of ${SITE.name_en}`, { sizes: "(max-width: 760px) 70vw, 28vw" })}</figure>` : ""}
  ${data.lead ? `<p class="ab-lead">${txt(data.lead)}</p>` : ""}
</section>
<div class="pj-body ab-body">${html}</div>`;
  return layout({ title: "About", description: String(data.lead || "").replace(/\[[^\]]*\]/g, ""), path: "about/", body, page: "pg-about" });
}

/* ---------- CONTACT ---------- */
export function contactPage() {
  const email = SITE.email && !isTodo(SITE.email) ? `<a class="ct-mail" href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>` : `<p class="ct-mail"><span class="todo">${esc(SITE.email || "[작성 필요] email")}</span></p>`;
  const body = `
<section class="pg-hd ct">
  <p class="lbl br">contact</p>
  <h1 class="huge">contact</h1>
  <p class="pg-sub">${txt(SITE.contact_message || "")}</p>
  ${email}
  <ul class="ct-links">${(SITE.links || []).map(l => `<li><span class="lbl">${esc(l.label)}</span>${l.value ? `<a href="${esc(l.value)}" target="_blank" rel="noopener">${esc(l.value.replace(/^https?:\/\/(www\.)?/, ""))}<span aria-hidden="true"> ↗</span></a>` : '<span class="todo">링크 필요</span>'}</li>`).join("")}</ul>
</section>`;
  return layout({ title: "Contact", path: "contact/", body, page: "pg-contact" });
}

export function notFound() {
  return layout({ title: "404", path: "404.html", page: "pg-404", body: `<section class="pg-hd ct"><p class="lbl br">404</p><h1 class="huge">not found</h1><p class="pg-sub">This page has moved, or has not taken form yet.</p><p><a class="lbl arrow" href="${u("works/")}">Works</a></p></section>` });
}
