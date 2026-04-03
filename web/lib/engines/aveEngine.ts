import type { EmployabilityDirection } from "../types/profiles";
import type { ActionVector, TransitionAssessment } from "../types/result";

function frictionFromMargin(margin: TransitionAssessment["transitionMargin"]): ActionVector["friction"] {
  if (margin === "minimal") return "high";
  if (margin === "narrow") return "medium";
  return "low";
}

function horizonFromMargin(margin: TransitionAssessment["transitionMargin"]): ActionVector["timeHorizon"] {
  if (margin === "minimal") return "7_days";
  if (margin === "narrow") return "30_days";
  return "90_days";
}

export function runAVE(
  directions: EmployabilityDirection[],
  transition: TransitionAssessment,
): ActionVector[] {
  return directions.slice(0, 2).map((direction, index) => ({
    id: `action_${direction.id}`,
    label: direction.label,
    description: `Explorar ${direction.label} sin romper todavía la estructura actual.`,
    friction: frictionFromMargin(transition.transitionMargin),
    timeHorizon: horizonFromMargin(transition.transitionMargin),
    microActions: [
      `Investigar 3 roles concretos vinculados a ${direction.label}.`,
      `Reescribir experiencia previa en lenguaje transferible hacia ${direction.label}.`,
      index === 0
        ? `Hablar con al menos 1 persona que ya trabaje en ${direction.label}.`
        : `Detectar una microprueba viable para acercarte a ${direction.label}.`,
    ],
  }));
}