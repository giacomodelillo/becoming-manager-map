import { promises as fs } from "node:fs";
import path from "node:path";
import { defaultConfig } from "../data/default";
import { parseFairConfig } from "../validate";
import type { FairConfig } from "../types";

export type SavedFair = { version: number; config: FairConfig };

export class VersionConflictError extends Error {}

/** File dei dati. Cambialo con EXPO_DATA_FILE. Serve un processo Node con disco scrivibile. */
const FILE = process.env.EXPO_DATA_FILE ?? path.join(process.cwd(), "data", "expo.json");

const g = globalThis as unknown as { __expoWriteLock?: Promise<unknown> };

/** Legge sempre dal file: più rotte (o il reload in sviluppo) vedono gli stessi dati. */
export async function readFair(): Promise<SavedFair> {
  try {
    const raw = JSON.parse(await fs.readFile(FILE, "utf8")) as { version?: number; config?: unknown };
    return { version: Number(raw.version) || 1, config: parseFairConfig(raw.config) };
  } catch {
    return { version: 1, config: defaultConfig };
  }
}

/** Scrive in modo atomico e in fila. Se `baseVersion` non coincide, qualcuno ha salvato prima. */
export function writeFair(config: FairConfig, baseVersion?: number): Promise<SavedFair> {
  const run = async (): Promise<SavedFair> => {
    const current = await readFair();
    if (baseVersion !== undefined && baseVersion !== current.version) throw new VersionConflictError();
    const next: SavedFair = { version: current.version + 1, config };
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    const tmp = `${FILE}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(next, null, 2), "utf8");
    await fs.rename(tmp, FILE);
    return next;
  };
  const previous = g.__expoWriteLock ?? Promise.resolve();
  const result = previous.catch(() => undefined).then(run);
  g.__expoWriteLock = result;
  return result;
}
