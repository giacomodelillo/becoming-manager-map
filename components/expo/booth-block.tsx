"use client";

import { useRef, type CSSProperties } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Company } from "@/lib/expo/types";

type Props = {
  company: Company;
  /** booth aperto nel dettaglio (URL) */
  selected: boolean;
  /** indice 0-based nel percorso dello studente, null se non c'è percorso */
  step: number | null;
  /** passo corrente del percorso */
  current: boolean;
  /** passo già fatto */
  visited: boolean;
  /** ritardo dell'animazione di ingresso, in ms */
  delay: number;
  onOpen: (boothId: number) => void;
};

const DRAG_SLOP_PX = 8;

export function BoothBlock({ company, selected, step, current, visited, delay, onOpen }: Props) {
  const down = useRef<{ x: number; y: number } | null>(null);
  const state = current ? "current" : step === null ? "idle" : visited ? "visited" : "route";

  return (
    <Link
      id={`booth-${company.id}`}
      href={`/expo/${company.id}`}
      draggable={false}
      className="expo-pod"
      data-state={state}
      style={{ "--d": `${delay}ms` } as CSSProperties}
      aria-label={`Booth ${company.id}: ${company.name}`}
      aria-current={selected ? "page" : undefined}
      onPointerDown={(e) => {
        down.current = { x: e.clientX, y: e.clientY };
      }}
      onClick={(e) => {
        const d = down.current;
        // dopo un trascinamento della mappa non è un tap sul booth
        if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > DRAG_SLOP_PX) {
          e.preventDefault();
          return;
        }
        onOpen(company.id);
      }}
    >
      {current && (
        <MapPin aria-hidden strokeWidth={1.5} className="expo-pin size-7 fill-[#d43d74] text-[#11071f]" />
      )}
      <span className="expo-pod-num">{company.id}</span>
      <span className="expo-pod-name">{company.name}</span>
      {step !== null && <span className="expo-pod-step">{step + 1}°</span>}
    </Link>
  );
}
