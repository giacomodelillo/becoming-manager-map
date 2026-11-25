import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { adminEnabled, COOKIE_NAME, isAdminToken } from "@/lib/expo/server/auth";
import { MAX_MEDIA_BYTES, saveMedia } from "@/lib/expo/server/media";

/** Caricamento di logo o immagine: il corpo della richiesta è il file stesso. Solo area riservata. */
export async function POST(request: NextRequest) {
  const jar = await cookies();
  if (!adminEnabled() || !isAdminToken(jar.get(COOKIE_NAME)?.value)) {
    return NextResponse.json({ message: "Sessione scaduta: inserisci di nuovo il PIN" }, { status: 401 });
  }

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_MEDIA_BYTES) {
    return NextResponse.json({ message: "File troppo grande (massimo 3 MB)" }, { status: 413 });
  }
  const buf = Buffer.from(await request.arrayBuffer());
  if (buf.length === 0 || buf.length > MAX_MEDIA_BYTES) {
    return NextResponse.json({ message: "File vuoto o troppo grande (massimo 3 MB)" }, { status: 413 });
  }

  const file = await saveMedia(buf);
  if (!file) {
    return NextResponse.json({ message: "Formato non valido: usa PNG, JPG, WebP o SVG" }, { status: 400 });
  }
  return NextResponse.json({ file });
}
