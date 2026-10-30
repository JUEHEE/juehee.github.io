/* 아주 작은 마크다운 해석기 — 이 사이트에 필요한 문법만 지원합니다. (README의 "본문 쓰는 법" 참고) */

export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const isTodo = s => !s || /\[작성 필요/.test(String(s));

/* ---------- 머리말 (--- 사이의 설정) ---------- */
export function parseFrontMatter(src) {
  src = String(src).replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const m = src.match(/^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/);
  if (!m) return { data: {}, body: src };
  const data = {};
  let listKey = null;
  for (const line of m[1].split("\n")) {
    if (!line.trim() || /^\s*#/.test(line)) continue;
    const item = line.match(/^\s*-\s+(.*)$/);
    if (item && listKey) { data[listKey].push(value(item[1])); continue; }
    const kv = line.match(/^([\w\-]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    const [, key, raw] = kv;
    if (raw.trim() === "") { data[key] = []; listKey = key; }
    else { data[key] = value(raw); listKey = null; }
  }
  for (const k in data) if (Array.isArray(data[k]) && !data[k].length) data[k] = "";
  return { data, body: src.slice(m[0].length) };
}

function value(raw) {
  const v = raw.trim();
  if (v === "true") return true;
  if (v === "false") return false;
  const q = v.match(/^(["'])(.*)\1$/);
  return q ? q[2] : v;
}

/* "라벨 | 값" 목록 → [{label, value}] */
export function parseList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(s => {
    const i = String(s).indexOf("|");
    return i < 0 ? { label: String(s).trim(), value: "" } : { label: String(s).slice(0, i).trim(), value: String(s).slice(i + 1).trim() };
  }).filter(x => x.label);
}

/* ---------- 문장 안 꾸밈 ---------- */
export function inline(s) {
  let t = esc(s);
  const codes = [];
  t = t.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
    const ext = /^https?:/.test(url);
    return `<a href="${url}"${ext ? ' target="_blank" rel="noopener"' : ""}>${label}${ext ? '<span class="sr-only"> (새 탭)</span>' : ""}</a>`;
  });
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
  t = t.replace(/\[(작성 필요[^\]]*)\]/g, '<span class="todo">[$1]</span>');
  t = t.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`);
  return t;
}

/* ---------- 미디어 줄 옵션 ---------- */
const SIZES = ["full", "wide", "medium", "small"];
export function parseOptions(str = "") {
  const o = { size: "", align: "", flags: new Set(), ratio: "" };
  for (const w of String(str).toLowerCase().split(/[\s,]+/).filter(Boolean)) {
    if (SIZES.includes(w)) o.size = w;
    else if (["left", "right", "center"].includes(w)) o.align = w;
    else if (w.startsWith("ratio=")) o.ratio = w.slice(6).replace(":", "/");
    else o.flags.add(w);
  }
  o.vertical = o.flags.has("vertical");
  return o;
}

const MEDIA_LINE = /^!\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+"([^"]*)")?\s*\)\s*$/;

/* ---------- 본문 전체 ---------- */
export async function renderMarkdown(src, { resolve, figure }) {
  const lines = String(src).replace(/\r\n?/g, "\n").split("\n");
  const out = [];
  let section = null; // { heading, level, parts: [] }
  let para = [];

  const flushPara = () => {
    if (!para.length) return;
    const text = para.join("\n");
    para = [];
    ensureSection().parts.push(`<p>${inline(text).replace(/\n/g, "<br>")}</p>`);
  };
  const ensureSection = () => section ??= { heading: "", parts: [] };
  const closeSection = () => {
    flushPara();
    if (!section) return;
    if (section.heading || section.parts.length) {
      out.push(`<section class="txt${section.heading ? "" : " txt--cont"}">${section.heading ? `<h2 class="txt-h">${inline(section.heading)}</h2>` : ""}<div class="prose">${section.parts.join("")}</div></section>`);
    }
    section = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();
    if (!t) { flushPara(); continue; }

    // 미디어: 빈 줄 없이 이어진 미디어 줄은 한 줄(row)로 묶습니다
    if (MEDIA_LINE.test(t)) {
      closeSection();
      const group = [];
      while (i < lines.length && MEDIA_LINE.test(lines[i].trim())) {
        const [, caption, ref, opt] = lines[i].trim().match(MEDIA_LINE);
        const o = parseOptions(opt);
        group.push({ caption, o, m: await resolve(ref, o) });
        i++;
      }
      i--;
      out.push(figure(group));
      continue;
    }
    if (/^#{1,2}\s+/.test(t)) { closeSection(); section = { heading: t.replace(/^#+\s+/, ""), parts: [] }; continue; }
    if (/^#{3,6}\s+/.test(t)) { flushPara(); ensureSection().parts.push(`<h3>${inline(t.replace(/^#+\s+/, ""))}</h3>`); continue; }
    if (/^(-{3,}|\*{3,})$/.test(t)) { closeSection(); out.push('<hr class="rule">'); continue; }
    if (t.startsWith(">")) {
      closeSection();
      const q = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) { q.push(lines[i].trim().replace(/^>\s?/, "")); i++; }
      i--;
      out.push(`<blockquote class="pull"><p>${inline(q.join("\n")).replace(/\n/g, "<br>")}</p></blockquote>`);
      continue;
    }
    const li = t.match(/^([-*]|\d+[.)])\s+(.*)$/);
    if (li) {
      flushPara();
      const ordered = /\d/.test(li[1]);
      const items = [];
      while (i < lines.length) {
        const m = lines[i].trim().match(/^([-*]|\d+[.)])\s+(.*)$/);
        if (!m) break;
        items.push(`<li>${inline(m[2])}</li>`);
        i++;
      }
      i--;
      ensureSection().parts.push(`<${ordered ? "ol" : "ul"}>${items.join("")}</${ordered ? "ol" : "ul"}>`);
      continue;
    }
    para.push(t);
  }
  closeSection();
  return out.join("\n");
}
