import { describe, expect, it } from "vitest";
import { ETIQUETAS, ICONOS, IDS_ICONO } from "../iconos";

describe("iconos", () => {
  // Both maps are Record<IdIcono, string>, so the type cannot tell a label from a
  // path. It could not stop a path being pasted into ETIQUETAS, and one was.
  it("labels every type in prose rather than in path data", () => {
    for (const id of IDS_ICONO) {
      expect(ETIQUETAS[id], id).not.toMatch(/^[Mm][\s\d-]/);
      expect(ETIQUETAS[id].length, id).toBeLessThan(30);
    }
  });

  it("draws every type with path data that starts at a move", () => {
    for (const id of IDS_ICONO) expect(ICONOS[id], id).toMatch(/^M[\s\d-]/);
  });
});
