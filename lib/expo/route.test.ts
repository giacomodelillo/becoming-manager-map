import { describe, expect, it } from "vitest";
import { assertFairData, buildStudentRoute, routeHasEdge } from "./route";
import { companies, fairLayout } from "./data";

describe("buildStudentRoute", () => {
  it("parte da start e chiude sull'azienda precedente", () => {
    expect(buildStudentRoute([1, 2, 3, 4, 5], 3)).toEqual([3, 4, 5, 1, 2]);
  });
  it("con start 1 è l'ordine naturale", () => {
    expect(buildStudentRoute([1, 2, 3, 4, 5], 1)).toEqual([1, 2, 3, 4, 5]);
  });
  it("con start N finisce a N-1", () => {
    expect(buildStudentRoute([1, 2, 3, 4, 5], 5)).toEqual([5, 1, 2, 3, 4]);
  });
  it("ignora l'ordine dell'input", () => {
    expect(buildStudentRoute([4, 2, 5, 1, 3], 3)).toEqual([3, 4, 5, 1, 2]);
  });
  it("una sola azienda", () => {
    expect(buildStudentRoute([1], 1)).toEqual([1]);
  });
  it("null se start non esiste", () => {
    expect(buildStudentRoute([1, 2, 3], 9)).toBeNull();
    expect(buildStudentRoute([1, 2, 3], 0)).toBeNull();
  });
  it("visita ogni booth una volta sola", () => {
    const r = buildStudentRoute([1, 2, 3, 4, 5, 6, 7], 5)!;
    expect([...r].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});

describe("routeHasEdge", () => {
  it("riconosce solo i passi consecutivi", () => {
    const r = [3, 4, 5, 1, 2];
    expect(routeHasEdge(r, 5, 1)).toBe(true);
    expect(routeHasEdge(r, 2, 3)).toBe(false);
    expect(routeHasEdge(null, 1, 2)).toBe(false);
  });
});

describe("assertFairData", () => {
  it("accetta i dati di esempio", () => {
    expect(() => assertFairData(companies, fairLayout)).not.toThrow();
  });
  it("rifiuta un booth duplicato nel layout", () => {
    const bad = {
      ...fairLayout,
      columns: [{ ...fairLayout.columns[0], booths: [1, 1, 3, 4] }, ...fairLayout.columns.slice(1)],
    };
    expect(() => assertFairData(companies, bad)).toThrow();
  });
  it("rifiuta numeri con buchi", () => {
    const holes = companies.filter((c) => c.id !== 2);
    expect(() => assertFairData(holes, fairLayout)).toThrow();
  });
});
