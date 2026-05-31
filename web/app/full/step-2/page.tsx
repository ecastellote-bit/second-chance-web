"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFullAnswers } from "../fullAnswersContext";
import { FULL_FLOW_COPY } from "@/lib/content/fullFlowCopy";
import { FullFlowStepLayout } from "@/components/full-flow/FullFlowStepLayout";
import { FullFlowField, FullFlowTextarea } from "@/components/full-flow/FullFlowShell";

export default function FullStep2Page() {
  const router = useRouter();
  const { state, updateNarrative } = useFullAnswers();
  const [errors, setErrors] = useState<string[]>([]);

  const copy = FULL_FLOW_COPY.step2;

  const handleNext = () => {
    const nextErrors: string[] = [];

    if (!state.narrative.childhoodMemories.trim()) {
      nextErrors.push(copy.validation.childhoodMemoriesRequired);
    }

    if (!state.narrative.earlyFascinations.trim()) {
      nextErrors.push(copy.validation.earlyFascinationsRequired);
    }

    if (!state.narrative.repeatedWorkPatterns.trim()) {
      nextErrors.push(copy.validation.repeatedWorkPatternsRequired);
    }

    setErrors(nextErrors);

    if (nextErrors.length > 0) return;

    router.push("/full/step-3");
  };

  return (
    <FullFlowStepLayout
      station={2}
      errors={errors}
      onBack={() => router.push("/full/step-1")}
      onNext={handleNext}
    >
      <div className="grid gap-5">
        <FullFlowField label={copy.fields.childhoodMemories.label}>
          <FullFlowTextarea
            value={state.narrative.childhoodMemories}
            onChange={(e) => updateNarrative("childhoodMemories", e.target.value)}
          />
        </FullFlowField>

        <FullFlowField label={copy.fields.earlyFascinations.label}>
          <FullFlowTextarea
            value={state.narrative.earlyFascinations}
            onChange={(e) => updateNarrative("earlyFascinations", e.target.value)}
          />
        </FullFlowField>

        <FullFlowField label={copy.fields.meaningfulSchoolSubjects.label}>
          <FullFlowTextarea
            value={state.narrative.meaningfulSchoolSubjects}
            onChange={(e) =>
              updateNarrative("meaningfulSchoolSubjects", e.target.value)
            }
          />
        </FullFlowField>

        <FullFlowField label={copy.fields.repeatedWorkPatterns.label}>
          <FullFlowTextarea
            value={state.narrative.repeatedWorkPatterns}
            onChange={(e) =>
              updateNarrative("repeatedWorkPatterns", e.target.value)
            }
          />
        </FullFlowField>

        <FullFlowField label={copy.fields.naturalSocialRoles.label}>
          <FullFlowTextarea
            value={state.narrative.naturalSocialRoles}
            onChange={(e) => updateNarrative("naturalSocialRoles", e.target.value)}
          />
        </FullFlowField>
      </div>
    </FullFlowStepLayout>
  );
}
