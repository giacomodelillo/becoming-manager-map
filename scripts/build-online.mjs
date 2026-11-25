// Crea (o aggiorna) la versione ONLINE a partire dal progetto LOCALE: solo mappa e schede, nessun timer,
// nessuna area riservata, nessuna API. I dati e i loghi vengono "congelati" dentro il sito.
//
// Uso, dalla radice del progetto locale:   node scripts/build-online.mjs ../horizon-online
//
// Cosa fa, in ordine:
//  1. copia il progetto locale nella cartella di destinazione (mantiene .git, .vercel e node_modules)
//  2. cancella timer, area riservata, API e contenuti di esempio
//  3. sovrascrive i file che online sono diversi, presi da scripts/online-overrides/
//  4. toglie dal package.json le librerie che online non servono
//  5. esporta data/expo.json e SOLO i loghi/immagini usati (data e public/media)
//  6. controlla che nessun file rimasto usi qualcosa che è stato cancellato
import { cp, copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const arg = process.argv[2];
if (!arg) {
  console.error("Uso: node scripts/build-online.mjs <cartella-online>   (es. ../horizon-online)");
  process.exit(1);
}
const target = path.resolve(root, arg);
const MARKER = ".online-build";
const KEEP = new Set([".git", ".vercel", "node_modules", MARKER]);

// ---------- sicurezza ----------
if (target === root || target.startsWith(root + path.sep) || root.startsWith(target + path.sep)) {
  console.error("La cartella online deve essere FUORI dal progetto locale (e non contenerlo).");
  process.exit(1);
}
if (!(await exists(path.join(root, "app")))) {
  console.error("Lancialo dalla radice del progetto locale (dove c'è la cartella app).");
  process.exit(1);
}
const existing = await readdir(target).catch(() => null);
if (existing && existing.length > 0 && !existing.includes(MARKER)) {
  console.error(`${target} non è vuota e non è stata creata da questo script: non la tocco.`);
  console.error("Usa una cartella nuova, oppure crea a mano un file vuoto chiamato .online-build al suo interno.");
  process.exit(1);
}

async function exists(p) {
  return stat(p).then(() => true, () => false);
}

// ---------- 1. copia ----------
if (existing) {
  for (const name of existing) if (!KEEP.has(name)) await rm(path.join(target, name), { recursive: true, force: true });
}
await mkdir(target, { recursive: true });
await writeFile(path.join(target, MARKER), "Cartella generata da scripts/build-online.mjs: i file vengono riscritti a ogni esecuzione.\n");

const SKIP_TOP = new Set(["node_modules", ".next", ".git", ".vercel", "data", "scripts", "out", "coverage"]);
for (const name of await readdir(root)) {
  if (SKIP_TOP.has(name) || name.startsWith(".env")) continue;
  await cp(path.join(root, name), path.join(target, name), {
    recursive: true,
    filter: (src) => !/(^|[\\/])(node_modules|\.next|\.DS_Store)([\\/]|$)/.test(src) && !src.endsWith(".tsbuildinfo"),
  });
}

// ---------- 2. cancellazioni ----------
const REMOVE = [
  // area riservata e scritture
  "app/admin", "app/@detail/admin", "app/api",
  "components/admin",
  "components/sections/admin-stage.tsx", "components/sections/admin-detail.tsx",
  "lib/expo/server",
  "lib/expo/admin-api.ts", "lib/expo/admin-store.ts", "lib/expo/config-ops.ts",
  "lib/expo/validate.ts", "lib/expo/import.ts", "lib/expo/images.ts", "lib/expo/download.ts",
  "lib/expo/data/default.ts",
  // solo totem e telefono
  "components/expo/use-idle-reset.ts", "components/expo/offline-badge.tsx", "components/expo/phone-qr.tsx",
  // timer
  "app/timer", "app/@detail/timer", "lib/timer", "components/timer",
  "components/sections/timer-stage.tsx", "components/sections/timer-detail.tsx",
  // esempi del template
  "app/items", "app/@detail/items", "lib/items.ts",
  "components/sections/hero-section.tsx", "components/sections/item-grid.tsx",
  "components/sections/home-stage.tsx", "components/sections/item-detail.tsx",
  "components/sections/empty-detail.tsx",
];
for (const rel of REMOVE) await rm(path.join(target, rel), { recursive: true, force: true });

// ---------- 3. file diversi online ----------
const overrides = path.join(root, "scripts", "online-overrides");
let overridden = 0;
if (await exists(overrides)) {
  await cp(overrides, target, { recursive: true, force: true });
  (async function count(dir) {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      if (e.isDirectory()) await count(path.join(dir, e.name));
      else overridden += 1;
    }
  })(overrides).catch(() => {});
}

// ---------- 4. package.json ----------
const pkgPath = path.join(target, "package.json");
const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
const DROP = ["xlsx", "qrcode.react", "@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"];
const dropped = [];
for (const dep of DROP) {
  for (const group of ["dependencies", "devDependencies"]) {
    if (pkg[group]?.[dep]) {
      delete pkg[group][dep];
      dropped.push(dep);
    }
  }
}
await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

// ---------- 5. dati e immagini ----------
const dataFile = process.env.EXPO_DATA_FILE ?? path.join(root, "data", "expo.json");
const mediaDir = process.env.EXPO_MEDIA_DIR ?? path.join(root, "data", "media");
const saved = JSON.parse(await readFile(dataFile, "utf8").catch(() => {
  console.error(`Non trovo ${dataFile}. Salva i dati da /admin prima di esportare.`);
  process.exit(1);
}));
const config = saved.config;
if (!config || !Array.isArray(config.areas) || config.areas.length === 0) {
  console.error(`${dataFile} non contiene una mappa valida.`);
  process.exit(1);
}
// impostazioni di schermo per i telefoni (non quelle del totem); nessun indirizzo pubblico
config.display = { mapSize: "readable", panelSize: "standard", publicUrl: "" };

const files = new Set();
for (const area of config.areas) {
  for (const c of area.companies) for (const f of [c.logo, c.logoDark, c.image]) if (f) files.add(f);
}
await mkdir(path.join(target, "data"), { recursive: true });
await writeFile(
  path.join(target, "data", "expo-snapshot.json"),
  JSON.stringify({ version: saved.version ?? 1, exportedAt: new Date().toISOString(), config }, null, 2),
);
const mediaOut = path.join(target, "public", "media");
await rm(mediaOut, { recursive: true, force: true });
await mkdir(mediaOut, { recursive: true });
let copied = 0;
const missing = [];
for (const f of files) {
  try {
    await copyFile(path.join(mediaDir, f), path.join(mediaOut, f));
    copied += 1;
  } catch {
    missing.push(f);
  }
}

// ---------- 6. controllo dei riferimenti ----------
const BAD = [
  [/@\/lib\/expo\/(server|admin-|config-ops|validate|import|images|download|data\/default)/, "modulo dell'area riservata"],
  [/@\/components\/admin|@\/components\/timer|@\/lib\/timer|@\/lib\/items/, "timer, area riservata o esempi"],
  [/use-idle-reset|offline-badge|phone-qr/, "componente solo locale"],
  [/sections\/(hero-section|item-grid|home-stage|item-detail|empty-detail|timer-stage|timer-detail|admin-stage|admin-detail)/, "sezione cancellata"],
  [/\/api\/(expo|timer)/, "chiamata a una API che online non esiste"],
  [/["'`]\/(timer|admin)\b/, "link a una pagina che online non esiste"],
];
const problems = [];
async function scan(dir) {
  if (!(await exists(dir))) return;
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await scan(full);
    else if (/\.(ts|tsx)$/.test(e.name) && !e.name.endsWith(".test.ts")) {
      (await readFile(full, "utf8")).split("\n").forEach((line, i) => {
        for (const [re, why] of BAD) if (re.test(line)) problems.push(`${path.relative(target, full)}:${i + 1}  ${why}\n      ${line.trim()}`);
      });
    }
  }
}
for (const dir of ["app", "components", "lib"]) {
  await scan(path.join(target, dir));
}

// ---------- riepilogo ----------
const companies = config.areas.reduce((n, a) => n + a.companies.length, 0);
console.log(`\nVersione online creata in ${target}`);
console.log(`  dati:      ${companies} booth in ${config.areas.length} aree (versione dati ${saved.version ?? 1})`);
console.log(`  immagini:  ${copied} copiate${missing.length ? `, MANCANTI: ${missing.join(", ")}` : ""}`);
console.log(`  file diversi online: ${overridden}`);
console.log(`  librerie tolte: ${dropped.join(", ") || "nessuna"}`);
if (problems.length) {
  console.log(`\nATTENZIONE: ${problems.length} riferimenti a cose che online non esistono.`);
  console.log("Correggili con un file in scripts/online-overrides/ (stesso percorso del file) e rilancia:\n");
  console.log(problems.map((p) => "  " + p).join("\n"));
  process.exit(2);
}
console.log("\nNessun riferimento rotto. Ora:\n  cd " + arg + "\n  pnpm install\n  pnpm build");
