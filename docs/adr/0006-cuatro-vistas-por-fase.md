# Cada Fase produce cuatro vistas

**Reemplaza a [ADR-0002](0002-solo-las-tareas-son-nodos.md).**

Una sola figura por **Fase** no responde las preguntas que el lector del documento hace:
quién ejecuta cada **Tarea** y quién solo asiste, qué **Producto de Trabajo** consume y
produce cada una, y de qué se compone la **Fase** de un vistazo. El **Resumen** dibuja
los **Roles** como una banda de chips sin conectarlos con nada, y agrupa la **Entrada** y
la **Salida** a nivel de **Fase**, así que esas relaciones no están en la figura.

Decidimos que cada **Fase** produce **cuatro figuras** —**Resumen**, **Flujo**, **Roles**
y **Descomposición**— seleccionables por sub-pestañas y exportables por separado.

## Por qué esto no contradice a ADR-0002

ADR-0002 fijó el presupuesto de densidad —9 nodos— y descartó partir una **Fase** en
varias imágenes. Sigue siendo la decisión correcta para lo que evaluaba. Lo que cambia:

- **El presupuesto se cumple ahora por vista, no por Fase.** Ninguna de las cuatro pasa
  de 9 nodos en su columna principal.
- **Cada vista carga un subconjunto.** **Roles** no dibuja ningún **Producto de
  Trabajo**, **Flujo** no dibuja ningún **Rol**, y **Descomposición** no dibuja ninguno
  de los dos. Por eso pueden permitirse dibujarlos como nodos donde el **Resumen** no
  podía: las 24 cajas de la **Fase** 4 nunca coinciden en la misma figura.
- **Cada vista responde una pregunta distinta**, en vez de partir una narrativa por la
  mitad — que era la objeción concreta de ADR-0002 a las «Fases grandes en dos imágenes».
- **El Resumen sobrevive intacto.** Es exactamente la figura que ADR-0002 diseñó, con la
  misma geometría, y sigue siendo la vista por defecto.
- **Una vista futura que juntara Roles y Productos de Trabajo** volvería a chocar con el
  mismo presupuesto, y habría que rechazarla por las razones de ADR-0002.

## Consecuencia en el código

La función de layout gana la vista como segundo parámetro y devuelve el **mismo tipo**
para las cuatro: el componente que dibuja no contiene ni una rama por vista, y el
exportador no distingue. Las aristas ganan una etiqueta opcional donde viven los cinco
estereotipos normativos de OMG SPEM 2.0 —`«perform»`, `«assist»`, `«include»`,
`«input, mandatory»`, `«output, mandatory»`—, calculada por el layout y solo escrita por
el renderer. Los **Roles** y **Productos de Trabajo** que necesitan caja propia entran
por la lista de nodos, que ya lleva un **Tipo SPEM** por nodo.

Los estereotipos se escriben en inglés, entre guillemets: es la misma excepción que el
glosario concede a los identificadores de **Tipo SPEM**. La prosa de la interfaz
—sub-pestañas, subtítulos, leyenda, editor— sigue en español.

## El reparto por Tarea es inferido, no documentado

Para que **Flujo** y **Roles** tengan qué dibujar, la **Tarea** gana sus propios
**Roles** —con papel `perform` o `assist`— y sus propias listas de **Entrada** y
**Salida**. El documento fuente **no da ese reparto**: lista los **Roles** participantes
de la **Fase** en bloque, y su **Entrada** y **Salida** en bloque.

El reparto precargado en el seed se infiere del nombre y la descripción de cada **Tarea**
contra las listas de la **Fase**, bajo dos invariantes verificadas por tests: ninguna
**Tarea** queda sin un **Rol** que la ejecute, y todo **Producto de Trabajo** de la
**Fase** queda asignado al menos a una **Tarea**. La **Entrada** de la **Fase** 4 —los
incrementos sucesivos— cuelga de la **Tarea** de construcción en paralelo, que es la que
los consume.

**Es una aportación del editor, no un dato del documento.** Las figuras van a parecer
autorizadas aunque el reparto sea una conjetura: conviene revisarlo **Fase** por **Fase**
antes de pegar nada en el documento.

## Considered Options

- **Dejar una sola figura por Fase** — no responde las tres preguntas del lector, que es
  el problema que abre este ADR.
- **Una figura única que lo dibuje todo** — vuelve a las 24 cajas de la **Fase** 4 que
  ADR-0002 rechazó, esta vez con estereotipos encima.
- **Ramificar el renderer por vista** — cada vista con su propio componente y su propia
  escala; se paga en cuatro sitios cada cambio de tipografía o de rejilla.
