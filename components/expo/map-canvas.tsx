"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TransformComponent, TransformWrapper, useControls } from "react-zoom-pan-pinch";
import { cn } from "@/lib/utils";
import { FlowMap } from "./flow-map";
import { FocusOnStep } from "./focus-on-step";
import { MapControls } from "./map-controls";
import { StepControls } from "./step-controls";

const DESKTOP = "(min-width: 1024px)";
const SIDE_PAD = 16;

function Viewport({ selectedId }: { selectedId: number | null }) {
  const controls = useControls();
  const controlsRef = useRef(controls);
  useEffect(() => {
    controlsRef.current = controls;
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  /** Adatta la mappa al contenitore, lasciando spazio a toolbar (sopra) e controlli (sotto). */
  const fit = useCallback((animationMs = 0) => {
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

    const scale = Math.min(
      Math.max(Math.min((cw - SIDE_PAD * 2) / mw, freeH / mh), 0.35),
      1.2,
    );
    const x = (cw - mw * scale) / 2;
    const y = padTop + (freeH - mh * scale) / 2;

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

  return (
    <div
      ref={containerRef}
      className={cn(
        "expo-map relative h-full w-full touch-none select-none overflow-hidden overscroll-contain transition-opacity duration-200",
        ready ? "opacity-100" : "opacity-0",
      )}
    >
      <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
        <div ref={contentRef}>
          <FlowMap selectedId={selectedId} />
        </div>
      </TransformComponent>
      <MapControls onFit={() => fit(300)} />
      <StepControls />
      <FocusOnStep />
    </div>
  );
}

export function MapCanvas({ selectedId }: { selectedId: number | null }) {
  return (
    <TransformWrapper
      initialScale={1}
      minScale={0.3}
      maxScale={3}
      limitToBounds={false}
      doubleClick={{ disabled: true }}
      wheel={{ step: 0.08 }}
      panning={{ velocityDisabled: true }}
    >
      <Viewport selectedId={selectedId} />
    </TransformWrapper>
  );
}
