import type { DiagramLayout } from "./layout";

const LH_TITULO = 46;
const LH_OBJETIVO = 20;
const LH_NODO = 22;
const LH_DESC = 17;
const LH_ITEM = 18;

type Props = { l: DiagramLayout; faseId: string };

export function Diagrama({ l, faseId }: Props) {
  return (
    <svg
      key={faseId}
      id="diagrama"
      className="diagrama"
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${l.width} ${l.height}`}
      width={l.width}
      height={l.height}
      role="img"
      aria-label={l.titulo.nombre}
    >
      <defs>
        <marker
          id="punta"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)" />
        </marker>
      </defs>

      <rect width={l.width} height={l.height} fill="var(--paper)" />

      <text
        x={l.titulo.x}
        y={l.titulo.y + LH_TITULO * 0.75}
        className="t-titulo"
      >
        {l.titulo.nombre}
      </text>
      {l.titulo.objetivo.map((linea, i) => (
        <text
          key={i}
          x={l.titulo.x}
          y={l.titulo.y + LH_TITULO + LH_OBJETIVO * (i + 0.75)}
          className="t-objetivo"
        >
          {linea}
        </text>
      ))}

      {l.chips.map((chip, i) => (
        <g key={i} className="chip">
          <rect x={chip.x} y={chip.y} width={chip.w} height={chip.h} rx={chip.h / 2} />
          <text x={chip.x + chip.w / 2} y={chip.y + chip.h * 0.68}>
            {chip.texto}
          </text>
        </g>
      ))}

      {l.paneles.map((panel) => (
        <g key={panel.rol} className={`panel panel-${panel.rol}`}>
          <rect x={panel.x} y={panel.y} width={panel.w} height={panel.h} rx={4} />
          <text x={panel.x + 16} y={panel.y + 16 + LH_ITEM * 0.6} className="t-eyebrow">
            {panel.rol === "entrada" ? "ENTRADA" : "SALIDA"}
          </text>
          {panel.items.map((item, i) =>
            item.lineas.map((linea, j) => (
              <text
                key={`${i}-${j}`}
                x={panel.x + 16}
                y={panel.y + item.y + LH_ITEM * (j + 0.7)}
                className="t-item"
              >
                {linea}
              </text>
            )),
          )}
        </g>
      ))}

      {l.flechas.map((flecha, i) => (
        <path
          key={i}
          className={`flecha flecha-${flecha.tipo}`}
          d={flecha.d}
          markerEnd="url(#punta)"
        />
      ))}

      {l.nodos.map((nodo, i) => (
        <g
          key={nodo.id}
          className="nodo"
          style={{ "--i": i } as React.CSSProperties}
        >
          <rect x={nodo.x} y={nodo.y} width={nodo.w} height={nodo.h} rx={4} />
          {nodo.lineas.map((linea, j) => (
            <text
              key={j}
              x={nodo.x + 14}
              y={nodo.y + 14 + LH_NODO * (j + 0.75)}
              className="t-nodo"
            >
              {linea}
            </text>
          ))}
          {nodo.descripcion.map((linea, j) => (
            <text
              key={`d${j}`}
              x={nodo.x + 14}
              y={
                nodo.y +
                14 +
                LH_NODO * nodo.lineas.length +
                6 +
                LH_DESC * (j + 0.75)
              }
              className="t-desc"
            >
              {linea}
            </text>
          ))}
        </g>
      ))}
    </svg>
  );
}
