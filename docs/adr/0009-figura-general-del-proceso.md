# ADR-0009 — Una figura general del proceso, en dos versiones

Fecha: 2026-08-27
Estado: aceptada

## Contexto

Las veinte figuras del editor y las cuatro de `scripts/epf.tsx` describen **una
Fase cada una**. Al montar el *paper* faltó lo contrario: una sola imagen del
sistema completo —las cuatro **Fases**, sus **Tareas** y la participación de todo
el equipo— que abra la sección y de la que las demás sean el desglose.

Ninguna **Vista** existente sirve: todas toman una `Fase` como entrada (ADR-0006), y
apilar las cuatro daría cuatro figuras, no una.

## Decisión

Se añade `src/general.ts`, que toma el `Modelo` entero y devuelve **dos** figuras
alternativas. No se elige por el equipo: las dos se generan y se escoge cuál va al
documento.

- **Versión A — cadena de Fases** (`figuras/general-a-cadena-de-fases.png`).
  Las cuatro **Fases** apiladas; en cada tarjeta, sus **Roles** a la izquierda y sus
  **Tareas** en dos columnas, cada una rotulada con quién la ejecuta y quién asiste.
  Entre dos **Fases**, la banda de **Productos de Trabajo** del traspaso —los que la
  **Salida** de una y la **Entrada** de la siguiente comparten—, y a los extremos la
  **Entrada** y la **Salida** del proceso. Responde: *¿qué pasa, en qué orden y qué
  se entrega entre etapas?*
- **Versión B — carriles por Rol** (`figuras/general-b-carriles-por-rol.png`).
  Una fila por **Rol**, una columna por **Fase**. Cada **Tarea** aparece en el carril
  de quien la ejecuta (relleno, `«performs, primary»`) y en el de quien asiste
  (trazo discontinuo, `«assists»`), y un carril de cierre lista lo que cada **Fase**
  deja construido. Responde: *¿quién participa, y en qué?*

Ambas usan la notación de ADR-0007. La paleta, los glifos y los codos salen de
`src/epf-svg.ts`, extraído de `scripts/epf.tsx` para que las dos figuras y la de una
sola **Fase** no se separen con el tiempo.

## Consecuencias

- `npm run general` escribe los dos PNG. El script es un envoltorio: la geometría
  vive en `src/general.ts` y es pura, así que se puede probar sin rasterizar.
- La figura general **no** se dibuja en el editor. Es una figura de portada, no una
  **Vista** que se edite Fase a Fase; añadirla al selector rompería la premisa de
  ADR-0006 de que la unidad del modelo es la **Fase**.
- La versión A depende de que la **Salida** de una **Fase** y la **Entrada** de la
  siguiente usen el mismo texto para el mismo **Producto de Trabajo**. Si un texto se
  edita en un solo lado, ese traspaso desaparece de la banda en silencio.
