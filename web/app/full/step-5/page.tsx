"use client";

import { useRouter } from "next/navigation";
import { useFullAnswers } from "../fullAnswersContext";
import { FULL_FLOW_COPY } from "@/lib/content/fullFlowCopy";

function formatReviewValue(value: string, fallback: string) {
  const clean = value.trim();
  return clean ? clean : fallback;
}

export default function FullStep5Page() {
  const router = useRouter();
  const { state, clearAnalysis, isHydrated } = useFullAnswers();

  const copy = FULL_FLOW_COPY.step5;
  const fallback = copy.reviewLabels.missingValue;

  const handleContinue = () => {
    clearAnalysis();
    router.push("/full/processing");
  };

  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <p className="text-sm text-neutral-500">{copy.stepLabel}</p>
          <h1 className="text-2xl font-semibold">{copy.title}</h1>
          <p className="text-sm text-neutral-700">{copy.subtitle}</p>
        </div>

        {!isHydrated ? (
          <div className="rounded-xl border border-neutral-200 p-5 text-sm text-neutral-700">
            {copy.hydratingLabel}
          </div>
        ) : (
          <div className="border border-neutral-200 rounded-xl p-5 space-y-4 text-sm">
            <div>
              <p className="font-medium">{copy.reviewLabels.currentSituation}</p>
              <p className="text-neutral-700">
                {formatReviewValue(state.currentContext.currentSituation, fallback)}
              </p>
            </div>

            <div>
              <p className="font-medium">{copy.reviewLabels.childhoodMemories}</p>
              <p className="text-neutral-700">
                {formatReviewValue(state.narrative.childhoodMemories, fallback)}
              </p>
            </div>

            <div>
              <p className="font-medium">{copy.reviewLabels.earlyFascinations}</p>
              <p className="text-neutral-700">
                {formatReviewValue(state.narrative.earlyFascinations, fallback)}
              </p>
            </div>

            <div>
              <p className="font-medium">{copy.reviewLabels.repeatedWorkPatterns}</p>
              <p className="text-neutral-700">
                {formatReviewValue(state.narrative.repeatedWorkPatterns, fallback)}
              </p>
            </div>

            <div>
              <p className="font-medium">
                {copy.reviewLabels.lossesOrRenunciations}
              </p>
              <p className="text-neutral-700">
                {formatReviewValue(state.narrative.lossesOrRenunciations, fallback)}
              </p>
            </div>

            <div>
              <p className="font-medium">
                {copy.reviewLabels.whatFeelsCompressedNow}
              </p>
              <p className="text-neutral-700">
                {formatReviewValue(state.narrative.whatFeelsCompressedNow, fallback)}
              </p>
            </div>

            <div>
              <p className="font-medium">{copy.reviewLabels.restrictionsText}</p>
              <p className="text-neutral-700">
                {formatReviewValue(state.currentContext.restrictionsText, fallback)}
              </p>
            </div>

            <div>
              <p className="font-medium">{copy.reviewLabels.assetsText}</p>
              <p className="text-neutral-700">
                {formatReviewValue(state.currentContext.assetsText, fallback)}
              </p>
            </div>

            <div>
              <p className="font-medium">{copy.reviewLabels.transitionGoal}</p>
              <p className="text-neutral-700">
                {formatReviewValue(state.currentContext.transitionGoal, fallback)}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/full/step-4")}
            className="px-4 py-2 rounded-md border border-neutral-300 text-sm"
          >
            {copy.backLabel}
          </button>

          <button
            onClick={handleContinue}
            disabled={!isHydrated}
            className="px-4 py-2 rounded-md border border-black text-sm disabled:opacity-60"
          >
            {copy.nextLabel}
          </button>
        </div>
      </div>
    </main>
  );
}