/** Swaps the item at `i` with its neighbour `delta` away. Out of range: unchanged. */
export function mover<T>(lista: T[], i: number, delta: number): T[] {
  const destino = i + delta;
  if (destino < 0 || destino >= lista.length) return lista;
  const copia = [...lista];
  [copia[i], copia[destino]] = [copia[destino], copia[i]];
  return copia;
}
