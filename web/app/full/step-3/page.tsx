"use client";

import { useEffect, useState } from "react";
import { trackFullStepView } from "@/lib/observatory/client";
import { useRouter } from "next/navigation";
import { useFullAnswers } from "../fullAnswersContext";
import { FULL_FLOW_COPY } from "@/lib/content/fullFlowCopy";
import { FullFlowStepLayout } from "@/components/full-flow/FullFlowStepLayout";
import { FullFlowField, FullFlowTextarea } from "@/components/full-flow/FullFlowShell";

export default function FullStep3Page() {
  const router = useRouter();
  const { state, updateNarrative } = useFullAnswers();
  const [errors, setErrors] = useState<string[]>([]);

  const copy = FULL_FLOW_COPY.step3;

  useEffect(() => {
    trackFullStepView(3);
  }, []);

  const handleNext = () => {
    const nextErrors: string[] = [];

    if (!state.narrative.lossesOrRenunciations.trim()) {
      nextErrors.push(copy.validation.lossesRequired);
    }

    if (!state.narrative.whatFeelsCompressedNow.trim()) {
      nextErrors.push(copy.validation.compressedRequired);
    }

    setErrors(nextErrors);

    if (nextErrors.length > 0) return;

    router.push("/full/step-4");
  };

  return (
    <FullFlowStepLayout
      station={3}
      errors={errors}
      onBack={() => router.push("/full/step-2")}
      onNext={handleNext}
    >
      <div className="grid gap-5">
        <FullFlowField label={copy.fields.lossesOrRenunciations.label}>
          <FullFlowTextarea
            value={state.narrative.lossesOrRenunciations}
            onChange={(e) =>
              updateNarrative("lossesOrRenunciations", e.target.value)
            }
            className="min-h-[150px]"
          />
        </FullFlowField>

        <FullFlowField label={copy.fields.whatFeelsCompressedNow.label}>
          <FullFlowTextarea
            value={state.narrative.whatFeelsCompressedNow}
            onChange={(e) =>
              updateNarrative("whatFeelsCompressedNow", e.target.value)
            }
            className="min-h-[150px]"
          />
        </FullFlowField>
      </div>
    </FullFlowStepLayout>
  );
}
