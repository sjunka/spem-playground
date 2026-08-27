import { describe, expect, it } from "vitest";
import { validar } from "../validacion";
import { seed } from "../seed";

const modelo = seed();
const conFase = (parche: Record<string, unknown>) => ({
  version: 1,
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
    expect(error({ ...modelo, version: 2 })).toMatch(/Versión/);
  });

  it("rejects a payload without fases", () => {
    expect(error({ version: 1 })).toMatch(/fases/);
  });

  it("rejects a Fase missing a required field", () => {
    const { objetivo: _, ...sinObjetivo } = modelo.fases[0];
    expect(error({ version: 1, fases: [sinObjetivo] })).toMatch(/objetivo/);
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
