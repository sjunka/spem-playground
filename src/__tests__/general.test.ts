import { describe, expect, it } from "vitest";
import { versionA, versionB } from "../general";
import { seed } from "../seed";
import { esc } from "../epf-svg";
import { wrap } from "../layout";

const modelo = seed();
// El wrap parte los textos largos, así que la figura se busca por trozos.
const contiene = (svg: string, texto: string, ancho: number, fs: number) =>
  wrap(texto, fs, ancho).every((linea) => svg.includes(esc(linea)));

describe("las dos versiones del proceso completo", () => {
  const casos = [
    { nombre: "A — cadena de Fases", svg: versionA(modelo), ancho: 380, fs: 12 },
    { nombre: "B — carriles por Rol", svg: versionB(modelo), ancho: 320, fs: 9.5 },
  ];

  for (const { nombre, svg, ancho, fs } of casos) {
    it(`${nombre} dibuja las cuatro Fases, sus Tareas y todos los Roles`, () => {
      for (const fase of modelo.fases) {
        expect(svg).toContain(esc(fase.nombre.split(":")[0].toUpperCase()));
        for (const tarea of fase.tareas)
          expect([tarea.id, contiene(svg, tarea.nombre, ancho, fs)]).toEqual([tarea.id, true]);
        for (const rol of fase.roles)
          expect([rol, contiene(svg, rol, 210, 9.5)]).toEqual([rol, true]);
      }
    });

    it(`${nombre} cierra el SVG con un viewBox legible`, () => {
      const m = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
      expect(m).not.toBeNull();
      expect(+m![2]).toBeGreaterThan(600);
      expect(svg.trimEnd().endsWith("</svg>")).toBe(true);
    });
  }
});
