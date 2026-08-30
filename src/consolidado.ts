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
const W = 2180;
const M = 70;
const CELDA_W = 250;


const FS_ROL = 6.5, FS_NOMBRE = 10, FS_PROD = 6.5;
const GAP_ROL = 16; // el aire donde cae la línea que une el Rol con su Tarea
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

/** T1.1, T2.6, T4.7… el código que la celda y el panel de Roles comparten. */
export const codigo = (id: string) => id.replace("t", "T").replace("-", ".");

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
    h: 10 + hRoles + GAP_ROL + hNombre + (hProds ? 6 + hProds : 0) + 10,
  };
}

function celda(t: Tarea, cx: number, cy: number): Celda {
  const m = medir(t);
  const x = cx - CELDA_W / 2, y = cy - m.h / 2, w = CELDA_W, h = m.h;
  const partes: string[] = [
    // El contorno lo da el Tipo SPEM: chevron a la Tarea, hexágono al Hito.
    `<path d="${contornoCelda(t.icono, x, y, w, h)}" fill="${CREMA}" stroke="${TAN}" stroke-width="1.3"/>`,
  ];

  partes.push(T(codigo(t.id), x + 10, y + 19, { fs: 8, fill: TAN, w: 600, f: MONO }));

  let py = y + 10;
  // La línea de asignación: en SPEM el Rol no se posa junto a la Tarea, se une a
  // ella. Va debajo de los textos, del hombro del Rol al borde de la banda.
  const yBanda = py + m.hRoles + GAP_ROL;
  const bx = x + 22, bw = w - 48;
  m.roles.forEach((_, i) => {
    const gx = x + 10 + i * m.colRol + m.colRol / 2;
    const tx = Math.max(bx + 12, Math.min(bx + bw - 12, gx + (x + w / 2 - gx) * 0.3));
    // Arranca bajo la última línea del nombre: cruzar el rótulo del Rol lo vuelve
    // ilegible, y la línea es una asignación, no un tachado.
    const desde = py + 30 + m.lsRol[i].length * LH_MINI;
    partes.push(
      `<line x1="${gx}" y1="${desde}" x2="${tx}" y2="${yBanda}" stroke="${TAN}" stroke-width="1" stroke-opacity="0.8"/>`,
    );
  });
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
  py += m.hRoles + GAP_ROL;

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

/** Los Productos de Trabajo del traspaso, apilados sobre el canal vertical. */
function traspaso(productos: Producto[], x: number, y0: number) {
  const cajas = productos.map((p) => {
    const ls = lineas(p.texto, 7.5, CANAL_W - 52);
    return { p, ls, h: Math.max(34, 12 + ls.length * 9) };
  });
  const total = cajas.reduce((h, b) => h + b.h + 10, 0) - 10;
  let y = y0 - total / 2;
  const svg = cajas
    .flatMap(({ p, ls, h }) => {
      const partes = [
        `<rect x="${x - CANAL_W / 2}" y="${y}" width="${CANAL_W}" height="${h}" rx="4" fill="${PAPEL}" stroke="${REGLA}"/>`,
        gProducto(p, x - CANAL_W / 2 + 6, y + h / 2 - 13),
        ...ls.map((l, j) =>
          T(l, x - CANAL_W / 2 + 38, y + h / 2 - (ls.length - 1) * 4.5 + j * 9 + 3, {
            fs: 7.5, fill: GRIS,
          }),
        ),
      ];
      y += h + 10;
      return partes;
    })
    .join("\n");
  return { svg, total };
}

// ------------------------------------------------------------------ paneles
function panel(titulo: string, bajada: string, x: number, y: number, w: number, h: number) {
  return [
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${PAPEL}" stroke="${TAN}" stroke-opacity="0.6"/>`,
    eyebrow(titulo, x + 22, y + 26, TAN, 9),
    ...lineas(bajada, 9.5, w - 44).map((l, j) => T(l, x + 22, y + 44 + j * 13, { fs: 9.5, fill: GRIS })),
  ].join("\n");
}

/**
 * El plan de releases. No sale del modelo SPEM: es la dimensión de producto que
 * el modelo no lleva, y sin ella la figura no dice cuándo entrega nada.
 */
export const RELEASES: [string, string, string, string][] = [
  ["R0", "mes 6", "Prototipo vertical validado en SIL/HIL", "La traza mínima responde de sensor a actuador"],
  ["R1", "mes 10", "Monitoreo del cultivo en campo", "Humedad y clima registrados sin intervención"],
  ["R2", "mes 14", "Operación básica del dron", "Un vuelo completo dentro de las rutas certificadas"],
  ["R3", "mes 18", "Riego por reglas en el lote piloto", "Un ciclo de riego completo sin intervención"],
  ["R4", "mes 22", "Variables climáticas en la decisión", "Decisión climática registrada y trazable"],
  ["R5", "mes 26", "Coordinación de varios drones", "Dos drones sin conflicto y manual de operación vigente"],
];

/** La cadena de Spec-Driven Development: el documento manda sobre el código. */
const CADENA_SDD = [
  "Constitution.md", "spec.md", "plan.md", "task.md", "código", "verificación",
];

// ------------------------------------------------------------------ posiciones
// La figura es vertical: cada Fase es una columna que se lee hacia abajo, y las
// Fases se suceden hacia la derecha. El anillo de la Fase 4 va debajo de las tres,
// y los paneles al pie. Ver ADR-0013.
const COL_X = [340, 860, 1380, 1900]; // el centro de cada columna de Fase
const CANAL_X = [600, 1120, 1640]; // el canal de traspaso entre dos columnas
const CANAL_W = 160;
const Y_REGLA = 392; // la regla del tiempo, encima de las columnas
const Y_COL = 500; // el borde superior de la primera celda de cada columna
const PASO_Y = 48; // entre dos celdas de una columna
const PAD_X = 46, PAD_TOP = 64, PAD_BOT = 26; // el aire del panel de Fase

// El anillo: dos columnas y un fondo de elipse, con una decisión en cada extremo.
const RX = 820, RY = 760;
const ANILLO_CX = 1090;
const ANILLO_X = [750, 1430]; // izquierda: el regreso; derecha: la bajada
const CORREDOR_X = 1240; // por donde sube la retroalimentación, sin tocar el rótulo
const RETORNO_X = 1275; // el carril del retorno de la puerta de especificaciones

// La decisión agronómica parte la columna de la Fase 3: la celda que la sigue
// deja sitio para el rombo antes de dibujarse.
const HUECO: Record<string, number> = { "t3-5": 168 };

const COLUMNAS: [string, string, string[]][] = [
  ["FASE 0", "Visión y planificación del producto", ["t0-1", "t0-2", "t0-3", "t0-4"]],
  ["FASE 1", "Especificación global de nivel cero", ["t1-1", "t1-2", "t1-3"]],
  ["FASE 2", "Descomposición en dominios", ["t2-1", "t2-2", "t2-3", "t2-4", "t2-5", "t2-6", "t2-7"]],
  ["FASE 3", "Esqueleto funcional mínimo", ["t3-1", "t3-2", "t3-3", "t3-4", "t3-5", "t3-6"]],
];

const SEMANAS = ["SEM 1–2", "SEM 3–6", "SEM 7–11", "SEM 12–24"];

export function consolidado(m: Modelo) {
  const tareas = new Map(m.fases.flatMap((f) => f.tareas.map((t) => [t.id, t] as const)));
  const ciclo = m.fases[m.fases.length - 1];

  // --- las tres columnas de arranque: la altura de cada celda decide la siguiente.
  const c: Record<string, Celda> = {};
  const columna: { top: number; bot: number; ids: string[] }[] = [];
  COLUMNAS.forEach(([, , ids], i) => {
    let y = Y_COL;
    ids.forEach((id) => {
      const t = tareas.get(id)!;
      const h = medir(t).h;
      y += HUECO[id] ?? 0;
      c[id] = celda(t, COL_X[i], y + h / 2);
      y += h + PASO_Y;
    });
    columna.push({ top: Y_COL, bot: y - PASO_Y, ids });
  });
  const colBot = Math.max(...columna.map((k) => k.bot));

  // --- la decisión que cierra el arranque, y con ella el anillo de la Fase 4.
  const yD0 = colBot + PAD_BOT + 110;
  const ANILLO_CY = yD0 + 48 + 130 + RY;
  const anillo = (i: number, dy: number) => [ANILLO_X[i], ANILLO_CY + dy] as [number, number];
  const POS: Record<string, [number, number]> = {
    "t4-1": anillo(1, -480), "t4-2": anillo(1, -240), "t4-3": anillo(1, 0),
    "t4-4": [ANILLO_CX, ANILLO_CY + 600],
    "t4-5": anillo(0, 420), "t4-6": anillo(0, 210), "t4-7": anillo(0, 0),
    "t4-8": anillo(0, -210), "t4-9": anillo(0, -420),
  };
  for (const [id, [x, y]] of Object.entries(POS)) c[id] = celda(tareas.get(id)!, x, y);

  const arriba = (n: Celda) => [n.cx, n.y] as [number, number];
  const abajo = (n: Celda) => [n.cx, n.y + n.h] as [number, number];
  const izq = (n: Celda) => [n.x, n.cy] as [number, number];
  const der = (n: Celda) => [n.x + n.w, n.cy] as [number, number];

  const ULTIMA_COL = COL_X.length - 1;
  const d0 = decision("¿La traza mínima responde en SIL/HIL?", COL_X[ULTIMA_COL], yD0);
  const d1 = decision("¿Las pruebas del incremento pasan?", ANILLO_X[1], ANILLO_CY + 260);
  const d2 = decision("¿El incremento cumple con las especificaciones?", ANILLO_X[0], ANILLO_CY - 620);
  // La puerta agronómica de la Fase 3: lo que no valida el caficultor no sigue.
  const yD3 = c["t3-5"].y - (HUECO["t3-5"] ?? 0) / 2 - PASO_Y / 2;
  const d3 = decision("¿Las reglas de negocio y las condiciones agronómicas son válidas?", COL_X[ULTIMA_COL], yD3);

  const fondo: string[] = [];
  const aristas: string[] = [];
  const cuerpo: string[] = [];

  // --- el panel de cada Fase, detrás de su columna.
  COLUMNAS.forEach(([n, nombre, ids], i) => {
    const cs = ids.map((id) => c[id]);
    const x = COL_X[i] - CELDA_W / 2 - PAD_X;
    const y = Math.min(...cs.map((k) => k.y)) - PAD_TOP;
    const y2 = Math.max(...cs.map((k) => k.y + k.h)) + PAD_BOT;
    fondo.push(
      `<rect x="${x}" y="${y}" width="${CELDA_W + PAD_X * 2}" height="${y2 - y}" rx="16" fill="#fdfaf3" stroke="${TAN}" stroke-opacity="0.5" stroke-dasharray="7 5"/>`,
      eyebrow(n, x + 18, y + 24, TAN, 9),
      ...lineas(nombre, 13, CELDA_W + PAD_X * 2 - 36).map((l, j) =>
        T(l, x + 18, y + 44 + j * 15, { fs: 13, fill: MARRON, f: SERIF }),
      ),
    );
  });

  // --- la regla del tiempo. En vertical el tiempo baja dentro de cada Fase y
  // avanza hacia la derecha entre Fases: la regla es lo que lo dice.
  const rx0 = COL_X[0] - CELDA_W / 2 - PAD_X, rx1 = COL_X[ULTIMA_COL] + CELDA_W / 2 + PAD_X;
  fondo.push(
    `<line x1="${rx0}" y1="${Y_REGLA}" x2="${rx1}" y2="${Y_REGLA}" stroke="${TAN}" stroke-width="2"/>`,
    `<path d="M${rx0} ${Y_REGLA - 10} v20 M${rx1} ${Y_REGLA - 10} v20" stroke="${TAN}" stroke-width="2"/>`,
    T("ITERACIÓN 0 · ARRANQUE, UNA SOLA VEZ", (rx0 + rx1) / 2, Y_REGLA - 22, {
      fs: 11, a: "middle", fill: TAN, f: MONO, ls: "0.2em",
    }),
    ...COL_X.flatMap((x, i) => [
      `<line x1="${x}" y1="${Y_REGLA}" x2="${x}" y2="${Y_REGLA + 10}" stroke="${TAN}" stroke-width="2"/>`,
      T(SEMANAS[i], x, Y_REGLA + 28, { fs: 9, a: "middle", fill: GRIS, f: MONO, ls: "0.1em" }),
    ]),
  );

  // --- la elipse del ciclo: la Fase 4 no termina, se repite.
  fondo.push(
    `<ellipse cx="${ANILLO_CX}" cy="${ANILLO_CY}" rx="${RX}" ry="${RY}" fill="#fdfaf3" stroke="${TAN}" stroke-opacity="0.7" stroke-dasharray="9 6" stroke-width="1.6"/>`,
    T("MES 7 →", ANILLO_CX - RX + 40, ANILLO_CY - RY + 46, { fs: 9, fill: GRIS, f: MONO, ls: "0.1em" }),
    // El rótulo va en el corredor central, que es lo que el anillo deja libre.
    glifo("iteration", ANILLO_CX - 18, ANILLO_CY - 380, 36, TAN),
    T("FASE 4 · EL ESTADO PERMANENTE DEL PROYECTO", ANILLO_CX, ANILLO_CY - 320, {
      fs: 9, a: "middle", fill: TAN, f: MONO, ls: "0.14em",
    }),
    T("Ciclo de crecimiento", ANILLO_CX, ANILLO_CY - 280, { fs: 24, a: "middle", fill: MARRON, f: SERIF }),
    ...lineas(
      "Un incremento cada 3 a 5 meses: se construye, se verifica, se despliega, se muestra al caficultor, se mira hacia adentro y se publica.",
      10, 260,
    ).map((l, j) => T(l, ANILLO_CX, ANILLO_CY - 252 + j * 15, { fs: 10, a: "middle", fill: GRIS })),
    ...lineas(
      "Cinco incrementos —monitoreo, dron, riego, clima y multi dron—: entre 15 y 25 meses, y un lanzamiento por cada uno.",
      9.5, 260,
    ).map((l, j) => T(l, ANILLO_CX, ANILLO_CY - 177 + j * 14, { fs: 9.5, a: "middle", fill: TAN })),
  );

  // --- Fase 1: del arranque a la Constitución.
  const primera = (i: number) => c[COLUMNAS[i][2][0]];
  const ultima = (i: number) => c[COLUMNAS[i][2][COLUMNAS[i][2].length - 1]];
  cuerpo.push(hito("INICIO", 112, primera(0).cy));
  aristas.push(conector([[148, primera(0).cy], izq(primera(0))]));

  // --- dentro de una columna la cadena baja; entre columnas sube por el canal,
  // cargada con los Productos de Trabajo del traspaso.
  COLUMNAS.forEach(([, , ids], i) => {
    for (let k = 0; k < ids.length - 1; k++)
      if (!HUECO[ids[k + 1]])
        aristas.push(conector([abajo(c[ids[k]]), arriba(c[ids[k + 1]])]));
    if (i === COLUMNAS.length - 1) return;
    const x = CANAL_X[i], yBajo = ultima(i).y + ultima(i).h + 42, yAlto = Y_COL - 42;
    aristas.push(
      conector([abajo(ultima(i)), [COL_X[i], yBajo], [x, yBajo], [x, yAlto], [COL_X[i + 1], yAlto], arriba(primera(i + 1))]),
    );
    const salida = m.fases[i].salida;
    cuerpo.push(
      traspaso(salida, x, (yAlto + yBajo) / 2).svg,
      T(`FASE ${i + 1} → FASE ${i + 2}`, x, yAlto - 22, { fs: 8, a: "middle", fill: TAN, f: MONO, ls: "0.12em" }),
    );
  });

  // --- la puerta agronómica de la Fase 3.
  aristas.push(
    conector([abajo(c["t3-4"]), [COL_X[ULTIMA_COL], d3.cy - d3.h / 2]]),
    conector([[COL_X[ULTIMA_COL], d3.cy + d3.h / 2], arriba(c["t3-5"])]),
    // No: lo que el caficultor no valida no es un problema de código, es una regla
    // mal escrita: vuelve a la Constitución de la Fase 1.
    conector(
      [[d3.cx + d3.w / 2, d3.cy], [W - M - 30, d3.cy], [W - M - 30, 300], [COL_X[0] + 40, 300], [COL_X[0] + 40, primera(0).y]],
      "retorno",
    ),
  );
  cuerpo.push(d3.svg, rotulo("Sí", COL_X[ULTIMA_COL] + 34, d3.cy + 84), rotulo("No", W - M - 30, d3.cy - 60));

  // --- la puerta de salida del arranque.
  aristas.push(
    conector([abajo(ultima(ULTIMA_COL)), [COL_X[ULTIMA_COL], d0.cy - d0.h / 2]]),
    // No: la traza que no responde no se reintenta aquí — vuelve a la Fase 1, a
    // revisar la Constitución, las reglas y los contratos que la sostienen.
    conector(
      // Entra por la esquina de la columna, no por su centro: el rótulo de la Fase
      // vive justo ahí y una línea encima lo vuelve ilegible.
      [[d0.cx + d0.w / 2, d0.cy], [W - M, d0.cy], [W - M, 250], [COL_X[0] + 95, 250], [COL_X[0] + 95, primera(0).y]],
      "retorno",
    ),
    conector([[d0.cx, d0.cy + d0.h / 2], [d0.cx, ANILLO_CY - 660], [ANILLO_X[1], ANILLO_CY - 660], arriba(c["t4-1"])]),
  );
  cuerpo.push(
    d0.svg,
    rotulo("No", W - M - 40, d0.cy - 60),
    rotulo("Sí · R0", d0.cx + 60, ANILLO_CY - 666),
  );

  // --- el anillo: baja por la derecha, cruza por abajo y regresa por la izquierda.
  aristas.push(
    conector([abajo(c["t4-1"]), arriba(c["t4-2"])]),
    conector([abajo(c["t4-2"]), arriba(c["t4-3"])]),
    conector([abajo(c["t4-3"]), [ANILLO_X[1], d1.cy - d1.h / 2]]),
    // No: el incremento vuelve a construcción.
    conector([[d1.cx + d1.w / 2, d1.cy], [1660, d1.cy], [1660, c["t4-2"].cy], der(c["t4-2"])], "retorno"),
    // Sí: baja al campo, y el anillo vuelve por la fila de abajo.
    conector([[d1.cx, d1.cy + d1.h / 2], [ANILLO_X[1], c["t4-4"].cy], der(c["t4-4"])]),
    conector([izq(c["t4-4"]), [ANILLO_X[0], c["t4-4"].cy], abajo(c["t4-5"])]),
    conector([arriba(c["t4-5"]), abajo(c["t4-6"])]),
    conector([arriba(c["t4-6"]), abajo(c["t4-7"])]),
    conector([arriba(c["t4-7"]), abajo(c["t4-8"])]),
    conector([arriba(c["t4-8"]), abajo(c["t4-9"])]),
    conector([arriba(c["t4-9"]), [ANILLO_X[0], d2.cy + d2.h / 2]]),
    // No: el incremento que no cumple las especificaciones vuelve a la
    // sincronización, que es donde se decide qué se rehace y con qué prioridad.
    conector(
      [[d2.cx + d2.w / 2, d2.cy], [RETORNO_X, d2.cy], [RETORNO_X, c["t4-1"].cy], izq(c["t4-1"])],
      "retorno",
    ),
    // Sí: sale del ciclo y cierra el proceso.
    conector([[d2.cx - d2.w / 2, d2.cy], [200, d2.cy], [200, ANILLO_CY + RY + 80], [234, ANILLO_CY + RY + 80]]),
    // La retroalimentación del review: lo aprendido en campo reordena el backlog.
    conector(
      [der(c["t4-7"]), [CORREDOR_X, c["t4-7"].cy], [CORREDOR_X, c["t4-1"].cy], izq(c["t4-1"])],
      "feedback",
    ),
  );
  cuerpo.push(
    d1.svg, d2.svg,
    rotulo("No", 1660, d1.cy - 60),
    rotulo("Sí", d1.cx + 34, d1.cy + 90),
    rotulo("No", d2.cx + d2.w / 2 + 60, d2.cy - 12),
    rotulo("Sí", 200, ANILLO_CY + RY + 20),
    rotulo("retroalimentación al backlog", 1060, c["t4-7"].cy - 26, AZUL),
    // Un lanzamiento por incremento: la publicación es una Tarea del ciclo, y el
    // recuadro del pie solo dice en qué mes cae cada uno.
    rotulo("R1 → R5, uno por incremento", c["t4-9"].x - 160, c["t4-9"].cy, MARRON),
    hito("FIN", 270, ANILLO_CY + RY + 80),
  );

  // --- los paneles, al pie de la figura.
  const py0 = ANILLO_CY + RY + 170;

  // quién hace qué: cada Rol unido por una línea a las Tareas que ejecuta. El
  // código de la celda —T1.1, T2.6— es lo que ata la lista con la red.
  const roles = [...new Set(m.fases.flatMap((f) => f.roles))];
  const hardware = ["Ingeniero de plataforma", "Ingeniero de mecatrónica"];
  const todas = m.fases.flatMap((f) => f.tareas);
  const conPapel = (rol: string, papel: "perform" | "assist") =>
    todas.filter((t) => t.roles.some((r) => r.rol === rol && r.papel === papel)).map((t) => codigo(t.id));

  const px0 = M, filaH = 30, hQuien = 78 + roles.length * filaH + 10;
  const chip = (texto: string, x: number, y: number, ejecuta: boolean) =>
    `<rect x="${x}" y="${y - 11}" width="34" height="15" rx="3" fill="${ejecuta ? CREMA : PAPEL}" stroke="${TAN}"${ejecuta ? "" : ' stroke-dasharray="3 2"'}/>
${T(texto, x + 17, y, { fs: 7.5, a: "middle", f: MONO, w: ejecuta ? 600 : 400, fill: ejecuta ? MARRON : GRIS })}`;

  cuerpo.push(
    panel(
      "QUIÉN HACE QUÉ",
      "Cada Rol, unido a las Tareas de las que responde. Relleno: las ejecuta —y responde por sus Productos de Trabajo—. Contorno: asiste en ellas.",
      px0, py0, 1200, hQuien + 22,
    ),
    ...roles.flatMap((rol, i) => {
      const y = py0 + 90 + i * filaH;
      const esHw = hardware.includes(rol);
      const ejecuta = conPapel(rol, "perform");
      const asiste = conPapel(rol, "assist");
      // Un Rol sin Tareas propias deja su nota, y los chips de asistencia arrancan
      // después de ella: el hueco es un hallazgo del modelo, no un error de dibujo.
      let cx = px0 + (ejecuta.length ? 268 : 458);
      const chips = [
        ...ejecuta.map((t) => chip(t, (cx += 38) - 38, y, true)),
        ...(asiste.length ? [T("asiste:", (cx += 44) - 40, y, { fs: 7.5, fill: GRIS, f: MONO })] : []),
        ...asiste.map((t) => chip(t, (cx += 38) - 38, y, false)),
      ];
      return [
        gRol(px0 + 22, y - 18),
        T(rol, px0 + 58, y, { fs: 8.5, fill: esHw ? AZUL : MARRON, w: esHw ? 600 : 400 }),
        // La línea que une al Rol con su trabajo: sin ella el panel solo enumera.
        `<line x1="${px0 + 246}" y1="${y - 4}" x2="${px0 + 264}" y2="${y - 4}" stroke="${TAN}" stroke-opacity="0.7"/>`,
        ejecuta.length ? "" : T("no ejecuta ninguna Tarea, solo asiste", px0 + 268, y, { fs: 8, fill: AZUL }),
        ...chips,
      ];
    }),
    T("en azul, el equipo de hardware", px0 + 22, py0 + 84 + roles.length * filaH, { fs: 8.5, fill: AZUL }),
  );

  // el plan de releases, al lado.
  const rx = 1310, rw = W - M - rx;
  cuerpo.push(
    panel("PLAN DE RELEASES", "Un lanzamiento por incremento, con su mes de proyecto y su criterio. El R0 no es un incremento: cierra el arranque.", rx, py0, rw, 96 + RELEASES.length * 40),
    ...RELEASES.flatMap(([id, semana, que, criterio], i) => {
      const y = py0 + 108 + i * 40;
      return [
        `<path d="M${rx + 30} ${y - 4} l10 10 -10 10 -10 -10 z" fill="${CREMA}" stroke="${MARRON}"/>`,
        T(id, rx + 54, y + 2, { fs: 10, w: 600, fill: MARRON, f: MONO }),
        T(semana, rx + 94, y + 2, { fs: 9, fill: GRIS, f: MONO }),
        T(que, rx + 162, y + 2, { fs: 9.5, fill: TINTA, w: 600 }),
        T(criterio, rx + 162, y + 14, { fs: 8.5, fill: GRIS }),
      ];
    }),
  );

  // la cadena SDD y lo que el proceso entrega, en la fila de abajo.
  const py1 = py0 + Math.max(hQuien + 22, 96 + RELEASES.length * 40) + 40;
  cuerpo.push(
    panel(
      "SPEC-DRIVEN DEVELOPMENT",
      "La especificación manda sobre el código: cada eslabón nace del anterior, y el código es el último, nunca el primero.",
      M, py1, 900, 150,
    ),
    ...CADENA_SDD.flatMap((paso, i) => {
      const x = M + 22 + i * 140;
      return [
        `<rect x="${x}" y="${py1 + 96}" width="118" height="30" rx="6" fill="${CREMA}" stroke="${TAN}"/>`,
        T(paso, x + 59, py1 + 115, { fs: 9, a: "middle", fill: MARRON, w: 600, f: MONO }),
        i < CADENA_SDD.length - 1
          ? `<path d="M${x + 120} ${py1 + 111} h14" stroke="${GRIS}" marker-end="url(#punta)"/>`
          : "",
      ];
    }),
    panel("EL PROCESO ENTREGA", "Los Productos de Trabajo que salen del ciclo, con dueño y Fase de origen.", 1010, py1, W - M - 1010, 62 + Math.ceil(ciclo.salida.length / 2) * 42),
    ...ciclo.salida.flatMap((p, i) => {
      const x = 1032 + (i % 2) * 520;
      const y = py1 + 62 + Math.floor(i / 2) * 42;
      return [
        gProducto(p, x, y),
        ...lineas(p.texto, 8.5, 440).map((l, j) => T(l, x + 32, y + 12 + j * 10, { fs: 8.5, fill: MARRON })),
      ];
    }),
  );

  // --- leyenda, en dos filas: la figura ya no tiene ancho para una sola.
  const ly = py1 + Math.max(150, 62 + Math.ceil(ciclo.salida.length / 2) * 42) + 60;
  const formas: [string, string][] = [
    [contorno("task", 0, 0, 44, 20), "Tarea"],
    [contorno("milestone", 0, 0, 44, 20), "Hito"],
    [contorno("activity", 0, 0, 44, 20), "Actividad / Proceso"],
  ];
  cuerpo.push(
    `<line x1="${M}" y1="${ly}" x2="${W - M}" y2="${ly}" stroke="${REGLA}"/>`,
    eyebrow("LEYENDA SPEM 2.0", M, ly + 26, GRIS, 9),
    ...formas.flatMap(([d, nombre], i) => {
      const x = 250 + i * 200;
      return [
        `<path d="${d}" transform="translate(${x} ${ly + 12})" fill="${CREMA}" stroke="${TAN}"/>`,
        T(nombre, x + 54, ly + 26, { fs: 9, fill: GRIS }),
      ];
    }),
    `<path d="M880 ${ly + 12} l24 10 -24 10 -24 -10 z" fill="${PAPEL}" stroke="${AZUL}"/>`,
    T("Decisión", 918, ly + 26, { fs: 9, fill: GRIS }),
    gRol(1050, ly + 6),
    T("Rol — en negrita, quien ejecuta la Tarea y responde por sus Productos de Trabajo", 1084, ly + 26, { fs: 9, fill: GRIS }),
    gProducto({ texto: "", icono: "workProduct" }, 250, ly + 44),
    T("Producto de Trabajo — debajo de quien lo produce", 284, ly + 64, { fs: 9, fill: GRIS }),
    `<path d="M700 ${ly + 60} h44" stroke="${GRIS}" stroke-dasharray="5 4"/>`,
    T("Retorno: el trabajo se rehace", 752, ly + 64, { fs: 9, fill: GRIS }),
    `<path d="M1050 ${ly + 60} h44" stroke="${AZUL}" stroke-width="1.4" stroke-dasharray="2 5" stroke-linecap="round"/>`,
    T("Retroalimentación: lo aprendido reordena el backlog", 1102, ly + 64, { fs: 9, fill: GRIS }),
  );

  const H = ly + 104;
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="cons-t cons-d" xmlns="http://www.w3.org/2000/svg">
<title id="cons-t">Modelo de procesos consolidado — riego autónomo guiado por drones</title>
<desc id="cons-d">${esc("Las veintinueve Tareas de las cinco Fases en una sola red SPEM 2.0, en composición vertical: cada Fase es una columna que se lee hacia abajo, y las Fases se suceden hacia la derecha, con los Productos de Trabajo del traspaso sobre el canal que las une. Cada celda lleva sus Roles arriba —en negrita el que ejecuta la Tarea y responde por sus artefactos—, la Tarea al centro y sus Productos de Trabajo abajo. Las Fases 1 a 3 son la Iteración 0 de arranque; la Fase 4 se repite dentro de la elipse una vez por incremento, cada tres a cinco meses, con review del incremento con el caficultor y retroalimentación al backlog. La figura incluye regla de tiempo —semanas en el arranque, meses en el ciclo—, plan de releases R0 a R3 y la cadena de Spec-Driven Development.")}</desc>
${PUNTA}
<defs><marker id="punta-azul" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="${AZUL}"/></marker></defs>
<rect width="100%" height="100%" fill="${PAPEL}"/>
${eyebrow("MODELO DE PROCESOS — SPEM 2.0 · SPEC-DRIVEN DEVELOPMENT", M, 62, GRIS, 10)}
${T("El modelo de procesos consolidado", M, 108, { fs: 34, f: SERIF, fill: TINTA })}
${T("Sistema ciberfísico de riego autónomo guiado por drones para caficultura — cinco Fases, veintinueve Tareas y ocho Roles en una sola red.", M, 134, { fs: 12, fill: GRIS })}
${T("Cada Fase es una columna: el tiempo baja dentro de ella y avanza hacia la derecha entre Fases. En cada celda, el Rol en negrita ejecuta la Tarea y responde por los Productos de Trabajo que salen de ella.", M, 154, { fs: 11, fill: GRIS })}
${fondo.join("\n")}
${aristas.join("\n")}
${cuerpo.join("\n")}
${Object.values(c).map((n) => n.svg).join("\n")}
</svg>`;
}
