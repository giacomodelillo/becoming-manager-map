// Si lancia nel progetto LOCALE, dopo aver finito di compilare tutto in /admin.
// Uso:  node scripts/export-online.mjs ../horizon-online
// Copia nel progetto online i dati (src/data/expo-snapshot.json) e SOLO le immagini
// che servono davvero (public/media). I file caricati e poi sostituiti non vengono portati.
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const target = process.argv[2];
if (!target) {
  console.error("Uso: node scripts/export-online.mjs <cartella-del-progetto-online>");
  process.exit(1);
}

const dataFile = process.env.EXPO_DATA_FILE ?? path.join(process.cwd(), "data", "expo.json");
const mediaDir = process.env.EXPO_MEDIA_DIR ?? path.join(process.cwd(), "data", "media");

const saved = JSON.parse(await readFile(dataFile, "utf8"));
const config = saved.config;
if (!config || !Array.isArray(config.areas) || config.areas.length === 0) {
  console.error(`Il file ${dataFile} non contiene una mappa valida. Salva prima i dati da /admin.`);
  process.exit(1);
}

// Online le impostazioni di schermo sono quelle per i telefoni, non quelle del totem
config.display = { mapSize: "readable", panelSize: "standard", publicUrl: "" };

const files = new Set();
for (const area of config.areas) {
  for (const company of area.companies) {
    if (company.logo) files.add(company.logo);
    if (company.logoDark) files.add(company.logoDark);
    if (company.image) files.add(company.image);
  }
}

const dataOut = path.join(target, "src", "data");
const mediaOut = path.join(target, "public", "media");
await mkdir(dataOut, { recursive: true });
await rm(mediaOut, { recursive: true, force: true });
await mkdir(mediaOut, { recursive: true });

await writeFile(
  path.join(dataOut, "expo-snapshot.json"),
  JSON.stringify({ version: saved.version ?? 1, exportedAt: new Date().toISOString(), config }, null, 2),
  "utf8",
);

let copied = 0;
const missing = [];
for (const file of files) {
  try {
    await copyFile(path.join(mediaDir, file), path.join(mediaOut, file));
    copied += 1;
  } catch {
    missing.push(file);
  }
}

const companies = config.areas.reduce((n, a) => n + a.companies.length, 0);
console.log(`Esportate ${companies} aziende in ${config.areas.length} aree (versione ${saved.version ?? 1}).`);
console.log(`Immagini copiate: ${copied}${missing.length ? `, MANCANTI: ${missing.join(", ")}` : ""}`);
console.log(`Dati: ${path.join(dataOut, "expo-snapshot.json")}`);
