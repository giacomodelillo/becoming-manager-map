import { assertFairData } from "./route";
import type { Company, FairColumn, FairConfig, FairView } from "./types";

/** Dalla configurazione (aree con aziende) ai booth numerati 1..N e al layout della mappa. */
export function deriveFairView(config: FairConfig): FairView {
  let n_ = 0;
  const companies: Company[] = [];

  const n = config.areas.length;
  // colonne sulla mappa: valgono solo se tutte indicate, diverse tra loro e dentro il numero di aree
  const slotsOk =
    config.areas.every((a) => Number.isInteger(a.slot) && (a.slot as number) >= 0 && (a.slot as number) < n) &&
    new Set(config.areas.map((a) => a.slot)).size === n;

  const columns: FairColumn[] = config.areas.map((area, i) => {
    const booths = area.companies.map((draft) => {
      const { key, ...rest } = draft;
      void key;
      n_ += 1;
      companies.push({ ...rest, id: n_ });
      return n_;
    });
    return {
      id: area.id,
      direction: area.direction,
      arrows: area.arrows ?? area.direction,
      slot: slotsOk ? (area.slot as number) : i,
      booths,
      label: area.label,
      tone: area.tone,
    };
  });

  const ids = columns.map((c) => c.id);
  const wanted = (config.flow ?? []).filter((id, i, all) => ids.includes(id) && all.indexOf(id) === i);
  const flow = [...wanted, ...ids.filter((id) => !wanted.includes(id))];
  const first = columns.find((c) => c.id === flow[0]);
  const entranceSlot =
    Number.isInteger(config.entranceSlot) && (config.entranceSlot as number) >= 0 && (config.entranceSlot as number) < n
      ? (config.entranceSlot as number)
      : (first?.slot ?? 0);

  const layout = {
    timerLabel: config.timerLabel,
    entranceLabel: config.entranceLabel,
    columns,
    flow,
    entranceSlot,
    ...(config.rtl ? { rtl: true } : {}),
  };
  assertFairData(companies, layout);

  const present = companies.filter((c) => !c.hidden && !c.buffer).map((c) => c.id);
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
  return view.layout.columns.map((c) => `${c.id}:${c.direction}:${c.arrows}:${c.slot}:${c.booths.length}`).join("|");
}
