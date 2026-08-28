/**
 * El proceso completo en una sola figura, en dos versiones para escoger:
 *
 *   A. `figuras/general-a-cadena-de-fases.png`
 *      Las cuatro Fases encadenadas: Roles y Tareas de cada una, y entre Fase y
 *      Fase los Productos de Trabajo que se traspasan.
 *   B. `figuras/general-b-carriles-por-rol.png`
 *      Carriles: una fila por Rol, una columna por Fase, cada Tarea en el carril
 *      de quien la ejecuta y en el de quien asiste.
 *
 * Las figuras las escribe `scripts/general.tsx` (`npm run general`).
 */
import { wrap } from "./layout";
import type { Fase, Modelo, Producto, Tarea } from "./modelo";
import {
  CREMA, esc, FORMA, gProducto, gRol, GRIS, leyendaEPF, MARRON, MONO,
  NOMBRE_TIPO, PAPEL, PUNTA, REGLA, SERIF, T, TAN, TINTA,
} from "./epf-svg";

const lineas = (texto: string, fs: number, w: number) => wrap(texto, fs, w);
const eyebrow = (t: string, x: number, y: number) =>
  T(t, x, y, { fs: 8, fill: GRIS, f: MONO, ls: "0.14em" });

/** El Rol que ejecuta la Tarea; puede haber más de uno. */
const ejecutan = (t: Tarea) => t.roles.filter((r) => r.papel === "perform").map((r) => r.rol);
const asisten = (t: Tarea) => t.roles.filter((r) => r.papel === "assist").map((r) => r.rol);

/** Todos los Roles del modelo, sin repetir, en el orden en que aparecen. */
const rolesDelModelo = (m: Modelo) => [...new Set(m.fases.flatMap((f) => f.roles))];

/** Lo que la Fase entrega y la siguiente consume: el traspaso entre las dos. */
const traspaso = (a: Fase, b: Fase) =>
  a.salida.filter((p) => b.entrada.some((q) => q.texto === p.texto));

const cabecera = (titulo: string, bajada: string, subtitulo: string, x: number) =>
  [
    eyebrow("MODELO DE PROCESOS — SPEM 2.0", x, 44),
    T(titulo, x, 82, { fs: 28, f: SERIF, fill: TINTA }),
    T(bajada, x, 106, { fs: 11, fill: GRIS }),
    T(subtitulo, x, 124, { fs: 10, fill: GRIS }),
  ].join("\n");

const envoltura = (id: string, titulo: string, desc: string, w: number, h: number, cuerpo: string) =>
  `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="${id}-t ${id}-d" xmlns="http://www.w3.org/2000/svg">
<title id="${id}-t">${esc(titulo)}</title>
<desc id="${id}-d">${esc(desc)}</desc>
${PUNTA}
<rect width="100%" height="100%" fill="${PAPEL}"/>
${cuerpo}
</svg>`;

// =============================================================== Versión A
// Las cuatro Fases apiladas, cada una con sus Roles a la izquierda y sus Tareas
// a la derecha; entre dos Fases, la banda de Productos de Trabajo del traspaso.
const A_W = 1400, A_M = 48, A_CONT = A_W - A_M * 2;
const A_PAD = 24, A_ROL_W = 236, A_GAP = 20;
const A_TAREA_X = A_M + A_PAD + A_ROL_W + 32;
const A_TAREA_W = Math.floor((A_M + A_CONT - A_PAD - A_TAREA_X - A_GAP) / 2);

/** Quién ejecuta y quién asiste, la línea que hace legible la Tarea fuera de su Fase. */
const quienA = (t: Tarea) =>
  [
    ejecutan(t).length ? `ejecuta: ${ejecutan(t).join(", ")}` : "",
    asisten(t).length ? `asiste: ${asisten(t).join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("  ·  ");

const lineasQuienA = (t: Tarea) =>
  quienA(t) ? lineas(quienA(t), 8.5, A_TAREA_W - 96).slice(0, 3) : [];

const altoTareaA = (t: Tarea) =>
  Math.max(
    72,
    20 + lineas(t.nombre, 12, A_TAREA_W - 96).length * 15 + lineasQuienA(t).length * 11 + 26,
  );
const altoRolA = (rol: string) => Math.max(32, lineas(rol, 9.5, A_ROL_W - 40).length * 12 + 12);

/** Una Tarea de la versión A: forma según su Tipo SPEM, nombre y quién la ejecuta. */
function tareaA(t: Tarea, x: number, y: number) {
  const h = altoTareaA(t);
  const forma = FORMA[t.icono] ?? "chevron";
  const p = 22, w = A_TAREA_W;
  const caja =
    forma === "chevron"
      ? `<path d="M${x} ${y} H${x + w - p} L${x + w} ${y + h / 2} L${x + w - p} ${y + h} H${x} Z" fill="${CREMA}" stroke="${TAN}" stroke-width="1.2"/>`
      : forma === "diamante"
        ? `<path d="M${x} ${y + h / 2} L${x + 34} ${y} H${x + w - 34} L${x + w} ${y + h / 2} L${x + w - 34} ${y + h} H${x + 34} Z" fill="${CREMA}" stroke="${TAN}" stroke-width="1.2"/>`
        : `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${CREMA}" stroke="${TAN}" stroke-width="1.2"/>`;
  const nombre = lineas(t.nombre, 12, w - 96);
  return {
    h,
    svg: [
      caja,
      T(`<<${NOMBRE_TIPO[t.icono] ?? "Tarea"}>>`, x + 40, y + 20, { fs: 8, fill: GRIS, f: MONO }),
      ...nombre.map((l, j) => T(l, x + 40, y + 38 + j * 15, { fs: 12, w: 600, fill: MARRON })),
      ...lineasQuienA(t).map((l, j) =>
        T(l, x + 40, y + 44 + nombre.length * 15 + j * 11, { fs: 8.5, fill: GRIS, f: MONO }),
      ),
    ].join("\n"),
  };
}

/** La banda de Productos de Trabajo: la Entrada del proceso, un traspaso o la Salida. */
function bandaA(titulo: string, productos: Producto[], y: number) {
  const n = productos.length || 1;
  const anchoItem = Math.floor((A_CONT - 32) / n);
  const filas = productos.map((p) => lineas(p.texto, 9, anchoItem - 42).length);
  const h = 46 + Math.max(1, ...filas, 1) * 12;
  const svg = [
    `<rect x="${A_M}" y="${y}" width="${A_CONT}" height="${h}" rx="8" fill="#faf7f0" stroke="${REGLA}"/>`,
    eyebrow(titulo, A_M + 16, y + 20),
    ...productos.flatMap((p, i) => {
      const x = A_M + 16 + i * anchoItem;
      return [
        gProducto(p, x, y + 28),
        ...lineas(p.texto, 9, anchoItem - 42).map((l, j) =>
          T(l, x + 32, y + 40 + j * 12, { fs: 9, fill: MARRON }),
        ),
      ];
    }),
  ].join("\n");
  return { h, svg };
}

const flechaAbajo = (x: number, y1: number, y2: number) =>
  `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${GRIS}" stroke-width="1.2" marker-end="url(#punta)"/>`;

export function versionA(m: Modelo) {
  const cuerpo: string[] = [];
  const centro = A_M + A_CONT / 2;
  let y = 156;

  const entrada = bandaA("ENTRADA DEL PROCESO", m.fases[0].entrada, y);
  cuerpo.push(entrada.svg);
  y += entrada.h;

  m.fases.forEach((fase, i) => {
    cuerpo.push(flechaAbajo(centro, y + 4, y + 28));
    y += 32;

    // Altura de la tarjeta: la mayor de sus dos columnas.
    const encabezado = 34 + lineas(fase.objetivo, 10, A_CONT - A_PAD * 2).length * 13 + 16;
    const hRoles = fase.roles.reduce((h, r) => h + altoRolA(r) + 8, 0) - 8;
    const alturas = fase.tareas.map(altoTareaA);
    const columnas = [0, 0]; // la Tarea entra en la columna más corta: quedan parejas
    const puestas = alturas.map((h) => {
      const c = columnas[0] <= columnas[1] ? 0 : 1;
      const top = columnas[c];
      columnas[c] += h + A_GAP;
      return { c, top };
    });
    const hTareas = Math.max(...columnas) - A_GAP;
    const hCuerpo = Math.max(hRoles, hTareas);
    const hCard = encabezado + hCuerpo + A_PAD;

    cuerpo.push(
      `<rect x="${A_M}" y="${y}" width="${A_CONT}" height="${hCard}" rx="10" fill="${PAPEL}" stroke="${TAN}" stroke-width="1.4"/>`,
      `<rect x="${A_M}" y="${y}" width="${A_CONT}" height="4" rx="2" fill="${TAN}"/>`,
      eyebrow(fase.nombre.split(":")[0].toUpperCase(), A_M + A_PAD, y + 26),
      T(fase.nombre.split(": ")[1] ?? fase.nombre, A_M + A_PAD + 92, y + 28, {
        fs: 17, f: SERIF, fill: TINTA,
      }),
      ...lineas(fase.objetivo, 10, A_CONT - A_PAD * 2).map((l, j) =>
        T(l, A_M + A_PAD, y + 46 + j * 13, { fs: 10, fill: GRIS }),
      ),
      eyebrow("ROLES", A_M + A_PAD, y + encabezado - 4),
      eyebrow("TAREAS", A_TAREA_X, y + encabezado - 4),
    );

    let ry = y + encabezado + 10;
    for (const rol of fase.roles) {
      const ls = lineas(rol, 9.5, A_ROL_W - 40);
      const h = altoRolA(rol);
      cuerpo.push(
        gRol(A_M + A_PAD, ry + h / 2 - 14),
        ...ls.map((l, j) =>
          T(l, A_M + A_PAD + 34, ry + h / 2 - (ls.length - 1) * 6 + j * 12 + 3, {
            fs: 9.5, fill: MARRON,
          }),
        ),
      );
      ry += h + 8;
    }

    const base = y + encabezado + 10;
    fase.tareas.forEach((t, k) => {
      const { c, top } = puestas[k];
      cuerpo.push(tareaA(t, A_TAREA_X + c * (A_TAREA_W + A_GAP), base + top).svg);
    });

    y += hCard;

    const siguiente = m.fases[i + 1];
    if (siguiente) {
      cuerpo.push(flechaAbajo(centro, y + 4, y + 28));
      y += 32;
      const banda = bandaA(
        `TRASPASO — ${fase.nombre.split(":")[0].toUpperCase()} → ${siguiente.nombre.split(":")[0].toUpperCase()}`,
        traspaso(fase, siguiente),
        y,
      );
      cuerpo.push(banda.svg);
      y += banda.h;
    }
  });

  cuerpo.push(flechaAbajo(centro, y + 4, y + 28));
  y += 32;
  const salida = bandaA("SALIDA DEL PROCESO", m.fases[m.fases.length - 1].salida, y);
  cuerpo.push(salida.svg);
  y += salida.h;

  cuerpo.push(leyendaEPF(A_M, y + 24, A_CONT, 260));
  const h = y + 96;
  return envoltura(
    "general-a",
    "Modelo de procesos — el proceso completo",
    "Las cuatro Fases encadenadas, con sus Roles, sus Tareas y los Productos de Trabajo que se traspasan de una Fase a la siguiente.",
    A_W,
    h,
    cabecera(
      "El proceso completo",
      "Sistema de riego autónomo guiado por drones para caficultura — las cuatro Fases de extremo a extremo.",
      "Cada Fase con sus Roles y sus Tareas; entre Fase y Fase, los Productos de Trabajo del traspaso.",
      A_M,
    ) + "\n" + cuerpo.join("\n"),
  );
}

// =============================================================== Versión B
// Carriles: una fila por Rol, una columna por Fase. La misma Tarea aparece en el
// carril de quien la ejecuta y en el de quien asiste, distinguidas por el trazo.
const B_M = 48, B_LANE_W = 250, B_COL_W = 372;
const B_W = B_M * 2 + B_LANE_W + B_COL_W * 4;
const B_CHIP_W = B_COL_W - 24;

const altoChipB = (t: Tarea) =>
  Math.max(34, lineas(t.nombre, 9.5, B_CHIP_W - 26).length * 12 + 20);

function chipB(t: Tarea, papel: "perform" | "assist", x: number, y: number) {
  const h = altoChipB(t);
  const ls = lineas(t.nombre, 9.5, B_CHIP_W - 26);
  const ejecuta = papel === "perform";
  return [
    `<rect x="${x}" y="${y}" width="${B_CHIP_W}" height="${h}" rx="6" fill="${ejecuta ? CREMA : PAPEL}" stroke="${TAN}" stroke-width="${ejecuta ? 1.2 : 1}"${ejecuta ? "" : ' stroke-dasharray="4 3"'}/>`,
    T(ejecuta ? "«performs, primary»" : "«assists»", x + 12, y + 14, {
      fs: 7.5, fill: GRIS, f: MONO,
    }),
    ...ls.map((l, j) => T(l, x + 12, y + 26 + j * 12, { fs: 9.5, w: ejecuta ? 600 : 400, fill: MARRON })),
  ].join("\n");
}

export function versionB(m: Modelo) {
  const cuerpo: string[] = [];
  const roles = rolesDelModelo(m);
  const y0 = 196;

  // --- cabecera de columnas: una por Fase, encadenadas.
  m.fases.forEach((f, i) => {
    const x = B_M + B_LANE_W + i * B_COL_W;
    cuerpo.push(
      `<rect x="${x}" y="${y0 - 46}" width="${B_COL_W - 8}" height="40" rx="6" fill="#faf7f0" stroke="${TAN}"/>`,
      eyebrow(f.nombre.split(":")[0].toUpperCase(), x + 14, y0 - 30),
      ...lineas(f.nombre.split(": ")[1] ?? f.nombre, 10.5, B_COL_W - 40)
        .slice(0, 1)
        .map((l) => T(l, x + 14, y0 - 14, { fs: 10.5, w: 600, fill: TINTA })),
    );
    if (i < m.fases.length - 1)
      cuerpo.push(
        `<line x1="${x + B_COL_W - 8}" y1="${y0 - 26}" x2="${x + B_COL_W}" y2="${y0 - 26}" stroke="${GRIS}" marker-end="url(#punta)"/>`,
      );
  });
  cuerpo.push(eyebrow("ROLES", B_M, y0 - 30));

  // --- un carril por Rol; la altura de la fila la fija la columna más cargada.
  let y = y0;
  roles.forEach((rol, fila) => {
    const celdas = m.fases.map((f) =>
      f.tareas.flatMap((t) => {
        const r = t.roles.find((x) => x.rol === rol);
        return r ? [{ t, papel: r.papel }] : [];
      }),
    );
    const alto = Math.max(
      56,
      ...celdas.map((c) => c.reduce((h, { t }) => h + altoChipB(t) + 8, 0) + 8),
    );
    if (fila % 2 === 0)
      cuerpo.push(
        `<rect x="${B_M}" y="${y}" width="${B_W - B_M * 2}" height="${alto}" fill="#fbfaf7"/>`,
      );
    cuerpo.push(
      `<line x1="${B_M}" y1="${y}" x2="${B_W - B_M}" y2="${y}" stroke="${REGLA}"/>`,
    );

    const ls = lineas(rol, 10, B_LANE_W - 44);
    cuerpo.push(
      gRol(B_M, y + 14),
      ...ls.map((l, j) => T(l, B_M + 34, y + 24 + j * 12, { fs: 10, w: 600, fill: MARRON })),
    );

    celdas.forEach((celda, i) => {
      let cy = y + 8;
      for (const { t, papel } of celda) {
        cuerpo.push(chipB(t, papel, B_M + B_LANE_W + i * B_COL_W, cy));
        cy += altoChipB(t) + 8;
      }
    });
    y += alto;
  });
  cuerpo.push(`<line x1="${B_M}" y1="${y}" x2="${B_W - B_M}" y2="${y}" stroke="${REGLA}"/>`);

  // --- carril de cierre: lo que cada Fase deja construido.
  const productos = m.fases.map((f) => f.salida);
  const altoProd =
    Math.max(
      56,
      ...productos.map(
        (ps) =>
          ps.reduce(
            (h, p) => h + Math.max(30, lineas(p.texto, 9, B_CHIP_W - 44).length * 12 + 14) + 6,
            0,
          ) + 12,
      ),
    );
  cuerpo.push(
    `<rect x="${B_M}" y="${y}" width="${B_W - B_M * 2}" height="${altoProd}" fill="#faf7f0"/>`,
    `<line x1="${B_M}" y1="${y}" x2="${B_W - B_M}" y2="${y}" stroke="${TAN}"/>`,
    eyebrow("PRODUCTOS DE TRABAJO", B_M, y + 24),
    T("Lo que cada Fase deja construido.", B_M, y + 40, { fs: 9, fill: GRIS }),
  );
  productos.forEach((ps, i) => {
    let py = y + 10;
    for (const p of ps) {
      const ls = lineas(p.texto, 9, B_CHIP_W - 44);
      const h = Math.max(30, ls.length * 12 + 14);
      const x = B_M + B_LANE_W + i * B_COL_W;
      cuerpo.push(
        gProducto(p, x, py + h / 2 - 14),
        ...ls.map((l, j) =>
          T(l, x + 32, py + h / 2 - (ls.length - 1) * 6 + j * 12 + 3, { fs: 9, fill: MARRON }),
        ),
      );
      py += h + 6;
    }
  });
  y += altoProd;
  cuerpo.push(`<line x1="${B_M}" y1="${y}" x2="${B_W - B_M}" y2="${y}" stroke="${REGLA}"/>`);

  // --- separadores verticales entre Fases.
  for (let i = 1; i < m.fases.length; i++) {
    const x = B_M + B_LANE_W + i * B_COL_W - 8;
    cuerpo.push(`<line x1="${x}" y1="${y0 - 50}" x2="${x}" y2="${y}" stroke="${REGLA}"/>`);
  }
  cuerpo.push(
    `<line x1="${B_M + B_LANE_W - 12}" y1="${y0 - 50}" x2="${B_M + B_LANE_W - 12}" y2="${y}" stroke="${REGLA}"/>`,
  );

  // --- leyenda propia: aquí lo que se distingue es el papel, no el Tipo SPEM.
  const ly = y + 30;
  cuerpo.push(
    `<line x1="${B_M}" y1="${ly}" x2="${B_W - B_M}" y2="${ly}" stroke="${REGLA}"/>`,
    eyebrow("LEYENDA SPEM 2.0", B_M, ly + 22),
    `<rect x="${B_M + 200}" y="${ly + 10}" width="26" height="16" rx="4" fill="${CREMA}" stroke="${TAN}" stroke-width="1.2"/>`,
    T("«performs, primary» — el Rol ejecuta la Tarea", B_M + 236, ly + 23, { fs: 9, fill: GRIS }),
    `<rect x="${B_M + 560}" y="${ly + 10}" width="26" height="16" rx="4" fill="${PAPEL}" stroke="${TAN}" stroke-dasharray="4 3"/>`,
    T("«assists» — el Rol asiste en la Tarea", B_M + 596, ly + 23, { fs: 9, fill: GRIS }),
    T(
      "Una Tarea aparece en tantos carriles como Roles la tocan; su columna dice en qué Fase ocurre.",
      B_M + 900,
      ly + 23,
      { fs: 9, fill: GRIS },
    ),
    // Segunda fila: los glifos del carril de Productos de Trabajo.
    ...[
      [{ texto: "", icono: "workProduct" } as Producto, "Producto de Trabajo"],
      [{ texto: "", icono: "metric" } as Producto, "Guía / Métrica"],
      [{ texto: "", icono: "tool" } as Producto, "Herramienta"],
    ].flatMap(([p, nombre], i) => {
      const x = B_M + 200 + i * 360;
      return [
        gProducto(p as Producto, x, ly + 38),
        T(nombre as string, x + 34, ly + 55, { fs: 9, fill: GRIS }),
      ];
    }),
  );

  const h = ly + 104;
  return envoltura(
    "general-b",
    "Modelo de procesos — participación por Rol",
    "Una fila por Rol y una columna por Fase; cada Tarea en el carril de quien la ejecuta y en el de quien asiste.",
    B_W,
    h,
    cabecera(
      "Participación de todo el equipo",
      "Sistema de riego autónomo guiado por drones para caficultura — las cuatro Fases y los siete Roles.",
      "Una fila por Rol, una columna por Fase: cada Tarea aparece en el carril de quien la ejecuta y de quien asiste.",
      B_M,
    ) + "\n" + cuerpo.join("\n"),
  );
}
