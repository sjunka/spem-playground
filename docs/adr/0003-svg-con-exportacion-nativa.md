# SVG con exportación nativa, sin html2canvas ni jsPDF

El diagrama se renderiza como un único `<svg>` en JSX. El PNG se produce serializando
ese SVG con `XMLSerializer`, dibujándolo en un `<canvas>` a 3x y llamando `toBlob`. El
PDF se produce con CSS `@media print` y `window.print()`, donde el usuario elige
"Guardar como PDF".

Ambas rutas tienen cero dependencias. Las alternativas habituales no: `html2canvas`
rasteriza (se pierde el vector), mide mal las fuentes web y descarta parte del CSS;
`jsPDF` + `svg2pdf.js` añaden ~350kb y obligan a gestionar a mano tamaño de página,
márgenes y cortes multipágina.

## Consecuencias

El PDF requiere un paso extra del usuario en el diálogo de impresión del navegador, en
vez de descargarse de un clic. Si eso llega a molestar, `jsPDF` es la vía de escape y
el SVG ya está listo para ella.
