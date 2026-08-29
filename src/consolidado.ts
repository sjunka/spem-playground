/**
 * El modelo de procesos consolidado: **una** red con las veintiuna Tareas de las
 * cuatro Fases, sus Roles, sus Productos de Trabajo, los puntos de decisión, el
 * eje de tiempo, el plan de releases y el ciclo de incremento dentro de su
 * elipse — la composición del *process model* de EPF Composer. Ver ADR-0010.
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
const W = 2560;
const M = 70;
const CELDA_W = 250;
const PASO = 330; // separación entre celdas de una banda
const COL = (i: number) => 560 + i * PASO;
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

const eyebrow = (t: string, x: number, y: number, color = GRIS, fs = 8) =>
  T(t, x, y, { fs, fill: color, f: MONO, ls: "0.14em" });

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

type Trazo = "solido" | "retorno" | "feedback";
const TRAZO: Record<Trazo, string> = {
  solido: `stroke="${GRIS}" stroke-width="1.3"`,
  retorno: `stroke="${GRIS}" stroke-width="1.3" stroke-dasharray="5 4"`,
  // La retroalimentación no es un rechazo: va en azul, como las decisiones.
  feedback: `stroke="${AZUL}" stroke-width="1.4" stroke-dasharray="2 5" stroke-linecap="round"`,
};

const conector = (pts: [number, number][], trazo: Trazo = "solido") =>
  `<path d="${ruta(pts)}" fill="none" ${TRAZO[trazo]} marker-end="url(#${trazo === "feedback" ? "punta-azul" : "punta"})"/>`;

const rotulo = (texto: string, x: number, y: number, color = GRIS) =>
  `<rect x="${x - texto.length * 3 - 6}" y="${y - 10}" width="${texto.length * 6 + 12}" height="14" rx="3" fill="${PAPEL}" stroke="${REGLA}"/>
${T(texto, x, y, { fs: 8.5, a: "middle", fill: color, f: MONO })}`;

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
function traspaso(productos: Producto[], x: number, y: number, paso: number) {
  return productos
    .flatMap((p, i) => {
      const px = x + i * paso;
      const ls = lineas(p.texto, 7.5, paso - 52);
      return [
        `<rect x="${px - 6}" y="${y - 18}" width="${Math.min(paso - 16, 40 + Math.max(...ls.map((l) => l.length)) * 4.2)}" height="${Math.max(34, 12 + ls.length * 9)}" rx="4" fill="${PAPEL}" stroke="${REGLA}"/>`,
        gProducto(p, px, y - 14),
        ...ls.map((l, j) => T(l, px + 32, y - 6 + j * 9, { fs: 7.5, fill: GRIS })),
      ];
    })
    .join("\n");
}

// ------------------------------------------------------------------ paneles
function panel(titulo: string, bajada: string, x: number, y: number, w: number, h: number) {
  return [
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${PAPEL}" stroke="${TAN}" stroke-opacity="0.6"/>`,
    eyebrow(titulo, x + 22, y + 26, TAN, 9),
    T(bajada, x + 22, y + 44, { fs: 9.5, fill: GRIS }),
  ].join("\n");
}

/**
 * El plan de releases. No sale del modelo SPEM: es la dimensión de producto que
 * el modelo no lleva, y sin ella la figura no dice cuándo entrega nada.
 */
export const RELEASES: [string, string, string, string][] = [
  ["R0", "sem 14", "Prototipo vertical validado en SIL/HIL", "La traza mínima responde de sensor a actuador"],
  ["R1", "sem 20", "Riego autónomo en el lote piloto", "Un ciclo de riego completo sin intervención"],
  ["R2", "sem 28", "Clima y coordinación de varios drones", "Dos drones sin conflicto y decisión climática registrada"],
  ["R3", "sem 36", "Operación asistida por el caficultor", "Manual vigente y auditoría de Constitución sin hallazgos"],
];

/** La cadena de Spec-Driven Development: el documento manda sobre el código. */
const CADENA_SDD = [
  "Constitution.md", "spec.md", "plan.md", "task.md", "código", "verificación",
];

// ------------------------------------------------------------------ posiciones
// El mapa de la figura. Fases 1–3 en cascada, como Iteración 0; la Fase 4 cierra
// el anillo dentro de la elipse, con una decisión en cada extremo.
const Y1 = 372, Y2 = 740, Y3 = 1120;
const ANILLO_SUP = 1530, ANILLO_INF = 1930;

const POS: Record<string, [number, number]> = {
  "t1-1": [COL(0), Y1], "t1-2": [COL(1), Y1], "t1-3": [COL(2), Y1],
  "t2-1": [COL(0), Y2], "t2-2": [COL(1), Y2], "t2-3": [COL(2), Y2],
  "t2-4": [COL(3), Y2], "t2-5": [COL(4), Y2], "t2-6": [COL(5), Y2],
  "t3-1": [COL(0), Y3], "t3-2": [COL(1), Y3], "t3-3": [COL(2), Y3],
  "t3-4": [COL(3), Y3], "t3-5": [COL(4), Y3],
  "t4-1": [640, ANILLO_SUP], "t4-2": [980, ANILLO_SUP], "t4-3": [1320, ANILLO_SUP],
  "t4-4": [1660, ANILLO_INF], "t4-7": [1320, ANILLO_INF],
  "t4-6": [980, ANILLO_INF], "t4-5": [640, ANILLO_INF],
};

const ELIPSE = { cx: 1060, cy: 1730, rx: 860, ry: 380 };
const CANAL_12 = 540, CANAL_23 = 940, CANAL_34 = 1290;
const RETORNO_X = 2470, RETORNO_Y = 196;
const EJE_X = 150; // la regla del tiempo, a la izquierda de todo
const CORREDOR = 1810; // el pasillo entre las dos filas del anillo

const SEMANAS: [string, number][] = [
  ["SEM 1–3", Y1], ["SEM 4–8", Y2], ["SEM 9–14", Y3], ["SEM 15 →", ELIPSE.cy - ELIPSE.ry + 40],
];

export function consolidado(m: Modelo) {
  const tareas = new Map(m.fases.flatMap((f) => f.tareas.map((t) => [t.id, t] as const)));
  const c = Object.fromEntries(
    Object.entries(POS).map(([id, [x, y]]) => [id, celda(tareas.get(id)!, x, y)]),
  ) as Record<string, Celda>;

  const arriba = (n: Celda) => [n.cx, n.y] as [number, number];
  const abajo = (n: Celda) => [n.cx, n.y + n.h] as [number, number];
  const izq = (n: Celda) => [n.x, n.cy] as [number, number];
  const der = (n: Celda) => [n.x + n.w, n.cy] as [number, number];

  const d0 = decision("¿La traza mínima responde en SIL/HIL?", 2230, Y3);
  const d1 = decision("¿Las pruebas del incremento pasan?", 1660, ANILLO_SUP);
  const d2 = decision("¿El incremento cumple la Constitución?", 420, ELIPSE.cy);

  const fondo: string[] = [];
  const aristas: string[] = [];
  const cuerpo: string[] = [];

  // --- las bandas de Fase, detrás de todo.
  const bandas: [string, string, string[]][] = [
    ["FASE 1", "Especificación global de nivel cero", ["t1-1", "t1-2", "t1-3"]],
    ["FASE 2", "Descomposición en dominios", ["t2-1", "t2-2", "t2-3", "t2-4", "t2-5", "t2-6"]],
    ["FASE 3", "Esqueleto funcional mínimo", ["t3-1", "t3-2", "t3-3", "t3-4", "t3-5"]],
  ];
  let iterTop = Infinity, iterBot = 0;
  for (const [n, nombre, ids] of bandas) {
    const cs = ids.map((id) => c[id]);
    const x = Math.min(...cs.map((n) => n.x)) - 46;
    const y = Math.min(...cs.map((n) => n.y)) - 46;
    const x2 = Math.max(...cs.map((n) => n.x + n.w)) + 46;
    const y2 = Math.max(...cs.map((n) => n.y + n.h)) + 26;
    iterTop = Math.min(iterTop, y);
    iterBot = Math.max(iterBot, y2);
    fondo.push(
      `<rect x="${x}" y="${y}" width="${x2 - x}" height="${y2 - y}" rx="16" fill="#fdfaf3" stroke="${TAN}" stroke-opacity="0.5" stroke-dasharray="7 5"/>`,
      eyebrow(n, x + 18, y + 24, TAN, 9),
      T(nombre, x + 92, y + 25, { fs: 13, fill: MARRON, f: SERIF }),
    );
  }

  // --- el eje del tiempo, y con él la marca de que las Fases 1–3 son una sola
  // pasada de arranque: es lo que impide leer la figura como una cascada.
  fondo.push(
    `<line x1="${EJE_X}" y1="${iterTop - 30}" x2="${EJE_X}" y2="${iterBot + 10}" stroke="${TAN}" stroke-width="2"/>`,
    `<path d="M${EJE_X - 10} ${iterTop - 30} h20 M${EJE_X - 10} ${iterBot + 10} h20" stroke="${TAN}" stroke-width="2"/>`,
    `<text transform="translate(${EJE_X - 22} ${(iterTop + iterBot) / 2}) rotate(-90)" text-anchor="middle" font-family="${MONO}" font-size="11" letter-spacing="0.2em" fill="${TAN}">ITERACIÓN 0 · ARRANQUE, UNA SOLA VEZ</text>`,
    ...SEMANAS.map(([texto, y]) =>
      T(texto, EJE_X + 14, y - 96, { fs: 9, fill: GRIS, f: MONO, ls: "0.1em" }),
    ),
    T("El tiempo corre hacia abajo.", EJE_X - 62, iterTop - 46, { fs: 9, fill: GRIS }),
  );

  // --- la elipse del ciclo: la Fase 4 no termina, se repite.
  fondo.push(
    `<ellipse cx="${ELIPSE.cx}" cy="${ELIPSE.cy}" rx="${ELIPSE.rx}" ry="${ELIPSE.ry}" fill="#fdfaf3" stroke="${TAN}" stroke-opacity="0.7" stroke-dasharray="9 6" stroke-width="1.6"/>`,
    // El rótulo va en el pasillo del centro, que es lo que la elipse deja libre.
    glifo("iteration", ELIPSE.cx - 18, ELIPSE.cy - 116, 36, TAN),
    T("FASE 4 · EL ESTADO PERMANENTE DEL PROYECTO", ELIPSE.cx, ELIPSE.cy - 60, {
      fs: 10, a: "middle", fill: TAN, f: MONO, ls: "0.18em",
    }),
    T("Ciclo de crecimiento", ELIPSE.cx, ELIPSE.cy - 26, { fs: 26, a: "middle", fill: MARRON, f: SERIF }),
    T("Un incremento cada 2 a 4 semanas: se construye, se verifica, se despliega,", ELIPSE.cx, ELIPSE.cy, {
      fs: 11, a: "middle", fill: GRIS,
    }),
    T("se muestra al caficultor y lo aprendido reordena el backlog del siguiente.", ELIPSE.cx, ELIPSE.cy + 18, {
      fs: 11, a: "middle", fill: GRIS,
    }),
  );

  // --- Fase 1: del arranque a la Constitución.
  cuerpo.push(hito("INICIO", 320, Y1));
  aristas.push(
    conector([[356, Y1], izq(c["t1-1"])]),
    conector([der(c["t1-1"]), izq(c["t1-2"])]),
    conector([der(c["t1-2"]), izq(c["t1-3"])]),
    conector([abajo(c["t1-3"]), [COL(2), CANAL_12], [COL(0), CANAL_12], arriba(c["t2-1"])]),
  );
  cuerpo.push(traspaso(m.fases[0].salida.slice(0, 3), 600, CANAL_12, 215));

  // --- Fase 2: seis Tareas, la última del equipo de electrónica.
  aristas.push(
    ...[0, 1, 2, 3, 4].map((i) =>
      conector([der(c[`t2-${i + 1}`]), izq(c[`t2-${i + 2}`])]),
    ),
    conector([abajo(c["t2-6"]), [COL(5), CANAL_23], [COL(0), CANAL_23], arriba(c["t3-1"])]),
  );
  cuerpo.push(
    traspaso(m.fases[1].salida, 600, CANAL_23, 270),
    eyebrow("SPEC-DRIVEN DEVELOPMENT · LA ESPECIFICACIÓN MANDA SOBRE EL CÓDIGO", 600, CANAL_23 - 34, TAN, 9),
  );

  // --- Fase 3: el prototipo vertical, el banco HIL y la puerta de salida.
  aristas.push(
    ...[0, 1, 2, 3].map((i) => conector([der(c[`t3-${i + 1}`]), izq(c[`t3-${i + 2}`])])),
    conector([der(c["t3-5"]), [d0.cx - d0.w / 2, d0.cy]]),
    // No: la traza que no responde no se reintenta aquí — vuelve a la Fase 1, a
    // revisar la Constitución, las reglas y los contratos que la sostienen.
    conector(
      [[d0.cx + d0.w / 2, d0.cy], [RETORNO_X, d0.cy], [RETORNO_X, RETORNO_Y], [COL(0), RETORNO_Y], arriba(c["t1-1"])],
      "retorno",
    ),
    conector([[d0.cx, d0.cy + d0.h / 2], [d0.cx, CANAL_34], [640, CANAL_34], arriba(c["t4-1"])]),
  );
  cuerpo.push(
    d0.svg,
    traspaso(m.fases[2].salida, 700, CANAL_34, 300),
    rotulo("No", RETORNO_X, 700),
    rotulo("Sí · R0", d0.cx + 52, CANAL_34 - 6),
  );

  // --- Fase 4: el anillo, con una decisión en cada extremo.
  aristas.push(
    conector([der(c["t4-1"]), izq(c["t4-2"])]),
    conector([der(c["t4-2"]), izq(c["t4-3"])]),
    conector([der(c["t4-3"]), [d1.cx - d1.w / 2, d1.cy]]),
    // No: el incremento vuelve a construcción.
    conector([[d1.cx, d1.cy - d1.h / 2], [d1.cx, 1440], [980, 1440], arriba(c["t4-2"])], "retorno"),
    // Sí: baja al campo y el anillo vuelve por la fila de abajo.
    conector([[d1.cx, d1.cy + d1.h / 2], arriba(c["t4-4"])]),
    conector([izq(c["t4-4"]), der(c["t4-7"])]),
    conector([izq(c["t4-7"]), der(c["t4-6"])]),
    conector([izq(c["t4-6"]), der(c["t4-5"])]),
    conector([izq(c["t4-5"]), [d2.cx, c["t4-5"].cy], [d2.cx, d2.cy + d2.h / 2]]),
    // No: otro incremento.
    conector([[d2.cx, d2.cy - d2.h / 2], [d2.cx, ANILLO_SUP], izq(c["t4-1"])], "retorno"),
    // Sí: sale del ciclo y cierra el proceso.
    conector([[d2.cx - d2.w / 2, d2.cy], [250, d2.cy], [250, 2240], [390, 2240]]),
    // La retroalimentación del review: lo aprendido en campo reordena el backlog.
    conector(
      [arriba(c["t4-7"]), [c["t4-7"].cx, CORREDOR], [700, CORREDOR], [700, c["t4-1"].y + c["t4-1"].h]],
      "feedback",
    ),
  );
  cuerpo.push(
    d1.svg, d2.svg,
    rotulo("No", d1.cx + 34, 1440),
    rotulo("Sí", d1.cx + 34, ANILLO_INF - 130),
    rotulo("No", d2.cx + 34, ANILLO_SUP + 74),
    rotulo("Sí", 250 + 34, 2234),
    rotulo("retroalimentación al backlog", 1010, CORREDOR + 4, AZUL),
    // Dónde se corta cada release del plan.
    rotulo("R1 · R2 · R3", c["t4-4"].cx + 150, ANILLO_INF, MARRON),
    hito("FIN", 420, 2240),
  );

  // --- el equipo completo, arriba a la derecha: los nueve Roles, en dos frentes.
  const roles = [...new Set(m.fases.flatMap((f) => f.roles))];
  const hardware = ["Ingeniero electrónico", "Ingeniero mecatrónico"];
  const px0 = 1440, py0 = 232, px1 = 2400;
  cuerpo.push(
    panel("EQUIPO", "Nueve Roles en dos frentes: software y electrónica, con el caficultor entre ellos.", px0, py0, px1 - px0, 236),
    ...roles.flatMap((rol, i) => {
      const x = px0 + 26 + (i % 3) * 310;
      const y = py0 + 62 + Math.floor(i / 3) * 58;
      const esHw = hardware.includes(rol);
      return [
        gRol(x, y),
        ...lineas(rol, 8.5, 240).map((l, j) =>
          T(l, x + 36, y + 12 + j * 10, { fs: 8.5, fill: esHw ? AZUL : MARRON, w: esHw ? 600 : 400 }),
        ),
      ];
    }),
    T("en azul, el equipo de electrónica", px0 + 26, py0 + 220, { fs: 8.5, fill: AZUL }),
  );

  // --- el plan de releases y la cadena SDD, abajo.
  const py = 2160;
  cuerpo.push(
    panel("PLAN DE RELEASES", "Qué se entrega, cuándo, y con qué criterio se da por bueno.", 620, py, 940, 250),
    ...RELEASES.flatMap(([id, semana, que, criterio], i) => {
      const y = py + 74 + i * 42;
      return [
        `<path d="M${648} ${y - 4} l10 10 -10 10 -10 -10 z" fill="${CREMA}" stroke="${MARRON}"/>`,
        T(id, 672, y + 2, { fs: 10, w: 600, fill: MARRON, f: MONO }),
        T(semana, 712, y + 2, { fs: 9, fill: GRIS, f: MONO }),
        T(que, 780, y + 2, { fs: 9.5, fill: TINTA, w: 600 }),
        T(criterio, 780, y + 14, { fs: 8.5, fill: GRIS }),
      ];
    }),
    panel("EL CICLO SDD", "Cada eslabón nace del anterior; el código es el último, nunca el primero.", 1600, py, 890, 124),
    ...CADENA_SDD.flatMap((paso, i) => {
      const x = 1622 + i * 140;
      return [
        `<rect x="${x}" y="${py + 78}" width="118" height="30" rx="6" fill="${CREMA}" stroke="${TAN}"/>`,
        T(paso, x + 59, py + 97, { fs: 9, a: "middle", fill: MARRON, w: 600, f: MONO }),
        i < CADENA_SDD.length - 1
          ? `<path d="M${x + 120} ${py + 93} h14" stroke="${GRIS}" marker-end="url(#punta)"/>`
          : "",
      ];
    }),
  );

  // --- lo que el proceso entrega.
  const pe = py + 148;
  cuerpo.push(
    panel("EL PROCESO ENTREGA", "Ocho Productos de Trabajo, con dueño y Fase de origen.", 1600, pe, 890, 224),
    ...m.fases[3].salida.flatMap((p, i) => {
      const x = 1622 + (i % 2) * 440;
      const y = pe + 58 + Math.floor(i / 2) * 42;
      return [
        gProducto(p, x, y),
        ...lineas(p.texto, 8.5, 380).map((l, j) => T(l, x + 32, y + 12 + j * 10, { fs: 8.5, fill: MARRON })),
      ];
    }),
  );

  // --- leyenda.
  const ly = 2560;
  const formas: [string, string][] = [
    [contorno("task", 0, 0, 44, 20), "Tarea"],
    [contorno("milestone", 0, 0, 44, 20), "Hito"],
    [contorno("activity", 0, 0, 44, 20), "Actividad / Proceso"],
  ];
  cuerpo.push(
    `<line x1="${M}" y1="${ly}" x2="${W - M}" y2="${ly}" stroke="${REGLA}"/>`,
    eyebrow("LEYENDA SPEM 2.0", M, ly + 24, GRIS, 9),
    ...formas.flatMap(([d, nombre], i) => {
      const x = 250 + i * 220;
      return [
        `<path d="${d}" transform="translate(${x} ${ly + 12})" fill="${CREMA}" stroke="${TAN}"/>`,
        T(nombre, x + 54, ly + 26, { fs: 9, fill: GRIS }),
      ];
    }),
    `<path d="M930 ${ly + 12} l24 10 -24 10 -24 -10 z" fill="${PAPEL}" stroke="${AZUL}"/>`,
    T("Decisión", 968, ly + 26, { fs: 9, fill: GRIS }),
    gRol(1060, ly + 6),
    T("Rol — en negrita, quien ejecuta", 1094, ly + 26, { fs: 9, fill: GRIS }),
    gProducto({ texto: "", icono: "workProduct" }, 1350, ly + 6),
    T("Producto de Trabajo — debajo de quien lo produce", 1384, ly + 26, { fs: 9, fill: GRIS }),
    `<path d="M1760 ${ly + 22} h44" stroke="${GRIS}" stroke-dasharray="5 4"/>`,
    T("Retorno: el trabajo se rehace", 1812, ly + 26, { fs: 9, fill: GRIS }),
    `<path d="M2070 ${ly + 22} h44" stroke="${AZUL}" stroke-width="1.4" stroke-dasharray="2 5" stroke-linecap="round"/>`,
    T("Retroalimentación: lo aprendido reordena el backlog", 2122, ly + 26, { fs: 9, fill: GRIS }),
  );

  const H = ly + 66;
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="cons-t cons-d" xmlns="http://www.w3.org/2000/svg">
<title id="cons-t">Modelo de procesos consolidado — riego autónomo guiado por drones</title>
<desc id="cons-d">${esc("Las veintiuna Tareas de las cuatro Fases en una sola red SPEM 2.0: cada celda lleva sus Roles arriba, la Tarea al centro y sus Productos de Trabajo abajo. Las Fases 1 a 3 son la Iteración 0 de arranque; la Fase 4 se repite dentro de la elipse cada dos a cuatro semanas, con review del incremento con el caficultor y retroalimentación al backlog. La figura incluye eje de tiempo en semanas, plan de releases R0 a R3 y la cadena de Spec-Driven Development.")}</desc>
${PUNTA}
<defs><marker id="punta-azul" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="${AZUL}"/></marker></defs>
<rect width="100%" height="100%" fill="${PAPEL}"/>
${eyebrow("MODELO DE PROCESOS — SPEM 2.0 · SPEC-DRIVEN DEVELOPMENT", M, 62, GRIS, 10)}
${T("El modelo de procesos consolidado", M, 108, { fs: 34, f: SERIF, fill: TINTA })}
${T("Sistema ciberfísico de riego autónomo guiado por drones para caficultura — cuatro Fases, veintiuna Tareas y nueve Roles en una sola red.", M, 134, { fs: 12, fill: GRIS })}
${T("Cada celda: los Roles arriba, la Tarea al centro, los Productos de Trabajo que produce abajo. El tiempo corre hacia abajo; el ciclo de la Fase 4 no termina.", M, 154, { fs: 11, fill: GRIS })}
${fondo.join("\n")}
${aristas.join("\n")}
${cuerpo.join("\n")}
${Object.values(c).map((n) => n.svg).join("\n")}
</svg>`;
}
