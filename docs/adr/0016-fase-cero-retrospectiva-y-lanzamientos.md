# ADR-0016 — La Fase 0, la retrospectiva y un lanzamiento por incremento

Fecha: 2026-08-30
Estado: aceptada

## Contexto

Siete diferencias entre el paper y la figura, todas reales:

1. La **Fase 0** de visión y planificación del producto existía en el texto y **no** en
   el modelo. Sin ella la figura reincide en lo que el docente señaló: no hay
   planificación de producto ni panorama inicial.
2. El ciclo mostraba el **review** con el caficultor y no la **retrospectiva** interna.
   Son dos cosas distintas: una mira el producto, la otra mira cómo trabajó el equipo.
3. El **plan de lanzamientos** vivía en un recuadro al pie, sin Tarea que lo produjera,
   y con cuatro releases para cinco incrementos.
4. El equipo físico se llamaba «ingeniero electrónico» y «equipo de electrónica»; el
   paper lo llama **ingeniero de plataforma**, **ingeniero de mecatrónica** y **equipo
   de hardware**.
5. El **ingeniero de seguridad de vuelo** desaparecía después de la **Fase 1**: la
   certificación de rutas del punto de control de la **Fase 3** no estaba.
6. En **T2.4** ejecutaba el software de adaptación y asistía el hardware —al revés de lo
   acordado—, y **T2.3** fusionaba traducir especificaciones con montar entornos.
7. El **ingeniero de datos** no ejecutaba ninguna **Tarea**: asistía en seis.

## Decisión

### Fase 0 — Visión y planificación del producto

Cuatro **Tareas**, todas ejecutadas por el gerente de proyecto: **T0.1** la visión del
producto —con el caficultor—, **T0.2** el mapa de ruta de los cinco incrementos —con
los dos equipos—, **T0.3** el backlog compartido y **T0.4** la política de lanzamientos
—con calidad—. Su **Salida** entra en la **Fase 1** (la visión) y en la **Fase 4** (el
backlog, el mapa de ruta y la política).

### Ciclo de crecimiento

- **T4.8 Retrospectiva de proceso**, después del review: entrega *Ajustes al proceso del
  equipo*. El review mira el producto; la retrospectiva, la forma de trabajar.
- **T4.9 Publicación del lanzamiento**, antes de la puerta: consume la política de la
  **Fase 0** y entrega las *Notas del lanzamiento*. El plan deja de ser un recuadro
  suelto: hay una **Tarea** que lo produce.
- **Seis releases**: **R0** cierra el arranque —no es un incremento— y **R1 a R5** son
  uno por incremento, en los meses 10, 14, 18, 22 y 26.

### Roles

- **Ingeniero electrónico** → **Ingeniero de plataforma**; **Ingeniero mecatrónico** →
  **Ingeniero de mecatrónica**; el panel dice **equipo de hardware**.
- **T3.6 Certificar las rutas de vuelo contra la normativa**, del ingeniero de seguridad
  de vuelo: la frontera del punto de control queda dibujada —calidad valida el
  comportamiento, seguridad de vuelo certifica las rutas—.
- El **ingeniero de datos** ejecuta: **T2.3** (traducir los contratos a `spec.md`,
  `plan.md` y `task.md`), **T2.5** (los entornos y el gemelo del suelo y del cultivo, que
  es suyo) y **T4.2**, donde las dos ramas construyen en paralelo.

### Fase 2

**T2.3** se parte en tres responsabilidades: el equipo de software **traduce** los
contratos, el equipo de hardware **diseña** la arquitectura (**T2.4**, ejecutan
plataforma y mecatrónica; adaptación asiste) y los dos **configuran juntos** los
entornos SIL, HIL y los tres gemelos digitales (**T2.5**), que es el punto de
sincronización del cierre de la Fase.

## Consecuencias

- El modelo pasa a **cinco Fases, veintinueve Tareas y ocho Roles**. La figura crece a
  2180×4690: cuatro columnas de arranque y un anillo de nueve **Tareas**.
- La regla del tiempo se recalcula: **SEM 1–2** la Fase 0, **SEM 3–6** la Fase 1,
  **SEM 7–11** la Fase 2, **SEM 12–24** la Fase 3, y el ciclo arranca en el **mes 7**.
- Las figuras por **Fase** pasan de veinte a **veinticinco**, más cinco EPF.
- `t2-1`, `t2-2` y `t3-4` siguen sin declarar **Salida**: es el hueco que queda.
