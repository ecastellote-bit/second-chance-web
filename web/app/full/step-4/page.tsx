"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFullAnswers } from "../fullAnswersContext";
import { FULL_FLOW_COPY } from "@/lib/content/fullFlowCopy";
import { FullFlowStepLayout } from "@/components/full-flow/FullFlowStepLayout";
import { FullFlowField, FullFlowTextarea } from "@/components/full-flow/FullFlowShell";

export default function FullStep4Page() {
  const router = useRouter();
  const { state, updateCurrentContext } = useFullAnswers();
  const [errors, setErrors] = useState<string[]>([]);

  const copy = FULL_FLOW_COPY.step4;

  const handleNext = () => {
    const nextErrors: string[] = [];

    if (!state.currentContext.restrictionsText.trim()) {
      nextErrors.push(copy.validation.restrictionsRequired);
    }

    if (!state.currentContext.assetsText.trim()) {
      nextErrors.push(copy.validation.assetsRequired);
    }

    if (!state.currentContext.transitionGoal.trim()) {
      nextErrors.push(copy.validation.goalRequired);
    }

    setErrors(nextErrors);

    if (nextErrors.length > 0) return;

    router.push("/full/step-5");
  };

  return (
    <FullFlowStepLayout
      station={4}
      errors={errors}
      onBack={() => router.push("/full/step-3")}
      onNext={handleNext}
    >
      <div className="grid gap-5">
        <FullFlowField label={copy.fields.restrictionsText.label}>
          <FullFlowTextarea
            value={state.currentContext.restrictionsText}
            onChange={(e) =>
              updateCurrentContext("restrictionsText", e.target.value)
            }
            placeholder={copy.fields.restrictionsText.placeholder}
          />
        </FullFlowField>

        <FullFlowField label={copy.fields.assetsText.label}>
          <FullFlowTextarea
            value={state.currentContext.assetsText}
            onChange={(e) => updateCurrentContext("assetsText", e.target.value)}
            placeholder={copy.fields.assetsText.placeholder}
          />
        </FullFlowField>

        <FullFlowField label={copy.fields.transitionGoal.label}>
          <FullFlowTextarea
            value={state.currentContext.transitionGoal}
            onChange={(e) =>
              updateCurrentContext("transitionGoal", e.target.value)
            }
            placeholder={copy.fields.transitionGoal.placeholder}
            className="min-h-[120px]"
          />
        </FullFlowField>
      </div>
    </FullFlowStepLayout>
  );
}
