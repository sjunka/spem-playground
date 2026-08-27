import { ICONOS, type IdIcono } from "./iconos";
import type { Fase, Modelo, Papel, Producto, RolTarea, Tarea } from "./modelo";
import { PAPELES, VERSION } from "./modelo";

export type Resultado =
  | { ok: true; modelo: Modelo }
  | { ok: false; error: string };

const esObjeto = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const listaDeTextos = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === "string");

const esIcono = (v: unknown): v is IdIcono =>
  typeof v === "string" && Object.hasOwn(ICONOS, v);

const esPapel = (v: unknown): v is Papel =>
  typeof v === "string" && (PAPELES as string[]).includes(v);

/** Validates untrusted input (imported file or localStorage). Never coerces. */
export function validar(entrada: unknown): Resultado {
  if (!esObjeto(entrada))
    return { ok: false, error: "El archivo no contiene un objeto de modelo." };
  // Older versions are migrated rather than rejected: the store falls back to the
  // seed on any rejection, which would wipe saved work without a word. Version 1
  // predates icons; version 2 predates Roles and Productos de Trabajo per Tarea.
  const v1 = entrada.version === 1;
  const v2 = entrada.version === 2;
  if (!v1 && !v2 && entrada.version !== VERSION)
    return {
      ok: false,
      error: `Versión no reconocida: ${JSON.stringify(entrada.version)}. Se esperaba ${VERSION}.`,
    };
  if (!Array.isArray(entrada.fases))
    return { ok: false, error: "Falta la lista de fases." };

  /** Same rigour for a Tarea's own Entrada and Salida as for the Fase's. */
  const productos = (
    lista: unknown,
    campo: string,
    donde: string,
  ): { ok: true; items: Producto[] } | { ok: false; error: string } => {
    if (!Array.isArray(lista))
      return { ok: false, error: `${donde} no tiene "${campo}" como lista.` };
    const items: Producto[] = [];
    for (const [j, p] of lista.entries()) {
      const cual = `El elemento ${j + 1} de "${campo}" de ${donde.toLowerCase()}`;
      if (v1) {
        if (typeof p !== "string") return { ok: false, error: `${cual} no es texto.` };
        items.push({ texto: p, icono: "workProduct" });
        continue;
      }
      if (!esObjeto(p) || typeof p.texto !== "string")
        return { ok: false, error: `${cual} no tiene un "texto" de texto.` };
      if (!esIcono(p.icono))
        return { ok: false, error: `${cual} tiene un icono desconocido.` };
      items.push({ texto: p.texto, icono: p.icono });
    }
    return { ok: true, items };
  };

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

    const deFase: Record<"entrada" | "salida", Producto[]> = { entrada: [], salida: [] };
    for (const campo of ["entrada", "salida"] as const) {
      const r = productos(cruda[campo], campo, donde);
      if (!r.ok) return r;
      deFase[campo] = r.items;
    }
    if (!Array.isArray(cruda.tareas))
      return { ok: false, error: `${donde} no tiene "tareas" como lista.` };

    const tareas: Tarea[] = [];
    for (const [j, t] of cruda.tareas.entries()) {
      const cualTarea = `La tarea ${j + 1} de ${donde.toLowerCase()}`;
      if (!esObjeto(t) || typeof t.id !== "string" || typeof t.nombre !== "string")
        return { ok: false, error: `${cualTarea} no tiene "id" y "nombre" de texto.` };
      if (t.descripcion !== undefined && typeof t.descripcion !== "string")
        return { ok: false, error: `${cualTarea} tiene una "descripcion" que no es texto.` };
      if (!v1 && !esIcono(t.icono))
        return { ok: false, error: `${cualTarea} tiene un icono desconocido.` };
      const icono: IdIcono = v1 ? "task" : (t.icono as IdIcono);

      // A v1 or v2 Tarea carries none of the three fields: they migrate as empty.
      const roles: RolTarea[] = [];
      const deTarea: Record<"entrada" | "salida", Producto[]> = { entrada: [], salida: [] };
      if (!v1 && !v2) {
        if (!Array.isArray(t.roles))
          return { ok: false, error: `${cualTarea} no tiene "roles" como lista.` };
        for (const [k, r] of t.roles.entries()) {
          if (!esObjeto(r) || typeof r.rol !== "string")
            return { ok: false, error: `El rol ${k + 1} de ${cualTarea.toLowerCase()} no tiene un "rol" de texto.` };
          if (!esPapel(r.papel))
            return { ok: false, error: `El rol ${k + 1} de ${cualTarea.toLowerCase()} tiene un papel que no es "perform" ni "assist".` };
          roles.push({ rol: r.rol, papel: r.papel });
        }
        for (const campo of ["entrada", "salida"] as const) {
          const r = productos(t[campo], campo, cualTarea);
          if (!r.ok) return r;
          deTarea[campo] = r.items;
        }
      }

      const base = { id: t.id, nombre: t.nombre, icono, roles, entrada: deTarea.entrada, salida: deTarea.salida };
      tareas.push(
        t.descripcion === undefined ? base : { ...base, descripcion: t.descripcion },
      );
    }

    // Unknown extra properties are dropped, not rejected.
    fases.push({
      id: cruda.id as string,
      nombre: cruda.nombre as string,
      objetivo: cruda.objetivo as string,
      roles: cruda.roles,
      tareas,
      entrada: deFase.entrada,
      salida: deFase.salida,
    });
  }

  return { ok: true, modelo: { version: VERSION, fases } };
}
