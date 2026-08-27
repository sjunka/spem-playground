import type { IdIcono } from "./iconos";

export type Tarea = {
  id: string;
  nombre: string;
  descripcion?: string;
  icono: IdIcono;
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

export type Modelo = { version: 2; fases: Fase[] };

export const VERSION = 2;
