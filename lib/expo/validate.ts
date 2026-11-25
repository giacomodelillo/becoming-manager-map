import { newKey } from "./config-ops";
import { deriveFairView } from "./derive";
import { DEFAULT_DISPLAY, MAP_SIZES, PANEL_SIZES } from "./display";
import { MEDIA_FILE_RE } from "./media";
import type {
  Area,
  CompanyDraft,
  DisplaySettings,
  FairConfig,
  FlowDirection,
  MapSize,
  PanelSize,
  ZoneTone,
} from "./types";

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

function parseDisplay(value: unknown): DisplaySettings {
  // i file salvati prima di questa versione non hanno "display": si usano i valori di partenza
  const d = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  const mapSize = MAP_SIZES.some((s) => s.value === d.mapSize) ? (d.mapSize as MapSize) : DEFAULT_DISPLAY.mapSize;
  const panelSize = PANEL_SIZES.some((s) => s.value === d.panelSize)
    ? (d.panelSize as PanelSize)
    : DEFAULT_DISPLAY.panelSize;

  let publicUrl = text(d.publicUrl, 200, "Indirizzo pubblico");
  if (publicUrl) {
    try {
      const url = new URL(publicUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("protocollo");
      publicUrl = url.origin + url.pathname.replace(/\/+$/, "");
    } catch {
      throw new Error("Indirizzo pubblico: serve un indirizzo che inizia con http:// o https://");
    }
  }
  return { mapSize, panelSize, publicUrl };
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
    const arrows = DIRECTIONS.includes(a.arrows as FlowDirection) ? (a.arrows as FlowDirection) : undefined;
    const slot =
      Number.isInteger(a.slot) && (a.slot as number) >= 0 && (a.slot as number) < 8 ? (a.slot as number) : undefined;
    let id = typeof a.id === "string" && a.id.trim() ? a.id.trim().slice(0, 40) : newKey();
    if (usedAreaIds.has(id)) id = newKey();
    usedAreaIds.add(id);

    if (!Array.isArray(a.companies) || a.companies.length < 1) {
      throw new Error(`"${label}": serve almeno un'azienda`);
    }
    const companies: CompanyDraft[] = a.companies.map((rawCompany, ci) => {
      const c = record(rawCompany, `${label}, azienda ${ci + 1}`);
      const name = text(c.name, 120, `${label}, azienda ${ci + 1}, nome`, true);
      let key = typeof c.key === "string" && c.key.trim() ? c.key.trim().slice(0, 40) : newKey();
      if (usedKeys.has(key)) key = newKey();
      usedKeys.add(key);
      const notes = text(c.notes, 3000, `${name}, note`);
      const logo = typeof c.logo === "string" && MEDIA_FILE_RE.test(c.logo) ? c.logo : undefined;
      const logoDark = typeof c.logoDark === "string" && MEDIA_FILE_RE.test(c.logoDark) ? c.logoDark : undefined;
      const values = text(c.values, 10000, `${name}, valori`);
      const opportunities = text(c.opportunities, 10000, `${name}, opportunità`);
      const contacts = text(c.contacts, 2000, `${name}, contatti`);
      const image = typeof c.image === "string" && MEDIA_FILE_RE.test(c.image) ? c.image : undefined;
      total += 1;
      return {
        key,
        name,
        sector: text(c.sector, 120, `${name}, settore`),
        description: text(c.description, 10000, `${name}, descrizione`),
        roles: lines(c.roles, 30, 400, `${name}, posizioni`),
        requirements: lines(c.requirements, 30, 5000, `${name}, requisiti`),
        ...(notes ? { notes } : {}),
        ...(logo ? { logo } : {}),
        ...(logoDark ? { logoDark } : {}),
        ...(values ? { values } : {}),
        ...(opportunities ? { opportunities } : {}),
        ...(contacts ? { contacts } : {}),
        ...(image ? { image } : {}),
        ...(c.hidden === true ? { hidden: true } : {}),
        ...(c.buffer === true ? { buffer: true } : {}),
      };
    });
    return {
      id,
      label,
      tone,
      direction,
      ...(arrows ? { arrows } : {}),
      ...(slot !== undefined ? { slot } : {}),
      companies,
    };
  });

  if (total > 99) throw new Error("Massimo 99 aziende");

  const flow = Array.isArray(root.flow)
    ? root.flow.filter((x): x is string => typeof x === "string").slice(0, 8)
    : [];
  const entranceSlot =
    Number.isInteger(root.entranceSlot) && (root.entranceSlot as number) >= 0 && (root.entranceSlot as number) < 8
      ? (root.entranceSlot as number)
      : undefined;

  const config: FairConfig = {
    timerLabel: text(root.timerLabel, 20, "Etichetta timer") || "Timer",
    entranceLabel: text(root.entranceLabel, 20, "Etichetta ingresso") || "Ingresso",
    areas,
    display: parseDisplay(root.display),
    ...(root.rtl === true ? { rtl: true } : {}),
    ...(flow.length > 0 ? { flow } : {}),
    ...(entranceSlot !== undefined ? { entranceSlot } : {}),
  };
  deriveFairView(config); // controllo finale di coerenza
  return config;
}
