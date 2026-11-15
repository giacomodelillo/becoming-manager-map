import type { Company } from "@/lib/expo/types";

function Block({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-2">
      <h2 className="expo-eyebrow">{title}</h2>
      <ul className="border-t border-white/15">
        {items.map((item) => (
          <li key={item} className="border-b border-white/15 py-3 text-base">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Angolo informativo dell'azienda. Nessuno stato: si può usare anche lato server. */
export function CompanyCard({ company }: { company: Company }) {
  return (
    <article className="space-y-6">
      <header className="flex items-start gap-4">
        <span
          aria-label={`Booth ${company.id}`}
          className="expo-serif flex size-14 shrink-0 items-center justify-center bg-[var(--gold)] text-3xl text-[var(--ink)]"
        >
          {company.id}
        </span>
        <div className="min-w-0 space-y-1">
          <p className="expo-eyebrow">{company.sector}</p>
          <h1 className="expo-serif text-3xl leading-tight">{company.name}</h1>
        </div>
      </header>
      <p className="text-base leading-relaxed text-[var(--paper)]/85">{company.description}</p>
      <Block title="Posizioni aperte" items={company.roles} />
      <Block title="Requisiti" items={company.requirements} />
      {company.notes && (
        <section className="space-y-1 border-l-4 border-[var(--magenta)] bg-white/5 p-4">
          <h2 className="expo-eyebrow">Note</h2>
          <p className="text-base">{company.notes}</p>
        </section>
      )}
    </article>
  );
}
