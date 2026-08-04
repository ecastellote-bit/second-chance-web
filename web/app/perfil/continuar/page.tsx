"use client";

import { Suspense } from "react";
import { ResumeProfileForm } from "@/components/perfil/ResumeProfileForm";

export default function PerfilContinuarPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#F8FAFC]" />}>
      <ResumeProfileForm />
    </Suspense>
  );
}
