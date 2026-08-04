"use client";

import { Suspense } from "react";
import { PerfilForm } from "@/components/perfil/PerfilForm";

function PerfilEditarContent() {
  return <PerfilForm mode="edit" redirectTo="/perfil" />;
}

export default function PerfilEditarPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#F8FAFC]" />}>
      <PerfilEditarContent />
    </Suspense>
  );
}
