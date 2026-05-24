import { Suspense } from "react";
import { RecuperarCasoForm } from "@/components/diagnostic/RecuperarCasoForm";

export default function RecuperarCasoPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[100dvh] items-center justify-center text-sm text-[#6B7A8C]">
          Cargando…
        </main>
      }
    >
      <RecuperarCasoForm />
    </Suspense>
  );
}
