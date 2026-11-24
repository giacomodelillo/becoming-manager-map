import { describe, expect, it } from "vitest";
import { assertFairData, buildStudentRoute, routeHasEdge } from "./route";
import { defaultConfig } from "./data/default";
import { deriveFairView } from "./derive";
import { duplicateCompany, moveCompany, moveCompanyTo, removeArea, removeCompany, addCompany } from "./config-ops";
import { applyImport, parseCsv, rowsToEntries } from "./import";
import { parseFairConfig } from "./validate";

describe("buildStudentRoute", () => {
  it("parte da start e chiude sull'azienda precedente", () => {
    expect(buildStudentRoute([1, 2, 3, 4, 5], 3)).toEqual([3, 4, 5, 1, 2]);
  });
  it("con start 1 è l'ordine naturale", () => {
    expect(buildStudentRoute([1, 2, 3, 4, 5], 1)).toEqual([1, 2, 3, 4, 5]);
  });
  it("salta le aziende assenti", () => {
    expect(buildStudentRoute([1, 2, 4, 5], 4)).toEqual([4, 5, 1, 2]);
  });
  it("null se start non esiste (o è assente)", () => {
    expect(buildStudentRoute([1, 2, 4], 3)).toBeNull();
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
    expect(view.boothIds).toHaveLength(12);
    expect(view.layout.columns[1].booths).toEqual([5, 6, 7, 8]);
  });
  it("un'azienda assente tiene il numero ma esce dai percorsi", () => {
    const cfg = structuredClone(defaultConfig);
    cfg.areas[0].companies[1].hidden = true;
    const view = deriveFairView(cfg);
    expect(view.byId.get(2)?.hidden).toBe(true);
    expect(view.boothIds).not.toContain(2);
    expect(view.companies).toHaveLength(12);
  });
  it("rifiuta se sono tutte assenti", () => {
    const cfg = structuredClone(defaultConfig);
    cfg.areas.forEach((a) => a.companies.forEach((c) => (c.hidden = true)));
    expect(() => deriveFairView(cfg)).toThrow();
  });
  it("assertFairData rifiuta un booth duplicato", () => {
    const view = deriveFairView(defaultConfig);
    const bad = { ...view.layout, columns: [{ ...view.layout.columns[0], booths: [1, 1, 3, 4] }, ...view.layout.columns.slice(1)] };
    expect(() => assertFairData(view.companies, bad)).toThrow();
  });
});

describe("config-ops", () => {
  const first = defaultConfig.areas[0].companies[0].key;
  const lastOfA = defaultConfig.areas[0].companies[3].key;

  it("sposta dentro l'area e ai bordi passa a quella vicina", () => {
    expect(moveCompany(defaultConfig, first, 1).areas[0].companies[1].key).toBe(first);
    const next = moveCompany(defaultConfig, lastOfA, 1);
    expect(next.areas.map((a) => a.companies.length)).toEqual([3, 5, 4]);
  });
  it("non lascia un'area vuota", () => {
    let c = defaultConfig;
    for (let i = 0; i < 3; i++) c = removeCompany(c, c.areas[0].companies[0].key);
    expect(c.areas[0].companies).toHaveLength(1);
    expect(removeCompany(c, c.areas[0].companies[0].key)).toBe(c);
  });
  it("eliminare un'area unisce le aziende alla vicina", () => {
    const next = removeArea(defaultConfig, "a");
    expect(next.areas[0].companies).toHaveLength(8);
  });
  it("aggiunge in coda", () => {
    const { config, key } = addCompany(defaultConfig, "b");
    expect(config.areas[1].companies.at(-1)?.key).toBe(key);
  });
  it("duplica subito dopo l'originale con una chiave nuova", () => {
    const { config, key } = duplicateCompany(defaultConfig, first);
    expect(config.areas[0].companies[1].key).toBe(key);
    expect(config.areas[0].companies[1].name).toBe("Nova Software (copia)");
    expect(config.areas[0].companies).toHaveLength(5);
  });
  it("moveCompanyTo porta un'azienda in un'altra area a una posizione precisa", () => {
    const next = moveCompanyTo(defaultConfig, first, "b", 2);
    expect(next.areas[1].companies[2].key).toBe(first);
    expect(next.areas[0].companies).toHaveLength(3);
  });
});

describe("importazione CSV", () => {
  const csv =
    "\uFEFFArea;Azienda;Settore;Descrizione;Posizioni;Requisiti;Note;Assente\r\n" +
    'Area A;Alfa;Tech;"Descrizione; con punto e virgola";"Dev | QA";"Laurea | Inglese";Nota;\r\n' +
    "Area B;Beta;Food;Buona;Cuoco;;;sì\r\n" +
    ";;;;;;;\r\n" +
    "Area A;Gamma;Tech;Altra;Analista;;;\r\n";

  it("legge virgolette, separatore e BOM", () => {
    const rows = parseCsv(csv);
    expect(rows[0][0]).toBe("Area");
    expect(rows[1][3]).toBe("Descrizione; con punto e virgola");
    expect(rows).toHaveLength(4);
  });
  it("crea le aziende con liste e assenza", () => {
    const { entries } = rowsToEntries(parseCsv(csv));
    expect(entries).toHaveLength(3);
    expect(entries[0].company.roles).toEqual(["Dev", "QA"]);
    expect(entries[1].company.hidden).toBe(true);
  });
  it("sostituisce o aggiunge in coda, raggruppando per area", () => {
    const { entries } = rowsToEntries(parseCsv(csv));
    const replaced = applyImport(defaultConfig, entries, "replace");
    expect(replaced.areas.map((a) => a.companies.length)).toEqual([2, 1]);
    const appended = applyImport(defaultConfig, entries, "append");
    expect(appended.areas).toHaveLength(3 + 0); // "Area A" e "Area B" esistono già
    expect(appended.areas[0].companies).toHaveLength(6);
  });
  it("errore chiaro senza la colonna Azienda", () => {
    expect(() => rowsToEntries([["Foo"], ["bar"]])).toThrow(/Azienda/);
  });
});

describe("parseFairConfig", () => {
  it("accetta i dati di partenza e aggiunge display ai vecchi file", () => {
    const old = structuredClone(defaultConfig) as Record<string, unknown>;
    delete old.display;
    expect(parseFairConfig(old).display.mapSize).toBe("fit");
  });
  it("scarta nomi di file non validi e accetta quelli giusti", () => {
    const cfg = structuredClone(defaultConfig);
    cfg.areas[0].companies[0].logo = "../../etc/passwd";
    cfg.areas[0].companies[1].logo = "a1b2c3d4e5f6.webp";
    const parsed = parseFairConfig(cfg);
    expect(parsed.areas[0].companies[0].logo).toBeUndefined();
    expect(parsed.areas[0].companies[1].logo).toBe("a1b2c3d4e5f6.webp");
  });
  it("controlla l'indirizzo pubblico", () => {
    const cfg = structuredClone(defaultConfig);
    cfg.display.publicUrl = "ftp://x";
    expect(() => parseFairConfig(cfg)).toThrow();
    cfg.display.publicUrl = "http://192.168.1.20:3000/";
    expect(parseFairConfig(cfg).display.publicUrl).toBe("http://192.168.1.20:3000");
  });
  it("rifiuta un nome vuoto e un'area vuota", () => {
    const a = structuredClone(defaultConfig);
    a.areas[0].companies[0].name = "  ";
    expect(() => parseFairConfig(a)).toThrow();
    const b = structuredClone(defaultConfig);
    b.areas[0].companies = [];
    expect(() => parseFairConfig(b)).toThrow();
  });
});
