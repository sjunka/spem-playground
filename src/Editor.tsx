import type { Fase, Tarea } from "./modelo";
import { ListaEditable } from "./ListaEditable";
import { mover } from "./mover";

type Props = { fase: Fase; onChange: (fase: Fase) => void };

const nuevoId = () => Math.random().toString(36).slice(2, 9);

export function Editor({ fase, onChange }: Props) {
  const parche = (cambio: Partial<Fase>) => onChange({ ...fase, ...cambio });

  const parcheTarea = (i: number, cambio: Partial<Tarea>) =>
    parche({
      tareas: fase.tareas.map((t, j) => (j === i ? { ...t, ...cambio } : t)),
    });

  const moverTarea = (i: number, delta: number) =>
    parche({ tareas: mover(fase.tareas, i, delta) });

  return (
    <div className="editor">
      <label>
        Nombre de la Fase
        <input
          value={fase.nombre}
          onChange={(e) => parche({ nombre: e.target.value })}
        />
      </label>
      <label>
        Objetivo
        <textarea
          rows={3}
          value={fase.objetivo}
          onChange={(e) => parche({ objetivo: e.target.value })}
        />
      </label>

      <ListaEditable
        titulo="Roles participantes"
        items={fase.roles}
        placeholder="Rol"
        onChange={(roles) => parche({ roles })}
      />

      <section className="lista">
        <h3>Tareas</h3>
        {fase.tareas.map((tarea, i) => (
          <div className="tarea" key={tarea.id}>
            <div className="fila">
              <input
                value={tarea.nombre}
                placeholder="Nombre de la Tarea"
                onChange={(e) => parcheTarea(i, { nombre: e.target.value })}
              />
              <button onClick={() => moverTarea(i, -1)} disabled={i === 0} title="Subir">
                ↑
              </button>
              <button
                onClick={() => moverTarea(i, 1)}
                disabled={i === fase.tareas.length - 1}
                title="Bajar"
              >
                ↓
              </button>
              <button
                onClick={() =>
                  parche({ tareas: fase.tareas.filter((_, j) => j !== i) })
                }
                title="Eliminar"
              >
                ✕
              </button>
            </div>
            <input
              className="descripcion"
              value={tarea.descripcion ?? ""}
              placeholder="Descripción (opcional)"
              onChange={(e) =>
                parcheTarea(i, { descripcion: e.target.value || undefined })
              }
            />
          </div>
        ))}
        <button
          className="anadir"
          onClick={() =>
            parche({
              tareas: [...fase.tareas, { id: nuevoId(), nombre: "", icono: "task" }],
            })
          }
        >
          + Añadir Tarea
        </button>
      </section>

      <ListaEditable
        titulo="Entrada"
        items={fase.entrada.map((p) => p.texto)}
        placeholder="Producto de Trabajo consumido"
        onChange={(textos) =>
          parche({
            entrada: textos.map((texto, i) => ({
              texto,
              icono: fase.entrada[i]?.icono ?? "workProduct",
            })),
          })
        }
      />
      <ListaEditable
        titulo="Salida"
        items={fase.salida.map((p) => p.texto)}
        placeholder="Producto de Trabajo producido"
        onChange={(textos) =>
          parche({
            salida: textos.map((texto, i) => ({
              texto,
              icono: fase.salida[i]?.icono ?? "workProduct",
            })),
          })
        }
      />
    </div>
  );
}
