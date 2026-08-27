import { describe, expect, it } from "vitest";
import { slug } from "../exportar";

describe("slug", () => {
  it("derives a distinct filename from each Fase name", () => {
    expect(slug("Fase 1: Especificación global de nivel cero")).toBe(
      "fase-1-especificacion-global-de-nivel-cero",
    );
    expect(slug("Fase 4: Ciclo de crecimiento")).toBe("fase-4-ciclo-de-crecimiento");
  });
});
