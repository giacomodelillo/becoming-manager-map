"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { listHistory, loadHistory } from "@/lib/expo/admin-api";
import { downloadFile } from "@/lib/expo/download";
import { parseFairConfig } from "@/lib/expo/validate";
import type { FairConfig, HistoryItem } from "@/lib/expo/types";
import { Btn, Eyebrow } from "./fields";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Copie di sicurezza: ultime 10 versioni salvate sul server, più esportazione e importazione di un file. */
export function VersionsPanel({
  config,
  currentVersion,
  onLoad,
}: {
  config: FairConfig;
  currentVersion: number;
  onLoad: (config: FairConfig) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const [busy, setBusy] = useState<number | "list" | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function showVersions() {
    setBusy("list");
    setMessage(null);
    try {
      setItems(await listHistory());
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Impossibile leggere le versioni" });
    } finally {
      setBusy(null);
    }
  }

  async function restore(version: number) {
    setBusy(version);
    setMessage(null);
    try {
      onLoad(parseFairConfig(await loadHistory(version)));
      setMessage({ ok: true, text: `Versione ${version} caricata nella bozza. Premi Salva per applicarla.` });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Versione non valida" });
    } finally {
      setBusy(null);
    }
  }

  function exportFile() {
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
    downloadFile(
      `mappa-${stamp}.json`,
      JSON.stringify({ app: "becoming-manager-expo", exportedAt: new Date().toISOString(), config }, null, 2),
      "application/json",
    );
  }

  async function importFile(file: File | undefined) {
    if (!file) return;
    setMessage(null);
    try {
      const raw = JSON.parse(await file.text()) as { config?: unknown };
      onLoad(parseFairConfig(raw.config ?? raw));
      setMessage({ ok: true, text: "File caricato nella bozza. Premi Salva per applicarlo." });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "File non valido" });
    } finally {
      if (input.current) input.current.value = "";
    }
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <Eyebrow>Copie e versioni</Eyebrow>
        <p className="text-sm text-white/65">
          Il server tiene le ultime 10 versioni salvate. Puoi anche scaricare una copia o caricarne una.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Btn variant="ghost" onClick={exportFile}>
          <Download className="size-4" strokeWidth={1.5} /> Scarica copia
        </Btn>
        <Btn variant="ghost" onClick={() => input.current?.click()}>
          <Upload className="size-4" strokeWidth={1.5} /> Carica copia
        </Btn>
        <Btn variant="ghost" disabled={busy === "list"} onClick={() => void showVersions()}>
          {busy === "list" ? "Leggo…" : "Mostra versioni salvate"}
        </Btn>
      </div>
      <input
        ref={input}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => void importFile(e.target.files?.[0])}
      />

      {items && (
        <ul className="border-t border-white/15">
          {items.length === 0 && <li className="py-3 text-sm text-white/60">Nessuna versione salvata finora.</li>}
          {items.map((item) => (
            <li key={item.version} className="flex items-center gap-3 border-b border-white/15 py-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  Versione {item.version}
                  {item.version === currentVersion && (
                    <span className="ml-2 bg-[var(--gold)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--ink)]">
                      Attuale
                    </span>
                  )}
                </p>
                <p className="text-xs text-white/55">
                  {formatDate(item.savedAt)} · {item.companies} aziende · {item.areas} aree
                </p>
              </div>
              <Btn variant="ghost" disabled={busy === item.version} onClick={() => void restore(item.version)}>
                Carica nella bozza
              </Btn>
            </li>
          ))}
        </ul>
      )}
      {message && (
        <p role="status" className={`text-sm font-semibold ${message.ok ? "" : "text-[#ff7aa6]"}`}>
          {message.text}
        </p>
      )}
    </section>
  );
}
