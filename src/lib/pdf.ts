/**
 * MenuPDFDownload — a tiny, dependency-free PDF writer.
 * Produces a real, valid PDF (Helvetica) from a simple line spec.
 * Used for the Hearth menu, gear lists and trail notes.
 */

export type LineSpec =
  | { t: "title"; text: string }
  | { t: "sub"; text: string }
  | { t: "h"; text: string }
  | { t: "item"; name: string; price: string; note?: string }
  | { t: "note"; text: string }
  | { t: "rule" }
  | { t: "space" };

const PAGE_W = 595.28; // A4 @72dpi
const PAGE_H = 841.89;
const MARGIN = 64;
const LEADING = 16;
const BOTTOM = 72;

const esc = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    // strip anything outside WinAnsi-safe range
    .replace(/[^\x20-\x7E]/g, "-");

function escName(s: string) {
  // WinAnsi octal for characters 128-255; for our brand copy just drop them.
  return esc(s);
}

/** Approximate Helvetica width: ~0.5em average, bold a bit wider. */
function fits(text: string, size: number, bold: boolean, maxWidth: number) {
  const w = text.length * size * (bold ? 0.54 : 0.5);
  return w <= maxWidth;
}
function wrap(text: string, size: number, bold: boolean, maxWidth: number): string[] {
  const words = text.split(" ");
  const out: string[] = [];
  let line = "";
  for (const w of words) {
    const probe = line ? `${line} ${w}` : w;
    if (fits(probe, size, bold, maxWidth)) line = probe;
    else {
      if (line) out.push(line);
      line = w;
    }
  }
  if (line) out.push(line);
  return out;
}

export function buildPdf(title: string, subtitle: string, lines: LineSpec[]): Uint8Array {
  // ---- paginate into content streams
  const pages: string[] = [];
  let content = "";
  let y = PAGE_H - MARGIN - 10;

  const push = (s: string) => {
    content += s + "\n";
  };
  const newPage = () => {
    pages.push(content);
    content = "";
    y = PAGE_H - MARGIN - 10;
  };
  const need = (h: number) => {
    if (y - h < BOTTOM) newPage();
  };

  push("BT /F1 20 Tf 0.196 0.239 0.200 rg " + `1 0 0 1 ${MARGIN} ${y} Tm (${escName(title)}) Tj ET`);
  y -= 22;
  push("BT /F2 9.5 Tf 0.42 0.35 0.26 rg " + `1 0 0 1 ${MARGIN} ${y} Tm (${escName(subtitle)}) Tj ET`);
  y -= 26;

  for (const line of lines) {
    switch (line.t) {
      case "h":
        need(34);
        y -= 10;
        push("BT /F1 12.5 Tf 0.114 0.196 0.160 rg " + `1 0 0 1 ${MARGIN} ${y} Tm (${escName(line.text.toUpperCase())}) Tj ET`);
        y -= 6;
        push(`0.196 0.239 0.200 RG 0.5 w ${MARGIN} ${y} m ${PAGE_W - MARGIN} ${y} l S`);
        y -= 16;
        break;
      case "item": {
        const priceX = PAGE_W - MARGIN - 40;
        const nameSize = 10.5;
        const nameLines = wrap(line.name, nameSize, false, priceX - MARGIN - 24);
        const noteLines = line.note ? wrap(line.note, 8.5, false, PAGE_W - MARGIN - (MARGIN + 130)) : [];
        need(nameLines.length * 14 + noteLines.length * 11 + 10);
        nameLines.forEach((nl, i) => {
          const y2 = y - i * 13;
          if (i === 0) {
            push(
              `BT /F2 ${nameSize} Tf 0.196 0.239 0.200 rg 1 0 0 1 ${MARGIN} ${y2} Tm (${escName(nl)}) Tj ET`,
            );
            push(
              `BT /F1 ${nameSize} Tf 0.114 0.196 0.160 rg 1 0 0 1 ${priceX} ${y2} Tm (${escName(line.price)}) Tj ET`,
            );
          }
        });
        y -= (nameLines.length - 1) * 13;
        noteLines.forEach((nl) => {
          y -= 11;
          push(`BT /F2 8.5 Tf 0.47 0.42 0.34 rg 1 0 0 1 ${MARGIN + 130} ${y} Tm (${escName(nl)}) Tj ET`);
        });
        y -= 18;
        break;
      }
      case "note":
        wrap(line.text, 9.5, false, PAGE_W - MARGIN * 2).forEach((nl) => {
          need(14);
          y -= 13;
          push(`BT /F2 9.5 Tf 0.42 0.35 0.26 rg 1 0 0 1 ${MARGIN} ${y} Tm (${escName(nl)}) Tj ET`);
        });
        y -= 10;
        break;
      case "rule":
        need(12);
        y -= 8;
        push(`0.78 0.72 0.62 RG 0.5 w ${MARGIN} ${y} m ${PAGE_W - MARGIN} ${y} l S`);
        y -= 14;
        break;
      case "space":
        y -= 14;
        break;
    }
  }
  pages.push(content);

  // ---- assemble PDF
  const objs: string[] = [];
  const pageCount = pages.length;
  // object ids: 1 catalog, 2 pages, 3 F1(Helvetica-Bold), 4 F2(Helvetica),
  // then per page: pageObjId = 5 + i*2, contentObjId = 6 + i*2
  const kids = Array.from({ length: pageCount }, (_, i) => `${5 + i * 2} 0 R`).join(" ");
  objs[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objs[2] = `<< /Type /Pages /Count ${pageCount} /Kids [${kids}] >>`;
  objs[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";
  objs[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  pages.forEach((c, i) => {
    const pid = 5 + i * 2;
    const cid = pid + 1;
    objs[pid] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
      `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${cid} 0 R >>`;
    objs[cid] = `<< /Length ${Buffer.byteLength(c, "utf8")} >>\nstream\n${c}\nendstream`;
  });

  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  const count = objs.length; // highest id
  for (let id = 1; id < count; id++) {
    if (!objs[id]) continue;
    offsets[id] = Buffer.byteLength(out, "utf8");
    out += `${id} 0 obj\n${objs[id]}\nendobj\n`;
  }
  const xrefPos = Buffer.byteLength(out, "utf8");
  out += `xref\n0 ${count}\n0000000000 65535 f \n`;
  for (let id = 1; id < count; id++) {
    out += offsets[id]
      ? `${String(offsets[id]).padStart(10, "0")} 00000 n \n`
      : "0000000000 65535 f \n";
  }
  out += `trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  return new Uint8Array(Buffer.from(out, "utf8"));
}

export function downloadPdf(filename: string, bytes: Uint8Array) {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
