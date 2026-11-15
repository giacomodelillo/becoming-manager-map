"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Sul server restituisce false (layout mobile): al primo render sul client
 * React si riallinea senza errori di hydration.
 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
