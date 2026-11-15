import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCompany } from "@/lib/expo/data";

async function BoothGuard({ params }: { params: Promise<{ boothId: string }> }) {
  const { boothId } = await params;
  if (!getCompany(Number(boothId))) notFound();
  return null;
}

export default function Page({ params }: { params: Promise<{ boothId: string }> }) {
  return (
    <Suspense fallback={null}>
      <BoothGuard params={params} />
    </Suspense>
  );
}
