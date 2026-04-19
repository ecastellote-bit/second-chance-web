export type HumanAffinityId =
  | "narrative_creation"
  | "public_expression"
  | "editorial_framing"
  | "audience_activation"
  | "performance_presence"
  | "aesthetic_sensitivity"
  | "pattern_analysis"
  | "meaning_synthesis"
  | "system_ordering"
  | "conceptual_abstraction"
  | "evidence_validation"
  | "strategic_projection"
  | "empathic_attunement"
  | "relational_bridge_building"
  | "social_coordination"
  | "conflict_mediation"
  | "group_reading"
  | "trust_building"
  | "care_orientation"
  | "restorative_support"
  | "protective_instinct"
  | "duty_reliability"
  | "stewardship"
  | "crisis_response"
  | "practical_execution"
  | "craft_precision"
  | "technical_assembly"
  | "operational_rhythm"
  | "resource_optimization"
  | "material_transformation"
  | "initiative_drive"
  | "decision_ownership"
  | "influence_negotiation"
  | "institutional_navigation"
  | "agenda_detection"
  | "civic_conflict_engagement"
  | "curiosity_depth"
  | "exploratory_drive"
  | "adaptive_reframing"
  | "teaching_impulse"
  | "experimental_play"
  | "venture_activation"
  | "competitive_push"
  | "discipline_endurance"
  | "physical_mastery"
  | "sensory_awareness"
  | "energy_transmission"
  | "pressure_functioning";

export type HumanAffinityCluster =
  | "expression"
  | "analysis"
  | "relational"
  | "care"
  | "execution"
  | "agency"
  | "exploration"
  | "embodiment";

export type HumanAffinityDefinition = {
  id: HumanAffinityId;
  label: string;
  cluster: HumanAffinityCluster;
  summary: string;
  detectionHints: string[];
  confusableWith: HumanAffinityId[];
  likelyDomains: Array<
    "work" | "art" | "sport" | "civic" | "community" | "family" | "spiritual"
  >;
  relatedContributionModes: string[];
  relatedFlourishingConditions: string[];
};

export type HumanAffinityStatus =
  | "expressed"
  | "latent"
  | "buried"
  | "blocked"
  | "compensatory";

export type HumanAffinityScore = {
  id: HumanAffinityId;
  score: number;
  confidence: number;
  status: HumanAffinityStatus;
  evidenceCount: number;
  evidenceSources: Array<"intake" | "cvme" | "followup" | "behavioral_note">;
  rationale: string[];
};