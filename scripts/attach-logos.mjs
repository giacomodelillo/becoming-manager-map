// Collega i loghi messi a mano. Cartella: data/logos/
// Nome del file:  <chiave>-chiaro.png   (logo per sfondo chiaro, in riquadro bianco)
//                 <chiave>-scuro.svg    (logo per sfondo scuro, mostrato senza riquadro)
// Formati: png, jpg, webp, svg (max 3 MB). La <chiave> la vedi con:  node scripts/attach-logos.mjs --list
// Uso:  node scripts/attach-logos.mjs
import { randomBytes } from "node:crypto";
import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dataFile = process.env.EXPO_DATA_FILE ?? path.join(process.cwd(), "data", "expo.json");
const mediaDir = process.env.EXPO_MEDIA_DIR ?? path.join(process.cwd(), "data", "media");
const logosDir = path.join(process.cwd(), "data", "logos");

const saved = JSON.parse(await readFile(dataFile, "utf8"));
const companies = saved.config.areas.flatMap((a) => a.companies);

if (process.argv.includes("--list")) {
  for (const c of companies) console.log(`${c.key.padEnd(20)} ${c.name}`);
  process.exit(0);
}

const FIELD = { chiaro: "logo", scuro: "logoDark" };
const byKey = new Map(companies.map((c) => [c.key.toLowerCase(), c]));

let files;
try {
  files = await readdir(logosDir);
} catch {
  console.error(`Cartella mancante: crea ${logosDir} e mettici i loghi.`);
  process.exit(1);
}

await mkdir(mediaDir, { recursive: true });
let done = 0;
const unknown = [];
for (const name of files) {
  const m = /^(.+)-(chiaro|scuro)\.(png|jpe?g|webp|svg)$/i.exec(name);
  if (!m) {
    unknown.push(`${name}: nome non valido`);
    continue;
  }
  const company = byKey.get(m[1].toLowerCase());
  if (!company) {
    unknown.push(`${name}: la chiave "${m[1]}" non esiste (vedi --list)`);
    continue;
  }
  const src = path.join(logosDir, name);
  const buf = await readFile(src);
  if (buf.length > 3 * 1024 * 1024) {
    unknown.push(`${name}: più di 3 MB, ridimensionalo o caricalo da /admin`);
    continue;
  }
  const ext = m[3].toLowerCase().replace("jpeg", "jpg");
  const file = `${randomBytes(6).toString("hex")}.${ext}`;
  await copyFile(src, path.join(mediaDir, file));
  company[FIELD[m[2].toLowerCase()]] = file;
  done += 1;
}

saved.version = (saved.version ?? 1) + 1; // gli schermi si accorgono della modifica
await writeFile(dataFile, JSON.stringify(saved, null, 2), "utf8");
console.log(`Loghi collegati: ${done}`);
if (unknown.length) console.log(`Saltati:\n- ${unknown.join("\n- ")}`);
const missing = companies.filter((c) => !c.hidden && !c.logo && !c.logoDark).map((c) => c.name);
if (missing.length) console.log(`Ancora senza logo: ${missing.join(", ")}`);
