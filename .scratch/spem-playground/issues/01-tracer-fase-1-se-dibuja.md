# 01 — Tracer bullet: una Fase se dibuja

**What to build:** Opening the app shows **Fase 1** of the *Modelo de procesos* rendered
as a finished SPEM diagram — title, a band of **Rol** chips, an **Entrada** panel on the
left, the **Tareas** as nodes down the middle, a **Salida** panel on the right, and arrows
connecting them. Nothing is editable yet and there is no way to see the other three
**Fases**. This is the thinnest complete path from data to picture, and every later ticket
widens it.

The four **Fases** from the source document are all seeded in the model even though only
the first one is displayed, so later tickets add navigation rather than data.

Per **ADR-0002**, only **Tareas** become nodes. **Entrada** and **Salida** items are text
lines inside one panel each; **Roles** are chips, not boxes.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] `git init` in the project, first commit on `main`, with a `.gitignore` covering
      `node_modules` and build output
- [ ] Vite + React + TypeScript scaffold runs with a dev server command
- [ ] Vitest installed and a test command runs green (no jsdom, no testing-library)
- [ ] Plain CSS design tokens defined as custom properties: paper `#f5f5f5`, ink
      `#2d3142`, accent `#eb6c36`, plus muted and rule hairline values
- [ ] The `Modelo` / `Fase` / `Tarea` types exist as specified in the spec, and all four
      **Fases** from the document are seeded with their real **Roles**, **Tareas**,
      **Entrada** and **Salida** content
- [ ] A pure layout function maps one **Fase** to absolute coordinates, measuring text by
      character-width approximation and never touching the DOM
- [ ] A React component renders that layout as a single `<svg>` containing no geometry
      logic of its own — every number comes from the layout
- [ ] **Fase 1** is visible in the browser and reads left-to-right: **Entrada** →
      **Tareas** → **Salida**
- [ ] Arrows connect the **Entrada** panel to the **Tareas** column and the **Tareas**
      column to the **Salida** panel
- [ ] Layout tests assert relationships, not pixel constants: **Entrada** panel entirely
      left of the **Tareas** column, **Salida** panel entirely right of it, **Tarea** nodes
      do not overlap vertically, reported canvas dimensions contain every emitted element
- [ ] Layout test: a **Tarea** whose text exceeds the node width wraps to multiple lines
      and the node height grows to contain them
- [ ] Work happens on a branch named `ticket/01-tracer-fase-1-se-dibuja`; it is merged into
      `main` once all criteria pass and tests are green
