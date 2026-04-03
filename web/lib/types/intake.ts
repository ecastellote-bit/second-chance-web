export type EmploymentStatus =
  | "employed"
  | "unemployed"
  | "self_employed"
  | "between_roles"
  | "caregiving"
  | "student"
  | "other";

export type EnergyLevel = "very_low" | "low" | "medium" | "high";
export type EconomicPressure = "very_high" | "high" | "medium" | "low";
export type FamilyLoad = "heavy" | "moderate" | "light" | "none";

export interface UserProfile {
  age?: number | null;
  country?: string;
  language?: string;
  employmentStatus?: EmploymentStatus;
  educationLevel?: string;
  dependents?: number | null;
}

export interface CurrentContext {
  currentRole?: string;
  currentSituation?: string;
  energyLevel?: EnergyLevel;
  economicPressure?: EconomicPressure;
  familyLoad?: FamilyLoad;
  restrictions: string[];
  assets: string[];
  transitionGoal?: string;
}

export interface NarrativeAnswers {
  childhoodMemories?: string;
  earlyFascinations?: string;
  meaningfulSchoolSubjects?: string;
  repeatedWorkPatterns?: string;
  naturalSocialRoles?: string;
  lossesOrRenunciations?: string;
  whatFeelsCompressedNow?: string;
  additionalContext?: string;
}

export interface UserIntake {
  profile: UserProfile;
  currentContext: CurrentContext;
  narrative: NarrativeAnswers;
}

export interface IntakeValidationResult {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
}