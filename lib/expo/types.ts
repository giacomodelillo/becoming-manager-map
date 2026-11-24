export type Company = {
  /** Numero del booth: assegnato in automatico (1..N) seguendo l'ordine delle aree */
  id: number;
  name: string;
  sector: string;
  description: string;
  roles: string[];
  requirements: string[];
  notes?: string;
  /** File del logo (vedi lib/expo/media.ts) */
  logo?: string;
  /** File dell'immagine di copertina */
  image?: string;
  /** Logo per sfondo scuro: nel pannello si mostra senza riquadro (ha la precedenza su `logo`) */
  logoDark?: string;
  /** Valori, opportunità e contatti: testi del modulo Must & Want */
  values?: string;
  opportunities?: string;
  contacts?: string;
  /** Azienda assente: il booth resta (il numero non cambia) ma esce da percorsi ed elenco */
  hidden?: boolean;
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
  /** Aree disegnate da destra a sinistra (la prima area è quella a destra) */
  rtl?: boolean;
  entranceLabel: string;
  timerLabel: string;
  columns: FairColumn[];
};

/* ---------- Dati modificabili dall'area riservata ---------- */

/** fit = si vede tutta la mappa; gli altri fissano la grandezza minima dei testi sullo schermo */
export type MapSize = "fit" | "readable" | "large" | "xlarge";
export type PanelSize = "standard" | "large" | "xlarge";

export type DisplaySettings = {
  mapSize: MapSize;
  panelSize: PanelSize;
  /** Indirizzo con cui i telefoni raggiungono il server (per il QR). Vuoto = quello della pagina */
  publicUrl: string;
};

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
  /** Aree disegnate da destra a sinistra */
  rtl?: boolean;
  timerLabel: string;
  entranceLabel: string;
  areas: Area[];
  display: DisplaySettings;
};

/** Dati derivati dalla configurazione: quelli che usa la mappa pubblica */
export type FairView = {
  /** Tutte le aziende, assenti comprese (i numeri dei booth restano stabili) */
  companies: Company[];
  layout: FairLayout;
  /** Solo i booth presenti: sono quelli che entrano nei percorsi */
  boothIds: number[];
  byId: Map<number, Company>;
  display: DisplaySettings;
};

export type HistoryItem = { version: number; savedAt: string; areas: number; companies: number };
