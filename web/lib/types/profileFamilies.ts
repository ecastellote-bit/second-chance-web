import type { HumanAffinityId } from "./humanAffinity";

export type ProfileFamilyId =
  | "analytical_strategist"
  | "technical_builder"
  | "diplomatic_social_connector"
  | "community_builder"
  | "empathic_guide"
  | "creative_storyteller"
  | "cultural_explorer"
  | "public_communicator"
  | "institutional_operator"
  | "civic_advocate"
  | "educator_interpreter"
  | "commercial_connector"
  | "system_designer";

export type ProfileFamilyDefinition = {
  id: ProfileFamilyId;
  label: string;
  summary: string;
  coreAffinities: HumanAffinityId[];
  supportingAffinities: HumanAffinityId[];
  tensionAffinities?: HumanAffinityId[];
  subtypeCandidates: string[];
  misreadAs: ProfileFamilyId[];
};

export type ProfileFamilyScore = {
  id: ProfileFamilyId;
  label: string;
  summary: string;
  score: number;
  confidence: number;
  matchedCoreAffinities: HumanAffinityId[];
  matchedSupportingAffinities: HumanAffinityId[];
  tensionHits: HumanAffinityId[];
  subtypeCandidates: string[];
  misreadAs: ProfileFamilyId[];
  rationale: string[];
};