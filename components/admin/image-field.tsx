"use client";

import { useRef, useState } from "react";
import { uploadMedia } from "@/lib/expo/admin-api";
import { prepareImage } from "@/lib/expo/images";
import { mediaUrl } from "@/lib/expo/media";
import { Btn } from "./fields";

/** Carica, sostituisce o rimuove un'immagine. Le foto vengono ridotte prima dell'invio. */
export function ImageField({
  label,
  hint,
  value,
  maxSide,
  onChange,
}: {
  label: string;
  hint?: string;
  value?: string;
  maxSide: number;
  onChange: (file: string | undefined) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await prepareImage(file, maxSide);
      const result = await uploadMedia(blob);
      if (result.ok) onChange(result.file);
      else setError(result.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Caricamento non riuscito");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">{label}</p>
      {hint && <p className="text-xs text-white/45">{hint}</p>}
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mediaUrl(value)} alt="" className="max-h-32 border border-white/20 bg-white object-contain" />
      )}
      <div className="flex flex-wrap gap-2">
        <Btn variant="ghost" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? "Carico…" : value ? "Sostituisci" : "Carica"}
        </Btn>
        {value && (
          <Btn variant="danger" disabled={busy} onClick={() => onChange(undefined)}>
            Rimuovi
          </Btn>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      {error && (
        <p role="alert" className="text-sm font-semibold text-[#ff7aa6]">
          {error}
        </p>
      )}
    </div>
  );
}
