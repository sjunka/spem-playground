# No implementamos la separación Method Content / Process de SPEM 2.0

SPEM 2.0 se define por separar la biblioteca atemporal de definiciones reutilizables
(Method Content) de su aplicación ordenada en el tiempo (Process). Este proyecto
deliberadamente **no** implementa esa separación: cada Fase declara sus propios Roles,
Tareas y Productos de Trabajo como texto plano, sin reutilización entre Fases.

La razón es que el entregable real son cuatro diagramas para un documento Word, y las
cuatro Fases comparten muy pocos elementos. Implementar la doble capa habría añadido
un editor de biblioteca, referencias `TaskUse` → `TaskDefinition`, integridad
referencial y resolución de nombres, para un modelo de ~18 tareas que se escriben una
sola vez.

## Consecuencias

Si "Ingeniero de datos" se renombra, hay que cambiarlo en cada Fase donde aparece. Es
aceptable a esta escala. Si el modelo crece a decenas de procesos, o si aparece un
segundo proceso que reutilice el mismo contenido, esta decisión se vuelve el cuello de
botella y debe revisarse antes de seguir añadiendo Fases.
