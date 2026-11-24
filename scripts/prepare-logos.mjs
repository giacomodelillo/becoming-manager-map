import fs from 'node:fs';
import path from 'node:path';

// Inserisci qui il percorso della cartella che contiene le sottocartelle dei loghi
const LOGOS_DIR = path.resolve(process.argv[2] || './loghi');

const VALID_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg']);

const KEYS = [
  'auxiell', 'adacta', 'pwc', 'sintesia', 'considi', 'pietro-fiorentini',
  'dab-pumps', 'moncler', 'impresoft', 'valbruna', 'beltrame', 'fincantieri',
  'ovs', 'sdg-group', 'steelco', 'relex', 'sanmarco', 'zeta', 'gottardo',
  'pillar', 'veronesi', 'aspiag', 'frigo-system'
];

// Mappatura manuale per cartelle il cui nome non contiene direttamente la chiave
const ALIASES = {
  despar: 'aspiag',
};

function resolveKey(folderName) {
  const normalized = folderName.toLowerCase().trim().replace(/\s+/g, '-');

  if (ALIASES[normalized]) return ALIASES[normalized];
  if (KEYS.includes(normalized)) return normalized;

  // Cerca se la chiave è contenuta nel nome cartella (es. "Relex Solutions" -> "relex")
  return KEYS.find((k) => normalized.includes(k)) || null;
}

if (!fs.existsSync(LOGOS_DIR)) {
  console.error(`Cartella non trovata: ${LOGOS_DIR}`);
  process.exit(1);
}

const entries = fs.readdirSync(LOGOS_DIR, { withFileTypes: true });

for (const entry of entries) {
  if (!entry.isDirectory()) continue;

  const folderName = entry.name;
  const key = resolveKey(folderName);

  if (!key) {
    console.warn(`⚠️  Cartella ignorata (nessuna chiave corrispondente): "${folderName}"`);
    continue;
  }

  const folderPath = path.join(LOGOS_DIR, folderName);
  const files = fs
    .readdirSync(folderPath)
    .filter((f) => !f.startsWith('.') && VALID_EXTS.has(path.extname(f).toLowerCase()))
    .sort();

  if (files.length === 0) {
    console.warn(`⚠️  Nessun file immagine valido in: "${folderName}"`);
    continue;
  }

  // Cerca un file che contenga "scuro" (case-insensitive), altrimenti prende il primo
  const chosenFile =
    files.find((f) => f.toLowerCase().includes('scuro')) || files[0];

  const ext = path.extname(chosenFile).toLowerCase();
  const destName = `${key}-scuro${ext}`;
  const srcPath = path.join(folderPath, chosenFile);
  const destPath = path.join(LOGOS_DIR, destName);

  fs.copyFileSync(srcPath, destPath);
  console.log(`✅ ${folderName}/${chosenFile}  ->  ${destName}`);
}
