import type { UserIntake } from "../types/intake";
import type { ProbableProfile } from "../types/profiles";
import type { DetectedSignal } from "../types/signals";
import type { ResultType } from "../types/result";
import type { WorkContextBlock } from "../types/finalDiagnostic";

type WorkContextInput = {
  intake: UserIntake;
  dominantProfile: ProbableProfile | null | undefined;
  signals: DetectedSignal[];
  resultType: ResultType;
};

function getSignalKeys(signals: DetectedSignal[]): string[] {
  return Array.from(new Set(signals.map((signal) => signal.key)));
}

function hasText(value: string | undefined | null): boolean {
  return Boolean(value && value.trim());
}

function pickEnvironmentMarkers(
  profileId: string | undefined,
  resultType: ResultType
): string[] {
  if (resultType === "compressed_life") {
    return [
      "menos urgencia permanente",
      "más margen real",
      "más continuidad",
      "menos reactividad",
    ];
  }

  switch (profileId) {
    case "analytical_strategist":
      return [
        "problemas complejos",
        "comparación de escenarios",
        "decisiones con criterio",
        "espacio para pensar antes de actuar",
      ];

    case "technical_builder":
      return [
        "operación concreta",
        "resolución de fallas",
        "mejora de procesos",
        "prioridades claras",
      ];

    case "diplomatic_social_connector":
      return [
        "actores múltiples",
        "intereses cruzados",
        "negociación práctica",
        "coordinación entre partes",
      ];

    case "community_builder":
      return [
        "grupos vivos",
        "pertenencia",
        "circulación entre personas",
        "continuidad colectiva",
      ];

    case "empathic_guide":
      return [
        "escucha profunda",
        "procesos humanos complejos",
        "uno a uno o grupos pequeños",
        "tiempo para comprender antes de intervenir",
      ];

    case "cultural_explorer":
      return [
        "lectura e investigación",
        "conexión entre contextos",
        "síntesis conceptual",
        "aprendizaje sostenido",
      ];

    case "creative_storyteller":
      return [
        "escritura y edición",
        "construcción de mensaje",
        "voz propia o editorial",
        "transformar complejidad en lenguaje",
      ];

    default:
      return [
        "más claridad funcional",
        "menos dispersión",
        "mejor uso de capacidades dominantes",
      ];
  }
}

export function buildBestWorkContexts(
  input: WorkContextInput
): WorkContextBlock {
  const profileId = input.dominantProfile?.id;
  const signalKeys = getSignalKeys(input.signals);
  const hasCompressionNarrative = hasText(
    input.intake.narrative.whatFeelsCompressedNow
  );

  if (!profileId || input.resultType === "insufficient_evidence") {
    return {
      headline:
        "Todavía no aparece con suficiente claridad el tipo de contexto donde rendís mejor.",
      explanation:
        "Antes de definir entornos ideales, conviene afinar mejor cuál es tu patrón dominante. Ya hay señales útiles, pero todavía no alcanza para describir con precisión el tipo de espacio donde tu mejor versión rendiría de forma consistente.",
      environmentMarkers: ["más evidencia", "menos adaptación táctica"],
    };
  }

  if (profileId === "analytical_strategist") {
    return {
      headline:
        "Rendís mejor en contextos donde hay que leer complejidad, comparar caminos y orientar decisiones.",
      explanation: hasCompressionNarrative
        ? "Tu mejor versión no aparece en la ejecución inmediata constante, sino en espacios donde podés entender estructura, detectar criterio y pensar movimientos con cierta profundidad. Incluso si hoy eso está comprimido, el contexto que más te favorece es uno con problemas complejos, margen para pensar y decisiones que no se definan solo por velocidad."
        : "Tu mejor versión no aparece en la ejecución inmediata constante, sino en espacios donde podés entender estructura, detectar criterio y pensar movimientos con cierta profundidad. El contexto que más te favorece es uno con problemas complejos, margen para pensar y decisiones que no se definan solo por velocidad.",
      environmentMarkers: pickEnvironmentMarkers(profileId, input.resultType),
    };
  }

  if (profileId === "technical_builder") {
    return {
      headline:
        "Rendís mejor en contextos donde hay que ordenar, resolver y hacer que algo funcione de verdad.",
      explanation: hasCompressionNarrative
        ? "Tu capacidad aparece con fuerza cuando hay operación concreta, procesos reales, trabas visibles y necesidad de ejecución con criterio. Incluso si hoy estás demasiado tomado por urgencias, el tipo de entorno que más te favorece es uno donde tu intervención mejora funcionamiento, no uno donde todo queda en diagnóstico abstracto."
        : "Tu capacidad aparece con fuerza cuando hay operación concreta, procesos reales, trabas visibles y necesidad de ejecución con criterio. El tipo de entorno que más te favorece es uno donde tu intervención mejora funcionamiento, no uno donde todo queda en diagnóstico abstracto.",
      environmentMarkers: pickEnvironmentMarkers(profileId, input.resultType),
    };
  }

  if (profileId === "diplomatic_social_connector") {
    return {
      headline:
        "Rendís mejor donde hay actores distintos, intereses cruzados y necesidad de articulación práctica.",
      explanation: hasCompressionNarrative
        ? "Tu mejor versión aparece cuando hay que leer posiciones, cuidar vínculos, coordinar partes y destrabar tensiones sin romper funcionamiento. Incluso si hoy esa capacidad está usada de forma reactiva, el entorno más compatible con vos es uno donde la articulación humana e institucional tiene peso real."
        : "Tu mejor versión aparece cuando hay que leer posiciones, cuidar vínculos, coordinar partes y destrabar tensiones sin romper funcionamiento. El entorno más compatible con vos es uno donde la articulación humana e institucional tiene peso real.",
      environmentMarkers: pickEnvironmentMarkers(profileId, input.resultType),
    };
  }

  if (profileId === "community_builder") {
    return {
      headline:
        "Rendís mejor en contextos donde hay comunidad, circulación y necesidad de sostener pertenencia.",
      explanation: hasCompressionNarrative
        ? "Tu capacidad crece cuando hay grupos vivos, interacción sostenida y necesidad de cuidar clima, continuidad y sentido compartido. Incluso si hoy eso aparece como trabajo invisible, el entorno que más te favorece es uno donde sostener comunidad no sea accesorio, sino parte central del valor."
        : "Tu capacidad crece cuando hay grupos vivos, interacción sostenida y necesidad de cuidar clima, continuidad y sentido compartido. El entorno que más te favorece es uno donde sostener comunidad no sea accesorio, sino parte central del valor.",
      environmentMarkers: pickEnvironmentMarkers(profileId, input.resultType),
    };
  }

  if (profileId === "empathic_guide") {
    return {
      headline:
        "Rendís mejor en espacios donde hay personas reales, conflicto humano y tiempo para comprender antes de intervenir.",
      explanation: hasCompressionNarrative
        ? "Tu mejor versión aparece cuando podés escuchar de verdad, ordenar lo confuso y acompañar procesos humanos sin tener que reducir todo a respuesta rápida o trámite. Incluso si hoy eso está disperso o comprimido, el contexto adecuado para vos es uno donde la comprensión humana tenga lugar real."
        : "Tu mejor versión aparece cuando podés escuchar de verdad, ordenar lo confuso y acompañar procesos humanos sin tener que reducir todo a respuesta rápida o trámite. El contexto adecuado para vos es uno donde la comprensión humana tenga lugar real.",
      environmentMarkers: pickEnvironmentMarkers(profileId, input.resultType),
    };
  }

  if (profileId === "cultural_explorer") {
    return {
      headline:
        "Rendís mejor en contextos donde podés leer, investigar, relacionar y convertir curiosidad en comprensión útil.",
      explanation: hasCompressionNarrative
        ? "Tu capacidad se despliega mejor en entornos donde hay materiales complejos, ideas para conectar y tiempo para profundizar. Incluso si hoy eso aparece solo como interés sostenido o curiosidad comprimida, el contexto más compatible con vos es uno donde explorar y relacionar no sea un hobby oculto, sino parte del trabajo."
        : "Tu capacidad se despliega mejor en entornos donde hay materiales complejos, ideas para conectar y tiempo para profundizar. El contexto más compatible con vos es uno donde explorar y relacionar no sea un hobby oculto, sino parte del trabajo.",
      environmentMarkers: pickEnvironmentMarkers(profileId, input.resultType),
    };
  }

  if (profileId === "creative_storyteller") {
    return {
      headline:
        "Rendís mejor en contextos donde escribir, editar y construir mensaje no sea una tarea secundaria.",
      explanation: hasCompressionNarrative
        ? "Tu mejor versión aparece cuando hay espacio para nombrar bien, ordenar sentido y transformar complejidad en lenguaje claro. Incluso si hoy esa capacidad está usada de manera funcional o comprimida, el entorno más compatible con vos es uno donde voz, mensaje y construcción narrativa tengan peso real."
        : "Tu mejor versión aparece cuando hay espacio para nombrar bien, ordenar sentido y transformar complejidad en lenguaje claro. El entorno más compatible con vos es uno donde voz, mensaje y construcción narrativa tengan peso real.",
      environmentMarkers: pickEnvironmentMarkers(profileId, input.resultType),
    };
  }

  return {
    headline:
      "Tu mejor contexto parece ser uno donde tu capacidad dominante deje de estar periférica.",
    explanation:
      "Ya aparece una dirección probable, y eso permite ver que rendirías mejor en un entorno más alineado con tu patrón central. Todavía puede faltar fineza, pero no parece que el problema sea falta de capacidad, sino falta de contexto apropiado.",
    environmentMarkers: pickEnvironmentMarkers(profileId, input.resultType),
  };
}