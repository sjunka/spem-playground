import estilos from "./estilos.css?inline";
import fuentes from "./fuentes.css?inline";
import type { Modelo, Vista } from "./modelo";

export const slug = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function descargar(url: string, nombre: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
}

// One source of truth for the exported look: the real stylesheet plus the
// base64 font faces, so the raster never falls back to a system typeface.
export const ESTILO_SVG = `
${fuentes}
${estilos}
.nodo, .flecha { animation: none !important; opacity: 1; stroke-dashoffset: 0; }
`;

/** Serialises the live diagram with its styles inlined, so nothing depends on the page. */
function serializar(svg: SVGSVGElement) {
  const copia = svg.cloneNode(true) as SVGSVGElement;
  copia.querySelectorAll("[style]").forEach((el) => el.removeAttribute("style"));
  const estilo = document.createElementNS("http://www.w3.org/2000/svg", "style");
  estilo.textContent = ESTILO_SVG;
  copia.insertBefore(estilo, copia.firstChild);
  return new XMLSerializer().serializeToString(copia);
}

/** One file per Fase and Vista: sixteen in the downloads folder, all distinguishable. */
export const nombreFigura = (nombreFase: string, vista: Vista) =>
  `${slug(nombreFase)}-${vista}`;

export async function exportarPNG(
  svg: SVGSVGElement,
  nombreFase: string,
  vista: Vista,
) {
  const escala = 3;
  const w = svg.viewBox.baseVal.width;
  const h = svg.viewBox.baseVal.height;
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serializar(svg))}`;

  await document.fonts?.ready;
  const img = new Image();
  img.width = w;
  img.height = h;
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error("No se pudo rasterizar el diagrama."));
    img.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = w * escala;
  canvas.height = h * escala;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  descargar(canvas.toDataURL("image/png"), `${nombreFigura(nombreFase, vista)}.png`);
}

export function exportarPDF() {
  window.print();
}

export function exportarJSON(modelo: Modelo) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(modelo, null, 2)], { type: "application/json" }),
  );
  descargar(url, "modelo-de-procesos.json");
  URL.revokeObjectURL(url);
}
