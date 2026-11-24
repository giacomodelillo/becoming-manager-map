import { redirect } from "next/navigation";
import { AdminStage } from "@/components/sections/admin-stage";
import { KIOSK } from "@/lib/expo/kiosk";

/** Stage: anteprima della mappa. Le impostazioni stanno nello slot @detail/admin. Sul totem non esiste. */
export default function Page() {
  if (KIOSK) redirect("/expo");
  return <AdminStage />;
}
