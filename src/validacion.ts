import type { Fase, Modelo, Tarea } from "./modelo";
import { VERSION } from "./modelo";

export type Resultado =
  | { ok: true; modelo: Modelo }
  | { ok: false; error: string };

const esObjeto = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const listaDeTextos = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === "string");

/** Validates untrusted input (imported file or localStorage). Never coerces. */
export function validar(entrada: unknown): Resultado {
  if (!esObjeto(entrada))
    return { ok: false, error: "El archivo no contiene un objeto de modelo." };
  if (entrada.version !== VERSION)
    return {
      ok: false,
      error: `Versión no reconocida: ${JSON.stringify(entrada.version)}. Se esperaba ${VERSION}.`,
    };
  if (!Array.isArray(entrada.fases))
    return { ok: false, error: "Falta la lista de fases." };

  const fases: Fase[] = [];
  for (const [i, cruda] of entrada.fases.entries()) {
    const donde = `La fase ${i + 1}`;
    if (!esObjeto(cruda)) return { ok: false, error: `${donde} no es un objeto.` };
    for (const campo of ["id", "nombre", "objetivo"] as const) {
      if (typeof cruda[campo] !== "string")
        return { ok: false, error: `${donde} no tiene un campo "${campo}" de texto.` };
    }
    for (const campo of ["roles", "entrada", "salida"] as const) {
      if (!listaDeTextos(cruda[campo]))
        return {
          ok: false,
          error: `${donde} no tiene "${campo}" como lista de textos.`,
        };
    }
    if (!Array.isArray(cruda.tareas))
      return { ok: false, error: `${donde} no tiene "tareas" como lista.` };

    const tareas: Tarea[] = [];
    for (const [j, t] of cruda.tareas.entries()) {
      if (!esObjeto(t) || typeof t.id !== "string" || typeof t.nombre !== "string")
        return {
          ok: false,
          error: `La tarea ${j + 1} de ${donde.toLowerCase()} no tiene "id" y "nombre" de texto.`,
        };
      if (t.descripcion !== undefined && typeof t.descripcion !== "string")
        return {
          ok: false,
          error: `La tarea ${j + 1} de ${donde.toLowerCase()} tiene una "descripcion" que no es texto.`,
        };
      tareas.push(
        t.descripcion === undefined
          ? { id: t.id, nombre: t.nombre }
          : { id: t.id, nombre: t.nombre, descripcion: t.descripcion },
      );
    }

    // Unknown extra properties are dropped, not rejected.
    fases.push({
      id: cruda.id as string,
      nombre: cruda.nombre as string,
      objetivo: cruda.objetivo as string,
      roles: cruda.roles as string[],
      tareas,
      entrada: cruda.entrada as string[],
      salida: cruda.salida as string[],
    });
  }

  return { ok: true, modelo: { version: VERSION, fases } };
}
