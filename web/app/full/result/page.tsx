"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFullAnswers } from "../fullAnswersContext";
import { FULL_FLOW_COPY } from "@/lib/content/fullFlowCopy";

export default function FullResultPage() {
  const router = useRouter();
  const { analysis } = useFullAnswers();
  const copy = FULL_FLOW_COPY.result;

  useEffect(() => {
    if (!analysis.result) {
      router.replace("/full/step-5");
    }
  }, [analysis.result, router]);

  if (!analysis.result) {
    return null;
  }

  const reading = analysis.result;

  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-neutral-500">
            {copy.eyebrow}
          </p>
          <h1 className="text-3xl font-semibold">{reading.corePattern}</h1>
          <p className="text-base text-neutral-700">
            {reading.summaryForUser.diagnostico}
          </p>
        </div>

        <div className="grid gap-5">
          <section className="border rounded-xl p-5 space-y-2">
            <h2 className="text-lg font-medium">
              {copy.sections.dominantTension}
            </h2>
            <p className="text-sm text-neutral-700">{reading.dominantTension}</p>
          </section>

          <section className="border rounded-xl p-5 space-y-2">
            <h2 className="text-lg font-medium">
              {copy.sections.hiloConductor}
            </h2>
            <p className="text-sm text-neutral-700">
              {reading.summaryForUser.hilo_conductor}
            </p>
          </section>

          <section className="border rounded-xl p-5 space-y-2">
            <h2 className="text-lg font-medium">
              {copy.sections.plausibleDirections}
            </h2>
            <div className="space-y-3">
              {reading.plausibleDirections.length > 0 ? (
                reading.plausibleDirections.map((direction) => (
                  <div key={direction.id} className="border rounded-lg p-3">
                    <p className="font-medium text-sm">{direction.label}</p>
                    <p className="text-sm text-neutral-700">
                      {direction.whyItFits}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-700">
                  {copy.fallbacks.noDirections}
                </p>
              )}
            </div>
          </section>

          <section className="border rounded-xl p-5 space-y-2">
            <h2 className="text-lg font-medium">
              {copy.sections.actionVectors}
            </h2>
            <div className="space-y-3">
              {reading.actionVectors.length > 0 ? (
                reading.actionVectors.map((vector) => (
                  <div key={vector.id} className="border rounded-lg p-3 space-y-2">
                    <p className="font-medium text-sm">{vector.label}</p>
                    <p className="text-sm text-neutral-700">
                      {vector.description}
                    </p>
                    <ul className="text-sm text-neutral-700 space-y-1">
                      {vector.microActions.map((action, index) => (
                        <li key={index}>• {action}</li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-700">
                  {copy.fallbacks.noActionVectors}
                </p>
              )}
            </div>
          </section>

          <section className="border rounded-xl p-5 space-y-2">
            <h2 className="text-lg font-medium">
              {copy.sections.caminoMinimo}
            </h2>
            <p className="text-sm text-neutral-700">
              {reading.summaryForUser.camino_minimo}
            </p>
          </section>
        </div>

        <div className="flex gap-3">
          <Link
            href="/full/step-1"
            className="px-4 py-2 rounded-md border border-neutral-300 text-sm"
          >
            {copy.buttons.reentry}
          </Link>

          <Link
            href="/full/next-step"
            className="px-4 py-2 rounded-md border border-black text-sm"
          >
            {copy.buttons.nextStep}
          </Link>
        </div>
      </div>
    </main>
  );
}