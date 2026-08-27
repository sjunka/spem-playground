import { CAJA, ETIQUETAS, ICONOS, IDS_ICONO, type IdIcono } from "./iconos";

type Props = { valor: IdIcono; onChange: (valor: IdIcono) => void };

/**
 * Picks the SPEM type of one element. A native <select> rather than a grid of
 * glyphs in a popover: keyboard and screen-reader support come for free, and the
 * preview beside it already shows what was chosen.
 */
export function SelectorIcono({ valor, onChange }: Props) {
  return (
    <div className="selector-icono">
      <svg viewBox={`0 0 ${CAJA} ${CAJA}`} width="18" height="18" aria-hidden="true">
        <path className="icono" d={ICONOS[valor]} />
      </svg>
      <select
        aria-label="Tipo SPEM"
        value={valor}
        onChange={(e) => onChange(e.target.value as IdIcono)}
      >
        {IDS_ICONO.map((id) => (
          <option key={id} value={id}>
            {ETIQUETAS[id]}
          </option>
        ))}
      </select>
    </div>
  );
}
