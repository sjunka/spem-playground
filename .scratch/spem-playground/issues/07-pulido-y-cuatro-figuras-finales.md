# 07 — Pulido visual y las cuatro figuras finales

**What to build:** The tool stops being correct and starts being good, and it produces the
actual deliverable — the four figures for the *Modelo de procesos* document. The
typography lands as specified, the accent stays editorial, and the diagrams are checked
against the `diagram-design` taste gate rather than only against the layout tests.

The final act is exporting all four **Fases** and looking at them side by side, in print,
the way they will appear in the document.

**Blocked by:** 04, 05, 06.

**Status:** ready-for-agent

- [x] Instrument Serif for the **Fase** title, Geist for node names, Geist Mono for
      eyebrows and tags — loaded and rendering, with a real fallback stack
- [x] The `diagram-design` pre-output checklist is walked for each of the four **Fases**
      and every failure is fixed
- [x] Accent discipline holds across all four: one or two focal elements each, never more
- [x] All four figures share identical treatment — same spacing, same type scale, same
      stroke weights — so they read as one set
- [x] The four **Fases** are exported as PNG and checked at print size for legibility, with
      **Fase 4** judged first as the density stress case
- [x] The exported figures are saved in the project so the document author can pick them up
- [x] The editing panel is usable at a normal laptop window size without horizontal
      scrolling
- [x] The style guide's shipped defaults are recorded as a deliberate choice, not an
      oversight
- [ ] Work happens on a branch named `ticket/07-pulido-y-cuatro-figuras-finales`; it is
      merged into `main` once all criteria pass and tests are green
