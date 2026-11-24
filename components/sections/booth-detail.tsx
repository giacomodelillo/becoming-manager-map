import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BoothDetailBody } from "@/components/expo/booth-detail-body";
import { PanelScale } from "@/components/expo/panel-scale";
import { StepNav } from "@/components/expo/step-nav";
import { expoFontVars } from "@/lib/expo/fonts";

export function BoothDetail({ boothId }: { boothId: number }) {
  return (
    <div
      className={`${expoFontVars} expo-brand min-h-full bg-[var(--ink)] px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6 text-[var(--paper)] lg:pt-28`}
    >
      <PanelScale className="space-y-8">
        <Link
          href="/expo"
          className="inline-flex min-h-12 items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70 active:text-white"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
          Tutte le aziende
        </Link>
        <BoothDetailBody boothId={boothId} />
        <StepNav />
      </PanelScale>
    </div>
  );
}
