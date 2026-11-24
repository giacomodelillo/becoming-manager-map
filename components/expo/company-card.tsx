import { mediaUrl } from "@/lib/expo/media";
import type { Company } from "@/lib/expo/types";
import { CompanyLogo } from "./company-logo";

function Text({ title, text }: { title: string; text?: string }) {
  if (!text) return null;
  return (
    <section className="space-y-2">
      <h2 className="expo-eyebrow">{title}</h2>
      <p className="whitespace-pre-line text-base leading-relaxed text-[var(--paper)]/90">{text}</p>
    </section>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-2">
      <h2 className="expo-eyebrow">{title}</h2>
      <ul className="border-t border-white/15">
        {items.map((item) => (
          <li key={item} className="whitespace-pre-line border-b border-white/15 py-3 text-base">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Scheda azienda con le informazioni del modulo Must & Want. Nessuno stato: va bene anche lato server. */
export function CompanyCard({ company }: { company: Company }) {
  return (
    <article className="space-y-7">
      {company.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaUrl(company.image)}
          alt=""
          loading="lazy"
          className="aspect-video w-full border border-white/15 object-cover"
        />
      )}
      <header className="flex items-start gap-4">
        <span
          aria-label={`Booth ${company.id}`}
          className="expo-serif flex size-14 shrink-0 items-center justify-center bg-[var(--gold)] text-3xl text-[var(--ink)]"
        >
          {company.id}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          {company.sector && <p className="expo-eyebrow">{company.sector}</p>}
          <h1 className="expo-serif text-3xl leading-tight">{company.name}</h1>
        </div>
        <CompanyLogo company={company} className="h-14 max-w-28 shrink-0" />
      </header>
      <Text title="Profilo" text={company.description} />
      <Text title="Valori" text={company.values} />
      <Text title="Opportunità" text={company.opportunities} />
      <List title="Requisiti" items={company.requirements} />
      <List title="Posizioni aperte" items={company.roles} />
      <Text title="Contatti" text={company.contacts} />
      {company.notes && (
        <section className="space-y-1 border-l-4 border-[var(--magenta)] bg-white/5 p-4">
          <h2 className="expo-eyebrow">Note</h2>
          <p className="whitespace-pre-line text-base">{company.notes}</p>
        </section>
      )}
    </article>
  );
}
