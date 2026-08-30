import { describe, expect, it } from "vitest";
import { versionA, versionB } from "../general";
import { codigo, consolidado, RELEASES } from "../consolidado";
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
    { nombre: "consolidada — la red completa", svg: consolidado(modelo), ancho: 174, fs: 10 },
  ];

  for (const { nombre, svg, ancho, fs } of casos) {
    it(`${nombre} dibuja las cuatro Fases, sus Tareas y todos los Roles`, () => {
      for (const fase of modelo.fases) {
        expect(svg).toContain(esc(fase.nombre.split(":")[0].toUpperCase()));
        // El nombre del Rol en la celda va a 6.5px, mucho más estrecho.
        for (const tarea of fase.tareas)
          expect([tarea.id, contiene(svg, tarea.nombre, ancho, fs)]).toEqual([tarea.id, true]);
        for (const rol of fase.roles)
          expect([rol, contiene(svg, rol, 70, 6.5) || contiene(svg, rol, 210, 9.5)]).toEqual([
            rol,
            true,
          ]);
      }
    });

    it(`${nombre} cierra el SVG con un viewBox legible`, () => {
      const m = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
      expect(m).not.toBeNull();
      expect(+m![2]).toBeGreaterThan(600);
      expect(svg.trimEnd().endsWith("</svg>")).toBe(true);
    });
  }

  it("la figura consolidada cierra el ciclo: cuatro decisiones, cuatro retornos y la retroalimentación", () => {
    const svg = consolidado(modelo);
    // Un No y un Sí por decisión; el del prototipo validado marca el R0 en su Sí.
    expect(svg.match(/>No</g)?.length).toBe(4);
    expect(svg.match(/>Sí</g)?.length).toBe(3);
    expect(svg).toContain("Sí · R0");
    // Cuatro retornos punteados, más el trazo de la leyenda.
    expect(svg.match(/stroke-dasharray="5 4"/g)?.length).toBe(5);
    // La retroalimentación va en azul y con su propio trazo, no es un rechazo.
    expect(svg.match(/stroke-dasharray="2 5"/g)?.length).toBe(2);
    expect(svg).toContain("retroalimentación al backlog");
    expect(svg).toContain("INICIO");
    expect(svg).toContain("FIN");
  });

  it("la figura consolidada ata cada Rol con las Tareas que ejecuta", () => {
    const svg = consolidado(modelo);
    expect(svg).toContain("QUIÉN HACE QUÉ");
    // El código aparece dos veces por Tarea: en su celda y en el panel de Roles.
    for (const fase of modelo.fases)
      for (const t of fase.tareas) {
        const veces = svg.match(new RegExp(`>${codigo(t.id).replace(".", "\\.")}<`, "g"))?.length ?? 0;
        expect([t.id, veces >= 2]).toEqual([t.id, true]);
      }
  });

  it("la figura consolidada trae el tiempo, los releases y la cadena SDD", () => {
    const svg = consolidado(modelo);
    expect(svg).toContain("ITERACIÓN 0");
    expect(svg).toContain("SEM 10–22");
    for (const [id] of RELEASES) expect([id, svg.includes(`>${id}<`)]).toEqual([id, true]);
    expect(svg).toContain("Constitution.md");
    expect(svg).toContain("SPEC-DRIVEN DEVELOPMENT");
  });
});
