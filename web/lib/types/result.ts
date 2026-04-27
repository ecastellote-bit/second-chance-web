import type { ProbableProfile, EmployabilityDirection } from "./profiles";
import type { DetectedSignal } from "./signals";
import type { EvidenceFragment } from "./evidence";
import type { HumanAffinityScore } from "./humanAffinity";

export type ResultType =
  | "clear_direction"
  | "compressed_life"
  | "insufficient_evidence";

export type TransitionMargin = "minimal" | "narrow" | "workable" | "strong";
export type FrictionLevel = "low" | "medium" | "high";
export type TimeHorizon = "7_days" | "30_days" | "90_days";

export type CommunityRoutingRecommendation =
  | "discord_recommended"
  | "cohort_candidate"
  | "reentry_first"
  | "self_guided_next_step"
  | "none";

export interface TransitionAssessment {
  energyLevel: "very_low" | "low" | "medium" | "high";
  economicPressure: "very_high" | "high" | "medium" | "low";
  familyLoad: "heavy" | "moderate" | "light" | "none";
  transitionMargin: TransitionMargin;
  keyConstraints: string[];
  availableAssets: string[];
  summary: string;
}

export interface ActionVector {
  id: string;
  label: string;
  description: string;
  friction: FrictionLevel;
  timeHorizon: TimeHorizon;
  microActions: string[];
}

export interface SummaryForUser {
  diagnostico: string;
  hilo_conductor: string;
  tensiones: string;
  direccion: string;
  action: string;
  camino_minimo: string;
  cierre: string;
}

export interface FinalReading {
  resultType: ResultType;
  familyScores?: unknown[]; 
  corePattern: string;
  dominantTension: string;
  currentCost: string;
  plausibleDirections: EmployabilityDirection[];
  actionVectors: ActionVector[];
  summaryForUser: SummaryForUser;
  transitionAssessment: TransitionAssessment;
  supportingProfiles: ProbableProfile[];
  detectedSignals: DetectedSignal[];
  communityRouting: CommunityRoutingRecommendation;
  finalDiagnostic?: import("./finalDiagnostic").FinalDiagnostic;
  trace?: unknown;
  evidence?: EvidenceFragment[];
  affinityScores?: HumanAffinityScore[];
  topAffinities?: HumanAffinityScore[];
  buriedCapacities?: HumanAffinityScore[];
  likelyContributionModes?: string[];
  likelyFlourishingConditions?: string[];
}