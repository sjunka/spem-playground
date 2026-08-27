/** Renders the four Fases to figuras/*.png via headless Chrome. `npm run figuras` */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { Diagrama } from "../src/Diagrama";
import { layout } from "../src/layout";
import { seed } from "../src/seed";
import { ESTILO_SVG, slug } from "../src/exportar";

const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
mkdirSync("figuras", { recursive: true });

for (const fase of seed().fases) {
  const l = layout(fase);
  const svg = renderToStaticMarkup(<Diagrama l={l} faseId={fase.id} />);
  // Same style source as the in-app PNG export, fonts included.
  const html = `<!doctype html><html><head><meta charset="utf-8">
<style>${ESTILO_SVG}
body { margin: 0; background: #f5f5f5; }</style>
</head><body>${svg}</body></html>`;

  const nombre = slug(fase.nombre);
  writeFileSync(`figuras/${nombre}.html`, html);
  execFileSync(CHROME, [
    "--headless",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=3",
    `--window-size=${l.width},${l.height}`,
    `--screenshot=figuras/${nombre}.png`,
    `file://${process.cwd()}/figuras/${nombre}.html`,
  ]);
  rmSync(`figuras/${nombre}.html`);
  console.log(`figuras/${nombre}.png  ${l.width}×${l.height}`);
}
