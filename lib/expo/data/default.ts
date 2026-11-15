import type { FairConfig } from "../types";

/**
 * DATI DI PARTENZA: si usano finché nessuno salva dall'area riservata.
 * Dopo il primo salvataggio i dati vivono in `data/expo.json`.
 */
export const defaultConfig: FairConfig = {
  timerLabel: "Timer",
  entranceLabel: "Ingresso",
  areas: [
    {
      id: "a",
      label: "Area A",
      tone: "gold",
      direction: "up",
      companies: [
        {
          key: "nova-software",
          name: "Nova Software",
          sector: "Informatica",
          description:
            "Software house che sviluppa gestionali e app web per le piccole e medie imprese del territorio.",
          roles: ["Sviluppatore full stack junior", "Tirocinante QA"],
          requirements: ["Diploma o laurea in informatica", "Conoscenza base di JavaScript"],
          notes: "Porta il curriculum: colloqui brevi allo stand.",
        },
        {
          key: "banca-alpina",
          name: "Banca Alpina",
          sector: "Finanza",
          description: "Istituto di credito locale con 40 filiali, attivo su consulenza e servizi digitali.",
          roles: ["Addetto allo sportello", "Consulente junior"],
          requirements: ["Diploma in ragioneria o affini", "Buone doti relazionali"],
        },
        {
          key: "meccanica-rossi",
          name: "Meccanica Rossi",
          sector: "Meccanica",
          description: "Produzione di componenti di precisione per il settore automotive e packaging.",
          roles: ["Operatore CNC", "Disegnatore meccanico"],
          requirements: ["Diploma tecnico", "Lettura del disegno meccanico"],
        },
        {
          key: "studio-verde",
          name: "Studio Verde Architetti",
          sector: "Edilizia",
          description: "Studio di progettazione specializzato in riqualificazione energetica degli edifici.",
          roles: ["Collaboratore CAD/BIM", "Stagista di cantiere"],
          requirements: ["Geometra o laurea in architettura", "Conoscenza di AutoCAD"],
        },
      ],
    },
    {
      id: "b",
      label: "Area B",
      tone: "magenta",
      direction: "down",
      companies: [
        {
          key: "logistica-adriatica",
          name: "Logistica Adriatica",
          sector: "Trasporti",
          description: "Operatore logistico con magazzini automatizzati e flotta propria.",
          roles: ["Addetto magazzino", "Pianificatore trasporti"],
          requirements: ["Patentino carrello elevatore (titolo preferenziale)", "Disponibilità sui turni"],
        },
        {
          key: "biolab-italia",
          name: "BioLab Italia",
          sector: "Sanità",
          description: "Laboratorio di analisi e ricerca con sedi in tre regioni.",
          roles: ["Tecnico di laboratorio", "Addetto accettazione"],
          requirements: ["Diploma o laurea in ambito biologico/sanitario"],
          notes: "Selezioni aperte tutto l'anno.",
        },
        {
          key: "pixel-media",
          name: "Pixel Media",
          sector: "Comunicazione",
          description: "Agenzia di comunicazione: social, video e grafica per brand locali e nazionali.",
          roles: ["Social media assistant", "Video editor junior"],
          requirements: ["Portfolio di lavori", "Conoscenza della suite Adobe"],
        },
        {
          key: "energia-futura",
          name: "Energia Futura",
          sector: "Energia",
          description: "Installazione e manutenzione di impianti fotovoltaici e colonnine di ricarica.",
          roles: ["Installatore impianti", "Tecnico di manutenzione"],
          requirements: ["Diploma in elettrotecnica", "Patente B"],
        },
      ],
    },
    {
      id: "c",
      label: "Area C",
      tone: "gray",
      direction: "up",
      companies: [
        {
          key: "agrifood-valli",
          name: "Agrifood Valli",
          sector: "Alimentare",
          description: "Cooperativa agroalimentare con filiera completa, dal campo al punto vendita.",
          roles: ["Addetto produzione", "Assistente controllo qualità"],
          requirements: ["Diploma agrario o alimentare"],
        },
        {
          key: "atelier-moda",
          name: "Atelier Moda",
          sector: "Moda",
          description: "Laboratorio sartoriale e brand di abbigliamento con produzione interamente italiana.",
          roles: ["Modellista", "Addetto vendite"],
          requirements: ["Diploma in moda o esperienza equivalente"],
        },
        {
          key: "cyber-shield",
          name: "Cyber Shield",
          sector: "Informatica",
          description: "Società di cybersecurity: audit, monitoraggio e formazione per le aziende.",
          roles: ["Analista SOC junior", "Tirocinante sicurezza"],
          requirements: ["Basi di reti e sistemi", "Curiosità e metodo"],
        },
        {
          key: "hotel-belvedere",
          name: "Hotel Belvedere",
          sector: "Turismo",
          description: "Hotel 4 stelle con ristorante e centro congressi, stagione lunga.",
          roles: ["Receptionist", "Commis di sala"],
          requirements: ["Inglese B1", "Disponibilità nei weekend"],
        },
      ],
    },
  ],
};
