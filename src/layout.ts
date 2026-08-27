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
  perform: "«perform»",
  assist: "«assist»",
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

/** Rounded right-angle elbow: out, turn, across, turn, in. Never a diagonal. */
const codo = (x1: number, y1: number, x2: number, y2: number) => {
  if (Math.abs(y2 - y1) < RADIO * 2) return `M ${x1} ${y1} L ${x2} ${y1}`;
  const mx = cuadricula((x1 + x2) / 2);
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

/** Drops down a spine and turns right: the Descomposición branch. */
const rama = (x1: number, y1: number, x2: number, y2: number) =>
  [
    `M ${x1} ${y1}`,
    `L ${x1} ${y2 - RADIO}`,
    `A ${RADIO} ${RADIO} 0 0 0 ${x1 + RADIO} ${y2}`,
    `L ${x2} ${y2}`,
  ].join(" ");

const centro = (n: { y: number; h: number }) => cuadricula(n.y + n.h / 2);

const etiquetaEntre = (texto: string, x1: number, y1: number, x2: number, y2: number) => ({
  texto,
  x: cuadricula((x1 + x2) / 2),
  y: cuadricula((y1 + y2) / 2) - 6,
});

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

    for (const n of izq)
      flechas.push({
        tipo: "consume",
        d: codo(n.x + n.w, centro(n), centrada.x, centro(centrada)),
        etiqueta: etiquetaEntre(
          ESTEREOTIPOS.entrada,
          n.x + n.w,
          centro(n),
          centrada.x,
          centro(centrada),
        ),
      });
    for (const n of der)
      flechas.push({
        tipo: "produce",
        d: codo(centrada.x + centrada.w, centro(centrada), n.x, centro(n)),
        etiqueta: etiquetaEntre(
          ESTEREOTIPOS.salida,
          centrada.x + centrada.w,
          centro(centrada),
          n.x,
          centro(n),
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

  const flechas: Flecha[] = [];
  for (const [i, tarea] of fase.tareas.entries()) {
    const destino = tareas[i];
    for (const r of tarea.roles) {
      if (r.papel === "perform") {
        const origen = buscar(ejecutan, "perform", r.rol);
        flechas.push({
          tipo: "flujo",
          d: codo(origen.x + origen.w, centro(origen), destino.x, centro(destino)),
          etiqueta: etiquetaEntre(
            ESTEREOTIPOS.perform,
            origen.x + origen.w,
            centro(origen),
            destino.x,
            centro(destino),
          ),
        });
      } else {
        const fin = buscar(asisten, "assist", r.rol);
        flechas.push({
          tipo: "flujo",
          d: codo(destino.x + destino.w, centro(destino), fin.x, centro(fin)),
          etiqueta: etiquetaEntre(
            ESTEREOTIPOS.assist,
            destino.x + destino.w,
            centro(destino),
            fin.x,
            centro(fin),
          ),
        });
      }
    }
  }

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
    flechas,
  };
}

/** The Fase as root and its Tareas hanging off it: the index view. */
function descomposicion(fase: Fase): DiagramLayout {
  // Same canvas width as the other views: the tree is narrow, but the title is
  // not, and the four figures of a Fase are read side by side in the document.
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
    flechas,
  };
}
