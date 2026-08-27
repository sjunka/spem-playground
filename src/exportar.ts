import type { Modelo } from "./modelo";

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

const ESTILO_SVG = `
  svg { font-family: Geist, system-ui, sans-serif; fill: #2d3142; }
  .t-titulo { font-family: 'Instrument Serif', Georgia, serif; font-size: 34px; fill: #eb6c36; }
  .t-objetivo { font-size: 15px; fill: #6b6f80; }
  .t-nodo { font-size: 16px; font-weight: 500; }
  .t-desc { font-size: 12.5px; fill: #6b6f80; }
  .t-item { font-size: 13px; }
  .t-eyebrow { font-family: 'Geist Mono', ui-monospace, monospace; font-size: 10px;
               letter-spacing: .12em; fill: #6b6f80; }
  .chip rect { fill: none; stroke: #d6d7de; }
  .chip text { font-family: 'Geist Mono', ui-monospace, monospace; font-size: 12px;
               fill: #6b6f80; text-anchor: middle; }
  .panel rect { fill: #ffffff; stroke: #d6d7de; }
  .panel-salida rect { stroke: #eb6c36; }
  .nodo rect { fill: #ffffff; stroke: #2d3142; }
  .flecha { fill: none; stroke: #6b6f80; stroke-width: 1.5; }
`;

/** Serialises the live diagram with its styles inlined, so nothing depends on the page. */
function serializar(svg: SVGSVGElement) {
  const copia = svg.cloneNode(true) as SVGSVGElement;
  copia.removeAttribute("class");
  copia.querySelectorAll("[style]").forEach((el) => el.removeAttribute("style"));
  const estilo = document.createElementNS("http://www.w3.org/2000/svg", "style");
  estilo.textContent = ESTILO_SVG;
  copia.insertBefore(estilo, copia.firstChild);
  return new XMLSerializer().serializeToString(copia);
}

export async function exportarPNG(svg: SVGSVGElement, nombreFase: string) {
  const escala = 3;
  const w = svg.viewBox.baseVal.width;
  const h = svg.viewBox.baseVal.height;
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serializar(svg))}`;

  const img = new Image();
  img.width = w;
  img.height = h;
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error("No se pudo rasterizar el diagrama."));
    img.src = url;
  });
  await document.fonts?.ready;

  const canvas = document.createElement("canvas");
  canvas.width = w * escala;
  canvas.height = h * escala;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  descargar(canvas.toDataURL("image/png"), `${slug(nombreFase)}.png`);
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
