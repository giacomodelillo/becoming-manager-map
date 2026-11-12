import { connection } from "next/server";
import { parseAction } from "@/lib/timer/logic";
import { timerStore } from "@/lib/timer/store";

/** Stream SSE: invia lo stato a ogni modifica e quando cambia il numero di dispositivi. */
export async function GET(request: Request) {
  await connection();

  const encoder = new TextEncoder();
  let cleanup = () => {};

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const write = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          cleanup();
        }
      };
      const send = () =>
        write(`data: ${JSON.stringify(timerStore.snapshot())}\n\n`);

      const disconnect = timerStore.connect(send);
      // commento SSE periodico: tiene viva la connessione attraverso router e proxy
      const heartbeat = setInterval(() => write(": ping\n\n"), 15_000);

      cleanup = () => {
        clearInterval(heartbeat);
        disconnect();
        try {
          controller.close();
        } catch {
          /* già chiuso */
        }
      };
      request.signal.addEventListener("abort", cleanup, { once: true });
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      // no-transform: evita che la compressione di Next metta in buffer lo stream
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

/** Comandi: { action: { type: "start" | "pause" | ... }, pin?: string } */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    action?: unknown;
    pin?: unknown;
  } | null;

  const requiredPin = process.env.TIMER_PIN;
  if (requiredPin && body?.pin !== requiredPin) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const action = parseAction(body?.action);
  if (!action) {
    return Response.json({ error: "invalid_action" }, { status: 400 });
  }

  const state = timerStore.dispatch(action);
  return Response.json({ state });
}
