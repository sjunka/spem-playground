/** Renders the four Fases to figuras/*.png via headless Chrome. `npm run figuras` */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { Diagrama } from "../src/Diagrama";
import { layout } from "../src/layout";
import { seed } from "../src/seed";
import { slug } from "../src/exportar";

const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const css = readFileSync(new URL("../src/estilos.css", import.meta.url), "utf8");

mkdirSync("figuras", { recursive: true });

for (const fase of seed().fases) {
  const l = layout(fase);
  const svg = renderToStaticMarkup(<Diagrama l={l} faseId={fase.id} />);
  const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Geist:wght@400;500&family=Geist+Mono&display=swap">
<style>${css}
body{margin:0;background:var(--paper)}
.nodo,.flecha{animation:none!important;opacity:1;stroke-dashoffset:0}</style>
</head><body>${svg}</body></html>`;

  const nombre = slug(fase.nombre);
  writeFileSync(`figuras/${nombre}.html`, html);
  execFileSync(CHROME, [
    "--headless",
    "--disable-gpu",
    "--hide-scrollbars",
    "--virtual-time-budget=4000",
    "--force-device-scale-factor=3",
    `--window-size=${l.width},${l.height}`,
    `--screenshot=figuras/${nombre}.png`,
    `file://${process.cwd()}/figuras/${nombre}.html`,
  ]);
  rmSync(`figuras/${nombre}.html`);
  console.log(`figuras/${nombre}.png  ${l.width}×${l.height}`);
}
