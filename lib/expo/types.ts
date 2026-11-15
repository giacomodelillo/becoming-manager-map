export type Company = {
  /** Numero del booth: assegnato in automatico (1..N) seguendo l'ordine delle aree */
  id: number;
  name: string;
  sector: string;
  description: string;
  roles: string[];
  requirements: string[];
  notes?: string;
};

export type FlowDirection = "up" | "down";

/** Colore della zona, dalla palette del brand */
export type ZoneTone = "gold" | "magenta" | "gray";

export type FairColumn = {
  id: string;
  direction: FlowDirection;
  /** Numeri dei booth nell'ordine di avanzamento */
  booths: number[];
  label?: string;
  tone?: ZoneTone;
};

export type FairLayout = {
  entranceLabel: string;
  timerLabel: string;
  columns: FairColumn[];
};

/* ---------- Dati modificabili dall'area riservata ---------- */

export type CompanyDraft = Omit<Company, "id"> & { key: string };

export type Area = {
  id: string;
  label: string;
  tone: ZoneTone;
  direction: FlowDirection;
  /** In ordine di avanzamento. Il numero del booth è la posizione globale */
  companies: CompanyDraft[];
};

export type FairConfig = {
  timerLabel: string;
  entranceLabel: string;
  areas: Area[];
};

/** Dati derivati dalla configurazione: quelli che usa la mappa pubblica */
export type FairView = {
  companies: Company[];
  layout: FairLayout;
  boothIds: number[];
  byId: Map<number, Company>;
};
