import { ETIQUETAS, IDS_ICONO, type IdIcono } from "./iconos";
import type { Fase, Producto } from "./modelo";

export type DiagramLayout = {
  width: number;
  height: number;
  titulo: {
    nombre: string;
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
  nodos: {
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
  }[];
  flechas: { d: string; tipo: "consume" | "flujo" | "produce" }[];
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

export function layout(fase: Fase): DiagramLayout {
  const tareasX = PAD + PANEL_W + GAP_X;
  const salidaX = tareasX + NODE_W + GAP_X;
  const width = salidaX + PANEL_W + PAD;
  const contentW = width - PAD * 2;

  // --- título
  // The Phase glyph sits in the margin and both the name and the objetivo indent
  // past it, so the two text blocks stay flush with each other.
  const tituloX = PAD + ICONO_TITULO + ICONO_GAP;
  const objetivo = wrap(fase.objetivo, FS_OBJETIVO, contentW * 0.72 - ICONO_TITULO);
  const titulo = {
    nombre: fase.nombre,
    objetivo,
    x: tituloX,
    y: PAD,
    iconoX: PAD,
    iconoY: PAD + cuadricula(line(FS_TITULO) / 2 - ICONO_TITULO / 2),
  };
  let y = PAD + line(FS_TITULO) + objetivo.length * line(FS_OBJETIVO) + 20;

  // --- banda de chips de Roles, envuelve a varias filas
  const chips: DiagramLayout["chips"] = [];
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

  const filaY = y;

  // --- nodos de Tarea
  const canalNodo = ICONO_NODO + ICONO_GAP;
  const nodoTextW = NODE_W - NODE_PAD * 2 - canalNodo;
  let ny = filaY;
  const nodos = fase.tareas.map((tarea) => {
    const lineas = wrap(tarea.nombre, FS_NODO, nodoTextW);
    const descripcion = tarea.descripcion
      ? wrap(tarea.descripcion, FS_DESC, nodoTextW)
      : [];
    const h = cuadricula(
      NODE_PAD * 2 +
        lineas.length * line(FS_NODO) +
        (descripcion.length ? 8 + descripcion.length * line(FS_DESC) : 0),
    );
    const nodo = {
      id: tarea.id,
      lineas,
      descripcion,
      x: tareasX,
      y: ny,
      w: NODE_W,
      h,
      icono: tarea.icono,
      iconoX: tareasX + NODE_PAD,
      // Sits on the first line of the name, not on the top edge of the box.
      iconoY: ny + NODE_PAD + cuadricula((line(FS_NODO) - ICONO_NODO) / 2),
      textoX: tareasX + NODE_PAD + canalNodo,
    };
    ny += h + GAP_Y;
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
  if (fase.salida.length) paneles.push(panel("salida", fase.salida, salidaX));

  // --- flechas
  const flechas: DiagramLayout["flechas"] = [];
  const entrada = paneles.find((p) => p.tipo === "entrada");
  const salida = paneles.find((p) => p.tipo === "salida");
  const primero = nodos[0];
  const ultimo = nodos[nodos.length - 1];

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

  if (entrada && primero)
    flechas.push({
      tipo: "consume",
      d: codo(
        entrada.x + entrada.w,
        cuadricula(entrada.y + entrada.h / 2),
        primero.x,
        cuadricula(primero.y + primero.h / 2),
      ),
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
      d: codo(
        ultimo.x + ultimo.w,
        cuadricula(ultimo.y + ultimo.h / 2),
        salida.x,
        cuadricula(salida.y + salida.h / 2),
      ),
    });

  const fondo = Math.max(filaY + nodosH, ...paneles.map((p) => p.y + p.h), filaY);

  // --- leyenda: solo los tipos que esta Fase usa, en el orden del set
  const usados = new Set<IdIcono>([
    "phase",
    ...(chips.length ? (["role"] as IdIcono[]) : []),
    ...fase.tareas.map((t) => t.icono),
    ...fase.entrada.map((p) => p.icono),
    ...fase.salida.map((p) => p.icono),
  ]);
  const leyendaY = fondo + LEYENDA_SEP;
  const entradas: DiagramLayout["leyenda"]["entradas"] = [];
  let lx = PAD;
  let ly = leyendaY;
  for (const icono of IDS_ICONO.filter((id) => usados.has(id))) {
    const texto = ETIQUETAS[icono];
    const w =
      ICONO_LEYENDA + ICONO_GAP_LEYENDA + textWidth(texto, FS_LEYENDA);
    if (lx > PAD && lx + w > PAD + contentW) {
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
    w: contentW,
    h: ly + LEYENDA_FILA - leyendaY,
    reglaY: cuadricula(leyendaY - 16),
    entradas,
  };

  const height = leyenda.y + leyenda.h + PAD;

  return { width, height, titulo, chips, paneles, nodos, flechas, leyenda };
}
