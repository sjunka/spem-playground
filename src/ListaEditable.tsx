type Props = {
  titulo: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
};

export function ListaEditable({ titulo, items, onChange, placeholder }: Props) {
  const reemplazar = (i: number, valor: string) =>
    onChange(items.map((item, j) => (j === i ? valor : item)));

  const mover = (i: number, delta: number) => {
    const destino = i + delta;
    if (destino < 0 || destino >= items.length) return;
    const copia = [...items];
    [copia[i], copia[destino]] = [copia[destino], copia[i]];
    onChange(copia);
  };

  return (
    <section className="lista">
      <h3>{titulo}</h3>
      {items.map((item, i) => (
        <div className="fila" key={i}>
          <input
            value={item}
            placeholder={placeholder}
            onChange={(e) => reemplazar(i, e.target.value)}
          />
          <button onClick={() => mover(i, -1)} disabled={i === 0} title="Subir">
            ↑
          </button>
          <button
            onClick={() => mover(i, 1)}
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
      ))}
      <button className="anadir" onClick={() => onChange([...items, ""])}>
        + Añadir
      </button>
    </section>
  );
}
