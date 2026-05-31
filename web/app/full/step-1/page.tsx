"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFullAnswers } from "../fullAnswersContext";
import { FULL_FLOW_COPY } from "@/lib/content/fullFlowCopy";
import { FullFlowStepLayout } from "@/components/full-flow/FullFlowStepLayout";
import {
  FullFlowField,
  FullFlowInput,
  FullFlowSelect,
  FullFlowTextarea,
} from "@/components/full-flow/FullFlowShell";

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
    <FullFlowStepLayout
      station={1}
      errors={errors}
      onBack={() => router.push("/full")}
      onNext={handleNext}
    >
      <div className="grid gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <FullFlowField label={copy.fields.age.label}>
            <FullFlowInput
              value={state.profile.age}
              onChange={(e) => updateProfile("age", e.target.value)}
              placeholder={copy.fields.age.placeholder}
              inputMode="numeric"
            />
          </FullFlowField>

          <FullFlowField label={copy.fields.country.label}>
            <FullFlowInput
              value={state.profile.country}
              onChange={(e) => updateProfile("country", e.target.value)}
              placeholder={copy.fields.country.placeholder}
            />
          </FullFlowField>
        </div>

        <FullFlowField label={copy.fields.employmentStatus.label}>
          <FullFlowSelect
            value={state.profile.employmentStatus}
            onChange={(e) =>
              updateProfile("employmentStatus", e.target.value as never)
            }
          >
            <option value="employed">Empleado/a</option>
            <option value="unemployed">Desempleado/a</option>
            <option value="self_employed">Independiente</option>
            <option value="between_roles">Entre roles</option>
            <option value="caregiving">Cuidados</option>
            <option value="student">Estudiante</option>
            <option value="other">Otro</option>
          </FullFlowSelect>
        </FullFlowField>

        <FullFlowField label={copy.fields.currentRole.label}>
          <FullFlowInput
            value={state.currentContext.currentRole}
            onChange={(e) => updateCurrentContext("currentRole", e.target.value)}
            placeholder={copy.fields.currentRole.placeholder}
          />
        </FullFlowField>

        <FullFlowField
          label={copy.fields.currentSituation.label}
          hint="Una escena concreta ayuda más que un resumen prolijo."
        >
          <FullFlowTextarea
            value={state.currentContext.currentSituation}
            onChange={(e) =>
              updateCurrentContext("currentSituation", e.target.value)
            }
            placeholder={copy.fields.currentSituation.placeholder}
            className="min-h-[160px]"
          />
        </FullFlowField>

        <div className="grid gap-4 sm:grid-cols-3">
          <FullFlowField label={copy.fields.energyLevel.label}>
            <FullFlowSelect
              value={state.currentContext.energyLevel}
              onChange={(e) =>
                updateCurrentContext("energyLevel", e.target.value as never)
              }
            >
              <option value="very_low">Muy baja</option>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </FullFlowSelect>
          </FullFlowField>

          <FullFlowField label={copy.fields.economicPressure.label}>
            <FullFlowSelect
              value={state.currentContext.economicPressure}
              onChange={(e) =>
                updateCurrentContext("economicPressure", e.target.value as never)
              }
            >
              <option value="very_high">Muy alta</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </FullFlowSelect>
          </FullFlowField>

          <FullFlowField label={copy.fields.familyLoad.label}>
            <FullFlowSelect
              value={state.currentContext.familyLoad}
              onChange={(e) =>
                updateCurrentContext("familyLoad", e.target.value as never)
              }
            >
              <option value="heavy">Pesada</option>
              <option value="moderate">Moderada</option>
              <option value="light">Ligera</option>
              <option value="none">Ninguna</option>
            </FullFlowSelect>
          </FullFlowField>
        </div>
      </div>
    </FullFlowStepLayout>
  );
}
