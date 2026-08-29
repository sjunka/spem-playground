# ADR-0011 — El modelo gana tiempo, hardware y review

Fecha: 2026-08-29
Estado: aceptada

## Contexto

La primera exposición del modelo recibió once observaciones. Agrupadas, son cuatro
huecos reales, y ninguno es de dibujo:

1. **El tiempo no existía.** Ni duración de **Fase**, ni cadencia, ni plan de
   releases. El modelo decía qué se hace y quién, nunca cuándo ni qué se entrega.
2. **El sistema ciberfísico estaba a medias.** Nueve Tareas de software y cero de
   electrónica, en un proyecto de drones, sensores y actuadores.
3. **Faltaban los bucles humanos.** Había retornos por fallo técnico, pero ninguna
   ceremonia de revisión ni retroalimentación del **Caficultor** al backlog.
4. **Se leía como cascada.** Cuatro bandas apiladas y el ciclo encerrado al final:
   la composición decía «secuencia» aunque el contenido dijera «iteración».

## Decisión

### En el modelo (`src/seed.ts`)

- Dos **Roles** nuevos: **Ingeniero electrónico** e **Ingeniero mecatrónico**. Nueve
  en total, en dos frentes.
- Tres **Tareas** nuevas, una por **Fase**:
  - `t2-6` **Diseñar la electrónica de sensores, actuadores y enlace del dron** →
    esquemáticos y banco de pruebas de hardware.
  - `t3-5` **Integrar el hardware real en el banco HIL** → el punto donde el equipo
    de electrónica y el de software se encuentran.
  - `t4-7` **Review del incremento con el caficultor** → un **Hito**, no una Tarea
    más: es la puerta donde el incremento se muestra y se aprende.
- El **Banco HIL con hardware real** pasa de la **Fase 3** a la **Fase 4** y lo
  consume la verificación continua, así que el hardware queda en el ciclo, no fuera.

### En la figura (`src/consolidado.ts`)

- **Eje de tiempo** a la izquierda, en semanas, con las **Fases 1–3** marcadas como
  **Iteración 0 · arranque, una sola vez**. Es la respuesta directa a «¿cascada?»:
  la cascada existe, dura una vez, y está rotulada como tal.
- **Plan de releases** R0–R3, con semana, contenido y criterio de aceptación. El R0
  se marca sobre la salida de la primera decisión.
- **Cadena SDD** explícita: `Constitution.md → spec.md → plan.md → task.md → código →
  verificación`, más el rótulo sobre el traspaso donde esos archivos viajan.
- **Retroalimentación** como tercer tipo de arista: punteada azul, del review al
  backlog. Distinta del **retorno** (gris, «el trabajo se rehace»), porque no es un
  rechazo sino aprendizaje.
- El anillo de la **Fase 4** se reordena con una decisión en cada extremo, y el
  rótulo del centro dice que es *el estado permanente del proyecto*.
- **Quién hace qué.** El panel del equipo enumeraba los nueve **Roles** sin decir de
  qué responde ninguno. Ahora cada **Rol** sale unido por una línea a los códigos de
  las **Tareas** que ejecuta —relleno— y en las que asiste —contorno—, y cada celda
  de la red lleva ese código (`T1.1`, `T2.6`, `T4.7`) en su esquina. La línea es lo
  que convierte una lista de nombres en un reparto de responsabilidad.

## Consecuencias

- La figura crece a 2560×2626 (5120×5252 a 2x). Sigue siendo de página completa.
- El **plan de releases** no sale del modelo SPEM: vive en `RELEASES`, en la figura.
  Es dimensión de producto, no de proceso, y mezclarla con el `seed` habría metido
  fechas en un modelo que no las tiene.
- Las veinte figuras por **Fase**, las cuatro EPF y las dos generales se regeneran
  con las Tareas y los Roles nuevos: son la misma fuente.
- El panel «quién hace qué» deja a la vista un hueco del modelo: el **Ingeniero de
  datos** asiste en seis **Tareas** y no ejecuta ninguna. La figura lo dice con todas
  sus letras en vez de disimularlo. El reparto por **Tarea** es una inferencia del
  editor (ADR-0006) y este es exactamente el tipo de revisión que pedía.
- Sigue faltando, y se decide **no** meterlo aquí: el backlog priorizado y las
  métricas del proceso. Piden su propia figura; esta ya lleva su carga.
