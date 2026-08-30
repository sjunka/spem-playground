# Modelo de Procesos — SPEM 2.0 Playground

Editor web que produce los diagramas SPEM 2.0 del documento *Modelo de procesos*
(sistema de riego autónomo guiado por drones para caficultura). El modelo se edita
en un formulario y se exporta como PNG o PDF para insertarlo de vuelta en el documento.

## Language

### Elementos del modelo

**Fase**:
Una etapa del proceso de ingeniería, delimitada por sus entradas y salidas. El modelo
tiene cinco, de la **Fase 0** de visión y planificación del producto a la **Fase 4** de
ciclo de crecimiento. Cada Fase produce cinco imágenes, una por **Vista**. Ver ADR-0006,
ADR-0008 y ADR-0016.
_Avoid_: Etapa, iteración, sprint, Phase

**Tarea**:
Una unidad de trabajo dentro de una Fase. Es el único elemento que se dibuja como
nodo con caja propia.
_Avoid_: Actividad, paso, acción, Task

**Rol**:
Quién participa en una Fase. Los Roles se declaran a nivel de Fase, y cada Tarea
referencia los de su Fase con un papel: `perform` (ejecuta) o `assist` (asiste). El
documento fuente no da ese reparto por Tarea; lo aporta el editor. Ver ADR-0006.
_Avoid_: Actor, responsable, cargo, participante

**Vista**:
Una de las cinco figuras que una Fase produce: **Resumen**, **Flujo**, **Roles**,
**Descomposición** y **Detalle EPF** —esta última en la notación de EPF Composer:
**Roles** a la izquierda, la cadena de **Tareas** al centro y los **Productos de
Trabajo** a la derecha. Ver ADR-0008. La Fase sigue siendo la unidad del modelo; la Vista es la unidad de
exportación, y cada una responde una pregunta distinta sobre la misma Fase.
_Avoid_: Pestaña, modo, perspectiva, view, diagrama

**Producto de Trabajo**:
Un artefacto que una Fase consume o produce. Aparece como Entrada o como Salida;
no existe fuera de esa relación.
_Avoid_: Artefacto, entregable, documento, work product

**Entrada**:
Los Productos de Trabajo que una Fase consume. Se dibujan agrupados en un panel, no
como nodos individuales.
_Avoid_: Input, precondición, insumo

**Salida**:
Los Productos de Trabajo que una Fase produce. La Salida de una Fase es típicamente
la Entrada de la siguiente.
_Avoid_: Output, entregable, resultado

**Tipo SPEM**:
El elemento de la notación SPEM 2.0 que un ítem representa: **Producto de Trabajo**,
Herramienta, Hito, Actividad, Proceso… Cada **Tarea** y cada ítem de **Entrada** o
**Salida** lleva uno, y de él sale el icono que se dibuja. Los quince están en
`src/iconos.ts`.
_Avoid_: Icono, glifo, símbolo, categoría

### Términos de SPEM 2.0 deliberadamente ausentes

**Method Content**:
La biblioteca atemporal de definiciones reutilizables de SPEM 2.0 (RoleDefinition,
TaskDefinition, WorkProductDefinition), separada de su aplicación en el tiempo.
Este proyecto **no** implementa esta capa: cada Fase declara sus propios Roles y
Tareas como texto, sin reutilización entre Fases. Ver ADR-0001.

**Process**:
La capa de SPEM 2.0 que ordena el Method Content en el tiempo. Como no existe la capa
de Method Content, aquí no hay distinción entre definición y uso: una Tarea es
simplemente una Tarea.

### Dominio del documento fuente

**Caficultor**:
El Experto del Dominio del proyecto. Aporta las reglas agronómicas y valida el impacto
del riego en campo.
_Avoid_: Agricultor, usuario final, cliente

**Constitution.md**:
El documento de la Fase 1 que fija los principios y restricciones no negociables del
sistema. Se audita en cada incremento de la Fase 4.

**MAPE-K**:
El bucle de adaptación (Monitor, Analyze, Plan, Execute, Knowledge) sobre el que se
construye la lógica de control del sistema de riego.

**SIL / HIL**:
Entornos de simulación. SIL valida la lógica sin hardware; HIL la valida con el
hardware real en el bucle.

**Gemelo digital**:
Réplica simulada del terreno y sus dispositivos, usada para verificar incrementos
antes de desplegar en campo.

Los defaults tipográficos y de color del skill `diagram-design` se aceptan sin
personalizar. Ver ADR-0005.

### Excepción: los identificadores de **Tipo SPEM** van en inglés

Las claves de `src/iconos.ts` son `task`, `phase`, `workProduct`, `roleUse` y así, pese
a que este glosario marca `Task`, `Phase` y `work product` como términos a evitar. El
veto aplica a la prosa de la interfaz, no a los identificadores normativos de OMG: son
los nombres con los que la especificación de SPEM 2.0 llama a sus elementos. Lo que el
editor muestra —y lo que dice la leyenda de cada figura— sigue en español, desde
`ETIQUETAS`.
