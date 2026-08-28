/** Rasteriza un SVG con Chrome headless. Lo comparten los tres scripts de figuras. */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

export function capturar(html: string, base: string, w: number, h: number, escala = 2) {
  mkdirSync("figuras", { recursive: true });
  const tmp = `${base}.tmp.html`;
  writeFileSync(tmp, html);
  execFileSync(CHROME, [
    "--headless",
    "--disable-gpu",
    "--hide-scrollbars",
    `--force-device-scale-factor=${escala}`,
    `--window-size=${w},${h}`,
    `--screenshot=${base}.png`,
    `file://${process.cwd()}/${tmp}`,
  ]);
  rmSync(tmp);
  console.log(`${base}.png  ${w}x${h}`);
}
