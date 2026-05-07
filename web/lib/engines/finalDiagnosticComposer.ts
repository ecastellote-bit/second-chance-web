import type { UserIntake } from "../types/intake";
import type { EmployabilityDirection, ProbableProfile } from "../types/profiles";
import type { DetectedSignal } from "../types/signals";
import type { ResultType } from "../types/result";
import type {
  ComposerFinalDiagnostic,
  DirectionSnapshot,
  FunctionalSubtypeDetail,
  NextMoveBlock,
} from "../types/finalDiagnostic";
import { toDiagnosticProfileSnapshot } from "../types/finalDiagnostic";
import { buildValueGeneration } from "./valueGenerationEngine";
import { buildCurrentMisalignment } from "./misalignmentEngine";
import { buildBestWorkContexts } from "./workContextEngine";
import { buildMisreadRisk } from "./misreadRiskEngine";
import { buildTransitionRecommendation } from "./transitionRecommendationEngine";

export type FinalDiagnosticComposerInput = {
  intake: UserIntake;
  signals: DetectedSignal[];
  profiles: ProbableProfile[];
  plausibleDirections: EmployabilityDirection[];
  resultType: ResultType;
};

function getSignalKeys(signals: DetectedSignal[]): string[] {
  return Array.from(new Set(signals.map((signal) => signal.key)));
}

function hasSignal(signalKeys: string[], key: string): boolean {
  return signalKeys.includes(key);
}

function toDirectionSnapshot(
  direction: EmployabilityDirection
): DirectionSnapshot {
  return {
    id: direction.id,
    ecosystem: direction.ecosystem,
    label: direction.label,
    rationale: direction.whyItFits,
  };
}

function buildFunctionalSubtype(
  dominantProfile: ProbableProfile | null | undefined,
  signals: DetectedSignal[]
): FunctionalSubtypeDetail | null {
  if (!dominantProfile) return null;

  const signalKeys = getSignalKeys(signals);
  const profileId = dominantProfile.id;

  if (profileId === "analytical_strategist") {
    if (
      hasSignal(signalKeys, "pattern_analysis") &&
      hasSignal(signalKeys, "opportunity_detection")
    ) {
      return {
        id: "scenario_reader_decision_criteria",
        label: "Lector de escenarios con criterio de decisión",
        explanation:
          "Tu patrón no es solo analítico: aparece especialmente cuando comparás caminos, detectás oportunidades y ordenás criterio antes de decidir.",
      };
    }

    return {
      id: "complexity_organizer",
      label: "Ordenador de complejidad",
      explanation:
        "Tu forma dominante aparece cuando bajás complejidad, leés estructura y ayudás a pensar con más claridad.",
    };
  }

  if (profileId === "technical_builder") {
    if (
      hasSignal(signalKeys, "practical_organizing") &&
      hasSignal(signalKeys, "system_thinking")
    ) {
      return {
        id: "operational_solver_with_criteria",
        label: "Resolvedor operativo con criterio",
        explanation:
          "Tu valor aparece cuando intervenís sobre lo real, ordenás prioridades y hacés que algo funcione mejor sin perder lógica.",
      };
    }

    return {
      id: "concrete_operations_designer",
      label: "Diseñador de operación concreta",
      explanation:
        "Tu patrón aparece menos en el análisis abstracto y más en la mejora real de procesos, tareas y funcionamiento.",
    };
  }

  if (profileId === "diplomatic_social_connector") {
    if (
      hasSignal(signalKeys, "social_coordination") &&
      hasSignal(signalKeys, "system_thinking")
    ) {
      return {
        id: "institutional_actor_articulator",
        label: "Articulador institucional de actores",
        explanation:
          "Tu diferencial aparece cuando leés intereses, coordinás partes y sostenés acuerdos o funcionamiento entre actores distintos.",
      };
    }

    return {
      id: "practical_mediator_between_parts",
      label: "Mediador práctico entre partes",
      explanation:
        "Tu fuerza aparece en ordenar tensiones, acercar posiciones y hacer viable la convivencia entre intereses cruzados.",
    };
  }

  if (profileId === "community_builder") {
    return {
      id: "belonging_and_flow_sustainer",
      label: "Sostenedor de pertenencia y circulación",
      explanation:
        "Tu patrón dominante aparece cuando cuidás clima, continuidad, interacción y vida grupal para que una comunidad siga viva.",
    };
  }

  if (profileId === "empathic_guide") {
    if (hasSignal(signalKeys, "practical_organizing")) {
      return {
        id: "structured_human_guide",
        label: "Acompañante con claridad estructurante",
        explanation:
          "Tu diferencial aparece en la escucha profunda, pero también en la capacidad de ordenar lo confuso sin invadir.",
      };
    }

    return {
      id: "deep_listener_with_criteria",
      label: "Escucha profunda con criterio",
      explanation:
        "Tu patrón dominante aparece cuando comprendés procesos humanos complejos y ayudás a otros a ver con más claridad lo que les pasa.",
    };
  }

  if (profileId === "cultural_explorer") {
    if (
      hasSignal(signalKeys, "pattern_analysis") &&
      hasSignal(signalKeys, "system_thinking")
    ) {
      return {
        id: "context_reader_and_connector",
        label: "Lector de contextos y relaciones",
        explanation:
          "Tu patrón no es solo curiosidad: aparece cuando conectás contextos, autores o procesos y encontrás relaciones que otros no ven.",
      };
    }

    return {
      id: "rigorous_cultural_explorer",
      label: "Explorador cultural riguroso",
      explanation:
        "Tu fuerza aparece en la exploración sostenida, la lectura profunda y la conexión entre materiales complejos.",
    };
  }

  if (profileId === "creative_storyteller") {
    if (hasSignal(signalKeys, "opportunity_detection")) {
      return {
        id: "message_builder_with_strategic_sense",
        label: "Constructor de mensaje con sentido estratégico",
        explanation:
          "Tu diferencial aparece cuando convertís materiales complejos en voz, mensaje y relato con claridad e intención.",
      };
    }

    return {
      id: "narrative_synthesizer",
      label: "Narrador y sintetizador de complejidad",
      explanation:
        "Tu patrón dominante aparece cuando nombrás, editás y le das forma verbal a algo que sin vos quedaría disperso.",
    };
  }

  return {
    id: `${profileId}_functional_subtype`,
    label: dominantProfile.label,
    explanation: dominantProfile.summary,
  };
}

function buildNextMove(
  resultType: ResultType,
  dominantProfile: ProbableProfile | null | undefined
): NextMoveBlock {
  const profileId = dominantProfile?.id;

  if (resultType === "insufficient_evidence" || !profileId) {
    return {
      headline: "Antes de moverte, necesitás confirmar mejor el patrón.",
      explanation:
        "No conviene tomar decisiones grandes todavía. Lo más inteligente es juntar mejor evidencia y ver qué capacidad se repite incluso cuando cambia el contexto.",
      actions: [
        "Anotá durante 10 días qué tarea te sale naturalmente mejor que al resto.",
        "Separá por escrito lo que hacés por adaptación de lo que te representa de verdad.",
        "Volvé a responder preguntas de desempate si el sistema todavía no logra afirmar dirección.",
      ],
    };
  }

  if (resultType === "compressed_life") {
    return {
      headline: "No empujes un salto fuerte: primero protegé la línea que ya apareció.",
      explanation:
        "La dirección existe, pero hoy no tiene margen suficiente para desplegarse como movimiento grande. Conviene validarla sin romper tu estructura actual.",
      actions: [
        "Identificá una tarea semanal donde tu patrón dominante sí aparezca, aunque sea en pequeño.",
        "Separá por escrito qué parte de tu vida actual es sostén y qué parte expresa tu capacidad real.",
        "Probá una validación de bajo riesgo en la dirección compatible más fuerte, sin desordenar ingresos ni contexto.",
      ],
    };
  }

  if (profileId === "analytical_strategist") {
    return {
      headline: "Dale forma visible a tu criterio.",
      explanation:
        "No alcanza con saber que pensás bien. Ahora hay que traducir esa capacidad a funciones, problemas y espacios donde otros puedan verla y usarla.",
      actions: [
        "Hacé una lista de tres situaciones recientes donde hayas ordenado criterio o comparado caminos mejor que otros.",
        "Traducí esa capacidad a lenguaje laboral concreto: análisis, decisiones, escenarios, prioridades.",
        "Probá una tarea real o conversación orientada a strategy / operations o business analysis.",
      ],
    };
  }

  if (profileId === "technical_builder") {
    return {
      headline: "Mostrá tu capacidad de resolver como sistema, no solo como aguante.",
      explanation:
        "Tu valor ya aparece. El próximo paso no es demostrar que trabajás mucho, sino que mejorás funcionamiento real.",
      actions: [
        "Elegí tres problemas concretos que resolviste y describí qué cambió gracias a tu intervención.",
        "Separá tareas de incendio de tareas de mejora real para mostrar mejor tu patrón.",
        "Buscá espacios donde tu orden operativo tenga continuidad y no solo urgencia.",
      ],
    };
  }

  if (profileId === "diplomatic_social_connector") {
    return {
      headline: "Convertí tu capacidad de articulación en función visible.",
      explanation:
        "Tu patrón ya aparece. El paso siguiente es dejar de usarlo solo para sostener urgencias y empezar a nombrarlo como valor central.",
      actions: [
        "Identificá tres situaciones donde hayas alineado actores, negociado bordes o destrabado tensiones.",
        "Traducí esa experiencia a lenguaje claro: articulación, coordinación, relaciones institucionales, partnerships.",
        "Probá una conversación o validación concreta en un entorno donde haya actores múltiples y necesidad de acuerdo.",
      ],
    };
  }

  if (profileId === "community_builder") {
    return {
      headline: "Hacé visible el valor de sostener comunidad.",
      explanation:
        "Tu aporte suele quedar como sostén invisible. El próximo paso es nombrarlo mejor y validarlo en entornos donde pertenencia y circulación importen de verdad.",
      actions: [
        "Anotá ejemplos concretos donde hayas sostenido clima, continuidad o pertenencia grupal.",
        "Separá trabajo emocional difuso de construcción real de comunidad.",
        "Probá una validación breve en community operations, program coordination o espacios colectivos similares.",
      ],
    };
  }

  if (profileId === "empathic_guide") {
    return {
      headline: "Convertí tu capacidad de acompañar en una función reconocible.",
      explanation:
        "Tu diferencial no debería quedar reducido a ayuda informal. El siguiente paso es traducirlo a una dirección donde esa escucha tenga forma y lugar.",
      actions: [
        "Detectá tres situaciones donde tu escucha cambió de verdad la claridad o el estado de otra persona.",
        "Nombrá con precisión tu valor: escucha profunda, acompañamiento, preguntas justas, orden de lo confuso.",
        "Probá una validación en people support, customer success u otro entorno compatible con acompañamiento estructurado.",
      ],
    };
  }

  if (profileId === "cultural_explorer") {
    return {
      headline: "Pasá de interés sostenido a línea visible.",
      explanation:
        "Tu riqueza interna ya aparece. El próximo paso es que deje de vivir solo como curiosidad y empiece a tomar forma práctica.",
      actions: [
        "Elegí un tema o eje donde tu curiosidad sea realmente persistente, no solo amplia.",
        "Reuní tres ejemplos donde hayas conectado contextos, autores o procesos con valor real.",
        "Probá una validación concreta en research support, learning content o un formato compatible con exploración aplicada.",
      ],
    };
  }

  if (profileId === "creative_storyteller") {
    return {
      headline: "Llevá tu capacidad narrativa a un espacio donde tenga peso central.",
      explanation:
        "Tu valor ya aparece cuando escribís, editás y construís mensaje. El siguiente paso es darle un marco donde eso no quede como tarea secundaria.",
      actions: [
        "Juntá tres ejemplos donde hayas transformado algo confuso en mensaje claro, voz o relato.",
        "Separá escritura funcional de construcción narrativa real para no mezclar ambas cosas.",
        "Probá una validación concreta en content strategy, editorial projects o funciones afines.",
      ],
    };
  }

  return {
    headline: "Convertí la señal en movimiento chico pero real.",
    explanation:
      "Ya aparece una dirección plausible. El próximo paso no es exagerarla, sino validarla con una acción concreta y de bajo riesgo.",
    actions: [
      "Traducí tu patrón dominante a ejemplos recientes y verificables.",
      "Probá una validación pequeña en una dirección compatible.",
      "Revisá si esa línea también aparece fuera del relato y dentro de la práctica.",
    ],
  };
}

function buildSummary(
  resultType: ResultType,
  dominantProfile: ProbableProfile | null | undefined,
  functionalSubtype: FunctionalSubtypeDetail | null,
  compatibleDirections: DirectionSnapshot[]
): { headline: string; diagnostico: string } {
  if (!dominantProfile || resultType === "insufficient_evidence") {
    return {
      headline: "Todavía no aparece una dirección suficientemente nítida.",
      diagnostico:
        "Hay señales útiles, pero todavía no alcanza para afirmar con suficiente precisión cuál es tu función dominante. El próximo paso correcto no es forzar una identidad, sino confirmar mejor el patrón real.",
    };
  }

  const subtypeLabel = functionalSubtype?.label;
  const firstDirection = compatibleDirections[0]?.label;

  if (resultType === "compressed_life") {
    return {
      headline: subtypeLabel
        ? `Tu línea dominante aparece, pero hoy está comprimida: ${subtypeLabel}.`
        : `Tu línea dominante aparece, pero hoy está comprimida: ${dominantProfile.label}.`,
      diagnostico: firstDirection
        ? `No parece faltar dirección. Lo que falta es margen real. Tu patrón principal ya se deja leer y tiene salida compatible en ${firstDirection}, pero hoy el contexto todavía lo mantiene funcionando por debajo de su potencial.`
        : "No parece faltar dirección. Lo que falta es margen real. Tu patrón principal ya se deja leer, pero hoy el contexto todavía lo mantiene funcionando por debajo de su potencial.",
    };
  }

  return {
    headline: subtypeLabel
      ? `Tu dirección dominante hoy se parece más a esto: ${subtypeLabel}.`
      : `Tu dirección dominante hoy se parece más a esto: ${dominantProfile.label}.`,
    diagnostico: firstDirection
      ? `El patrón central ya aparece con suficiente claridad. No define toda tu identidad, pero sí muestra una forma dominante de generar valor y una salida compatible plausible en ${firstDirection}.`
      : "El patrón central ya aparece con suficiente claridad. No define toda tu identidad, pero sí muestra una forma dominante de generar valor y una salida compatible plausible.",
  };
}

export function buildFinalDiagnostic(
  input: FinalDiagnosticComposerInput
): ComposerFinalDiagnostic {
  const dominantProfile = input.profiles[0] ?? null;
  const secondaryProfile = input.profiles[1] ?? null;

  const dominantProfileSnapshot = toDiagnosticProfileSnapshot(dominantProfile);
  const secondaryProfileSnapshot = toDiagnosticProfileSnapshot(secondaryProfile);

  const functionalSubtype = buildFunctionalSubtype(dominantProfile, input.signals);

  const valueGeneration = buildValueGeneration({
    intake: input.intake,
    dominantProfile,
    signals: input.signals,
  });

  const currentMisalignment = buildCurrentMisalignment({
    intake: input.intake,
    dominantProfile,
    signals: input.signals,
    resultType: input.resultType,
  });

  const bestContexts = buildBestWorkContexts({
    intake: input.intake,
    dominantProfile,
    signals: input.signals,
    resultType: input.resultType,
  });

  const misreadRisk = buildMisreadRisk({
    dominantProfile,
    secondaryProfile,
    signals: input.signals,
    resultType: input.resultType,
  });

  const compatibleDirections = input.plausibleDirections
    .slice(0, 3)
    .map(toDirectionSnapshot);

  const transitionRecommendation = buildTransitionRecommendation({
    intake: input.intake,
    dominantProfile,
    resultType: input.resultType,
  });

  const nextMove = buildNextMove(input.resultType, dominantProfile);

  const summaryForUser = buildSummary(
    input.resultType,
    dominantProfile,
    functionalSubtype,
    compatibleDirections
  );

  return {
    resultType: input.resultType,

    dominantProfile: dominantProfileSnapshot,
    secondaryProfile: secondaryProfileSnapshot,

    functionalSubtype,

    valueGeneration,
    currentMisalignment,
    bestContexts,
    misreadRisk,

    compatibleDirections,
    transitionRecommendation,
    nextMove,

    summaryForUser,
  };
}