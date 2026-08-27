import type { Fase, Tarea } from "./modelo";
import { ListaEditable } from "./ListaEditable";
import { mover } from "./mover";
import { SelectorIcono } from "./SelectorIcono";

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
        items={fase.roles.map((texto) => ({ texto, icono: "role" as const }))}
        placeholder="Rol"
        iconoNuevo="role"
        onChange={(items) => parche({ roles: items.map((p) => p.texto) })}
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
            <SelectorIcono
              valor={tarea.icono}
              onChange={(icono) => parcheTarea(i, { icono })}
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
        placeholder="Producto de Trabajo consumido"
        items={fase.entrada}
        iconoNuevo="workProduct"
        conIcono
        onChange={(entrada) => parche({ entrada })}
      />
      <ListaEditable
        titulo="Salida"
        placeholder="Producto de Trabajo producido"
        items={fase.salida}
        iconoNuevo="workProduct"
        conIcono
        onChange={(salida) => parche({ salida })}
      />
    </div>
  );
}
