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
  preferredKeys: string[],
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
    headline:
      "Tu forma más propia de generar valor todavía no aparece con suficiente nitidez.",
    explanation:
      "Ya hay señales útiles, pero todavía no alcanza para describir con precisión cuál es tu aporte dominante cuando rendís en tu mejor nivel. Hace falta más evidencia para separar mejor lo que te sale naturalmente de lo que hoy hacés por adaptación, urgencia o contexto.",
    evidenceKeys: signalKeys.slice(0, 3),
  };
}

export function buildValueGeneration(
  input: ValueGenerationInput,
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
        "Tu valor aparece cuando ordenás complejidad antes de que otros decidan mal.",
      explanation: hasCompression
        ? "Tu aporte más fuerte no aparece en ejecutar rápido ni en sostener urgencias ajenas, sino en leer estructura, comparar escenarios, detectar criterio y orientar mejores decisiones. Rendís más cuando podés pensar antes de actuar, ordenar alternativas y mostrar qué camino tiene más sentido. Hoy esa capacidad puede estar usada por debajo de su nivel, absorbida por tareas reactivas o resolución puntual, pero el núcleo sigue estando en la lectura estratégica."
        : "Tu aporte más fuerte no aparece en ejecutar rápido ni en sostener urgencias ajenas, sino en leer estructura, comparar escenarios, detectar criterio y orientar mejores decisiones. Rendís más cuando podés pensar antes de actuar, ordenar alternativas y mostrar qué camino tiene más sentido. Tu valor no está principalmente en hacer más, sino en ver mejor.",
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
        "Tu valor aparece cuando algo se destraba, se ordena y empieza a funcionar mejor por tu intervención.",
      explanation: hasCompression
        ? "Tu aporte más claro no está en la contemplación ni en la lectura abstracta, sino en intervenir sobre procesos reales para que dejen de trabarse. Rendís mejor cuando resolvés fallas, ordenás prioridades, ajustás sistemas y convertís desorden en funcionamiento concreto. Hoy esa capacidad puede estar usada en modo incendio permanente, más reactivo que diseñado, pero el núcleo sigue siendo operativo, técnico y transformador."
        : "Tu aporte más claro no está en la contemplación ni en la lectura abstracta, sino en intervenir sobre procesos reales para que dejen de trabarse. Rendís mejor cuando resolvés fallas, ordenás prioridades, ajustás sistemas y convertís desorden en funcionamiento concreto. Tu valor aparece cuando pasás del problema a la mejora verificable.",
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
        "Tu valor aparece cuando lográs que actores distintos dejen de chocar y empiecen a coordinar.",
      explanation: hasCompression
        ? "Tu diferencial no está en la contención individual profunda ni en la ejecución silenciosa, sino en leer actores, alinear intereses, mediar tensiones y sostener funcionamiento entre partes distintas. Rendís mejor cuando hay vínculos que cuidar, posiciones que acercar y cruces que ordenar para que algo avance sin romperse. Hoy esa capacidad puede estar usada en modo táctico, defensivo o de supervivencia, pero el patrón central sigue siendo de articulación."
        : "Tu diferencial no está en la contención individual profunda ni en la ejecución silenciosa, sino en leer actores, alinear intereses, mediar tensiones y sostener funcionamiento entre partes distintas. Rendís mejor cuando hay vínculos que cuidar, posiciones que acercar y cruces que ordenar para que algo avance sin romperse.",
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
        "Tu valor aparece cuando una comunidad no se enfría, no se rompe y no pierde circulación.",
      explanation: hasCompression
        ? "Tu aporte más propio no está en negociar actores institucionales ni en acompañar uno a uno como función principal, sino en sostener pertenencia, interacción, continuidad y vida grupal. Rendís mejor cuando cuidás clima, circulación entre personas, mensajes compartidos y sentido de comunidad. Hoy eso puede estar apareciendo como trabajo invisible o poco reconocido, pero el núcleo sigue siendo colectivo: hacer que un grupo siga vivo, conectado y ordenado."
        : "Tu aporte más propio no está en negociar actores institucionales ni en acompañar uno a uno como función principal, sino en sostener pertenencia, interacción, continuidad y vida grupal. Rendís mejor cuando cuidás clima, circulación entre personas, mensajes compartidos y sentido de comunidad. Tu valor aparece cuando un grupo funciona mejor porque vos estás ahí.",
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
        "Tu valor aparece cuando alguien deja de estar confundido porque vos supiste escuchar y ordenar.",
      explanation: hasCompression
        ? "Tu diferencial no está en coordinar intereses entre partes ni en sostener una maquinaria colectiva como centro, sino en la escucha profunda, la presencia humana y la capacidad de acompañar sin invadir. Rendís mejor cuando una persona necesita claridad, contención y preguntas justas para entender mejor lo que le pasa. Hoy esa capacidad puede estar comprimida por funciones más operativas o por contexto, pero el núcleo sigue siendo humano: traer alivio, comprensión y orden interno."
        : "Tu diferencial no está en coordinar intereses entre partes ni en sostener una maquinaria colectiva como centro, sino en la escucha profunda, la presencia humana y la capacidad de acompañar sin invadir. Rendís mejor cuando una persona necesita claridad, contención y preguntas justas para entender mejor lo que le pasa. Tu valor no aparece por imponer dirección, sino por ayudar a que algo se aclare desde adentro.",
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
        "Tu valor aparece cuando conectás contextos que otros miran por separado.",
      explanation: hasCompression
        ? "Tu aporte central no está en ejecutar velozmente ni en construir relato como función principal, sino en investigar, relacionar ideas, leer historia, cultura y procesos, y convertir esa curiosidad sostenida en comprensión útil. Rendís mejor cuando podés conectar campos distintos, detectar relaciones de fondo y ampliar la lectura de una situación. Hoy eso puede estar subutilizado, disperso o sin cauce claro, pero el núcleo sigue siendo de exploración y lectura de contextos."
        : "Tu aporte central no está en ejecutar velozmente ni en construir relato como función principal, sino en investigar, relacionar ideas, leer historia, cultura y procesos, y convertir esa curiosidad sostenida en comprensión útil. Rendís mejor cuando podés conectar campos distintos, detectar relaciones de fondo y ampliar la lectura de una situación.",
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
        "Tu valor aparece cuando encontrás la forma verbal exacta que vuelve claro, recordable y comunicable algo complejo.",
      explanation: hasCompression
        ? "Tu aporte más fuerte no está solo en tener cultura o referencias, sino en dar forma, voz y estructura narrativa a materiales dispersos. Rendís mejor cuando escribís, editás, sintetizás y convertís ideas complejas en mensajes que otros pueden entender, recordar o usar. Hoy esa capacidad puede estar aplicada de forma funcional, comercial o fragmentada, pero el núcleo sigue siendo narrativo: hacer aparecer sentido donde antes había dispersión."
        : "Tu aporte más fuerte no está solo en tener cultura o referencias, sino en dar forma, voz y estructura narrativa a materiales dispersos. Rendís mejor cuando escribís, editás, sintetizás y convertís ideas complejas en mensajes que otros pueden entender, recordar o usar. Tu valor aparece cuando algo encuentra lenguaje gracias a vos.",
      evidenceKeys: pickEvidenceKeys(signalKeys, [
        "narrative_creation",
        "cultural_curiosity",
        "opportunity_detection",
      ]),
    };
  }

  if (profileId === "public_communicator") {
    return {
      headline:
        "Tu valor aparece cuando convertís un tema disperso en una postura clara para una audiencia.",
      explanation: hasCompression
        ? "Tu aporte no aparece solo en escribir bien, sino en ordenar agenda, construir bajada, fijar postura y volver comunicable algo que necesita voz pública. Rendís mejor cuando interpretás asuntos colectivos, encontrás el ángulo más claro y lo traducís en mensaje con llegada. Hoy esa capacidad puede estar apareciendo de forma lateral, intermitente o comprimida por otras obligaciones, pero el núcleo sigue siendo público: decir algo que ordena y mueve."
        : "Tu aporte no aparece solo en escribir bien, sino en ordenar agenda, construir bajada, fijar postura y volver comunicable algo que necesita voz pública. Rendís mejor cuando interpretás asuntos colectivos, encontrás el ángulo más claro y lo traducís en mensaje con llegada. Tu valor aparece cuando un tema deja de estar suelto y empieza a tener dirección comunicable.",
      evidenceKeys: pickEvidenceKeys(signalKeys, [
        "public_expression",
        "narrative_creation",
        "opportunity_detection",
      ]),
    };
  }

  if (profileId === "institutional_operator") {
    return {
      headline:
        "Tu valor aparece cuando entendés la estructura real y sabés por dónde moverte sin chocar al pedo.",
      explanation: hasCompression
        ? "Tu diferencial no está tanto en la mediación relacional pura ni en la creatividad expresiva, sino en leer reglas, jerarquías, bordes institucionales y puntos de decisión para que algo avance dentro de un marco real. Rendís mejor cuando ubicás qué paso falta, con quién hay que hablar y cuál es el canal más eficaz para destrabar. Hoy esa capacidad puede estar usada de forma táctica o conservadora, pero el núcleo sigue siendo institucional: navegar estructura con criterio."
        : "Tu diferencial no está tanto en la mediación relacional pura ni en la creatividad expresiva, sino en leer reglas, jerarquías, bordes institucionales y puntos de decisión para que algo avance dentro de un marco real. Rendís mejor cuando ubicás qué paso falta, con quién hay que hablar y cuál es el canal más eficaz para destrabar.",
      evidenceKeys: pickEvidenceKeys(signalKeys, [
        "system_thinking",
        "social_coordination",
        "opportunity_detection",
      ]),
    };
  }

  if (profileId === "civic_advocate") {
    return {
      headline:
        "Tu valor aparece cuando una causa o tensión pública deja de ser abstracta y gana empuje real.",
      explanation: hasCompression
        ? "Tu aporte más fuerte no está en acompañar individualmente ni en administrar operación silenciosa, sino en detectar temas que importan, tomar posición y empujar incidencia sobre asuntos colectivos. Rendís mejor cuando una causa necesita lenguaje, presión, foco y continuidad para no diluirse. Hoy esa capacidad puede estar comprimida, fragmentada o subordinada a la supervivencia, pero el núcleo sigue siendo de intervención cívica."
        : "Tu aporte más fuerte no está en acompañar individualmente ni en administrar operación silenciosa, sino en detectar temas que importan, tomar posición y empujar incidencia sobre asuntos colectivos. Rendís mejor cuando una causa necesita lenguaje, presión, foco y continuidad para no diluirse.",
      evidenceKeys: pickEvidenceKeys(signalKeys, [
        "public_expression",
        "social_coordination",
        "opportunity_detection",
      ]),
    };
  }

  if (profileId === "educator_interpreter") {
    return {
      headline:
        "Tu valor aparece cuando lo complejo deja de intimidar porque vos supiste volverlo entendible.",
      explanation: hasCompression
        ? "Tu diferencial no está solo en saber cosas ni solo en acompañar personas, sino en traducir complejidad para que otros comprendan mejor, se orienten y puedan actuar con más claridad. Rendís mejor cuando tomás algo denso, abstracto o confuso y lo volvés explicable sin vaciarlo. Hoy esa capacidad puede estar usada de modo lateral, informal o poco reconocido, pero el núcleo sigue siendo pedagógico e interpretativo."
        : "Tu diferencial no está solo en saber cosas ni solo en acompañar personas, sino en traducir complejidad para que otros comprendan mejor, se orienten y puedan actuar con más claridad. Rendís mejor cuando tomás algo denso, abstracto o confuso y lo volvés explicable sin vaciarlo.",
      evidenceKeys: pickEvidenceKeys(signalKeys, [
        "narrative_creation",
        "empathic_listening",
        "pattern_analysis",
      ]),
    };
  }

  if (profileId === "commercial_connector") {
    return {
      headline:
        "Tu valor aparece cuando detectás posibilidad de movimiento y la convertís en vínculo útil.",
      explanation: hasCompression
        ? "Tu aporte no está principalmente en la contemplación estratégica pura ni en la mediación institucional fina, sino en conectar personas, necesidades, oferta y oportunidad para que algo se active y circule. Rendís mejor cuando leés ocasión, acercás partes, generás tracción y hacés que una relación produzca valor real. Hoy esa capacidad puede estar usada de forma táctica o defensiva, pero el núcleo sigue siendo comercial y relacional."
        : "Tu aporte no está principalmente en la contemplación estratégica pura ni en la mediación institucional fina, sino en conectar personas, necesidades, oferta y oportunidad para que algo se active y circule. Rendís mejor cuando leés ocasión, acercás partes, generás tracción y hacés que una relación produzca valor real.",
      evidenceKeys: pickEvidenceKeys(signalKeys, [
        "opportunity_detection",
        "social_coordination",
        "practical_organizing",
      ]),
    };
  }

  if (profileId === "system_designer") {
    return {
      headline:
        "Tu valor aparece cuando una estructura deja de ser improvisada y empieza a tener forma, secuencia y criterio.",
      explanation: hasCompression
        ? "Tu diferencial no está solo en analizar ni solo en ejecutar, sino en diseñar marcos, procesos y arquitecturas que permitan que un sistema funcione mejor en la realidad. Rendís mejor cuando ordenás componentes, definís secuencias, bajás abstracción a operación y armás una lógica que otros puedan usar. Hoy esa capacidad puede estar parcialmente absorbida por urgencias o microresolución, pero el núcleo sigue siendo de diseño sistémico."
        : "Tu diferencial no está solo en analizar ni solo en ejecutar, sino en diseñar marcos, procesos y arquitecturas que permitan que un sistema funcione mejor en la realidad. Rendís mejor cuando ordenás componentes, definís secuencias, bajás abstracción a operación y armás una lógica que otros puedan usar.",
      evidenceKeys: pickEvidenceKeys(signalKeys, [
        "system_thinking",
        "pattern_analysis",
        "practical_organizing",
      ]),
    };
  }

  return buildFallbackBlock(input);
}