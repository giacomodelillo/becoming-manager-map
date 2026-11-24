import { redirect } from "next/navigation";
import { AdminDetail } from "@/components/sections/admin-detail";
import { KIOSK } from "@/lib/expo/kiosk";

export default function Page() {
  if (KIOSK) redirect("/expo");
  return <AdminDetail />;
}
