import { describe, expect, it } from "vitest";
import { ESTEREOTIPOS, layout, type Nodo } from "../layout";
import { seed } from "../seed";
import type { Fase, Vista } from "../modelo";
import { VISTAS } from "../modelo";

const fases = seed().fases;
const fase1 = fases[0];

const solapan = (a: Nodo, b: Nodo) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

const sinSolapes = (nodos: Nodo[]) => {
  for (let i = 0; i < nodos.length; i++)
    for (let j = i + 1; j < nodos.length; j++)
      expect([nodos[i].id, nodos[j].id, solapan(nodos[i], nodos[j])]).toEqual([
        nodos[i].id,
        nodos[j].id,
        false,
      ]);
};

/** The types a figure actually draws: the title glyph plus every node's own. */
const dibujados = (l: ReturnType<typeof layout>) =>
  new Set(["phase", ...l.nodos.map((n) => n.icono)]);

const vacia: Fase = { ...fase1, tareas: [], roles: [], entrada: [], salida: [] };

describe("las cuatro vistas", () => {
  it("da el mismo tipo a las cuatro y no rompe con una Fase vacía", () => {
    for (const vista of VISTAS) {
      const l = layout(vacia, vista);
      expect(l.width).toBeGreaterThan(0);
      expect(l.height).toBeGreaterThan(0);
      expect(l.leyenda.entradas.map((e) => e.icono)).toEqual(["phase"]);
    }
  });

  it("rotula cada figura con el nombre de su vista", () => {
    const nombres = VISTAS.map((v) => layout(fase1, v).titulo.subtitulo);
    expect(nombres).toEqual(["Resumen", "Flujo", "Roles", "Descomposición"]);
    for (const vista of VISTAS)
      expect(layout(fase1, vista).titulo.nombre).toBe(fase1.nombre);
  });

  it("lista en la leyenda exactamente los tipos que la figura usa", () => {
    for (const fase of fases)
      for (const vista of VISTAS) {
        const l = layout(fase, vista);
        const enLeyenda = new Set(l.leyenda.entradas.map((e) => e.icono));
        if (vista === "resumen") continue; // los paneles y chips no son nodos
        expect(enLeyenda).toEqual(dibujados(l));
      }
  });

  it("dibuja cada Tarea exactamente una vez en las cuatro vistas", () => {
    for (const fase of fases)
      for (const vista of VISTAS) {
        const ids = layout(fase, vista).nodos.map((n) => n.id);
        for (const tarea of fase.tareas)
          expect(ids.filter((id) => id === tarea.id)).toHaveLength(1);
      }
  });

  it("no solapa ningún par de nodos", () => {
    for (const fase of fases)
      for (const vista of VISTAS) sinSolapes(layout(fase, vista).nodos);
  });
});

describe("aristas y estereotipos", () => {
  it("separa el tramo vertical de las aristas que comparten canal", () => {
    // La Fase 4 dibuja seis aristas «perform» desde la misma columna, apiladas a
    // lo largo de toda la figura: con un solo giro se fundirían en una vertical
    // imposible de seguir. Cada arista del canal gira en su propia x.
    for (const fase of fases) {
      const l = layout(fase, "roles");
      for (const estereotipo of [ESTEREOTIPOS.perform, ESTEREOTIPOS.assist]) {
        const giros = l.flechas
          .filter((f) => f.etiqueta?.texto === estereotipo)
          .map((f) => f.etiqueta!.x);
        if (giros.length > 1) expect(new Set(giros).size).toBe(giros.length);
      }
    }
  });

  it("no imprime dos estereotipos en el mismo punto", () => {
    for (const fase of fases)
      for (const vista of VISTAS) {
        const puestas = layout(fase, vista)
          .flechas.filter((f) => f.etiqueta)
          .map((f) => `${f.etiqueta!.x},${f.etiqueta!.y}`);
        expect(new Set(puestas).size).toBe(puestas.length);
      }
  });
});

describe("vista Descomposición", () => {
  const vista: Vista = "descomposicion";

  it("cuelga las Tareas de la Fase como nodo raíz", () => {
    for (const fase of fases) {
      const l = layout(fase, vista);
      expect(l.nodos).toHaveLength(fase.tareas.length + 1);
      const raiz = l.nodos[0];
      expect(raiz.id).toBe(fase.id);
      expect(raiz.icono).toBe("phase");
      for (const hijo of l.nodos.slice(1)) {
        expect(hijo.y).toBeGreaterThanOrEqual(raiz.y + raiz.h);
        expect(hijo.x).toBeGreaterThan(raiz.x);
      }
    }
  });

  it("etiqueta cada arista con «include» y no dibuja ninguna otra", () => {
    for (const fase of fases) {
      const l = layout(fase, vista);
      expect(l.flechas).toHaveLength(fase.tareas.length);
      for (const f of l.flechas) expect(f.etiqueta?.texto).toBe(ESTEREOTIPOS.include);
    }
  });

  it("no dibuja paneles ni chips", () => {
    const l = layout(fases[3], vista);
    expect(l.paneles).toHaveLength(0);
    expect(l.chips).toHaveLength(0);
  });
});

describe("vista Roles", () => {
  const vista: Vista = "roles";

  it("pone quien ejecuta a la izquierda y quien asiste a la derecha", () => {
    for (const fase of fases) {
      const l = layout(fase, vista);
      const tareas = l.nodos.filter((n) => fase.tareas.some((t) => t.id === n.id));
      const izq = Math.min(...tareas.map((n) => n.x));
      const der = Math.max(...tareas.map((n) => n.x + n.w));
      for (const flecha of l.flechas) {
        const nums = flecha.d.match(/-?\d+(\.\d+)?/g)!.map(Number);
        if (flecha.etiqueta?.texto === ESTEREOTIPOS.perform)
          expect(nums[0]).toBeLessThanOrEqual(izq);
        else expect(nums[nums.length - 2]).toBeGreaterThanOrEqual(der);
      }
    }
  });

  it("dibuja una arista etiquetada por cada par (Rol, Tarea) del modelo", () => {
    for (const fase of fases) {
      const l = layout(fase, vista);
      const pares = fase.tareas.flatMap((t) => t.roles);
      expect(l.flechas).toHaveLength(pares.length);
      const cuenta = (papel: "perform" | "assist") =>
        l.flechas.filter((f) => f.etiqueta?.texto === ESTEREOTIPOS[papel]).length;
      expect(cuenta("perform")).toBe(pares.filter((r) => r.papel === "perform").length);
      expect(cuenta("assist")).toBe(pares.filter((r) => r.papel === "assist").length);
    }
  });

  it("dibuja un nodo por Rol usado, y ninguno que la Fase no declare", () => {
    for (const fase of fases) {
      const l = layout(fase, vista);
      const roles = l.nodos.filter((n) => n.icono === "role");
      const ejecutan = new Set(
        fase.tareas.flatMap((t) => t.roles.filter((r) => r.papel === "perform").map((r) => r.rol)),
      );
      const asisten = new Set(
        fase.tareas.flatMap((t) => t.roles.filter((r) => r.papel === "assist").map((r) => r.rol)),
      );
      expect(roles).toHaveLength(ejecutan.size + asisten.size);
      for (const n of roles) expect(fase.roles).toContain(n.lineas.join(" "));
    }
  });

  it("repite en ambas columnas un Rol que ejecuta unas Tareas y asiste a otras", () => {
    const fase: Fase = {
      ...fase1,
      roles: ["Ana"],
      tareas: [
        { ...fase1.tareas[0], roles: [{ rol: "Ana", papel: "perform" }] },
        { ...fase1.tareas[1], roles: [{ rol: "Ana", papel: "assist" }] },
      ],
    };
    const roles = layout(fase, vista).nodos.filter((n) => n.icono === "role");
    expect(roles).toHaveLength(2);
    expect(roles[0].x).not.toBe(roles[1].x);
  });

  it("sigue siendo válida con una Tarea sin Roles", () => {
    const fase: Fase = { ...fase1, tareas: fase1.tareas.map((t) => ({ ...t, roles: [] })) };
    const l = layout(fase, vista);
    expect(l.flechas).toHaveLength(0);
    expect(l.nodos).toHaveLength(fase.tareas.length);
    expect(l.height).toBeGreaterThan(0);
  });
});

describe("vista Flujo", () => {
  const vista: Vista = "flujo";

  it("apila las Tareas en su orden declarado, en la columna central", () => {
    for (const fase of fases) {
      const l = layout(fase, vista);
      const tareas = fase.tareas.map((t) => l.nodos.find((n) => n.id === t.id)!);
      for (let i = 0; i < tareas.length - 1; i++) {
        expect(tareas[i].y).toBeLessThan(tareas[i + 1].y);
        expect(tareas[i].x).toBe(tareas[i + 1].x);
      }
    }
  });

  it("pone la Entrada de cada Tarea a su izquierda y la Salida a su derecha", () => {
    for (const fase of fases) {
      const l = layout(fase, vista);
      for (const tarea of fase.tareas) {
        const centro = l.nodos.find((n) => n.id === tarea.id)!;
        const productos = l.nodos.filter((n) => n.id.startsWith(`${tarea.id}-`));
        const izq = productos.filter((n) => n.x < centro.x);
        const der = productos.filter((n) => n.x > centro.x);
        expect(izq).toHaveLength(tarea.entrada.length);
        expect(der).toHaveLength(tarea.salida.length);
        for (const n of izq) expect(n.x + n.w).toBeLessThanOrEqual(centro.x);
        for (const n of der) expect(n.x).toBeGreaterThanOrEqual(centro.x + centro.w);
      }
    }
  });

  it("cuenta una arista por Producto de Trabajo más el flujo entre Tareas", () => {
    for (const fase of fases) {
      const l = layout(fase, vista);
      const productos = fase.tareas.reduce(
        (n, t) => n + t.entrada.length + t.salida.length,
        0,
      );
      expect(l.flechas).toHaveLength(productos + Math.max(0, fase.tareas.length - 1));
      const con = (texto: string) =>
        l.flechas.filter((f) => f.etiqueta?.texto === texto).length;
      expect(con(ESTEREOTIPOS.entrada)).toBe(
        fase.tareas.reduce((n, t) => n + t.entrada.length, 0),
      );
      expect(con(ESTEREOTIPOS.salida)).toBe(
        fase.tareas.reduce((n, t) => n + t.salida.length, 0),
      );
      // Las flechas de flujo entre Tareas van sin estereotipo.
      expect(l.flechas.filter((f) => !f.etiqueta)).toHaveLength(
        Math.max(0, fase.tareas.length - 1),
      );
    }
  });

  it("crece hacia abajo y no hacia los lados", () => {
    const anchos = fases.map((f) => layout(f, vista).width);
    expect(new Set(anchos).size).toBe(1);
    const porTareas = [...fases].sort((a, b) => a.tareas.length - b.tareas.length);
    const corta = layout(porTareas[0], vista);
    const larga = layout(porTareas[porTareas.length - 1], vista);
    expect(larga.width).toBe(corta.width);
    expect(larga.height).toBeGreaterThan(corta.height);
  });

  it("sigue siendo válida con una Tarea sin Productos de Trabajo", () => {
    const fase: Fase = {
      ...fase1,
      tareas: fase1.tareas.map((t) => ({ ...t, entrada: [], salida: [] })),
    };
    const l = layout(fase, vista);
    expect(l.nodos).toHaveLength(fase.tareas.length);
    expect(l.height).toBeGreaterThan(0);
  });
});
