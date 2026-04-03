import type { UserIntake } from "../types/intake";
import type { TransitionAssessment, TransitionMargin } from "../types/result";

function calculateTransitionMargin(input: UserIntake): TransitionMargin {
  const energy = input.currentContext.energyLevel ?? "medium";
  const economic = input.currentContext.economicPressure ?? "medium";
  const family = input.currentContext.familyLoad ?? "moderate";

  if (energy === "very_low" || economic === "very_high") {
    return "minimal";
  }

  if (energy === "low" || economic === "high" || family === "heavy") {
    return "narrow";
  }

  if (energy === "high" && economic === "low" && family !== "heavy") {
    return "strong";
  }

  return "workable";
}

export function runLTE(intake: UserIntake): TransitionAssessment {
  const transitionMargin = calculateTransitionMargin(intake);

  return {
    energyLevel: intake.currentContext.energyLevel ?? "medium",
    economicPressure: intake.currentContext.economicPressure ?? "medium",
    familyLoad: intake.currentContext.familyLoad ?? "moderate",
    transitionMargin,
    keyConstraints: intake.currentContext.restrictions ?? [],
    availableAssets: intake.currentContext.assets ?? [],
    summary:
      transitionMargin === "minimal"
        ? "El margen actual de transición es muy bajo y exige movimientos pequeños, defensivos y realistas."
        : transitionMargin === "narrow"
          ? "Hay algo de margen, pero las restricciones obligan a priorizar pasos cortos y de bajo riesgo."
          : transitionMargin === "strong"
            ? "Existe un margen de transición relativamente sólido para explorar movimientos con más ambición."
            : "Hay un margen razonable para probar dirección sin romper de inmediato la estructura actual.",
  };
}