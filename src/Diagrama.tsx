import { CAJA, ICONOS, type IdIcono } from "./iconos";
import { ESCALA, type DiagramLayout } from "./layout";

const {
  titulo: T,
  objetivo: O,
  nodo: N,
  desc: D,
  item: I,
  icono: IC,
  leyenda: L,
} = ESCALA;

type Props = { l: DiagramLayout; faseId: string };

/**
 * One SPEM glyph, scaled from its 24x24 box to `tam`. Hidden from assistive tech:
 * the text beside it already names the element, and announcing both reads double.
 */
function Icono({ id, x, y, tam }: { id: IdIcono; x: number; y: number; tam: number }) {
  return (
    <path
      className="icono"
      aria-hidden="true"
      transform={`translate(${x} ${y}) scale(${tam / CAJA})`}
      d={ICONOS[id]}
    />
  );
}

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
      aria-labelledby={`${faseId}-titulo ${faseId}-desc`}
    >
      <title id={`${faseId}-titulo`}>{l.titulo.nombre}</title>
      <desc id={`${faseId}-desc`}>
        {`${l.titulo.objetivo.join(" ")} Entrada: ${
          l.paneles.find((p) => p.tipo === "entrada")?.items.length ?? 0
        } Productos de Trabajo. ${l.nodos.length} Tareas. Salida: ${
          l.paneles.find((p) => p.tipo === "salida")?.items.length ?? 0
        } Productos de Trabajo. Roles: ${l.chips.map((c) => c.texto).join(", ")}.`}
      </desc>
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

      <g className="icono-titulo">
        <Icono id="phase" x={l.titulo.iconoX} y={l.titulo.iconoY} tam={IC.titulo} />
      </g>

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
          <Icono
            id="role"
            x={chip.iconoX}
            y={chip.y + (chip.h - IC.chip) / 2}
            tam={IC.chip}
          />
          <text x={chip.textoX} y={chip.y + chip.h * 0.68}>
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
          {panel.items.map((item, i) => (
            <g key={i}>
              <Icono
                id={item.icono}
                x={item.iconoX}
                y={panel.y + item.y + item.iconoDy}
                tam={IC.item}
              />
              {item.lineas.map((linea, j) => (
                <text
                  key={j}
                  x={item.textoX}
                  y={panel.y + item.y + I.lh * (j + 0.7)}
                  className="t-item"
                >
                  {linea}
                </text>
              ))}
            </g>
          ))}
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
          <Icono id={nodo.icono} x={nodo.iconoX} y={nodo.iconoY} tam={IC.nodo} />
          {nodo.lineas.map((linea, j) => (
            <text
              key={j}
              x={nodo.textoX}
              y={nodo.y + N.pad + N.lh * (j + 0.75)}
              className="t-nodo"
            >
              {linea}
            </text>
          ))}
          {nodo.descripcion.map((linea, j) => (
            <text
              key={`d${j}`}
              x={nodo.textoX}
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
      <g className="leyenda">
        <line
          x1={l.leyenda.x}
          y1={l.leyenda.reglaY}
          x2={l.leyenda.x + l.leyenda.w}
          y2={l.leyenda.reglaY}
        />
        {l.leyenda.entradas.map((e) => (
          <g key={e.icono}>
            <Icono
              id={e.icono}
              x={e.x}
              y={e.y + (L.fila - IC.leyenda) / 2 - 4}
              tam={IC.leyenda}
            />
            <text x={e.textoX} y={e.y + L.fila / 2 + 1} className="t-leyenda">
              {e.texto}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
