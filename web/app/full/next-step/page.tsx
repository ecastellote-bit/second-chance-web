"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFullAnswers } from "../fullAnswersContext";

function routingLabel(value: string) {
  switch (value) {
    case "discord_recommended":
      return "Continuidad abierta recomendada";
    case "cohort_candidate":
      return "Candidato/a a círculo guiado";
    case "reentry_first":
      return "Conviene reingresar antes de una comunidad";
    case "self_guided_next_step":
      return "Siguiente paso autoguiado";
    default:
      return "Sin routing específico todavía";
  }
}

export default function FullNextStepPage() {
  const router = useRouter();
  const { analysis } = useFullAnswers();

  useEffect(() => {
    if (!analysis.result) {
      router.replace("/full/result");
    }
  }, [analysis.result, router]);

  if (!analysis.result) {
    return null;
  }

  const reading = analysis.result;

  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-neutral-500">
            Next step
          </p>
          <h1 className="text-3xl font-semibold">Qué hacer después de esta lectura</h1>
          <p className="text-sm text-neutral-700">
            Esto es un placeholder real de continuidad. No es todavía la comunidad completa.
          </p>
        </div>

        <section className="border rounded-xl p-5 space-y-3">
          <h2 className="text-lg font-medium">Routing sugerido</h2>
          <p className="text-sm text-neutral-800">
            {routingLabel(reading.communityRouting)}
          </p>
          <p className="text-sm text-neutral-700">
            Resultado detectado: <strong>{reading.resultType}</strong>
          </p>
        </section>

        <section className="border rounded-xl p-5 space-y-3">
          <h2 className="text-lg font-medium">Cierre actual</h2>
          <p className="text-sm text-neutral-700">{reading.summaryForUser.cierre}</p>
        </section>

        <section className="border rounded-xl p-5 space-y-3">
          <h2 className="text-lg font-medium">Movimiento más razonable ahora</h2>
          <p className="text-sm text-neutral-700">{reading.summaryForUser.action}</p>
        </section>

        <div className="flex gap-3">
          <Link
            href="/full/result"
            className="px-4 py-2 rounded-md border border-neutral-300 text-sm"
          >
            Volver al resultado
          </Link>

          <Link
            href="/full/step-1"
            className="px-4 py-2 rounded-md border border-black text-sm"
          >
            Re-entry
          </Link>
        </div>
      </div>
    </main>
  );
}