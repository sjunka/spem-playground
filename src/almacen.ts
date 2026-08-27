import type { Modelo } from "./modelo";
import { VERSION } from "./modelo";
import { seed } from "./seed";
import { validar } from "./validacion";

/** djb2 — basta para distinguir una versión del seed de la siguiente. */
const sello = (texto: string) => {
  let h = 5381;
  for (let i = 0; i < texto.length; i++) h = ((h << 5) + h + texto.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
};

/**
 * The key carries the model version and a stamp of the seed itself.
 *
 * Without it the browser opens on whatever it stored the first time: a v2 model
 * migrates to v3 with the three new Tarea fields empty, so Flujo and Roles would
 * be blank and the preloaded reparto never visible. Stamping the seed means a
 * deploy that changes the four Fases starts from them, while edits survive every
 * reload that does not change the seed. Nothing is deleted — the previous value
 * stays under its own key.
 */
const CLAVE = `spem-playground/modelo/v${VERSION}-${sello(JSON.stringify(seed()))}`;

/** A corrupted stored value falls back to the seed rather than crashing. */
export function cargar(): Modelo {
  const crudo = localStorage.getItem(CLAVE);
  if (!crudo) return seed();
  try {
    const r = validar(JSON.parse(crudo));
    return r.ok ? r.modelo : seed();
  } catch {
    return seed();
  }
}

export function guardar(modelo: Modelo) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(modelo));
  } catch {
    // Storage full or blocked: the in-memory model still works.
  }
}
