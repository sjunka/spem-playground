# ADR-0005 — Los defaults del `diagram-design` se aceptan sin personalizar

Fecha: 2026-08-27
Estado: aceptada

## Contexto

El proyecto usa la paleta y la tipografía que trae el skill `diagram-design` sin
tocarlas: papel `#f5f5f5`, tinta `#2d3142`, acento coral `#eb6c36`, muted `#6b6f80`,
hairline `#d6d7de`; Instrument Serif para el título de la **Fase**, Geist para los
nombres de **Tarea**, Geist Mono para eyebrows y chips de **Rol**.

Las figuras se insertan en *Modelo de procesos*, un documento de Word sin identidad
gráfica propia: no hay tokens de marca que respetar ni contra los que contrastar.

## Decisión

Se aceptan los defaults tal cual. No se personaliza la paleta ni la tipografía.

Esto es una elección, no un descuido: personalizar exigiría inventar una marca que el
documento no tiene, y cuatro figuras no justifican ese trabajo.

## Consecuencias

- Los tokens viven en `src/estilos.css` como custom properties. Si el proyecto gana
  marca algún día, se cambian ahí y el diagrama los toma sin tocar el layout.
- Las caras tipográficas están incrustadas en base64 en `src/fuentes.css`
  (`npm run fuentes` las regenera). Cambiar de tipografía implica regenerar ese archivo
  y revisar el factor de ancho por carácter en `src/layout.ts`, que está calibrado a
  Geist y Geist Mono.
- El acento queda reservado a dos elementos por figura: el título de la **Fase** y el
  panel de **Salida**.

## Desviaciones deliberadas del style guide

- **Cuadrícula de 4px:** las constantes libres y las alturas de línea van a múltiplos
  de 4, pero las alturas de nodo y panel derivan del texto envuelto y se redondean a la
  cuadrícula al final, no por construcción.
- **Sin leyenda:** la guía pide que la leyenda cubra cada tipo usado. Aquí hay un solo
  tipo de nodo (**Tarea**) y dos paneles rotulados en sitio, así que una leyenda sería
  ruido.
- **Sin etiquetas en las flechas:** el orden Entrada → Tareas → Salida ya dice qué es
  cada flecha; las reglas de máscara y separación de etiquetas no aplican.
