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

function joinText(parts: Array<string | undefined>): string | undefined {
  const joined = parts
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" ")
    .trim();

  return joined.length > 0 ? joined : undefined;
}

function createSignal(
  key: string,
  excerpts: Array<{ source: EvidenceSource; excerpt: string }>
): DetectedSignal {
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
  const currentContextText = joinText([
    intake.currentContext.currentSituation,
    intake.currentContext.transitionGoal,
    intake.currentContext.assets?.join(" "),
    intake.currentContext.restrictions?.join(" "),
  ]);

  const freeNarrativeText = joinText([
    intake.narrative.additionalContext,
    intake.narrative.lossesOrRenunciations,
    intake.narrative.whatFeelsCompressedNow,
  ]);

  const rules: SignalRule[] = [
    {
      key: "social_coordination",
      terms: [
        "coordinar",
        "coordinando",
        "coordinacion",
        "coordinación",
        "mediar",
        "mediando",
        "articular",
        "articulando",
        "equipo",
        "equipos",
        "grupo",
        "grupos",
        "alianza",
        "alianzas",
        "contactos",
        "red",
        "redes",
        "comunidad",
        "comunidades",
      ],
      sourceFields: [
        { source: "social_role", value: intake.narrative.naturalSocialRoles },
        { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
        { source: "current_context", value: currentContextText },
      ],
    },
    {
      key: "pattern_analysis",
      terms: [
        "analizar",
        "analitico",
        "analítico",
        "analitica",
        "analítica",
        "patrones",
        "estructura",
        "estructural",
        "logica",
        "lógica",
        "comparar",
        "comparando",
        "relacionar",
        "relaciones",
        "mapa",
        "mapas",
        "contextos",
        "diagnostico",
        "diagnóstico",
      ],
      sourceFields: [
        {
          source: "school_experience",
          value: intake.narrative.meaningfulSchoolSubjects,
        },
        { source: "childhood_memory", value: intake.narrative.childhoodMemories },
        { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
        { source: "current_context", value: currentContextText },
        { source: "free_narrative", value: freeNarrativeText },
      ],
    },
    {
      key: "narrative_creation",
      terms: [
        "escribir",
        "escribiendo",
        "escritura",
        "redactar",
        "redactando",
        "redaccion",
        "redacción",
        "relato",
        "relatos",
        "narrativa",
        "narrativo",
        "narrativo",
        "explicar",
        "explicando",
        "comunicar",
        "comunicacion",
        "comunicación",
        "mensaje",
        "mensajes",
        "editorial",
        "sintesis",
        "síntesis",
      ],
      sourceFields: [
        { source: "childhood_memory", value: intake.narrative.childhoodMemories },
        { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
        { source: "current_context", value: currentContextText },
        { source: "free_narrative", value: freeNarrativeText },
      ],
    },
    {
      key: "cultural_curiosity",
      terms: [
        "cultura",
        "cultural",
        "historia",
        "historico",
        "histórico",
        "ideas",
        "idioma",
        "idiomas",
        "leer",
        "lectura",
        "libros",
        "investigar",
        "investigando",
        "sociedad",
        "humanidades",
        "contextos",
      ],
      sourceFields: [
        { source: "early_interest", value: intake.narrative.earlyFascinations },
        {
          source: "school_experience",
          value: intake.narrative.meaningfulSchoolSubjects,
        },
        { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
        { source: "current_context", value: currentContextText },
      ],
    },
    {
      key: "opportunity_detection",
      terms: [
        "oportunidad",
        "oportunidades",
        "negocio",
        "negocios",
        "mercado",
        "mercados",
        "clientes",
        "cliente",
        "demanda",
        "oferta",
        "rentable",
        "rentabilidad",
        "margen",
        "margen",
        "propuesta",
        "ventaja",
      ],
      sourceFields: [
        { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
        { source: "current_context", value: currentContextText },
        { source: "free_narrative", value: freeNarrativeText },
      ],
    },
    {
      key: "system_thinking",
      terms: [
        "sistema",
        "sistemas",
        "estructura",
        "estructuras",
        "proceso",
        "procesos",
        "mapa",
        "mapas",
        "arquitectura",
        "orden",
        "modelo",
        "modelos",
        "flujo",
        "flujos",
      ],
      sourceFields: [
        { source: "childhood_memory", value: intake.narrative.childhoodMemories },
        {
          source: "school_experience",
          value: intake.narrative.meaningfulSchoolSubjects,
        },
        { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
        { source: "current_context", value: currentContextText },
      ],
    },
    {
      key: "empathic_listening",
      terms: [
        "escucha",
        "escuchar",
        "escuchando",
        "acompañar",
        "acompañar",
        "acompanar",
        "acompañando",
        "acompanando",
        "conflicto",
        "conflictos",
        "tension",
        "tensión",
        "tensiones",
        "contener",
        "contencion",
        "contención",
        "interpersonal",
        "emocional",
        "emociones",
        "humano",
        "humanas",
      ],
      sourceFields: [
        { source: "social_role", value: intake.narrative.naturalSocialRoles },
        { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
        { source: "current_context", value: currentContextText },
        { source: "free_narrative", value: freeNarrativeText },
      ],
    },
    {
      key: "practical_organizing",
      terms: [
        "ordenar",
        "ordenando",
        "resolver",
        "resolviendo",
        "gestionar",
        "gestionando",
        "coordinar",
        "coordinando",
        "ejecutar",
        "ejecucion",
        "ejecución",
        "priorizar",
        "operativo",
        "operativa",
        "operacion",
        "operación",
        "proceso",
        "procesos",
        "destrabar",
        "destrabando",
        "mejora",
        "mejorando",
      ],
      sourceFields: [
        { source: "social_role", value: intake.narrative.naturalSocialRoles },
        { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
        { source: "current_context", value: currentContextText },
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