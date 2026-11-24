import type { FairConfig, HistoryItem } from "./types";

async function readMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string };
    return body.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getAuth(): Promise<{ admin: boolean; configured: boolean; enabled: boolean }> {
  const res = await fetch("/api/expo/auth", { cache: "no-store" });
  if (!res.ok) throw new Error("auth");
  return res.json();
}

export async function login(pin: string): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const res = await fetch("/api/expo/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (res.ok) return { ok: true };
    return { ok: false, message: await readMessage(res, "PIN non valido") };
  } catch {
    return { ok: false, message: "Server non raggiungibile" };
  }
}

export async function logout(): Promise<void> {
  await fetch("/api/expo/auth", { method: "DELETE" }).catch(() => undefined);
}

export type SaveResult =
  | { ok: true; version: number; config: FairConfig }
  | { ok: false; status: number; message: string };

export async function saveConfig(config: FairConfig, baseVersion: number): Promise<SaveResult> {
  try {
    const res = await fetch("/api/expo/data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config, baseVersion }),
    });
    if (res.ok) {
      const body = (await res.json()) as { version: number; config: FairConfig };
      return { ok: true, ...body };
    }
    return { ok: false, status: res.status, message: await readMessage(res, "Salvataggio non riuscito") };
  } catch {
    return { ok: false, status: 0, message: "Server non raggiungibile" };
  }
}

export async function listHistory(): Promise<HistoryItem[]> {
  const res = await fetch("/api/expo/history", { cache: "no-store" });
  if (!res.ok) throw new Error(await readMessage(res, "Impossibile leggere le versioni"));
  return ((await res.json()) as { items: HistoryItem[] }).items;
}

/** Restituisce la configurazione di una versione salvata (da validare prima dell'uso). */
export async function loadHistory(version: number): Promise<unknown> {
  const res = await fetch(`/api/expo/history?version=${version}`, { cache: "no-store" });
  if (!res.ok) throw new Error(await readMessage(res, "Versione non trovata"));
  return ((await res.json()) as { config: unknown }).config;
}

export async function uploadMedia(
  blob: Blob,
): Promise<{ ok: true; file: string } | { ok: false; message: string }> {
  try {
    const res = await fetch("/api/expo/media", {
      method: "POST",
      headers: { "Content-Type": blob.type || "application/octet-stream" },
      body: blob,
    });
    if (res.ok) return { ok: true, file: ((await res.json()) as { file: string }).file };
    return { ok: false, message: await readMessage(res, "Caricamento non riuscito") };
  } catch {
    return { ok: false, message: "Server non raggiungibile" };
  }
}
