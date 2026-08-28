/**
 * The four Fases redrawn in the EPF Composer / SPEM Designer notation:
 * Roles on the left, the chain of Tareas down the middle, Productos de Trabajo on
 * the right, edges carrying the SPEM 2.0 stereotypes. `npm run epf`
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import fuentes from "../src/fuentes.css?inline";
import { wrap } from "../src/layout";
import { seed } from "../src/seed";
import type { Fase, Producto, Tarea } from "../src/modelo";
import type { IdIcono } from "../src/iconos";

// The SPEM Designer / EPF Composer palette: cream fills, tan strokes, brown labels.
const CREMA = "#fbe3b8", TAN = "#c8964b", MARRON = "#8a5a20", TINTA = "#3a3a44",
  GRIS = "#6f6f8c", PAPEL = "#ffffff", AZUL = "#4a72c4", REGLA = "#d9d9e0";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const T = (t: string, x: number, y: number, o: { fs?: number; f?: string; w?: number; fill?: string; a?: string; ls?: string } = {}) =>
  `<text x="${x}" y="${y}" fill="${o.fill ?? TINTA}" font-size="${o.fs ?? 11}" font-weight="${o.w ?? 400}" font-family="${o.f ?? "Geist, sans-serif"}" text-anchor="${o.a ?? "start"}"${o.ls ? ` letter-spacing="${o.ls}"` : ""}>${esc(t)}</text>`;

// ------------------------------------------------------------------ glifos EPF
/** Role: head over shoulders, the SPEM Designer "role use" glyph. */
const gRol = (x: number, y: number) =>
  `<ellipse cx="${x + 14}" cy="${y + 8}" rx="8" ry="6" fill="${CREMA}" stroke="${TAN}"/>
<path d="M${x + 4} ${y + 26} a10 8 0 0 1 20 0 z" fill="${CREMA}" stroke="${TAN}"/>`;

/** Work product: folded-corner document with ruled blue lines. */
const gDoc = (x: number, y: number, azul = true) =>
  `<path d="M${x + 3} ${y} h13 l7 7 v19 h-20 z" fill="${CREMA}" stroke="${TAN}"/>
<path d="M${x + 16} ${y} v7 h7" fill="none" stroke="${TAN}"/>` +
  (azul ? [11, 14, 17, 20, 23].map((d) => `<line x1="${x + 6}" y1="${y + d}" x2="${x + 20}" y2="${y + d}" stroke="${AZUL}" stroke-width="1.4"/>`).join("") : "");

/** Guidance: the stepped blue glyph EPF uses for guidelines and checklists. */
const gGuia = (x: number, y: number) =>
  `<path d="M${x + 4} ${y + 26} v-8 h6 v-6 h6 v-8 h7 v22 z" fill="#9dc6ef" stroke="${AZUL}"/>`;

/** Tool: the wrench EPF puts on tool mentors. */
const gTool = (x: number, y: number) =>
  `<path d="M${x + 20} ${y + 4} a6 6 0 0 0 -7.4 9.2 l-7.2 7.2 a2.4 2.4 0 0 0 3.4 3.4 l7.2 -7.2 a6 6 0 0 0 9.2 -7.4 l-4 4 -3.4-0.9 -0.9-3.4 z" transform="scale(0.82) translate(${x * 0.22}, ${y * 0.22})" fill="${CREMA}" stroke="${TAN}"/>`;

const gProducto = (p: Producto, x: number, y: number) =>
  p.icono === "metric" ? gGuia(x, y) : p.icono === "tool" ? gTool(x, y) : gDoc(x, y);

const FORMA: Record<string, "chevron" | "diamante" | "redondo"> = {
  task: "chevron", activity: "redondo", process: "redondo", milestone: "diamante",
};

/** Rounded right-angle elbow: horizontal, then vertical, then horizontal. */
const elbow = (x1: number, y1: number, x2: number, y2: number, r = 8, xm = (x1 + x2) / 2) => {
  if (Math.abs(y1 - y2) < 1) return `M${x1} ${y1} H${x2}`;
  const s = Math.sign(x2 - x1), v = Math.sign(y2 - y1);
  return `M${x1} ${y1} H${xm - r * s} Q${xm} ${y1} ${xm} ${y1 + r * v} V${y2 - r * v} Q${xm} ${y2} ${xm + r * s} ${y2} H${x2}`;
};
/** Horizontal run, one quarter-arc, then vertical run (and the mirror image). */
const codoHV = (x1: number, y1: number, x2: number, y2: number, r = 8) => {
  const s = Math.sign(x2 - x1), v = Math.sign(y2 - y1);
  return `M${x1} ${y1} H${x2 - r * s} Q${x2} ${y1} ${x2} ${y1 + r * v} V${y2}`;
};
const codoVH = (x1: number, y1: number, x2: number, y2: number, r = 8) => {
  const s = Math.sign(x2 - x1), v = Math.sign(y2 - y1);
  return `M${x1} ${y1} V${y2 - r * v} Q${x1} ${y2} ${x1 + r * s} ${y2} H${x2}`;
};
const arista = (d: string, etiqueta: string, ex: number, ey: number) =>
  `<path d="${d}" fill="none" stroke="${GRIS}" stroke-width="1" marker-end="url(#punta)"/>
<rect x="${ex - etiqueta.length * 2.7 - 4}" y="${ey - 9}" width="${etiqueta.length * 5.4 + 8}" height="12" fill="${PAPEL}"/>
${T(etiqueta, ex, ey, { fs: 8, fill: GRIS, f: "'Geist Mono', monospace", a: "middle" })}`;

// ------------------------------------------------------------------ medidas
const W = 1320, XR = 48, WR = 250, XT = 460, WT = 380, XP = 940, WP = 340;
const alturaTexto = (t: string, fs: number, w: number) => wrap(t, fs, w).length;
const altoRoles = (t: Tarea) => t.roles.reduce((h, r) => h + Math.max(32, alturaTexto(r.rol, 10, WR - 40) * 13 + 14) + 12, 0) - 12;
const altoProds = (ps: Producto[]) => (ps.length ? ps.reduce((h, p) => h + Math.max(32, alturaTexto(p.texto, 10, WP - 44) * 13 + 12) + 12, 0) - 12 : 0);
const altoTarea = (t: Tarea) => Math.max(76, alturaTexto(t.nombre, 12, WT - 96) * 15 + 44);

// ------------------------------------------------------------------ figura
function figura(f: Fase) {
  const cuerpo: string[] = [];
  let y = 132;

  f.tareas.forEach((t, i) => {
    const hR = altoRoles(t), hT = altoTarea(t);
    const hIn = altoProds(t.entrada), hOut = altoProds(t.salida);
    // Entrada arriba, Tarea al centro, Salida abajo: ninguna flecha cruza la Tarea.
    const hBanda = hIn + (hIn ? 40 : 0) + hT + (hOut ? 40 : 0) + hOut;
    const H = Math.max(hR, hBanda);
    const top = y, cy = top + H / 2;
    const ty = cy - hBanda / 2 + hIn + (hIn ? 40 : 0);

    // --- Roles, left column, each with its own attach point on the Tarea's left edge.
    let ry = ty + hT / 2 - hR / 2;
    t.roles.forEach((r, k) => {
      const lineas = wrap(r.rol, 10, WR - 44);
      const hFila = Math.max(32, lineas.length * 13 + 14);
      cuerpo.push(gRol(XR, ry + hFila / 2 - 14));
      lineas.forEach((l, j) => cuerpo.push(T(l, XR + 34, ry + hFila / 2 - (lineas.length - 1) * 6.5 + j * 13 + 4, { fs: 10, fill: MARRON })));
      const ay = ty + (hT * (k + 1)) / (t.roles.length + 1);
      cuerpo.push(arista(elbow(XR + WR - 8, ry + hFila / 2, XT - 6, ay, 8, XT - 32 - k * 20),
        r.papel === "perform" ? "<<performs, primary>>" : "<<assists>>",
        XR + WR + 62, ry + hFila / 2 - 8));
      ry += hFila + 12;
    });

    // --- La Tarea. Forma segun su tipo SPEM.
    const forma = FORMA[t.icono] ?? "chevron";
    const p = 28;
    cuerpo.push(
      forma === "chevron"
        ? `<path d="M${XT} ${ty} H${XT + WT - p} L${XT + WT} ${ty + hT / 2} L${XT + WT - p} ${ty + hT} H${XT} Z" fill="${CREMA}" stroke="${TAN}" stroke-width="1.2"/>`
        : forma === "diamante"
          ? `<path d="M${XT} ${ty + hT / 2} L${XT + 40} ${ty} H${XT + WT - 40} L${XT + WT} ${ty + hT / 2} L${XT + WT - 40} ${ty + hT} H${XT + 40} Z" fill="${CREMA}" stroke="${TAN}" stroke-width="1.2"/>`
          : `<rect x="${XT}" y="${ty}" width="${WT}" height="${hT}" rx="10" fill="${CREMA}" stroke="${TAN}" stroke-width="1.2"/>`,
    );
    const et = { task: "Tarea", activity: "Actividad", process: "Proceso", milestone: "Hito" }[t.icono as string] ?? "Tarea";
    cuerpo.push(T(`<<${et}>>`, XT + WT / 2 - 20, ty + 20, { fs: 8, fill: GRIS, f: "'Geist Mono', monospace", a: "middle" }));
    wrap(t.nombre, 12, WT - 96).forEach((l, j) =>
      cuerpo.push(T(l, XT + WT / 2 - 20, ty + 40 + j * 15, { fs: 12, w: 600, fill: MARRON, a: "middle" })));

    // --- Productos de Trabajo, right column: Entrada arriba, Salida abajo.
    let py = cy - hBanda / 2;
    const dibujaProds = (ps: Producto[], entrada: boolean) => {
      ps.forEach((prod, k) => {
        const lineas = wrap(prod.texto, 10, WP - 44);
        const hFila = Math.max(32, lineas.length * 13 + 12);
        cuerpo.push(gProducto(prod, XP, py + hFila / 2 - 14));
        lineas.forEach((l, j) => cuerpo.push(T(l, XP + 34, py + hFila / 2 - (lineas.length - 1) * 6.5 + j * 13 + 4, { fs: 10, fill: MARRON })));
        const n = ps.length;
        // Entradas entran por el borde superior, Salidas por el inferior: cada una
        // con su propia x, para que ninguna flecha tape a otra.
        const ax = XT + 140 + ((WT - 200) * (k + 1)) / (n + 1);
        const ey = py + hFila / 2, lx = XP - 96;
        cuerpo.push(entrada
          ? arista(codoHV(XP - 8, ey, ax, ty), "<<input, mandatory>>", lx, ey - 8)
          : arista(codoVH(ax, ty + hT, XP - 8, ey), "<<output, mandatory>>", lx, ey - 8));
        py += hFila + 12;
      });
    };
    dibujaProds(t.entrada, true);
    py = ty + hT + 40;
    dibujaProds(t.salida, false);

    // --- Chain to the next Tarea: same x, so a straight segment is right.
    if (i < f.tareas.length - 1)
      cuerpo.push(`<line x1="${XT + 48}" y1="${ty + hT + 4}" x2="${XT + 48}" y2="${top + H + 44}" stroke="${GRIS}" stroke-width="1" marker-end="url(#punta)"/>`);
    y = top + H + 56;
  });

  const leyY = y + 8;
  const tipos: [string, string][] = [["rol", "Rol"], ["doc", "Producto de Trabajo"], ["guia", "Guía / Métrica"], ["tool", "Herramienta"]];
  const leyenda = [`<line x1="${XR}" y1="${leyY}" x2="${W - XR}" y2="${leyY}" stroke="${REGLA}"/>`,
    T("LEYENDA SPEM 2.0", XR, leyY + 22, { fs: 8, fill: GRIS, f: "'Geist Mono', monospace", ls: "0.14em" })];
  tipos.forEach(([id, nombre], i) => {
    const x = 240 + i * 250, gy = leyY + 6;
    leyenda.push(id === "rol" ? gRol(x, gy) : id === "doc" ? gDoc(x, gy) : id === "guia" ? gGuia(x, gy) : gTool(x, gy));
    leyenda.push(T(nombre, x + 34, leyY + 23, { fs: 9, fill: GRIS }));
  });

  const h = leyY + 56;
  const [n0, n1] = [f.nombre.split(":")[0], f.nombre.split(": ")[1]];
  return `<svg viewBox="0 0 ${W} ${h}" width="${W}" height="${h}" role="img" aria-labelledby="${f.id}-t ${f.id}-d" xmlns="http://www.w3.org/2000/svg">
<title id="${f.id}-t">${esc(f.nombre)}</title>
<desc id="${f.id}-d">${esc(`${f.objetivo} Notación EPF/SPEM 2.0: Roles a la izquierda, la cadena de Tareas al centro, los Productos de Trabajo a la derecha.`)}</desc>
<defs><marker id="punta" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="${GRIS}"/></marker></defs>
<rect width="100%" height="100%" fill="${PAPEL}"/>
${T(n0.toUpperCase(), XR, 44, { fs: 9, fill: GRIS, f: "'Geist Mono', monospace", ls: "0.16em" })}
${T(n1, XR, 78, { fs: 26, f: "'Instrument Serif', Georgia, serif", fill: TINTA })}
${T(f.objetivo, XR, 102, { fs: 11, fill: GRIS })}
${T("ROLES", XR, 124, { fs: 8, fill: GRIS, f: "'Geist Mono', monospace", ls: "0.14em" })}
${T("TAREAS", XT, 124, { fs: 8, fill: GRIS, f: "'Geist Mono', monospace", ls: "0.14em" })}
${T("PRODUCTOS DE TRABAJO", XP, 124, { fs: 8, fill: GRIS, f: "'Geist Mono', monospace", ls: "0.14em" })}
${cuerpo.join("\n")}
${leyenda.join("\n")}
</svg>`;
}

mkdirSync("figuras", { recursive: true });
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
for (const f of seed().fases) {
  const svg = figura(f);
  const [, w, h] = svg.match(/viewBox="0 0 (\d+) ([\d.]+)"/)!;
  const base = `figuras/epf-${f.id}`;
  writeFileSync(`${base}.tmp.html`, `<!doctype html><meta charset="utf-8"><style>${fuentes}body{margin:0;background:#fff}</style>${svg}`);
  execFileSync(CHROME, ["--headless", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2",
    `--window-size=${w},${Math.ceil(+h)}`, `--screenshot=${base}.png`, `file://${process.cwd()}/${base}.tmp.html`]);
  rmSync(`${base}.tmp.html`);
  console.log(`${base}.png  ${w}x${Math.ceil(+h)}`);
}
