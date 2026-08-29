/**
 * El modelo de procesos consolidado: **una** red con las dieciocho Tareas de las
 * cuatro Fases, sus Roles, sus Productos de Trabajo, los puntos de decisión y el
 * ciclo de incremento dentro de su elipse — la composición del *process model*
 * de EPF Composer. Ver ADR-0010.
 *
 * La geometría es explícita: cada celda tiene su centro en `POS`. Un layout
 * automático daría una maraña; el documento necesita una figura estable.
 */
import { ICONOS, type IdIcono } from "./iconos";
import { contorno, FORMA } from "./formas";
import { wrap } from "./layout";
import type { Modelo, Producto, Tarea } from "./modelo";
import {
  AZUL, CREMA, esc, gProducto, gRol, GRIS, MARRON, MONO, PAPEL, PUNTA, REGLA,
  SERIF, T, TAN, TINTA,
} from "./epf-svg";

// ------------------------------------------------------------------ medidas
const W = 2260;
const CELDA_W = 250;
const FS_ROL = 6.5, FS_NOMBRE = 10, FS_PROD = 6.5;
const LH_MINI = 8;

const lineas = (t: string, fs: number, w: number) => wrap(t, fs, w);

/**
 * El contorno de la celda. `contorno` da al chevron una punta de 28px, que a este
 * tamaño se come la última columna de Productos de Trabajo: aquí es de 16.
 */
function contornoCelda(icono: IdIcono, x: number, y: number, w: number, h: number) {
  const p = 16, r = 10;
  switch (FORMA[icono] ?? "caja") {
    case "chevron":
      return `M${x} ${y} H${x + w - p} L${x + w} ${y + h / 2} L${x + w - p} ${y + h} H${x} Z`;
    case "hexagono":
      return `M${x} ${y + h / 2} L${x + p} ${y} H${x + w - p} L${x + w} ${y + h / 2} L${x + w - p} ${y + h} H${x + p} Z`;
    default:
      return contorno(icono, x, y, w, h).replace(/A8 8/g, `A${r} ${r}`);
  }
}

/** El glifo SPEM de 24×24, a escala y con su color, sin depender de ninguna hoja. */
const glifo = (id: IdIcono, x: number, y: number, tam: number, color = MARRON) =>
  `<path transform="translate(${x} ${y}) scale(${tam / 24})" d="${ICONOS[id]}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linejoin="round"/>`;

// ------------------------------------------------------------------ la celda
type Celda = {
  t: Tarea;
  cx: number; cy: number;
  x: number; y: number; w: number; h: number;
  svg: string;
};

/** Roles arriba, la Tarea al centro, sus Productos de Trabajo abajo. */
function medir(t: Tarea) {
  const roles = [...t.roles].sort((a, b) => (a.papel === b.papel ? 0 : a.papel === "perform" ? -1 : 1));
  const colRol = (CELDA_W - 20) / Math.max(1, roles.length);
  const lsRol = roles.map((r) => lineas(r.rol, FS_ROL, colRol - 6));
  const hRoles = 26 + Math.max(1, ...lsRol.map((l) => l.length)) * LH_MINI;

  const lsNombre = lineas(t.nombre, FS_NOMBRE, CELDA_W - 76);
  const hNombre = lsNombre.length * 12 + 12;

  const prods = t.salida;
  const colProd = (CELDA_W - 20) / Math.max(1, prods.length);
  const lsProd = prods.map((p) => lineas(p.texto, FS_PROD, colProd - 6));
  const hProds = prods.length ? 22 + Math.max(1, ...lsProd.map((l) => l.length)) * LH_MINI : 0;

  return {
    roles, lsRol, colRol, lsNombre, hNombre, prods, lsProd, colProd, hRoles, hProds,
    h: 10 + hRoles + 6 + hNombre + (hProds ? 6 + hProds : 0) + 10,
  };
}

function celda(t: Tarea, cx: number, cy: number): Celda {
  const m = medir(t);
  const x = cx - CELDA_W / 2, y = cy - m.h / 2, w = CELDA_W, h = m.h;
  const partes: string[] = [
    // El contorno lo da el Tipo SPEM: chevron a la Tarea, hexágono al Hito.
    `<path d="${contornoCelda(t.icono, x, y, w, h)}" fill="${CREMA}" stroke="${TAN}" stroke-width="1.3"/>`,
  ];

  let py = y + 10;
  m.roles.forEach((r, i) => {
    const gx = x + 10 + i * m.colRol + m.colRol / 2;
    partes.push(
      gRol(gx - 14, py),
      ...m.lsRol[i].map((l, j) =>
        T(l, gx, py + 34 + j * LH_MINI, {
          fs: FS_ROL, a: "middle",
          fill: r.papel === "perform" ? MARRON : GRIS,
          w: r.papel === "perform" ? 600 : 400,
        }),
      ),
    );
  });
  py += m.hRoles + 6;

  // La banda blanca del nombre: lo que se lee primero al recorrer la red.
  partes.push(
    `<rect x="${x + 22}" y="${py}" width="${w - 48}" height="${m.hNombre}" rx="5" fill="${PAPEL}" stroke="${TAN}" stroke-opacity="0.55"/>`,
    glifo(t.icono, x + 28, py + m.hNombre / 2 - 7, 14),
    ...m.lsNombre.map((l, j) =>
      T(l, x + 48, py + 6 + (j + 0.85) * 12, { fs: FS_NOMBRE, w: 600, fill: TINTA }),
    ),
  );
  py += m.hNombre + 6;

  m.prods.forEach((p, i) => {
    const gx = x + 10 + i * m.colProd + m.colProd / 2;
    partes.push(
      gProducto(p, gx - 14, py),
      ...m.lsProd[i].map((l, j) =>
        T(l, gx, py + 32 + j * LH_MINI, { fs: FS_PROD, a: "middle", fill: GRIS }),
      ),
    );
  });

  return { t, cx, cy, x, y, w, h, svg: partes.join("\n") };
}

// ------------------------------------------------------------------ conectores
/** Polilínea ortogonal con las esquinas redondeadas: el router de toda la figura. */
function ruta(pts: [number, number][], r = 12) {
  const d = [`M${pts[0][0]} ${pts[0][1]}`];
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1], [x, y] = pts[i], [nx, ny] = pts[i + 1];
    const l1 = Math.hypot(x - px, y - py), l2 = Math.hypot(nx - x, ny - y);
    const r1 = Math.min(r, l1 / 2), r2 = Math.min(r, l2 / 2);
    d.push(
      `L${x - ((x - px) / l1) * r1} ${y - ((y - py) / l1) * r1}`,
      `Q${x} ${y} ${x + ((nx - x) / l2) * r2} ${y + ((ny - y) / l2) * r2}`,
    );
  }
  const u = pts[pts.length - 1];
  return d.join(" ") + ` L${u[0]} ${u[1]}`;
}

const conector = (pts: [number, number][], punteado = false) =>
  `<path d="${ruta(pts)}" fill="none" stroke="${GRIS}" stroke-width="1.3"${punteado ? ' stroke-dasharray="5 4"' : ""} marker-end="url(#punta)"/>`;

const rotulo = (texto: string, x: number, y: number) =>
  `<rect x="${x - texto.length * 3 - 6}" y="${y - 10}" width="${texto.length * 6 + 12}" height="14" rx="3" fill="${PAPEL}" stroke="${REGLA}"/>
${T(texto, x, y, { fs: 8.5, a: "middle", fill: GRIS, f: MONO })}`;

// ------------------------------------------------------------------ decisiones
const DEC_W = 210, DEC_H = 96;
function decision(texto: string, cx: number, cy: number) {
  const ls = lineas(texto, 8.5, DEC_W - 70);
  return {
    cx, cy, w: DEC_W, h: DEC_H,
    svg: [
      `<path d="M${cx} ${cy - DEC_H / 2} L${cx + DEC_W / 2} ${cy} L${cx} ${cy + DEC_H / 2} L${cx - DEC_W / 2} ${cy} Z" fill="${PAPEL}" stroke="${AZUL}" stroke-width="1.3"/>`,
      ...ls.map((l, j) =>
        T(l, cx, cy - (ls.length - 1) * 5.5 + j * 11 + 3, { fs: 8.5, a: "middle", fill: TINTA, w: 600 }),
      ),
    ].join("\n"),
  };
}

const hito = (texto: string, cx: number, cy: number, r = 30) =>
  [
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${PAPEL}" stroke="${MARRON}" stroke-width="2"/>`,
    `<circle cx="${cx}" cy="${cy}" r="${r - 7}" fill="${MARRON}"/>`,
    T(texto, cx, cy + r + 18, { fs: 10, a: "middle", fill: MARRON, w: 600, f: MONO, ls: "0.1em" }),
  ].join("\n");

/** Los Productos de Trabajo que viajan por un conector, sobre el propio trazo. */
function traspaso(productos: Producto[], x: number, y: number, paso = 260) {
  return productos
    .flatMap((p, i) => {
      const px = x + i * paso;
      const ls = lineas(p.texto, 7.5, paso - 46);
      return [
        `<rect x="${px - 6}" y="${y - 18}" width="${Math.min(paso - 16, 40 + Math.max(...ls.map((l) => l.length)) * 4.2)}" height="${Math.max(34, 12 + ls.length * 9)}" rx="4" fill="${PAPEL}" stroke="${REGLA}"/>`,
        gProducto(p, px, y - 14),
        ...ls.map((l, j) => T(l, px + 32, y - 6 + j * 9, { fs: 7.5, fill: GRIS })),
      ];
    })
    .join("\n");
}

// ------------------------------------------------------------------ posiciones
// El mapa de la figura. Bandas 1–3 en cascada; la Fase 4 cierra el ciclo dentro
// de la elipse, con sus dos decisiones y sus dos retornos.
const POS: Record<string, [number, number]> = {
  "t1-1": [430, 352], "t1-2": [790, 352], "t1-3": [1150, 352],
  "t2-1": [430, 680], "t2-2": [790, 680], "t2-3": [1150, 680], "t2-4": [1510, 680], "t2-5": [1870, 680],
  "t3-1": [430, 1060], "t3-2": [790, 1060], "t3-3": [1150, 1060], "t3-4": [1510, 1060],
  "t4-1": [470, 1500], "t4-2": [830, 1500], "t4-3": [1190, 1500],
  "t4-4": [1440, 1830], "t4-6": [1080, 1830], "t4-5": [720, 1830],
};

const ELIPSE = { cx: 960, cy: 1665, rx: 800, ry: 330 };
const CANAL_12 = 520, CANAL_23 = 880, CANAL_34 = 1250;
// El canal del retorno a la Fase 1: por fuera de todo, a la derecha y por arriba.
const RETORNO_X = 2180, RETORNO_Y = 196;

export function consolidado(m: Modelo) {
  const tareas = new Map(m.fases.flatMap((f) => f.tareas.map((t) => [t.id, t] as const)));
  const c = Object.fromEntries(
    Object.entries(POS).map(([id, [x, y]]) => [id, celda(tareas.get(id)!, x, y)]),
  ) as Record<string, Celda>;

  const arriba = (n: Celda) => [n.cx, n.y] as [number, number];
  const abajo = (n: Celda) => [n.cx, n.y + n.h] as [number, number];
  const izq = (n: Celda) => [n.x, n.cy] as [number, number];
  const der = (n: Celda) => [n.x + n.w, n.cy] as [number, number];

  const d0 = decision("¿La traza mínima responde en SIL/HIL?", 1900, 1060);
  const d1 = decision("¿Las pruebas del incremento pasan?", 1530, 1500);
  const d2 = decision("¿El incremento cumple la Constitución?", 400, 1830);

  const fondo: string[] = [];
  const aristas: string[] = [];
  const cuerpo: string[] = [];

  // --- las bandas de Fase, detrás de todo.
  const bandas: [string, string, string[]][] = [
    ["FASE 1", "Especificación global de nivel cero", ["t1-1", "t1-2", "t1-3"]],
    ["FASE 2", "Descomposición en dominios", ["t2-1", "t2-2", "t2-3", "t2-4", "t2-5"]],
    ["FASE 3", "Esqueleto funcional mínimo", ["t3-1", "t3-2", "t3-3", "t3-4"]],
  ];
  for (const [n, nombre, ids] of bandas) {
    const cs = ids.map((id) => c[id]);
    const x = Math.min(...cs.map((n) => n.x)) - 46;
    const y = Math.min(...cs.map((n) => n.y)) - 46;
    const x2 = Math.max(...cs.map((n) => n.x + n.w)) + 46;
    const y2 = Math.max(...cs.map((n) => n.y + n.h)) + 26;
    fondo.push(
      `<rect x="${x}" y="${y}" width="${x2 - x}" height="${y2 - y}" rx="16" fill="#fdfaf3" stroke="${TAN}" stroke-opacity="0.5" stroke-dasharray="7 5"/>`,
      T(n, x + 18, y + 24, { fs: 9, fill: TAN, f: MONO, ls: "0.16em" }),
      T(nombre, x + 92, y + 25, { fs: 13, fill: MARRON, f: SERIF }),
    );
  }

  // --- la elipse del ciclo: la Fase 4 no termina, se repite.
  fondo.push(
    `<ellipse cx="${ELIPSE.cx}" cy="${ELIPSE.cy}" rx="${ELIPSE.rx}" ry="${ELIPSE.ry}" fill="#fdfaf3" stroke="${TAN}" stroke-opacity="0.7" stroke-dasharray="9 6" stroke-width="1.6"/>`,
    // El rótulo va en el hueco del centro, que es lo que la elipse deja libre.
    glifo("iteration", ELIPSE.cx - 18, ELIPSE.cy - 76, 36, TAN),
    T("FASE 4", ELIPSE.cx, ELIPSE.cy - 20, { fs: 10, a: "middle", fill: TAN, f: MONO, ls: "0.18em" }),
    T("Ciclo de crecimiento", ELIPSE.cx, ELIPSE.cy + 14, { fs: 26, a: "middle", fill: MARRON, f: SERIF }),
    T("El incremento recorre el ciclo cada 2 a 4 semanas y vuelve a empezar", ELIPSE.cx, ELIPSE.cy + 40, {
      fs: 11, a: "middle", fill: GRIS,
    }),
    T("hasta que pasa las pruebas y cumple la Constitución.", ELIPSE.cx, ELIPSE.cy + 58, {
      fs: 11, a: "middle", fill: GRIS,
    }),
  );

  // --- Fase 1: del arranque a la Constitución.
  cuerpo.push(hito("INICIO", 150, 352));
  aristas.push(
    conector([[186, 352], izq(c["t1-1"])]),
    conector([der(c["t1-1"]), izq(c["t1-2"])]),
    conector([der(c["t1-2"]), izq(c["t1-3"])]),
    // Traspaso a la Fase 2: baja por la derecha y vuelve al canal.
    conector([abajo(c["t1-3"]), [1150, CANAL_12], [430, CANAL_12], arriba(c["t2-1"])]),
  );
  cuerpo.push(traspaso(m.fases[0].salida.slice(0, 3), 500, CANAL_12, 230));

  // --- Fase 2: cinco Tareas en cadena.
  aristas.push(
    conector([der(c["t2-1"]), izq(c["t2-2"])]),
    conector([der(c["t2-2"]), izq(c["t2-3"])]),
    conector([der(c["t2-3"]), izq(c["t2-4"])]),
    conector([der(c["t2-4"]), izq(c["t2-5"])]),
    conector([abajo(c["t2-5"]), [1870, CANAL_23], [430, CANAL_23], arriba(c["t3-1"])]),
  );
  cuerpo.push(traspaso(m.fases[1].salida, 540, CANAL_23, 330));

  // --- Fase 3: el prototipo vertical y su validación.
  aristas.push(
    conector([der(c["t3-1"]), izq(c["t3-2"])]),
    conector([der(c["t3-2"]), izq(c["t3-3"])]),
    conector([der(c["t3-3"]), izq(c["t3-4"])]),
    conector([der(c["t3-4"]), [d0.cx - d0.w / 2, d0.cy]]),
    // No: la traza que no responde no se reintenta aquí — vuelve a la Fase 1, a
    // revisar la Constitución, las reglas y los contratos que la sostienen.
    conector(
      [[d0.cx + d0.w / 2, d0.cy], [RETORNO_X, d0.cy], [RETORNO_X, RETORNO_Y], [430, RETORNO_Y], arriba(c["t1-1"])],
      true,
    ),
    // Sí: entra al ciclo.
    conector([[d0.cx, d0.cy + d0.h / 2], [d0.cx, CANAL_34], [470, CANAL_34], arriba(c["t4-1"])]),
  );
  cuerpo.push(d0.svg, traspaso(m.fases[2].salida, 620, CANAL_34, 330));
  cuerpo.push(rotulo("No", RETORNO_X, 700), rotulo("Sí", d0.cx + 34, CANAL_34 - 6));

  // --- Fase 4: el ciclo, en sentido horario.
  aristas.push(
    conector([der(c["t4-1"]), izq(c["t4-2"])]),
    conector([der(c["t4-2"]), izq(c["t4-3"])]),
    conector([der(c["t4-3"]), [d1.cx - d1.w / 2, d1.cy]]),
    // No: el incremento vuelve a construcción.
    conector([[d1.cx, d1.cy - d1.h / 2], [d1.cx, 1355], [830, 1355], arriba(c["t4-2"])], true),
    // Sí: al campo, y de vuelta por la fila de abajo.
    conector([[d1.cx, d1.cy + d1.h / 2], [d1.cx, 1665], [1440, 1665], arriba(c["t4-4"])]),
    conector([izq(c["t4-4"]), der(c["t4-6"])]),
    conector([izq(c["t4-6"]), der(c["t4-5"])]),
    conector([izq(c["t4-5"]), [d2.cx + d2.w / 2, d2.cy]]),
    // No: otro incremento.
    conector([[d2.cx, d2.cy - d2.h / 2], [d2.cx, 1665], [470, 1665], abajo(c["t4-1"])], true),
    // Sí: sale del ciclo y cierra el proceso.
    conector([[d2.cx, d2.cy + d2.h / 2], [d2.cx, 2065], [960, 2065], [960, 2100]]),
  );
  cuerpo.push(d1.svg, d2.svg);
  cuerpo.push(
    rotulo("No", d1.cx + 34, 1355),
    rotulo("Sí", d1.cx + 34, 1659),
    rotulo("No", d2.cx + 34, 1659),
    rotulo("Sí", d2.cx + 34, 2059),
    hito("FIN", 960, 2136),
  );

  // --- lo que el proceso entrega, junto al hito de cierre.
  const entrega = m.fases[3].salida;
  cuerpo.push(
    T("EL PROCESO ENTREGA", 1080, 2106, { fs: 8, fill: GRIS, f: MONO, ls: "0.14em" }),
    ...entrega.flatMap((p, i) => {
      const px = 1080 + (i % 4) * 290;
      const py = 2120 + Math.floor(i / 4) * 34;
      return [
        gProducto(p, px, py),
        ...lineas(p.texto, 8, 250).map((l, j) => T(l, px + 32, py + 12 + j * 9, { fs: 8, fill: MARRON })),
      ];
    }),
  );

  // --- el equipo completo, arriba a la derecha.
  const roles = [...new Set(m.fases.flatMap((f) => f.roles))];
  const px0 = 1380, py0 = 232, px1 = 2150;
  cuerpo.push(
    `<rect x="${px0}" y="${py0}" width="${px1 - px0}" height="200" rx="14" fill="${PAPEL}" stroke="${TAN}" stroke-opacity="0.6"/>`,
    T("EQUIPO", px0 + 22, py0 + 28, { fs: 9, fill: TAN, f: MONO, ls: "0.16em" }),
    T("Los siete Roles del proceso", px0 + 92, py0 + 29, { fs: 13, fill: MARRON, f: SERIF }),
    ...roles.flatMap((rol, i) => {
      const x = px0 + 26 + (i % 4) * 190;
      const y = py0 + 52 + Math.floor(i / 4) * 74;
      return [
        gRol(x, y),
        ...lineas(rol, 8, 150).map((l, j) => T(l, x + 36, y + 12 + j * 10, { fs: 8, fill: MARRON })),
      ];
    }),
  );

  // --- leyenda.
  const ly = 2220;
  const formas: [string, string][] = [
    [contorno("task", 0, 0, 44, 20), "Tarea"],
    [contorno("milestone", 0, 0, 44, 20), "Hito"],
    [contorno("activity", 0, 0, 44, 20), "Actividad / Proceso"],
  ];
  cuerpo.push(
    `<line x1="70" y1="${ly}" x2="${W - 70}" y2="${ly}" stroke="${REGLA}"/>`,
    T("LEYENDA SPEM 2.0", 70, ly + 24, { fs: 9, fill: GRIS, f: MONO, ls: "0.14em" }),
    ...formas.flatMap(([d, nombre], i) => {
      const x = 250 + i * 230;
      return [
        `<path d="${d}" transform="translate(${x} ${ly + 12})" fill="${CREMA}" stroke="${TAN}"/>`,
        T(nombre, x + 54, ly + 26, { fs: 9, fill: GRIS }),
      ];
    }),
    `<path d="M${960} ${ly + 12} l24 10 -24 10 -24 -10 z" fill="${PAPEL}" stroke="${AZUL}"/>`,
    T("Decisión", 998, ly + 26, { fs: 9, fill: GRIS }),
    gRol(1090, ly + 6),
    T("Rol — arriba de cada Tarea, en negrita quien la ejecuta", 1124, ly + 26, { fs: 9, fill: GRIS }),
    gProducto({ texto: "", icono: "workProduct" }, 1520, ly + 6),
    T("Producto de Trabajo — debajo de la Tarea que lo produce", 1554, ly + 26, { fs: 9, fill: GRIS }),
    `<path d="M1950 ${ly + 22} h44" stroke="${GRIS}" stroke-dasharray="5 4"/>`,
    T("Retorno del ciclo", 2002, ly + 26, { fs: 9, fill: GRIS }),
  );

  const H = ly + 66;
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="cons-t cons-d" xmlns="http://www.w3.org/2000/svg">
<title id="cons-t">Modelo de procesos consolidado — riego autónomo guiado por drones</title>
<desc id="cons-d">${esc("Las dieciocho Tareas de las cuatro Fases en una sola red SPEM 2.0: cada celda lleva sus Roles arriba, la Tarea al centro y sus Productos de Trabajo abajo. Las Fases 1 a 3 avanzan en cascada; la Fase 4 se repite dentro de la elipse hasta que el incremento pasa las pruebas y cumple la Constitución.")}</desc>
${PUNTA}
<rect width="100%" height="100%" fill="${PAPEL}"/>
${T("MODELO DE PROCESOS — SPEM 2.0", 70, 62, { fs: 10, fill: GRIS, f: MONO, ls: "0.16em" })}
${T("El modelo de procesos consolidado", 70, 108, { fs: 34, f: SERIF, fill: TINTA })}
${T("Sistema de riego autónomo guiado por drones para caficultura — las cuatro Fases, las dieciocho Tareas y los siete Roles en una sola red.", 70, 134, { fs: 12, fill: GRIS })}
${T("Cada celda: los Roles arriba, la Tarea al centro, los Productos de Trabajo que produce abajo.", 70, 154, { fs: 11, fill: GRIS })}
${fondo.join("\n")}
${aristas.join("\n")}
${cuerpo.join("\n")}
${Object.values(c).map((n) => n.svg).join("\n")}
</svg>`;
}
