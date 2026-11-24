"use client";

import type { HistoryMode } from "@/lib/expo/admin-store";
import { MAP_SIZES, PANEL_SIZES } from "@/lib/expo/display";
import type { FairConfig } from "@/lib/expo/types";
import { ChoiceGroup, Eyebrow, TextField } from "./fields";

/** Grandezze predefinite per mappa e pannello, più l'indirizzo pubblico per il QR. */
export function DisplaySettingsPanel({
  config,
  onChange,
}: {
  config: FairConfig;
  onChange: (config: FairConfig, mode?: HistoryMode) => void;
}) {
  const { display } = config;
  const set = (patch: Partial<typeof display>, mode?: HistoryMode) =>
    onChange({ ...config, display: { ...display, ...patch } }, mode);

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <Eyebrow>Dimensioni e schermo</Eyebrow>
        <p className="text-sm text-white/65">
          Le scelte valgono per tutti gli schermi dopo il salvataggio (entro 15 secondi). L&apos;anteprima le
          mostra subito.
        </p>
      </div>
      <ChoiceGroup
        label="Mappa · grandezza dei testi"
        value={display.mapSize}
        options={MAP_SIZES}
        onChange={(mapSize) => set({ mapSize })}
      />
      <ChoiceGroup
        label="Pannello dettaglio · grandezza dei testi"
        value={display.panelSize}
        options={PANEL_SIZES}
        onChange={(panelSize) => set({ panelSize })}
      />
      <TextField
        label="Indirizzo pubblico per il QR"
        placeholder="http://192.168.1.20:3000"
        value={display.publicUrl}
        maxLength={200}
        onChange={(publicUrl) => set({ publicUrl }, "coalesce")}
      />
      <p className="-mt-3 text-xs text-white/45">
        L&apos;indirizzo con cui i telefoni raggiungono questo server. Se lo lasci vuoto si usa quello della pagina.
      </p>
    </section>
  );
}
