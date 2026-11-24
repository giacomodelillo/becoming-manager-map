import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, isAdminToken } from "@/lib/expo/server/auth";
import { listHistory, readHistory } from "@/lib/expo/server/store";

const NO_STORE = { "Cache-Control": "no-store" };

/** Solo area riservata: elenco delle ultime versioni, oppure una versione con ?version=N. */
export async function GET(request: NextRequest) {
  const jar = await cookies();
  if (!isAdminToken(jar.get(COOKIE_NAME)?.value)) {
    return NextResponse.json({ message: "Sessione scaduta: inserisci di nuovo il PIN" }, { status: 401 });
  }

  const version = request.nextUrl.searchParams.get("version");
  if (version !== null) {
    const entry = await readHistory(Number(version));
    if (!entry) return NextResponse.json({ message: "Versione non trovata" }, { status: 404 });
    return NextResponse.json(entry, { headers: NO_STORE });
  }
  return NextResponse.json({ items: await listHistory() }, { headers: NO_STORE });
}
