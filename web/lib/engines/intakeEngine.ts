import type { IntakeValidationResult, UserIntake } from "../types/intake";
import { compactStrings, uniqueStrings } from "../utils/parsing";

export function normalizeUserIntake(input: Partial<UserIntake>): UserIntake {
  return {
    profile: {
      age: input.profile?.age ?? null,
      country: input.profile?.country?.trim() ?? "",
      language: input.profile?.language?.trim() ?? "es",
      employmentStatus: input.profile?.employmentStatus ?? "other",
      educationLevel: input.profile?.educationLevel?.trim() ?? "",
      dependents: input.profile?.dependents ?? null,
    },
    currentContext: {
      currentRole: input.currentContext?.currentRole?.trim() ?? "",
      currentSituation: input.currentContext?.currentSituation?.trim() ?? "",
      energyLevel: input.currentContext?.energyLevel ?? "medium",
      economicPressure: input.currentContext?.economicPressure ?? "medium",
      familyLoad: input.currentContext?.familyLoad ?? "moderate",
      restrictions: uniqueStrings(input.currentContext?.restrictions ?? []),
      assets: uniqueStrings(input.currentContext?.assets ?? []),
      transitionGoal: input.currentContext?.transitionGoal?.trim() ?? "",
    },
    narrative: {
      childhoodMemories: input.narrative?.childhoodMemories?.trim() ?? "",
      earlyFascinations: input.narrative?.earlyFascinations?.trim() ?? "",
      meaningfulSchoolSubjects: input.narrative?.meaningfulSchoolSubjects?.trim() ?? "",
      repeatedWorkPatterns: input.narrative?.repeatedWorkPatterns?.trim() ?? "",
      naturalSocialRoles: input.narrative?.naturalSocialRoles?.trim() ?? "",
      lossesOrRenunciations: input.narrative?.lossesOrRenunciations?.trim() ?? "",
      whatFeelsCompressedNow: input.narrative?.whatFeelsCompressedNow?.trim() ?? "",
      additionalContext: input.narrative?.additionalContext?.trim() ?? "",
    },
  };
}

export function validateUserIntake(input: UserIntake): IntakeValidationResult {
  const missingFields = compactStrings([
    input.narrative.childhoodMemories ? "" : "narrative.childhoodMemories",
    input.narrative.earlyFascinations ? "" : "narrative.earlyFascinations",
    input.currentContext.currentSituation ? "" : "currentContext.currentSituation",
    input.narrative.whatFeelsCompressedNow ? "" : "narrative.whatFeelsCompressedNow",
  ]);

  const warnings = compactStrings([
    !input.currentContext.restrictions.length ? "No current restrictions provided." : "",
    !input.currentContext.assets.length ? "No current assets provided." : "",
    !input.narrative.repeatedWorkPatterns ? "Repeated work patterns missing." : "",
  ]);

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings,
  };
}