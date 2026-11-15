"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { companies } from "@/lib/expo/data";
import { useExpoRoute } from "./use-expo-route";

/** Tutte le aziende in ordine di booth: tocca per aprire la scheda. */
export function CompanyList() {
  const { openBooth } = useExpoRoute();
  const sorted = [...companies].sort((a, b) => a.id - b.id);

  return (
    <section aria-labelledby="companies-title" className="space-y-3">
      <div className="space-y-1">
        <p className="expo-eyebrow">Aziende</p>
        <h2 id="companies-title" className="expo-serif text-2xl">
          Incontra le aziende
        </h2>
      </div>
      <ul className="space-y-2">
        {sorted.map((c) => (
          <li key={c.id}>
            <Link
              href={`/expo/${c.id}`}
              onClick={() => openBooth(c.id)}
              className="flex min-h-14 items-center gap-3 border border-white/20 bg-white/5 px-3 py-2 transition active:translate-y-0.5 active:bg-white/15"
            >
              <span className="expo-serif flex size-10 shrink-0 items-center justify-center bg-[var(--paper)] text-xl text-[var(--ink)]">
                {c.id}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{c.name}</span>
                <span className="block truncate text-xs text-white/60">{c.sector}</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-white/50" strokeWidth={1.5} aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
