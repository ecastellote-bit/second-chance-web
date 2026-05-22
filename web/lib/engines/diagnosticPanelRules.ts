/**
 * Reglas universales del Panel de Juez Diagnóstico (5 sub-jueces).
 * Anti-cebado: pares rivales y léxico sin IDs de persona ni keywords de un solo golden.
 */
import type { UserIntake } from "../types/intake";
import { buildUniversalArchetypeSignals } from "./discardRivalRules";

/** Similitud mínima para que la memoria pese como conflicto o frontera fuerte. */
export const SIMILARITY_CONFLICT_MIN = 0.55;
export const SIMILARITY_FRONTIER_MIN = 0.4;
export const SIMILARITY_INFLUENTIAL_MIN = 0.35;

/** Pares rivales conocidos (orden irrelevante). */
export const DIAGNOSTIC_RIVALRY_PAIRS: [string, string][] = [
  ["system_designer", "technical_builder"],
  ["analytical_strategist", "system_designer"],
  ["analytical_strategist", "technical_builder"],
  ["creative_storyteller", "public_communicator"],
  ["artistic_creator", "public_communicator"],
  ["artistic_creator", "creative_storyteller"],
  ["artistic_creator", "technical_builder"],
  ["artistic_creator", "system_designer"],
  ["empathic_guide", "community_builder"],
  ["empathic_guide", "diplomatic_social_connector"],
  ["diplomatic_social_connector", "institutional_operator"],
  ["scientific_investigator", "technical_builder"],
  ["operational_organizer", "resource_steward"],
  ["cultural_explorer", "scientific_investigator"],
  ["cultural_explorer", "educator_interpreter"],
];

export type LexiconGroup = {
  familyId: string;
  label: string;
  /** Frases o bigramas — un hit cuenta como fuerte. */
  phraseMarkers: string[];
  /** Palabras sueltas — requieren ≥2 hits distintos para frontier. */
  wordMarkers: string[];
  minPhraseHitsForFrontier?: number;
  minWordHitsForFrontier?: number;
};

export const DIAGNOSTIC_LEXICON_GROUPS: LexiconGroup[] = [
  {
    familyId: "technical_builder",
    label: "Technical Builder",
    phraseMarkers: [
      "meter mano",
      "hacer funcionar",
      "arreglar cosas",
      "desarmar y armar",
    ],
    wordMarkers: [
      "desarmar",
      "reparar",
      "arreglar",
      "motor",
      "circuito",
      "mecanico",
      "herramienta",
      "taller",
      "prototipo",
      "artefacto",
    ],
    minPhraseHitsForFrontier: 1,
    minWordHitsForFrontier: 3,
  },
  {
    familyId: "system_designer",
    label: "System Designer",
    phraseMarkers: ["diseñar el sistema", "ordenar el proceso", "marco de trabajo"],
    wordMarkers: [
      "sistema",
      "estructura",
      "proceso",
      "criterio",
      "secuencia",
      "disenar",
      "diseñar",
      "marco",
    ],
    minPhraseHitsForFrontier: 1,
    minWordHitsForFrontier: 3,
  },
  {
    familyId: "public_communicator",
    label: "Public Communicator",
    phraseMarkers: [
      "voz publica",
      "hablar en publico",
      "frente a una audiencia",
      "llegar a mucha gente",
      "comunicar un mensaje",
    ],
    wordMarkers: ["audiencia", "difusion", "difusión", "prensa", "microfono", "micrófono"],
    minPhraseHitsForFrontier: 1,
    minWordHitsForFrontier: 2,
  },
  {
    familyId: "creative_storyteller",
    label: "Creative Storyteller",
    phraseMarkers: [
      "contar historias",
      "relatar historias",
      "narrar historias",
      "dar forma a una historia",
    ],
    wordMarkers: ["relatar", "narrar", "historias", "guion", "guión", "ficcion", "ficción"],
    minPhraseHitsForFrontier: 1,
    minWordHitsForFrontier: 2,
  },
  {
    familyId: "artistic_creator",
    label: "Artistic Creator",
    phraseMarkers: [
      "expresion artistica",
      "expresión artística",
      "obra propia",
      "crear con las manos",
    ],
    wordMarkers: [
      "artistico",
      "artístico",
      "pintar",
      "dibujar",
      "esculpir",
      "componer",
      "estetica",
      "estética",
    ],
    minPhraseHitsForFrontier: 1,
    minWordHitsForFrontier: 2,
  },
  {
    familyId: "empathic_guide",
    label: "Empathic Guide",
    phraseMarkers: [
      "escucha profunda",
      "acompañar a alguien",
      "acompanar a alguien",
      "uno a uno",
      "una por una",
      "contener emocionalmente",
    ],
    wordMarkers: ["escuchar", "contener", "acompañar", "acompanar"],
    minPhraseHitsForFrontier: 1,
    minWordHitsForFrontier: 2,
  },
  {
    familyId: "community_builder",
    label: "Community Builder",
    phraseMarkers: [
      "armar comunidad",
      "sostener una red",
      "movilizar gente",
      "espacio colectivo",
    ],
    wordMarkers: ["comunidad", "colectivo", "red de", "grupo grande", "movilizar"],
    minPhraseHitsForFrontier: 1,
    minWordHitsForFrontier: 2,
  },
  {
    familyId: "scientific_investigator",
    label: "Scientific Investigator",
    phraseMarkers: [
      "metodo cientifico",
      "método científico",
      "probar una hipotesis",
      "probar una hipótesis",
      "experimento controlado",
    ],
    wordMarkers: ["hipotesis", "hipótesis", "laboratorio", "experimento", "evidencia"],
    minPhraseHitsForFrontier: 1,
    minWordHitsForFrontier: 2,
  },
  {
    familyId: "cultural_explorer",
    label: "Cultural Explorer",
    phraseMarkers: [
      "otra cultura",
      "viajar para entender",
      "tradiciones de otros",
    ],
    wordMarkers: ["cultura", "tradicion", "tradición", "idioma", "antropologia", "antropología"],
    minPhraseHitsForFrontier: 1,
    minWordHitsForFrontier: 2,
  },
];

/** Léxico débil: nunca bastan solos para frontier (anti-cebado). */
export const LEXICON_WEAK_ONLY_MARKERS = new Set([
  "persona",
  "personas",
  "ayudar",
  "emocion",
  "emoción",
  "escribir",
  "contar",
  "comunicar",
  "expresar",
  "organizar",
  "ordenar",
]);

export function buildDiagnosticIntakeText(intake: UserIntake): string {
  const parts: string[] = [];
  const push = (v: unknown) => {
    if (typeof v === "string" && v.trim()) parts.push(v.trim());
    else if (Array.isArray(v)) v.forEach(push);
    else if (v && typeof v === "object")
      Object.values(v).forEach(push);
  };
  push(intake);
  return parts
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function scoreLexiconGroups(text: string): {
  group: LexiconGroup;
  phraseHits: string[];
  wordHits: string[];
  score: number;
}[] {
  const normalized = text;
  const results = DIAGNOSTIC_LEXICON_GROUPS.map((group) => {
    const phraseHits = group.phraseMarkers.filter((m) =>
      normalized.includes(
        m
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, ""),
      ),
    );
    const wordHits = group.wordMarkers.filter((m) => {
      const key = m
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return key && normalized.includes(key);
    });
    const score = phraseHits.length * 2 + wordHits.length;
    return { group, phraseHits, wordHits, score };
  });
  return results.sort((a, b) => b.score - a.score);
}

export function detectLexiconArchetypeTension(intake: UserIntake): string[] {
  const text = buildDiagnosticIntakeText(intake);
  const signals = buildUniversalArchetypeSignals(text);
  const notes: string[] = [];

  if (signals.sostenEconomico.length >= 2) {
    notes.push(
      "sosten_laboral: el relato enfatiza sostén/administración; no debe leerse como vocación técnica u operativa por palabras sueltas.",
    );
  }
  if (signals.compresionVital.length >= 2) {
    notes.push(
      "compresion_vital: hay vida comprimida; el léxico no debe forzar cierre operativo.",
    );
  }
  if (
    signals.investigacionCuriosidad.length >= 2 &&
    signals.metodoCientifico.length < 1
  ) {
    notes.push(
      "curiosidad_sin_metodo: curiosidad narrativa sin método científico formal.",
    );
  }
  const hasCollective = ["comunidad", "colectivo", "red de", "grupo"].some((m) =>
    text.includes(m),
  );
  if (!hasCollective) {
    notes.push(
      "sin_colectivo_explicito: community_builder no debe activarse solo por acompañar personas.",
    );
  }

  return notes;
}

export function isKnownDiagnosticRivalry(
  topId: string,
  secondId: string,
): boolean {
  return DIAGNOSTIC_RIVALRY_PAIRS.some(
    ([a, b]) =>
      (topId === a && secondId === b) || (topId === b && secondId === a),
  );
}
