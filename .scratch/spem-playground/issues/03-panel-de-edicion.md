# 03 — Panel de edición

**What to build:** The user can change the model and watch the diagram follow. A side
panel shows the selected **Fase** as structured fields: its name, its objetivo, and four
list editors for **Roles**, **Tareas**, **Entrada** and **Salida**. Every keystroke
redraws the diagram — there is no render button, and there is no dragging anywhere in the
interface.

A **Tarea** can carry an optional short description below its name, so the diagram can hold
the explanatory clause the source document gives after the colon.

The user can also add a new **Fase** or delete one, so the tool is not frozen at four.
Editor chrome is in Spanish throughout.

**Blocked by:** 02.

**Status:** ready-for-agent

- [ ] The panel shows the selected **Fase**'s nombre and objetivo as editable text, and
      edits appear in the diagram title
- [ ] **Roles** can be added, edited, removed and reordered; the chip band follows
- [ ] **Tareas** can be added, edited, removed and reordered; the node column follows and
      reordering changes the visual sequence
- [ ] A **Tarea** can be given an optional descripción, which renders under its name in the
      node
- [ ] **Entrada** items can be added, edited, removed and reordered; the panel follows
- [ ] **Salida** items can be added, edited, removed and reordered; the panel follows
- [ ] A new **Fase** can be added and an existing one deleted
- [ ] The diagram redraws on every keystroke without a visible stall
- [ ] All editor labels and buttons are in Spanish
- [ ] A **Fase** with an empty **Entrada** renders no **Entrada** panel and no dangling
      arrow, rather than a zero-height box
- [ ] Layout test: a **Fase** with an empty **Entrada** produces no **Entrada** panel and no
      orphan arrow
- [ ] Layout test: a **Fase** with no **Tareas** still produces a valid layout
- [ ] Work happens on a branch named `ticket/03-panel-de-edicion`; it is merged into `main`
      once all criteria pass and tests are green
