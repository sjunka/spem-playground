/** Escribe la figura consolidada del proceso. `npm run consolidado` */
import fuentes from "../src/fuentes.css?inline";
import { consolidado } from "../src/consolidado";
import { seed } from "../src/seed";
import { capturar } from "./capturar";

const svg = consolidado(seed());
const [, w, h] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)!;
capturar(
  `<!doctype html><meta charset="utf-8"><style>${fuentes}body{margin:0;background:#fff}</style>${svg}`,
  "figuras/consolidado-modelo-de-procesos",
  Math.ceil(+w),
  Math.ceil(+h),
);
