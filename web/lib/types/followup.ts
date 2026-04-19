export type FollowupRound = 2 | 3;

export type AmbiguityType =
  | "guide_vs_community"
  | "guide_vs_connector"
  | "strategist_vs_builder"
  | "storyteller_vs_cultural"
  | "connector_vs_storyteller"
  | "weak_signal_general";

export type FollowupQuestionKind =
  | "open_text"
  | "contrast_choice"
  | "forced_choice"
  | "micro_narrative";

export type FollowupOption = {
  id: string;
  label: string;
  leansToward?: string[];
};

export type FollowupQuestion = {
  id: string;
  round: FollowupRound;
  ambiguityType: AmbiguityType;
  kind: FollowupQuestionKind;
  prompt: string;
  helpText?: string;
  options?: FollowupOption[];
};

export type FollowupAnswer = {
  questionId: string;
  value: string | string[];
};

export type FollowupPack = {
  ambiguityType: AmbiguityType;
  round: FollowupRound;
  title: string;
  objective: string;
  questions: FollowupQuestion[];
};