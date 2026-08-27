import type { Fase, Papel, Tarea } from "./modelo";
import { aplicarRoles } from "./roles";
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
        onChange={(items) =>
          onChange(aplicarRoles(fase, items.map((p) => p.texto)))
        }
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
            <details className="detalle-tarea">
              <summary>Roles, Entrada y Salida de la Tarea</summary>
              <section className="lista">
                <h3>Roles de la Tarea</h3>
                {fase.roles.length === 0 && (
                  <p className="vacio">
                    Declara Roles en la Fase para poder asignarlos.
                  </p>
                )}
                {fase.roles.map((rol, k) => {
                  const actual = tarea.roles.find((r) => r.rol === rol)?.papel ?? "";
                  return (
                    // Dos Roles recién añadidos comparten el nombre vacío: la
                    // posición es lo único que distingue una fila de la otra.
                    <label className="papel" key={`${k}-${rol}`}>
                      <span>{rol}</span>
                      <select
                        value={actual}
                        onChange={(e) => {
                          const papel = e.target.value as Papel | "";
                          const otros = tarea.roles.filter((r) => r.rol !== rol);
                          parcheTarea(i, {
                            roles: papel === "" ? otros : [...otros, { rol, papel }],
                          });
                        }}
                      >
                        <option value="">No participa</option>
                        <option value="perform">Ejecuta «perform»</option>
                        <option value="assist">Asiste «assist»</option>
                      </select>
                    </label>
                  );
                })}
              </section>
              <ListaEditable
                titulo="Entrada de la Tarea"
                placeholder="Producto de Trabajo consumido"
                items={tarea.entrada}
                iconoNuevo="workProduct"
                conIcono
                onChange={(entrada) => parcheTarea(i, { entrada })}
              />
              <ListaEditable
                titulo="Salida de la Tarea"
                placeholder="Producto de Trabajo producido"
                items={tarea.salida}
                iconoNuevo="workProduct"
                conIcono
                onChange={(salida) => parcheTarea(i, { salida })}
              />
            </details>
          </div>
        ))}
        <button
          className="anadir"
          onClick={() =>
            parche({
              tareas: [
                ...fase.tareas,
                {
                  id: nuevoId(),
                  nombre: "",
                  icono: "task",
                  roles: [],
                  entrada: [],
                  salida: [],
                },
              ],
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
