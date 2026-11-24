import { cookies } from "next/headers";
import { connection, NextResponse, type NextRequest } from "next/server";
import { adminEnabled, COOKIE_NAME, isAdminToken } from "@/lib/expo/server/auth";
import { readFair, VersionConflictError, writeFair } from "@/lib/expo/server/store";
import { parseFairConfig } from "@/lib/expo/validate";

const NO_STORE = { "Cache-Control": "no-store" };

/** Pubblico: tutti leggono i dati della fiera. */
export async function GET() {
  await connection();
  return NextResponse.json(await readFair(), { headers: NO_STORE });
}

/** Solo con la sessione dell'area riservata. */
export async function PUT(request: NextRequest) {
  if (!adminEnabled()) {
    return NextResponse.json({ message: "L'area riservata è disattivata su questo server" }, { status: 403 });
  }
  const jar = await cookies();
  if (!isAdminToken(jar.get(COOKIE_NAME)?.value)) {
    return NextResponse.json({ message: "Sessione scaduta: inserisci di nuovo il PIN" }, { status: 401 });
  }

  let body: { config?: unknown; baseVersion?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Richiesta non valida" }, { status: 400 });
  }

  let config;
  try {
    config = parseFairConfig(body.config);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Dati non validi";
    return NextResponse.json({ message }, { status: 400 });
  }

  try {
    const baseVersion = typeof body.baseVersion === "number" ? body.baseVersion : undefined;
    return NextResponse.json(await writeFair(config, baseVersion), { headers: NO_STORE });
  } catch (error) {
    if (error instanceof VersionConflictError) {
      return NextResponse.json(
        { message: "Un altro utente ha salvato nel frattempo. Ricarica i dati." },
        { status: 409 },
      );
    }
    return NextResponse.json({ message: "Impossibile scrivere i dati sul server" }, { status: 500 });
  }
}
