/**
 * The EPF Composer / SPEM Designer drawing kit: palette, glyphs and connectors,
 * as plain SVG strings. Shared by every figure drawn in that notation —
 * `scripts/epf.tsx` (una Fase) y `scripts/general.tsx` (el proceso completo).
 * Ver ADR-0007.
 */
import type { Producto } from "./modelo";

// The SPEM Designer / EPF Composer palette: cream fills, tan strokes, brown labels.
export const CREMA = "#fbe3b8",
  TAN = "#c8964b",
  MARRON = "#8a5a20",
  TINTA = "#3a3a44",
  GRIS = "#6f6f8c",
  PAPEL = "#ffffff",
  AZUL = "#4a72c4",
  REGLA = "#d9d9e0";

export const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export type OpcionesTexto = {
  fs?: number;
  f?: string;
  w?: number;
  fill?: string;
  a?: string;
  ls?: string;
};

export const T = (t: string, x: number, y: number, o: OpcionesTexto = {}) =>
  `<text x="${x}" y="${y}" fill="${o.fill ?? TINTA}" font-size="${o.fs ?? 11}" font-weight="${o.w ?? 400}" font-family="${o.f ?? "Geist, sans-serif"}" text-anchor="${o.a ?? "start"}"${o.ls ? ` letter-spacing="${o.ls}"` : ""}>${esc(t)}</text>`;

export const MONO = "'Geist Mono', monospace";
export const SERIF = "'Instrument Serif', Georgia, serif";

/** Role: head over shoulders, the SPEM Designer "role use" glyph. */
export const gRol = (x: number, y: number) =>
  `<ellipse cx="${x + 14}" cy="${y + 8}" rx="8" ry="6" fill="${CREMA}" stroke="${TAN}"/>
<path d="M${x + 4} ${y + 26} a10 8 0 0 1 20 0 z" fill="${CREMA}" stroke="${TAN}"/>`;

/** Work product: folded-corner document with ruled blue lines. */
export const gDoc = (x: number, y: number, azul = true) =>
  `<path d="M${x + 3} ${y} h13 l7 7 v19 h-20 z" fill="${CREMA}" stroke="${TAN}"/>
<path d="M${x + 16} ${y} v7 h7" fill="none" stroke="${TAN}"/>` +
  (azul
    ? [11, 14, 17, 20, 23]
        .map(
          (d) =>
            `<line x1="${x + 6}" y1="${y + d}" x2="${x + 20}" y2="${y + d}" stroke="${AZUL}" stroke-width="1.4"/>`,
        )
        .join("")
    : "");

/** Guidance: the stepped blue glyph EPF uses for guidelines and checklists. */
export const gGuia = (x: number, y: number) =>
  `<path d="M${x + 4} ${y + 26} v-8 h6 v-6 h6 v-8 h7 v22 z" fill="#9dc6ef" stroke="${AZUL}"/>`;

/** Tool: the wrench EPF puts on tool mentors. */
export const gTool = (x: number, y: number) =>
  `<path d="M${x + 20} ${y + 4} a6 6 0 0 0 -7.4 9.2 l-7.2 7.2 a2.4 2.4 0 0 0 3.4 3.4 l7.2 -7.2 a6 6 0 0 0 9.2 -7.4 l-4 4 -3.4-0.9 -0.9-3.4 z" transform="scale(0.82) translate(${x * 0.22}, ${y * 0.22})" fill="${CREMA}" stroke="${TAN}"/>`;

export const gProducto = (p: Producto, x: number, y: number) =>
  p.icono === "metric" ? gGuia(x, y) : p.icono === "tool" ? gTool(x, y) : gDoc(x, y);

/** El Tipo SPEM decide la forma del nodo, como en EPF Composer. */
export const FORMA: Record<string, "chevron" | "diamante" | "redondo"> = {
  task: "chevron",
  activity: "redondo",
  process: "redondo",
  milestone: "diamante",
};

export const NOMBRE_TIPO: Record<string, string> = {
  task: "Tarea",
  activity: "Actividad",
  process: "Proceso",
  milestone: "Hito",
};

/** Rounded right-angle elbow: horizontal, then vertical, then horizontal. */
export const elbow = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r = 8,
  xm = (x1 + x2) / 2,
) => {
  if (Math.abs(y1 - y2) < 1) return `M${x1} ${y1} H${x2}`;
  const s = Math.sign(x2 - x1),
    v = Math.sign(y2 - y1);
  return `M${x1} ${y1} H${xm - r * s} Q${xm} ${y1} ${xm} ${y1 + r * v} V${y2 - r * v} Q${xm} ${y2} ${xm + r * s} ${y2} H${x2}`;
};

/** Horizontal run, one quarter-arc, then vertical run (and the mirror image). */
export const codoHV = (x1: number, y1: number, x2: number, y2: number, r = 8) => {
  const s = Math.sign(x2 - x1),
    v = Math.sign(y2 - y1);
  return `M${x1} ${y1} H${x2 - r * s} Q${x2} ${y1} ${x2} ${y1 + r * v} V${y2}`;
};

export const codoVH = (x1: number, y1: number, x2: number, y2: number, r = 8) => {
  const s = Math.sign(x2 - x1),
    v = Math.sign(y2 - y1);
  return `M${x1} ${y1} V${y2 - r * v} Q${x1} ${y2} ${x1 + r * s} ${y2} H${x2}`;
};

/** Una arista con su estereotipo, sobre un parche de papel que la deja legible. */
export const arista = (d: string, etiqueta: string, ex: number, ey: number) =>
  `<path d="${d}" fill="none" stroke="${GRIS}" stroke-width="1" marker-end="url(#punta)"/>
<rect x="${ex - etiqueta.length * 2.7 - 4}" y="${ey - 9}" width="${etiqueta.length * 5.4 + 8}" height="12" fill="${PAPEL}"/>
${T(etiqueta, ex, ey, { fs: 8, fill: GRIS, f: MONO, a: "middle" })}`;

export const PUNTA = `<defs><marker id="punta" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="${GRIS}"/></marker></defs>`;

/** Las cuatro entradas de leyenda que comparten todas las figuras EPF. */
export const leyendaEPF = (x: number, y: number, ancho: number, paso = 250) => {
  const tipos: [(x: number, y: number) => string, string][] = [
    [gRol, "Rol"],
    [(a, b) => gDoc(a, b), "Producto de Trabajo"],
    [gGuia, "Guía / Métrica"],
    [gTool, "Herramienta"],
  ];
  return [
    `<line x1="${x}" y1="${y}" x2="${x + ancho}" y2="${y}" stroke="${REGLA}"/>`,
    T("LEYENDA SPEM 2.0", x, y + 22, { fs: 8, fill: GRIS, f: MONO, ls: "0.14em" }),
    ...tipos.flatMap(([glifo, nombre], i) => {
      const gx = x + 192 + i * paso;
      return [glifo(gx, y + 6), T(nombre, gx + 34, y + 23, { fs: 9, fill: GRIS })];
    }),
  ].join("\n");
};
