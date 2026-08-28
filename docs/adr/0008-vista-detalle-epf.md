# ADR-0008 — Una quinta Vista: **Detalle EPF**

Fecha: 2026-08-27
Estado: aceptada

## Contexto

ADR-0007 trajo la paleta y las formas de EPF Composer, pero las cuatro **Vistas**
mantuvieron su propio layout: paneles de **Entrada** y **Salida** a los lados, chips
de **Rol** en una banda superior. El resultado se leía como las figuras de siempre
con otro color, no como un diagrama de EPF.

El *activity detail diagram* de EPF Composer tiene una composición reconocible: tres
bandas —**Roles** a la izquierda, la cadena de **Tareas** al centro, **Productos de
Trabajo** a la derecha— y aristas rotuladas con los estereotipos de OMG.

## Decisión

Se añade una quinta **Vista**, `detalle`, con ese layout. No sustituye a ninguna:
las cuatro anteriores siguen respondiendo sus preguntas (ADR-0006).

- Por **Tarea**: la **Entrada** encima, la **Salida** debajo, los **Roles** a su
  izquierda. Ninguna arista cruza una caja.
- Las aristas entran por el borde superior de la **Tarea** y salen por el inferior
  (`codoHV` / `codoVH` en `src/layout.ts`), cada una con su propia x.
- **Rol** y **Producto de Trabajo** se dibujan como glifo y texto, sin caja: el campo
  `sueltos` del layout. Las cajas quedan para las **Tareas**, como manda ADR-0002.
- Los estereotipos pasan a la forma de EPF: `«performs, primary»` y `«assists»`,
  junto a los ya existentes `«input, mandatory»` y `«output, mandatory»`.

## Consecuencias

- `npm run figuras` produce veinte PNG en vez de dieciséis.
- Una **Fase** de seis **Tareas** da una figura alta (≈1630px). Es el precio de no
  cruzar aristas; el documento la inserta a página completa.
- `scripts/epf.tsx` queda como generador independiente de la misma figura para pegar
  sin abrir el editor; comparte notación, no código.
