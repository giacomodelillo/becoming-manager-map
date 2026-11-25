// Porta data/expo.json sulla planimetria della sala (Timer in alto, Ingresso in basso):
//   sinistra  1-9   dal basso in alto (frecce ↑)   1 vicino Ingresso → 9 BUFFER vicino Timer
//   centro    10-17 dall'alto in basso (frecce ↓)  10 vicino Timer → 17 BUFFER vicino Ingresso
//   destra    18-26 dal basso in alto (frecce ↑)   18 vicino Ingresso → 26 BUFFER vicino Timer
//   percorso: sinistra (9) → (in alto) → centro (10..17) → (in basso) → destra (18..26)
import { copyFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const file =
  process.env.EXPO_DATA_FILE ?? path.join(process.cwd(), "data", "expo.json");
const saved = JSON.parse(await readFile(file, "utf8"));

const backup = file.replace(
  /\.json$/,
  `.backup-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.json`,
);
await copyFile(file, backup);

const byKey = new Map(
  saved.config.areas.flatMap((a) => a.companies).map((c) => [c.key, c]),
);
const buffer = (n) =>
  byKey.get(`buffer-${n}`) ?? {
    key: `buffer-${n}`,
    name: "BUFFER",
    sector: "",
    description: "",
    roles: [],
    requirements: [],
    buffer: true,
  };

const missing = [];
const pick = (keys) =>
  keys.map((k) => byKey.get(k) ?? (missing.push(k), null)).filter(Boolean);

// 1-8 aziende + 9 BUFFER (dal basso verso l'alto)
const sinistra = [
  ...pick([
    "auxiell",
    "adacta",
    "pwc",
    "sintesia",
    "considi",
    "pietro-fiorentini",
    "dab-pumps",
    "moncler",
  ]),
  buffer(9),
];

// 10-16 aziende + 17 BUFFER (dall'alto verso il basso: 10 in cima vicino Timer, 17 BUFFER in basso vicino Ingresso)
const centro = [
  ...pick([
    "impresoft",
    "valbruna",
    "beltrame",
    "fincantieri",
    "ovs",
    "sdg-group",
    "steelco",
  ]),
  buffer(17),
];

// 18-25 aziende (inclusa Relex Solutions al 25) + 26 BUFFER (dal basso verso l'alto)
const destra = [
  ...pick([
    "sanmarco",
    "zeta",
    "gottardo",
    "pillar",
    "veronesi",
    "aspiag",
    "frigo-system",
    "relex",
  ]),
  buffer(26),
];

if (missing.length) {
  console.error(
    `Aziende non trovate in expo.json (chiave cambiata?): ${missing.join(", ")}\nNon scrivo nulla.`,
  );
  process.exit(1);
}

const placed = new Set([...sinistra, ...centro, ...destra].map((c) => c.key));
const unplaced = [...byKey.values()]
  .filter((c) => !placed.has(c.key) && !c.hidden && !c.buffer)
  .map((c) => c.name);

const { rtl, ...rest } = saved.config;
void rtl;
saved.config = {
  ...rest,
  flow: ["sinistra", "centro", "destra"],
  entranceSlot: 1,
  areas: [
    {
      id: "sinistra",
      label: "Sinistra",
      tone: "gold",
      direction: "up",
      arrows: "up",
      slot: 0,
      companies: sinistra,
    },
    {
      id: "centro",
      label: "Centro",
      tone: "magenta",
      direction: "down",
      arrows: "down",
      slot: 1,
      companies: centro,
    },
    {
      id: "destra",
      label: "Destra",
      tone: "gray",
      direction: "up",
      arrows: "up",
      slot: 2,
      companies: destra,
    },
  ],
};
saved.version = (saved.version ?? 1) + 1;
await writeFile(file, JSON.stringify(saved, null, 2), "utf8");

console.log(`Fatto. Copia di sicurezza: ${backup}`);
if (unplaced.length)
  console.log(
    `NON collocate (non erano nella tua lista): ${unplaced.join(", ")}`,
  );
