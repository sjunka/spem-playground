# 02 — Navegación entre las cuatro Fases

**What to build:** The user can click between the four **Fases** and see each one drawn.
Switching is one click, the selected **Fase** is visually unmistakable, and all four
diagrams look like they belong to the same document — same treatment, same spacing, same
type scale.

This is where the layout gets its real workout. **Fase 4** carries 24 elements and is the
stress case for the density rule in **ADR-0002**; if it reads as a wall of boxes, the
layout is wrong, not the rule. **Fase 3** has six **Roles**, so the chip band has to handle
a long role list.

**Blocked by:** 01.

**Status:** ready-for-agent

- [x] A tab or selector lists all four **Fases** and switching redraws the diagram
- [x] The selected **Fase** is visually distinct from the unselected ones
- [x] Each of the four seeded **Fases** renders without clipping, overlap, or overflow
- [x] **Fase 4** stays legible: roughly six **Tarea** nodes plus two panels plus one chip
      band, not 24 boxes
- [x] A long **Roles** list wraps to a second chip band row rather than overflowing the
      canvas width
- [x] Canvas dimensions adapt per **Fase** — a small **Fase** does not leave a large empty
      region, a large one is not cropped
- [x] Accent colour appears on at most two elements per diagram (the **Fase** title and the
      **Salida** panel); everything else is ink or muted
- [x] Layout test: every **Roles** chip fits within the reported canvas width
- [x] Layout test: arrow paths begin on a panel edge and end on a node edge — no arrow
      starts or ends in empty space
- [ ] Work happens on a branch named `ticket/02-navegacion-entre-fases`; it is merged into
      `main` once all criteria pass and tests are green
