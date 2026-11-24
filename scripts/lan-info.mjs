// Mostra gli indirizzi con cui totem, TV e telefoni raggiungono questo computer sulla rete locale.
// Uso:  node scripts/lan-info.mjs        (porta diversa: PORT=3001 node scripts/lan-info.mjs)
import os from "node:os";

const port = process.env.PORT ?? 3000;
const found = Object.entries(os.networkInterfaces()).flatMap(([name, list]) =>
  (list ?? []).filter((a) => a.family === "IPv4" && !a.internal).map((a) => ({ name, ip: a.address })),
);

if (found.length === 0) {
  console.log("Nessuna rete trovata: collega il computer al Wi-Fi o al cavo.");
} else {
  console.log("Apri uno di questi indirizzi dagli altri dispositivi:");
  for (const { name, ip } of found) console.log(`  http://${ip}:${port}/expo     (${name})`);
  console.log(`  http://${os.hostname()}.local:${port}/expo   (se la rete lo supporta)`);
  console.log(`\nAvvio del server: pnpm build && pnpm exec next start -H 0.0.0.0 -p ${port}`);
}
