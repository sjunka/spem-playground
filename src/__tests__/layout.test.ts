import { describe, expect, it } from "vitest";
import { ESCALA, layout } from "../layout";
import { seed } from "../seed";
import type { Fase } from "../modelo";

const fases = seed().fases;
const fase1 = fases[0];
const fase4 = fases[3];

const panel = (f: Fase, rol: "entrada" | "salida") =>
  layout(f).paneles.find((p) => p.tipo === rol);

const puntos = (d: string) => {
  const nums = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  return {
    inicio: { x: nums[0], y: nums[1] },
    fin: { x: nums[nums.length - 2], y: nums[nums.length - 1] },
  };
};

describe("layout", () => {
  it("only Tareas become nodes (ADR-0002)", () => {
    for (const fase of fases) {
      expect(layout(fase).nodos).toHaveLength(fase.tareas.length);
    }
    // Fase 4 carries 24 elements but stays inside the density budget.
    expect(layout(fase4).nodos.length).toBeLessThanOrEqual(8);
  });

  it("wraps a Tarea longer than the node and grows its height", () => {
    const corta: Fase = { ...fase1, tareas: [{ id: "a", nombre: "Corto", icono: "task" as const }] };
    const larga: Fase = {
      ...fase1,
      tareas: [{ id: "a", nombre: "Corto ".repeat(30).trim(), icono: "task" as const }],
    };
    const [nc] = layout(corta).nodos;
    const [nl] = layout(larga).nodos;
    expect(nc.lineas).toHaveLength(1);
    expect(nl.lineas.length).toBeGreaterThan(1);
    expect(nl.h).toBeGreaterThan(nc.h);
  });

  it("stacks Tarea nodes without vertical overlap", () => {
    for (const fase of fases) {
      const nodos = layout(fase).nodos;
      for (let i = 0; i < nodos.length - 1; i++) {
        expect(nodos[i].y + nodos[i].h).toBeLessThanOrEqual(nodos[i + 1].y);
      }
    }
  });

  it("gives every Tarea node an icon channel that the text never crosses", () => {
    for (const fase of fases) {
      const l = layout(fase);
      for (const [i, nodo] of l.nodos.entries()) {
        expect(nodo.icono).toBe(fase.tareas[i].icono);
        expect(nodo.iconoX).toBeGreaterThanOrEqual(nodo.x);
        expect(nodo.iconoX + ESCALA.icono.nodo).toBeLessThanOrEqual(nodo.textoX);
        expect(nodo.textoX).toBeLessThan(nodo.x + nodo.w);
        expect(nodo.iconoY).toBeGreaterThanOrEqual(nodo.y);
        expect(nodo.iconoY + ESCALA.icono.nodo).toBeLessThanOrEqual(nodo.y + nodo.h);
      }
    }
  });

  it("gives every Entrada and Salida item an icon channel of its own", () => {
    for (const fase of fases) {
      const l = layout(fase);
      for (const panel of l.paneles) {
        const origen = panel.tipo === "entrada" ? fase.entrada : fase.salida;
        for (const [i, item] of panel.items.entries()) {
          expect(item.icono).toBe(origen[i].icono);
          expect(item.iconoX).toBeGreaterThanOrEqual(panel.x);
          expect(item.iconoX + ESCALA.icono.item).toBeLessThanOrEqual(item.textoX);
          expect(item.textoX).toBeLessThan(panel.x + panel.w);
        }
      }
    }
  });

  it("wraps a Tarea name that only fit while the icon had no channel", () => {
    // 35 characters: inside the old text width of the box, past the narrowed one.
    const nombre = "Definir contratos de integracion ok";
    const [nodo] = layout({
      ...fase1,
      tareas: [{ id: "a", nombre, icono: "task" as const }],
    }).nodos;
    expect(nodo.lineas).toHaveLength(2);
    expect(nodo.textoX - nodo.x).toBe(16 + ESCALA.icono.nodo + 8);
  });

  it("puts Entrada left of the Tareas column and Salida right of it", () => {
    for (const fase of fases) {
      const { nodos } = layout(fase);
      const izq = Math.min(...nodos.map((n) => n.x));
      const der = Math.max(...nodos.map((n) => n.x + n.w));
      const entrada = panel(fase, "entrada")!;
      const salida = panel(fase, "salida")!;
      expect(entrada.x + entrada.w).toBeLessThanOrEqual(izq);
      expect(salida.x).toBeGreaterThanOrEqual(der);
    }
  });

  it("reports a canvas that contains every element", () => {
    for (const fase of fases) {
      const l = layout(fase);
      const cajas = [
        ...l.nodos,
        ...l.paneles,
        ...l.chips.map((c) => ({ x: c.x, y: c.y, w: c.w, h: c.h })),
      ];
      for (const caja of cajas) {
        expect(caja.x + caja.w).toBeLessThanOrEqual(l.width);
        expect(caja.y + caja.h).toBeLessThanOrEqual(l.height);
        expect(caja.x).toBeGreaterThanOrEqual(0);
        expect(caja.y).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("fits every Roles chip inside the canvas width", () => {
    for (const fase of fases) {
      const l = layout(fase);
      for (const chip of l.chips) expect(chip.x + chip.w).toBeLessThanOrEqual(l.width);
    }
    // Fase 3 and 4 carry six Roles: the band wraps to a second row.
    const filas = new Set(layout(fases[2]).chips.map((c) => c.y));
    expect(filas.size).toBeGreaterThan(1);
  });

  it("anchors consume and produce arrows on a panel edge and a node edge", () => {
    for (const fase of fases) {
      const l = layout(fase);
      const entrada = l.paneles.find((p) => p.tipo === "entrada")!;
      const salida = l.paneles.find((p) => p.tipo === "salida")!;
      const primero = l.nodos[0];
      const ultimo = l.nodos[l.nodos.length - 1];

      const consume = puntos(l.flechas.find((f) => f.tipo === "consume")!.d);
      expect(consume.inicio.x).toBe(entrada.x + entrada.w);
      expect(consume.fin.x).toBe(primero.x);

      const produce = puntos(l.flechas.find((f) => f.tipo === "produce")!.d);
      expect(produce.inicio.x).toBe(ultimo.x + ultimo.w);
      expect(produce.fin.x).toBe(salida.x);
    }
  });

  it("drops the Entrada panel and its arrow when Entrada is empty", () => {
    const l = layout({ ...fase1, entrada: [] });
    expect(l.paneles.find((p) => p.tipo === "entrada")).toBeUndefined();
    expect(l.flechas.some((f) => f.tipo === "consume")).toBe(false);
  });

  it("still lays out a Fase with no Tareas", () => {
    const l = layout({ ...fase1, tareas: [] });
    expect(l.nodos).toHaveLength(0);
    expect(l.flechas).toHaveLength(0);
    expect(l.height).toBeGreaterThan(0);
    expect(l.paneles).toHaveLength(2);
  });
});
