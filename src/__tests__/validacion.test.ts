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
  version: 3,
  fases: [{ ...modelo.fases[0], ...parche }],
});

const error = (entrada: unknown) => {
  const r = validar(entrada);
  expect(r.ok).toBe(false);
  return r.ok ? "" : r.error;
};

/** A model in the shape the app shipped before Roles and Productos per Tarea. */
const V2 = {
  version: 2,
  fases: [
    {
      ...modelo.fases[0],
      tareas: modelo.fases[0].tareas.map(({ roles: _r, entrada: _e, salida: _s, ...t }) => t),
    },
  ],
};

describe("validar", () => {
  it("migrates a version 2 model, leaving the three new Tarea fields empty", () => {
    const r = validar(JSON.parse(JSON.stringify(V2)));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.modelo.version).toBe(3);
    const [fase] = r.modelo.fases;
    expect(fase.tareas.map((t) => t.nombre)).toEqual(
      V2.fases[0].tareas.map((t) => t.nombre),
    );
    for (const tarea of fase.tareas) {
      expect(tarea.roles).toEqual([]);
      expect(tarea.entrada).toEqual([]);
      expect(tarea.salida).toEqual([]);
    }
    // La Entrada y la Salida de la Fase sobreviven intactas.
    expect(fase.entrada).toEqual(modelo.fases[0].entrada);
    expect(fase.salida).toEqual(modelo.fases[0].salida);
  });

  it("migrates a version 1 Tarea to the three new fields as well", () => {
    const r = validar(V1);
    expect(r.ok && r.modelo.fases[0].tareas.every((t) => t.roles.length === 0)).toBe(true);
  });

  it("rejects a papel that is neither perform nor assist", () => {
    expect(
      error(
        conFase({
          tareas: [
            {
              id: "t",
              nombre: "T",
              icono: "task",
              roles: [{ rol: "Ana", papel: "supervisa" }],
              entrada: [],
              salida: [],
            },
          ],
        }),
      ),
    ).toMatch(/papel/i);
  });

  it("validates a Tarea's Entrada as strictly as the Fase's", () => {
    const tarea = (entrada: unknown) => ({
      id: "t",
      nombre: "T",
      icono: "task",
      roles: [],
      entrada,
      salida: [],
    });
    expect(error(conFase({ tareas: [tarea(["Planos del terreno"])] }))).toMatch(/texto/);
    expect(
      error(conFase({ tareas: [tarea([{ texto: "Planos", icono: "unicornio" }])] })),
    ).toMatch(/icono/i);
    expect(error(conFase({ tareas: [tarea("Planos")] }))).toMatch(/entrada/);
  });

  it("accepts a valid version 3 Tarea and keeps its Roles", () => {
    const r = validar(
      conFase({
        roles: ["Ana"],
        tareas: [
          {
            id: "t",
            nombre: "T",
            icono: "task",
            roles: [{ rol: "Ana", papel: "assist" }],
            entrada: [{ texto: "Planos", icono: "workProduct" }],
            salida: [],
          },
        ],
      }),
    );
    expect(r.ok && r.modelo.fases[0].tareas[0].roles).toEqual([
      { rol: "Ana", papel: "assist" },
    ]);
  });

  it("round-trips a model through export and import unchanged", () => {
    const r = validar(JSON.parse(JSON.stringify(modelo)));
    expect(r.ok && r.modelo).toEqual(modelo);
  });

  it("rejects an unknown version", () => {
    expect(error({ ...modelo, version: 9 })).toMatch(/Versión/);
  });

  it("migrates a version 1 model without losing any text", () => {
    const r = validar(V1);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.modelo.version).toBe(3);
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

  it("keeps the icons a current-version model already carries", () => {
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

  it("rejects a Producto de Trabajo that is still bare text at the current version", () => {
    expect(error(conFase({ entrada: ["Planos del terreno"] }))).toMatch(/entrada/);
  });

  it("rejects a payload without fases", () => {
    expect(error({ version: 3 })).toMatch(/fases/);
  });

  it("rejects a Fase missing a required field", () => {
    const { objetivo: _, ...sinObjetivo } = modelo.fases[0];
    expect(error({ version: 3, fases: [sinObjetivo] })).toMatch(/objetivo/);
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
