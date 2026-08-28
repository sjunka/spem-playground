/** Vuelca el SVG de la figura consolidada, sin rasterizar. `npm run svg -- ruta.svg` */
import { writeFileSync } from "node:fs";
import { consolidado } from "../src/consolidado";
import { seed } from "../src/seed";

const destino = process.argv[process.argv.length - 1];
writeFileSync(destino.endsWith(".svg") ? destino : "figuras/consolidado-modelo-de-procesos.svg", consolidado(seed()));
