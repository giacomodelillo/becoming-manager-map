"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { adminStore, isDirty, useAdminState } from "@/lib/expo/admin-store";
import { saveConfig } from "@/lib/expo/admin-api";
import { addArea, countCompanies, MAX_AREAS, MAX_COMPANIES } from "@/lib/expo/config-ops";
import { applyRemote } from "@/lib/expo/data-store";
import type { FairConfig } from "@/lib/expo/types";
import { AreaBlock } from "./area-block";
import { Btn, Eyebrow, TextField } from "./fields";

type Props = {
  onLogout: () => void;
  /** sessione scaduta: torna al PIN senza perdere la bozza */
  onExpired: () => void;
  /** i dati sono cambiati sul server: ricarica l'editor */
  onReload: () => void;
};

type Message = { ok: boolean; text: string; conflict?: boolean };

/** Tutte le impostazioni della piattaforma. La bozza vive nello store: l'anteprima nello stage la legge da lì. */
export function AdminEditor({ onLogout, onExpired, onReload }: Props) {
  const admin = useAdminState();
  const { draft, version, openKey } = admin;
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const dirty = isDirty(admin);
  const total = draft ? countCompanies(draft) : 0;
  const starts = useMemo(() => {
    let n = 1;
    return (draft?.areas ?? []).map((a) => {
      const start = n;
      n += a.companies.length;
      return start;
    });
  }, [draft]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!draft) return null;

  const change = (next: FairConfig) => {
    adminStore.setDraft(next);
    setMessage(null);
  };

  async function save() {
    if (!draft) return;
    setBusy(true);
    const result = await saveConfig(draft, version);
    setBusy(false);
    if (result.ok) {
      adminStore.markSaved(result.config, result.version);
      applyRemote(result.version, result.config);
      setMessage({ ok: true, text: "Salvato. La mappa pubblica si aggiorna entro pochi secondi." });
    } else if (result.status === 401) {
      onExpired();
    } else {
      setMessage({ ok: false, text: result.message, conflict: result.status === 409 });
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <Eyebrow>Area riservata</Eyebrow>
          <h1 className="expo-serif text-4xl leading-tight">Gestione della mappa</h1>
          <p className="text-sm text-white/65">
            {total} aziende · {draft.areas.length} aree. I numeri dei booth seguono l&apos;ordine qui sotto.
            L&apos;anteprima si aggiorna mentre scrivi.
          </p>
        </div>
        <Btn variant="ghost" onClick={onLogout}>
          Esci
        </Btn>
      </header>

      <section className="space-y-4">
        <Eyebrow>Etichette</Eyebrow>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Etichetta timer"
            value={draft.timerLabel}
            maxLength={20}
            onChange={(timerLabel) => change({ ...draft, timerLabel })}
          />
          <TextField
            label="Etichetta ingresso"
            value={draft.entranceLabel}
            maxLength={20}
            onChange={(entranceLabel) => change({ ...draft, entranceLabel })}
          />
        </div>
      </section>

      <div className="space-y-6">
        {draft.areas.map((area, i) => (
          <AreaBlock
            key={area.id}
            config={draft}
            area={area}
            index={i}
            start={starts[i]}
            openKey={openKey}
            onOpen={(key) => adminStore.setOpenKey(key)}
            onChange={change}
          />
        ))}
        <Btn
          variant="ghost"
          disabled={draft.areas.length >= MAX_AREAS || total >= MAX_COMPANIES}
          onClick={() => change(addArea(draft))}
        >
          <Plus className="size-4" /> Aggiungi area
        </Btn>
      </div>

      <div className="sticky bottom-0 -mx-5 flex flex-wrap items-center gap-3 border-t border-white/20 bg-[var(--ink)] px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <p
          role="status"
          className={`min-w-0 flex-1 text-sm font-semibold ${
            message ? (message.ok ? "text-[var(--paper)]" : "text-[#ff7aa6]") : "text-white/55"
          }`}
        >
          {message?.text ?? (dirty ? "Modifiche non salvate" : "Nessuna modifica")}
        </p>
        {message?.conflict && (
          <Btn variant="ghost" onClick={onReload}>
            Ricarica i dati
          </Btn>
        )}
        <Btn
          variant="ghost"
          disabled={!dirty || busy}
          onClick={() => {
            adminStore.discard();
            setMessage(null);
          }}
        >
          Annulla modifiche
        </Btn>
        <Btn disabled={!dirty || busy} onClick={() => void save()}>
          {busy ? "Salvo…" : "Salva"}
        </Btn>
      </div>
    </div>
  );
}
