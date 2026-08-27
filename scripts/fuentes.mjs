/** Regenerates src/fuentes.css: the latin subsets of the three faces, base64-inlined
 *  so an exported diagram never falls back to a system typeface. `npm run fuentes` */
import { writeFileSync } from "node:fs";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

const FAMILIAS = [
  "Instrument+Serif:ital,wght@0,400",
  "Geist:wght@400;500",
  "Geist+Mono:wght@400",
];

const bloques = [];
for (const familia of FAMILIAS) {
  const css = await (
    await fetch(`https://fonts.googleapis.com/css2?family=${familia}&display=swap`, {
      headers: { "User-Agent": UA },
    })
  ).text();

  for (const cara of css.split("@font-face").slice(1)) {
    // Only the latin subset — the diagrams are Spanish.
    if (!cara.includes("U+0000-00FF")) continue;
    const url = cara.match(/url\((https:[^)]+)\)/)[1];
    const b64 = Buffer.from(await (await fetch(url)).arrayBuffer()).toString("base64");
    bloques.push(
      `@font-face {${cara
        .slice(cara.indexOf("{") + 1, cara.lastIndexOf("}"))
        .replace(/src: url\(https:[^)]+\)/, `src: url(data:font/woff2;base64,${b64})`)
        .replace(/\s*unicode-range:[^;]+;/, "")}}`,
    );
  }
}

writeFileSync("src/fuentes.css", `${bloques.join("\n")}\n`);
console.log(`src/fuentes.css — ${bloques.length} caras`);
