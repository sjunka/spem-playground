import type { IdIcono } from "./iconos";

/** SPEM 2.0 normative role assignment on a Tarea. */
export type Papel = "perform" | "assist";

/** A Rol of the Fase, referenced by its text, with the papel it plays in a Tarea. */
export type RolTarea = { rol: string; papel: Papel };

export type Tarea = {
  id: string;
  nombre: string;
  descripcion?: string;
  icono: IdIcono;
  roles: RolTarea[];
  entrada: Producto[];
  salida: Producto[];
};

/** A Producto de Trabajo as it appears in Entrada or Salida: text plus its SPEM type. */
export type Producto = { texto: string; icono: IdIcono };

export type Fase = {
  id: string;
  nombre: string;
  objetivo: string;
  roles: string[];
  tareas: Tarea[];
  entrada: Producto[];
  salida: Producto[];
};

export type Modelo = { version: 3; fases: Fase[] };

export const VERSION = 3;

/** The figures a Fase produces. Ver ADR-0006 y ADR-0008. */
export type Vista = "resumen" | "flujo" | "roles" | "descomposicion" | "detalle";

export const VISTAS: Vista[] = ["resumen", "flujo", "roles", "descomposicion", "detalle"];

/** Interface prose stays in Spanish; only the OMG stereotypes are in English. */
export const NOMBRE_VISTA: Record<Vista, string> = {
  resumen: "Resumen",
  flujo: "Flujo",
  roles: "Roles",
  descomposicion: "Descomposición",
  detalle: "Detalle EPF",
};

export const PAPELES: Papel[] = ["perform", "assist"];
