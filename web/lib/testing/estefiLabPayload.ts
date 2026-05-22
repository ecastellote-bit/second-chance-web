import type { UserIntake } from "../types/intake";
import estefiRaw from "../../data/learning/imports/estefi-2026-05-17.json";

function splitList(text: string): string[] {
  return text
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Payload normalizado de Estefi para lab y golden set (client-safe). */
export function buildEstefiLabPayload(): Partial<UserIntake> {
  const raw = estefiRaw as {
    sourceInput: { fullAnswersContext: { state: Record<string, unknown> } };
  };
  const state = raw.sourceInput.fullAnswersContext.state as {
    profile: Record<string, unknown>;
    currentContext: Record<string, string>;
    narrative: Record<string, string>;
  };

  return {
    profile: {
      age: state.profile.age ? Number(state.profile.age) : 39,
      country: String(state.profile.country ?? "Argentina"),
      language: String(state.profile.language ?? "es"),
      employmentStatus:
        state.profile.employmentStatus as UserIntake["profile"]["employmentStatus"],
    },
    currentContext: {
      currentRole: state.currentContext.currentRole ?? "",
      currentSituation: state.currentContext.currentSituation ?? "",
      energyLevel:
        (state.currentContext.energyLevel as UserIntake["currentContext"]["energyLevel"]) ??
        "medium",
      economicPressure:
        (state.currentContext.economicPressure as UserIntake["currentContext"]["economicPressure"]) ??
        "medium",
      familyLoad:
        (state.currentContext.familyLoad as UserIntake["currentContext"]["familyLoad"]) ??
        "moderate",
      restrictions: splitList(state.currentContext.restrictionsText ?? ""),
      assets: splitList(state.currentContext.assetsText ?? ""),
      transitionGoal: state.currentContext.transitionGoal ?? "",
    },
    narrative: state.narrative,
  };
}

export const ESTEFI_LAB_CASE = {
  id: "estefi_pioneer",
  label: "★ Estefi (pionera — golden refractario)",
  expectation:
    "Empathic/investigación/diplomacia postergada; admin = sostén; compresión alta.",
};
