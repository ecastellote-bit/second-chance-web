"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFullAnswers } from "../fullAnswersContext";
import { FULL_FLOW_COPY } from "@/lib/content/fullFlowCopy";

export default function FullStep1Page() {
  const router = useRouter();
  const { state, updateProfile, updateCurrentContext, clearAnalysis } =
    useFullAnswers();
  const [errors, setErrors] = useState<string[]>([]);

  const copy = FULL_FLOW_COPY.step1;

  const handleNext = () => {
    const nextErrors: string[] = [];

    if (!state.profile.age.trim()) {
      nextErrors.push(copy.validation.ageRequired);
    }

    if (!state.profile.country.trim()) {
      nextErrors.push(copy.validation.countryRequired);
    }

    if (!state.currentContext.currentSituation.trim()) {
      nextErrors.push(copy.validation.currentSituationRequired);
    }

    setErrors(nextErrors);

    if (nextErrors.length > 0) return;

    clearAnalysis();
    router.push("/full/step-2");
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
              {copy.fields.age.label}
            </span>
            <input
              value={state.profile.age}
              onChange={(e) => updateProfile("age", e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
              placeholder={copy.fields.age.placeholder}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">
              {copy.fields.country.label}
            </span>
            <input
              value={state.profile.country}
              onChange={(e) => updateProfile("country", e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
              placeholder={copy.fields.country.placeholder}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">
              {copy.fields.employmentStatus.label}
            </span>
            <select
              value={state.profile.employmentStatus}
              onChange={(e) =>
                updateProfile("employmentStatus", e.target.value as any)
              }
              className="border rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="employed">Empleado/a</option>
              <option value="unemployed">Desempleado/a</option>
              <option value="self_employed">Independiente</option>
              <option value="between_roles">Entre roles</option>
              <option value="caregiving">Cuidados</option>
              <option value="student">Estudiante</option>
              <option value="other">Otro</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">
              {copy.fields.currentRole.label}
            </span>
            <input
              value={state.currentContext.currentRole}
              onChange={(e) =>
                updateCurrentContext("currentRole", e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm"
              placeholder={copy.fields.currentRole.placeholder}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">
              {copy.fields.currentSituation.label}
            </span>
            <textarea
              value={state.currentContext.currentSituation}
              onChange={(e) =>
                updateCurrentContext("currentSituation", e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm min-h-28"
              placeholder={copy.fields.currentSituation.placeholder}
            />
          </label>

          <div className="grid md:grid-cols-3 gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium">
                {copy.fields.energyLevel.label}
              </span>
              <select
                value={state.currentContext.energyLevel}
                onChange={(e) =>
                  updateCurrentContext("energyLevel", e.target.value as any)
                }
                className="border rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="very_low">Muy baja</option>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">
                {copy.fields.economicPressure.label}
              </span>
              <select
                value={state.currentContext.economicPressure}
                onChange={(e) =>
                  updateCurrentContext("economicPressure", e.target.value as any)
                }
                className="border rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="very_high">Muy alta</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">
                {copy.fields.familyLoad.label}
              </span>
              <select
                value={state.currentContext.familyLoad}
                onChange={(e) =>
                  updateCurrentContext("familyLoad", e.target.value as any)
                }
                className="border rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="heavy">Pesada</option>
                <option value="moderate">Moderada</option>
                <option value="light">Ligera</option>
                <option value="none">Ninguna</option>
              </select>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/full")}
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