/**
 * The fifteen SPEM 2.0 element types, redrawn as geometric monochrome glyphs.
 *
 * IDs are the OMG normative English names on purpose — the glossary in CONTEXT.md
 * vetoes `Task`, `Phase` and `work product` as interface prose, not as identifiers.
 * The labels next to them are what the interface actually shows.
 *
 * Paths live here rather than in .svg files because the PNG export serialises the
 * <svg> and rasterises it in a canvas: anything referencing an outside document
 * resolves to nothing. Same reason the typefaces are base64 in fuentes.css.
 */
export type IdIcono =
  | "activity"
  | "activityEmpty"
  | "task"
  | "category"
  | "role"
  | "roleUse"
  | "workProduct"
  | "step"
  | "milestone"
  | "tool"
  | "metric"
  | "process"
  | "phase"
  | "iteration"
  | "teamProfile";

/** Every glyph is drawn in a 24×24 box and scaled at the point of use. */
export const CAJA = 24;

// Stand-in until each glyph is drawn: visible enough to spot, never shippable.
const PENDIENTE = "M4 4 h16 v16 H4 z M4 4 l16 16 M20 4 l-16 16";

export const ICONOS: Record<IdIcono, string> = {
  activity: PENDIENTE,
  activityEmpty: PENDIENTE,
  task: PENDIENTE,
  category: PENDIENTE,
  role: "M12 3.2 a3.4 3.4 0 1 1 0 6.8 a3.4 3.4 0 1 1 0 -6.8 M4.6 20.8 v-1.4 a7.4 7.4 0 0 1 14.8 0 v1.4",
  roleUse: PENDIENTE,
  workProduct: PENDIENTE,
  step: PENDIENTE,
  milestone: PENDIENTE,
  tool: PENDIENTE,
  metric: PENDIENTE,
  process: PENDIENTE,
  phase: "M2.8 17.6 l5.2 -5.2 4 3 5.2 -7.2 4 4.4 M2.8 21 h18.4",
  iteration: PENDIENTE,
  teamProfile: PENDIENTE,
};

export const ETIQUETAS: Record<IdIcono, string> = {
  activity: "Actividad",
  activityEmpty: "Actividad (vacía)",
  task: "Tarea",
  category: "Categoría",
  role: "Rol",
  roleUse: "Uso de Rol",
  workProduct: "Producto de Trabajo",
  step: "Paso",
  milestone: "Hito",
  tool: "Herramienta",
  metric: "Métrica / Guía",
  process: "Proceso",
  phase: "Fase",
  iteration: "Iteración",
  teamProfile: "Perfil de equipo",
};

/** Stable order for anything that lists the whole set: the selector, the legend. */
export const IDS_ICONO = Object.keys(ICONOS) as IdIcono[];
