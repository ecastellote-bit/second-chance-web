"use client";

import { useRouter } from "next/navigation";
import { useFullAnswers } from "../fullAnswersContext";
import { FULL_FLOW_COPY } from "@/lib/content/fullFlowCopy";
import {
  FullFlowActions,
  FullFlowShell,
  FullFlowStationHeader,
  FullFlowStepCard,
} from "@/components/full-flow/FullFlowShell";

function formatReviewValue(value: string, fallback: string) {
  const clean = value.trim();
  return clean ? clean : fallback;
}

export default function FullStep5Page() {
  const router = useRouter();
  const { state, clearAnalysis, clearFollowup, isHydrated } = useFullAnswers();

  const copy = FULL_FLOW_COPY.step5;
  const fallback = copy.reviewLabels.missingValue;

  const handleContinue = () => {
    clearAnalysis();
    clearFollowup();
    router.push("/full/processing");
  };

  return (
    <FullFlowShell variant="station" station={5} showPreservationNote>
      <FullFlowStationHeader station={5} />

      {!isHydrated ? (
        <FullFlowStepCard>
          <p className="text-sm text-[#6B7A8C]">{copy.hydratingLabel}</p>
        </FullFlowStepCard>
      ) : (
        <FullFlowStepCard>
          <div className="space-y-4 text-sm">
            {(
              [
                ["currentSituation", state.currentContext.currentSituation],
                ["childhoodMemories", state.narrative.childhoodMemories],
                ["earlyFascinations", state.narrative.earlyFascinations],
                ["repeatedWorkPatterns", state.narrative.repeatedWorkPatterns],
                ["lossesOrRenunciations", state.narrative.lossesOrRenunciations],
                ["whatFeelsCompressedNow", state.narrative.whatFeelsCompressedNow],
                ["restrictionsText", state.currentContext.restrictionsText],
                ["assetsText", state.currentContext.assetsText],
                ["transitionGoal", state.currentContext.transitionGoal],
              ] as const
            ).map(([key, value]) => (
              <div
                key={key}
                className="border-b border-[#E8EEF3] pb-3 last:border-0 last:pb-0"
              >
                <p className="font-semibold text-[#0B2E59]">
                  {copy.reviewLabels[key]}
                </p>
                <p className="mt-1 leading-relaxed text-[#6B7A8C]">
                  {formatReviewValue(value, fallback)}
                </p>
              </div>
            ))}
          </div>
        </FullFlowStepCard>
      )}

      <FullFlowActions
        backLabel={copy.backLabel}
        nextLabel={copy.nextLabel}
        onBack={() => router.push("/full/step-4")}
        onNext={handleContinue}
        nextDisabled={!isHydrated}
      />
    </FullFlowShell>
  );
}
