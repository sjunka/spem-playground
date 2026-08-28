import { describe, expect, it } from "vitest";
import { contorno, FORMA } from "../formas";
import { IDS_ICONO } from "../iconos";

describe("contorno", () => {
  it("da una forma a los quince tipos SPEM", () => {
    for (const id of IDS_ICONO) expect(FORMA[id]).toBeTruthy();
  });

  it("el chevron de una Tarea acaba en punta y cierra", () => {
    const d = contorno("task", 0, 0, 200, 80);
    expect(d).toContain("L200 40");
    expect(d.endsWith("Z")).toBe(true);
  });

  it("el Hito es un hexágono con dos puntas", () => {
    expect(contorno("milestone", 0, 0, 200, 80)).toMatch(/^M0 40 L28 0/);
  });

  it("una caja estrecha no invierte la punta", () => {
    expect(contorno("task", 0, 0, 40, 20)).toContain("H30");
  });
});
