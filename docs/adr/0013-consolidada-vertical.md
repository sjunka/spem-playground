# ADR-0013 — La figura consolidada se pone de pie

Fecha: 2026-08-30
Estado: aceptada

## Contexto

La consolidada de ADR-0010 salía apaisada: 2560×2626, con las **Fases** 1 a 3 como
bandas horizontales de hasta seis celdas. En una página de *paper* eso se reduce hasta
que los **Roles** de cada celda —6.5 px— desaparecen.

ADR-0012 ya puso las figuras por **Fase** en vertical. Tener la de portada apaisada y
las de detalle verticales obliga al lector a girar la cabeza entre una y otra.

## Decisión

La misma red, girada: **cada Fase es una columna**.

- Las **Fases** 1 a 3 son tres columnas que se leen hacia abajo, y se suceden hacia la
  derecha. La regla del tiempo pasa de vertical a horizontal, con **SEM 1–4**,
  **SEM 5–9** y **SEM 10–22** sobre su columna y el rótulo de **Iteración 0** encima.
- Entre dos columnas hay un **canal de traspaso**: el conector sube por él cargado con
  los **Productos de Trabajo** que la **Fase** entrega a la siguiente, apilados. Antes
  se mostraban tres de los cinco de la **Fase 1** por falta de ancho; ahora van todos.
- La **Fase 4** deja de ser un anillo ancho y pasa a un anillo **alto**: baja por la
  columna derecha, cruza por el fondo y regresa por la izquierda, con una decisión en
  cada extremo. La elipse sigue diciendo que el ciclo no termina.
- Los paneles —**quién hace qué**, **plan de releases**, **Spec-Driven Development** y
  **el proceso entrega**— bajan al pie, en dos filas, y la leyenda también.
- La posición de las celdas de las **Fases** 1 a 3 ya **no** es un mapa a mano: cada
  columna apila sus celdas según la altura medida de la anterior. El mapa explícito
  queda solo para las siete celdas del anillo, que es donde una colocación automática
  sí daría una maraña. Es la parte de ADR-0010 que esta decisión reemplaza.

La leyenda dice ahora que la negrita **ejecuta la Tarea y responde por sus Productos de
Trabajo**, la misma frase que las figuras por **Fase** (ADR-0012).

## Consecuencias

- La figura pasa de 2560×2626 a 1700×4018 (el doble a 2x). Es un anexo desplegable
  vertical: cabe en una columna de página, no en un pliego apaisado.
- Añadir una **Tarea** a las **Fases** 1 a 3 ya no exige tocar `POS`: entra en su
  columna sola. Añadirla a la **Fase 4** sigue exigiendo darle su sitio en el anillo.
- El canal de traspaso lleva el conector **hacia arriba**: las columnas están alineadas
  por su borde superior y la siguiente **Fase** empieza arriba. Se acepta a cambio de
  que los **Productos de Trabajo** del traspaso tengan dónde vivir; el sentido lo marca
  la punta de flecha y el rótulo `FASE 1 → FASE 2`.
