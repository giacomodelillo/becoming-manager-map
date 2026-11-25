"use client";

import { useRef, type CSSProperties, type MouseEvent, type PointerEvent } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Company } from "@/lib/expo/types";

type Props = {
  company: Company;
  /** booth selezionato (URL nel pubblico, azienda aperta nel modulo in admin) */
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
  /** anteprima admin: bottone che non cambia pagina */
  asButton?: boolean;
};

const DRAG_SLOP_PX = 8;

export function BoothBlock({
  company,
  selected,
  step,
  current,
  visited,
  delay,
  onOpen,
  asButton = false,
}: Props) {
  const down = useRef<{ x: number; y: number } | null>(null);
  const absent = company.hidden === true;
  const buffer = company.buffer === true;
  const state = buffer ? "buffer" : absent ? "absent" : current ? "current" : step === null ? "idle" : visited ? "visited" : "route";
  const style = { "--d": `${delay}ms` } as CSSProperties;
  const label = buffer
    ? `Booth ${company.id}: buffer, da saltare`
    : `Booth ${company.id}: ${company.name}${absent ? " (assente)" : ""}`;

  const content = (
    <>
      {current && (
        <MapPin aria-hidden strokeWidth={1.5} className="expo-pin size-7 fill-[#d43d74] text-[#11071f]" />
      )}
      <span className="expo-pod-num">{company.id}</span>
      <span className="expo-pod-name">{company.name}</span>
      {step !== null && !absent && !buffer && <span className="expo-pod-step">{step + 1}°</span>}
    </>
  );

  // Nel pubblico assenti e BUFFER non sono toccabili: resta solo il segnaposto
  if ((absent || buffer) && !asButton) {
    return (
      <div id={`booth-${company.id}`} className="expo-pod" data-state={state} style={style} aria-label={label}>
        {content}
      </div>
    );
  }

  const shared = {
    id: `booth-${company.id}`,
    draggable: false,
    className: "expo-pod",
    "data-state": state,
    style,
    "aria-label": label,
    "aria-current": selected ? (asButton ? ("true" as const) : ("page" as const)) : undefined,
    onPointerDown: (e: PointerEvent) => {
      down.current = { x: e.clientX, y: e.clientY };
    },
  };

  const handleClick = (e: MouseEvent) => {
    const d = down.current;
    // dopo un trascinamento della mappa non è un tap sul booth
    if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > DRAG_SLOP_PX) {
      e.preventDefault();
      return;
    }
    onOpen(company.id);
  };

  if (asButton) {
    return (
      <button type="button" {...shared} onClick={handleClick}>
        {content}
      </button>
    );
  }
  return (
    <Link href={`/expo/${company.id}`} {...shared} onClick={handleClick}>
      {content}
    </Link>
  );
}
