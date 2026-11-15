/** Modalità totem: `NEXT_PUBLIC_KIOSK=1` in `.env.local` (fissata alla build). */
export const KIOSK = process.env.NEXT_PUBLIC_KIOSK === "1";

/** Secondi senza tocchi prima del reset, in millisecondi. */
export const IDLE_RESET_MS = 60_000;
