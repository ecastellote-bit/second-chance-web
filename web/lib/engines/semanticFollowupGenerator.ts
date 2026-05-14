import OpenAI from "openai";
import type { SemanticExtractionResult } from "../types/semantic";

export type SemanticFollowupQuestion = {
  id: string;
  prompt: string;
  intent: string;
  kind: "open_text" | "contrast_choice";
  options?: { id: string; label: string }[];
};

export type SemanticFollowupResult = {
  shouldAsk: boolean;
  reason: string;
  questions: SemanticFollowupQuestion[];
  latencyMs: number;
  error?: string;
};

const EMPTY_RESULT: SemanticFollowupResult = {
  shouldAsk: false,
  reason: "No follow-up needed",
  questions: [],
  latencyMs: 0,
};

function needsFollowup(semantic: SemanticExtractionResult): {
  needed: boolean;
  reason: string;
} {
  if (!semantic.ok) {
    return { needed: false, reason: "Semantic extraction failed — cannot generate follow-up" };
  }

  if (semantic.extractionConfidence < 0.5) {
    return { needed: true, reason: "low_confidence" };
  }

  if (semantic.affinitySignals.length >= 2) {
    const top = semantic.affinitySignals[0];
    const second = semantic.affinitySignals[1];
    if (top.strength - second.strength < 0.15) {
      return { needed: true, reason: "competing_signals" };
    }
  }

  if (semantic.affinitySignals.length <= 2 && semantic.extractionConfidence < 0.7) {
    return { needed: true, reason: "sparse_signals" };
  }

  return { needed: false, reason: "signals_clear" };
}

const FOLLOWUP_SYSTEM_PROMPT = `Sos un generador de preguntas de seguimiento para un diagnóstico vocacional. Tu trabajo es formular 2-3 preguntas que ayuden a desambiguar la orientación de una persona.

REGLAS:
- Las preguntas deben ser cálidas, en español rioplatense (tuteo con "vos")
- NO preguntes cosas genéricas como "qué te gusta hacer"
- Las preguntas deben ser ESPECÍFICAS al contexto detectado
- Cada pregunta debe ayudar a distinguir entre las orientaciones en tensión
- Usá un tono conversacional, empático, como un amigo que quiere entender mejor
- Devolvé SOLO JSON válido, sin markdown ni explicaciones

Formato de respuesta:
{
  "questions": [
    {
      "id": "sq_1",
      "prompt": "<la pregunta>",
      "intent": "<qué busca distinguir>",
      "kind": "open_text"
    }
  ]
}

Para preguntas de tipo "contrast_choice", incluí opciones:
{
  "id": "sq_2",
  "prompt": "<la pregunta>",
  "intent": "<qué busca distinguir>",
  "kind": "contrast_choice",
  "options": [
    { "id": "a", "label": "<opción A>" },
    { "id": "b", "label": "<opción B>" }
  ]
}`;

function buildFollowupUserPrompt(
  semantic: SemanticExtractionResult,
  reason: string,
): string {
  const signals = semantic.affinitySignals
    .slice(0, 5)
    .map((s) => `- ${s.id} (${s.strength}): "${s.evidence ?? "sin evidencia"}"`)
    .join("\n");

  const flags = Object.entries(semantic.narrativeFlags)
    .filter(([, v]) => v === true)
    .map(([k]) => k)
    .join(", ");

  let context = "";
  if (reason === "low_confidence") {
    context = "El texto del usuario es ambiguo o demasiado breve. Necesito preguntas que clarifiquen su orientación principal.";
  } else if (reason === "competing_signals") {
    context = "Hay dos o más orientaciones con fuerza similar. Necesito preguntas que ayuden a distinguir cuál es la dominante.";
  } else {
    context = "Las señales son escasas. Necesito preguntas que exploren más la realidad de la persona.";
  }

  return `Contexto: ${context}

Señales detectadas:
${signals}

Flags narrativos activos: ${flags || "ninguno"}
Cluster dominante: ${semantic.dominantCluster ?? "indefinido"}
Confianza: ${semantic.extractionConfidence}

Generá 2-3 preguntas de seguimiento que ayuden a clarificar.`;
}

export async function generateSemanticFollowup(
  semantic: SemanticExtractionResult,
): Promise<SemanticFollowupResult> {
  const { needed, reason } = needsFollowup(semantic);

  if (!needed) {
    return { ...EMPTY_RESULT, reason };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { ...EMPTY_RESULT, error: "OPENAI_API_KEY not configured" };
  }

  const startTime = Date.now();

  try {
    const client = new OpenAI({ apiKey });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: FOLLOWUP_SYSTEM_PROMPT },
        { role: "user", content: buildFollowupUserPrompt(semantic, reason) },
      ],
      temperature: 0.4,
      max_tokens: 600,
    });

    const latencyMs = Date.now() - startTime;
    const content = response.choices[0]?.message?.content ?? "";

    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed || !Array.isArray(parsed.questions)) {
      return { shouldAsk: false, reason: "parse_error", questions: [], latencyMs, error: "Failed to parse LLM response" };
    }

    const questions: SemanticFollowupQuestion[] = parsed.questions
      .filter((q: any) => q && typeof q.prompt === "string")
      .slice(0, 3)
      .map((q: any, i: number) => ({
        id: q.id || `sq_${i + 1}`,
        prompt: q.prompt,
        intent: q.intent || "",
        kind: q.kind === "contrast_choice" ? "contrast_choice" : "open_text",
        options: Array.isArray(q.options) ? q.options.slice(0, 4) : undefined,
      }));

    return {
      shouldAsk: questions.length > 0,
      reason,
      questions,
      latencyMs,
    };
  } catch (err: any) {
    return {
      shouldAsk: false,
      reason: "api_error",
      questions: [],
      latencyMs: Date.now() - startTime,
      error: `OpenAI error: ${err?.message ?? String(err)}`,
    };
  }
}
