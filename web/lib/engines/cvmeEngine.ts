import type { UserIntake } from "../types/intake";
import type { DetectedSignal, EvidenceSource } from "../types/signals";
import { getSignalLibraryEntry } from "./signalLibrary";
import { includesAny } from "../utils/parsing";

type SignalRule = {
  key: string;
  terms: string[];
  sourceFields: Array<{
    source: EvidenceSource;
    value: string | undefined;
  }>;
};

function createSignal(key: string, excerpts: Array<{ source: EvidenceSource; excerpt: string }>): DetectedSignal {
  const libraryEntry = getSignalLibraryEntry(key);

  return {
    id: `signal_${key}`,
    key,
    label: libraryEntry?.label ?? key,
    description: libraryEntry?.description ?? key,
    evidence: excerpts.map((item) => ({
      source: item.source,
      excerpt: item.excerpt,
    })),
    weight: libraryEntry?.defaultWeight ?? 0.5,
    frequency: excerpts.length > 1 ? "repeated" : "single",
  };
}

export function runCVME(intake: UserIntake): DetectedSignal[] {
  const rules: SignalRule[] = [
    {
      key: "social_coordination",
      terms: ["organizar", "coordinar", "mediar", "liderar", "conectar", "grupo", "equipo"],
      sourceFields: [
        { source: "social_role", value: intake.narrative.naturalSocialRoles },
        { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
      ],
    },
    {
      key: "pattern_analysis",
      terms: ["analizar", "patrones", "estructura", "lógica", "relación", "comparar"],
      sourceFields: [
        { source: "school_experience", value: intake.narrative.meaningfulSchoolSubjects },
        { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
      ],
    },
    {
      key: "narrative_creation",
      terms: ["escribir", "relatar", "contar", "explicar", "comunicar", "historia"],
      sourceFields: [
        { source: "childhood_memory", value: intake.narrative.childhoodMemories },
        { source: "free_narrative", value: intake.narrative.additionalContext },
      ],
    },
    {
      key: "cultural_curiosity",
      terms: ["cultura", "historia", "ideas", "sociedad", "idiomas", "leer"],
      sourceFields: [
        { source: "early_interest", value: intake.narrative.earlyFascinations },
        { source: "school_experience", value: intake.narrative.meaningfulSchoolSubjects },
      ],
    },
    {
      key: "opportunity_detection",
      terms: ["oportunidad", "detectar", "negocio", "posibilidad", "margen", "resolver"],
      sourceFields: [
        { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
        { source: "current_context", value: intake.currentContext.currentSituation },
      ],
    },
    {
      key: "system_thinking",
      terms: ["sistema", "estructura", "proceso", "mapa", "arquitectura", "orden"],
      sourceFields: [
        { source: "school_experience", value: intake.narrative.meaningfulSchoolSubjects },
        { source: "free_narrative", value: intake.narrative.additionalContext },
      ],
    },
    {
      key: "empathic_listening",
      terms: ["escuchar", "acompañar", "entender", "personas", "conflictos", "ayudar"],
      sourceFields: [
        { source: "social_role", value: intake.narrative.naturalSocialRoles },
        { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
      ],
    },
    {
      key: "practical_organizing",
      terms: ["ordenar", "resolver", "gestionar", "coordinar", "ejecutar", "priorizar"],
      sourceFields: [
        { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
        { source: "current_context", value: intake.currentContext.currentSituation },
      ],
    },
  ];

  const detectedSignals: DetectedSignal[] = [];

  for (const rule of rules) {
    const matches = rule.sourceFields
      .filter((field) => field.value && includesAny(field.value, rule.terms))
      .map((field) => ({
        source: field.source,
        excerpt: field.value!.trim(),
      }));

    if (matches.length > 0) {
      detectedSignals.push(createSignal(rule.key, matches));
    }
  }

  return detectedSignals;
}