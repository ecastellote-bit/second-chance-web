import type { ProbableProfile } from "../types/profiles";
import type { DetectedSignal } from "../types/signals";
import type { ResultType } from "../types/result";
import type { MisreadRiskBlock } from "../types/finalDiagnostic";

type MisreadRiskInput = {
  dominantProfile: ProbableProfile | null | undefined;
  secondaryProfile: ProbableProfile | null | undefined;
  signals: DetectedSignal[];
  resultType: ResultType;
};

function getSignalKeys(signals: DetectedSignal[]): string[] {
  return Array.from(new Set(signals.map((signal) => signal.key)));
}

function buildFallbackRisk(
  secondaryProfile: ProbableProfile | null | undefined
): MisreadRiskBlock {
  return {
    headline:
      "Todavía no conviene sacar conclusiones demasiado cerradas sobre tu perfil.",
    explanation:
      "Hay señales útiles, pero todavía no alcanza para distinguir con suficiente precisión entre tu patrón dominante y otras capacidades vecinas que también aparecen en juego.",
    mistakenFor: secondaryProfile ? [secondaryProfile.label] : [],
  };
}

export function buildMisreadRisk(
  input: MisreadRiskInput
): MisreadRiskBlock {
  const profileId = input.dominantProfile?.id;
  const secondaryLabel = input.secondaryProfile?.label;
  const signalKeys = getSignalKeys(input.signals);

  if (!profileId || input.resultType === "insufficient_evidence") {
    return buildFallbackRisk(input.secondaryProfile);
  }

  if (profileId === "analytical_strategist") {
    return {
      headline:
        "Podrías confundirte con alguien operativo solo porque hoy resolvés muchas cosas.",
      explanation:
        "El riesgo principal acá es creer que tu lugar natural está en ejecutar o sostener operación solo porque hoy terminás resolviendo problemas concretos. Pero eso puede estar mostrando adaptación o contexto, no necesariamente tu forma más alta de generar valor. Tu diferencial aparece antes: en la lectura, el criterio y la comparación de caminos.",
      mistakenFor: secondaryLabel
        ? [secondaryLabel, "Technical Builder"]
        : ["Technical Builder"],
    };
  }

  if (profileId === "technical_builder") {
    return {
      headline:
        "Podrías sobreintelectualizar tu perfil y perder de vista que tu valor real aparece haciendo que algo funcione.",
      explanation:
        "El riesgo principal acá es creer que tu dirección está en análisis o estrategia solo porque usás criterio, estructura o lenguaje conceptual. Pero tu patrón dominante no está en leer escenarios por encima de todo, sino en intervenir sobre la realidad concreta para ordenarla, destrabarla y mejorarla.",
      mistakenFor: secondaryLabel
        ? [secondaryLabel, "Analytical Strategist"]
        : ["Analytical Strategist"],
    };
  }

  if (profileId === "diplomatic_social_connector") {
    return {
      headline:
        "Podrías ser leído como alguien de ayuda humana cuando en realidad tu fuerte está en articular actores.",
      explanation:
        "El riesgo principal acá es confundir sensibilidad interpersonal con vocación terapéutica o de acompañamiento profundo. Pero tu capacidad dominante no aparece en la escucha uno a uno como centro, sino en la coordinación entre partes, la lectura de intereses y la construcción de acuerdos o funcionamiento colectivo.",
      mistakenFor: secondaryLabel
        ? [secondaryLabel, "Empathic Guide"]
        : ["Empathic Guide"],
    };
  }

  if (profileId === "community_builder") {
    return {
      headline:
        "Podrías ser leído como simple escucha o simple coordinación cuando tu fuerza real está en sostener comunidad.",
      explanation:
        "El riesgo principal acá es reducir tu perfil a acompañamiento humano o a articulación práctica entre actores. Pero tu diferencial no aparece sobre todo en una persona ni en una negociación entre partes, sino en crear pertenencia, continuidad, circulación y vida grupal.",
      mistakenFor: secondaryLabel
        ? [secondaryLabel, "Empathic Guide", "Diplomatic Social Connector"]
        : ["Empathic Guide", "Diplomatic Social Connector"],
    };
  }

  if (profileId === "empathic_guide") {
    return {
      headline:
        "Podrías ser empujado a funciones de coordinación o sostén general cuando tu valor real es más humano y profundo.",
      explanation:
        "El riesgo principal acá es que tu escucha, tu presencia y tu capacidad de ordenar lo confuso queden mal leídas como simple habilidad social, community work o articulación entre partes. Pero tu núcleo aparece en comprender y acompañar procesos humanos, no en coordinar actores como función principal.",
      mistakenFor: secondaryLabel
        ? [secondaryLabel, "Community Builder", "Diplomatic Social Connector"]
        : ["Community Builder", "Diplomatic Social Connector"],
    };
  }

  if (profileId === "cultural_explorer") {
    const storytellerLike =
      signalKeys.includes("narrative_creation") || secondaryLabel === "Creative Storyteller";

    return {
      headline:
        "Podrías creer que tu lugar está en producir mensaje o relato cuando tu núcleo real aparece antes, en la exploración y la relación entre ideas.",
      explanation: storytellerLike
        ? "El riesgo principal acá es confundir capacidad de escribir o sintetizar con identidad narrativa dominante. Pero en tu caso eso puede ser una herramienta al servicio de otra cosa: leer contextos, conectar materiales, investigar y convertir curiosidad sostenida en comprensión útil."
        : "El riesgo principal acá es que tu curiosidad profunda quede leída como dispersión, consumo cultural o interés sin dirección. Pero el patrón dominante no es ruido: es exploración seria, relación entre contextos y lectura persistente.",
      mistakenFor: secondaryLabel
        ? [secondaryLabel, "Creative Storyteller"]
        : ["Creative Storyteller"],
    };
  }

  if (profileId === "creative_storyteller") {
    return {
      headline:
        "Podrías ser leído como alguien culto o estratégico, cuando tu valor real aparece al convertir eso en voz, mensaje y relato.",
      explanation:
        "El riesgo principal acá es que tu cultura, tus referencias o tu claridad conceptual tapen lo central: tu capacidad de nombrar, editar, construir mensaje y volver comunicable algo que sin vos quedaría disperso. Tu diferencial no está solo en entender, sino en dar forma verbal con impacto.",
      mistakenFor: secondaryLabel
        ? [secondaryLabel, "Cultural Explorer", "Analytical Strategist"]
        : ["Cultural Explorer", "Analytical Strategist"],
    };
  }

  return buildFallbackRisk(input.secondaryProfile);
}