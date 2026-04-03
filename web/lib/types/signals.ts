export type EvidenceSource =
  | "childhood_memory"
  | "early_interest"
  | "school_experience"
  | "work_pattern"
  | "social_role"
  | "loss_or_renunciation"
  | "current_context"
  | "free_narrative";

export type CanonicalSignalKey =
  | "social_coordination"
  | "pattern_analysis"
  | "narrative_creation"
  | "cultural_curiosity"
  | "opportunity_detection"
  | "system_thinking"
  | "empathic_listening"
  | "practical_organizing"
  | "other";

export interface SignalEvidence {
  source: EvidenceSource;
  excerpt: string;
  note?: string;
}

export interface DetectedSignal {
  id: string;
  key: CanonicalSignalKey | string;
  label: string;
  description: string;
  evidence: SignalEvidence[];
  weight: number;
  frequency: "single" | "repeated" | "dominant";
}

export interface SignalLibraryEntry {
  key: CanonicalSignalKey | string;
  label: string;
  description: string;
  defaultWeight: number;
}