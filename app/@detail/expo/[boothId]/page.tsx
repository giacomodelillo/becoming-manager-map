import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BoothDetail } from "@/components/sections/booth-detail";
import { getCompany } from "@/lib/expo/data";

async function Content({ params }: { params: Promise<{ boothId: string }> }) {
  const { boothId } = await params;
  const company = getCompany(Number(boothId));
  if (!company) notFound();
  return <BoothDetail company={company} />;
}

export default function Page({ params }: { params: Promise<{ boothId: string }> }) {
  return (
    <Suspense fallback={null}>
      <Content params={params} />
    </Suspense>
  );
}
