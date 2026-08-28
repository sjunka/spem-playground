# ADR-0010 — La figura consolidada: una red, no una cascada

Fecha: 2026-08-27
Estado: aceptada

## Contexto

ADR-0009 dio dos figuras generales, y el equipo escogió una tercera forma: la del
*process model* de EPF Composer —una **red** de celdas repartidas por el lienzo, cada
una con sus **Roles** encima y sus **Productos de Trabajo** debajo, unidas por
conectores, con rombos de decisión y una elipse alrededor de la parte que se repite.

Las dos versiones de ADR-0009 son rejillas: la A apila **Fases**, la B cruza **Roles**
con **Fases**. Ninguna muestra los retornos, y sin retornos la **Fase 4** parece
terminar, cuando lo que hace es repetirse.

## Decisión

Se añade `src/consolidado.ts`: **una sola** figura con las dieciocho **Tareas**.

- **La celda.** Los **Roles** arriba —en negrita quien ejecuta, en gris quien asiste—,
  la **Tarea** al centro sobre una banda blanca, y debajo los **Productos de Trabajo**
  que produce. El contorno lo da el Tipo SPEM (chevron, hexágono, redondo).
- **La red.** Las **Fases** 1 a 3 avanzan en cascada, cada una sobre su banda, y entre
  ellas los **Productos de Trabajo** del traspaso viajan **sobre** el conector.
- **Las decisiones.** Tres rombos, con sus retornos punteados: la traza mínima que no
  responde vuelve al prototipo, el incremento que no pasa las pruebas vuelve a
  construcción, el que no cumple la **Constitution.md** vuelve a sincronización.
- **El ciclo.** La **Fase 4** va dentro de una elipse: entra el prototipo validado y
  no se sale de ella hasta que el incremento pasa las dos puertas.

Las posiciones son **explícitas** (el mapa `POS`), no calculadas. Un layout automático
sobre dieciocho celdas y catorce conectores da una maraña distinta en cada ejecución;
la figura del documento tiene que ser la misma mañana.

## Consecuencias

- `npm run consolidado` escribe `figuras/consolidado-modelo-de-procesos.png` (2260×2286
  a 2x). Es una figura de página completa o de anexo desplegable, no de columna.
- Añadir una **Tarea** al `seed` **no** la coloca sola: hay que darle su centro en
  `POS`, o la figura falla al construirse. Es el precio de que la composición no se
  degrade sin que nadie lo note.
- Las figuras de ADR-0009 se quedan: A y B siguen sirviendo como desglose por **Fase**
  y por **Rol**. Esta es la de portada.
