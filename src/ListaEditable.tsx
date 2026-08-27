import type { IdIcono } from "./iconos";
import type { Producto } from "./modelo";
import { mover } from "./mover";
import { SelectorIcono } from "./SelectorIcono";

type Props = {
  titulo: string;
  /** Whole items, never text alone: reordering and deleting must carry the icon. */
  items: Producto[];
  onChange: (items: Producto[]) => void;
  placeholder: string;
  /** A list of Roles is always Role, so it shows no selector. */
  conIcono?: boolean;
  iconoNuevo: IdIcono;
};

export function ListaEditable({
  titulo,
  items,
  onChange,
  placeholder,
  conIcono,
  iconoNuevo,
}: Props) {
  const parche = (i: number, cambio: Partial<Producto>) =>
    onChange(items.map((item, j) => (j === i ? { ...item, ...cambio } : item)));

  return (
    <section className="lista">
      <h3>{titulo}</h3>
      {items.map((item, i) => (
        <div className="item" key={i}>
          <div className="fila">
            <input
              value={item.texto}
              placeholder={placeholder}
              onChange={(e) => parche(i, { texto: e.target.value })}
            />
            <button onClick={() => onChange(mover(items, i, -1))} disabled={i === 0} title="Subir">
              ↑
            </button>
            <button
              onClick={() => onChange(mover(items, i, 1))}
              disabled={i === items.length - 1}
              title="Bajar"
            >
              ↓
            </button>
            <button
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              title="Eliminar"
            >
              ✕
            </button>
          </div>
          {conIcono && (
            <SelectorIcono
              valor={item.icono}
              onChange={(icono) => parche(i, { icono })}
            />
          )}
        </div>
      ))}
      <button
        className="anadir"
        onClick={() => onChange([...items, { texto: "", icono: iconoNuevo }])}
      >
        + Añadir
      </button>
    </section>
  );
}
