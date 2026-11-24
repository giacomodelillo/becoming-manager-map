import { cookies } from "next/headers";
import { connection, NextResponse, type NextRequest } from "next/server";
import {
  adminConfigured,
  adminEnabled,
  checkPin,
  COOKIE_NAME,
  isAdminToken,
  SESSION_SECONDS,
  sessionToken,
} from "@/lib/expo/server/auth";

const MAX_ATTEMPTS = 5;

type Attempt = { count: number; strikes: number; lockedUntil: number };
const g = globalThis as unknown as { __expoAttempts?: Map<string, Attempt> };
const attempts = (g.__expoAttempts ??= new Map());

export async function GET() {
  await connection();
  const jar = await cookies();
  return NextResponse.json(
    {
      enabled: adminEnabled(),
      configured: adminConfigured(),
      admin: isAdminToken(jar.get(COOKIE_NAME)?.value),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  if (!adminEnabled()) {
    return NextResponse.json({ message: "L'area riservata è disattivata su questo server" }, { status: 403 });
  }
  if (!adminConfigured()) {
    return NextResponse.json(
      { message: "PIN non configurato sul server (EXPO_ADMIN_PIN, da 6 a 12 cifre)" },
      { status: 503 },
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const record = attempts.get(ip) ?? { count: 0, strikes: 0, lockedUntil: 0 };
  if (record.lockedUntil > now) {
    const seconds = Math.ceil((record.lockedUntil - now) / 1000);
    return NextResponse.json({ message: `Troppi tentativi. Riprova tra ${seconds} secondi.` }, { status: 429 });
  }

  let pin = "";
  try {
    const body = (await request.json()) as { pin?: unknown };
    if (typeof body.pin === "string") pin = body.pin;
  } catch {
    /* PIN vuoto: sarà rifiutato sotto */
  }

  if (!checkPin(pin)) {
    record.count += 1;
    if (record.count >= MAX_ATTEMPTS) {
      // 1 minuto, poi 5, poi 15 (massimo) a ogni nuova serie di errori
      record.strikes += 1;
      record.count = 0;
      record.lockedUntil = now + Math.min(60_000 * 5 ** (record.strikes - 1), 15 * 60_000);
    }
    attempts.set(ip, record);
    return NextResponse.json({ message: "PIN errato" }, { status: 401 });
  }

  attempts.delete(ip);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, sessionToken(), {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_SECONDS,
    secure: process.env.EXPO_COOKIE_SECURE === "1",
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, "", { httpOnly: true, sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
