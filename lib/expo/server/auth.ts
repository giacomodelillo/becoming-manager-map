import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const COOKIE_NAME = "expo_admin";
export const SESSION_SECONDS = 60 * 60 * 8;

const pin = () => process.env.EXPO_ADMIN_PIN?.trim() ?? "";

/** Il PIN fisso sta in EXPO_ADMIN_PIN (.env.local): da 6 a 12 cifre. */
export const adminConfigured = () => /^\d{6,12}$/.test(pin());

/** EXPO_ADMIN_DISABLED=1 spegne del tutto l'area riservata (es. sull'istanza del totem). */
export const adminEnabled = () => process.env.EXPO_ADMIN_DISABLED !== "1";

const digest = (value: string) => createHash("sha256").update(value).digest();
const safeEqual = (a: Buffer, b: Buffer) => a.length === b.length && timingSafeEqual(a, b);

export function checkPin(input: string): boolean {
  return adminConfigured() && safeEqual(digest(input), digest(pin()));
}

/** Valore del cookie di sessione: cambia se cambia il PIN (o EXPO_ADMIN_SECRET). */
export function sessionToken(): string {
  return createHmac("sha256", process.env.EXPO_ADMIN_SECRET ?? "expo-admin")
    .update(pin())
    .digest("hex");
}

export function isAdminToken(value: string | undefined): boolean {
  if (!value || !adminEnabled() || !adminConfigured()) return false;
  return safeEqual(digest(value), digest(sessionToken()));
}
