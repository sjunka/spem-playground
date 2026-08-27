import { useEffect, useMemo, useRef, useState } from "react";
import { Diagrama } from "./Diagrama";
import { Editor } from "./Editor";
import { layout } from "./layout";
import type { Fase, Modelo } from "./modelo";
import { seed } from "./seed";
import { cargar, guardar } from "./almacen";
import { exportarJSON, exportarPDF, exportarPNG } from "./exportar";
import { validar } from "./validacion";

const nuevaFase = (n: number): Fase => ({
  id: Math.random().toString(36).slice(2, 9),
  nombre: `Fase ${n}: nueva`,
  objetivo: "",
  roles: [],
  tareas: [],
  entrada: [],
  salida: [],
});

export function App() {
  const [modelo, setModelo] = useState<Modelo>(cargar);
  const [faseId, setFaseId] = useState(() => modelo.fases[0]?.id ?? "");
  const [aviso, setAviso] = useState<string | null>(null);
  const lienzoRef = useRef<HTMLDivElement>(null);

  useEffect(() => guardar(modelo), [modelo]);

  const fase: Fase | undefined =
    modelo.fases.find((f) => f.id === faseId) ?? modelo.fases[0];
  const diagrama = useMemo(() => (fase ? layout(fase) : null), [fase]);

  const actualizarFase = (cambiada: Fase) =>
    setModelo({
      ...modelo,
      fases: modelo.fases.map((f) => (f.id === cambiada.id ? cambiada : f)),
    });

  const importar = async (archivo: File) => {
    try {
      const r = validar(JSON.parse(await archivo.text()));
      if (!r.ok) return setAviso(`Importación rechazada: ${r.error}`);
      setModelo(r.modelo);
      setFaseId(r.modelo.fases[0]?.id ?? "");
      setAviso("Modelo importado.");
    } catch {
      setAviso("Importación rechazada: el archivo no es JSON válido.");
    }
  };

  const restablecer = () => {
    if (!confirm("¿Descartar el modelo actual y recargar las cuatro Fases del documento?"))
      return;
    const inicial = seed();
    setModelo(inicial);
    setFaseId(inicial.fases[0].id);
    setAviso("Modelo restablecido.");
  };

  const exportarImagen = () => {
    const svg = lienzoRef.current?.querySelector("svg");
    if (svg && fase) exportarPNG(svg as SVGSVGElement, fase.nombre).catch((e) => setAviso(e.message));
  };

  return (
    <div className="app">
      <header className="chrome">
        <nav className="fases">
          {modelo.fases.map((f) => (
            <button
              key={f.id}
              className={f.id === fase?.id ? "tab activa" : "tab"}
              onClick={() => setFaseId(f.id)}
            >
              {f.nombre.split(":")[0]}
            </button>
          ))}
          <button
            className="tab anadir"
            onClick={() => {
              const f = nuevaFase(modelo.fases.length + 1);
              setModelo({ ...modelo, fases: [...modelo.fases, f] });
              setFaseId(f.id);
            }}
          >
            + Fase
          </button>
        </nav>
        <div className="acciones">
          <button onClick={exportarImagen}>Exportar PNG</button>
          <button onClick={exportarPDF}>Exportar PDF</button>
          <button onClick={() => exportarJSON(modelo)}>Exportar JSON</button>
          <label className="boton-archivo">
            Importar JSON
            <input
              type="file"
              accept="application/json"
              onChange={(e) => {
                const archivo = e.target.files?.[0];
                if (archivo) importar(archivo);
                e.target.value = "";
              }}
            />
          </label>
          <button onClick={restablecer}>Restablecer</button>
          <button
            className="peligro"
            disabled={!fase}
            onClick={() => {
              if (!fase) return;
              if (!confirm(`¿Eliminar "${fase.nombre}"?`)) return;
              const fases = modelo.fases.filter((f) => f.id !== fase.id);
              setModelo({ ...modelo, fases });
              setFaseId(fases[0]?.id ?? "");
            }}
          >
            Eliminar Fase
          </button>
        </div>
      </header>

      {aviso && (
        <p className="aviso chrome" onClick={() => setAviso(null)}>
          {aviso}
        </p>
      )}

      <main>
        <aside className="chrome">
          {fase ? (
            <Editor fase={fase} onChange={actualizarFase} />
          ) : (
            <p className="vacio">No hay Fases. Añade una o pulsa «Restablecer».</p>
          )}
        </aside>
        <div className="lienzo" ref={lienzoRef}>
          {diagrama && fase && <Diagrama l={diagrama} faseId={fase.id} />}
        </div>
      </main>
    </div>
  );
}
