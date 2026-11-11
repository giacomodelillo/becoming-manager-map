import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ItemDetail } from "@/components/sections/item-detail";
import { EmptyDetail } from "@/components/sections/empty-detail";
import { ITEMS, getItem } from "@/lib/items";

export function generateStaticParams() {
  return ITEMS.map(({ slug }) => ({ slug }));
}

async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getItem(slug);
  if (!item) notFound();
  return <ItemDetail item={item} />;
}

export default function DetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<EmptyDetail />}>
      <Detail params={params} />
    </Suspense>
  );
}
