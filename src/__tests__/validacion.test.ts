import { describe, expect, it } from "vitest";
import { validar } from "../validacion";
import { seed } from "../seed";

const modelo = seed();

/** A model in the shape the app shipped before icons existed. */
const V1 = {
  version: 1,
  fases: [
    {
      id: "fase-1",
      nombre: "Fase 1: Especificación global de nivel cero",
      objetivo: "Fijar el marco de gobernanza.",
      roles: ["Gerente de proyecto", "Ingeniero de datos"],
      tareas: [
        { id: "t1", nombre: "Definir Constitución", descripcion: "Redactar." },
        { id: "t2", nombre: "Modelar el dominio" },
      ],
      entrada: ["Planos del terreno", "Normatividad vigente"],
      salida: ["Constitution.md"],
    },
  ],
};
const conFase = (parche: Record<string, unknown>) => ({
  version: 2,
  fases: [{ ...modelo.fases[0], ...parche }],
});

const error = (entrada: unknown) => {
  const r = validar(entrada);
  expect(r.ok).toBe(false);
  return r.ok ? "" : r.error;
};

describe("validar", () => {
  it("round-trips a model through export and import unchanged", () => {
    const r = validar(JSON.parse(JSON.stringify(modelo)));
    expect(r.ok && r.modelo).toEqual(modelo);
  });

  it("rejects an unknown version", () => {
    expect(error({ ...modelo, version: 3 })).toMatch(/Versión/);
  });

  it("migrates a version 1 model without losing any text", () => {
    const r = validar(V1);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.modelo.version).toBe(2);
    const [fase] = r.modelo.fases;
    expect(fase.entrada.map((p) => p.texto)).toEqual(V1.fases[0].entrada);
    expect(fase.salida.map((p) => p.texto)).toEqual(V1.fases[0].salida);
    expect(fase.tareas.map((t) => t.nombre)).toEqual(
      V1.fases[0].tareas.map((t) => t.nombre),
    );
    expect(fase.roles).toEqual(V1.fases[0].roles);
  });

  it("defaults a migrated Producto de Trabajo and Tarea to their own type", () => {
    const r = validar(V1);
    expect(r.ok && r.modelo.fases[0].entrada.every((p) => p.icono === "workProduct")).toBe(true);
    expect(r.ok && r.modelo.fases[0].salida.every((p) => p.icono === "workProduct")).toBe(true);
    expect(r.ok && r.modelo.fases[0].tareas.every((t) => t.icono === "task")).toBe(true);
  });

  it("keeps the icons a version 2 model already carries", () => {
    const r = validar(JSON.parse(JSON.stringify(modelo)));
    expect(r.ok && r.modelo).toEqual(modelo);
  });

  it("rejects an icon outside the SPEM set", () => {
    expect(
      error(conFase({ entrada: [{ texto: "Planos", icono: "unicornio" }] })),
    ).toMatch(/icono/i);
    expect(
      error(
        conFase({ tareas: [{ id: "t", nombre: "T", icono: "unicornio" }] }),
      ),
    ).toMatch(/icono/i);
  });

  it("rejects a Producto de Trabajo that is still bare text at version 2", () => {
    expect(error(conFase({ entrada: ["Planos del terreno"] }))).toMatch(/entrada/);
  });

  it("rejects a payload without fases", () => {
    expect(error({ version: 2 })).toMatch(/fases/);
  });

  it("rejects a Fase missing a required field", () => {
    const { objetivo: _, ...sinObjetivo } = modelo.fases[0];
    expect(error({ version: 2, fases: [sinObjetivo] })).toMatch(/objetivo/);
  });

  it("rejects roles as a string instead of coercing it", () => {
    expect(error(conFase({ roles: "Gerente" }))).toMatch(/roles/);
  });

  it("rejects non-object input", () => {
    for (const malo of [null, [], "modelo", 7]) expect(error(malo)).toBeTruthy();
  });

  it("tolerates and drops unrecognised extra properties", () => {
    const r = validar(conFase({ colorFavorito: "azul" }));
    expect(r.ok).toBe(true);
    expect(r.ok && r.modelo.fases[0]).not.toHaveProperty("colorFavorito");
  });

  it("returns a message instead of throwing", () => {
    expect(() => validar(undefined)).not.toThrow();
    expect(error(undefined).length).toBeGreaterThan(0);
  });
});
