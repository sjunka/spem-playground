import { ICONOS, type IdIcono } from "./iconos";
import type { Fase, Modelo, Producto, Tarea } from "./modelo";
import { VERSION } from "./modelo";

export type Resultado =
  | { ok: true; modelo: Modelo }
  | { ok: false; error: string };

const esObjeto = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const listaDeTextos = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === "string");

const esIcono = (v: unknown): v is IdIcono =>
  typeof v === "string" && Object.hasOwn(ICONOS, v);

/** Validates untrusted input (imported file or localStorage). Never coerces. */
export function validar(entrada: unknown): Resultado {
  if (!esObjeto(entrada))
    return { ok: false, error: "El archivo no contiene un objeto de modelo." };
  // Version 1 predates icons. It is migrated rather than rejected: the store falls
  // back to the seed on any rejection, which would wipe saved work without a word.
  const v1 = entrada.version === 1;
  if (!v1 && entrada.version !== VERSION)
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
    if (!listaDeTextos(cruda.roles))
      return { ok: false, error: `${donde} no tiene "roles" como lista de textos.` };

    const productos: Record<"entrada" | "salida", Producto[]> = {
      entrada: [],
      salida: [],
    };
    for (const campo of ["entrada", "salida"] as const) {
      const lista = cruda[campo];
      if (!Array.isArray(lista))
        return { ok: false, error: `${donde} no tiene "${campo}" como lista.` };
      for (const [j, p] of lista.entries()) {
        const cual = `El elemento ${j + 1} de "${campo}" de ${donde.toLowerCase()}`;
        if (v1) {
          if (typeof p !== "string")
            return { ok: false, error: `${cual} no es texto.` };
          productos[campo].push({ texto: p, icono: "workProduct" });
          continue;
        }
        if (!esObjeto(p) || typeof p.texto !== "string")
          return { ok: false, error: `${cual} no tiene un "texto" de texto.` };
        if (!esIcono(p.icono))
          return { ok: false, error: `${cual} tiene un icono desconocido.` };
        productos[campo].push({ texto: p.texto, icono: p.icono });
      }
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
      if (!v1 && !esIcono(t.icono))
        return {
          ok: false,
          error: `La tarea ${j + 1} de ${donde.toLowerCase()} tiene un icono desconocido.`,
        };
      const icono: IdIcono = v1 ? "task" : (t.icono as IdIcono);
      tareas.push(
        t.descripcion === undefined
          ? { id: t.id, nombre: t.nombre, icono }
          : { id: t.id, nombre: t.nombre, descripcion: t.descripcion, icono },
      );
    }

    // Unknown extra properties are dropped, not rejected.
    fases.push({
      id: cruda.id as string,
      nombre: cruda.nombre as string,
      objetivo: cruda.objetivo as string,
      roles: cruda.roles,
      tareas,
      entrada: productos.entrada,
      salida: productos.salida,
    });
  }

  return { ok: true, modelo: { version: VERSION, fases } };
}
