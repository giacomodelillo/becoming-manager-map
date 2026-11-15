import { assertFairData } from "../route";
import type { Company, FairLayout } from "../types";

/** DATI DI ESEMPIO: sostituisci con quelli reali. `id` = numero del booth (1..N). */
export const companies: Company[] = [
  {
    id: 1,
    name: "Nova Software",
    sector: "Informatica",
    description:
      "Software house che sviluppa gestionali e app web per le piccole e medie imprese del territorio.",
    roles: ["Sviluppatore full stack junior", "Tirocinante QA"],
    requirements: ["Diploma o laurea in informatica", "Conoscenza base di JavaScript"],
    notes: "Porta il curriculum: colloqui brevi allo stand.",
  },
  {
    id: 2,
    name: "Banca Alpina",
    sector: "Finanza",
    description: "Istituto di credito locale con 40 filiali, attivo su consulenza e servizi digitali.",
    roles: ["Addetto allo sportello", "Consulente junior"],
    requirements: ["Diploma in ragioneria o affini", "Buone doti relazionali"],
  },
  {
    id: 3,
    name: "Meccanica Rossi",
    sector: "Meccanica",
    description: "Produzione di componenti di precisione per il settore automotive e packaging.",
    roles: ["Operatore CNC", "Disegnatore meccanico"],
    requirements: ["Diploma tecnico", "Lettura del disegno meccanico"],
  },
  {
    id: 4,
    name: "Studio Verde Architetti",
    sector: "Edilizia",
    description: "Studio di progettazione specializzato in riqualificazione energetica degli edifici.",
    roles: ["Collaboratore CAD/BIM", "Stagista di cantiere"],
    requirements: ["Geometra o laurea in architettura", "Conoscenza di AutoCAD"],
  },
  {
    id: 5,
    name: "Logistica Adriatica",
    sector: "Trasporti",
    description: "Operatore logistico con magazzini automatizzati e flotta propria.",
    roles: ["Addetto magazzino", "Pianificatore trasporti"],
    requirements: ["Patentino carrello elevatore (titolo preferenziale)", "Disponibilità sui turni"],
  },
  {
    id: 6,
    name: "BioLab Italia",
    sector: "Sanità",
    description: "Laboratorio di analisi e ricerca con sedi in tre regioni.",
    roles: ["Tecnico di laboratorio", "Addetto accettazione"],
    requirements: ["Diploma o laurea in ambito biologico/sanitario"],
    notes: "Selezioni aperte tutto l'anno.",
  },
  {
    id: 7,
    name: "Pixel Media",
    sector: "Comunicazione",
    description: "Agenzia di comunicazione: social, video e grafica per brand locali e nazionali.",
    roles: ["Social media assistant", "Video editor junior"],
    requirements: ["Portfolio di lavori", "Conoscenza della suite Adobe"],
  },
  {
    id: 8,
    name: "Energia Futura",
    sector: "Energia",
    description: "Installazione e manutenzione di impianti fotovoltaici e colonnine di ricarica.",
    roles: ["Installatore impianti", "Tecnico di manutenzione"],
    requirements: ["Diploma in elettrotecnica", "Patente B"],
  },
  {
    id: 9,
    name: "Agrifood Valli",
    sector: "Alimentare",
    description: "Cooperativa agroalimentare con filiera completa, dal campo al punto vendita.",
    roles: ["Addetto produzione", "Assistente controllo qualità"],
    requirements: ["Diploma agrario o alimentare"],
  },
  {
    id: 10,
    name: "Atelier Moda",
    sector: "Moda",
    description: "Laboratorio sartoriale e brand di abbigliamento con produzione interamente italiana.",
    roles: ["Modellista", "Addetto vendite"],
    requirements: ["Diploma in moda o esperienza equivalente"],
  },
  {
    id: 11,
    name: "Cyber Shield",
    sector: "Informatica",
    description: "Società di cybersecurity: audit, monitoraggio e formazione per le aziende.",
    roles: ["Analista SOC junior", "Tirocinante sicurezza"],
    requirements: ["Basi di reti e sistemi", "Curiosità e metodo"],
  },
  {
    id: 12,
    name: "Hotel Belvedere",
    sector: "Turismo",
    description: "Hotel 4 stelle con ristorante e centro congressi, stagione lunga.",
    roles: ["Receptionist", "Commis di sala"],
    requirements: ["Inglese B1", "Disponibilità nei weekend"],
  },
];

/**
 * Colonne di booth con frecce di flusso. `booths` è nell'ordine di avanzamento.
 * Qui: colonna A sale (1→4), B scende (5→8), C sale (9→12).
 */
export const fairLayout: FairLayout = {
  entranceLabel: "Ingresso",
  timerLabel: "Timer",
  columns: [
    { id: "a", direction: "up", booths: [1, 2, 3, 4], label: "Area tech", tone: "gold" },
    { id: "b", direction: "down", booths: [5, 6, 7, 8], label: "Area industria", tone: "magenta" },
    { id: "c", direction: "up", booths: [9, 10, 11, 12], label: "Area servizi", tone: "gray" },
  ],
};

assertFairData(companies, fairLayout);

const byId = new Map(companies.map((c) => [c.id, c]));

export const boothIds: number[] = companies.map((c) => c.id).sort((a, b) => a - b);

export function getCompany(id: number): Company | undefined {
  return byId.get(id);
}
