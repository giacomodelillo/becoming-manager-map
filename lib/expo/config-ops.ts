import type { Area, CompanyDraft, FairConfig, FlowDirection, ZoneTone } from "./types";

export const MAX_AREAS = 8;
export const MAX_COMPANIES = 99;
const TONES: ZoneTone[] = ["gold", "magenta", "gray"];

/** Chiave casuale: crypto.randomUUID non esiste su http fuori da localhost */
export function newKey(): string {
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

export function emptyCompany(): CompanyDraft {
  return { key: newKey(), name: "Nuova azienda", sector: "", description: "", roles: [], requirements: [] };
}

export function countCompanies(config: FairConfig): number {
  return config.areas.reduce((sum, a) => sum + a.companies.length, 0);
}

function mapAreas(config: FairConfig, fn: (a: Area, index: number) => Area): FairConfig {
  return { ...config, areas: config.areas.map(fn) };
}

export function locate(config: FairConfig, key: string): { ai: number; ci: number } | null {
  for (let ai = 0; ai < config.areas.length; ai++) {
    const ci = config.areas[ai].companies.findIndex((c) => c.key === key);
    if (ci !== -1) return { ai, ci };
  }
  return null;
}

export function updateArea(
  config: FairConfig,
  areaId: string,
  patch: Partial<{ label: string; tone: ZoneTone; direction: FlowDirection }>,
): FairConfig {
  return mapAreas(config, (a) => (a.id === areaId ? { ...a, ...patch } : a));
}

export function addArea(config: FairConfig): FairConfig {
  if (config.areas.length >= MAX_AREAS || countCompanies(config) >= MAX_COMPANIES) return config;
  const last = config.areas[config.areas.length - 1];
  const area: Area = {
    id: newKey(),
    label: `Area ${config.areas.length + 1}`,
    tone: TONES[config.areas.length % TONES.length],
    direction: last?.direction === "up" ? "down" : "up",
    companies: [emptyCompany()],
  };
  return { ...config, areas: [...config.areas, area] };
}

/** Elimina un'area: le sue aziende passano all'area vicina, nessun dato si perde. */
export function removeArea(config: FairConfig, areaId: string): FairConfig {
  if (config.areas.length <= 1) return config;
  const idx = config.areas.findIndex((a) => a.id === areaId);
  if (idx === -1) return config;
  const removed = config.areas[idx];
  const areas = config.areas.filter((a) => a.id !== areaId).map((a) => ({ ...a }));
  if (idx > 0) {
    areas[idx - 1].companies = [...areas[idx - 1].companies, ...removed.companies];
  } else {
    areas[0].companies = [...removed.companies, ...areas[0].companies];
  }
  return { ...config, areas };
}

export function moveArea(config: FairConfig, areaId: string, delta: -1 | 1): FairConfig {
  const idx = config.areas.findIndex((a) => a.id === areaId);
  const target = idx + delta;
  if (idx === -1 || target < 0 || target >= config.areas.length) return config;
  const areas = [...config.areas];
  [areas[idx], areas[target]] = [areas[target], areas[idx]];
  return { ...config, areas };
}

export function addCompany(config: FairConfig, areaId: string): { config: FairConfig; key: string | null } {
  if (countCompanies(config) >= MAX_COMPANIES) return { config, key: null };
  const company = emptyCompany();
  return {
    config: mapAreas(config, (a) =>
      a.id === areaId ? { ...a, companies: [...a.companies, company] } : a,
    ),
    key: company.key,
  };
}

export function updateCompany(
  config: FairConfig,
  key: string,
  patch: Partial<Omit<CompanyDraft, "key">>,
): FairConfig {
  return mapAreas(config, (a) => ({
    ...a,
    companies: a.companies.map((c) => (c.key === key ? { ...c, ...patch } : c)),
  }));
}

/** Non elimina l'ultima azienda di un'area (un'area vuota non è valida). */
export function removeCompany(config: FairConfig, key: string): FairConfig {
  const loc = locate(config, key);
  if (!loc || config.areas[loc.ai].companies.length < 2) return config;
  return mapAreas(config, (a) => ({ ...a, companies: a.companies.filter((c) => c.key !== key) }));
}

/** Sposta di un posto nell'ordine globale: ai bordi di un'area passa a quella vicina. */
export function moveCompany(config: FairConfig, key: string, delta: -1 | 1): FairConfig {
  const loc = locate(config, key);
  if (!loc) return config;
  const { ai, ci } = loc;
  const areas = config.areas.map((a) => ({ ...a, companies: [...a.companies] }));
  const list = areas[ai].companies;
  const target = ci + delta;

  if (target >= 0 && target < list.length) {
    [list[ci], list[target]] = [list[target], list[ci]];
    return { ...config, areas };
  }
  const nextArea = ai + delta;
  if (nextArea < 0 || nextArea >= areas.length || list.length < 2) return config;
  const [item] = list.splice(ci, 1);
  if (delta < 0) areas[nextArea].companies.push(item);
  else areas[nextArea].companies.unshift(item);
  return { ...config, areas };
}

/** Duplica un'azienda subito dopo l'originale (logo e immagine restano gli stessi file). */
export function duplicateCompany(config: FairConfig, key: string): { config: FairConfig; key: string | null } {
  const loc = locate(config, key);
  if (!loc || countCompanies(config) >= MAX_COMPANIES) return { config, key: null };
  const original = config.areas[loc.ai].companies[loc.ci];
  const copy: CompanyDraft = {
    ...original,
    key: newKey(),
    name: `${original.name} (copia)`.slice(0, 80),
    roles: [...original.roles],
    requirements: [...original.requirements],
  };
  return {
    config: mapAreas(config, (a, ai) =>
      ai === loc.ai
        ? { ...a, companies: [...a.companies.slice(0, loc.ci + 1), copy, ...a.companies.slice(loc.ci + 1)] }
        : a,
    ),
    key: copy.key,
  };
}

/** Porta un'azienda in una posizione precisa di un'area (anche diversa). Per il trascinamento. */
export function moveCompanyTo(config: FairConfig, key: string, areaId: string, index: number): FairConfig {
  const loc = locate(config, key);
  const to = config.areas.findIndex((a) => a.id === areaId);
  if (!loc || to === -1) return config;
  if (loc.ai !== to && config.areas[loc.ai].companies.length < 2) return config;
  const areas = config.areas.map((a) => ({ ...a, companies: [...a.companies] }));
  const [item] = areas[loc.ai].companies.splice(loc.ci, 1);
  const list = areas[to].companies;
  list.splice(Math.max(0, Math.min(index, list.length)), 0, item);
  return { ...config, areas };
}
