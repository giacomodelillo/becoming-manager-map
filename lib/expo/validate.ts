import { newKey } from "./config-ops";
import { deriveFairView } from "./derive";
import type { Area, CompanyDraft, FairConfig, FlowDirection, ZoneTone } from "./types";

const TONES: ZoneTone[] = ["gold", "magenta", "gray"];
const DIRECTIONS: FlowDirection[] = ["up", "down"];

function text(value: unknown, max: number, field: string, required = false): string {
  if (typeof value !== "string") {
    if (required) throw new Error(`${field}: serve un testo`);
    return "";
  }
  const t = value.trim();
  if (required && !t) throw new Error(`${field}: non può essere vuoto`);
  if (t.length > max) throw new Error(`${field}: massimo ${max} caratteri`);
  return t;
}

function lines(value: unknown, maxItems: number, maxLen: number, field: string): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new Error(`${field}: serve un elenco`);
  const items = value.map((v) => text(v, maxLen, field)).filter(Boolean);
  if (items.length > maxItems) throw new Error(`${field}: massimo ${maxItems} voci`);
  return items;
}

function record(value: unknown, field: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${field}: formato non valido`);
  }
  return value as Record<string, unknown>;
}

/** Controlla e pulisce la configurazione ricevuta dal client. Lancia un Error con messaggio in italiano. */
export function parseFairConfig(input: unknown): FairConfig {
  const root = record(input, "Configurazione");
  if (!Array.isArray(root.areas) || root.areas.length < 1 || root.areas.length > 8) {
    throw new Error("Servono da 1 a 8 aree");
  }

  const usedKeys = new Set<string>();
  const usedAreaIds = new Set<string>();
  let total = 0;

  const areas: Area[] = root.areas.map((rawArea, ai) => {
    const a = record(rawArea, `Area ${ai + 1}`);
    const label = text(a.label, 40, `Area ${ai + 1}, nome`, true);
    const tone = TONES.includes(a.tone as ZoneTone) ? (a.tone as ZoneTone) : TONES[ai % TONES.length];
    const direction = DIRECTIONS.includes(a.direction as FlowDirection)
      ? (a.direction as FlowDirection)
      : "up";
    let id = typeof a.id === "string" && a.id.trim() ? a.id.trim().slice(0, 40) : newKey();
    if (usedAreaIds.has(id)) id = newKey();
    usedAreaIds.add(id);

    if (!Array.isArray(a.companies) || a.companies.length < 1) {
      throw new Error(`"${label}": serve almeno un'azienda`);
    }
    const companies: CompanyDraft[] = a.companies.map((rawCompany, ci) => {
      const c = record(rawCompany, `${label}, azienda ${ci + 1}`);
      const name = text(c.name, 80, `${label}, azienda ${ci + 1}, nome`, true);
      let key = typeof c.key === "string" && c.key.trim() ? c.key.trim().slice(0, 40) : newKey();
      if (usedKeys.has(key)) key = newKey();
      usedKeys.add(key);
      const notes = text(c.notes, 500, `${name}, note`);
      total += 1;
      return {
        key,
        name,
        sector: text(c.sector, 60, `${name}, settore`),
        description: text(c.description, 1500, `${name}, descrizione`),
        roles: lines(c.roles, 20, 120, `${name}, posizioni`),
        requirements: lines(c.requirements, 20, 160, `${name}, requisiti`),
        ...(notes ? { notes } : {}),
      };
    });
    return { id, label, tone, direction, companies };
  });

  if (total > 99) throw new Error("Massimo 99 aziende");

  const config: FairConfig = {
    timerLabel: text(root.timerLabel, 20, "Etichetta timer") || "Timer",
    entranceLabel: text(root.entranceLabel, 20, "Etichetta ingresso") || "Ingresso",
    areas,
  };
  deriveFairView(config); // controllo finale di coerenza
  return config;
}
