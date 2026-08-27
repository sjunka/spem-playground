import type { Fase } from "./modelo";

/**
 * Applies an edited list of Fase Roles, keeping the Tareas consistent: a Rol
 * renamed in the Fase is renamed in every Tarea that used it, and a Rol deleted
 * from the Fase disappears from them, so no Tarea points at a Rol the Fase lacks.
 *
 * Rename is detected positionally, which is what the list editor produces: it
 * edits in place and reorders or deletes whole rows, never both at once.
 */
export function aplicarRoles(fase: Fase, nuevos: string[]): Fase {
  const renombres = new Map<string, string>();
  if (nuevos.length === fase.roles.length) {
    for (const [i, viejo] of fase.roles.entries()) renombres.set(viejo, nuevos[i]);
  }
  const vigentes = new Set(nuevos);

  const tareas = fase.tareas.map((tarea) => {
    const vistos = new Set<string>();
    const roles = tarea.roles
      .map((r) => ({ ...r, rol: renombres.get(r.rol) ?? r.rol }))
      .filter((r) => {
        if (!vigentes.has(r.rol) || vistos.has(r.rol)) return false;
        vistos.add(r.rol);
        return true;
      });
    return { ...tarea, roles };
  });

  return { ...fase, roles: nuevos, tareas };
}
