import { ESCALA, type DiagramLayout } from "./layout";

const { titulo: T, objetivo: O, nodo: N, desc: D, item: I } = ESCALA;

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
        y={l.titulo.y + T.lh * 0.75}
        className="t-titulo"
      >
        {l.titulo.nombre}
      </text>
      {l.titulo.objetivo.map((linea, i) => (
        <text
          key={i}
          x={l.titulo.x}
          y={l.titulo.y + T.lh + O.lh * (i + 0.75)}
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
        <g key={panel.tipo} className={`panel panel-${panel.tipo}`}>
          <rect x={panel.x} y={panel.y} width={panel.w} height={panel.h} rx={4} />
          <text
            x={panel.x + I.pad}
            y={panel.y + I.pad + I.lh * 0.6}
            className="t-eyebrow"
          >
            {panel.tipo === "entrada" ? "ENTRADA" : "SALIDA"}
          </text>
          {panel.items.map((item, i) =>
            item.lineas.map((linea, j) => (
              <text
                key={`${i}-${j}`}
                x={panel.x + I.pad}
                y={panel.y + item.y + I.lh * (j + 0.7)}
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
              x={nodo.x + N.pad}
              y={nodo.y + N.pad + N.lh * (j + 0.75)}
              className="t-nodo"
            >
              {linea}
            </text>
          ))}
          {nodo.descripcion.map((linea, j) => (
            <text
              key={`d${j}`}
              x={nodo.x + N.pad}
              y={
                nodo.y +
                N.pad +
                N.lh * nodo.lineas.length +
                N.separacion +
                D.lh * (j + 0.75)
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
