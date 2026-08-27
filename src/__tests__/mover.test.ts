import { describe, expect, it } from "vitest";
import { mover } from "../mover";

describe("mover", () => {
  it("swaps with the neighbour in the given direction", () => {
    expect(mover(["a", "b", "c"], 1, -1)).toEqual(["b", "a", "c"]);
    expect(mover(["a", "b", "c"], 1, 1)).toEqual(["a", "c", "b"]);
  });

  it("leaves the list alone at either end", () => {
    const lista = ["a", "b"];
    expect(mover(lista, 0, -1)).toBe(lista);
    expect(mover(lista, 1, 1)).toBe(lista);
  });
});
