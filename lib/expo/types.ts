export type Company = {
  /** Numero del booth: 1..N, senza buchi */
  id: number;
  name: string;
  sector: string;
  description: string;
  roles: string[];
  requirements: string[];
  notes?: string;
};

export type FlowDirection = "up" | "down";

/** Colore della zona, dalla palette del brand (se omesso: si alternano in ordine) */
export type ZoneTone = "gold" | "magenta" | "gray";

export type FairColumn = {
  id: string;
  /** Verso di avanzamento della colonna */
  direction: FlowDirection;
  /** Numeri dei booth nell'ordine di avanzamento (il primo è dove si entra nella colonna) */
  booths: number[];
  /** Etichetta sopra la zona, es. "Area tech" */
  label?: string;
  tone?: ZoneTone;
};

export type FairLayout = {
  entranceLabel: string;
  timerLabel: string;
  /** Consigliato: prima colonna "up" (l'ingresso sta sotto di lei) e colonne della stessa lunghezza */
  columns: FairColumn[];
};
