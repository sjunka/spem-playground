# Modelo de Procesos — SPEM 2.0 Playground

Editor web que produce los diagramas SPEM 2.0 del documento *Modelo de procesos*
(sistema de riego autónomo guiado por drones para caficultura). El modelo se edita
en un formulario y se exporta como PNG o PDF para insertarlo de vuelta en el documento.

## Language

### Elementos del modelo

**Fase**:
Una etapa del proceso de ingeniería, delimitada por sus entradas y salidas. El modelo
tiene cuatro. Es la unidad de exportación: una Fase produce exactamente una imagen.
_Avoid_: Etapa, iteración, sprint, Phase

**Tarea**:
Una unidad de trabajo dentro de una Fase. Es el único elemento que se dibuja como
nodo con caja propia.
_Avoid_: Actividad, paso, acción, Task

**Rol**:
Quién participa en una Fase. Los Roles se declaran a nivel de Fase, nunca a nivel de
Tarea — el documento fuente no asigna roles por tarea.
_Avoid_: Actor, responsable, cargo, participante

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
