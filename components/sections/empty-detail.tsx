import { DetailBreadcrumb } from "@/components/shell/detail-breadcrumb";

export function EmptyDetail() {
  return (
    <div>
      <DetailBreadcrumb items={[{ label: "Horizon" }]} />
      <div className="my-[9vh] space-y-4">
        <h2 className="text-3xl font-medium tracking-tighter">
          Nessuna selezione
        </h2>
        <p className="text-foreground/70 max-w-xl leading-relaxed">
          Clicca un elemento nello stage per vederne qui i dettagli.
        </p>
      </div>
    </div>
  );
}
