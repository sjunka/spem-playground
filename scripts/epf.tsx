/**
 * Cada Fase en una tarjeta vertical, en la notación de EPF Composer: una fila por
 * Tarea, con los Roles a la izquierda —en negrita quien la ejecuta, que es quien
 * responde por el artefacto—, la Tarea al centro y los Productos de Trabajo que
 * produce a la derecha. `npm run epf`
 *
 * La Entrada no se dibuja aquí: la figura responde «quién hace qué y qué sale de
 * ahí». El traspaso entre Fases lo cuenta la vista Resumen. Ver ADR-0012.
 */
import fuentes from "../src/fuentes.css?inline";
import { codigo } from "../src/consolidado";
import { wrap } from "../src/layout";
import { seed } from "../src/seed";
import type { Fase, Producto, Tarea } from "../src/modelo";
import {
  CREMA, esc, FORMA, gProducto, gRol, GRIS, leyendaEPF, MARRON, MONO,
  NOMBRE_TIPO, PAPEL, PUNTA, REGLA, SERIF, T, TAN, TINTA, elbow,
} from "../src/epf-svg";
import { capturar } from "./capturar";

// ------------------------------------------------------------------ medidas
const W = 900;
const XR = 76, WR = 190; // Roles
const XT = 330, WT = 250; // Tarea
const XP = 640, WP = 190; // Productos de Trabajo
const FS_ROL = 9.5, FS_TAREA = 11, FS_PROD = 9.5, LH = 12;
const GAP_ITEM = 8; // entre Roles, o entre Productos, de una misma fila
const GAP_FILA = 40; // entre Tareas: es donde cabe la flecha de la cadena

const alto = (texto: string, fs: number, w: number) =>
  Math.max(30, wrap(texto, fs, w).length * LH + 12);
const altoLista = (textos: string[], fs: number, w: number) =>
  textos.length
    ? textos.reduce((h, t) => h + alto(t, fs, w) + GAP_ITEM, 0) - GAP_ITEM
    : 0;
const altoRoles = (t: Tarea) => altoLista(t.roles.map((r) => r.rol), FS_ROL, WR - 36);
const altoProds = (ps: Producto[]) => altoLista(ps.map((p) => p.texto), FS_PROD, WP - 36);
const altoTarea = (t: Tarea) =>
  Math.max(64, wrap(t.nombre, FS_TAREA, WT - 70).length * 14 + 36);

/** Glifo a la izquierda, texto envuelto a la derecha, centrado en su fila. */
function fila(
  glifo: (x: number, y: number) => string,
  texto: string,
  x: number,
  y: number,
  w: number,
  fs: number,
  o: { w?: number; fill?: string } = {},
) {
  const lineas = wrap(texto, fs, w - 36);
  const h = Math.max(30, lineas.length * LH + 12);
  const base = y + h / 2 - ((lineas.length - 1) * LH) / 2 + 3.5;
  return [
    glifo(x, y + h / 2 - 14),
    ...lineas.map((l, j) =>
      T(l, x + 32, base + j * LH, { fs, w: o.w, fill: o.fill ?? MARRON }),
    ),
  ].join("\n");
}

// ------------------------------------------------------------------ figura
function figura(f: Fase) {
  const cuerpo: string[] = [];
  const yPanel = 148;
  let y = yPanel + 34;

  f.tareas.forEach((t, i) => {
    const hR = altoRoles(t), hT = altoTarea(t), hP = altoProds(t.salida);
    const H = Math.max(hR, hT, hP);
    const top = y;
    const ty = top + H / 2 - hT / 2, tcy = top + H / 2;

    // --- Roles. La negrita distingue a quien ejecuta de quien asiste, y una sola
    // flecha lleva el grupo a la Tarea: con una por Rol la fila se vuelve una reja.
    let ry = top + H / 2 - hR / 2;
    t.roles.forEach((r) => {
      const ejecuta = r.papel === "perform";
      cuerpo.push(
        fila(gRol, r.rol, XR, ry, WR, FS_ROL, {
          w: ejecuta ? 700 : 400,
          fill: ejecuta ? MARRON : GRIS,
        }),
      );
      ry += alto(r.rol, FS_ROL, WR - 36) + GAP_ITEM;
    });
    cuerpo.push(
      `<path d="${elbow(XR + WR - 4, top + H / 2, XT - 7, tcy, 8, XT - 34)}" fill="none" stroke="${GRIS}" stroke-width="1" marker-end="url(#punta)"/>`,
    );

    // --- La Tarea. La forma la da su Tipo SPEM, igual que en EPF Composer.
    const forma = FORMA[t.icono] ?? "chevron";
    const p = 22;
    cuerpo.push(
      forma === "chevron"
        ? `<path d="M${XT} ${ty} H${XT + WT - p} L${XT + WT} ${ty + hT / 2} L${XT + WT - p} ${ty + hT} H${XT} Z" fill="${CREMA}" stroke="${TAN}" stroke-width="1.2"/>`
        : forma === "diamante"
          ? `<path d="M${XT} ${ty + hT / 2} L${XT + 30} ${ty} H${XT + WT - 30} L${XT + WT} ${ty + hT / 2} L${XT + WT - 30} ${ty + hT} H${XT + 30} Z" fill="${CREMA}" stroke="${TAN}" stroke-width="1.2"/>`
          : `<rect x="${XT}" y="${ty}" width="${WT}" height="${hT}" rx="10" fill="${CREMA}" stroke="${TAN}" stroke-width="1.2"/>`,
    );
    cuerpo.push(T(codigo(t.id), XT + 12, ty + 16, { fs: 8, fill: GRIS, f: MONO, ls: "0.1em" }));
    cuerpo.push(
      T(`<<${NOMBRE_TIPO[t.icono as string] ?? "Tarea"}>>`, XT + WT / 2 - 12, ty + 16, {
        fs: 8, fill: GRIS, f: MONO, a: "middle",
      }),
    );
    wrap(t.nombre, FS_TAREA, WT - 70).forEach((l, j) =>
      cuerpo.push(
        T(l, XT + WT / 2 - 12, ty + 34 + j * 14, {
          fs: FS_TAREA, w: 600, fill: MARRON, a: "middle",
        }),
      ),
    );

    // --- Productos de Trabajo: solo la Salida, la que el Rol en negrita responde.
    let py = top + H / 2 - hP / 2;
    t.salida.forEach((prod) => {
      const h = alto(prod.texto, FS_PROD, WP - 36);
      cuerpo.push(fila((x, yy) => gProducto(prod, x, yy), prod.texto, XP, py, WP, FS_PROD));
      cuerpo.push(
        `<path d="${elbow(XT + WT + 2, tcy, XP - 7, py + h / 2, 8, XP - 30)}" fill="none" stroke="${GRIS}" stroke-width="1" marker-end="url(#punta)"/>`,
      );
      py += h + GAP_ITEM;
    });

    // --- La cadena: de una Tarea a la siguiente, por la misma columna.
    if (i < f.tareas.length - 1)
      cuerpo.push(
        `<line x1="${XT + 40}" y1="${ty + hT + 3}" x2="${XT + 40}" y2="${top + H + GAP_FILA - 6}" stroke="${GRIS}" stroke-width="1" marker-end="url(#punta)"/>`,
      );
    y = top + H + GAP_FILA;
  });

  const hPanel = y - 12 - yPanel;
  const panel = `<rect x="40" y="${yPanel}" width="${W - 80}" height="${hPanel}" rx="14" fill="none" stroke="${REGLA}"/>`;
  const leyY = yPanel + hPanel + 40;
  const h = leyY + 78;
  const [n0, n1] = [f.nombre.split(":")[0], f.nombre.split(": ")[1]];

  return `<svg viewBox="0 0 ${W} ${h}" width="${W}" height="${h}" role="img" aria-labelledby="${f.id}-t ${f.id}-d" xmlns="http://www.w3.org/2000/svg">
<title id="${f.id}-t">${esc(f.nombre)}</title>
<desc id="${f.id}-d">${esc(`${f.objetivo} Notación EPF/SPEM 2.0: por Tarea, los Roles a la izquierda —en negrita el que la ejecuta y responde por sus Productos de Trabajo—, la Tarea al centro y su Salida a la derecha.`)}</desc>
${PUNTA}
<rect width="100%" height="100%" fill="${PAPEL}"/>
${T(n0.toUpperCase(), 40, 44, { fs: 9, fill: GRIS, f: MONO, ls: "0.16em" })}
${T(n1, 40, 78, { fs: 24, f: SERIF, fill: TINTA })}
${T(f.objetivo, 40, 100, { fs: 10.5, fill: GRIS })}
${panel}
${T("ROLES", XR, yPanel + 22, { fs: 8, fill: GRIS, f: MONO, ls: "0.14em" })}
${T("TAREAS", XT, yPanel + 22, { fs: 8, fill: GRIS, f: MONO, ls: "0.14em" })}
${T("PRODUCTOS DE TRABAJO", XP, yPanel + 22, { fs: 8, fill: GRIS, f: MONO, ls: "0.14em" })}
${cuerpo.join("\n")}
${leyendaEPF(40, leyY, W - 80, 150)}
${T("En negrita, el Rol que ejecuta la Tarea: es quien responde por los Productos de Trabajo que salen de ella.", 40, leyY + 46, { fs: 9, fill: GRIS })}
</svg>`;
}

for (const f of seed().fases) {
  const svg = figura(f);
  const [, w, h] = svg.match(/viewBox="0 0 (\d+) ([\d.]+)"/)!;
  const html = `<!doctype html><meta charset="utf-8"><style>${fuentes}body{margin:0;background:#fff}</style>${svg}`;
  capturar(html, `figuras/epf-${f.id}`, +w, Math.ceil(+h));
}
