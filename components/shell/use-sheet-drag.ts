"use client";

import { useRef, useState, type PointerEvent } from "react";

const TAP_SLOP_PX = 6; // sotto questo spostamento è un tap, non un trascinamento
const CLOSE_DISTANCE_PX = 120; // trascinato oltre: chiude
const CLOSE_MIN_PX = 24; // distanza minima per far valere la velocità
const CLOSE_VELOCITY = 0.5; // px/ms: uno swipe veloce chiude anche se corto

type Drag = {
  startY: number;
  lastY: number;
  lastT: number;
  velocity: number;
  moved: number;
};

/**
 * Trascinamento verso il basso del pannello mobile.
 * `offset` è null quando non si sta trascinando (così torna a comandare il CSS).
 */
export function useSheetDrag({ onClose }: { onClose: () => void }) {
  const [offset, setOffset] = useState<number | null>(null);
  const drag = useRef<Drag | null>(null);

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      startY: e.clientY,
      lastY: e.clientY,
      lastT: e.timeStamp,
      velocity: 0,
      moved: 0,
    };
    setOffset(0);
  };

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d) return;

    const dt = e.timeStamp - d.lastT;
    if (dt > 0) d.velocity = (e.clientY - d.lastY) / dt;
    d.lastY = e.clientY;
    d.lastT = e.timeStamp;
    d.moved = Math.max(d.moved, Math.abs(e.clientY - d.startY));

    // verso l'alto non si va oltre la posizione aperta
    setOffset(Math.max(0, e.clientY - d.startY));
  };

  const finish = (commit: boolean) => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    setOffset(null);
    if (!commit) return;

    const dy = d.lastY - d.startY;
    const isTap = d.moved < TAP_SLOP_PX;
    const isFlick = dy > CLOSE_MIN_PX && d.velocity > CLOSE_VELOCITY;
    if (isTap || dy > CLOSE_DISTANCE_PX || isFlick) onClose();
  };

  return {
    offset,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: () => finish(true),
      onPointerCancel: () => finish(false),
    },
  };
}
