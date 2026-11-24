// Scarica i loghi dei link Google Drive del file Excel e li collega alle aziende.
// Da lanciare sul computer che ha internet, nella radice del progetto LOCALE:
//   node scripts/fetch-logos.mjs            (salta chi ha già il logo)
//   node scripts/fetch-logos.mjs --force    (riscarica tutto)
// Funziona solo per i file Drive condivisi con "chiunque abbia il link".
// Quello che non riesce (non pubblico, PDF, AI, più di 3 MB) viene elencato: caricalo da /admin.
import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const force = process.argv.includes("--force");
const dataFile = process.env.EXPO_DATA_FILE ?? path.join(process.cwd(), "data", "expo.json");
const mediaDir = process.env.EXPO_MEDIA_DIR ?? path.join(process.cwd(), "data", "media");
const sources = JSON.parse(await readFile(path.join(process.cwd(), "scripts", "logo-sources.json"), "utf8"));
const saved = JSON.parse(await readFile(dataFile, "utf8"));

function sniff(buf) {
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length > 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  const head = buf.subarray(0, 1024).toString("utf8").replace(/^\uFEFF/, "").trimStart();
  if ((head.startsWith("<svg") || head.startsWith("<?xml")) && head.includes("<svg") && !/<script|\son\w+\s*=|javascript:/i.test(buf.toString("utf8"))) return "svg";
  return null;
}

const kinds = [["light", "logo", "chiaro"], ["dark", "logoDark", "scuro"]];
const problems = [];
let done = 0;

await mkdir(mediaDir, { recursive: true });
for (const area of saved.config.areas) {
  for (const company of area.companies) {
    const src = sources[company.key];
    if (!src) continue;
    for (const [kind, field, label] of kinds) {
      const id = src[kind];
      if (!id || (company[field] && !force)) continue;
      try {
        const res = await fetch(`https://drive.google.com/uc?export=download&id=${id}`, { redirect: "follow" });
        const buf = Buffer.from(await res.arrayBuffer());
        const ext = res.ok ? sniff(buf) : null;
        if (!ext) { problems.push(`${company.name} (logo ${label}): file non pubblico o non è PNG/JPG/WebP/SVG`); continue; }
        if (buf.length > 3 * 1024 * 1024) { problems.push(`${company.name} (logo ${label}): più di 3 MB, caricalo da /admin`); continue; }
        const file = `${randomBytes(6).toString("hex")}.${ext}`;
        await writeFile(path.join(mediaDir, file), buf);
        company[field] = file;
        done += 1;
      } catch (e) {
        problems.push(`${company.name} (logo ${label}): ${e instanceof Error ? e.message : "errore di rete"}`);
      }
    }
  }
}

saved.version = (saved.version ?? 1) + 1; // gli schermi si accorgono della modifica
await writeFile(dataFile, JSON.stringify(saved, null, 2), "utf8");
console.log(`Loghi collegati: ${done}`);
if (problems.length) console.log(`Da sistemare a mano (${problems.length}):\n- ${problems.join("\n- ")}`);
