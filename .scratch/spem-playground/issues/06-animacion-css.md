# 06 — Animación CSS

**What to build:** The diagram assembles itself instead of appearing all at once. Nodes
fade and slide into place with a stagger, so when the user adds a **Tarea** they can see
what changed. Arrows draw themselves when a **Fase** loads, so the flow direction registers
before the labels are read. Switching **Fase** transitions rather than snapping.

Per **ADR-0004**, this is CSS only — no GSAP, no HyperFrames, no `hyperframes-core`. Motion
is screen-only and must leave the exported still frame untouched.

**Blocked by:** 02, 05.

**Status:** done

- [x] Nodes enter with opacity and a small translate, staggered so they arrive in sequence
- [x] Arrows draw by animating their stroke, from unstroked to complete
- [x] Switching **Fase** transitions rather than cutting
- [x] Adding a **Tarea** animates only the new node, not the whole diagram
- [x] No animation library is added; the implementation is CSS
- [x] PNG export produces the fully-settled diagram, never a mid-animation frame
- [x] PDF export produces the fully-settled diagram, never a mid-animation frame
- [x] Motion respects `prefers-reduced-motion` and is suppressed when the user has asked
      for reduced motion
- [ ] Work happens on a branch named `ticket/06-animacion-css`; it is merged into `main`
      once all criteria pass and tests are green

---

Cerrado el 2026-08-27. Todos los criterios cumplidos salvo el de rama: el trabajo salió
en commits directos sobre `main`, no en una rama `ticket/NN-...`.
