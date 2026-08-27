import { describe, expect, it } from "vitest";
import { seed } from "../seed";

const fases = seed().fases;
const textos = (items: { texto: string }[]) => items.map((p) => p.texto);

/**
 * The per-Tarea split is inferred, not documented (ver ADR-0006). These are the
 * two invariants that keep the inference honest, plus the referential integrity
 * the views depend on.
 */
describe("el reparto por Tarea del seed", () => {
  it("da a cada Tarea al menos un Rol que la ejecuta", () => {
    for (const fase of fases)
      for (const tarea of fase.tareas)
        expect([tarea.id, tarea.roles.some((r) => r.papel === "perform")]).toEqual([
          tarea.id,
          true,
        ]);
  });

  it("solo referencia Roles declarados en su Fase", () => {
    for (const fase of fases)
      for (const tarea of fase.tareas)
        for (const r of tarea.roles) expect(fase.roles).toContain(r.rol);
  });

  it("asigna cada Producto de Trabajo de la Fase a alguna Tarea", () => {
    for (const fase of fases) {
      const enTareas = {
        entrada: new Set(fase.tareas.flatMap((t) => textos(t.entrada))),
        salida: new Set(fase.tareas.flatMap((t) => textos(t.salida))),
      };
      for (const campo of ["entrada", "salida"] as const)
        for (const producto of fase[campo])
          expect([fase.id, campo, producto.texto, enTareas[campo].has(producto.texto)]).toEqual(
            [fase.id, campo, producto.texto, true],
          );
    }
  });

  it("mantiene el Tipo SPEM que la Fase ya usa para el mismo artefacto", () => {
    for (const fase of fases) {
      const tipos = new Map(
        [...fase.entrada, ...fase.salida].map((p) => [p.texto, p.icono]),
      );
      for (const tarea of fase.tareas)
        for (const p of [...tarea.entrada, ...tarea.salida])
          if (tipos.has(p.texto)) expect([p.texto, p.icono]).toEqual([p.texto, tipos.get(p.texto)]);
    }
  });

  it("cuelga la Entrada de la Fase 4 de la Tarea de construcción en paralelo", () => {
    const fase4 = fases[3];
    const paralelo = fase4.tareas.find((t) => t.nombre.includes("paralelo"))!;
    // Los cinco incrementos sucesivos del documento, agrupados en tres entradas.
    const incrementos = fase4.entrada.filter((p) =>
      /dron|riego|clim/i.test(p.texto),
    );
    expect(incrementos).toHaveLength(3);
    for (const inc of incrementos)
      expect(textos(paralelo.entrada)).toContain(inc.texto);
  });
});
