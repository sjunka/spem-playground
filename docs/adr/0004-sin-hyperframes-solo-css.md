# Animación con transiciones CSS, no con HyperFrames

Se pidió usar la skill `hyperframes-animation` para animar el playground. No la usamos.

`hyperframes-animation` depende de `hyperframes-core`, que no está instalado, y su
contrato — una única timeline pausada, seek-safe, determinista, sin repeticiones
infinitas — existe para renderizar vídeo cuadro a cuadro. Ese contrato es hostil a una
interfaz interactiva, donde la animación se dispara por eventos del usuario en momentos
impredecibles. Además, la animación nunca aparece en el PNG ni en el PDF: el entregable
son fotogramas fijos.

En su lugar la animación es CSS pura sobre el SVG: los nodos entran con fade y
desplazamiento escalonado, y las flechas se dibujan animando `stroke-dashoffset`. Cero
dependencias y sin efecto sobre la exportación.

## Consecuencias

No hay modo presentación reproducible ("ver la Fase construirse paso a paso"). Si se
quiere, la vía es GSAP dentro de la app, no HyperFrames; HyperFrames solo tendría
sentido para un vídeo aparte, como segundo artefacto.
