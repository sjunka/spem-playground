# ADR-0007 — Las figuras adoptan la notación de EPF Composer / SPEM Designer

Fecha: 2026-08-27
Estado: aceptada

## Contexto

Las figuras se leían como un diagrama editorial genérico: cajas iguales, papel gris,
acento coral. Quien revisa el documento *Modelo de procesos* espera la notación con la
que se publican los métodos SPEM 2.0: la de **EPF Composer** (Eclipse Process Framework)
y la de **SPEM Designer** (ObeoNetwork), que comparten paleta y repertorio de formas.

## Decisión

Se adopta esa notación en las cuatro **Vistas**:

- **Paleta**: relleno crema `#fbe3b8`, borde tostado `#c8964b`, rótulo marrón `#8a5a20`
  (`--epf-relleno`, `--epf-borde`, `--epf-texto` en `src/estilos.css`).
- **Forma por Tipo SPEM** (`src/formas.ts`): chevron para **Tarea** y Paso, hexágono
  para **Hito**, caja redondeada para Actividad, Proceso, **Fase** e Iteración, caja
  recta para el resto.
- **Estereotipos OMG** sobre las aristas, ya presentes: `«input, mandatory»`,
  `«output, mandatory»`, `«perform»`, `«assist»`, `«include»`.

`npm run epf` genera además una figura por **Fase** en el layout clásico de EPF
—**Roles** a la izquierda, la cadena de **Tareas** al centro, **Productos de Trabajo**
a la derecha— para pegar en el documento sin pasar por el editor.

## Consecuencias

- El acento coral queda solo en el título de la **Fase**; el color de los nodos ya no
  lo aporta el style guide sino la paleta EPF. ADR-0005 sigue vigente para tipografía.
- La forma del nodo pasa a depender del **Tipo SPEM**, así que cambiar el icono de una
  **Tarea** en el editor también cambia su contorno. Es intencional: en EPF el icono y
  la forma dicen lo mismo.
- EPF limita la variabilidad de contenido a mapeos uno a uno; como aquí no hay capa de
  Method Content (ADR-0001), esa limitación no nos alcanza.

- La quinta **Vista**, **Detalle EPF**, lleva esta notación a su layout propio. Ver ADR-0008.
