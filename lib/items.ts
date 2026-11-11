export type Item = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  tags: string[];
  specs: { label: string; value: string }[];
};

export const ITEMS: Item[] = [
  {
    slug: "alpha",
    title: "Alpha",
    summary: "Primo elemento di esempio.",
    description:
      "Descrizione estesa di Alpha. Questo testo appare nel pannello di dettaglio quando l'elemento è selezionato.",
    tags: ["react", "typescript"],
    specs: [
      { label: "Stato", value: "Attivo" },
      { label: "Versione", value: "1.0.0" },
    ],
  },
  {
    slug: "beta",
    title: "Beta",
    summary: "Secondo elemento di esempio.",
    description: "Descrizione estesa di Beta.",
    tags: ["nextjs", "tailwind"],
    specs: [
      { label: "Stato", value: "In sviluppo" },
      { label: "Versione", value: "0.4.2" },
    ],
  },
  {
    slug: "gamma",
    title: "Gamma",
    summary: "Terzo elemento di esempio.",
    description: "Descrizione estesa di Gamma.",
    tags: ["shadcn"],
    specs: [
      { label: "Stato", value: "Bozza" },
      { label: "Versione", value: "0.1.0" },
    ],
  },
  {
    slug: "delta",
    title: "Delta",
    summary: "Quarto elemento di esempio.",
    description: "Descrizione estesa di Delta.",
    tags: ["motion"],
    specs: [
      { label: "Stato", value: "Archiviato" },
      { label: "Versione", value: "2.3.0" },
    ],
  },
];

export function getItem(slug: string) {
  return ITEMS.find((item) => item.slug === slug);
}
