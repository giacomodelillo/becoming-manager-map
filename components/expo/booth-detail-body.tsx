"use client";

import { CompanyCard } from "@/components/expo/company-card";
import { useFairData } from "@/lib/expo/data-store";

/** Scheda dell'azienda: i dati arrivano dal server, quindi si legge dallo store. */
export function BoothDetailBody({ boothId }: { boothId: number }) {
  const { view, status } = useFairData();
  const company = view?.byId.get(boothId);

  if (!view) {
    return (
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
        {status === "error" ? "Dati non disponibili. Riprovo tra poco…" : "Caricamento…"}
      </p>
    );
  }
  if (!company) {
    return <p className="text-base">Questa azienda non esiste più. Torna all&apos;elenco e scegline un&apos;altra.</p>;
  }
  return <CompanyCard company={company} />;
}
