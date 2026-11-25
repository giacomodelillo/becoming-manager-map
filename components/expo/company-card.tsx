import { Fragment } from "react";
import { mediaUrl } from "@/lib/expo/media";
import type { Company } from "@/lib/expo/types";
import { CompanyLogo } from "./company-logo";

// Riconosce URL con protocollo, domini che iniziano con "www." o email
const LINK_REGEX =
  /((?:https?:\/\/|www\.)[^\s<]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

const TRAILING_PUNCTUATION_REGEX = /[),.;:!?]+$/;

function normalizeHref(rawMatch: string): {
  href: string;
  label: string;
  trailing: string;
} {
  const match = rawMatch.match(TRAILING_PUNCTUATION_REGEX);
  const trailing = match ? match[0] : "";
  const label = trailing ? rawMatch.slice(0, -trailing.length) : rawMatch;

  if (
    label.includes("@") &&
    !label.startsWith("http") &&
    !label.startsWith("www.")
  ) {
    return { href: `mailto:${label}`, label, trailing };
  }

  const href = label.startsWith("www.") ? `https://${label}` : label;
  return { href, label, trailing };
}

function LinkifiedText({ text }: { text: string }) {
  const parts = text.split(LINK_REGEX);

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;

        // Nei gruppi di cattura di .split(), le corrispondenze cadono su indici dispari
        if (index % 2 === 1) {
          const { href, label, trailing } = normalizeHref(part);
          const isExternal = href.startsWith("http");

          return (
            <Fragment key={`${index}-${label}`}>
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="underline decoration-[var(--gold)] underline-offset-4 transition hover:text-[var(--gold)]"
              >
                {label}
              </a>
              {trailing}
            </Fragment>
          );
        }

        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
}

function Text({ title, text }: { title: string; text?: string }) {
  if (!text) return null;
  return (
    <section className="space-y-2">
      <h2 className="expo-eyebrow">{title}</h2>
      <p className="whitespace-pre-line break-words text-base leading-relaxed text-[var(--paper)]/90">
        <LinkifiedText text={text} />
      </p>
    </section>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-2">
      <h2 className="expo-eyebrow">{title}</h2>
      <ul className="border-t border-white/15">
        {items.map((item, idx) => (
          <li
            key={`${idx}-${item}`}
            className="whitespace-pre-line break-words border-b border-white/15 py-3 text-base"
          >
            <LinkifiedText text={item} />
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
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Su mobile riga superiore con badge + logo; su desktop usa contents per mantenere il flex originale */}
        <div className="flex items-center justify-between gap-4 sm:contents">
          <span
            aria-label={`Booth ${company.id}`}
            className="expo-serif flex size-12 shrink-0 items-center justify-center bg-[var(--gold)] text-2xl text-[var(--ink)] sm:order-1 sm:size-14 sm:text-3xl"
          >
            {company.id}
          </span>

          <CompanyLogo
            company={company}
            className="h-11 max-w-28 shrink-0 sm:order-3 sm:h-14"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-1 sm:order-2">
          {company.sector && (
            <p className="expo-eyebrow break-words">{company.sector}</p>
          )}
          <h1 className="expo-serif text-2xl leading-tight sm:text-3xl">
            {company.name}
          </h1>
        </div>
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
          <p className="whitespace-pre-line break-words text-base">
            <LinkifiedText text={company.notes} />
          </p>
        </section>
      )}
    </article>
  );
}
