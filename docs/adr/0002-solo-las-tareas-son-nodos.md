# Solo las Tareas se dibujan como nodos

Un diagrama SPEM literal dibuja cada Rol, Tarea y Producto de Trabajo como un nodo
propio. Aplicado a nuestras Fases eso da entre 15 y 24 cajas por diagrama — la Fase 4
sola tiene 24. La guía de diseño de diagramas del proyecto fija la densidad objetivo
en 4/10 y considera que por encima de 9 nodos ya son dos diagramas.

Decidimos que **solo las Tareas son nodos**. Las Entradas y Salidas se agrupan en dos
paneles contenedores con sus ítems como líneas de texto, y los Roles se dibujan como
una banda de chips bajo el título. Así la Fase 4 pasa de 24 cajas a 6 nodos, 2 paneles
y una banda, y cada Fase sigue cabiendo en una sola imagen legible al imprimirse.

## Considered Options

- **Partir las Fases grandes en dos imágenes** — mantiene cada elemento como nodo, pero
  convierte 4 imágenes en 6 o 7 y parte la narrativa de una Fase por la mitad.
- **Dibujarlo todo en una imagen** — literal y completo, pero con etiquetas de ~9px que
  no se leen impresas.
