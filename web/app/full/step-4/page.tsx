"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFullAnswers } from "../fullAnswersContext";
import { FULL_FLOW_COPY } from "@/lib/content/fullFlowCopy";

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
              {copy.fields.restrictionsText.label}
            </span>
            <textarea
              value={state.currentContext.restrictionsText}
              onChange={(e) =>
                updateCurrentContext("restrictionsText", e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm min-h-28"
              placeholder={copy.fields.restrictionsText.placeholder}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">
              {copy.fields.assetsText.label}
            </span>
            <textarea
              value={state.currentContext.assetsText}
              onChange={(e) =>
                updateCurrentContext("assetsText", e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm min-h-28"
              placeholder={copy.fields.assetsText.placeholder}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">
              {copy.fields.transitionGoal.label}
            </span>
            <textarea
              value={state.currentContext.transitionGoal}
              onChange={(e) =>
                updateCurrentContext("transitionGoal", e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm min-h-24"
              placeholder={copy.fields.transitionGoal.placeholder}
            />
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/full/step-3")}
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