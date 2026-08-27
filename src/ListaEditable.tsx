import type { IdIcono } from "./iconos";
import { mover } from "./mover";
import { SelectorIcono } from "./SelectorIcono";

type Props = {
  titulo: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  /** Both are given together, or neither: a list of Roles carries no icon. */
  iconos?: IdIcono[];
  onIcono?: (i: number, icono: IdIcono) => void;
};

export function ListaEditable({
  titulo,
  items,
  onChange,
  placeholder,
  iconos,
  onIcono,
}: Props) {
  const reemplazar = (i: number, valor: string) =>
    onChange(items.map((item, j) => (j === i ? valor : item)));

  return (
    <section className="lista">
      <h3>{titulo}</h3>
      {items.map((item, i) => (
        <div className="item" key={i}>
          <div className="fila">
            <input
              value={item}
              placeholder={placeholder}
              onChange={(e) => reemplazar(i, e.target.value)}
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
          {iconos && onIcono && (
            <SelectorIcono valor={iconos[i]} onChange={(icono) => onIcono(i, icono)} />
          )}
        </div>
      ))}
      <button className="anadir" onClick={() => onChange([...items, ""])}>
        + Añadir
      </button>
    </section>
  );
}
