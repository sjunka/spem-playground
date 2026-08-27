import type { Fase } from "./modelo";

/**
 * Applies an edited list of Fase Roles, keeping the Tareas consistent: a Rol
 * renamed in the Fase is renamed in every Tarea that used it, and a Rol deleted
 * from the Fase disappears from them, so no Tarea points at a Rol the Fase lacks.
 *
 * Rename is detected positionally, and only when exactly one row changed: that
 * is what typing into the list editor produces. Reordering changes two rows at
 * once, and reading it as a double rename would swap the papeles of the two
 * Roles in every Tarea; deleting changes the length. Both are left alone.
 */
export function aplicarRoles(fase: Fase, nuevos: string[]): Fase {
  const renombres = new Map<string, string>();
  if (nuevos.length === fase.roles.length) {
    const cambiadas = fase.roles.flatMap((viejo, i) =>
      viejo === nuevos[i] ? [] : [[viejo, nuevos[i]] as const],
    );
    if (cambiadas.length === 1) renombres.set(cambiadas[0][0], cambiadas[0][1]);
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
