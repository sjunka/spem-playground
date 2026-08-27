# 05 — Exportar PNG y PDF

**What to build:** The user gets the picture out and into the Word document. One action
downloads the current **Fase** as a PNG sharp enough to print; another opens the browser's
print dialog with only the diagram on the page, where the user chooses "Guardar como PDF".

The exported file contains the diagram and nothing else — no form, no buttons, no phase
tabs — so there is no cropping afterwards. What comes out matches the on-screen preview
exactly, including fonts.

Per **ADR-0003**, both paths are dependency-free: no html2canvas, no jsPDF. The accepted
cost is that PDF takes one extra click in the browser dialog rather than downloading
directly.

**Blocked by:** 02.

**Status:** ready-for-agent

- [ ] "Exportar PNG" downloads a PNG of the current **Fase**
- [ ] The PNG is rendered at 3× the layout dimensions and stays sharp when printed
- [ ] Fonts are inlined into the serialised diagram so the PNG does not fall back to a
      system typeface
- [ ] "Exportar PDF" opens the print dialog showing only the diagram, at page size
- [ ] Neither export includes the editing panel, the phase tabs, or any button
- [ ] Exported filenames derive from the **Fase** name, slugified, so four exports do not
      collide
- [ ] The exported image is visually identical to the on-screen preview
- [ ] No new runtime dependency is added for either path
- [ ] All four **Fases** export successfully, **Fase 4** included
- [ ] Work happens on a branch named `ticket/05-exportar-png-y-pdf`; it is merged into
      `main` once all criteria pass and tests are green
