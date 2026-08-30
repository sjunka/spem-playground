# ADR-0012 — La Fase en una tarjeta vertical, y la negrita como responsabilidad

Fecha: 2026-08-30
Estado: aceptada

## Contexto

La figura por **Fase** en notación EPF (ADR-0008) salía apaisada y con mucho aire:
1320 px de ancho, la **Entrada** arriba y la **Salida** abajo de cada **Tarea**, y una
flecha por cada **Rol** con su estereotipo escrito. Tres columnas separadas por
canales de 250 px que solo llevaban texto de arista.

En una figura de paper, eso significa reducirla hasta que el cuerpo no se lee.

## Decisión

`scripts/epf.tsx` dibuja cada **Fase** como una tarjeta **vertical** de 900 px de
ancho, una fila por **Tarea**:

- **Roles** a la izquierda, apilados, con **una sola** flecha del grupo a la **Tarea**.
  Quien la **ejecuta** va en negrita y en marrón; quien **asiste**, en gris. La negrita
  es lo que carga el significado: es el **Rol** que responde por los **Productos de
  Trabajo** que salen de esa **Tarea**. La leyenda lo dice con esas palabras.
- **Tarea** al centro, con su código (`T2.6`) y la forma de su Tipo SPEM.
- **Salida** a la derecha, un **Producto de Trabajo** por flecha.

La **Entrada** por **Tarea** **no** se dibuja. Era la mitad del ancho y de las flechas,
y duplicaba lo que ya cuentan la vista Resumen —**Entrada** y **Salida** de la
**Fase**— y la figura consolidada —el traspaso entre **Fases**—. Esta figura responde
una pregunta distinta: quién hace qué, y qué artefacto sale, y de quién es.

## Consecuencias

- Las cuatro figuras pasan de apaisadas a verticales: 900×676, 900×978, 900×840 y
  900×1156 (a 2x, el doble). Entran en una página a una columna ancha.
- La vista **Detalle EPF** del editor (`src/layout.ts`) **no** cambia: sigue mostrando
  la **Entrada**, y es la que se explora en pantalla. La divergencia es deliberada;
  la del editor es para revisar el modelo, esta es para publicarlo.
- Queda a la vista un hueco del `seed`: `t2-1`, `t2-2`, `t3-4` y `t4-5`
  no declaran **Salida**, así que su fila no tiene artefacto y la negrita no responde
  por nada. O esas **Tareas** producen algo y hay que nombrarlo, o son puertas y
  deberían ser **Hito**.
