import type { ReactNode } from "react";

export function MainStage({ children }: { children: ReactNode }) {
  return (
    <main className="order-1 min-w-0 p-2 lg:order-2 lg:h-full">
      <div className="bg-stage relative h-full min-h-[calc(100dvh-1rem)] overflow-clip rounded-3xl">
        <div className="h-full overflow-y-auto">{children}</div>
      </div>
    </main>
  );
}
