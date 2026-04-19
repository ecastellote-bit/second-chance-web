export type EvidenceSource =
  | "intake"
  | "cvme"
  | "followup"
  | "behavioral_note";

export type EvidenceValence = "positive" | "negative" | "ambivalent";

export type EvidenceTemporalWeight =
  | "childhood"
  | "past"
  | "recent"
  | "current";

export type EvidenceFragment = {
  id: string;
  source: EvidenceSource;
  text: string;
  tags?: string[];
  valence?: EvidenceValence;
  temporalWeight?: EvidenceTemporalWeight;
  intensity?: 1 | 2 | 3;
  repetition?: number;
  externalRecognition?: boolean;
  sacrificedFor?: boolean;
};