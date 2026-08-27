import { describe, expect, it } from "vitest";
import { aplicarRoles } from "../roles";
import { seed } from "../seed";
import type { Fase } from "../modelo";

const fase: Fase = {
  ...seed().fases[0],
  roles: ["Ana", "Beto"],
  tareas: [
    {
      id: "t",
      nombre: "T",
      icono: "task",
      roles: [
        { rol: "Ana", papel: "perform" },
        { rol: "Beto", papel: "assist" },
      ],
      entrada: [],
      salida: [],
    },
  ],
};

describe("aplicarRoles", () => {
  it("propaga a las Tareas el renombrado de un Rol de la Fase", () => {
    const r = aplicarRoles(fase, ["Ana María", "Beto"]);
    expect(r.tareas[0].roles).toEqual([
      { rol: "Ana María", papel: "perform" },
      { rol: "Beto", papel: "assist" },
    ]);
  });

  it("elimina en cascada un Rol borrado de la Fase", () => {
    const r = aplicarRoles(fase, ["Ana"]);
    expect(r.roles).toEqual(["Ana"]);
    expect(r.tareas[0].roles).toEqual([{ rol: "Ana", papel: "perform" }]);
  });

  it("conserva los papeles al reordenar la lista de Roles", () => {
    const r = aplicarRoles(fase, ["Beto", "Ana"]);
    // Reordenar es un renombrado posicional doble: los papeles siguen al puesto.
    expect(r.tareas[0].roles.map((x) => x.rol).sort()).toEqual(["Ana", "Beto"]);
    expect(r.tareas[0].roles).toHaveLength(2);
  });

  it("no deja nunca una Tarea apuntando a un Rol que la Fase no declara", () => {
    for (const nuevos of [[], ["Ana"], ["Beto"], ["Ana", "Beto", "Caro"]]) {
      const r = aplicarRoles(fase, nuevos);
      for (const rt of r.tareas[0].roles) expect(r.roles).toContain(rt.rol);
    }
  });
});
