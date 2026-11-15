import { AdminPanel } from "@/components/admin/admin-panel";
import { expoFontVars } from "@/lib/expo/fonts";

export function AdminDetail() {
  return (
    <div
      className={`${expoFontVars} expo-brand min-h-full bg-[var(--ink)] px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6 text-[var(--paper)] lg:pt-28`}
    >
      <AdminPanel />
    </div>
  );
}
