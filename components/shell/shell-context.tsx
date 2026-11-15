"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ShellContextValue = {
  /** Desktop: colonna laterale aperta. */
  detailOpen: boolean;
  setDetailOpen: (open: boolean) => void;
  toggleDetail: () => void;
  /** Mobile: pannello che sale dal basso. Parte sempre chiuso. */
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
  /** Apre il dettaglio su entrambi i layout. */
  openDetail: () => void;
};

const ShellContext = createContext<ShellContextValue | null>(null);

export function ShellProvider({
  children,
  defaultDetailOpen = false,
}: {
  children: ReactNode;
  defaultDetailOpen?: boolean;
}) {
  const [detailOpen, setDetailOpen] = useState(defaultDetailOpen);
  const [sheetOpen, setSheetOpen] = useState(false);

  const toggleDetail = useCallback(() => setDetailOpen((v) => !v), []);
  const openDetail = useCallback(() => {
    setDetailOpen(true);
    setSheetOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      detailOpen,
      setDetailOpen,
      toggleDetail,
      sheetOpen,
      setSheetOpen,
      openDetail,
    }),
    [detailOpen, sheetOpen, toggleDetail, openDetail],
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used inside <ShellProvider>");
  return ctx;
}
