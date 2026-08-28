import { ETIQUETAS, IDS_ICONO, type IdIcono } from "./iconos";
import type { Fase, Producto, Vista } from "./modelo";
import { NOMBRE_VISTA } from "./modelo";

export type Nodo = {
  id: string;
  lineas: string[];
  descripcion: string[];
  x: number;
  y: number;
  w: number;
  h: number;
  icono: IdIcono;
  iconoX: number;
  iconoY: number;
  textoX: number;
};

export type Flecha = {
  d: string;
  tipo: "consume" | "flujo" | "produce" | "include";
  /**
   * The OMG SPEM 2.0 stereotype this edge carries, positioned by the layout and
   * only written by the renderer. Absent on edges that carry none.
   */
  etiqueta?: { texto: string; x: number; y: number };
};

export type DiagramLayout = {
  width: number;
  height: number;
  titulo: {
    nombre: string;
    /** The name of the Vista, set flush right on the title's own line. */
    subtitulo: string;
    subtituloX: number;
    objetivo: string[];
    x: number;
    y: number;
    iconoX: number;
    iconoY: number;
  };
  chips: {
    texto: string;
    x: number;
    y: number;
    w: number;
    h: number;
    iconoX: number;
    textoX: number;
  }[];
  paneles: {
    tipo: "entrada" | "salida";
    x: number;
    y: number;
    w: number;
    h: number;
    items: {
      lineas: string[];
      /** Relative to the panel's own y, as is `iconoDy`. */
      y: number;
      icono: IdIcono;
      iconoX: number;
      iconoDy: number;
      textoX: number;
    }[];
  }[];
  nodos: Nodo[];
  /**
   * Rol y Producto de Trabajo dibujados como EPF Composer los dibuja: glifo y
   * texto, sin caja. Solo la Vista Detalle EPF los usa. Ver ADR-0008.
   */
  sueltos: {
    lineas: string[];
    icono: IdIcono;
    x: number;
    y: number;
    iconoY: number;
    textoX: number;
  }[];
  flechas: Flecha[];
  /**
   * Decodes the glyphs the figure actually uses. ADR-0005 ruled the legend out
   * back when a single type of node existed; fifteen types retire that premise.
   */
  leyenda: {
    x: number;
    y: number;
    w: number;
    h: number;
    reglaY: number;
    entradas: {
      icono: IdIcono;
      texto: string;
      x: number;
      y: number;
      textoX: number;
    }[];
  };
};

/** The five stereotypes the four Vistas emit, in the OMG normative spelling. */
export const ESTEREOTIPOS = {
  perform: "«performs, primary»",
  assist: "«assists»",
  include: "«include»",
  entrada: "«input, mandatory»",
  salida: "«output, mandatory»",
} as const;

// Geometry constants. Every number the SVG draws comes from here.
const PAD = 44;
const PANEL_W = 248;
const NODE_W = 340;
const GAP_X = 76;
const GAP_Y = 24;
const NODE_PAD = 16;
const PANEL_PAD = 16;
const CHIP_PAD = 12;
const CHIP_H = 24;
const CHIP_GAP = 8;
const RAMA = 96; // horizontal offset of a Descomposición child from its root

// Icon channel: the glyph box plus the gap before the text it labels.
const ICONO_TITULO = 26;
const ICONO_CHIP = 12;
const ICONO_NODO = 16;
const ICONO_ITEM = 12;
const ICONO_GAP = 8;
const ICONO_GAP_CHIP = 6;
const ICONO_GAP_ITEM = 6;
const ICONO_LEYENDA = 14;
const ICONO_GAP_LEYENDA = 6;
const LEYENDA_SEP = 36; // gap between the last row of content and the rule
const LEYENDA_FILA = 22;
const LEYENDA_GAP = 24;

const FS_TITULO = 32;
const FS_OBJETIVO = 16;
const FS_NODO = 16;
const FS_DESC = 12;
const FS_ITEM = 12;
const FS_CHIP = 12;
const FS_LEYENDA = 12;
const FS_ETIQUETA = 11;

const LH = 1.35;
// The style guide wants every coordinate on a 4px grid, so line heights snap to it.
const cuadricula = (n: number) => Math.round(n / 4) * 4;
const line = (fs: number) => cuadricula(fs * LH);
const RADIO = 8; // quarter-arc radius of every connector bend

/** The renderer draws with these; it computes no geometry of its own. */
export const ESCALA = {
  titulo: { fs: FS_TITULO, lh: line(FS_TITULO) },
  objetivo: { fs: FS_OBJETIVO, lh: line(FS_OBJETIVO) },
  nodo: { fs: FS_NODO, lh: line(FS_NODO), pad: NODE_PAD, separacion: 6 },
  desc: { fs: FS_DESC, lh: line(FS_DESC) },
  item: { fs: FS_ITEM, lh: line(FS_ITEM), pad: PANEL_PAD },
  leyenda: { fs: FS_LEYENDA, fila: LEYENDA_FILA },
  etiqueta: { fs: FS_ETIQUETA },
  icono: {
    titulo: ICONO_TITULO,
    chip: ICONO_CHIP,
    nodo: ICONO_NODO,
    item: ICONO_ITEM,
    leyenda: ICONO_LEYENDA,
  },
} as const;

// Character-width approximation — keeps layout pure (no DOM measurement).
const textWidth = (texto: string, fs: number) => texto.length * fs * 0.53;

export function wrap(texto: string, fs: number, maxW: number): string[] {
  const palabras = texto.split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return [""];
  const lineas: string[] = [];
  let actual = palabras[0];
  for (const palabra of palabras.slice(1)) {
    const intento = `${actual} ${palabra}`;
    if (textWidth(intento, fs) <= maxW) actual = intento;
    else {
      lineas.push(actual);
      actual = palabra;
    }
  }
  lineas.push(actual);
  return lineas;
}

/** One box of text with its glyph channel — a Tarea, a Rol or a Producto. */
function caja(
  id: string,
  nombre: string,
  descripcion: string | undefined,
  icono: IdIcono,
  x: number,
  y: number,
  w: number,
): Nodo {
  const canal = ICONO_NODO + ICONO_GAP;
  const textW = w - NODE_PAD * 2 - canal;
  const lineas = wrap(nombre, FS_NODO, textW);
  const desc = descripcion ? wrap(descripcion, FS_DESC, textW) : [];
  const h = cuadricula(
    NODE_PAD * 2 +
      lineas.length * line(FS_NODO) +
      (desc.length ? 8 + desc.length * line(FS_DESC) : 0),
  );
  return {
    id,
    lineas,
    descripcion: desc,
    x,
    y,
    w,
    h,
    icono,
    iconoX: x + NODE_PAD,
    // Sits on the first line of the name, not on the top edge of the box.
    iconoY: y + NODE_PAD + cuadricula((line(FS_NODO) - ICONO_NODO) / 2),
    textoX: x + NODE_PAD + canal,
  };
}

/**
 * Rounded right-angle elbow: out, turn, across, turn, in. Never a diagonal.
 *
 * `giro` places the vertical run. Two elbows that share a channel and take the
 * default midpoint lie on top of each other, which in a view with eleven edges
 * merges them into one unreadable spine, so the caller staggers them.
 */
const codo = (x1: number, y1: number, x2: number, y2: number, giro?: number) => {
  if (Math.abs(y2 - y1) < RADIO * 2) return `M ${x1} ${y1} L ${x2} ${y1}`;
  const mx = giro === undefined ? cuadricula((x1 + x2) / 2) : cuadricula(giro);
  const baja = y2 > y1 ? 1 : -1;
  const a = `A ${RADIO} ${RADIO} 0 0 ${baja > 0 ? 1 : 0} ${mx} ${y1 + RADIO * baja}`;
  const b = `A ${RADIO} ${RADIO} 0 0 ${baja > 0 ? 0 : 1} ${mx + RADIO} ${y2}`;
  return [
    `M ${x1} ${y1}`,
    `L ${mx - RADIO} ${y1}`,
    a,
    `L ${mx} ${y2 - RADIO * baja}`,
    b,
    `L ${x2} ${y2}`,
  ].join(" ");
};

/**
 * Horizontal run, one quarter-arc, then vertical run: the edge enters the top or
 * the bottom edge of a node instead of its side. The Detalle EPF view routes its
 * Entradas and Salidas this way, which is what keeps them off the Tarea's body.
 */
const codoHV = (x1: number, y1: number, x2: number, y2: number) => {
  const s = Math.sign(x2 - x1) || 1;
  const v = Math.sign(y2 - y1) || 1;
  return [
    `M ${x1} ${y1}`,
    `L ${x2 - RADIO * s} ${y1}`,
    `A ${RADIO} ${RADIO} 0 0 ${s * v > 0 ? 1 : 0} ${x2} ${y1 + RADIO * v}`,
    `L ${x2} ${y2}`,
  ].join(" ");
};

/** The mirror image: down the spine first, then across to the Producto. */
const codoVH = (x1: number, y1: number, x2: number, y2: number) => {
  const s = Math.sign(x2 - x1) || 1;
  const v = Math.sign(y2 - y1) || 1;
  return [
    `M ${x1} ${y1}`,
    `L ${x1} ${y2 - RADIO * v}`,
    `A ${RADIO} ${RADIO} 0 0 ${s * v > 0 ? 0 : 1} ${x1 + RADIO * s} ${y2}`,
    `L ${x2} ${y2}`,
  ].join(" ");
};

/** Drops down a spine and turns right: the Descomposición branch. */
const rama = (x1: number, y1: number, x2: number, y2: number) =>
  [
    `M ${x1} ${y1}`,
    `L ${x1} ${y2 - RADIO}`,
    `A ${RADIO} ${RADIO} 0 0 0 ${x1 + RADIO} ${y2}`,
    `L ${x2} ${y2}`,
  ].join(" ");

const centro = (n: { y: number; h: number }) => cuadricula(n.y + n.h / 2);

const etiquetaEntre = (
  texto: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  giro?: number,
) => ({
  texto,
  // Sobre el tramo vertical del codo, que es donde la arista es identificable.
  x: cuadricula(giro === undefined ? (x1 + x2) / 2 : giro),
  y: cuadricula((y1 + y2) / 2) - 6,
});

/**
 * Spreads the vertical runs of the elbows that share one channel, so a Fase with
 * eleven edges draws eleven traceable lines instead of one merged spine.
 */
const giros = (n: number, desde: number, hasta: number) => {
  const margen = 28;
  const util = hasta - desde - margen * 2;
  const paso = n > 1 ? Math.min(20, util / (n - 1)) : 0;
  const ancho = paso * (n - 1);
  const inicio = desde + margen + (util - ancho) / 2;
  return Array.from({ length: n }, (_, i) => inicio + i * paso);
};

/**
 * Nudges apart labels that landed on the same spot. Two edges whose endpoints
 * average to the same point print their stereotype twice superimposed, which
 * reads as a smudge; this walks them upwards until each one stands alone.
 */
function separarEtiquetas(flechas: Flecha[]) {
  const puestas: { x: number; y: number }[] = [];
  for (const f of flechas) {
    if (!f.etiqueta) continue;
    while (
      puestas.some(
        (p) => Math.abs(p.x - f.etiqueta!.x) < 96 && Math.abs(p.y - f.etiqueta!.y) < 16,
      )
    )
      f.etiqueta.y -= 16;
    puestas.push({ x: f.etiqueta.x, y: f.etiqueta.y });
  }
}

type Marco = {
  width: number;
  contentW: number;
  titulo: DiagramLayout["titulo"];
  filaY: number;
  chips: DiagramLayout["chips"];
};

/** Title, objetivo and — in Resumen only — the band of Rol chips. */
function encabezado(fase: Fase, vista: Vista, width: number, conChips: boolean): Marco {
  const contentW = width - PAD * 2;
  // The Phase glyph sits in the margin and both the name and the objetivo indent
  // past it, so the two text blocks stay flush with each other.
  const tituloX = PAD + ICONO_TITULO + ICONO_GAP;
  const objetivo = wrap(fase.objetivo, FS_OBJETIVO, contentW * 0.72 - ICONO_TITULO);
  const titulo = {
    nombre: fase.nombre,
    subtitulo: NOMBRE_VISTA[vista],
    subtituloX: PAD + contentW,
    objetivo,
    x: tituloX,
    y: PAD,
    iconoX: PAD,
    iconoY: PAD + cuadricula(line(FS_TITULO) / 2 - ICONO_TITULO / 2),
  };
  let y = PAD + line(FS_TITULO) + objetivo.length * line(FS_OBJETIVO) + 20;

  // --- banda de chips de Roles, envuelve a varias filas
  const chips: DiagramLayout["chips"] = [];
  if (conChips) {
    let cx = PAD;
    let cy = y;
    for (const rol of fase.roles) {
      // Chips are set in Geist Mono, which is wider per character than Geist.
      const canal = ICONO_CHIP + ICONO_GAP_CHIP;
      const w = cuadricula(
        Math.min(rol.length * FS_CHIP * 0.62 + CHIP_PAD * 2 + canal, contentW),
      );
      if (cx > PAD && cx + w > PAD + contentW) {
        cx = PAD;
        cy += CHIP_H + CHIP_GAP;
      }
      chips.push({
        texto: rol,
        x: cx,
        y: cy,
        w,
        h: CHIP_H,
        iconoX: cx + CHIP_PAD,
        // Centred in what is left of the pill once the glyph has its channel.
        textoX: cx + CHIP_PAD + canal + (w - CHIP_PAD * 2 - canal) / 2,
      });
      cx += w + CHIP_GAP;
    }
    if (chips.length > 0) y = cy + CHIP_H + 34;
  }

  return { width, contentW, titulo, filaY: y, chips };
}

/** The legend, and with it the canvas height: it is always the last thing drawn. */
function cerrar(
  marco: Marco,
  usados: Set<IdIcono>,
  fondo: number,
): Pick<DiagramLayout, "leyenda" | "height" | "width"> {
  const leyendaY = fondo + LEYENDA_SEP;
  const entradas: DiagramLayout["leyenda"]["entradas"] = [];
  let lx = PAD;
  let ly = leyendaY;
  for (const icono of IDS_ICONO.filter((id) => usados.has(id))) {
    const texto = ETIQUETAS[icono];
    const w = ICONO_LEYENDA + ICONO_GAP_LEYENDA + textWidth(texto, FS_LEYENDA);
    if (lx > PAD && lx + w > PAD + marco.contentW) {
      lx = PAD;
      ly += LEYENDA_FILA;
    }
    entradas.push({
      icono,
      texto,
      x: lx,
      y: ly,
      textoX: lx + ICONO_LEYENDA + ICONO_GAP_LEYENDA,
    });
    lx += w + LEYENDA_GAP;
  }
  const leyenda = {
    x: PAD,
    y: leyendaY,
    w: marco.contentW,
    h: ly + LEYENDA_FILA - leyendaY,
    reglaY: cuadricula(leyendaY - 16),
    entradas,
  };
  return { width: marco.width, height: leyenda.y + leyenda.h + PAD, leyenda };
}

// The three-column canvas of Resumen. Flujo and Roles keep the same columns but
// widen the channel between them: their edges carry a stereotype, and
// «input, mandatory» needs more room than the 76px the Resumen arrows use.
const TAREAS_X = PAD + PANEL_W + GAP_X;
const DERECHA_X = TAREAS_X + NODE_W + GAP_X;
const ANCHO = DERECHA_X + PANEL_W + PAD;

const GAP_ESTEREOTIPO = 148;
const TAREAS_XE = PAD + PANEL_W + GAP_ESTEREOTIPO;
const DERECHA_XE = TAREAS_XE + NODE_W + GAP_ESTEREOTIPO;
const ANCHO_E = DERECHA_XE + PANEL_W + PAD;

/**
 * The one source of geometry in the project, and pure. The Vista picks which of
 * the four figures a Fase produces; every one of them returns the same shape, so
 * the renderer needs no branch of its own. Ver ADR-0006.
 */
export function layout(fase: Fase, vista: Vista = "resumen"): DiagramLayout {
  switch (vista) {
    case "flujo":
      return flujo(fase);
    case "roles":
      return roles(fase);
    case "descomposicion":
      return descomposicion(fase);
    case "detalle":
      return detalle(fase);
    default:
      return resumen(fase);
  }
}

function resumen(fase: Fase): DiagramLayout {
  const marco = encabezado(fase, "resumen", ANCHO, true);
  const { filaY } = marco;

  // --- nodos de Tarea
  let ny = filaY;
  const nodos = fase.tareas.map((tarea) => {
    const nodo = caja(tarea.id, tarea.nombre, tarea.descripcion, tarea.icono, TAREAS_X, ny, NODE_W);
    ny += nodo.h + GAP_Y;
    return nodo;
  });
  const nodosH = nodos.length ? ny - GAP_Y - filaY : 0;

  // --- paneles de Entrada y Salida
  const panel = (tipo: "entrada" | "salida", items: Producto[], x: number) => {
    const canalItem = ICONO_ITEM + ICONO_GAP_ITEM;
    const textW = PANEL_W - PANEL_PAD * 2 - canalItem;
    let py = PANEL_PAD + line(FS_ITEM);
    const puestos = items.map((item) => {
      // The glyph replaces the em dash that used to introduce each line.
      const lineas = wrap(item.texto, FS_ITEM, textW);
      const puesto = {
        lineas,
        y: py,
        icono: item.icono,
        iconoX: x + PANEL_PAD,
        iconoDy: Math.round((line(FS_ITEM) - ICONO_ITEM) / 2),
        textoX: x + PANEL_PAD + canalItem,
      };
      py += lineas.length * line(FS_ITEM) + 8;
      return puesto;
    });
    const h = cuadricula(py - 8 + PANEL_PAD);
    return { tipo, x, y: filaY, w: PANEL_W, h, items: puestos };
  };

  const paneles: DiagramLayout["paneles"] = [];
  if (fase.entrada.length) paneles.push(panel("entrada", fase.entrada, PAD));
  if (fase.salida.length) paneles.push(panel("salida", fase.salida, DERECHA_X));

  // --- flechas
  const flechas: Flecha[] = [];
  const entrada = paneles.find((p) => p.tipo === "entrada");
  const salida = paneles.find((p) => p.tipo === "salida");
  const primero = nodos[0];
  const ultimo = nodos[nodos.length - 1];

  if (entrada && primero)
    flechas.push({
      tipo: "consume",
      d: codo(entrada.x + entrada.w, centro(entrada), primero.x, centro(primero)),
    });

  for (let i = 0; i < nodos.length - 1; i++) {
    const a = nodos[i];
    const b = nodos[i + 1];
    flechas.push({
      tipo: "flujo",
      // Same x on both ends: a plain straight segment is what the guide asks for.
      d: `M ${a.x + a.w / 2} ${a.y + a.h} L ${b.x + b.w / 2} ${b.y}`,
    });
  }

  if (salida && ultimo)
    flechas.push({
      tipo: "produce",
      d: codo(ultimo.x + ultimo.w, centro(ultimo), salida.x, centro(salida)),
    });

  const fondo = Math.max(filaY + nodosH, ...paneles.map((p) => p.y + p.h), filaY);
  const usados = new Set<IdIcono>([
    "phase",
    ...(marco.chips.length ? (["role"] as IdIcono[]) : []),
    ...fase.tareas.map((t) => t.icono),
    ...fase.entrada.map((p) => p.icono),
    ...fase.salida.map((p) => p.icono),
  ]);

  return {
    ...cerrar(marco, usados, fondo),
    titulo: marco.titulo,
    chips: marco.chips,
    paneles,
    nodos,
    sueltos: [],
    flechas,
  };
}

/**
 * Entrada left, Tarea centre, Salida right, one band per Tarea, stacked down the
 * page. Vertical on purpose: six Tareas chained sideways would run past 3500px.
 */
function flujo(fase: Fase): DiagramLayout {
  const marco = encabezado(fase, "flujo", ANCHO_E, false);
  const nodos: Nodo[] = [];
  const flechas: Flecha[] = [];
  const tareaDe: Nodo[] = [];

  let y = marco.filaY;
  for (const tarea of fase.tareas) {
    const centrada = caja(tarea.id, tarea.nombre, tarea.descripcion, tarea.icono, TAREAS_XE, y, NODE_W);
    const lado = (items: Producto[], x: number) => {
      let ly = y;
      return items.map((item, i) => {
        const n = caja(`${tarea.id}-${x}-${i}`, item.texto, undefined, item.icono, x, ly, PANEL_W);
        ly += n.h + GAP_Y;
        return n;
      });
    };
    const izq = lado(tarea.entrada, PAD);
    const der = lado(tarea.salida, DERECHA_XE);

    const alto = (col: Nodo[]) =>
      col.length ? col[col.length - 1].y + col[col.length - 1].h - y : 0;
    const bandaH = Math.max(centrada.h, alto(izq), alto(der));

    // Every column is centred in the band, so a Tarea with one Entrada and three
    // Salidas still reads as one row rather than three staggered ones.
    const centrar = (col: Nodo[], h: number) => {
      const dy = cuadricula((bandaH - h) / 2);
      for (const n of col) {
        n.y += dy;
        n.iconoY += dy;
      }
    };
    centrar([centrada], centrada.h);
    centrar(izq, alto(izq));
    centrar(der, alto(der));

    const girosIzq = giros(izq.length, PAD + PANEL_W, TAREAS_XE);
    for (const [i, n] of izq.entries())
      flechas.push({
        tipo: "consume",
        d: codo(n.x + n.w, centro(n), centrada.x, centro(centrada), girosIzq[i]),
        etiqueta: etiquetaEntre(
          ESTEREOTIPOS.entrada,
          n.x + n.w,
          centro(n),
          centrada.x,
          centro(centrada),
          girosIzq[i],
        ),
      });
    const girosDer = giros(der.length, TAREAS_XE + NODE_W, DERECHA_XE);
    for (const [i, n] of der.entries())
      flechas.push({
        tipo: "produce",
        d: codo(centrada.x + centrada.w, centro(centrada), n.x, centro(n), girosDer[i]),
        etiqueta: etiquetaEntre(
          ESTEREOTIPOS.salida,
          centrada.x + centrada.w,
          centro(centrada),
          n.x,
          centro(n),
          girosDer[i],
        ),
      });

    nodos.push(centrada, ...izq, ...der);
    tareaDe.push(centrada);
    y += bandaH + GAP_Y;
  }

  // La flecha de flujo entre Tareas consecutivas no lleva estereotipo.
  for (let i = 0; i < tareaDe.length - 1; i++) {
    const a = tareaDe[i];
    const b = tareaDe[i + 1];
    flechas.push({
      tipo: "flujo",
      d: `M ${a.x + a.w / 2} ${a.y + a.h} L ${b.x + b.w / 2} ${b.y}`,
    });
  }

  separarEtiquetas(flechas);
  const fondo = Math.max(marco.filaY, ...nodos.map((n) => n.y + n.h));
  const usados = new Set<IdIcono>([
    "phase",
    ...fase.tareas.map((t) => t.icono),
    ...fase.tareas.flatMap((t) => [...t.entrada, ...t.salida].map((p) => p.icono)),
  ]);

  return {
    ...cerrar(marco, usados, fondo),
    titulo: marco.titulo,
    chips: [],
    paneles: [],
    nodos,
    sueltos: [],
    flechas,
  };
}

/**
 * Who performs and who assists. A Rol that performs some Tareas and assists in
 * others appears in both columns — as the reference notation draws it, and it
 * spares the figure a bundle of crossings.
 */
function roles(fase: Fase): DiagramLayout {
  const marco = encabezado(fase, "roles", ANCHO_E, false);
  const { filaY } = marco;

  let ny = filaY;
  const tareas = fase.tareas.map((tarea) => {
    const nodo = caja(tarea.id, tarea.nombre, tarea.descripcion, tarea.icono, TAREAS_XE, ny, NODE_W);
    ny += nodo.h + GAP_Y;
    return nodo;
  });

  const conPapel = (papel: "perform" | "assist") => {
    const vistos: string[] = [];
    for (const tarea of fase.tareas)
      for (const r of tarea.roles)
        if (r.papel === papel && !vistos.includes(r.rol)) vistos.push(r.rol);
    return vistos;
  };

  const columna = (nombres: string[], x: number, prefijo: string) => {
    let cy = filaY;
    return nombres.map((rol) => {
      const n = caja(`${prefijo}-${rol}`, rol, undefined, "role", x, cy, PANEL_W);
      cy += n.h + GAP_Y;
      return n;
    });
  };

  const ejecutan = columna(conPapel("perform"), PAD, "perform");
  const asisten = columna(conPapel("assist"), DERECHA_XE, "assist");
  const buscar = (col: Nodo[], prefijo: string, rol: string) =>
    col.find((n) => n.id === `${prefijo}-${rol}`)!;

  // Cada canal se recorre entero antes de dibujar: el reparto de los tramos
  // verticales depende de cuántas aristas comparten el canal.
  type Par = { origen: Nodo; destino: Nodo; texto: string };
  const perform: Par[] = [];
  const assist: Par[] = [];
  for (const [i, tarea] of fase.tareas.entries()) {
    const destino = tareas[i];
    for (const r of tarea.roles)
      if (r.papel === "perform")
        perform.push({
          origen: buscar(ejecutan, "perform", r.rol),
          destino,
          texto: ESTEREOTIPOS.perform,
        });
      else
        assist.push({
          origen: destino,
          destino: buscar(asisten, "assist", r.rol),
          texto: ESTEREOTIPOS.assist,
        });
  }

  const flechas: Flecha[] = [];
  const canal = (pares: Par[], desde: number, hasta: number) => {
    const gs = giros(pares.length, desde, hasta);
    for (const [i, { origen, destino, texto }] of pares.entries()) {
      const x1 = origen.x + origen.w;
      const y1 = centro(origen);
      const y2 = centro(destino);
      flechas.push({
        tipo: "flujo",
        d: codo(x1, y1, destino.x, y2, gs[i]),
        etiqueta: etiquetaEntre(texto, x1, y1, destino.x, y2, gs[i]),
      });
    }
  };
  canal(perform, PAD + PANEL_W, TAREAS_XE);
  canal(assist, TAREAS_XE + NODE_W, DERECHA_XE);
  separarEtiquetas(flechas);

  const nodos = [...ejecutan, ...tareas, ...asisten];
  const fondo = Math.max(filaY, ...nodos.map((n) => n.y + n.h));
  const usados = new Set<IdIcono>([
    "phase",
    ...(ejecutan.length || asisten.length ? (["role"] as IdIcono[]) : []),
    ...fase.tareas.map((t) => t.icono),
  ]);

  return {
    ...cerrar(marco, usados, fondo),
    titulo: marco.titulo,
    chips: [],
    paneles: [],
    nodos,
    sueltos: [],
    flechas,
  };
}

/** The Fase as root and its Tareas hanging off it: the index view. */
function descomposicion(fase: Fase): DiagramLayout {
  // Same canvas width as the Resumen: the tree is narrow, but the title is not,
  // and the two figures of a Fase are read side by side in the document. Flujo
  // and Roles are wider because their edges carry a stereotype.
  const marco = encabezado(fase, "descomposicion", ANCHO, false);

  const raiz = caja(fase.id, fase.nombre, undefined, "phase", PAD, marco.filaY, NODE_W);
  const espina = PAD + NODE_PAD + ICONO_NODO / 2;
  let y = raiz.y + raiz.h + GAP_Y;
  const hijos: Nodo[] = [];
  const flechas: Flecha[] = [];
  for (const tarea of fase.tareas) {
    const n = caja(tarea.id, tarea.nombre, tarea.descripcion, tarea.icono, PAD + RAMA, y, NODE_W);
    flechas.push({
      tipo: "include",
      d: rama(espina, raiz.y + raiz.h, n.x, centro(n)),
      etiqueta: etiquetaEntre(ESTEREOTIPOS.include, espina, centro(n), n.x, centro(n)),
    });
    hijos.push(n);
    y += n.h + GAP_Y;
  }

  const nodos = [raiz, ...hijos];
  const fondo = Math.max(marco.filaY, ...nodos.map((n) => n.y + n.h));
  const usados = new Set<IdIcono>(["phase", ...fase.tareas.map((t) => t.icono)]);

  return {
    ...cerrar(marco, usados, fondo),
    titulo: marco.titulo,
    chips: [],
    paneles: [],
    nodos,
    sueltos: [],
    flechas,
  };
}

// --- Vista Detalle EPF -------------------------------------------------------
// El diagrama de detalle de EPF Composer: tres bandas fijas —Roles, Tareas,
// Productos de Trabajo— y, por Tarea, la Entrada encima y la Salida debajo, de
// modo que ninguna arista cruce una caja. Ver ADR-0008.
const ROL_W = 260;
const PROD_W = 300;
const DET_TAREAS_X = PAD + ROL_W + GAP_ESTEREOTIPO;
const DET_PROD_X = DET_TAREAS_X + NODE_W + GAP_ESTEREOTIPO;
const ANCHO_DET = DET_PROD_X + PROD_W + PAD;
const DET_GAP = 56; // aire entre la banda de una Tarea y la de la siguiente
const DET_SEP = 40; // aire entre la Tarea y sus Productos de Trabajo

/** Glyph plus wrapped text, no box: how EPF draws a Rol or a Producto. */
function suelto(texto: string, icono: IdIcono, x: number, y: number, w: number) {
  const canal = ICONO_ITEM + ICONO_GAP_ITEM + 8;
  const lineas = wrap(texto, FS_ITEM, w - canal);
  const h = Math.max(cuadricula(ICONO_NODO + 8), lineas.length * line(FS_ITEM));
  const item = {
    lineas,
    icono,
    x,
    y,
    iconoY: cuadricula(y + h / 2 - ICONO_NODO / 2),
    textoX: x + canal,
  };
  return { item, h };
}

const altoSueltos = (textos: { texto: string }[], w: number) =>
  textos.reduce((h, t) => h + suelto(t.texto, "workProduct", 0, 0, w).h + 12, 0) -
  (textos.length ? 12 : 0);

function detalle(fase: Fase): DiagramLayout {
  const marco = encabezado(fase, "detalle", ANCHO_DET, false);
  const nodos: Nodo[] = [];
  const sueltos: DiagramLayout["sueltos"] = [];
  const flechas: Flecha[] = [];

  let y = marco.filaY + line(FS_ITEM);
  fase.tareas.forEach((tarea, i) => {
    const tareaAlto = caja(tarea.id, tarea.nombre, undefined, tarea.icono, 0, 0, NODE_W).h;
    const hRoles = altoSueltos(tarea.roles.map((r) => ({ texto: r.rol })), ROL_W);
    const hEnt = altoSueltos(tarea.entrada, PROD_W);
    const hSal = altoSueltos(tarea.salida, PROD_W);
    const hBanda =
      hEnt + (hEnt ? DET_SEP : 0) + tareaAlto + (hSal ? DET_SEP : 0) + hSal;
    const alto = Math.max(hRoles, hBanda);
    const top = y;
    const ty = top + (alto - hBanda) / 2 + hEnt + (hEnt ? DET_SEP : 0);

    const nodo = caja(tarea.id, tarea.nombre, undefined, tarea.icono, DET_TAREAS_X, cuadricula(ty), NODE_W);
    nodos.push(nodo);

    // --- Roles: cada uno con su propio giro, para que no se solapen dos aristas.
    let ry = cuadricula(centro(nodo) - hRoles / 2);
    const girosRol = giros(tarea.roles.length, PAD + ROL_W, DET_TAREAS_X);
    tarea.roles.forEach((rol, k) => {
      const { item, h } = suelto(rol.rol, "roleUse", PAD, ry, ROL_W);
      sueltos.push(item);
      const y1 = cuadricula(ry + h / 2);
      const y2 = cuadricula(nodo.y + (nodo.h * (k + 1)) / (tarea.roles.length + 1));
      flechas.push({
        tipo: "flujo",
        d: codo(PAD + ROL_W - 8, y1, nodo.x, y2, girosRol[k]),
        // Por encima del tramo, nunca sobre él: con y1 ≈ y2 el punto medio cae
        // justo en la línea y el estereotipo queda tachado por su propia arista.
        etiqueta: {
          texto: ESTEREOTIPOS[rol.papel],
          x: cuadricula(girosRol[k] ?? (PAD + ROL_W + nodo.x) / 2),
          y: Math.min(y1, y2) - 12,
        },
      });
      ry += h + 12;
    });

    // --- Productos: Entrada por el borde superior, Salida por el inferior.
    const columna = (items: Producto[], desde: number, entrada: boolean) => {
      let py = desde;
      items.forEach((producto, k) => {
        const { item, h } = suelto(producto.texto, producto.icono, DET_PROD_X, py, PROD_W);
        sueltos.push(item);
        const py1 = cuadricula(py + h / 2);
        // Una x propia por arista dentro del cuerpo de la Tarea, nunca en la punta.
        const ax = cuadricula(nodo.x + 48 + ((NODE_W - 120) * (k + 1)) / (items.length + 1));
        const etiquetaX = cuadricula(DET_PROD_X - 96);
        flechas.push({
          tipo: entrada ? "consume" : "produce",
          d: entrada
            ? codoHV(DET_PROD_X - 8, py1, ax, nodo.y)
            : codoVH(ax, nodo.y + nodo.h, DET_PROD_X - 8, py1),
          etiqueta: {
            texto: entrada ? ESTEREOTIPOS.entrada : ESTEREOTIPOS.salida,
            x: etiquetaX,
            y: py1 - 8,
          },
        });
        py += h + 12;
      });
    };
    columna(tarea.entrada, top + (alto - hBanda) / 2, true);
    columna(tarea.salida, cuadricula(nodo.y + nodo.h + DET_SEP), false);

    // --- Cadena entre Tareas: misma x en los dos extremos, segmento recto.
    if (i > 0) {
      const previo = nodos[i - 1];
      flechas.push({
        tipo: "flujo",
        d: `M ${previo.x + 48} ${previo.y + previo.h} L ${nodo.x + 48} ${nodo.y}`,
      });
    }
    y = top + alto + DET_GAP;
  });

  const fondo = Math.max(
    marco.filaY,
    ...nodos.map((n) => n.y + n.h),
    ...sueltos.map((s) => s.y + s.lineas.length * line(FS_ITEM)),
  );
  const usados = new Set<IdIcono>([
    "phase",
    ...(fase.tareas.some((t) => t.roles.length) ? (["roleUse"] as IdIcono[]) : []),
    ...fase.tareas.map((t) => t.icono),
    ...fase.tareas.flatMap((t) => [...t.entrada, ...t.salida]).map((p) => p.icono),
  ]);

  return {
    ...cerrar(marco, usados, fondo),
    titulo: marco.titulo,
    chips: [],
    paneles: [],
    nodos,
    sueltos,
    flechas,
  };
}
