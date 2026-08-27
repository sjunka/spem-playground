import type { Fase } from "./modelo";

export type DiagramLayout = {
  width: number;
  height: number;
  titulo: { nombre: string; objetivo: string[]; x: number; y: number };
  chips: { texto: string; x: number; y: number; w: number; h: number }[];
  paneles: {
    rol: "entrada" | "salida";
    x: number;
    y: number;
    w: number;
    h: number;
    items: { lineas: string[]; y: number }[];
  }[];
  nodos: {
    id: string;
    lineas: string[];
    descripcion: string[];
    x: number;
    y: number;
    w: number;
    h: number;
    focal: boolean;
  }[];
  flechas: { d: string; tipo: "consume" | "flujo" | "produce" }[];
};

// Geometry constants. Every number the SVG draws comes from here.
const PAD = 44;
const PANEL_W = 250;
const NODE_W = 340;
const GAP_X = 76;
const GAP_Y = 26;
const NODE_PAD = 14;
const PANEL_PAD = 16;
const CHIP_PAD = 12;
const CHIP_H = 24;
const CHIP_GAP = 8;

const FS_TITULO = 34;
const FS_OBJETIVO = 15;
const FS_NODO = 16;
const FS_DESC = 12.5;
const FS_ITEM = 13;
const FS_CHIP = 12;

const LH = 1.35;
const line = (fs: number) => Math.round(fs * LH);

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
  const objetivo = wrap(fase.objetivo, FS_OBJETIVO, contentW * 0.72);
  const titulo = { nombre: fase.nombre, objetivo, x: PAD, y: PAD };
  let y = PAD + line(FS_TITULO) + objetivo.length * line(FS_OBJETIVO) + 20;

  // --- banda de chips de Roles, envuelve a varias filas
  const chips: DiagramLayout["chips"] = [];
  let cx = PAD;
  let cy = y;
  for (const rol of fase.roles) {
    // Chips are set in Geist Mono, which is wider per character than Geist.
    const w = Math.min(rol.length * FS_CHIP * 0.62 + CHIP_PAD * 2, contentW);
    if (cx > PAD && cx + w > PAD + contentW) {
      cx = PAD;
      cy += CHIP_H + CHIP_GAP;
    }
    chips.push({ texto: rol, x: cx, y: cy, w, h: CHIP_H });
    cx += w + CHIP_GAP;
  }
  if (chips.length > 0) y = cy + CHIP_H + 34;

  const filaY = y;

  // --- nodos de Tarea
  const nodoTextW = NODE_W - NODE_PAD * 2;
  let ny = filaY;
  const nodos = fase.tareas.map((tarea) => {
    const lineas = wrap(tarea.nombre, FS_NODO, nodoTextW);
    const descripcion = tarea.descripcion
      ? wrap(tarea.descripcion, FS_DESC, nodoTextW)
      : [];
    const h =
      NODE_PAD * 2 +
      lineas.length * line(FS_NODO) +
      (descripcion.length ? 6 + descripcion.length * line(FS_DESC) : 0);
    const nodo = {
      id: tarea.id,
      lineas,
      descripcion,
      x: tareasX,
      y: ny,
      w: NODE_W,
      h,
      focal: false,
    };
    ny += h + GAP_Y;
    return nodo;
  });
  const nodosH = nodos.length ? ny - GAP_Y - filaY : 0;

  // --- paneles de Entrada y Salida
  const panel = (rol: "entrada" | "salida", items: string[], x: number) => {
    const textW = PANEL_W - PANEL_PAD * 2;
    let py = PANEL_PAD + line(FS_ITEM);
    const puestos = items.map((item) => {
      const lineas = wrap(`— ${item}`, FS_ITEM, textW);
      const puesto = { lineas, y: py };
      py += lineas.length * line(FS_ITEM) + 8;
      return puesto;
    });
    const h = py - 8 + PANEL_PAD;
    return { rol, x, y: filaY, w: PANEL_W, h, items: puestos };
  };

  const paneles: DiagramLayout["paneles"] = [];
  if (fase.entrada.length) paneles.push(panel("entrada", fase.entrada, PAD));
  if (fase.salida.length) paneles.push(panel("salida", fase.salida, salidaX));

  // --- flechas
  const flechas: DiagramLayout["flechas"] = [];
  const entrada = paneles.find((p) => p.rol === "entrada");
  const salida = paneles.find((p) => p.rol === "salida");
  const primero = nodos[0];
  const ultimo = nodos[nodos.length - 1];

  const curva = (x1: number, y1: number, x2: number, y2: number) => {
    const mx = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
  };

  if (entrada && primero)
    flechas.push({
      tipo: "consume",
      d: curva(
        entrada.x + entrada.w,
        entrada.y + entrada.h / 2,
        primero.x,
        primero.y + primero.h / 2,
      ),
    });

  for (let i = 0; i < nodos.length - 1; i++) {
    const a = nodos[i];
    const b = nodos[i + 1];
    flechas.push({
      tipo: "flujo",
      d: `M ${a.x + a.w / 2} ${a.y + a.h} L ${b.x + b.w / 2} ${b.y}`,
    });
  }

  if (salida && ultimo)
    flechas.push({
      tipo: "produce",
      d: curva(
        ultimo.x + ultimo.w,
        ultimo.y + ultimo.h / 2,
        salida.x,
        salida.y + salida.h / 2,
      ),
    });

  const height =
    Math.max(filaY + nodosH, ...paneles.map((p) => p.y + p.h), filaY) + PAD;

  return { width, height, titulo, chips, paneles, nodos, flechas };
}
