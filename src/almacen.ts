import type { Modelo } from "./modelo";
import { seed } from "./seed";
import { validar } from "./validacion";

const CLAVE = "spem-playground/modelo";

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
