"use client";

import type { HistoryMode } from "@/lib/expo/admin-store";
import type { CompanyDraft } from "@/lib/expo/types";
import { ImageField } from "./image-field";
import { TextAreaField, TextField, Toggle } from "./fields";

type Patch = Partial<Omit<CompanyDraft, "key">>;

/** Campi della scheda azienda. Gli elenchi si scrivono una voce per riga. */
export function CompanyForm({
  company,
  onChange,
}: {
  company: CompanyDraft;
  onChange: (patch: Patch, mode?: HistoryMode) => void;
}) {
  return (
    <div className="space-y-4 border-t border-white/20 bg-black/20 p-4">
      <Toggle
        label="Azienda assente"
        hint="Il booth resta sulla mappa con il suo numero, ma l'azienda esce da percorsi ed elenco."
        checked={company.hidden === true}
        onChange={(hidden) => onChange({ hidden: hidden || undefined }, "push")}
      />
      <Toggle
        label="Postazione BUFFER"
        hint="Card rossa, non selezionabile: i percorsi la saltano."
        checked={company.buffer === true}
        onChange={(buffer) => onChange({ buffer: buffer || undefined }, "push")}
      />
      <TextField
        label="Nome azienda"
        value={company.name}
        maxLength={120}
        onChange={(name) => onChange({ name }, "coalesce")}
      />
      <TextField
        label="Settore"
        value={company.sector}
        maxLength={120}
        onChange={(sector) => onChange({ sector }, "coalesce")}
      />
      <TextAreaField
        label="Profilo"
        value={company.description}
        maxLength={10000}
        rows={8}
        onChange={(description) => onChange({ description }, "coalesce")}
      />
      <TextAreaField
        label="Valori"
        value={company.values ?? ""}
        maxLength={10000}
        rows={4}
        onChange={(values) => onChange({ values }, "coalesce")}
      />
      <TextAreaField
        label="Opportunità"
        value={company.opportunities ?? ""}
        maxLength={10000}
        rows={4}
        onChange={(opportunities) => onChange({ opportunities }, "coalesce")}
      />
      <TextAreaField
        label="Posizioni aperte"
        hint="Una per riga"
        value={company.roles.join("\n")}
        onChange={(v) => onChange({ roles: v.split("\n") }, "coalesce")}
      />
      <TextAreaField
        label="Requisiti"
        hint="Un paragrafo per riga"
        value={company.requirements.join("\n")}
        onChange={(v) => onChange({ requirements: v.split("\n") }, "coalesce")}
      />
      <TextAreaField
        label="Note"
        value={company.notes ?? ""}
        maxLength={3000}
        rows={3}
        onChange={(notes) => onChange({ notes }, "coalesce")}
      />
      <TextAreaField
        label="Contatti"
        value={company.contacts ?? ""}
        maxLength={2000}
        rows={2}
        onChange={(contacts) => onChange({ contacts }, "coalesce")}
      />
      <ImageField
        label="Logo per sfondo scuro"
        hint="Nel pannello viola si mostra senza riquadro. Ha la precedenza"
        value={company.logoDark}
        maxSide={512}
        onChange={(logoDark) => onChange({ logoDark }, "push")}
      />
      <ImageField
        label="Logo per sfondo chiaro"
        hint="Si mostra in un riquadro bianco. PNG, JPG, WebP o SVG"
        value={company.logo}
        maxSide={512}
        onChange={(logo) => onChange({ logo }, "push")}
      />
      <ImageField
        label="Immagine di copertina"
        hint="Formato orizzontale 16:9"
        value={company.image}
        maxSide={1400}
        onChange={(image) => onChange({ image }, "push")}
      />
    </div>
  );
}
