import type { ReactNode } from "react";
import { expoFontVars } from "@/lib/expo/fonts";
import "../expo/expo-map.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className={`${expoFontVars} contents`}>{children}</div>;
}
