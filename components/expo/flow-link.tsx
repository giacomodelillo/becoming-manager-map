export type LinkDir = "up" | "down" | "right";

/** Freccia di flusso. `active` = tratto del percorso dello studente (si disegna una volta). */
export function FlowLink({ dir, active }: { dir: LinkDir; active: boolean }) {
  const horizontal = dir === "right";
  return (
    <svg
      aria-hidden
      className="expo-link shrink-0"
      data-active={active}
      width={horizontal ? 56 : 24}
      height={horizontal ? 24 : 40}
      viewBox={horizontal ? "0 0 56 24" : "0 0 24 40"}
    >
      {dir === "up" && (
        <>
          <path className="expo-link-line" pathLength={1} d="M12 38 V10" />
          <path className="expo-link-head" d="M6 17 L12 9 L18 17" />
        </>
      )}
      {dir === "down" && (
        <>
          <path className="expo-link-line" pathLength={1} d="M12 2 V30" />
          <path className="expo-link-head" d="M6 23 L12 31 L18 23" />
        </>
      )}
      {dir === "right" && (
        <>
          <path className="expo-link-line" pathLength={1} d="M4 12 H42" />
          <path className="expo-link-head" d="M35 6 L43 12 L35 18" />
        </>
      )}
    </svg>
  );
}
