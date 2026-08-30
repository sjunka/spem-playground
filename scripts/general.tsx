/** Escribe las dos versiones del proceso completo en figuras/. `npm run general` */
import { writeFileSync } from "node:fs";
import fuentes from "../src/fuentes.css?inline";
import { versionA, versionB } from "../src/general";
import { seed } from "../src/seed";
import { capturar } from "./capturar";

const modelo = seed();
const versiones = [
  { base: "figuras/general-a-cadena-de-fases", svg: versionA(modelo) },
  { base: "figuras/general-b-carriles-por-rol", svg: versionB(modelo) },
];

const soloSvg = process.argv.includes("--svg");

for (const { base, svg } of versiones) {
  if (soloSvg) {
    writeFileSync(`${base}.svg`, svg);
    console.log(`${base}.svg`);
    continue;
  }
  const [, w, h] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)!;
  capturar(
    `<!doctype html><meta charset="utf-8"><style>${fuentes}body{margin:0;background:#fff}</style>${svg}`,
    base,
    Math.ceil(+w),
    Math.ceil(+h),
  );
}
