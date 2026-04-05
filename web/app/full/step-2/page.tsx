"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFullAnswers } from "../fullAnswersContext";
import { FULL_FLOW_COPY } from "@/lib/content/fullFlowCopy";

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
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <p className="text-sm text-neutral-500">{copy.stepLabel}</p>
          <h1 className="text-2xl font-semibold">{copy.title}</h1>
          <p className="text-sm text-neutral-700">{copy.subtitle}</p>
        </div>

        {errors.length > 0 ? (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 space-y-2">
            <p className="text-sm font-medium text-red-900">
              {copy.validation.summaryTitle}
            </p>
            <ul className="space-y-1 text-sm text-red-800">
              {errors.map((error) => (
                <li key={error}>• {error}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-medium">
              {copy.fields.childhoodMemories.label}
            </span>
            <textarea
              value={state.narrative.childhoodMemories}
              onChange={(e) =>
                updateNarrative("childhoodMemories", e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm min-h-28"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">
              {copy.fields.earlyFascinations.label}
            </span>
            <textarea
              value={state.narrative.earlyFascinations}
              onChange={(e) =>
                updateNarrative("earlyFascinations", e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm min-h-28"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">
              {copy.fields.meaningfulSchoolSubjects.label}
            </span>
            <textarea
              value={state.narrative.meaningfulSchoolSubjects}
              onChange={(e) =>
                updateNarrative("meaningfulSchoolSubjects", e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm min-h-28"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">
              {copy.fields.repeatedWorkPatterns.label}
            </span>
            <textarea
              value={state.narrative.repeatedWorkPatterns}
              onChange={(e) =>
                updateNarrative("repeatedWorkPatterns", e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm min-h-28"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">
              {copy.fields.naturalSocialRoles.label}
            </span>
            <textarea
              value={state.narrative.naturalSocialRoles}
              onChange={(e) =>
                updateNarrative("naturalSocialRoles", e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm min-h-28"
            />
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/full/step-1")}
            className="px-4 py-2 rounded-md border border-neutral-300 text-sm"
          >
            {copy.backLabel}
          </button>

          <button
            onClick={handleNext}
            className="px-4 py-2 rounded-md border border-black text-sm"
          >
            {copy.nextLabel}
          </button>
        </div>
      </div>
    </main>
  );
}