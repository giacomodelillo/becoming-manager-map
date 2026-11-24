import { cn } from "@/lib/utils";
import { mediaUrl } from "@/lib/expo/media";
import type { Company } from "@/lib/expo/types";

/** Logo per il pannello scuro: quello per sfondo scuro così com'è, altrimenti quello chiaro in un riquadro bianco. */
export function CompanyLogo({
  company,
  className,
}: {
  company: Pick<Company, "name" | "logo" | "logoDark">;
  className?: string;
}) {
  if (company.logoDark) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={mediaUrl(company.logoDark)} alt={`Logo ${company.name}`} className={cn("object-contain", className)} />;
  }
  if (company.logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={mediaUrl(company.logo)} alt={`Logo ${company.name}`} className={cn("bg-white object-contain p-1", className)} />;
  }
  return null;
}
