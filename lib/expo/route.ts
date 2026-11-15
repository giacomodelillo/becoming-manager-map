import type { Company, FairLayout } from "./types";

/**
 * Percorso circolare: parte da `start`, sale di 1 (modulo N) e finisce
 * all'azienda subito prima di `start`. Esempio 1..5, start 3 → [3, 4, 5, 1, 2].
 * Ritorna null se `start` non è un booth esistente.
 */
export function buildStudentRoute(
  boothIds: readonly number[],
  start: number,
): number[] | null {
  const sorted = [...boothIds].sort((a, b) => a - b);
  const startIndex = sorted.indexOf(start);
  if (startIndex === -1) return null;
  return sorted.map((_, i) => sorted[(startIndex + i) % sorted.length]);
}

/** Vero se nel percorso `to` segue direttamente `from`. */
export function routeHasEdge(
  route: readonly number[] | null,
  from: number,
  to: number,
): boolean {
  if (!route) return false;
  const i = route.indexOf(from);
  return i !== -1 && route[i + 1] === to;
}

/** Controlla i dati: lancia un errore chiaro se qualcosa non torna. */
export function assertFairData(
  companies: readonly Company[],
  layout: FairLayout,
): void {
  const ids = companies.map((c) => c.id).sort((a, b) => a - b);
  ids.forEach((id, i) => {
    if (!Number.isInteger(id) || id !== i + 1) {
      throw new Error(
        `Booth non validi: servono numeri 1..${ids.length} senza buchi né doppioni (trovato ${id} in posizione ${i + 1})`,
      );
    }
  });

  const seen = new Set<number>();
  for (const col of layout.columns) {
    if (col.booths.length === 0) {
      throw new Error(`La colonna "${col.id}" è vuota`);
    }
    for (const id of col.booths) {
      if (!ids.includes(id)) {
        throw new Error(`La colonna "${col.id}" usa il booth ${id}, che non esiste`);
      }
      if (seen.has(id)) {
        throw new Error(`Il booth ${id} compare più di una volta nel layout`);
      }
      seen.add(id);
    }
  }
  const missing = ids.filter((id) => !seen.has(id));
  if (missing.length > 0) {
    throw new Error(`Booth non presenti nel layout: ${missing.join(", ")}`);
  }
}
