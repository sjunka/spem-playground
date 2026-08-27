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

export const ICONOS: Record<IdIcono, string> = {
  activity:
    "M2.6 6.4 h6.2 l2 2.2 h10.6 v11.8 H2.6 z M7.4 12.6 h9 M7.4 16.4 h6",
  activityEmpty:
    "M2.6 6.4 h6.2 l2 2.2 h10.6 v11.8 H2.6 z",
  task:
    "M3 5.4 h12.2 l5.4 6.6 -5.4 6.6 H3 z",
  category:
    "M2.6 6.4 h6.2 l2 2.2 h10.6 v11.8 H2.6 z M7.8 12.4 h8.4 v5.6 H7.8 z",
  role: "M12 3.2 a3.4 3.4 0 1 1 0 6.8 a3.4 3.4 0 1 1 0 -6.8 M4.6 20.8 v-1.4 a7.4 7.4 0 0 1 14.8 0 v1.4",
  roleUse:
    "M8.4 4.2 a2.8 2.8 0 1 1 0 5.6 a2.8 2.8 0 1 1 0 -5.6 M2.4 20.4 v-1.2 a6 6 0 0 1 12 0 v1.2 M 20.2 3.8 A 3.4 3.4 0 1 1 16.3 3.5 M 20.2 3.8 L 17.0 3.2 M 20.2 3.8 L 19.1 0.8",
  workProduct:
    "M5.8 2.8 h7.6 l4.8 4.8 v13.6 H5.8 z M13.4 2.8 v4.8 h4.8 M9.2 12.6 h5.6 M9.2 16.4 h5.6",
  step:
    "M2.8 20.6 h5.6 v-5.2 h5.6 v-5.2 h5.6 v-5.4",
  milestone:
    "M12 2.8 l6 6 -6 6 -6 -6 z M12 14.8 v6.4",
  tool:
    "M16.4 3.2 a5.4 5.4 0 0 0 -6.5 8.3 l-6.4 6.4 a2.1 2.1 0 0 0 3 3 l6.4 -6.4 a5.4 5.4 0 0 0 8.3 -6.5 l-3.6 3.6 -3 -0.8 -0.8 -3 z",
  metric:
    "M2.8 20.6 h18.4 M6.6 20.6 V13 M12 20.6 V7.4 M17.4 20.6 V10.6",
  process:
    "M3.6 12 a8.4 8.4 0 0 1 14.3 -5.9 M20.4 12 a8.4 8.4 0 0 1 -14.3 5.9 M18.2 2.6 v3.6 h-3.6 M5.8 21.4 v-3.6 h3.6",
  phase: "M2.8 17.6 l5.2 -5.2 4 3 5.2 -7.2 4 4.4 M2.8 21 h18.4",
  iteration:
    "M2.6 11 l4 -4 3.2 2.2 4.2 -5.6 M2.6 15 h8 M 20.2 14.3 A 4.0 4.0 0 1 1 15.6 13.9 M 20.2 14.3 L 17.0 13.7 M 20.2 14.3 L 19.1 11.3",
  teamProfile:
    "M9 5.6 a3 3 0 1 1 0 6 a3 3 0 1 1 0 -6 M2 20.6 v-1.2 a7 7 0 0 1 14 0 v1.2 M17 3.8 a2.6 2.6 0 1 1 0 5.2 a2.6 2.6 0 1 1 0 -5.2 M17.4 12.4 a6 6 0 0 1 4.6 5.8 v1.4",
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
