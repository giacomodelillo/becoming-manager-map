import Link from "next/link";
import { CompanyList } from "@/components/expo/company-list";
import { MapLegend } from "@/components/expo/map-legend";
import { RouteList } from "@/components/expo/route-list";
import { StepNav } from "@/components/expo/step-nav";
import { StudentPicker } from "@/components/expo/student-picker";
import { expoFontVars } from "@/lib/expo/fonts";
import { KIOSK } from "@/lib/expo/kiosk";

export function ExpoDetail() {
  return (
    <div
      className={`${expoFontVars} expo-brand min-h-full space-y-10 bg-[var(--ink)] px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6 text-[var(--paper)] lg:pt-28`}
    >
      <header className="space-y-2">
        <p className="expo-eyebrow">Becoming Manager</p>
        <h1 className="expo-serif text-4xl leading-tight">Costruisci il tuo percorso</h1>
        <p className="text-base text-[var(--paper)]/75">
          Scegli il tuo numero di partenza o tocca un&apos;azienda sulla mappa.
        </p>
      </header>
      <StudentPicker />
      <StepNav />
      <RouteList />
      <CompanyList />
      <MapLegend />
      {/* sul totem l'area riservata non si raggiunge dal pannello */}
      {!KIOSK && (
        <footer className="border-t border-white/15 pt-4">
          <Link
            href="/admin"
            className="inline-flex min-h-12 items-center text-xs font-semibold uppercase tracking-[0.18em] text-white/50 active:text-white"
          >
            Area riservata
          </Link>
        </footer>
      )}
    </div>
  );
}
