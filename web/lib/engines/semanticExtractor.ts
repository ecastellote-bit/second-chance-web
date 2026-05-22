import OpenAI from "openai";
import type {
  SemanticExtractionResult,
  SemanticAffinitySignal,
  SemanticNarrativeFlags,
} from "../types/semantic";
import { EMPTY_SEMANTIC_RESULT } from "../types/semantic";
import type { HumanAffinityId } from "../types/humanAffinity";

const VALID_AFFINITY_IDS: Set<string> = new Set([
  "narrative_creation",
  "public_expression",
  "editorial_framing",
  "audience_activation",
  "performance_presence",
  "aesthetic_sensitivity",
  "pattern_analysis",
  "meaning_synthesis",
  "system_ordering",
  "conceptual_abstraction",
  "evidence_validation",
  "strategic_projection",
  "empathic_attunement",
  "relational_bridge_building",
  "social_coordination",
  "conflict_mediation",
  "group_reading",
  "trust_building",
  "care_orientation",
  "restorative_support",
  "protective_instinct",
  "duty_reliability",
  "stewardship",
  "crisis_response",
  "practical_execution",
  "craft_precision",
  "technical_assembly",
  "operational_rhythm",
  "resource_optimization",
  "material_transformation",
  "initiative_drive",
  "decision_ownership",
  "influence_negotiation",
  "institutional_navigation",
  "agenda_detection",
  "civic_conflict_engagement",
  "curiosity_depth",
  "exploratory_drive",
  "adaptive_reframing",
  "teaching_impulse",
  "experimental_play",
  "venture_activation",
  "competitive_push",
  "discipline_endurance",
  "physical_mastery",
  "sensory_awareness",
  "energy_transmission",
  "pressure_functioning",
]);

const SYSTEM_PROMPT = `Sos un analizador semántico para un sistema de diagnóstico vocacional. Tu trabajo es leer el texto de una persona y extraer señales de afinidad humana.

NO diagnosticás. NO das consejos. Solo extraés señales estructuradas.

Respondé EXCLUSIVAMENTE con un JSON válido con esta estructura:
{
  "affinitySignals": [
    { "id": "<affinity_id>", "strength": <0.0-1.0>, "evidence": "<frase corta del texto que lo justifica>" }
  ],
  "narrativeFlags": {
    "oneToOneOrientation": <bool>,
    "publicAudienceDesire": <bool>,
    "practicalExecution": <bool>,
    "intellectualAbstraction": <bool>,
    "bodyOrientation": <bool>,
    "natureConnection": <bool>,
    "compressionDetected": <bool>,
    "collectiveOrientation": <bool>,
    "commercialIntent": <bool>,
    "artisticFormDesire": <bool>
  },
  "dominantCluster": "<expression|analysis|relational|care|execution|agency|exploration|embodiment>",
  "confidence": <0.0-1.0>
}

REGLAS:
- Solo usá estos IDs de afinidad: narrative_creation, public_expression, editorial_framing, audience_activation, performance_presence, aesthetic_sensitivity, pattern_analysis, meaning_synthesis, system_ordering, conceptual_abstraction, evidence_validation, strategic_projection, empathic_attunement, relational_bridge_building, social_coordination, conflict_mediation, group_reading, trust_building, care_orientation, restorative_support, protective_instinct, duty_reliability, stewardship, crisis_response, practical_execution, craft_precision, technical_assembly, operational_rhythm, resource_optimization, material_transformation, initiative_drive, decision_ownership, influence_negotiation, institutional_navigation, agenda_detection, civic_conflict_engagement, curiosity_depth, exploratory_drive, adaptive_reframing, teaching_impulse, experimental_play, venture_activation, competitive_push, discipline_endurance, physical_mastery, sensory_awareness, energy_transmission, pressure_functioning.
- Devolvé entre 3 y 10 afinidades detectadas, ordenadas de mayor a menor strength.
- strength debe reflejar cuánto aparece esa orientación en el texto (0.1 = apenas insinuada, 0.9 = dominante y repetida).
- narrativeFlags son booleanos globales sobre el texto completo.
- compressionDetected = true si la persona expresa tener una capacidad que no puede ejercer, algo postergado, enterrado o bloqueado.
- confidence = tu nivel de certeza general sobre la extracción (0.5 = texto ambiguo, 0.9 = señales muy claras).
- NO inventés señales que no estén en el texto. Si algo no aparece, no lo incluyas.
- ANTI-INFLACIÓN (obligatorio):
  - public_expression / audience_activation / editorial_framing SOLO fuerte si hay audiencia, medios, voz pública o exposición explícita. "Escribir" o "comunicar" en privado NO alcanza.
  - social_coordination / group_reading SOLO si hay comunidad, grupo, colectivo o convocatoria explícita. Acompañar personas uno a uno = oneToOneOrientation, NO collectiveOrientation.
  - practical_execution / technical_assembly: NO inflar por trabajo administrativo, nómina u "office manager" sin reparar/armar/probar cosas reales.
  - narrative_creation / aesthetic_sensitivity: sí por relato, forma, infancia creativa, escenas.
  - publicAudienceDesire = true solo con audiencia o exposición pública explícita.
  - collectiveOrientation = true solo con acción grupal explícita.
- Respondé SOLO el JSON, sin explicaciones ni markdown.`;

function buildUserPrompt(userText: string): string {
  return `Analizá el siguiente texto de un usuario respondiendo un diagnóstico vocacional. Extraé las señales de afinidad humana presentes:\n\n---\n${userText}\n---`;
}

function parseResponse(raw: string): {
  affinitySignals: SemanticAffinitySignal[];
  narrativeFlags: SemanticNarrativeFlags;
  dominantCluster?: string;
  confidence: number;
} | null {
  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed || !Array.isArray(parsed.affinitySignals)) {
      return null;
    }

    const validSignals: SemanticAffinitySignal[] = parsed.affinitySignals
      .filter(
        (s: any) =>
          s &&
          typeof s.id === "string" &&
          VALID_AFFINITY_IDS.has(s.id) &&
          typeof s.strength === "number" &&
          s.strength >= 0 &&
          s.strength <= 1,
      )
      .map((s: any) => ({
        id: s.id as HumanAffinityId,
        strength: Math.round(s.strength * 100) / 100,
        evidence: typeof s.evidence === "string" ? s.evidence.slice(0, 200) : undefined,
      }));

    const flags: SemanticNarrativeFlags = {
      oneToOneOrientation: Boolean(parsed.narrativeFlags?.oneToOneOrientation),
      publicAudienceDesire: Boolean(parsed.narrativeFlags?.publicAudienceDesire),
      practicalExecution: Boolean(parsed.narrativeFlags?.practicalExecution),
      intellectualAbstraction: Boolean(parsed.narrativeFlags?.intellectualAbstraction),
      bodyOrientation: Boolean(parsed.narrativeFlags?.bodyOrientation),
      natureConnection: Boolean(parsed.narrativeFlags?.natureConnection),
      compressionDetected: Boolean(parsed.narrativeFlags?.compressionDetected),
      collectiveOrientation: Boolean(parsed.narrativeFlags?.collectiveOrientation),
      commercialIntent: Boolean(parsed.narrativeFlags?.commercialIntent),
      artisticFormDesire: Boolean(parsed.narrativeFlags?.artisticFormDesire),
    };

    const confidence =
      typeof parsed.confidence === "number"
        ? Math.max(0, Math.min(1, parsed.confidence))
        : 0.5;

    const dominantCluster =
      typeof parsed.dominantCluster === "string"
        ? parsed.dominantCluster
        : undefined;

    return { affinitySignals: validSignals, narrativeFlags: flags, dominantCluster, confidence };
  } catch {
    return null;
  }
}

export async function extractSemanticSignals(
  userText: string,
): Promise<SemanticExtractionResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return { ...EMPTY_SEMANTIC_RESULT, error: "OPENAI_API_KEY not configured" };
  }

  if (!userText || userText.trim().length < 20) {
    return { ...EMPTY_SEMANTIC_RESULT, error: "Input text too short for semantic analysis" };
  }

  const startTime = Date.now();

  try {
    const client = new OpenAI({ apiKey });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(userText.slice(0, 4000)) },
      ],
      temperature: 0.2,
      max_tokens: 1200,
    });

    const latencyMs = Date.now() - startTime;
    const content = response.choices[0]?.message?.content ?? "";

    const parsed = parseResponse(content);

    if (!parsed || parsed.affinitySignals.length === 0) {
      return {
        ...EMPTY_SEMANTIC_RESULT,
        latencyMs,
        rawModel: "gpt-4o-mini",
        error: "Failed to parse LLM response",
      };
    }

    return {
      ok: true,
      affinitySignals: parsed.affinitySignals,
      narrativeFlags: parsed.narrativeFlags,
      dominantCluster: parsed.dominantCluster,
      extractionConfidence: parsed.confidence,
      rawModel: "gpt-4o-mini",
      latencyMs,
    };
  } catch (err: any) {
    return {
      ...EMPTY_SEMANTIC_RESULT,
      latencyMs: Date.now() - startTime,
      error: `OpenAI API error: ${err?.message ?? String(err)}`,
    };
  }
}
