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
  /** Postazione BUFFER: nessuna azienda, card rossa non selezionabile, fuori dai percorsi */
  buffer?: boolean;
};

export type FlowDirection = "up" | "down";

/** Colore della zona, dalla palette del brand */
export type ZoneTone = "gold" | "magenta" | "gray";

export type FairColumn = {
  id: string;
  /** Come sono disposti i numeri: "up" = il primo booth sta in basso */
  direction: FlowDirection;
  /** Verso delle frecce (può essere opposto alla numerazione) */
  arrows: FlowDirection;
  /** Colonna sulla mappa, da sinistra (0) */
  slot: number;
  /** Numeri dei booth nell'ordine di avanzamento */
  booths: number[];
  label?: string;
  tone?: ZoneTone;
};

export type FairLayout = {
  /** Ordine in cui si percorrono le aree (id): da qui le frecce tra una colonna e l'altra */
  flow: string[];
  /** Colonna sotto cui sta l'ingresso */
  entranceSlot: number;
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
  /** Verso delle frecce, se diverso da `direction` */
  arrows?: FlowDirection;
  /** Colonna sulla mappa da sinistra (0, 1, 2...). Se manca: l'ordine delle aree */
  slot?: number;
  /** In ordine di avanzamento. Il numero del booth è la posizione globale */
  companies: CompanyDraft[];
};

export type FairConfig = {
  /** Ordine di percorrenza delle aree (id). Se manca: l'ordine delle aree */
  flow?: string[];
  /** Colonna sotto cui sta l'ingresso. Se manca: quella della prima area percorsa */
  entranceSlot?: number;
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
