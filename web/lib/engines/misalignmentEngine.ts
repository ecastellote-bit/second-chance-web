import type { UserIntake } from "../types/intake";
import type { ProbableProfile } from "../types/profiles";
import type { DetectedSignal } from "../types/signals";
import type { ResultType } from "../types/result";
import type { MisalignmentBlock } from "../types/finalDiagnostic";

type MisalignmentInput = {
  intake: UserIntake;
  dominantProfile: ProbableProfile | null | undefined;
  signals: DetectedSignal[];
  resultType: ResultType;
};

function getSignalKeys(signals: DetectedSignal[]): string[] {
  return Array.from(new Set(signals.map((signal) => signal.key)));
}

function pickEvidenceKeys(
  availableKeys: string[],
  preferredKeys: string[]
): string[] {
  const matched = preferredKeys.filter((key) => availableKeys.includes(key));
  return matched.length > 0 ? matched : availableKeys.slice(0, 3);
}

function hasText(value: string | undefined | null): boolean {
  return Boolean(value && value.trim());
}

function hasManyRestrictions(intake: UserIntake): boolean {
  return (intake.currentContext.restrictions?.length ?? 0) >= 2;
}

function buildInsufficientEvidenceBlock(
  input: MisalignmentInput
): MisalignmentBlock {
  const signalKeys = getSignalKeys(input.signals);

  return {
    headline: "Todavía no aparece una dirección suficientemente nítida.",
    explanation:
      "Hay señales útiles, pero todavía no alcanza para decir con suficiente precisión qué parte tuya está mal usada y cuál es realmente central. Antes de empujar una dirección, conviene separar mejor lo que hacés por adaptación de lo que te sale de forma dominante.",
    severity: "medium",
    evidenceKeys: signalKeys.slice(0, 3),
  };
}

export function buildCurrentMisalignment(
  input: MisalignmentInput
): MisalignmentBlock {
  const profileId = input.dominantProfile?.id;
  const signalKeys = getSignalKeys(input.signals);
  const hasCompressionNarrative = hasText(
    input.intake.narrative.whatFeelsCompressedNow
  );
  const manyRestrictions = hasManyRestrictions(input.intake);

  if (!profileId || input.resultType === "insufficient_evidence") {
    return buildInsufficientEvidenceBlock(input);
  }

  if (input.resultType === "compressed_life") {
    return {
      headline:
        "La dirección aparece, pero hoy está comprimida por contexto, urgencia o margen real insuficiente.",
      explanation:
        "No parece que tu capacidad dominante esté ausente. Lo que aparece es otra cosa: está viva, pero usada en modo defensivo, parcial o reactivo. El problema principal hoy no es falta total de dirección, sino falta de espacio real para desplegarla como función central.",
      severity: "high",
      evidenceKeys: pickEvidenceKeys(signalKeys, [
        "social_coordination",
        "practical_organizing",
        "pattern_analysis",
        "empathic_listening",
      ]),
    };
  }

  if (profileId === "analytical_strategist") {
    return {
      headline:
        "Tu capacidad de lectura y criterio aparece usada por debajo de lo que podría valer.",
      explanation:
        "Tu parte más fuerte no parece estar en ejecutar sin pausa, sino en leer estructura, comparar escenarios y orientar decisiones. Cuando eso queda absorbido por urgencias, tareas reactivas o resolución inmediata, tu valor real se usa de forma parcial. El desajuste no está en que no rindas: está en que rendís en un plano más bajo que tu capacidad dominante.",
      severity:
        hasCompressionNarrative || manyRestrictions ? "high" : "medium",
      evidenceKeys: pickEvidenceKeys(signalKeys, [
        "pattern_analysis",
        "system_thinking",
        "opportunity_detection",
      ]),
    };
  }

  if (profileId === "technical_builder") {
    return {
      headline:
        "Tu capacidad de resolver, ordenar y hacer funcionar cosas puede estar atrapada en modo incendio.",
      explanation:
        "Tu patrón dominante es operativo y transformador, pero cuando toda tu energía se va en apagar urgencias o sostener funcionamiento mínimo, esa capacidad se degrada. El problema no es falta de potencia, sino uso reactivo de una capacidad que rendiría mucho más en contextos con algo más de diseño y continuidad.",
      severity:
        hasCompressionNarrative || manyRestrictions ? "high" : "medium",
      evidenceKeys: pickEvidenceKeys(signalKeys, [
        "practical_organizing",
        "system_thinking",
        "pattern_analysis",
      ]),
    };
  }

  if (profileId === "diplomatic_social_connector") {
    return {
      headline:
        "Tu capacidad de articular actores y ordenar acuerdos hoy puede estar usada demasiado en modo táctico.",
      explanation:
        "Tu valor aparece cuando leés intereses, conectás partes y sostenés funcionamiento entre actores distintos. El desajuste aparece cuando esa capacidad queda reducida a apagar tensiones, cuidar bordes o sostener equilibrios sin poder ocupar una función más clara y visible. No parece una falta de dirección, sino una dirección usada con margen demasiado corto.",
      severity:
        hasCompressionNarrative || manyRestrictions ? "high" : "medium",
      evidenceKeys: pickEvidenceKeys(signalKeys, [
        "social_coordination",
        "practical_organizing",
        "system_thinking",
      ]),
    };
  }

  if (profileId === "community_builder") {
    return {
      headline:
        "Tu capacidad de sostener comunidad puede estar quedando como trabajo invisible.",
      explanation:
        "Tu diferencial aparece en pertenencia, circulación, clima y continuidad grupal. El desajuste aparece cuando eso se vuelve sostén silencioso, tarea difusa o trabajo emocional no reconocido, en lugar de una función clara donde esa capacidad sea central y visible.",
      severity:
        hasCompressionNarrative || manyRestrictions ? "high" : "medium",
      evidenceKeys: pickEvidenceKeys(signalKeys, [
        "social_coordination",
        "empathic_listening",
        "narrative_creation",
        "practical_organizing",
      ]),
    };
  }

  if (profileId === "empathic_guide") {
    return {
      headline:
        "Tu capacidad de acompañar y dar claridad humana puede estar dispersa o subcanalizada.",
      explanation:
        "Tu valor aparece en la escucha profunda y en la capacidad de ayudar a otros a entender lo que viven. El desajuste aparece cuando esa capacidad queda absorbida por funciones generales, tareas operativas o ayuda informal sin una dirección propia reconocible. No es que no esté: está, pero todavía demasiado desordenada o periférica.",
      severity:
        hasCompressionNarrative || manyRestrictions ? "high" : "medium",
      evidenceKeys: pickEvidenceKeys(signalKeys, [
        "empathic_listening",
        "social_coordination",
        "practical_organizing",
      ]),
    };
  }

  if (profileId === "cultural_explorer") {
    return {
      headline:
        "Tu curiosidad profunda y tu capacidad de relacionar contextos pueden estar vivas, pero todavía poco convertidas en dirección visible.",
      explanation:
        "Tu patrón dominante aparece en la exploración, la lectura y la conexión entre ideas, autores o procesos. El desajuste aparece cuando eso queda como consumo, acumulación o interés sostenido sin convertirse en una trayectoria reconocible. No es una falta de riqueza interna; es una dificultad para transformar esa riqueza en línea clara.",
      severity:
        hasCompressionNarrative || manyRestrictions ? "high" : "medium",
      evidenceKeys: pickEvidenceKeys(signalKeys, [
        "cultural_curiosity",
        "pattern_analysis",
        "system_thinking",
      ]),
    };
  }

  if (profileId === "creative_storyteller") {
    return {
      headline:
        "Tu capacidad narrativa puede estar funcionando, pero en formatos demasiado utilitarios o ajenos a tu eje real.",
      explanation:
        "Tu diferencial aparece cuando escribís, editás, nombrás y volvés comunicable algo que sin vos quedaría disperso. El desajuste aparece cuando esa capacidad queda usada solo de forma funcional, comercial o secundaria, sin darle lugar a su potencia real de voz, mensaje y construcción de relato.",
      severity:
        hasCompressionNarrative || manyRestrictions ? "high" : "medium",
      evidenceKeys: pickEvidenceKeys(signalKeys, [
        "narrative_creation",
        "cultural_curiosity",
        "opportunity_detection",
      ]),
    };
  }

  return {
    headline:
      "Hay una capacidad real, pero todavía no está ocupando el lugar que podría ocupar.",
    explanation:
      "Las señales ya permiten ver un patrón dominante, pero también muestran que hoy esa capacidad no se está desplegando del todo como función central. El desajuste no parece estar en ausencia de talento, sino en contexto, canalización o uso parcial.",
    severity: hasCompressionNarrative || manyRestrictions ? "high" : "medium",
    evidenceKeys: signalKeys.slice(0, 3),
  };
}