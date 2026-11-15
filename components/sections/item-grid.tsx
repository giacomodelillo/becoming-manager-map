"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useShell } from "@/components/shell/shell-context";
import { ITEMS } from "@/lib/items";
import { cn } from "@/lib/utils";

export function ItemGrid() {
  const { slug } = useParams<{ slug?: string }>();
  const { openDetail } = useShell();

  return (
    <section className="mx-auto grid max-w-3xl gap-3 px-8 pb-28 sm:grid-cols-2">
      {ITEMS.map((item) => {
        const active = item.slug === slug;
        return (
          <Link
            key={item.slug}
            href={`/items/${item.slug}`}
            onClick={openDetail}
            aria-current={active ? "page" : undefined}
            className={cn(
              "border-foreground/10 bg-foreground/[0.03] hover:bg-foreground/[0.06] block rounded-2xl border p-5 transition-colors",
              active && "border-foreground/40 bg-foreground/10",
            )}
          >
            <h2 className="text-lg font-medium tracking-tight">{item.title}</h2>
            <p className="text-foreground/60 mt-1 text-sm">{item.summary}</p>
          </Link>
        );
      })}
    </section>
  );
}
