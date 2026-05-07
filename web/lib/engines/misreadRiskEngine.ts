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
      "Todavía sería apresurado sacar una conclusión demasiado cerrada sobre tu perfil.",
    explanation:
      "Ya hay señales valiosas, pero todavía no alcanza para separar con suficiente firmeza tu patrón dominante de otras capacidades vecinas que también aparecen en juego. En este punto, el riesgo no es no ver nada. El riesgo es cerrar demasiado rápido una lectura que todavía necesita más contraste.",
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
        "Tu presente puede hacerte parecer ejecutor, cuando en realidad rendís más leyendo y orientando decisiones.",
      explanation:
        "El error más probable acá es confundirte con alguien puramente operativo solo porque hoy resolvés muchas cosas concretas. Pero eso puede estar mostrando contexto, supervivencia o adaptación, no tu nivel más alto de valor. Tu diferencial aparece antes: en la lectura, el criterio, la comparación de caminos y la capacidad de ver con más claridad que otros qué conviene hacer.",
    };
  }

  if (profileId === "technical_builder") {
    return {
      headline:
        "Podrías explicarte como alguien muy estratégico, cuando tu valor más fuerte aparece haciendo que las cosas funcionen de verdad.",
      explanation:
        "El riesgo acá es sobreintelectualizar tu perfil porque usás criterio, estructura o lenguaje conceptual. Pero eso no necesariamente te convierte en alguien cuyo centro está en analizar escenarios. Tu patrón dominante aparece cuando intervenís sobre la realidad concreta, ordenás, resolvés, destrabás y mejorás funcionamiento real. Tu valor no está solo en entender: está en hacer que algo salga mejor después de pasar por vos.",
    };
  }

  if (profileId === "diplomatic_social_connector") {
    return {
      headline:
        "Podrían leerte como alguien de ayuda humana, cuando tu fuerza real está en ordenar actores, intereses y acuerdos.",
      explanation:
        "El error más probable acá es confundir sensibilidad interpersonal con vocación terapéutica o acompañamiento profundo. Pero tu centro no aparece en la escucha uno a uno como función principal. Aparece en la articulación: leer posiciones, cuidar vínculos, alinear partes y sostener funcionamiento entre actores distintos. No es que no tengas registro humano. Es que tu mejor versión aparece coordinando lo que está entre personas, no solo dentro de ellas.",
    };
  }

  if (profileId === "community_builder") {
    return {
      headline:
        "Podrías ser leído como simple escucha o simple coordinación, cuando tu fuerza real está en sostener comunidad.",
      explanation:
        "El error más probable acá es reducir tu perfil a acompañamiento humano o a articulación práctica entre partes. Pero tu diferencial no aparece sobre todo en una persona aislada ni en una negociación puntual, sino en sostener pertenencia, continuidad, circulación y vida grupal. Tu valor aparece cuando un espacio colectivo no se enfría, no se rompe y no pierde vínculo porque vos estás ahí.",
    };
  }

  if (profileId === "empathic_guide") {
    return {
      headline:
        "Podrían empujarte a roles de coordinación o sostén general, cuando tu valor real es más humano, más fino y más profundo.",
      explanation:
        "El error más probable acá es que tu escucha, tu presencia y tu capacidad de ordenar lo confuso queden mal leídas como simple habilidad social, trabajo comunitario general o articulación entre partes. Pero tu núcleo no aparece en coordinar actores como función principal. Aparece en comprender procesos humanos, acompañar sin invadir y ayudar a que alguien vea con más claridad lo que está viviendo.",
    };
  }

  if (profileId === "cultural_explorer") {
    const storytellerLike =
      signalKeys.includes("narrative_creation") ||
      secondaryLabel === "Creative Storyteller";

    return {
      headline:
        "Podrías creer que tu lugar está en producir relato, cuando tu núcleo real aparece antes: en explorar, conectar y leer contextos.",
      explanation: storytellerLike
        ? "El error más probable acá es confundir capacidad de escribir, sintetizar o explicar con identidad narrativa dominante. Pero en tu caso eso puede ser una herramienta al servicio de otra cosa más profunda: investigar, relacionar materiales, leer contextos y convertir curiosidad sostenida en comprensión útil. Tu valor no nace primero de la expresión. Nace de la exploración."
        : "El error más probable acá es que tu curiosidad profunda quede mal leída como dispersión, consumo cultural o interés sin dirección. Pero el patrón dominante no es ruido ni acumulación vacía: es exploración seria, relación entre contextos y lectura persistente de materiales que otros suelen dejar desconectados.",
    };
  }

  if (profileId === "creative_storyteller") {
    return {
      headline:
        "Podrían leerte como alguien culto, estratégico o simplemente expresivo, cuando tu valor real aparece al convertir eso en voz, mensaje y relato.",
      explanation:
        "El error más probable acá es que tu cultura, tus referencias o tu claridad conceptual tapen lo más importante: tu capacidad de nombrar, editar, construir mensaje y volver comunicable algo que sin vos quedaría difuso. Tu diferencial no está solo en entender ni en tener sensibilidad verbal. Está en encontrar la forma exacta para que algo gane voz, estructura e impacto.",
    };
  }

  return buildFallbackRisk(input.secondaryProfile);
}