import type { IdIcono } from "./iconos";

/**
 * The outline EPF Composer / SPEM Designer draws for each SPEM 2.0 element:
 * a chevron for work (Tarea, Paso), a hexagon for a Hito, a rounded box for the
 * containers (Actividad, Proceso, Fase, Iteración). Everything else stays square.
 */
export type Forma = "chevron" | "hexagono" | "redondo" | "caja";

export const FORMA: Record<IdIcono, Forma> = {
  task: "chevron",
  step: "chevron",
  milestone: "hexagono",
  activity: "redondo",
  activityEmpty: "redondo",
  process: "redondo",
  phase: "redondo",
  iteration: "redondo",
  category: "caja",
  role: "caja",
  roleUse: "caja",
  workProduct: "caja",
  tool: "caja",
  metric: "caja",
  teamProfile: "caja",
};

/** The path of a node's outline. `punta` is clamped so a short node keeps its shape. */
export function contorno(icono: IdIcono, x: number, y: number, w: number, h: number): string {
  const forma = FORMA[icono] ?? "caja";
  const punta = Math.min(28, w / 4, h / 2);
  const r = 8;
  switch (forma) {
    case "chevron":
      return `M${x} ${y} H${x + w - punta} L${x + w} ${y + h / 2} L${x + w - punta} ${y + h} H${x} Z`;
    case "hexagono":
      return `M${x} ${y + h / 2} L${x + punta} ${y} H${x + w - punta} L${x + w} ${y + h / 2} L${x + w - punta} ${y + h} H${x + punta} Z`;
    case "redondo":
      return `M${x + r} ${y} H${x + w - r} A${r} ${r} 0 0 1 ${x + w} ${y + r} V${y + h - r} A${r} ${r} 0 0 1 ${x + w - r} ${y + h} H${x + r} A${r} ${r} 0 0 1 ${x} ${y + h - r} V${y + r} A${r} ${r} 0 0 1 ${x + r} ${y} Z`;
    default:
      return `M${x} ${y} H${x + w} V${y + h} H${x} Z`;
  }
}
