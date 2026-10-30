/* =========================================================
   POIESIS 사이트 빌더
   works/ 폴더와 content/ 폴더를 읽어서 _site/ 에 완성된 웹사이트를 만듭니다.
   - 외부 패키지 없이 동작합니다. (sharp가 설치돼 있으면 이미지를 webp로 줄여 줍니다)
   - 실행: node scripts/build.mjs
   ========================================================= */
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontMatter, parseList, renderMarkdown, isTodo } from "./lib/markdown.mjs";
import { imageSize } from "./lib/imagesize.mjs";
import * as T from "./lib/templates.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "_site");
const WORKS = path.join(ROOT, "works");
const CONTENT = path.join(ROOT, "content");

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|svg)$/i;
const RASTER_EXT = /\.(jpe?g|png|webp)$/i;
const VIDEO_EXT = /\.(mp4|webm|m4v|mov)$/i;
const DOC_EXT = /\.(pdf|pptx?|docx?|key|hwp|zip)$/i;
const WIDTHS = [640, 1280, 1920];

const warnings = [];
const warn = msg => warnings.push(msg);
const nfc = s => String(s).normalize("NFC");

let sharp = null;
try { sharp = (await import("sharp")).default; } catch { /* sharp 없이도 빌드됩니다 */ }

/* ---------- 파일 찾기 (맥에서 올린 한글 파일 이름도 맞춰 줍니다) ---------- */
function findFile(dir, ref) {
  const parts = nfc(ref).replace(/^\.\//, "").split("/").filter(Boolean);
  let cur = dir;
  for (const part of parts) {
    if (!fs.existsSync(cur) || !fs.statSync(cur).isDirectory()) return null;
    const hit = fs.readdirSync(cur).find(n => nfc(n) === part)
      ?? fs.readdirSync(cur).find(n => nfc(n).toLowerCase() === part.toLowerCase());
    if (!hit) return null;
    cur = path.join(cur, hit);
  }
  return fs.statSync(cur).isFile() ? cur : null;
}

const safeName = s => nfc(s).replace(/\s+/g, "-").replace(/[?#%"'<>\\]/g, "");
const urlPath = p => encodeURI(p).replace(/#/g, "%23").replace(/\?/g, "%3F");

/* ---------- 미디어 복사 + 크기 읽기 + (가능하면) webp 변환 ---------- */
const assetCache = new Map();
async function asset(dir, slug, ref) {
  const abs = findFile(dir, ref);
  if (!abs) return null;
  if (assetCache.has(abs)) return assetCache.get(abs);
  const rel = `media/${slug}/${path.relative(dir, abs).split(path.sep).map(safeName).join("/")}`;
  const dest = path.join(OUT, rel);
  await fsp.mkdir(path.dirname(dest), { recursive: true });
  await fsp.copyFile(abs, dest);
  const size = fs.statSync(abs).size;
  if (size > 20 * 1024 * 1024) warn(`${rel}: ${(size / 1048576).toFixed(0)}MB — 너무 큽니다. 영상은 유튜브, 이미지는 2000px 이하로 줄여 주세요.`);
  const info = { url: T.u(urlPath(rel)), abs, rel, srcset: "" };
  if (IMAGE_EXT.test(abs)) {
    const dim = imageSize(await fsp.readFile(abs));
    if (dim) { info.width = dim.width; info.height = dim.height; }
    if (sharp && RASTER_EXT.test(abs) && info.width) {
      const set = [];
      const base = rel.replace(/\.[^.]+$/, "");
      for (const w of WIDTHS) {
        if (w >= info.width) break;
        const out = `${base}-${w}.webp`;
        try {
          await sharp(abs).rotate().resize({ width: w }).webp({ quality: 80 }).toFile(path.join(OUT, out));
          set.push(`${T.u(urlPath(out))} ${w}w`);
        } catch (e) { warn(`${rel}: 이미지 변환 실패 (${e.message})`); break; }
      }
      if (set.length) info.srcset = [...set, `${info.url} ${info.width}w`].join(", ");
    }
  }
  assetCache.set(abs, info);
  return info;
}

/* ---------- 유튜브 / 비메오 주소 해석 ---------- */
function videoId(url) {
  const s = String(url).trim();
  let m = s.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  if (m) return { kind: "youtube", id: m[1], vertical: /\/shorts\//.test(s) };
  m = s.match(/^youtube:([\w-]{11})$/);
  if (m) return { kind: "youtube", id: m[1], vertical: false };
  m = s.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m) return { kind: "vimeo", id: m[1], vertical: false };
  return null;
}

/* 본문/표지에서 쓰는 미디어 하나를 HTML로 바꿀 준비 */
async function resolveMedia(proj, ref, opts = {}) {
  const v = videoId(ref);
  if (v) return { type: v.kind, id: v.id, vertical: v.vertical || opts.vertical, url: ref };
  if (/^https?:\/\//.test(ref)) {
    if (IMAGE_EXT.test(ref.split("?")[0])) return { type: "image", url: ref, external: true };
    if (VIDEO_EXT.test(ref.split("?")[0])) return { type: "video", url: ref, external: true };
    return { type: "doc", url: ref, external: true };
  }
  const a = await asset(proj.dir, proj.slug, ref);
  if (!a) { warn(`[${proj.slug}] 파일을 찾을 수 없어요: ${ref}`); return { type: "missing", name: ref }; }
  proj.used.add(a.abs);
  if (IMAGE_EXT.test(a.abs)) return { type: "image", ...a };
  if (VIDEO_EXT.test(a.abs)) return { type: "video", ...a };
  return { type: "doc", ...a, ext: path.extname(a.abs).slice(1).toUpperCase() };
}

/* ---------- works/ 폴더 읽기 ---------- */
const visible = n => !n.startsWith(".") && !n.startsWith("_");
const dirs = d => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).filter(e => e.isDirectory() && visible(e.name)).map(e => e.name).sort((a, b) => nfc(a).localeCompare(nfc(b), "ko")) : [];
const readMd = f => parseFrontMatter(fs.readFileSync(f, "utf8"));
const slugify = s => nfc(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");

function loadProject(dir, category, parent) {
  const file = findFile(dir, "index.md");
  if (!file) return null;
  const { data, body } = readMd(file);
  if (data.draft === true) return null;
  const folder = nfc(path.basename(dir));
  const p = {
    dir, folder, category, parent, body, data,
    title: data.title || folder,
    titleEn: data.title_en || "",
    slug: slugify(data.slug || (parent ? `${parent.slug}-${folder}` : folder)),
    year: String(data.year ?? ""),
    period: data.period || "", role: data.role || "", team: data.team || "", tools: data.tools || "",
    summary: data.summary || "",
    status: data.status || "",
    featured: data.featured === true,
    order: Number.isFinite(+data.order) && data.order !== "" ? +data.order : 999,
    card: data.card || "",
    info: parseList(data.info),
    links: parseList(data.links),
    used: new Set(),
  };
  p.children = parent ? [] : dirs(dir).map(n => loadProject(path.join(dir, n), category, p)).filter(Boolean);
  sortWorks(p.children);
  return p;
}

function sortWorks(list) {
  return list.sort((a, b) => a.order - b.order || String(b.year).localeCompare(String(a.year)) || a.title.localeCompare(b.title, "ko"));
}

function loadCategories() {
  return dirs(WORKS).map(name => {
    const m = nfc(name).match(/^(\d+)[_\- ]+(.+)$/);
    const label = (m ? m[2] : name).toUpperCase();
    const meta = findFile(path.join(WORKS, name), "_category.md");
    const { data, body } = meta ? readMd(meta) : { data: {}, body: "" };
    const cat = {
      key: slugify(data.slug || label), label: data.title || label, no: m ? m[1] : "",
      ko: data.title_ko || "", description: body.trim(),
    };
    cat.works = sortWorks(dirs(path.join(WORKS, name)).map(n => loadProject(path.join(WORKS, name, n), cat, null)).filter(Boolean));
    return cat;
  });
}

/* ---------- 표지 이미지 고르기 ---------- */
async function pickCover(p) {
  if (p.data.cover) return resolveMedia(p, p.data.cover);
  const auto = fs.readdirSync(p.dir).find(n => /^cover\.(jpe?g|png|gif|webp|avif)$/i.test(n));
  if (auto) return resolveMedia(p, auto);
  const m = p.body.match(/^!\[[^\]]*\]\(\s*([^)\s]+)/m);
  if (m) {
    const r = await resolveMedia(p, m[1]);
    if (r.type === "image" || r.type === "youtube") return r;
  }
  return null;
}

/* 본문에 쓰지 않은 이미지·영상을 파일 이름 순으로 모아 갤러리로 붙입니다 */
async function autoGallery(p) {
  if (p.data.auto_gallery === false) return [];
  const files = fs.readdirSync(p.dir).filter(n => (IMAGE_EXT.test(n) || VIDEO_EXT.test(n)) && !/^cover\./i.test(n)).sort((a, b) => nfc(a).localeCompare(nfc(b), "ko", { numeric: true }));
  const out = [];
  for (const f of files) {
    const abs = path.join(p.dir, f);
    if (p.used.has(abs)) continue;
    out.push(await resolveMedia(p, f));
  }
  return out;
}

/* ---------- 빌드 ---------- */
async function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  await fsp.cp(src, dest, { recursive: true });
}

async function main() {
  const t0 = Date.now();
  await fsp.rm(OUT, { recursive: true, force: true });
  await fsp.mkdir(OUT, { recursive: true });
  await copyDir(path.join(ROOT, "src"), OUT);
  await copyDir(path.join(CONTENT, "files"), path.join(OUT, "files"));

  const site = readMd(path.join(CONTENT, "site.md")).data;
  site.links = parseList(site.links);
  T.setSite(site);

  const categories = loadCategories();
  const all = categories.flatMap(c => c.works);
  const everything = all.flatMap(p => [p, ...p.children]);

  const seen = new Map();
  for (const p of everything) {
    if (categories.some(c => c.key === p.slug)) throw new Error(`slug "${p.slug}"가 카테고리 이름과 겹칩니다. index.md의 slug를 바꿔 주세요.`);
    if (seen.has(p.slug)) throw new Error(`slug "${p.slug}"가 두 번 쓰였습니다: ${seen.get(p.slug)} / ${p.dir}`);
    seen.set(p.slug, p.dir);
  }

  // 1) 표지 먼저 (목록 화면에 필요)
  for (const p of everything) p.cover = await pickCover(p);

  // 2) 상세 페이지
  const ctx = { resolve: (p, ref, o) => resolveMedia(p, ref, o) };
  for (const cat of categories) {
    const flat = cat.works;
    for (const [i, p] of flat.entries()) {
      await writeProject(p, cat, ctx, flat[i - 1], flat[i + 1]);
      for (const [j, c] of p.children.entries()) await writeProject(c, cat, ctx, p.children[j - 1], p.children[j + 1]);
    }
  }

  // 3) 목록 페이지
  await write("index.html", T.home({ categories, featured: sortWorks(everything.filter(p => p.featured)), all }));
  await write("works/index.html", T.worksPage({ categories, current: null, list: all }));
  for (const cat of categories) await write(`works/${cat.key}/index.html`, T.worksPage({ categories, current: cat, list: cat.works }));

  // 4) ABOUT / CONTACT / 404
  const about = readMd(path.join(CONTENT, "about.md"));
  const aboutProj = { dir: CONTENT, slug: "about", used: new Set() };
  const aboutBody = await renderMarkdown(about.body, { resolve: (r, o) => resolveMedia(aboutProj, r, o), figure: T.figure });
  let portrait = null;
  if (about.data.portrait) portrait = await resolveMedia(aboutProj, about.data.portrait);
  await write("about/index.html", T.aboutPage({ data: about.data, html: aboutBody, portrait }));
  await write("contact/index.html", T.contactPage());
  await write("404.html", T.notFound());

  // 5) 검색엔진용 파일
  const urls = ["", "about/", "contact/", "works/", ...categories.map(c => `works/${c.key}/`), ...everything.map(p => `works/${p.slug}/`)];
  const base = String(site.url || "").replace(/\/$/, "");
  await write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${base}${T.u(u)}</loc></url>`).join("\n")}\n</urlset>\n`);
  await write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
  await write(".nojekyll", "");

  const todo = everything.filter(p => isTodo(p.summary) || /\[작성 필요/.test(p.body)).length;
  console.log(`✓ ${everything.length}개 작업, ${categories.length}개 카테고리 → _site/ (${Date.now() - t0}ms)${sharp ? "" : "  · sharp 없음: 이미지 원본 그대로 사용"}`);
  if (todo) console.log(`  · [작성 필요]가 남은 작업: ${todo}개`);
  for (const w of warnings) console.log(`  ! ${w}`);
}

async function writeProject(p, cat, ctx, prev, next) {
  const html = await renderMarkdown(p.body, { resolve: (r, o) => ctx.resolve(p, r, o), figure: T.figure });
  const gallery = await autoGallery(p);
  for (const l of p.links) {
    if (l.value && !/^(https?:|mailto:|tel:|\/|#)/.test(l.value)) {
      const a = await asset(p.dir, p.slug, l.value);
      if (a) { l.value = a.url; l.file = true; } else { warn(`[${p.slug}] 링크 파일을 찾을 수 없어요: ${l.value}`); l.value = ""; }
    }
  }
  await write(`works/${p.slug}/index.html`, T.projectPage({ p, cat, html, gallery, prev, next }));
}

async function write(rel, content) {
  const f = path.join(OUT, rel);
  await fsp.mkdir(path.dirname(f), { recursive: true });
  await fsp.writeFile(f, content);
}

main().catch(e => { console.error("✗ 빌드 실패:", e.message); process.exit(1); });

