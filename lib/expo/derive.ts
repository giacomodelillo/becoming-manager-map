import { assertFairData } from "./route";
import type { Company, FairColumn, FairConfig, FairView } from "./types";

/** Dalla configurazione (aree con aziende) ai booth numerati 1..N e al layout della mappa. */
export function deriveFairView(config: FairConfig): FairView {
  let n = 0;
  const companies: Company[] = [];

  const columns: FairColumn[] = config.areas.map((area) => {
    const booths = area.companies.map((draft) => {
      const { key, ...rest } = draft;
      void key;
      n += 1;
      companies.push({ ...rest, id: n });
      return n;
    });
    return { id: area.id, direction: area.direction, booths, label: area.label, tone: area.tone };
  });

  const layout = {
    timerLabel: config.timerLabel,
    entranceLabel: config.entranceLabel,
    columns,
    ...(config.rtl ? { rtl: true } : {}),
  };
  assertFairData(companies, layout);

  const present = companies.filter((c) => !c.hidden).map((c) => c.id);
  if (present.length === 0) throw new Error("Serve almeno un'azienda presente");

  return {
    companies,
    layout,
    boothIds: present,
    byId: new Map(companies.map((c) => [c.id, c])),
    display: config.display,
  };
}

/** Cambia solo quando cambia la forma della mappa (aree, verso, numero di booth), non i testi. */
export function layoutSignature(view: FairView | null): string {
  if (!view) return "empty";
  return view.layout.columns.map((c) => `${c.id}:${c.direction}:${c.booths.length}`).join("|");
}
