/**
 * The four Fases redrawn in the EPF Composer / SPEM Designer notation:
 * Roles on the left, the chain of Tareas down the middle, Productos de Trabajo on
 * the right, edges carrying the SPEM 2.0 stereotypes. `npm run epf`
 */
import fuentes from "../src/fuentes.css?inline";
import { wrap } from "../src/layout";
import { seed } from "../src/seed";
import type { Fase, Producto, Tarea } from "../src/modelo";
import {
  arista, codoHV, codoVH, elbow, esc, FORMA, gProducto, gRol, GRIS, CREMA,
  leyendaEPF, MARRON, MONO, NOMBRE_TIPO, PAPEL, PUNTA, SERIF, T, TAN, TINTA,
} from "../src/epf-svg";
import { capturar } from "./capturar";

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
    const et = NOMBRE_TIPO[t.icono as string] ?? "Tarea";
    cuerpo.push(T(`<<${et}>>`, XT + WT / 2 - 20, ty + 20, { fs: 8, fill: GRIS, f: MONO, a: "middle" }));
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
  const leyenda = [leyendaEPF(XR, leyY, W - XR * 2)];

  const h = leyY + 56;
  const [n0, n1] = [f.nombre.split(":")[0], f.nombre.split(": ")[1]];
  return `<svg viewBox="0 0 ${W} ${h}" width="${W}" height="${h}" role="img" aria-labelledby="${f.id}-t ${f.id}-d" xmlns="http://www.w3.org/2000/svg">
<title id="${f.id}-t">${esc(f.nombre)}</title>
<desc id="${f.id}-d">${esc(`${f.objetivo} Notación EPF/SPEM 2.0: Roles a la izquierda, la cadena de Tareas al centro, los Productos de Trabajo a la derecha.`)}</desc>
${PUNTA}
<rect width="100%" height="100%" fill="${PAPEL}"/>
${T(n0.toUpperCase(), XR, 44, { fs: 9, fill: GRIS, f: MONO, ls: "0.16em" })}
${T(n1, XR, 78, { fs: 26, f: SERIF, fill: TINTA })}
${T(f.objetivo, XR, 102, { fs: 11, fill: GRIS })}
${T("ROLES", XR, 124, { fs: 8, fill: GRIS, f: MONO, ls: "0.14em" })}
${T("TAREAS", XT, 124, { fs: 8, fill: GRIS, f: MONO, ls: "0.14em" })}
${T("PRODUCTOS DE TRABAJO", XP, 124, { fs: 8, fill: GRIS, f: MONO, ls: "0.14em" })}
${cuerpo.join("\n")}
${leyenda.join("\n")}
</svg>`;
}

for (const f of seed().fases) {
  const svg = figura(f);
  const [, w, h] = svg.match(/viewBox="0 0 (\d+) ([\d.]+)"/)!;
  const html = `<!doctype html><meta charset="utf-8"><style>${fuentes}body{margin:0;background:#fff}</style>${svg}`;
  capturar(html, `figuras/epf-${f.id}`, +w, Math.ceil(+h));
}
