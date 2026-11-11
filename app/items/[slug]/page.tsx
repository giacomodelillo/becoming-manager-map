import { Suspense } from "react";
import { notFound } from "next/navigation";
import { HomeStage } from "@/components/sections/home-stage";
import { ITEMS, getItem } from "@/lib/items";

export function generateStaticParams() {
  return ITEMS.map(({ slug }) => ({ slug }));
}

async function Stage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getItem(slug)) notFound();
  return <HomeStage />;
}

export default function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<HomeStage />}>
      <Stage params={params} />
    </Suspense>
  );
}
