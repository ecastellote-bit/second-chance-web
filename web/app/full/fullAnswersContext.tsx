"use client";

import {
  createContext,
  useContext,
  useMemo,
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

type FullAnswersContextValue = {
  state: FullFlowState;
  analysis: AnalysisState;
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
  buildUserIntake: () => UserIntake;
  setAnalysis: (result: FinalReading | null, warnings?: string[]) => void;
  clearAnalysis: () => void;
};

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

const FullAnswersContext = createContext<FullAnswersContextValue | null>(null);

function splitList(text: string): string[] {
  return text
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function FullAnswersProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FullFlowState>(initialState);
  const [analysis, setAnalysisState] = useState<AnalysisState>({
    result: null,
    warnings: [],
  });

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

  const buildUserIntake = (): UserIntake => {
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
        additionalContext: state.narrative.additionalContext,
      },
    };
  };

  const setAnalysis = (result: FinalReading | null, warnings: string[] = []) => {
    setAnalysisState({ result, warnings });
  };

  const clearAnalysis = () => {
    setAnalysisState({ result: null, warnings: [] });
  };

  const value = useMemo(
    () => ({
      state,
      analysis,
      updateProfile,
      updateCurrentContext,
      updateNarrative,
      buildUserIntake,
      setAnalysis,
      clearAnalysis,
    }),
    [state, analysis]
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