export type Tarea = { id: string; nombre: string; descripcion?: string };

export type Fase = {
  id: string;
  nombre: string;
  objetivo: string;
  roles: string[];
  tareas: Tarea[];
  entrada: string[];
  salida: string[];
};

export type Modelo = { version: 1; fases: Fase[] };

export const VERSION = 1;
