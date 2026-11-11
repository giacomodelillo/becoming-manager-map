import Link from "next/link";
import { Fragment } from "react";

export type Crumb = { label: string; href?: string };

export function DetailBreadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex h-10 items-center gap-2 text-sm font-medium tracking-tight"
    >
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <Fragment key={`${item.label}-${i}`}>
            {item.href && !last ? (
              <Link
                href={item.href}
                className="text-foreground/50 hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={last ? "text-foreground" : "text-foreground/50"}>
                {item.label}
              </span>
            )}
            {!last && (
              <span className="bg-foreground/50 size-[3px] rounded-full" />
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
