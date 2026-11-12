import type { ConnectionStatus } from "@/lib/timer/client";
import { cn } from "@/lib/utils";

const LABEL: Record<ConnectionStatus, string> = {
  connecting: "Connessione in corso",
  online: "Sincronizzato",
  offline: "Connessione persa, riprovo",
};

const DOT: Record<ConnectionStatus, string> = {
  connecting: "bg-amber-400 animate-pulse",
  online: "bg-emerald-400",
  offline: "bg-red-500",
};

export function ConnectionBadge({
  connection,
  clients,
}: {
  connection: ConnectionStatus;
  clients: number;
}) {
  return (
    <p className="text-foreground/50 flex items-center gap-2 text-sm">
      <span className={cn("size-2 rounded-full", DOT[connection])} />
      {LABEL[connection]}
      {connection === "online" && (
        <span>
          {" "}
          · {clients} {clients === 1 ? "dispositivo" : "dispositivi"}
        </span>
      )}
    </p>
  );
}
