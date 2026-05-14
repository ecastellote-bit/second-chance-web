import type { HumanAffinityId } from "./humanAffinity";

export type SemanticAffinitySignal = {
  id: HumanAffinityId;
  strength: number;
  evidence?: string;
};

export type SemanticNarrativeFlags = {
  oneToOneOrientation: boolean;
  publicAudienceDesire: boolean;
  practicalExecution: boolean;
  intellectualAbstraction: boolean;
  bodyOrientation: boolean;
  natureConnection: boolean;
  compressionDetected: boolean;
  collectiveOrientation: boolean;
  commercialIntent: boolean;
  artisticFormDesire: boolean;
};

export type SemanticExtractionResult = {
  ok: boolean;
  affinitySignals: SemanticAffinitySignal[];
  narrativeFlags: SemanticNarrativeFlags;
  dominantCluster?: string;
  extractionConfidence: number;
  rawModel?: string;
  latencyMs?: number;
  error?: string;
};

export const EMPTY_SEMANTIC_RESULT: SemanticExtractionResult = {
  ok: false,
  affinitySignals: [],
  narrativeFlags: {
    oneToOneOrientation: false,
    publicAudienceDesire: false,
    practicalExecution: false,
    intellectualAbstraction: false,
    bodyOrientation: false,
    natureConnection: false,
    compressionDetected: false,
    collectiveOrientation: false,
    commercialIntent: false,
    artisticFormDesire: false,
  },
  extractionConfidence: 0,
  error: "No semantic extraction performed",
};
