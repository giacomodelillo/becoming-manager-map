"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { TransformComponent, TransformWrapper, useControls } from "react-zoom-pan-pinch";
import { cn } from "@/lib/utils";
import { BASE_NAME_PX } from "@/lib/expo/display";
import { useExpoState } from "@/lib/expo/store";
import { MapControls } from "./map-controls";

const DESKTOP = "(min-width: 1024px)";
const SIDE_PAD = 16;

type Props = {
  /** La mappa da mostrare (dentro zoom/pan) */
  children: ReactNode;
  /** Elementi fissi sopra la mappa, dentro il contesto di zoom (es. barra passi) */
  overlay?: ReactNode;
  /** La mappa si riadatta al contenitore quando questo valore cambia */
  refitKey?: string;
  /** Grandezza minima dei nomi dei booth sullo schermo, in px. 0 = si vede tutta la mappa */
  minTextPx?: number;
};

function Viewport({ children, overlay, refitKey, minTextPx = 0 }: Props) {
  const controls = useControls();
  const controlsRef = useRef(controls);
  const minRef = useRef(minTextPx);
  useEffect(() => {
    controlsRef.current = controls;
    minRef.current = minTextPx;
  });

  const { viewNonce } = useExpoState();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  /**
   * Vista iniziale. Con minTextPx = 0 la mappa si adatta tutta al contenitore.
   * Altrimenti lo zoom non scende sotto quello che dà testi della grandezza richiesta:
   * la mappa può uscire dallo schermo e si ancora in basso a sinistra, dall'Ingresso.
   * `all` = ignora il minimo e mostra tutta la mappa (pulsante dei controlli).
   */
  const fit = useCallback((animationMs = 0, all = false) => {
    const box = containerRef.current;
    const content = contentRef.current;
    if (!box || !content) return;
    const cw = box.clientWidth;
    const ch = box.clientHeight;
    const mw = content.offsetWidth;
    const mh = content.offsetHeight;
    if (!cw || !ch || !mw || !mh) return;

    const desktop = window.matchMedia(DESKTOP).matches;
    const padTop = desktop ? 112 : 96;
    const padBottom = desktop ? 96 : 168;
    const freeH = Math.max(ch - padTop - padBottom, 120);

    const fitScale = Math.min((cw - SIDE_PAD * 2) / mw, freeH / mh);
    const base = Math.min(Math.max(fitScale, 0.35), 1.2);
    const floor = !all && minRef.current > 0 ? minRef.current / BASE_NAME_PX : 0;

    let scale = base;
    let x = (cw - mw * base) / 2;
    let y = padTop + (freeH - mh * base) / 2;
    if (floor > base) {
      scale = Math.min(floor, 4);
      x = mw * scale <= cw ? (cw - mw * scale) / 2 : SIDE_PAD;
      y = mh * scale <= freeH ? padTop + (freeH - mh * scale) / 2 : ch - padBottom - mh * scale;
    }

    controlsRef.current.setTransform(x, y, scale, animationMs, "easeOut");
    setReady(true);
  }, []);

  // Si riadatta quando cambia la dimensione dello stage (es. colonna dettaglio che apre/chiude)
  useEffect(() => {
    const box = containerRef.current;
    if (!box) return;
    const observer = new ResizeObserver(() => fit(0));
    observer.observe(box);
    return () => observer.disconnect();
  }, [fit]);

  // ...quando cambia la forma della mappa o la grandezza scelta in area riservata, e dopo un reset del totem
  useEffect(() => {
    const id = requestAnimationFrame(() => fit(0));
    return () => cancelAnimationFrame(id);
  }, [refitKey, minTextPx, viewNonce, fit]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "expo-map relative h-full w-full touch-none select-none overflow-hidden overscroll-contain transition-opacity duration-200",
        ready ? "opacity-100" : "opacity-0",
      )}
    >
      <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
        <div ref={contentRef}>{children}</div>
      </TransformComponent>
      <MapControls onFit={() => fit(300, true)} />
      {overlay}
    </div>
  );
}

export function MapCanvas(props: Props) {
  return (
    <TransformWrapper
      initialScale={1}
      minScale={0.3}
      maxScale={4}
      limitToBounds={false}
      doubleClick={{ disabled: true }}
      wheel={{ step: 0.08 }}
      panning={{ velocityDisabled: true }}
    >
      <Viewport {...props} />
    </TransformWrapper>
  );
}
