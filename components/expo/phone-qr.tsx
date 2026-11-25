"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useFairView } from "@/lib/expo/data-store";
import { useExpoState } from "@/lib/expo/store";

const LOCAL = /^https?:\/\/(localhost|127\.|0\.0\.0\.0|\[::1\])/i;

/** QR per portare il percorso sul telefono. Solo su schermi grandi (il totem, il computer). */
export function PhoneQr() {
  const { start } = useExpoState();
  const view = useFairView();
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (start === 0 || !view) return null;
  const base = (view.display.publicUrl || origin).replace(/\/+$/, "");
  if (!base) return null;
  const unreachable = LOCAL.test(base);
  const url = `${base}/expo?s=${start}`;

  return (
    <section aria-labelledby="qr-title" className="hidden space-y-3 lg:block">
      <div className="space-y-1">
        <p className="expo-eyebrow">Telefono</p>
        <h2 id="qr-title" className="expo-serif text-2xl">
          Porta il percorso con te
        </h2>
      </div>
      {unreachable ? (
        <p className="text-sm text-white/70">
          Questo indirizzo non è raggiungibile dai telefoni. Chiedi a chi
          gestisce l&apos;evento di inserire l&apos;indirizzo pubblico
          nell&apos;area riservata.
        </p>
      ) : (
        <div className="flex items-center gap-4">
          <div className="shrink-0 bg-white p-3">
            <QRCodeSVG
              value={url}
              size={152}
              level="M"
              fgColor="#11071f"
              bgColor="#ffffff"
            />
          </div>
          <p className="text-sm text-white/75">
            Inquadra il codice: sul telefono trovi il tuo percorso, partendo dalla postazione {start}.
          </p>
        </div>
      )}
    </section>
  );
}
