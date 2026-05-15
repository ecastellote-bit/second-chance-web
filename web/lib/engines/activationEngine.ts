import type { GuidedThemeActivationPath } from "../types/guidedThemes";

export type ActivationOption = {
  id: string;
  path: GuidedThemeActivationPath;
  shortLabel: string;
  description: string;
  icon: "people" | "book" | "rocket" | "puzzle" | "compass";
  suggestedFirstStep: string;
  communityRouting: string[];
};

export type ActivationDecision = {
  selectedThemeId: string;
  selectedThemeLabel: string;
  availableActivations: ActivationOption[];
  diagnosticReinforcement: {
    confirmedFamilies: string[];
    confirmedAffinities: string[];
    diagnosticConfidenceBoost: number;
  };
  timestamp: string;
};

export type ActivationChoice = {
  themeId: string;
  activationPathId: string;
  userId?: string;
  timestamp: string;
};

const ACTIVATION_DEFINITIONS: Record<GuidedThemeActivationPath, Omit<ActivationOption, "id" | "communityRouting">> = {
  asociarme_con_otras_personas: {
    path: "asociarme_con_otras_personas",
    shortLabel: "Sumarme con otros",
    description: "Encontrar personas con intereses parecidos y construir algo juntos.",
    icon: "people",
    suggestedFirstStep: "Explorá los círculos activos relacionados con tu temática y sumate al que te llame.",
  },
  formarme_en_algo_nuevo: {
    path: "formarme_en_algo_nuevo",
    shortLabel: "Aprender algo nuevo",
    description: "Empezar una formación, curso o aprendizaje que te acerque a donde querés ir.",
    icon: "book",
    suggestedFirstStep: "Mirá las formaciones disponibles en tu temática y elegí una que puedas empezar esta semana.",
  },
  integrar_proyectos_existentes: {
    path: "integrar_proyectos_existentes",
    shortLabel: "Sumarme a un proyecto",
    description: "Participar en algo que ya existe y donde tu perfil puede aportar.",
    icon: "puzzle",
    suggestedFirstStep: "Revisá los proyectos activos que buscan colaboradores con tu perfil.",
  },
  armar_mi_propio_proyecto: {
    path: "armar_mi_propio_proyecto",
    shortLabel: "Crear mi proyecto",
    description: "Dar el primer paso para armar algo propio, aunque sea chiquito.",
    icon: "rocket",
    suggestedFirstStep: "Definí en una frase qué querés crear y publicalo en la comunidad para encontrar aliados.",
  },
  explorar_primero_comunidad: {
    path: "explorar_primero_comunidad",
    shortLabel: "Explorar primero",
    description: "Mirar, conectar y conocer antes de comprometerte con algo específico.",
    icon: "compass",
    suggestedFirstStep: "Entrá a la plaza y recorré lo que está pasando. Sin presión, solo explorá.",
  },
};

export function buildActivationDecision(input: {
  selectedThemeId: string;
  selectedThemeLabel: string;
  suggestedActivationPaths: GuidedThemeActivationPath[];
  communitySpaceHints: string[];
  matchedFamilies: string[];
  matchedAffinities: string[];
}): ActivationDecision {
  const availableActivations: ActivationOption[] = input.suggestedActivationPaths.map(
    (path, index) => ({
      id: `${input.selectedThemeId}_act_${index}`,
      ...ACTIVATION_DEFINITIONS[path],
      communityRouting: input.communitySpaceHints,
    }),
  );

  const confidenceBoost = Math.min(0.12, input.matchedFamilies.length * 0.04);

  return {
    selectedThemeId: input.selectedThemeId,
    selectedThemeLabel: input.selectedThemeLabel,
    availableActivations,
    diagnosticReinforcement: {
      confirmedFamilies: input.matchedFamilies,
      confirmedAffinities: input.matchedAffinities,
      diagnosticConfidenceBoost: confidenceBoost,
    },
    timestamp: new Date().toISOString(),
  };
}

export function recordActivationChoice(choice: ActivationChoice): {
  recorded: true;
  nextStep: string;
  communityDoor: "entender_camino" | "proximo_movimiento" | "conectar_con_otros";
} {
  const pathToNextStep: Record<GuidedThemeActivationPath, string> = {
    asociarme_con_otras_personas: "Te llevamos a los círculos donde podés encontrar personas con intereses parecidos.",
    formarme_en_algo_nuevo: "Te mostramos formaciones y recursos disponibles para tu temática.",
    integrar_proyectos_existentes: "Te conectamos con proyectos activos que buscan tu perfil.",
    armar_mi_propio_proyecto: "Te ayudamos a dar forma a tu idea y encontrar primeros aliados.",
    explorar_primero_comunidad: "Bienvenido a la plaza. Recorré sin presión y conectá cuando sientas.",
  };

  const pathToDoor: Record<GuidedThemeActivationPath, "entender_camino" | "proximo_movimiento" | "conectar_con_otros"> = {
    asociarme_con_otras_personas: "conectar_con_otros",
    formarme_en_algo_nuevo: "entender_camino",
    integrar_proyectos_existentes: "proximo_movimiento",
    armar_mi_propio_proyecto: "proximo_movimiento",
    explorar_primero_comunidad: "conectar_con_otros",
  };

  const path = choice.activationPathId as GuidedThemeActivationPath;

  return {
    recorded: true,
    nextStep: pathToNextStep[path] ?? pathToNextStep.explorar_primero_comunidad,
    communityDoor: pathToDoor[path] ?? "conectar_con_otros",
  };
}
