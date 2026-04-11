import type { UserIntake } from "../types/intake";
import type { ProbableProfile } from "../types/profiles";
import type { DetectedSignal } from "../types/signals";
import type { ValueGenerationBlock } from "../types/finalDiagnostic";

type ValueGenerationInput = {
  intake: UserIntake;
  dominantProfile: ProbableProfile | null | undefined;
  signals: DetectedSignal[];
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

function buildFallbackBlock(input: ValueGenerationInput): ValueGenerationBlock {
  const signalKeys = getSignalKeys(input.signals);

  return {
    headline: "Tu forma de generar valor todavía no aparece con suficiente nitidez.",
    explanation:
      "Ya hay señales útiles, pero todavía no alcanza para describir con precisión cómo generás valor de manera dominante. Hace falta más evidencia para separar mejor lo que te sale naturalmente de lo que hoy hacés por adaptación o contexto.",
    evidenceKeys: signalKeys.slice(0, 3),
  };
}

export function buildValueGeneration(
  input: ValueGenerationInput
): ValueGenerationBlock {
  const profileId = input.dominantProfile?.id;
  const signalKeys = getSignalKeys(input.signals);
  const hasCompression = hasText(input.intake.narrative.whatFeelsCompressedNow);

  if (!profileId) {
    return buildFallbackBlock(input);
  }

  if (profileId === "analytical_strategist") {
    return {
      headline:
        "Generás valor cuando leés estructura, comparás caminos y detectás criterio antes de decidir.",
      explanation: hasCompression
        ? "Tu aporte más fuerte aparece cuando ordenás complejidad, comparás escenarios, detectás patrones y ayudás a decidir con más claridad. No generás valor principalmente por velocidad de ejecución, sino por lectura, criterio y dirección. Hoy esa capacidad puede estar parcialmente tapada por tareas reactivas o urgencias, pero el núcleo sigue estando en la lectura estratégica."
        : "Tu aporte más fuerte aparece cuando ordenás complejidad, comparás escenarios, detectás patrones y ayudás a decidir con más claridad. No generás valor principalmente por velocidad de ejecución, sino por lectura, criterio y dirección.",
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
        "Generás valor cuando resolvés trabas concretas, ordenás procesos y hacés que algo funcione mejor.",
      explanation: hasCompression
        ? "Tu valor aparece en la ejecución con criterio: resolver fallas, ajustar procesos, ordenar prioridades y sostener funcionamiento real. No se trata solo de entender sistemas, sino de intervenir sobre ellos para que salgan, avancen o dejen de trabarse. Hoy parte de esa capacidad puede estar usada en modo incendio permanente, pero el núcleo sigue siendo operativo y transformador."
        : "Tu valor aparece en la ejecución con criterio: resolver fallas, ajustar procesos, ordenar prioridades y sostener funcionamiento real. No se trata solo de entender sistemas, sino de intervenir sobre ellos para que salgan, avancen o dejen de trabarse.",
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
        "Generás valor cuando leés actores, alineás intereses y destrabás coordinación entre partes distintas.",
      explanation: hasCompression
        ? "Tu fuerza no está en la contención individual profunda, sino en la articulación: coordinar personas, mediar tensiones, cuidar vínculos y sostener acuerdos o funcionamiento colectivo. Generás valor cuando hay varios actores, intereses cruzados y necesidad de orden práctico. Hoy esa capacidad puede estar demasiado usada en modo táctico o defensivo, pero el patrón central es claro."
        : "Tu fuerza no está en la contención individual profunda, sino en la articulación: coordinar personas, mediar tensiones, cuidar vínculos y sostener acuerdos o funcionamiento colectivo. Generás valor cuando hay varios actores, intereses cruzados y necesidad de orden práctico.",
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
        "Generás valor cuando construís pertenencia, sostenés circulación grupal y ayudás a que una comunidad siga viva.",
      explanation: hasCompression
        ? "Tu aporte aparece cuando cuidás clima, interacción, continuidad y sentido de pertenencia dentro de grupos. No generás valor principalmente negociando actores institucionales ni conteniendo uno a uno, sino sosteniendo comunidad, vínculo colectivo y circulación entre personas. Hoy eso puede estar apareciendo como sostén invisible más que como función reconocida."
        : "Tu aporte aparece cuando cuidás clima, interacción, continuidad y sentido de pertenencia dentro de grupos. No generás valor principalmente negociando actores institucionales ni conteniendo uno a uno, sino sosteniendo comunidad, vínculo colectivo y circulación entre personas.",
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
        "Generás valor cuando escuchás de verdad, ordenás lo confuso y ayudás a otros a entender mejor lo que les pasa.",
      explanation: hasCompression
        ? "Tu diferencial aparece en la escucha profunda, la presencia humana y la capacidad de acompañar sin invadir. Generás valor cuando una persona necesita claridad, contención y preguntas justas para salir de la confusión. Hoy eso puede estar parcialmente comprimido por funciones más operativas o por contexto, pero el núcleo sigue siendo humano, no institucional."
        : "Tu diferencial aparece en la escucha profunda, la presencia humana y la capacidad de acompañar sin invadir. Generás valor cuando una persona necesita claridad, contención y preguntas justas para salir de la confusión. Tu centro no está en coordinar intereses entre partes, sino en comprender y acompañar procesos humanos.",
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
        "Generás valor cuando investigás, conectás contextos y convertís curiosidad sostenida en comprensión útil.",
      explanation: hasCompression
        ? "Tu valor aparece cuando leés historia, cultura, procesos o ideas, encontrás relaciones entre campos distintos y ordenás materiales complejos en una mirada más amplia. No generás valor principalmente por construcción de relato propio, sino por exploración, relación y lectura de contextos. Hoy eso puede estar vivo pero subutilizado o disperso."
        : "Tu valor aparece cuando leés historia, cultura, procesos o ideas, encontrás relaciones entre campos distintos y ordenás materiales complejos en una mirada más amplia. No generás valor principalmente por construcción de relato propio, sino por exploración, relación y lectura de contextos.",
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
        "Generás valor cuando encontrás la forma verbal justa y volvés comunicable algo que sin vos quedaría difuso.",
      explanation: hasCompression
        ? "Tu aporte central aparece en la escritura, la edición, la construcción de mensaje y la capacidad de dar forma narrativa a ideas complejas. No generás valor solo por tener cultura o referencias, sino por convertir materiales dispersos en voz, claridad y relato. Hoy esa capacidad puede estar usada de forma funcional o comercial, pero el núcleo sigue siendo narrativo."
        : "Tu aporte central aparece en la escritura, la edición, la construcción de mensaje y la capacidad de dar forma narrativa a ideas complejas. No generás valor solo por tener cultura o referencias, sino por convertir materiales dispersos en voz, claridad y relato.",
      evidenceKeys: pickEvidenceKeys(signalKeys, [
        "narrative_creation",
        "cultural_curiosity",
        "opportunity_detection",
      ]),
    };
  }

  return buildFallbackBlock(input);
}