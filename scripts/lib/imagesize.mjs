/* 이미지 파일 앞부분만 읽어서 가로·세로 크기를 알아냅니다.
   (화면이 로딩 중에 덜컹거리지 않도록 미리 비율을 잡아 두는 데 씁니다)
   휴대폰 사진의 회전 정보(EXIF)도 반영합니다. */
export function imageSize(buf) {
  try {
    if (buf.length < 24) return null;
    // PNG
    if (buf.readUInt32BE(0) === 0x89504e47) return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    // GIF
    if (buf.toString("ascii", 0, 3) === "GIF") return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
    // WebP
    if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
      const chunk = buf.toString("ascii", 12, 16);
      if (chunk === "VP8X") return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
      if (chunk === "VP8 ") return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
      if (chunk === "VP8L") {
        const b = buf.readUInt32LE(21);
        return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
      }
    }
    // SVG
    if (/^\s*(<\?xml|<svg)/.test(buf.toString("utf8", 0, 100))) {
      const s = buf.toString("utf8", 0, 2000);
      const vb = s.match(/viewBox=["']\s*[\d.\-]+[\s,]+[\d.\-]+[\s,]+([\d.]+)[\s,]+([\d.]+)/);
      if (vb) return { width: Math.round(+vb[1]), height: Math.round(+vb[2]) };
      return null;
    }
    // JPEG
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2, orientation = 1, size = null;
      while (i < buf.length - 9) {
        if (buf[i] !== 0xff) { i++; continue; }
        const marker = buf[i + 1];
        if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01 || marker === 0xff) { i += marker === 0xff ? 1 : 2; continue; }
        const len = buf.readUInt16BE(i + 2);
        if (marker === 0xe1 && buf.toString("ascii", i + 4, i + 8) === "Exif") orientation = exifOrientation(buf, i + 10) || 1;
        if ((marker >= 0xc0 && marker <= 0xcf) && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          size = { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
          break;
        }
        i += 2 + len;
      }
      if (size && orientation >= 5) return { width: size.height, height: size.width };
      return size;
    }
  } catch { /* 모르는 형식 */ }
  return null;
}

function exifOrientation(buf, tiff) {
  const le = buf.toString("ascii", tiff, tiff + 2) === "II";
  const u16 = o => le ? buf.readUInt16LE(o) : buf.readUInt16BE(o);
  const u32 = o => le ? buf.readUInt32LE(o) : buf.readUInt32BE(o);
  const ifd = tiff + u32(tiff + 4);
  const n = u16(ifd);
  for (let k = 0; k < n; k++) {
    const e = ifd + 2 + k * 12;
    if (u16(e) === 0x0112) return u16(e + 8);
  }
  return 0;
}
