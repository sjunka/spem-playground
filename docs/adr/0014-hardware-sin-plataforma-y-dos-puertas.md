# ADR-0014 — Fuera el ingeniero de plataforma, y dos puertas más en el proceso

Fecha: 2026-08-30
Estado: aceptada

## Contexto

El **Ingeniero de plataforma** cargaba, él solo, con la red de sensores, los entornos
de simulación, la calibración, el *pipeline* y el despliegue en campo. En un sistema
ciberfísico ese trabajo no es de una persona ni de una disciplina: parte es
electrónica, parte es mecatrónica, y parte es software.

Además, dos decisiones del proceso no estaban dibujadas: qué pasa cuando el caficultor
**no** valida las reglas agronómicas del prototipo, y contra qué se audita realmente un
incremento.

## Decisión

### Roles

Desaparece el **Ingeniero de plataforma**. Su trabajo se reparte entre el **Ingeniero
electrónico** y el **Ingeniero mecatrónico**, que ejecutan juntos —los dos en negrita—
las Tareas que antes eran suyas. El equipo queda en **ocho Roles**.

| Tarea | Antes | Ahora |
| --- | --- | --- |
| T2.3 entornos SIL/HIL y gemelos | plataforma ejecuta | electrónico y mecatrónico ejecutan |
| T2.4 arquitectura preliminar | plataforma asiste | mecatrónico y electrónico asisten |
| T2.5 estrategia de calibración | plataforma ejecuta | mecatrónico y electrónico ejecutan |
| T3.2 validar en SIL/HIL | plataforma asiste | mecatrónico y electrónico asisten |
| T3.3 pipeline de CI/CD | plataforma ejecuta | **software de adaptación** ejecuta |
| T3.4 validar reglas agronómicas | caficultor y gerente | entra **QA de software** como asistente |
| T4.2 construcción en paralelo | plataforma asiste | mecatrónico y electrónico asisten, **y entregan** |
| T4.3 verificación continua | plataforma asiste | mecatrónico y electrónico asisten |
| T4.4 despliegue | plataforma ejecuta, caficultor asiste | mecatrónico y electrónico ejecutan, software de adaptación asiste |

### Modelo

- **T4.2** entrega dos artefactos más, los del equipo de hardware: **Red de sensores
  instalada** y **Firmware de sensores y actuadores**. El incremento deja de ser solo
  código.
- **T4.4** se llama **Despliegue en campo**. La validación fenológica no era despliegue:
  ocurre en el review con el caficultor, que ya tiene su propia Tarea.
- **T4.5** se llama **Auditoría de cumplimiento de las especificaciones** — la
  `Constitution.md` de la **Fase 1** y el `plan.md` de la **Fase 2**, no solo la primera.

### Figura

- **Puerta agronómica** en la **Fase 3**, entre T3.4 y T3.5: si el caficultor valida, se
  sigue al banco HIL; si no, el retorno va hasta **T1.1**, porque lo que falla ahí es
  una regla mal escrita, no un montaje.
- El anillo de la **Fase 4** corre ahora **T4.4 → T4.5 → T4.6 → T4.7**, y la puerta
  **¿El incremento cumple con las especificaciones?** queda **al final**, después del
  review: su *No* devuelve el incremento a **T4.1**, la sincronización, que es donde se
  decide qué se rehace; su *Sí* cierra el proceso.
- El **R3** se marca sobre **T4.6**: lo que cierra ese release es el manual de
  operación vigente, no el despliegue.
- La línea que une el **Rol** con su **Tarea** arranca **debajo** del nombre del Rol.
  Cruzarlo lo leía como un tachado.

## Consecuencias

- La figura consolidada crece a 1700×4118 y pasa a tener **cuatro decisiones**, cuatro
  retornos y una retroalimentación. Las pruebas de `general.test.ts` cuentan eso.
- El **Ingeniero de datos** sigue sin ejecutar ninguna **Tarea** propia: el panel lo
  dice. Es el hueco del modelo que queda por resolver.
- `t2-1`, `t2-2` y `t3-4` siguen sin declarar **Salida**, así que su negrita no responde
  por ningún artefacto.
