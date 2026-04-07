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
      "coordinar equipos",
      "articular",
      "alinear",
      "mediar",
      "conectar áreas",
      "interáreas",
      "actores",
      "grupo",
      "equipo",
      "consenso",
      "gestionar cruces",
      "sostener el funcionamiento",
      "orden entre personas",
      "coordinar gente",
      "conectar personas",
    ],
    sourceFields: [
      { source: "social_role", value: intake.narrative.naturalSocialRoles },
      { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
      { source: "current_context", value: intake.currentContext.currentSituation },
    ],
  },
  {
    key: "pattern_analysis",
    terms: [
      "analizar",
      "patrones",
      "estructura",
      "lógica",
      "relaciones",
      "comparar",
      "mapa",
      "diagnosticar",
      "cómo funciona",
      "interdependencia",
    ],
    sourceFields: [
      { source: "school_experience", value: intake.narrative.meaningfulSchoolSubjects },
      { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
      { source: "current_context", value: intake.currentContext.currentSituation },
    ],
  },
  {
    key: "narrative_creation",
    terms: [
      "escribir",
      "redactar",
      "editar",
      "contar",
      "relato",
      "narrar",
      "mensaje",
      "mensajes",
      "copy",
      "verbalizar",
      "dar forma verbal",
      "nombrar",
      "construir relato",
    ],
    sourceFields: [
      { source: "childhood_memory", value: intake.narrative.childhoodMemories },
      { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
      { source: "current_context", value: intake.currentContext.currentSituation },
      { source: "free_narrative", value: intake.narrative.additionalContext },
    ],
  },
  {
    key: "cultural_curiosity",
    terms: [
        "historia",
        "cultura",
        "idiomas",
        "lenguas",
        "literatura",
        "arte",
        "filosofía",
        "antropología",
        "sociología",
        "geopolítica",
        "procesos sociales",
        "contextos culturales",
        "comparar contextos",
        "relacionar contextos",
        "leer historia",
        "leer sobre cultura",
        "curiosidad cultural",
        "interés cultural",
        "marcos culturales",
        "aprender idiomas",
        "conectar ideas de distintos campos",
        "investigar contextos",
      ],
    sourceFields: [
      { source: "early_interest", value: intake.narrative.earlyFascinations },
      { source: "school_experience", value: intake.narrative.meaningfulSchoolSubjects },
      { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
      { source: "free_narrative", value: intake.narrative.additionalContext },
    ],
  },
  {
    key: "opportunity_detection",
    terms: [
      "oportunidad",
      "negocio",
      "mercado",
      "demanda",
      "margen",
      "posicionamiento",
      "propuesta",
      "crecimiento",
      "segmento",
      "oferta",
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
      "proceso",
      "mapa",
      "arquitectura",
      "interdependencia",
      "flujo",
      "diseño",
      "cómo funcionan",
      "mecanismo",
    ],
    sourceFields: [
      { source: "school_experience", value: intake.narrative.meaningfulSchoolSubjects },
      { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
      { source: "current_context", value: intake.currentContext.currentSituation },
      { source: "free_narrative", value: intake.narrative.additionalContext },
    ],
  },
{
        key: "empathic_listening",
        terms: [
          "escuchar",
          "escucha",
          "escucha profunda",
          "escuchar de verdad",
          "escuchar a fondo",
          "acompañar",
          "acompañamiento",
          "acompaño",
          "acompaño procesos",
          "contener",
          "contención",
          "hacer preguntas justas",
          "hacer buenas preguntas",
          "conflictos humanos",
          "ayudar a otros",
          "capacidad de acompañar",
          "presencia humana",
        ],
        sourceFields: [
          { source: "social_role", value: intake.narrative.naturalSocialRoles },
          { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
          { source: "current_context", value: intake.currentSituation },
          { source: "free_narrative", value: freeNarrativeText },
        ],
      },
      {
        key: "practical_organizing",
        terms: [
          "ordenar",
          "orden",
          "poner orden",
          "dar claridad",
          "dar estructura",
          "ordenar situaciones",
          "ordenar situaciones complejas",
          "ordenar conversaciones",
          "bajar complejidad",
          "hacer manejable",
          "encauzar",
          "destrabar",
          "acomodar",
          "organizar",
          "organizar procesos",
          "resolver sobre la marcha",
          "hacer que avance",
          "bajar problemas",
          "traducir complejidad",
          "dar forma",
          "ordenar lo confuso",
          "acompañar ordenando",
          "resolver fallas",
          "orden operativo",
          "gestionar prioridad",
          "mejorar procesos",
        ],
        sourceFields: [
          { source: "work_pattern", value: intake.narrative.repeatedWorkPatterns },
          { source: "current_context", value: intake.currentSituation },
          { source: "free_narrative", value: freeNarrativeText },
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