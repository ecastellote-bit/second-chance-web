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
          terms: [
            "organizar",
            "coordinar",
            "coordinando",
            "coordinación",
            "coordinacion",
            "mediar",
            "mediando",
            "liderar",
            "conectar",
            "conectando",
            "grupo",
            "equipos",
            "equipo",
            "gente",
            "vínculos",
            "vinculos",
          ],
          sourceFields: [
            { source: "social_role", value: intake.narrative.naturalSocialRoles },
            { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
            {
              source: "current_context",
              value: intake.currentContext.availableAssets?.join(" "),
            },
            {
              source: "free_narrative",
              value: intake.narrative.whatFeelsCompressedNow,
            },
          ],
        },
        {
          key: "pattern_analysis",
          terms: [
            "analizar",
            "análisis",
            "analisis",
            "analítica",
            "analitica",
            "patrón",
            "patron",
            "patrones",
            "estructura",
            "estructural",
            "lógica",
            "logica",
            "relación",
            "relacion",
            "comparar",
            "diagnosticar",
            "mapear",
            "proceso",
            "procesos",
            "mejora",
            "mejoras",
            "mejorando",
            "falla",
            "fallas",
          ],
          sourceFields: [
            {
              source: "school_experience",
              value: intake.narrative.meaningfulSchoolSubjects,
            },
            { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
            {
              source: "current_context",
              value: intake.currentContext.availableAssets?.join(" "),
            },
            {
              source: "free_narrative",
              value: intake.narrative.whatFeelsCompressedNow,
            },
          ],
        },
        {
          key: "narrative_creation",
          terms: [
            "escribir",
            "relatar",
            "contar",
            "explicar",
            "comunicar",
            "historia",
            "relato",
            "lenguaje",
            "editorial",
            "contenido",
          ],
          sourceFields: [
            { source: "childhood_memory", value: intake.narrative.childhoodMemories },
            { source: "free_narrative", value: intake.narrative.additionalContext },
            { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
          ],
        },
        {
          key: "cultural_curiosity",
          terms: [
            "cultura",
            "historia",
            "ideas",
            "sociedad",
            "idiomas",
            "leer",
            "aprendizaje",
            "aprender",
            "curiosidad",
            "contextos",
          ],
          sourceFields: [
            { source: "early_interest", value: intake.narrative.earlyFascinations },
            {
              source: "school_experience",
              value: intake.narrative.meaningfulSchoolSubjects,
            },
            { source: "free_narrative", value: intake.narrative.additionalContext },
          ],
        },
        {
          key: "opportunity_detection",
          terms: [
            "oportunidad",
            "oportunidades",
            "detectar",
            "detectando",
            "posibilidad",
            "posibilidades",
            "margen",
            "negocio",
            "optimizar",
            "optimización",
            "optimizacion",
          ],
          sourceFields: [
            { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
            { source: "current_context", value: intake.currentContext.currentSituation },
            { source: "free_narrative", value: intake.narrative.additionalContext },
          ],
        },
        {
          key: "system_thinking",
          terms: [
            "sistema",
            "estructura",
            "estructural",
            "proceso",
            "procesos",
            "mapa",
            "arquitectura",
            "orden",
            "diseño",
            "diseno",
            "funcionamiento",
            "mejoras",
            "mejora",
          ],
          sourceFields: [
            {
              source: "school_experience",
              value: intake.narrative.meaningfulSchoolSubjects,
            },
            { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
            {
              source: "current_context",
              value: intake.currentContext.availableAssets?.join(" "),
            },
            {
              source: "free_narrative",
              value: intake.narrative.whatFeelsCompressedNow,
            },
          ],
        },
        {
          key: "empathic_listening",
          terms: [
            "escuchar",
            "acompañar",
            "acompanar",
            "entender",
            "personas",
            "conflictos",
            "ayudar",
            "tensiones",
            "mediar",
            "orientar",
          ],
          sourceFields: [
            { source: "social_role", value: intake.narrative.naturalSocialRoles },
            { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
            {
              source: "current_context",
              value: intake.currentContext.availableAssets?.join(" "),
            },
          ],
        },
        {
          key: "practical_organizing",
          terms: [
            "resolver",
            "resolviendo",
            "gestionar",
            "gestión",
            "gestion",
            "coordinar",
            "coordinación",
            "coordinacion",
            "ejecutar",
            "ejecución",
            "ejecucion",
            "priorizar",
            "operativo",
            "operativa",
            "tareas",
            "fallas",
            "práctica",
            "practica",
            "técnica",
            "tecnica",
            "marcha",
          ],
          sourceFields: [
            { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
            { source: "current_context", value: intake.currentContext.currentSituation },
            {
              source: "current_context",
              value: intake.currentContext.availableAssets?.join(" "),
            },
            {
              source: "free_narrative",
              value: intake.narrative.whatFeelsCompressedNow,
            },
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