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
  detailOpen: boolean;
  setDetailOpen: (open: boolean) => void;
  toggleDetail: () => void;
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
  const toggleDetail = useCallback(() => setDetailOpen((v) => !v), []);

  const value = useMemo(
    () => ({ detailOpen, setDetailOpen, toggleDetail }),
    [detailOpen, toggleDetail],
  );

  return (
    <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
  );
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used inside <ShellProvider>");
  return ctx;
}
