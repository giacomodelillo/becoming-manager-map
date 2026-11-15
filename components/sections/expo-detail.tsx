import { CompanyList } from "@/components/expo/company-list";
import { MapLegend } from "@/components/expo/map-legend";
import { RouteList } from "@/components/expo/route-list";
import { StepNav } from "@/components/expo/step-nav";
import { StudentPicker } from "@/components/expo/student-picker";
import { expoFontVars } from "@/lib/expo/fonts";

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
    </div>
  );
}
