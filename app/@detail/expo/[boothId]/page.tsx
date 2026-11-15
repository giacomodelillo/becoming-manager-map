import { Suspense } from "react";
import { BoothDetail } from "@/components/sections/booth-detail";

async function Content({ params }: { params: Promise<{ boothId: string }> }) {
  const { boothId } = await params;
  return <BoothDetail boothId={Number(boothId)} />;
}

export default function Page({ params }: { params: Promise<{ boothId: string }> }) {
  return (
    <Suspense fallback={null}>
      <Content params={params} />
    </Suspense>
  );
}
