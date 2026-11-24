import { redirect } from "next/navigation";

/** Online c'è solo la mappa: la home porta lì. */
export default function Page() {
  redirect("/expo");
}
