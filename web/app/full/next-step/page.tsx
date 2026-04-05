"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFullAnswers } from "../fullAnswersContext";
import { FULL_FLOW_COPY } from "@/lib/content/fullFlowCopy";

function routingLabel(value: string) {
  const labels = FULL_FLOW_COPY.nextStep.routingLabels;

  switch (value) {
    case "discord_recommended":
      return labels.discord_recommended;
    case "cohort_candidate":
      return labels.cohort_candidate;
    case "reentry_first":
      return labels.reentry_first;
    case "self_guided_next_step":
      return labels.self_guided_next_step;
    default:
      return labels.unknown;
  }
}

export default function FullNextStepPage() {
  const router = useRouter();
  const { analysis, resetFlow } = useFullAnswers();
  const copy = FULL_FLOW_COPY.nextStep;

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
            {copy.eyebrow}
          </p>
          <h1 className="text-3xl font-semibold">{copy.title}</h1>
          <p className="text-sm text-neutral-700">{copy.subtitle}</p>
        </div>

        <section className="border rounded-xl p-5 space-y-3">
          <h2 className="text-lg font-medium">{copy.sections.routing}</h2>
          <p className="text-sm text-neutral-800">
            {routingLabel(reading.communityRouting)}
          </p>
          <p className="text-sm text-neutral-700">
            {copy.detectedResultPrefix} <strong>{reading.resultType}</strong>
          </p>
        </section>

        <section className="border rounded-xl p-5 space-y-3">
          <h2 className="text-lg font-medium">{copy.sections.cierre}</h2>
          <p className="text-sm text-neutral-700">
            {reading.summaryForUser.cierre}
          </p>
        </section>

        <section className="border rounded-xl p-5 space-y-3">
          <h2 className="text-lg font-medium">{copy.sections.action}</h2>
          <p className="text-sm text-neutral-700">
            {reading.summaryForUser.action}
          </p>
        </section>

        <div className="flex gap-3">
          <Link
            href="/full/result"
            className="px-4 py-2 rounded-md border border-neutral-300 text-sm"
          >
            {copy.buttons.backToResult}
          </Link>

          <button
            onClick={() => {
              resetFlow();
              router.push("/full/step-1");
            }}
            className="px-4 py-2 rounded-md border border-black text-sm"
          >
            {copy.buttons.reentry}
          </button>
        </div>
      </div>
    </main>
  );
}