/* 화면(HTML) 틀. 디자인 구조를 바꾸고 싶을 때만 여기를 고칩니다. 내용은 works/, content/ 에서 고칩니다. */
import { esc, inline, isTodo } from "./markdown.mjs";

let SITE = {};
export const setSite = s => { SITE = s; };
export const u = p => (String(SITE.base || "/").replace(/\/?$/, "/") + String(p).replace(/^\//, ""));
const pad = n => String(n).padStart(2, "0");
const txt = s => inline(s ?? "");

/* ---------- 공통 틀 ---------- */
function layout({ title, description, image, path = "", body, page = "", jsonld = "" }) {
  const full = title ? `${title} — ${SITE.name_en || SITE.name}` : `${SITE.name_en || SITE.name} — ${SITE.keyword || "Portfolio"}`;
  const desc = description || SITE.description || "";
  const base = String(SITE.url || "").replace(/\/$/, "");
  const og = image ? (image.startsWith("http") ? image : base + image) : "";
  const nav = [["works", "WORKS"], ["about", "ABOUT"], ["contact", "CONTACT"]];
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(base + u(path))}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE.name_en || SITE.name)}">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(base + u(path))}">
${og ? `<meta property="og:image" content="${esc(og)}">\n<meta name="twitter:card" content="summary_large_image">` : '<meta name="twitter:card" content="summary">'}
<meta name="theme-color" content="#EFEEE8">
<link rel="icon" href="${u("assets/favicon.svg")}" type="image/svg+xml">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="${u("assets/css/style.css")}">
<script>document.documentElement.classList.add("js");if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("motion")</script>
${jsonld}
</head>
<body class="${page}">
<a class="skip" href="#main">본문으로 건너뛰기</a>
<header class="hd">
  <a class="hd-mark" href="${u("")}"><b>${esc(SITE.name_en || SITE.name)}</b><span>${esc(SITE.keyword || "")}</span></a>
  <nav class="hd-nav" aria-label="주요 메뉴">
    ${nav.map(([k, l]) => `<a href="${u(k + "/")}"${path.startsWith(k) ? ' aria-current="page"' : ""}>${l}</a>`).join("")}
  </nav>
  <p class="hd-clock mono" aria-hidden="true">SEOUL <span data-clock>--:--</span></p>
</header>
<main id="main" tabindex="-1">
${body}
</main>
<footer class="ft">
  <p class="ft-line">${esc(SITE.tagline || "")}</p>
  <ul class="ft-links">${contactLinks().map(l => `<li>${l}</li>`).join("")}</ul>
  <p class="ft-copy mono">© ${new Date().getFullYear()} ${esc(SITE.name_en || SITE.name)}</p>
</footer>
<div class="grain" aria-hidden="true"></div>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js" defer></script>
<script src="${u("assets/js/site.js")}" defer></script>
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

/* ---------- 미디어 ---------- */
function ratioOf(m, o = {}) {
  if (o.ratio) return o.ratio;
  if (m.width && m.height) return `${m.width}/${m.height}`;
  if (m.type === "youtube" || m.type === "vimeo" || m.type === "video") return m.vertical ? "9/16" : "16/9";
  return "4/3";
}
const num = r => { const [a, b] = String(r).split("/").map(Number); return b ? a / b : a || 1; };

function img(m, alt, { sizes = "(max-width: 760px) 100vw, 70vw", eager = false } = {}) {
  return `<img src="${esc(m.url)}"${m.srcset ? ` srcset="${esc(m.srcset)}" sizes="${sizes}"` : ""}${m.width ? ` width="${m.width}" height="${m.height}"` : ""} alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"${m.external ? "" : " data-mosaic"}>`;
}

function ytThumb(id, alt, eager) {
  return `<img src="https://i.ytimg.com/vi/${id}/maxresdefault.jpg" onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${id}/hqdefault.jpg'" alt="${esc(alt)}" ${eager ? "" : 'loading="lazy"'} decoding="async">`;
}

export function mediaHTML(m, o = {}, caption = "", opts = {}) {
  const r = ratioOf(m, o);
  const label = caption || "";
  switch (m.type) {
    case "image":
      return `<div class="frame" style="aspect-ratio:${r}">${img(m, label, opts)}</div>`;
    case "youtube": {
      const watch = `https://www.youtube.com/watch?v=${m.id}`;
      const play = o.flags?.has("thumb") ? "" : ` data-yt="${m.id}"`;
      return `<div class="frame frame--video" style="aspect-ratio:${r}"><a class="yt" href="${watch}" target="_blank" rel="noopener"${play} aria-label="${esc((label || "영상") + " — 재생")}">${ytThumb(m.id, label, opts.eager)}<span class="yt-play mono"><i aria-hidden="true"></i>PLAY</span></a></div>`;
    }
    case "vimeo":
      return `<div class="frame frame--video" style="aspect-ratio:${r}"><iframe src="https://player.vimeo.com/video/${m.id}?dnt=1" title="${esc(label || "영상")}" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
    case "video": {
      const loop = o.flags?.has("loop");
      return `<div class="frame" style="aspect-ratio:${r}"><video src="${esc(m.url)}" ${loop ? "autoplay muted loop playsinline" : 'controls playsinline preload="metadata"'}${label ? ` aria-label="${esc(label)}"` : ""}></video></div>`;
    }
    case "doc":
      return `<a class="doc" href="${esc(m.url)}" target="_blank" rel="noopener"><span class="doc-ext mono">${esc(m.ext || "LINK")}</span><span class="doc-t">${esc(label || decodeURI(m.url.split("/").pop()))}</span><span class="doc-arrow" aria-hidden="true">↗</span></a>`;
    default:
      if (/\.(pdf|pptx?|docx?|key|hwp|zip)$/i.test(m.name || "")) return `<p class="doc doc--missing"><span class="doc-ext mono">${esc(m.name.split(".").pop().toUpperCase())}</span><span class="doc-t">${esc(label || m.name)} — 파일 필요 (${esc(m.name)})</span><span></span></p>`;
      return `<div class="frame ph" style="aspect-ratio:${r}"><span class="mono">이미지 자리 · ${esc(m.name || label)}</span></div>`;
  }
}

/* 마크다운의 미디어 줄(묶음) → figure */
export function figure(group) {
  const first = group[0];
  const size = first.o.size || "wide";
  if (group.length === 1) {
    const { caption, o, m } = first;
    const isDoc = m.type === "doc" || (m.type === "missing" && /\.(pdf|pptx?|docx?|key|hwp|zip)$/i.test(m.name || ""));
    const cls = ["m", `m--${isDoc ? "doc" : size}`, o.align && `m--${o.align}`].filter(Boolean).join(" ");
    return `<figure class="${cls}" data-reveal>${mediaHTML(m, o, caption, { sizes: sizesFor(size) })}${caption && !isDoc ? `<figcaption class="mono">${txt(caption)}</figcaption>` : ""}</figure>`;
  }
  const items = group.map(({ caption, o, m }) => {
    const r = num(ratioOf(m, o));
    return `<figure class="m-cell" style="--r:${r.toFixed(4)}">${mediaHTML(m, o, caption, { sizes: `(max-width: 760px) 100vw, ${Math.round(100 / group.length)}vw` })}${caption && m.type !== "doc" ? `<figcaption class="mono">${txt(caption)}</figcaption>` : ""}</figure>`;
  });
  return `<div class="m m-row m--${size}" data-reveal>${items.join("")}</div>`;
}
const sizesFor = s => ({ full: "100vw", wide: "(max-width: 760px) 100vw, 86vw", medium: "(max-width: 760px) 100vw, 58vw", small: "(max-width: 760px) 100vw, 36vw" }[s] || "70vw");

/* ---------- 카드 ---------- */
const PH_RATIOS = ["4/5", "4/3", "1/1", "3/2", "5/6"];
function cover(p, i, sizes) {
  const c = p.cover;
  if (c && c.type === "image") return `<div class="frame" style="aspect-ratio:${ratioOf(c)}">${img(c, `${p.title} 대표 이미지`, { sizes })}</div>`;
  if (c && c.type === "youtube") return `<div class="frame" style="aspect-ratio:16/9">${ytThumb(c.id, `${p.title} 영상 썸네일`)}</div>`;
  return `<div class="frame ph" style="aspect-ratio:${PH_RATIOS[i % PH_RATIOS.length]}"><span class="mono">${esc(p.titleEn || p.title)}</span></div>`;
}
const coverUrl = p => p.cover?.type === "image" ? p.cover.url : p.cover?.type === "youtube" ? `https://i.ytimg.com/vi/${p.cover.id}/hqdefault.jpg` : "";

function card(p, i, { showCat = true, sizes = "(max-width: 760px) 100vw, 50vw" } = {}) {
  return `<article class="card${p.card ? ` card--${esc(p.card)}` : ""}" data-reveal>
  <a href="${u(`works/${p.slug}/`)}">
    <div class="card-media">${cover(p, i, sizes)}</div>
    <div class="card-cap">
      <p class="mono card-meta"><span>${pad(i + 1)}</span>${showCat ? `<span>${esc(p.category.label)}</span>` : ""}<span>${esc(p.year)}</span></p>
      <h3 class="card-t">${esc(p.title)}${badge(p.status)}</h3>
      ${p.titleEn ? `<p class="card-en">${esc(p.titleEn)}</p>` : ""}
      ${p.summary ? `<p class="card-s">${txt(p.summary)}</p>` : ""}
    </div>
  </a>
</article>`;
}

/* ---------- HOME ---------- */
export function home({ categories, featured, all }) {
  const ld = `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "Person", name: SITE.name, alternateName: SITE.name_en, url: SITE.url, sameAs: (SITE.links || []).map(l => l.value).filter(Boolean) })}</script>`;
  const years = all.map(p => parseInt(p.year)).filter(Boolean);
  const span = years.length ? `${Math.min(...years)}—${Math.max(...years)}` : "";
  const body = `
<section class="intro" aria-labelledby="intro-h">
  <canvas class="intro-dots" data-word="${esc(SITE.keyword || "POIESIS")}" aria-hidden="true"></canvas>
  <p class="intro-tl mono">${esc(SITE.name_en || "")}<br>ARCHIVE ${span}</p>
  <p class="intro-def"><i>poiesis</i> <span class="mono">(n.)</span><br>${txt(SITE.definition || "")}</p>
  <h1 class="intro-h" id="intro-h"><span class="sr-only">${esc(SITE.keyword || "")} — </span>${txt(SITE.tagline || "").replace(", ", ",<br>")}</h1>
  <p class="intro-scroll mono" aria-hidden="true">SCROLL</p>
</section>

<section class="sec" aria-labelledby="sel-h">
  <div class="sec-hd"><h2 class="mono" id="sel-h">SELECTED WORKS <sup>${featured.length}</sup></h2><a class="mono arrow" href="${u("works/")}">ALL WORKS</a></div>
  <div class="grid">${featured.map((p, i) => card(p, i)).join("")}</div>
</section>

<section class="sec" aria-labelledby="cat-h">
  <div class="sec-hd"><h2 class="mono" id="cat-h">INDEX</h2></div>
  <ol class="cats">${categories.map(c => `
    <li data-reveal><a href="${u(`works/${c.key}/`)}">
      <span class="mono cats-no">${esc(c.no)}</span>
      <span class="cats-t">${esc(c.label)}<sup class="mono">${c.works.length}</sup></span>
      <span class="cats-ko">${esc(c.ko)}</span>
      <span class="cats-thumbs" aria-hidden="true">${c.works.slice(0, 4).map(p => coverUrl(p) ? `<img src="${esc(coverUrl(p))}" alt="" loading="lazy">` : "<i></i>").join("")}</span>
    </a></li>`).join("")}
  </ol>
</section>

<section class="sec statement" aria-label="작업 방식">
  <p class="mono">STATEMENT</p>
  <p class="statement-t">${txt(SITE.statement || "")}</p>
  <a class="mono arrow" href="${u("about/")}">ABOUT</a>
</section>`;
  return layout({ body, page: "pg-home", jsonld: ld, image: featured.find(p => p.cover?.type === "image")?.cover.url });
}

/* ---------- WORKS ---------- */
export function worksPage({ categories, current, list }) {
  const total = categories.reduce((n, c) => n + c.works.length, 0);
  const rows = list.flatMap((p, i) => [row(p, pad(i + 1), current), ...p.children.map((c, j) => row(c, `${pad(i + 1)}.${j + 1}`, current, true))]);
  const body = `
<section class="wk-hd">
  <p class="mono">${current ? `WORKS / ${esc(current.no)}` : "ARCHIVE"}</p>
  <h1 class="display">${current ? esc(current.label) : "WORKS"}</h1>
  ${current ? `<p class="wk-ko">${esc(current.ko)}</p>${current.description ? `<p class="wk-desc">${txt(current.description)}</p>` : ""}` : `<p class="wk-ko">${esc(SITE.works_intro || "")}</p>`}
</section>
<div class="wk-bar">
  <nav class="wk-filter mono" aria-label="카테고리">
    <a href="${u("works/")}"${current ? "" : ' aria-current="page"'}>ALL<sup>${total}</sup></a>
    ${categories.map(c => `<a href="${u(`works/${c.key}/`)}"${current === c ? ' aria-current="page"' : ""}>${esc(c.label)}<sup>${c.works.length}</sup></a>`).join("")}
  </nav>
  <div class="wk-view mono" role="group" aria-label="보기 방식">
    <button type="button" data-view="grid" aria-pressed="true">GRID</button>
    <button type="button" data-view="list" aria-pressed="false">LIST</button>
  </div>
</div>
<div class="wk" data-view="grid">
  <div class="grid">${list.map((p, i) => card(p, i, { showCat: !current })).join("")}</div>
  <ol class="list">${rows.join("")}</ol>
</div>`;
  return layout({ title: current ? current.label : "Works", description: current ? `${current.label} — ${current.ko}` : SITE.works_intro, path: current ? `works/${current.key}/` : "works/", body, page: "pg-works" });
}

function row(p, no, current, child = false) {
  return `<li class="${child ? "is-child" : ""}"><a href="${u(`works/${p.slug}/`)}"${coverUrl(p) ? ` data-preview="${esc(coverUrl(p))}"` : ""}>
    <span class="mono l-no">${no}</span>
    <span class="l-t">${child ? '<i aria-hidden="true">↳</i> ' : ""}${esc(p.title)}${badge(p.status)}</span>
    <span class="mono l-c">${current ? "" : esc(p.category.label)}</span>
    <span class="l-r">${txt(p.role)}</span>
    <span class="mono l-y">${esc(p.year)}</span>
  </a></li>`;
}

/* ---------- 작업 상세 ---------- */
export function projectPage({ p, cat, html, gallery, prev, next }) {
  const meta = [["연도", p.year], ["기간", p.period], ["역할", p.role], ["팀", p.team], ["도구", p.tools], ...p.info.map(x => [x.label, x.value])].filter(([, v]) => v);
  const links = p.links.map(l => l.value
    ? `<li><a href="${esc(l.value)}" target="_blank" rel="noopener">${esc(l.label)}<span aria-hidden="true"> ↗</span><span class="sr-only"> (새 탭)</span></a></li>`
    : `<li><span class="todo">${esc(l.label)} — 링크 필요</span></li>`).join("");
  let hero = "";
  if (p.data.hero !== false && p.cover && (p.cover.type === "image" || p.cover.type === "youtube")) {
    hero = `<figure class="m m--full pj-hero">${mediaHTML(p.cover, {}, p.cover.type === "youtube" ? `${p.title} 영상` : `${p.title} 대표 이미지`, { sizes: "100vw", eager: true })}</figure>`;
  }
  // 자동 갤러리: 1장, 2장, 1장, 2장 … 리듬으로 배치
  const rows = [];
  for (let i = 0, k = 0; i < gallery.length; k++) { const n = k % 2 ? 2 : 1; rows.push(gallery.slice(i, i + n)); i += n; }
  const galleryHTML = rows.map(r => figure(r.map(m => ({ caption: "", o: { flags: new Set() }, m })))).join("");
  const parent = p.parent;
  const body = `
<article class="pj">
  <header class="pj-hd">
    <p class="mono pj-crumb"><a href="${u("works/")}">WORKS</a> / <a href="${u(`works/${cat.key}/`)}">${esc(cat.label)}</a>${parent ? ` / <a href="${u(`works/${parent.slug}/`)}">${esc(parent.title)}</a>` : ""}</p>
    <h1 class="pj-t">${esc(p.title)}${badge(p.status)}</h1>
    ${p.titleEn ? `<p class="pj-en">${esc(p.titleEn)}</p>` : ""}
    <div class="pj-intro">
      ${p.summary ? `<p class="pj-lead">${txt(p.summary)}</p>` : ""}
      ${links ? `<ul class="pj-links">${links}</ul>` : ""}
    </div>
    ${meta.length ? `<dl class="pj-meta">${meta.map(([k, v]) => `<div><dt class="mono">${esc(k)}</dt><dd>${txt(v)}</dd></div>`).join("")}</dl>` : ""}
  </header>
  ${hero}
  <div class="pj-body">${html}${galleryHTML}</div>
  ${p.children.length ? `<section class="pj-children" aria-labelledby="ch-h"><div class="sec-hd"><h2 class="mono" id="ch-h">PROJECTS <sup>${p.children.length}</sup></h2></div><div class="grid grid--sm">${p.children.map((c, i) => card(c, i, { showCat: false })).join("")}</div></section>` : ""}
  <nav class="pj-nav" aria-label="다른 작업">
    ${prev ? `<a class="pj-prev" href="${u(`works/${prev.slug}/`)}"><span class="mono">← PREV</span>${esc(prev.title)}</a>` : "<span></span>"}
    <a class="pj-up mono" href="${u(parent ? `works/${parent.slug}/` : `works/${cat.key}/`)}">${esc(parent ? parent.title : cat.label)}</a>
    ${next ? `<a class="pj-next" href="${u(`works/${next.slug}/`)}"><span class="mono">NEXT →</span>${esc(next.title)}</a>` : "<span></span>"}
  </nav>
</article>`;
  const plain = String(p.summary).replace(/\[[^\]]*\]/g, "").trim();
  return layout({ title: p.title, description: plain, image: coverUrl(p), path: `works/${p.slug}/`, body, page: "pg-project" });
}

/* ---------- ABOUT ---------- */
export function aboutPage({ data, html, portrait }) {
  const body = `
<section class="ab-hd">
  <p class="mono">ABOUT</p>
  <h1 class="display">${esc(data.title || "ABOUT")}</h1>
  ${portrait && portrait.type === "image" ? `<figure class="ab-portrait">${mediaHTML(portrait, {}, data.portrait_alt || `${SITE.name} 사진`, { sizes: "(max-width: 760px) 70vw, 28vw" })}</figure>` : ""}
  ${data.lead ? `<p class="ab-lead">${txt(data.lead)}</p>` : ""}
</section>
<div class="pj-body ab-body">${html}</div>`;
  return layout({ title: "About", description: String(data.lead || "").replace(/\[[^\]]*\]/g, ""), path: "about/", body, page: "pg-about" });
}

/* ---------- CONTACT ---------- */
export function contactPage() {
  const email = SITE.email && !isTodo(SITE.email) ? `<a class="ct-mail" href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>` : `<p class="ct-mail"><span class="todo">${esc(SITE.email || "[작성 필요] 이메일")}</span></p>`;
  const body = `
<section class="ct">
  <p class="mono">CONTACT</p>
  <h1 class="display">CONTACT</h1>
  <p class="ct-lead">${txt(SITE.contact_message || "")}</p>
  ${email}
  <ul class="ct-links">${(SITE.links || []).map(l => `<li><span class="mono">${esc(l.label)}</span>${l.value ? `<a href="${esc(l.value)}" target="_blank" rel="noopener">${esc(l.value.replace(/^https?:\/\/(www\.)?/, ""))}<span aria-hidden="true"> ↗</span></a>` : '<span class="todo">링크 필요</span>'}</li>`).join("")}</ul>
</section>`;
  return layout({ title: "Contact", path: "contact/", body, page: "pg-contact" });
}

export function notFound() {
  return layout({ title: "404", path: "404.html", page: "pg-404", body: `<section class="ct"><p class="mono">404</p><h1 class="display">NOT FOUND</h1><p class="ct-lead">주소가 바뀌었거나 아직 형태가 되지 않은 페이지예요.</p><p><a class="mono arrow" href="${u("works/")}">WORKS</a></p></section>` });
}
