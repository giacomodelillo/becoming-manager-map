"use client";

import { useRef, useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { downloadFile } from "@/lib/expo/download";
import {
  applyImport,
  CSV_TEMPLATE,
  readSheetFile,
  rowsToEntries,
  type ImportEntry,
  type ImportMode,
} from "@/lib/expo/import";
import type { FairConfig } from "@/lib/expo/types";
import { Btn, Eyebrow } from "./fields";

type Pending = { fileName: string; entries: ImportEntry[]; warnings: string[] };

/** Importa le aziende da un file Excel o CSV nella bozza (poi si salva come sempre). */
export function ImportPanel({ config, onApply }: { config: FairConfig; onApply: (config: FairConfig) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { entries, warnings } = rowsToEntries(await readSheetFile(file));
      setPending({ fileName: file.name, entries, warnings });
    } catch (e) {
      setPending(null);
      setError(e instanceof Error ? e.message : "Impossibile leggere il file");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  function apply(mode: ImportMode) {
    if (!pending) return;
    try {
      onApply(applyImport(config, pending.entries, mode));
      setPending(null);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Importazione non riuscita");
    }
  }

  const areaCount = pending ? new Set(pending.entries.map((e) => e.area.toLowerCase())).size : 0;

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <Eyebrow>Importa da Excel o CSV</Eyebrow>
        <p className="text-sm text-white/65">
          Una riga per azienda. Colonne: Area, Azienda, Settore, Descrizione, Posizioni, Requisiti, Note, Assente.
          Più voci nella stessa cella si separano con |
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Btn variant="ghost" disabled={busy} onClick={() => input.current?.click()}>
          <FileSpreadsheet className="size-4" strokeWidth={1.5} /> {busy ? "Leggo il file…" : "Scegli il file"}
        </Btn>
        <Btn
          variant="ghost"
          onClick={() => downloadFile("modello-aziende.csv", CSV_TEMPLATE, "text/csv;charset=utf-8")}
        >
          Scarica il modello
        </Btn>
      </div>
      <input
        ref={input}
        type="file"
        accept=".csv,.txt,.xlsx,.xls"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      {pending && (
        <div className="space-y-3 border border-[var(--gold)] p-4">
          <p className="text-sm font-semibold">
            {pending.fileName}: {pending.entries.length} aziende in {areaCount} aree
          </p>
          {pending.warnings.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-xs text-white/65">
              {pending.warnings.slice(0, 5).map((w) => (
                <li key={w}>{w}</li>
              ))}
              {pending.warnings.length > 5 && <li>…e altri {pending.warnings.length - 5} avvisi</li>}
            </ul>
          )}
          <div className="flex flex-wrap gap-2">
            <Btn onClick={() => apply("append")}>Aggiungi in coda</Btn>
            <Btn variant="danger" onClick={() => apply("replace")}>
              Sostituisci tutte le aziende
            </Btn>
            <Btn variant="ghost" onClick={() => setPending(null)}>
              Annulla
            </Btn>
          </div>
          <p className="text-xs text-white/50">Le modifiche vanno nella bozza: si possono annullare e poi salvare.</p>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm font-semibold text-[#ff7aa6]">
          {error}
        </p>
      )}
    </section>
  );
}
