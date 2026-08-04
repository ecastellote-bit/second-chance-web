"use client";

import { Suspense } from "react";
import { PerfilForm } from "@/components/perfil/PerfilForm";
import { useSearchParams } from "next/navigation";

function PerfilCrearContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect")?.trim() || "/perfil";
  return <PerfilForm mode="create" redirectTo={redirect} />;
}

export default function PerfilCrearPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#F8FAFC]" />}>
      <PerfilCrearContent />
    </Suspense>
  );
}
