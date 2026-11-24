import { MAX_AREAS, MAX_COMPANIES, newKey } from "./config-ops";
import type { Area, CompanyDraft, FairConfig } from "./types";

export type ImportEntry = { area: string; company: CompanyDraft };
export type ImportMode = "replace" | "append";

const TONES = ["gold", "magenta", "gray"] as const;

const ALIASES: Record<string, string[]> = {
  area: ["area", "zona", "reparto"],
  name: ["azienda", "nome", "nome azienda", "name", "company"],
  sector: ["settore", "sector"],
  description: ["descrizione", "description"],
  roles: ["posizioni", "posizioni aperte", "ruoli", "roles", "positions"],
  requirements: ["requisiti", "requirements"],
  notes: ["note", "notes"],
  hidden: ["assente", "nascosta", "hidden"],
};

/** Minuscolo, senza accenti né punteggiatura: per confrontare intestazioni e nomi di area. */
export const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** CSV con virgolette, separatore ; , o tab riconosciuto dalla prima riga, BOM ignorato. */
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, "");
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = [";", "\t", ","]
    .map((d) => ({ d, n: firstLine.split(d).length }))
    .sort((a, b) => b.n - a.n)[0].d;

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delimiter) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      rows.push(row);
      row = [];
    } else cell += ch;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.map((r) => r.map((c) => c.trim())).filter((r) => r.some((c) => c !== ""));
}

/** Legge un file CSV oppure Excel (.xlsx, .xls, primo foglio) e restituisce le righe di testo. */
export async function readSheetFile(file: File): Promise<string[][]> {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) throw new Error("Il file Excel è vuoto");
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false, defval: "" });
    return rows.map((r) => r.map((c) => String(c ?? "").trim())).filter((r) => r.some((c) => c !== ""));
  }
  return parseCsv(await file.text());
}

const splitList = (value: string) =>
  value
    .split(/\s*[|\n;]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

/** Dalle righe (la prima è l'intestazione) alle aziende da importare. */
export function rowsToEntries(rows: string[][]): { entries: ImportEntry[]; warnings: string[] } {
  if (rows.length < 2) {
    throw new Error("Il file è vuoto: servono la riga delle intestazioni e almeno un'azienda");
  }
  const header = rows[0].map(norm);
  const col: Record<string, number> = {};
  for (const [key, names] of Object.entries(ALIASES)) col[key] = header.findIndex((h) => names.includes(h));
  if (col.name === -1) {
    throw new Error('Non trovo la colonna "Azienda". Scarica il modello per vedere le intestazioni.');
  }

  const entries: ImportEntry[] = [];
  const warnings: string[] = [];
  rows.slice(1).forEach((r, i) => {
    const get = (k: string) => (col[k] >= 0 ? (r[col[k]] ?? "").trim() : "");
    const name = get("name");
    if (!name) {
      warnings.push(`Riga ${i + 2}: manca il nome dell'azienda, saltata`);
      return;
    }
    const notes = get("notes").slice(0, 500);
    const hidden = ["si", "s", "x", "1", "true", "yes", "y"].includes(norm(get("hidden")));
    entries.push({
      area: (get("area") || "Importate").slice(0, 40),
      company: {
        key: newKey(),
        name: name.slice(0, 80),
        sector: get("sector").slice(0, 60),
        description: get("description").slice(0, 1500),
        roles: splitList(get("roles")).slice(0, 20),
        requirements: splitList(get("requirements")).slice(0, 20),
        ...(notes ? { notes } : {}),
        ...(hidden ? { hidden: true } : {}),
      },
    });
  });
  if (entries.length === 0) throw new Error("Nessuna azienda valida nel file");
  return { entries, warnings };
}

/** Applica l'importazione alla bozza: sostituisce tutte le aziende oppure le aggiunge in coda. */
export function applyImport(config: FairConfig, entries: ImportEntry[], mode: ImportMode): FairConfig {
  const areas: Area[] =
    mode === "replace" ? [] : config.areas.map((a) => ({ ...a, companies: [...a.companies] }));

  for (const entry of entries) {
    let area = areas.find((a) => norm(a.label) === norm(entry.area));
    if (!area) {
      if (areas.length >= MAX_AREAS) throw new Error(`Troppe aree: il massimo è ${MAX_AREAS}`);
      area = {
        id: newKey(),
        label: entry.area,
        tone: TONES[areas.length % TONES.length],
        direction: areas.length % 2 === 0 ? "up" : "down",
        companies: [],
      };
      areas.push(area);
    }
    area.companies.push(entry.company);
  }

  const total = areas.reduce((sum, a) => sum + a.companies.length, 0);
  if (total > MAX_COMPANIES) throw new Error(`Troppe aziende: il massimo è ${MAX_COMPANIES}`);
  return { ...config, areas };
}

/** Modello da scaricare: separatore ; e BOM, così Excel in italiano lo apre senza problemi. */
export const CSV_TEMPLATE =
  "\uFEFFArea;Azienda;Settore;Descrizione;Posizioni;Requisiti;Note;Assente\r\n" +
  'Area A;Nova Software;Informatica;"Software house per le PMI del territorio.";"Sviluppatore junior | Tirocinante QA";"Laurea in informatica | Base di JavaScript";Porta il curriculum;\r\n' +
  'Area A;Banca Alpina;Finanza;"Istituto di credito locale.";"Consulente junior";"Diploma in ragioneria";;\r\n' +
  'Area B;Logistica Adriatica;Trasporti;"Operatore logistico con magazzini automatizzati.";"Addetto magazzino";"Disponibilità sui turni";;si\r\n';
