# ADR-0015 — El ciclo se mide en meses, no en semanas

Fecha: 2026-08-30
Estado: aceptada

## Contexto

La figura decía «un incremento cada 2 a 4 semanas» y fechaba los releases en semanas
14, 20, 28 y 36. El documento fuente dice otra cosa: **cinco incrementos de tres a
cinco meses cada uno**, y entre **quince y veinticinco meses** para completarlos.

Dos semanas por incremento es cadencia de sprint de software. Este incremento incluye
fabricar, ensamblar, instalar en campo y validar contra una fase fenológica del café:
no cabe en dos semanas, y prometerlo en una figura de *paper* es un error de escala.

## Decisión

- El rótulo del anillo dice **«un incremento cada 3 a 5 meses»**, y debajo, en tan:
  *cinco incrementos —monitoreo, dron, riego, clima y multi dron—: entre 15 y 25 meses,
  sin imprevistos.*
- El **plan de releases** pasa a meses de proyecto: **R0 mes 5**, **R1 mes 13**,
  **R2 mes 21**, **R3 mes 25**.
- La regla del arranque se ajusta a las duraciones del documento: **Fase 1**, dos a
  cuatro semanas (**SEM 1–4**); **Fase 2**, tres a cinco (**SEM 5–9**); **Fase 3**, la
  iteración global de trece semanas (**SEM 10–22**). El anillo arranca en el **mes 6**.

La figura usa **dos unidades a propósito**: semanas en la Iteración 0, porque ahí el
trabajo es de documento y de banco, y meses en el ciclo, porque ahí el trabajo es de
campo y de cultivo. La regla lo dice en cada tramo.

## Consecuencias

- El proyecto completo queda en unos **25 a 30 meses**: cinco de arranque más el ciclo.
  La figura ya no promete un ritmo que el hardware no puede sostener.
- `RELEASES` vive en `src/consolidado.ts`, no en el `seed` (ADR-0011): esta corrección
  no toca el modelo SPEM, solo la dimensión de producto de la figura.
