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
    headline:
      "Todavía no aparece con suficiente claridad qué parte tuya está quedando mal usada.",
    explanation:
      "Ya hay señales valiosas, pero todavía no alcanza para distinguir con suficiente firmeza qué capacidad es realmente central y cuál está apareciendo solo por adaptación, contexto o mezcla con otras. Antes de empujar una dirección, conviene separar mejor tu patrón dominante de tus respuestas tácticas al presente.",
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
        "La dirección aparece, pero hoy está funcionando por debajo de lo que realmente podría desplegar.",
      explanation:
        "No da la impresión de que tu capacidad dominante esté ausente. Lo que aparece es otra cosa: está viva, pero demasiado apretada por contexto, urgencia, cansancio o margen insuficiente. El problema principal hoy no es falta de patrón, sino falta de espacio real para que ese patrón deje de operar en modo defensivo y pase a ocupar un lugar más central.",
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
        "Tu capacidad de leer, comparar y orientar decisiones hoy parece usada por debajo de su verdadero nivel.",
      explanation:
        "Tu valor más alto no aparece en correr detrás de urgencias ni en resolver todo en modo inmediato. Aparece cuando podés leer estructura, comparar escenarios y mostrar con claridad qué conviene hacer. El desajuste está en que esa capacidad termina absorbida por tareas más reactivas, más cortas o más tácticas. No parece que estés fuera de eje por falta de talento, sino porque tu mejor nivel está siendo usado demasiado abajo.",
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
        "Tu capacidad de resolver y ordenar puede estar atrapada en puro sostén, cuando podría estar mejor usada en mejora real.",
      explanation:
        "Tu patrón dominante no parece roto. Lo que aparece es un uso demasiado reactivo de una capacidad que rendiría mucho más en contextos con más continuidad, diseño y margen de mejora. Cuando toda tu energía se va en apagar incendios o sostener funcionamiento mínimo, seguís rindiendo, sí, pero en una versión más desgastante y más pobre de tu valor real.",
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
        "Tu capacidad de articular personas y ordenar acuerdos puede estar reducida a apagar tensiones en vez de ocupar una función más visible.",
      explanation:
        "Tu valor aparece cuando leés actores, entendés intereses cruzados y hacés que distintas partes puedan convivir, coordinarse o avanzar sin romperse. El desajuste aparece cuando esa capacidad queda usada solo para sostener bordes, apagar fricciones o evitar choques, sin llegar a expresarse como función central. No parece una dirección equivocada: parece una dirección válida, pero usada con demasiado margen corto.",
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
        "Tu capacidad de sostener comunidad puede estar quedando escondida detrás de tareas que parecen menores, pero no lo son.",
      explanation:
        "Tu diferencial aparece en clima, continuidad, pertenencia, circulación y vida grupal. El desajuste aparece cuando todo eso queda reducido a sostén invisible, trabajo difuso o función emocional poco reconocida. En vez de ser leído como una capacidad central, termina pareciendo algo que simplemente “hacés bien” al costado. El problema no es falta de valor: es que ese valor todavía no está ocupando un lugar suficientemente claro y nombrado.",
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
        "Tu capacidad de acompañar, escuchar y traer claridad humana puede estar demasiado dispersa o mal canalizada.",
      explanation:
        "Tu valor aparece cuando ayudás a otra persona a entender mejor lo que vive, ordenar lo confuso y salir de cierto enredo interno. El desajuste aparece cuando esa capacidad queda absorbida por tareas generales, ayuda informal, funciones operativas o sostén sin nombre. No parece que esa parte tuya esté ausente. Parece que todavía no encontró una forma lo bastante clara, visible y propia para desplegarse con todo su peso.",
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
        "Tu curiosidad profunda sigue viva, pero todavía no terminó de convertirse en una dirección que se vea desde afuera.",
      explanation:
        "Tu patrón dominante aparece en la exploración, la lectura y la relación entre ideas, procesos, autores o contextos. El desajuste aparece cuando toda esa riqueza interna queda como interés sostenido, consumo exigente o acumulación de comprensión sin forma visible. No parece una falta de mundo interno. Lo que aparece es una dificultad para convertir ese caudal en una línea clara, reconocible y aprovechable.",
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
        "Tu capacidad narrativa puede estar viva, pero usada en formatos demasiado utilitarios para todo lo que realmente podría dar.",
      explanation:
        "Tu diferencial aparece cuando escribís, nombrás, editás y volvés comunicable algo que sin vos quedaría disperso. El desajuste aparece cuando esa capacidad queda puesta al servicio de tareas funcionales, mensajes secundarios o formatos demasiado estrechos para su potencia real. No parece que falte voz. Lo que aparece es una voz usada en escala menor, o al servicio de fines que no terminan de aprovecharla.",
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
      "Las señales ya permiten ver un patrón dominante, pero también muestran que hoy esa capacidad no se está desplegando del todo como función central. El problema no parece estar en ausencia de valor, sino en contexto, canalización, escala o uso parcial de lo que mejor te sale.",
    severity: hasCompressionNarrative || manyRestrictions ? "high" : "medium",
    evidenceKeys: signalKeys.slice(0, 3),
  };
}