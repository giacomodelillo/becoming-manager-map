"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useShell } from "@/components/shell/shell-context";
import { IDLE_RESET_MS, KIOSK } from "@/lib/expo/kiosk";
import { expoStore } from "@/lib/expo/store";

/** Solo in modalità totem: dopo IDLE_RESET_MS senza tocchi azzera lo store e torna a /expo. */
export function useIdleReset() {
  const router = useRouter();
  const { setDetailOpen, setSheetOpen } = useShell();

  const latest = useRef({ router, setDetailOpen, setSheetOpen });
  useEffect(() => {
    latest.current = { router, setDetailOpen, setSheetOpen };
  });

  useEffect(() => {
    if (!KIOSK) return;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const onIdle = () => {
      const { router, setDetailOpen, setSheetOpen } = latest.current;
      expoStore.reset();
      setSheetOpen(false);
      setDetailOpen(true);
      router.push("/expo");
    };
    const arm = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(onIdle, IDLE_RESET_MS);
    };

    const events = ["pointerdown", "pointermove", "touchstart", "keydown", "wheel"] as const;
    events.forEach((e) => window.addEventListener(e, arm, { passive: true }));
    arm();

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, arm));
    };
  }, []);
}
