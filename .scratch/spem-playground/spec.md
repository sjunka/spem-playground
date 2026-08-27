# SPEM 2.0 Playground — editor de Modelo de Procesos

Status: done

Domain vocabulary in this spec follows `CONTEXT.md`. The Spanish terms **Fase**,
**Tarea**, **Rol**, **Producto de Trabajo**, **Entrada** and **Salida** are used verbatim
and are not translated. Decisions already ratified live in `docs/adr/0001`–`0004`.

## Problem Statement

The *Modelo de procesos* document describes a four-**Fase** engineering process for an
autonomous drone-guided irrigation system, written entirely as prose and bullet lists.
Every **Fase** lists its **Tareas**, its participating **Roles**, its **Entrada** and its
**Salida**, but nothing in the document shows how those pieces connect. A reader cannot
see at a glance that the **Salida** of one **Fase** is the **Entrada** of the next, nor
which **Roles** are carried across phases.

Producing those diagrams by hand is the actual pain. Drawing them in Word SmartArt or
draw.io means every wording change to a **Tarea** is a manual box edit, alignment drifts
between the four figures, and the four images end up looking like they came from four
different documents. Dedicated SPEM 2.0 tooling (EPF Composer, Rational Method Composer,
MagicDraw) solves a far larger problem — full method libraries and governance — at a
setup cost far beyond four figures for one Word document.

## Solution

A small local web editor. The four **Fases** from the document are pre-loaded. The user
edits a **Fase** as structured lists in a form; the diagram redraws itself immediately,
always aligned, never hand-positioned. When it looks right, the user exports the current
**Fase** as a PNG or a PDF and drops it back into the Word document.

Because layout is computed, not drawn, all four figures are visually identical in
treatment by construction. Rewording a **Tarea** is a text edit, not a redraw.

## User Stories

### Seeding and orientation

1. As a modelador, I want the four **Fases** from the source document already loaded on
   first open, so that I can start from the real model instead of an empty canvas.
2. As a modelador, I want to switch between **Fases** with a single click, so that I can
   review the whole process without losing my place.
3. As a modelador, I want the currently selected **Fase** to be visually obvious, so that
   I never edit the wrong one.
4. As a modelador, I want to see the **Fase** name and its objetivo at the top of the
   form, so that I have the phase's purpose in view while editing its parts.
5. As a modelador, I want the editor chrome in Spanish, so that the labels I read in the
   tool match the terms in the document I am producing.

### Editing the model

6. As a modelador, I want to edit the name of a **Fase**, so that the diagram title
   matches the heading in my document.
7. As a modelador, I want to edit the objetivo of a **Fase**, so that the diagram carries
   the phase's stated purpose.
8. As a modelador, I want to add a **Tarea** to a **Fase**, so that I can capture work
   that the document describes but I had not yet modelled.
9. As a modelador, I want to edit the text of an existing **Tarea**, so that I can reword
   it without rebuilding the diagram.
10. As a modelador, I want to remove a **Tarea**, so that I can drop work that turned out
    to belong to another **Fase**.
11. As a modelador, I want to reorder **Tareas** within a **Fase**, so that the diagram
    reads in the sequence the work actually happens.
12. As a modelador, I want to add, edit and remove **Roles** on a **Fase**, so that the
    participating roles match the document's *Roles participantes* line.
13. As a modelador, I want to add, edit and remove items in the **Entrada**, so that the
    consumed **Productos de Trabajo** are accurate.
14. As a modelador, I want to add, edit and remove items in the **Salida**, so that the
    produced **Productos de Trabajo** are accurate.
15. As a modelador, I want each **Tarea** to optionally carry a short description below
    its name, so that the diagram can carry the explanatory clause the document gives
    after the colon.
16. As a modelador, I want to add a whole new **Fase**, so that the tool is not frozen at
    four if the process grows.
17. As a modelador, I want to delete a **Fase**, so that I can drop one I added by
    mistake.

### Seeing the result

18. As a modelador, I want the diagram to redraw as I type, so that I can judge the
    result without pressing a render button.
19. As a modelador, I want the diagram laid out automatically, so that I never have to
    align a box by hand or redo the layout after an edit.
20. As a modelador, I want new nodes to fade and slide into place rather than snapping,
    so that I can see what changed when I add something.
21. As a modelador, I want the arrows to draw themselves when a **Fase** loads, so that
    the flow direction registers before I read the labels.
22. As a modelador, I want long **Tarea** text to wrap inside its node instead of
    overflowing, so that no label is clipped.
23. As a modelador, I want a **Fase** with many elements to stay legible rather than
    becoming a wall of small boxes, so that the figure still works when printed.
24. As a modelador, I want **Roles** shown as a compact band rather than as boxes wired to
    individual **Tareas**, so that the diagram reflects what the source document actually
    states (roles are declared per **Fase**, not per **Tarea**).
25. As a modelador, I want the **Entrada** on the left, the **Tareas** in the middle and
    the **Salida** on the right, so that the diagram reads in the same order as the
    document's own sections.
26. As a modelador, I want an empty **Entrada** or **Salida** to degrade gracefully rather
    than leaving a broken empty box, so that a partially-filled **Fase** is still
    presentable.

### Exporting

27. As a modelador, I want to export the current **Fase** as a PNG, so that I can paste it
    directly into the Word document.
28. As a modelador, I want the PNG rendered at higher-than-screen resolution, so that it
    does not look soft when the document is printed.
29. As a modelador, I want to export the current **Fase** as a PDF, so that I can attach a
    vector version when the document needs one.
30. As a modelador, I want the exported file to contain only the diagram — no form, no
    buttons, no phase tabs — so that I do not have to crop it afterwards.
31. As a modelador, I want the exported file named after the **Fase**, so that four
    exports do not collide in my downloads folder.
32. As a modelador, I want the exported image to look exactly like the on-screen preview,
    so that there is no surprise after I paste it in.

### Persistence

33. As a modelador, I want my edits to survive a page refresh, so that I do not lose work
    to a stray reload.
34. As a modelador, I want to export the whole model as a JSON file, so that I can keep it
    alongside the document or send it to a colleague.
35. As a modelador, I want to import a previously exported JSON file, so that I can pick
    the model back up on another machine.
36. As a modelador, I want a malformed or unrelated JSON file to be rejected with a clear
    message rather than corrupting my model, so that a bad import cannot destroy my work.
37. As a modelador, I want a "Restablecer" action that reloads the four **Fases** from the
    source document, so that I can abandon an experiment and return to the known-good
    model.
38. As a modelador, I want "Restablecer" to confirm before discarding, so that I cannot
    lose the model with one misplaced click.

## Implementation Decisions

### Scope boundary — no Method Content layer

Per **ADR-0001**, the SPEM 2.0 separation between Method Content (the timeless reusable
library) and Process (its ordering in time) is **not** implemented. Each **Fase** carries
its own **Roles**, **Tareas** and **Productos de Trabajo** as plain text. There is no
`TaskDefinition` / `TaskUse` distinction, no shared library, and no referential integrity
to maintain. Renaming a **Rol** that appears in three **Fases** is three edits.

### Data model

The model is one document containing an ordered list of **Fases**. This shape came out of
the grilling session and encodes the decisions above more precisely than prose:

```ts
type Modelo = { version: 1; fases: Fase[] };

type Fase = {
  id: string;
  nombre: string;        // "Fase 1: Especificación global de nivel cero"
  objetivo: string;      // "Fijar el marco de gobernanza, límites y contratos iniciales"
  roles: string[];       // per-Fase, never per-Tarea — see ADR-0001 / story 24
  tareas: Tarea[];
  entrada: string[];     // Productos de Trabajo consumed
  salida: string[];      // Productos de Trabajo produced
};

type Tarea = { id: string; nombre: string; descripcion?: string };
```

`version` exists so an imported file from a future shape can be rejected rather than
silently misread.

### Layout module

A pure function maps one **Fase** to absolute coordinates. It owns every geometric rule:
column x-positions, node heights derived from wrapped text, panel sizing, chip band
packing, arrow endpoints, and the total canvas dimensions. It performs its own text
measurement by character-width approximation rather than reading the DOM, so it stays
pure and testable outside a browser.

Per **ADR-0002**, only **Tareas** become nodes. **Entrada** and **Salida** each become a
single panel container whose items are text lines inside it, and **Roles** become a chip
band under the title. This keeps a 24-element **Fase** at roughly six nodes plus two
panels, inside the density budget.

Output shape:

```ts
type DiagramLayout = {
  width: number; height: number;
  titulo: { nombre: string; objetivo: string; x: number; y: number };
  chips: { texto: string; x: number; y: number; w: number }[];
  paneles: { rol: "entrada" | "salida"; x, y, w, h: number; items: string[] }[];
  nodos: { id: string; lineas: string[]; x, y, w, h: number; focal: boolean }[];
  flechas: { d: string; tipo: "consume" | "produce" }[];
};
```

### Rendering module

A React component consumes `DiagramLayout` and emits a single `<svg>` in JSX. It contains
no measurement and no conditional geometry — every number comes from the layout. Arrow
markers, panel frames and node boxes are defined once as SVG primitives.

Visual treatment follows the `diagram-design` defaults: paper `#f5f5f5`, ink `#2d3142`,
accent `#eb6c36`, Instrument Serif for the title, Geist for node names, Geist Mono for
eyebrows and tags. Accent is reserved for one or two focal elements per diagram — the
**Fase** title and the **Salida** panel — never applied broadly.

### Editing surface

A single side panel driven by the selected **Fase**. Text inputs for `nombre` and
`objetivo`; four list editors for `roles`, `tareas`, `entrada` and `salida`, each with
add, edit, remove and reorder. Every keystroke updates the model, which re-runs layout and
re-renders the SVG. There is no drag-to-position anywhere in the interface.

### Animation

Per **ADR-0004**, animation is CSS only — no GSAP, no HyperFrames, no `hyperframes-core`.
Node entry is opacity plus a small translate with a staggered delay driven by a CSS
custom property; arrows draw by animating `stroke-dashoffset` from their path length to
zero. Animation is screen-only and has no effect on export, which captures a static frame.

### Export

Per **ADR-0003**, both export paths are dependency-free.

PNG: serialise the live `<svg>` with `XMLSerializer`, load it into an `Image`, draw it to
a `<canvas>` at 3× the layout dimensions, and hand the result to a download link. Fonts are
inlined into the serialised SVG so the rasteriser does not fall back to a system face.

PDF: a print stylesheet hides all chrome and prints the SVG alone at page size, then
`window.print()` opens the browser dialog where the user chooses "Guardar como PDF". The
accepted cost is one extra user step compared to a direct download.

Filenames derive from the **Fase** name, slugified.

### Persistence

The whole `Modelo` is serialised to `localStorage` on every change. On boot the stored
value is parsed through the same validation used for file import; anything that fails
falls back to the seed rather than crashing. "Exportar JSON" downloads the model;
"Importar JSON" reads a file and replaces the model after validation. "Restablecer"
confirms, then reseeds from the document.

### Validation — trust boundary

Importing a JSON file and reading `localStorage` are both untrusted input. A single
validation function takes `unknown` and returns either a valid `Modelo` or a structured
error. It is hand-written — no schema library — because the shape is five fields deep.
It checks `version`, that `fases` is an array, and that each **Fase** has the required
string and array fields, rejecting rather than coercing.

### Stack

Vite + React + TypeScript with plain CSS using custom properties for the design tokens.
Three runtime dependencies. No Tailwind, no component library, no diagram library, no
state management library — component state is sufficient for one document.

## Testing Decisions

A good test here asserts external behaviour only: given a **Fase**, what coordinates come
out; given a JSON blob, is it accepted or rejected. Tests must not assert on internal
helper functions, intermediate values, or the exact SVG string. Layout tests assert on
*relationships* — that the **Salida** panel starts to the right of the last **Tarea**
node, that nodes do not overlap, that the canvas is tall enough to contain everything —
rather than on hard-coded pixel values, which would break on every spacing tweak and
teach nothing.

There is no prior art in this repository; it is a new project. These are the first tests.

### Seam 1 — layout

The primary seam. Pure, no DOM, no browser. Covered cases:

- The largest **Fase** in the seeded model produces a node count inside the density budget
  (**ADR-0002** holds: **Entrada** and **Salida** items do not become nodes).
- A **Tarea** with text longer than the node width wraps to multiple lines, and the node's
  height grows to contain them.
- Nodes in the **Tareas** column do not overlap each other vertically.
- The **Entrada** panel sits entirely left of the **Tareas** column; the **Salida** panel
  sits entirely right of it.
- Reported canvas width and height contain every emitted element.
- A **Fase** with an empty **Entrada** produces no **Entrada** panel and no dangling
  arrow, rather than a zero-height box.
- A **Fase** with no **Tareas** still produces a valid layout.
- Every **Roles** chip fits within the canvas width; a long role list wraps to a second
  band row rather than overflowing.
- Arrow paths begin on a panel edge and end on a node edge — no arrow starts or ends in
  empty space.

### Seam 2 — model validation

The trust boundary. Covered cases:

- A model round-tripped through export and import is unchanged.
- An unknown `version` is rejected.
- A payload missing `fases` is rejected.
- A **Fase** missing a required field is rejected.
- A **Fase** where `roles` is a string instead of an array is rejected, not coerced.
- Non-object input (`null`, an array, a string, a number) is rejected.
- Unrecognised extra properties are tolerated and dropped, so a file from a later version
  with the same `version` number does not hard-fail.
- Rejection returns a message naming what was wrong, not a thrown exception.

### Not tested

The React components, the export module and the persistence wiring have no tests. They are
deliberately thin: the components hold no geometry, and the export path is browser API
plumbing that would require jsdom and canvas stubs to exercise while proving nothing about
the diagram's correctness. Vitest is the only test dependency; jsdom and testing-library
are not installed.

## Out of Scope

- **The SPEM 2.0 Method Content layer.** No reusable definition library, no `TaskUse` vs
  `TaskDefinition`, no cross-**Fase** element reuse. See **ADR-0001**.
- **Freeform canvas editing.** No dragging nodes, no hand-drawn connections, no pan and
  zoom, no marquee selection. Layout is always computed.
- **The canonical per-Tarea SPEM triad view.** Only the per-**Fase** column flow is built.
- **Animated presentation mode.** No play button, no step-through of a **Fase** building
  itself. See **ADR-0004**.
- **A HyperFrames video composition.** Not built, and not a second artifact in this repo.
- **Any backend.** No server, no accounts, no shared state between people, no
  collaboration.
- **Writing back into the .docx.** The user pastes the exported image manually. The tool
  never opens or modifies the Word document.
- **Direct-download PDF.** The browser print dialog is the accepted path. See **ADR-0003**.
- **Importing from EPF Composer, XMI, or draw.io.** JSON produced by this tool is the only
  import format.
- **Multiple process models.** One `Modelo` at a time, one `localStorage` slot.
- **Undo/redo.** Not built; "Restablecer" plus JSON export is the recovery path.
- **Internationalisation.** The UI is Spanish only; there is no language switch.

## Further Notes

The four seeded **Fases** come from `/Users/sjunka/Downloads/Modelo de procesos.docx`.
Their element counts are 15, 20, 19 and 24 respectively, counting **Roles**, **Tareas**,
**Entrada** and **Salida** items together. **Fase 4** is the stress case for layout and
should be the one checked first when judging whether the density rule is holding.

The **Salida** of each **Fase** is textually almost identical to the **Entrada** of the
next. The tool does not enforce or detect this — the strings are independent. If a
cross-**Fase** consistency check is ever wanted, that is the moment **ADR-0001** should be
revisited, because it is the first real argument for a shared **Producto de Trabajo**
library.

The `diagram-design` skill's style guide has never been customised in this project; the
shipped defaults were accepted deliberately. If the project later gains brand tokens, they
belong in the CSS custom properties, and the diagram will pick them up without a layout
change.
