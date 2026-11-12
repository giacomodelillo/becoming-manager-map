import { connection } from "next/server";

/** Orologio del server, usato dai client per calcolare lo scarto dal proprio. */
export async function GET() {
  await connection();
  return Response.json(
    { now: Date.now() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
