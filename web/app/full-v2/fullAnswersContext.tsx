"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  EconomicPressure,
  EmploymentStatus,
  EnergyLevel,
  FamilyLoad,
  UserIntake,
} from "@/lib/types/intake";
import type { FinalReading } from "@/lib/types/result";
import type { FollowupOrchestratorResult } from "@/lib/engines/followupOrchestrator";
import type { AmbiguityType, FollowupRound } from "@/lib/types/followup";

type ProfileState = {
  age: string;
  country: string;
  language: string;
  employmentStatus: EmploymentStatus;
  educationLevel: string;
  dependents: string;
};

type CurrentContextState = {
  currentRole: string;
  currentSituation: string;
  energyLevel: EnergyLevel;
  economicPressure: EconomicPressure;
  familyLoad: FamilyLoad;
  restrictionsText: string;
  assetsText: string;
  transitionGoal: string;
};

type NarrativeState = {
  childhoodMemories: string;
  earlyFascinations: string;
  meaningfulSchoolSubjects: string;
  repeatedWorkPatterns: string;
  naturalSocialRoles: string;
  lossesOrRenunciations: string;
  whatFeelsCompressedNow: string;
  additionalContext: string;
};

type FullFlowState = {
  profile: ProfileState;
  currentContext: CurrentContextState;
  narrative: NarrativeState;
};

type AnalysisState = {
  result: FinalReading | null;
  warnings: string[];
};

type FollowupAnswerValue = string | string[];

type FollowupCompletedRound = {
  round: 2 | 3;
  ambiguityType: AmbiguityType | null;
  answers: Record<string, FollowupAnswerValue>;
};

type FollowupState = {
  current: FollowupOrchestratorResult | null;
  answers: Record<string, FollowupAnswerValue>;
  completedRounds: FollowupCompletedRound[];
};

type ClarificationMetaPayload = {
  roundsCompleted: number;
  requestedRound?: FollowupRound;
  lockedAmbiguityType?: AmbiguityType | null;
};

type FullFlowAnalyzePayload = UserIntake & {
  clarificationMeta?: ClarificationMetaPayload;
};

type PersistedPayload = {
  state: FullFlowState;
  analysis: AnalysisState;
  followup: FollowupState;
};

type FullAnswersContextValue = {
  state: FullFlowState;
  analysis: AnalysisState;
  followup: FollowupState;
  isHydrated: boolean;
  updateProfile: <K extends keyof ProfileState>(
    field: K,
    value: ProfileState[K]
  ) => void;
  updateCurrentContext: <K extends keyof CurrentContextState>(
    field: K,
    value: CurrentContextState[K]
  ) => void;
  updateNarrative: <K extends keyof NarrativeState>(
    field: K,
    value: NarrativeState[K]
  ) => void;
  buildUserIntake: () => FullFlowAnalyzePayload;
  setAnalysis: (result: FinalReading | null, warnings?: string[]) => void;
  clearAnalysis: () => void;
  setFollowup: (followup: FollowupOrchestratorResult | null) => void;
  clearFollowup: () => void;
  updateFollowupAnswer: (
    questionId: string,
    value: FollowupAnswerValue
  ) => void;
  commitFollowupRound: () => void;
  resetFlow: () => void;
};

const STORAGE_KEY = "second-chance-full-flow-questionnaire-v2-beta";

const initialState: FullFlowState = {
  profile: {
    age: "",
    country: "Argentina",
    language: "es",
    employmentStatus: "employed",
    educationLevel: "",
    dependents: "",
  },
  currentContext: {
    currentRole: "",
    currentSituation: "",
    energyLevel: "medium",
    economicPressure: "medium",
    familyLoad: "moderate",
    restrictionsText: "",
    assetsText: "",
    transitionGoal: "",
  },
  narrative: {
    childhoodMemories: "",
    earlyFascinations: "",
    meaningfulSchoolSubjects: "",
    repeatedWorkPatterns: "",
    naturalSocialRoles: "",
    lossesOrRenunciations: "",
    whatFeelsCompressedNow: "",
    additionalContext: "",
  },
};

const initialAnalysis: AnalysisState = {
  result: null,
  warnings: [],
};

const initialFollowup: FollowupState = {
  current: null,
  answers: {},
  completedRounds: [],
};

const FullAnswersContext = createContext<FullAnswersContextValue | null>(null);

function splitList(text: string): string[] {
  return text
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function safeParsePersistedPayload(raw: string): PersistedPayload | null {
  try {
    const parsed = JSON.parse(raw) as PersistedPayload;
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.state || !parsed.analysis || !parsed.followup) return null;
    return parsed;
  } catch {
    return null;
  }
}

function hasMeaningfulValue(value: FollowupAnswerValue | undefined): boolean {
  if (Array.isArray(value)) {
    return value.some((item) => item.trim().length > 0);
  }

  return typeof value === "string" && value.trim().length > 0;
}

function formatFollowupAnswersForNarrative(
  followup: FollowupState
): string {
  const sections: string[] = [];

  for (const round of followup.completedRounds) {
    const lines = Object.entries(round.answers)
      .filter(([, value]) => hasMeaningfulValue(value))
      .map(([questionId, value]) => {
        const formatted = Array.isArray(value) ? value.join(" | ") : value;
        return `${questionId}: ${formatted}`;
      });

    if (lines.length > 0) {
      sections.push(
        `Ronda ${round.round} (${round.ambiguityType ?? "sin_ambiguedad"}):\n${lines.join("\n")}`
      );
    }
  }

  const pendingLines = Object.entries(followup.answers)
    .filter(([, value]) => hasMeaningfulValue(value))
    .map(([questionId, value]) => {
      const formatted = Array.isArray(value) ? value.join(" | ") : value;
      return `${questionId}: ${formatted}`;
    });

  if (pendingLines.length > 0 && followup.current?.round) {
    sections.push(
      `Ronda ${followup.current.round} (${followup.current.ambiguityType ?? "sin_ambiguedad"}):\n${pendingLines.join("\n")}`
    );
  }

  return sections.join("\n\n").trim();
}

export function FullAnswersProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FullFlowState>(initialState);
  const [analysis, setAnalysisState] = useState<AnalysisState>(initialAnalysis);
  const [followup, setFollowupState] = useState<FollowupState>(initialFollowup);
  const [isHydrated, setIsHydrated] = useState(false);
  const hasLoadedFromStorage = useRef(false);

  useEffect(() => {
    if (hasLoadedFromStorage.current) return;

    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = safeParsePersistedPayload(raw);
      if (parsed) {
        setState(parsed.state);
        setAnalysisState(parsed.analysis);
        setFollowupState(parsed.followup);
      }
    }

    hasLoadedFromStorage.current = true;
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const payload: PersistedPayload = {
      state,
      analysis,
      followup,
    };

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [state, analysis, followup, isHydrated]);

  const updateProfile: FullAnswersContextValue["updateProfile"] = (
    field,
    value
  ) => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value,
      },
    }));
  };

  const updateCurrentContext: FullAnswersContextValue["updateCurrentContext"] = (
    field,
    value
  ) => {
    setState((prev) => ({
      ...prev,
      currentContext: {
        ...prev.currentContext,
        [field]: value,
      },
    }));
  };

  const updateNarrative: FullAnswersContextValue["updateNarrative"] = (
    field,
    value
  ) => {
    setState((prev) => ({
      ...prev,
      narrative: {
        ...prev.narrative,
        [field]: value,
      },
    }));
  };

  const buildUserIntake = (): FullFlowAnalyzePayload => {
    const followupText = formatFollowupAnswersForNarrative(followup);

    const mergedAdditionalContext = [
      state.narrative.additionalContext.trim(),
      followupText
        ? `Evidencia adicional de rondas de clarificación:\n${followupText}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n")
      .trim();

    const completedRoundNumbers = followup.completedRounds.map((item) => item.round);

    const highestCompletedRound = Math.max(0, ...completedRoundNumbers);

    const roundsCompleted =
      highestCompletedRound >= 3 ? 2 : highestCompletedRound >= 2 ? 1 : 0;

    const lastCompletedRound =
      followup.completedRounds.length > 0
        ? followup.completedRounds[followup.completedRounds.length - 1]
        : undefined;

    const clarificationMeta: ClarificationMetaPayload | undefined =
      followup.current || roundsCompleted > 0
        ? {
            roundsCompleted,
            requestedRound: followup.current?.round ?? undefined,
            lockedAmbiguityType:
              followup.current?.ambiguityType ??
              lastCompletedRound?.ambiguityType ??
              null,
          }
        : undefined;

    return {
      profile: {
        age: state.profile.age ? Number(state.profile.age) : null,
        country: state.profile.country,
        language: state.profile.language,
        employmentStatus: state.profile.employmentStatus,
        educationLevel: state.profile.educationLevel,
        dependents: state.profile.dependents
          ? Number(state.profile.dependents)
          : null,
      },
      currentContext: {
        currentRole: state.currentContext.currentRole,
        currentSituation: state.currentContext.currentSituation,
        energyLevel: state.currentContext.energyLevel,
        economicPressure: state.currentContext.economicPressure,
        familyLoad: state.currentContext.familyLoad,
        restrictions: splitList(state.currentContext.restrictionsText),
        assets: splitList(state.currentContext.assetsText),
        transitionGoal: state.currentContext.transitionGoal,
      },
      narrative: {
        childhoodMemories: state.narrative.childhoodMemories,
        earlyFascinations: state.narrative.earlyFascinations,
        meaningfulSchoolSubjects: state.narrative.meaningfulSchoolSubjects,
        repeatedWorkPatterns: state.narrative.repeatedWorkPatterns,
        naturalSocialRoles: state.narrative.naturalSocialRoles,
        lossesOrRenunciations: state.narrative.lossesOrRenunciations,
        whatFeelsCompressedNow: state.narrative.whatFeelsCompressedNow,
        additionalContext: mergedAdditionalContext,
      },
      clarificationMeta,
    };
  };

  const setAnalysis = (result: FinalReading | null, warnings: string[] = []) => {
    setAnalysisState({ result, warnings });
  };

  const clearAnalysis = () => {
    setAnalysisState(initialAnalysis);
  };

  const setFollowup = (nextFollowup: FollowupOrchestratorResult | null) => {
    setFollowupState((prev) => ({
      ...prev,
      current: nextFollowup,
      answers: {},
    }));
  };

  const clearFollowup = () => {
    setFollowupState(initialFollowup);
  };

  const updateFollowupAnswer = (
    questionId: string,
    value: FollowupAnswerValue
  ) => {
    setFollowupState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: value,
      },
    }));
  };

  const commitFollowupRound = () => {
    setFollowupState((prev) => {
      if (!prev.current) return prev;

      const hasAnyAnswer = Object.values(prev.answers).some((value) =>
        hasMeaningfulValue(value)
      );

      if (!hasAnyAnswer) return prev;

      return {
        ...prev,
        completedRounds: [
          ...prev.completedRounds,
          {
            round: prev.current.round ?? 2,
            ambiguityType: prev.current.ambiguityType ?? null,
            answers: { ...prev.answers },
          },
        ],
        current: null,
        answers: {},
      };
    });
  };

  const resetFlow = () => {
    setState(initialState);
    setAnalysisState(initialAnalysis);
    setFollowupState(initialFollowup);
    window.sessionStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      state,
      analysis,
      followup,
      isHydrated,
      updateProfile,
      updateCurrentContext,
      updateNarrative,
      buildUserIntake,
      setAnalysis,
      clearAnalysis,
      setFollowup,
      clearFollowup,
      updateFollowupAnswer,
      commitFollowupRound,
      resetFlow,
    }),
    [state, analysis, followup, isHydrated]
  );

  return (
    <FullAnswersContext.Provider value={value}>
      {children}
    </FullAnswersContext.Provider>
  );
}

export function useFullAnswers() {
  const context = useContext(FullAnswersContext);

  if (!context) {
    throw new Error("useFullAnswers must be used inside FullAnswersProvider");
  }

  return context;
}