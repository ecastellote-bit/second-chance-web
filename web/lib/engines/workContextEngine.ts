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

function hasText(value: string | undefined | null): boolean {
  return Boolean(value && value.trim());
}

function pickContextItems(
  profileId: string | undefined,
  resultType: ResultType
): string[] {
  if (resultType === "compressed_life") {
    return [
      "menos urgencia permanente",
      "más margen real para pensar o desplegarte",
      "más continuidad y menos fragmentación",
      "menos reactividad defensiva",
    ];
  }

  switch (profileId) {
    case "analytical_strategist":
      return [
        "problemas complejos que no se resuelven solo con velocidad",
        "comparación de escenarios y alternativas",
        "decisiones donde el criterio importa",
        "espacio real para pensar antes de actuar",
      ];

    case "technical_builder":
      return [
        "operación concreta",
        "problemas visibles que haya que resolver de verdad",
        "mejora de procesos y funcionamiento",
        "prioridades claras y posibilidad de intervenir",
      ];

    case "diplomatic_social_connector":
      return [
        "actores múltiples",
        "intereses cruzados",
        "negociación práctica",
        "coordinación entre partes o sectores",
      ];

    case "community_builder":
      return [
        "grupos vivos con interacción sostenida",
        "necesidad de pertenencia y continuidad",
        "circulación entre personas",
        "espacios donde el clima colectivo importa",
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
        "lectura e investigación sostenida",
        "conexión entre contextos, ideas o materiales",
        "síntesis conceptual",
        "aprendizaje profundo, no solo consumo rápido",
      ];

    case "creative_storyteller":
      return [
        "escritura y edición con peso real",
        "construcción de mensaje o voz",
        "espacios donde el lenguaje importa",
        "trabajo de traducción de complejidad a relato claro",
      ];

    default:
      return [
        "más claridad funcional",
        "menos dispersión",
        "mejor uso de tu capacidad dominante",
      ];
  }
}

export function buildBestWorkContexts(
  input: WorkContextInput
): WorkContextBlock {
  const profileId = input.dominantProfile?.id;
  const hasCompressionNarrative = hasText(
    input.intake.narrative.whatFeelsCompressedNow
  );

  if (!profileId || input.resultType === "insufficient_evidence") {
    return {
      headline:
        "Todavía no aparece con suficiente claridad el tipo de contexto donde rendís mejor.",
      description:
        "Antes de definir entornos ideales, conviene afinar mejor cuál es tu patrón dominante. Ya hay señales útiles, pero todavía no alcanza para describir con suficiente precisión el tipo de espacio donde tu mejor versión rendiría de manera consistente.",
      items: [
        "más evidencia real",
        "menos adaptación táctica",
        "más contraste entre lo que te sale naturalmente y lo que hoy hacés por contexto",
      ],
    };
  }

  if (profileId === "analytical_strategist") {
    return {
      headline:
        "Rendís mejor donde hace falta leer complejidad, comparar caminos y orientar decisiones.",
      description: hasCompressionNarrative
        ? "Tu mejor versión no aparece en la ejecución inmediata constante, sino en entornos donde podés entender estructura, detectar criterio y pensar movimientos con cierta profundidad. Incluso si hoy eso está comprimido, el tipo de espacio que más te favorece es uno donde no todo se define por apuro, reacción o velocidad."
        : "Tu mejor versión no aparece en la ejecución inmediata constante, sino en entornos donde podés entender estructura, detectar criterio y pensar movimientos con cierta profundidad. El contexto que más te favorece es uno donde el valor no está solo en hacer, sino en ver mejor antes de mover.",
      items: pickContextItems(profileId, input.resultType),
    };
  }

  if (profileId === "technical_builder") {
    return {
      headline:
        "Rendís mejor donde hay que intervenir de verdad sobre la realidad, no solo hablar de ella.",
      description: hasCompressionNarrative
        ? "Tu capacidad aparece con fuerza cuando hay operación concreta, fallas reales, procesos mejorables y necesidad de ejecución con criterio. Incluso si hoy estás demasiado tomado por urgencias, el tipo de entorno que más te favorece es uno donde tu intervención mejora funcionamiento real y no queda atrapada en puro sostén defensivo."
        : "Tu capacidad aparece con fuerza cuando hay operación concreta, fallas reales, procesos mejorables y necesidad de ejecución con criterio. El contexto que más te favorece es uno donde podés ordenar, resolver y dejar algo funcionando mejor que antes.",
      items: pickContextItems(profileId, input.resultType),
    };
  }

  if (profileId === "diplomatic_social_connector") {
    return {
      headline:
        "Rendís mejor donde hay personas, intereses cruzados y necesidad de articulación fina.",
      description: hasCompressionNarrative
        ? "Tu mejor versión aparece cuando hay que leer posiciones, cuidar vínculos, coordinar partes y destrabar tensiones sin romper funcionamiento. Incluso si hoy esa capacidad está usada de forma reactiva, el entorno más compatible con vos es uno donde la articulación humana e institucional tenga peso real, y no quede escondida como trabajo táctico de fondo."
        : "Tu mejor versión aparece cuando hay que leer posiciones, cuidar vínculos, coordinar partes y destrabar tensiones sin romper funcionamiento. El entorno más compatible con vos es uno donde la articulación entre actores no sea un detalle, sino el corazón del trabajo.",
      items: pickContextItems(profileId, input.resultType),
    };
  }

  if (profileId === "community_builder") {
    return {
      headline:
        "Rendís mejor donde una comunidad necesita seguir viva, conectada y ordenada.",
      description: hasCompressionNarrative
        ? "Tu capacidad crece cuando hay grupos vivos, interacción sostenida y necesidad de cuidar clima, continuidad y sentido compartido. Incluso si hoy eso aparece como sostén invisible, el entorno que más te favorece es uno donde construir comunidad no sea accesorio ni emocionalmente subvalorado, sino parte central del valor."
        : "Tu capacidad crece cuando hay grupos vivos, interacción sostenida y necesidad de cuidar clima, continuidad y pertenencia. El contexto que más te favorece es uno donde sostener comunidad no sea algo lateral, sino una función reconocida y necesaria.",
      items: pickContextItems(profileId, input.resultType),
    };
  }

  if (profileId === "empathic_guide") {
    return {
      headline:
        "Rendís mejor donde hay personas reales, conflicto humano y tiempo para comprender antes de intervenir.",
      description: hasCompressionNarrative
        ? "Tu mejor versión aparece cuando podés escuchar de verdad, ordenar lo confuso y acompañar procesos humanos sin tener que reducir todo a trámite, respuesta rápida o sostén superficial. Incluso si hoy eso está disperso o comprimido, el entorno más compatible con vos es uno donde la comprensión humana tenga espacio real."
        : "Tu mejor versión aparece cuando podés escuchar de verdad, ordenar lo confuso y acompañar procesos humanos sin tener que convertir todo en velocidad, control o respuesta automática. El contexto adecuado para vos es uno donde la profundidad humana no estorba, sino que importa.",
      items: pickContextItems(profileId, input.resultType),
    };
  }

  if (profileId === "cultural_explorer") {
    return {
      headline:
        "Rendís mejor donde podés leer, investigar, relacionar y convertir curiosidad en comprensión útil.",
      description: hasCompressionNarrative
        ? "Tu capacidad se despliega mejor en entornos donde hay materiales complejos, ideas para conectar y tiempo para profundizar. Incluso si hoy eso aparece comprimido o desordenado, el contexto más compatible con vos es uno donde explorar, relacionar y ampliar lectura no sea un hobby oculto, sino parte del trabajo."
        : "Tu capacidad se despliega mejor en entornos donde hay materiales complejos, ideas para conectar y tiempo para profundizar. El contexto más compatible con vos es uno donde tu curiosidad no tenga que justificarse todo el tiempo, porque forma parte real del valor que producís.",
      items: pickContextItems(profileId, input.resultType),
    };
  }

  if (profileId === "creative_storyteller") {
    return {
      headline:
        "Rendís mejor donde escribir, editar y construir mensaje no sea una tarea secundaria.",
      description: hasCompressionNarrative
        ? "Tu mejor versión aparece cuando hay espacio para nombrar bien, ordenar sentido y transformar complejidad en lenguaje claro. Incluso si hoy esa capacidad está usada de forma funcional o comprimida, el entorno más compatible con vos es uno donde voz, mensaje y construcción narrativa tengan peso real."
        : "Tu mejor versión aparece cuando hay espacio para nombrar bien, ordenar sentido y transformar complejidad en lenguaje claro. El contexto más compatible con vos es uno donde la palabra no sea adorno, sino parte central del resultado.",
      items: pickContextItems(profileId, input.resultType),
    };
  }

  return {
    headline:
      "Tu mejor contexto parece ser uno donde tu capacidad dominante deje de quedar periférica.",
    description:
      "Ya aparece una dirección probable, y eso permite ver que rendirías mejor en un entorno más alineado con tu patrón central. Todavía puede faltar fineza, pero no parece que el problema sea falta de capacidad, sino falta de contexto apropiado para desplegarla.",
    items: pickContextItems(profileId, input.resultType),
  };
}