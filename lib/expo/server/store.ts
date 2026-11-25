import { promises as fs } from "node:fs";
import path from "node:path";
import { defaultConfig } from "../data/default";
import { parseFairConfig } from "../validate";
import type { FairConfig, HistoryItem } from "../types";

export type SavedFair = { version: number; config: FairConfig };

export class VersionConflictError extends Error {}

/** File dei dati. Cambialo con EXPO_DATA_FILE. Serve un processo Node con disco scrivibile. */
// Percorso fisso e statico: Turbopack è felice e non serve alcun commento ignore
const FILE = path.join(process.cwd(), "public", "expo.json");
const HISTORY_DIR = path.join(process.cwd(), "public", "expo-history");
const KEEP_VERSIONS = 10;

const g = globalThis as unknown as { __expoWriteLock?: Promise<unknown> };

const historyName = (version: number) =>
  `v${String(version).padStart(8, "0")}.json`;

/**
 * Legge sempre dal file: più rotte (o il reload in sviluppo) vedono gli stessi dati.
 * Se il file non esiste si usano i dati di partenza. Se esiste ma non è valido (es. un errore
 * scritto a mano in expo.json) si segnala l'errore nel terminale e la lettura fallisce:
 * i dispositivi tengono gli ultimi dati buoni invece di mostrare quelli di esempio.
 */
export async function readFair(): Promise<SavedFair> {
  let raw: string;
  try {
    raw = await fs.readFile(FILE, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      return { version: 1, config: defaultConfig };
    throw error;
  }
  try {
    const parsed = JSON.parse(raw) as { version?: number; config?: unknown };
    return {
      version: Number(parsed.version) || 1,
      config: parseFairConfig(parsed.config),
    };
  } catch (error) {
    console.error(
      `[expo] ${FILE} non è valido:`,
      error instanceof Error ? error.message : error,
    );
    throw error;
  }
}

async function saveHistory(saved: SavedFair) {
  await fs.mkdir(HISTORY_DIR, { recursive: true });
  const entry = {
    version: saved.version,
    savedAt: new Date().toISOString(),
    config: saved.config,
  };
  await fs.writeFile(
    path.join(HISTORY_DIR, historyName(saved.version)),
    JSON.stringify(entry),
    "utf8",
  );

  const files = (await fs.readdir(HISTORY_DIR))
    .filter((f) => /^v\d{8}\.json$/.test(f))
    .sort();
  for (const old of files.slice(0, Math.max(0, files.length - KEEP_VERSIONS))) {
    await fs.unlink(path.join(HISTORY_DIR, old)).catch(() => undefined);
  }
}

/** Scrive in modo atomico e in fila. Se `baseVersion` non coincide, qualcuno ha salvato prima. */
export function writeFair(
  config: FairConfig,
  baseVersion?: number,
): Promise<SavedFair> {
  const run = async (): Promise<SavedFair> => {
    const current = await readFair();
    if (baseVersion !== undefined && baseVersion !== current.version)
      throw new VersionConflictError();
    const next: SavedFair = { version: current.version + 1, config };
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    const tmp = `${FILE}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(next, null, 2), "utf8");
    await fs.rename(tmp, FILE);
    await saveHistory(next).catch(() => undefined); // la copia di sicurezza non blocca il salvataggio
    return next;
  };
  const previous = g.__expoWriteLock ?? Promise.resolve();
  const result = previous.catch(() => undefined).then(run);
  g.__expoWriteLock = result;
  return result;
}

/** Ultime versioni salvate, dalla più recente. */
export async function listHistory(): Promise<HistoryItem[]> {
  let files: string[] = [];
  try {
    files = (await fs.readdir(HISTORY_DIR))
      .filter((f) => /^v\d{8}\.json$/.test(f))
      .sort()
      .reverse();
  } catch {
    return [];
  }
  const items: HistoryItem[] = [];
  for (const file of files) {
    try {
      const raw = JSON.parse(
        await fs.readFile(path.join(HISTORY_DIR, file), "utf8"),
      ) as {
        version: number;
        savedAt: string;
        config: FairConfig;
      };
      const config = parseFairConfig(raw.config);
      items.push({
        version: raw.version,
        savedAt: raw.savedAt,
        areas: config.areas.length,
        companies: config.areas.reduce((n, a) => n + a.companies.length, 0),
      });
    } catch {
      /* file rovinato: si salta */
    }
  }
  return items;
}

export async function readHistory(version: number): Promise<SavedFair | null> {
  if (!Number.isInteger(version) || version < 1) return null;
  try {
    const raw = JSON.parse(
      await fs.readFile(path.join(HISTORY_DIR, historyName(version)), "utf8"),
    ) as {
      version: number;
      config: unknown;
    };
    return { version: raw.version, config: parseFairConfig(raw.config) };
  } catch {
    return null;
  }
}
