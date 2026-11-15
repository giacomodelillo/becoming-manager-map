import { Suspense, type ReactNode } from "react";
import { ExpoStage } from "@/components/sections/expo-stage";
import { expoFontVars } from "@/lib/expo/fonts";
import "./expo-map.css";

export default function ExpoLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${expoFontVars} contents`}>
      <Suspense fallback={null}>
        <ExpoStage />
      </Suspense>
      {children}
    </div>
  );
}
