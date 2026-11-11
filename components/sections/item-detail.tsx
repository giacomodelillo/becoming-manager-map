import { DetailBreadcrumb } from "@/components/shell/detail-breadcrumb";
import type { Item } from "@/lib/items";

export function ItemDetail({ item }: { item: Item }) {
  return (
    <div>
      <DetailBreadcrumb
        items={[
          { label: "Horizon", href: "/" },
          { label: "Elementi", href: "/" },
          { label: item.title },
        ]}
      />

      <div className="my-[9vh] space-y-10">
        <div className="space-y-4">
          <h2 className="text-3xl font-medium tracking-tighter">
            {item.title}
          </h2>
          <p className="text-foreground/70 max-w-xl leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="bg-foreground/5 rounded-xl px-3 py-1.5 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>

        <table className="w-full">
          <tbody>
            {item.specs.map((spec) => (
              <tr
                key={spec.label}
                className="border-foreground/10 h-14 border-t tracking-tight last:border-b"
              >
                <td className="text-foreground/50 w-1/3 text-sm">
                  {spec.label}
                </td>
                <td>{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
