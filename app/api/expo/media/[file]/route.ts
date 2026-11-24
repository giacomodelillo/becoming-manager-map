import { connection, NextResponse, type NextRequest } from "next/server";
import { CONTENT_TYPES, readMedia } from "@/lib/expo/server/media";

/** Pubblico: serve i file caricati. I nomi sono casuali, quindi si possono tenere in cache a lungo. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  await connection();
  const { file } = await params;
  const media = await readMedia(file);
  if (!media) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(new Uint8Array(media.buf), {
    headers: {
      "Content-Type": CONTENT_TYPES[media.ext],
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      // se qualcuno apre un SVG direttamente, niente script
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
