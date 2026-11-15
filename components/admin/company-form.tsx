"use client";

import type { CompanyDraft } from "@/lib/expo/types";
import { TextAreaField, TextField } from "./fields";

type Patch = Partial<Omit<CompanyDraft, "key">>;

/** Campi mostrati nella scheda azienda. Gli elenchi si scrivono una voce per riga. */
export function CompanyForm({ company, onChange }: { company: CompanyDraft; onChange: (patch: Patch) => void }) {
  return (
    <div className="space-y-4 border-t border-white/20 bg-black/20 p-4">
      <TextField label="Nome azienda" value={company.name} maxLength={80} onChange={(name) => onChange({ name })} />
      <TextField label="Settore" value={company.sector} maxLength={60} onChange={(sector) => onChange({ sector })} />
      <TextAreaField
        label="Descrizione"
        value={company.description}
        maxLength={1500}
        rows={5}
        onChange={(description) => onChange({ description })}
      />
      <TextAreaField
        label="Posizioni aperte"
        hint="Una per riga"
        value={company.roles.join("\n")}
        onChange={(v) => onChange({ roles: v.split("\n") })}
      />
      <TextAreaField
        label="Requisiti"
        hint="Uno per riga"
        value={company.requirements.join("\n")}
        onChange={(v) => onChange({ requirements: v.split("\n") })}
      />
      <TextAreaField
        label="Note"
        value={company.notes ?? ""}
        maxLength={500}
        rows={3}
        onChange={(notes) => onChange({ notes })}
      />
    </div>
  );
}
