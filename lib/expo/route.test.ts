import { describe, expect, it } from "vitest";
import { assertFairData, buildStudentRoute, routeHasEdge } from "./route";
import { defaultConfig } from "./data/default";
import { deriveFairView } from "./derive";
import { moveCompany, removeCompany, removeArea, addCompany } from "./config-ops";
import { parseFairConfig } from "./validate";

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
  it("una sola azienda", () => {
    expect(buildStudentRoute([1], 1)).toEqual([1]);
  });
  it("null se start non esiste", () => {
    expect(buildStudentRoute([1, 2, 3], 9)).toBeNull();
  });
});

describe("routeHasEdge", () => {
  it("riconosce solo i passi consecutivi", () => {
    expect(routeHasEdge([3, 4, 5, 1, 2], 5, 1)).toBe(true);
    expect(routeHasEdge([3, 4, 5, 1, 2], 2, 3)).toBe(false);
  });
});

describe("deriveFairView", () => {
  it("numera i booth 1..N seguendo le aree", () => {
    const view = deriveFairView(defaultConfig);
    expect(view.boothIds).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(view.layout.columns[1].booths).toEqual([5, 6, 7, 8]);
    expect(view.byId.get(1)?.name).toBe("Nova Software");
  });
  it("assertFairData rifiuta un booth duplicato", () => {
    const view = deriveFairView(defaultConfig);
    const bad = { ...view.layout, columns: [{ ...view.layout.columns[0], booths: [1, 1, 3, 4] }, ...view.layout.columns.slice(1)] };
    expect(() => assertFairData(view.companies, bad)).toThrow();
  });
});

describe("config-ops", () => {
  const firstKey = defaultConfig.areas[0].companies[0].key;
  const lastOfA = defaultConfig.areas[0].companies[3].key;

  it("sposta un'azienda dentro l'area", () => {
    const next = moveCompany(defaultConfig, firstKey, 1);
    expect(next.areas[0].companies[1].key).toBe(firstKey);
  });
  it("ai bordi passa all'area vicina e cambia numero", () => {
    const next = moveCompany(defaultConfig, lastOfA, 1);
    expect(next.areas[0].companies).toHaveLength(3);
    expect(next.areas[1].companies[0].key).toBe(lastOfA);
    expect(deriveFairView(next).byId.get(4)?.name).toBe(defaultConfig.areas[1].companies[0].name === "" ? "" : deriveFairView(next).byId.get(4)?.name);
  });
  it("non sposta oltre i confini", () => {
    expect(moveCompany(defaultConfig, firstKey, -1)).toBe(defaultConfig);
  });
  it("non lascia un'area vuota", () => {
    let c = defaultConfig;
    for (let i = 0; i < 3; i++) c = removeCompany(c, c.areas[0].companies[0].key);
    expect(c.areas[0].companies).toHaveLength(1);
    expect(removeCompany(c, c.areas[0].companies[0].key)).toBe(c);
  });
  it("eliminare un'area unisce le aziende alla vicina", () => {
    const next = removeArea(defaultConfig, "a");
    expect(next.areas).toHaveLength(2);
    expect(next.areas[0].companies).toHaveLength(8);
  });
  it("aggiunge un'azienda in coda all'area", () => {
    const { config, key } = addCompany(defaultConfig, "b");
    expect(config.areas[1].companies.at(-1)?.key).toBe(key);
  });
});

describe("parseFairConfig", () => {
  it("accetta i dati di partenza", () => {
    expect(() => parseFairConfig(defaultConfig)).not.toThrow();
  });
  it("rifiuta un nome vuoto", () => {
    const bad = structuredClone(defaultConfig);
    bad.areas[0].companies[0].name = "   ";
    expect(() => parseFairConfig(bad)).toThrow();
  });
  it("rifiuta un'area senza aziende", () => {
    const bad = structuredClone(defaultConfig);
    bad.areas[0].companies = [];
    expect(() => parseFairConfig(bad)).toThrow();
  });
  it("rifiuta input non oggetto", () => {
    expect(() => parseFairConfig("ciao")).toThrow();
  });
});
