import OpenAI from "openai";
import type { UserIntake } from "../types/intake";
import type { FinalReading } from "../types/result";
import type { ProfileFamilyScore } from "../types/profileFamilies";
import type { ProfileFamilyId } from "../types/profileFamilies";
import type {
  NarrativeClosureRisk,
  NarrativeCoherenceJudgeResult,
  NarrativeCoherenceReview,
  NarrativeCoherenceVerdict,
  NarrativeCompressionConcern,
  NarrativeDirectionFit,
  NarrativeRiskFlag,
  NarrativeRiskFlagType,
  NarrativeRiskSeverity,
} from "../types/narrativeCoherence";
import { PROFILE_FAMILIES } from "../registries/profileFamilies";
import {
  getMotorTopFamilyId,
  resolveNarrativeAuditFamily,
} from "./narrativeCoherenceAdjudication";
import {
  elevateCompressionConcern,
  extractNarrativePipelineContext,
  formatPipelineContextForPrompt,
  isShortSyntheticIntake,
} from "./narrativeCoherenceContext";
import {
  calibrateFailureReferenceReview,
  formatFailureReferenceBriefForPrompt,
} from "./failureReferenceAudit";
import {
  getFailRefAuditBrief,
  parseFailureReferenceCaseId,
} from "../testing/failRefAuditBriefs";

const VALID_FAMILY_IDS = new Set<string>(
  PROFILE_FAMILIES.map((f) => f.id),
);

const VALID_VERDICTS = new Set<NarrativeCoherenceVerdict>([
  "aligned",
  "frontier",
  "narrative_mismatch",
  "red_flag",
]);

const VALID_RISK_TYPES = new Set<NarrativeRiskFlagType>([
  "lexical_trap",
  "narrative_distortion",
  "compressed_life_undetected",
  "false_rivalry",
]);

const VALID_SEVERITIES = new Set<NarrativeRiskSeverity>([
  "low",
  "medium",
  "high",
]);

const VALID_DIRECTION_FIT = new Set<NarrativeDirectionFit>([
  "aligned",
  "frontier",
  "mismatch",
]);

const VALID_COMPRESSION_CONCERN = new Set<NarrativeCompressionConcern>([
  "none",
  "moderate",
  "high",
]);

const VALID_CLOSURE_RISK = new Set<NarrativeClosureRisk>([
  "ok",
  "too_closed",
  "compressed_ignored",
]);

const SYSTEM_PROMPT = `Sos el Juez de Coherencia Narrativa de VocationUp (Second Chance).

NO sos un clasificador por palabras clave. Sos un lector que audita si la familia vocacional top del motor resuena con la HISTORIA DE VIDA del usuario.

NO diagnosticás de nuevo. NO cambiás scores. Solo auditás coherencia narrativa.

REGLAS DE LECTURA (por arco, no por keywords):
1. Infancia/fascinaciones — qué movía sin que nadie pidiera
2. Escuela/patrones — qué se repetía
3. Pérdidas/renuncias — qué dejó y por qué
4. Presente comprimido — qué agota, qué no es "él/ella" en el trabajo
5. Futuro/transición — solo si hay texto en transitionGoal o restricciones (no inventar)

PESO: la historia ADULTA sostenida pesa más que un detalle infantil aislado.

DOS EJES (obligatorios — no mezclar):
- directionFit: ¿la TOP del motor resuena con la historia adulta? (aligned|frontier|mismatch)
- compressionConcern: ¿hay compresión vital que el cierre ignora? (none|moderate|high)
- closureRisk: ¿el resultType/cierre suena demasiado cerrado? (ok|too_closed|compressed_ignored)

TESTS DE ARCO (trampas — aplicar antes de verdict):
- Public vs Creative: ¿audiencia + postura + intervención colectiva, o solo forma/escena/texto?
- Public vs Diplomatic: ¿voz/agenda pública propia, o puente entre partes sin exposición?
- Empathic vs grupal: ¿uno a uno y clarificación subjetiva, o comunidad/medición?
- System vs Technical: ¿rediseñar estructura que genera el fallo, o hacer funcionar la pieza?
- Rol sostén vs vocación: admin/empleada = sostén económico salvo que la biografía adulta diga lo contrario

TRAMPAS CLÁSICAS:
- "escribir" sin audiencia/postura/agenda → creative_storyteller, NO public_communicator
- postura pública, intervenir, mover a otros → public_communicator, NO creative_storyteller solo por escribir
- escuchar uno a uno → empathic_guide, NO community_builder
- rediseñar sistema/estructura → system_designer, NO technical_builder solo por "arreglar"
- admin/empleada responsable puede ser SOSTÉN, no vocación dominante
- metáforas de compresión (cajón, monotonía, miedo, renuncias) → marcar compressed_life_undetected si el motor cerró fuerte

Respondé SOLO JSON válido:
{
  "verdict": "aligned|frontier|narrative_mismatch|red_flag",
  "directionFit": "aligned|frontier|mismatch",
  "compressionConcern": "none|moderate|high",
  "closureRisk": "ok|too_closed|compressed_ignored",
  "confidence": 0.0-1.0,
  "reason": "mínimo 3 oraciones",
  "evidence": ["cita literal del intake", "otra cita"],
  "family": "id_familia_sugerida_si_aplica",
  "narrativeSummary": "2-3 oraciones, historia coherente, NO lista de keywords",
  "coreTension": "qué abandonó vs qué hace vs qué anhela",
  "sostenActual": "qué es el rol de hoy (sostén vs vocación) en una frase",
  "alternativeFamilies": [{"familyId": "id", "reason": "por qué"}],
  "riskFlags": [{"type": "lexical_trap|...", "description": "...", "severity": "low|medium|high", "suspectedPair": ["id_a","id_b"]}]
}

- evidence: mínimo 2 citas cuando directionFit es mismatch o verdict es narrative_mismatch/red_flag
- family: la familia que MEJOR resuena con la HISTORIA adulta (recomendación auditiva), NO repetir la top del motor por defecto
- lexical_trap: incluir suspectedPair [familia_motor_o_rival, otra_familia] + cita que discrimina el test de arco
- Modo texto_corto: si el expediente indica intake sintético breve, podés omitir "family" y priorizar compressionConcern + lexical_trap
- En narrative_mismatch o red_flag: family debe reflejar tu lectura narrativa; si difiere de la top del motor, indicá la alternativa coherente (puede estar en alternativeFamilies)
- Si la familia top del motor YA coincide con tu lectura narrativa central → verdict "aligned" o "frontier", NO "narrative_mismatch"
- narrative_mismatch = discrepar de la TOP del motor en identidad vocacional, no por matices secundarios ni compresión sola
- public_communicator: postura, intervención, audiencia; diplomatic_social_connector: puente entre partes/grupos — no intercambiar si el texto es voz pública con postura
- Rol administrativo/empleada responsable = sostén económico, NO vocación dominante salvo que la historia adulta lo sostenga
- NO inventar citas ni hechos que no estén en el intake`;

function clamp(n: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, n));
}

function getTopFamilies(
  familyScores: ProfileFamilyScore[] | undefined,
  limit = 3,
): { id: string; label: string; score: number }[] {
  if (!familyScores?.length) return [];

  return [...familyScores]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit)
    .map((f) => ({
      id: String((f as { id?: string; familyId?: string }).id ?? (f as { familyId?: string }).familyId ?? ""),
      label: f.label ?? "",
      score: typeof f.score === "number" ? f.score : 0,
    }));
}

function formatIntakeForPrompt(intake: UserIntake): string {
  const { profile, currentContext, narrative } = intake;

  const failureRefId = parseFailureReferenceCaseId(
    narrative.additionalContext,
  );
  if (failureRefId) {
    const situation = currentContext.currentSituation?.trim() ?? "";
    return [
      "## Perfil (sintético)",
      `Edad: ${profile.age ?? "n/a"}`,
      `País: ${profile.country ?? ""}`,
      "",
      "## Bloque único (failure_reference — NO expandir)",
      situation,
      "",
      `Referencia de caso: ${failureRefId}`,
    ].join("\n");
  }

  return [
    "## Perfil",
    `Edad: ${profile.age ?? "n/a"}`,
    `País: ${profile.country ?? ""}`,
    `Situación laboral: ${profile.employmentStatus ?? ""}`,
    "",
    "## Contexto actual",
    `Rol: ${currentContext.currentRole ?? ""}`,
    `Situación: ${currentContext.currentSituation ?? ""}`,
    `Energía: ${currentContext.energyLevel ?? ""}`,
    `Presión económica: ${currentContext.economicPressure ?? ""}`,
    `Carga familiar: ${currentContext.familyLoad ?? ""}`,
    `Restricciones: ${(currentContext.restrictions ?? []).join("; ")}`,
    `Activos: ${(currentContext.assets ?? []).join("; ")}`,
    `Objetivo de transición: ${currentContext.transitionGoal ?? ""}`,
    "",
    "## Narrativa",
    `Infancia: ${narrative.childhoodMemories ?? ""}`,
    `Fascinaciones: ${narrative.earlyFascinations ?? ""}`,
    `Escuela: ${narrative.meaningfulSchoolSubjects ?? ""}`,
    `Patrones de trabajo: ${narrative.repeatedWorkPatterns ?? ""}`,
    `Rol social: ${narrative.naturalSocialRoles ?? ""}`,
    `Pérdidas/renuncias: ${narrative.lossesOrRenunciations ?? ""}`,
    `Comprimido hoy: ${narrative.whatFeelsCompressedNow ?? ""}`,
    narrative.additionalContext
      ? `Contexto adicional: ${narrative.additionalContext}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildUserPrompt(params: {
  intake: UserIntake;
  reading: FinalReading;
  topFamilies: { id: string; label: string; score: number }[];
  pipelineContextBlock: string;
  shortIntake: boolean;
  failureRefBriefBlock?: string;
  eligibleFamilyIds?: string[];
}): string {
  const eligibleSet = params.eligibleFamilyIds?.length
    ? new Set(params.eligibleFamilyIds)
    : null;

  const registryFamilies = eligibleSet
    ? PROFILE_FAMILIES.filter((f) => eligibleSet.has(f.id))
    : PROFILE_FAMILIES;

  const familyRegistry = registryFamilies
    .map((f) => `- ${f.id}: ${f.label} — ${f.summary}`)
    .join("\n");

  const excludedNote =
    eligibleSet && eligibleSet.size < PROFILE_FAMILIES.length
      ? `\n## Familias ya descartadas por el Juez de Descarte (NO re-evaluar como candidatas)\n${PROFILE_FAMILIES.filter((f) => !eligibleSet.has(f.id))
          .map((f) => `- ${f.id}`)
          .join("\n")}\n`
      : "";

  const topBlock = params.topFamilies
    .map((f, i) => `${i + 1}. ${f.id} (${f.label}) score=${f.score.toFixed(2)}`)
    .join("\n");

  return `## Familias del registro (solo estos IDs válidos — universo acotado post-descarte)
${familyRegistry}
${excludedNote}

${params.pipelineContextBlock}

${params.failureRefBriefBlock ? `${params.failureRefBriefBlock}\n` : ""}
${params.shortIntake && !params.failureRefBriefBlock ? "## Modo: intake sintético breve\nPriorizá directionFit, compressionConcern y lexical_trap. family es opcional.\n" : ""}

## Intake del usuario
${formatIntakeForPrompt(params.intake)}

Auditá coherencia narrativa en dos ejes (directionFit + compressionConcern) y closureRisk.
Si directionFit es mismatch, "family" debe ser tu recomendación desde la historia ADULTA (no copiar la #1 del motor salvo que coincida).`;
}

/**
 * Si la familia auditiva coincide con la top del motor, no puede ser mismatch fuerte.
 */
/** Pares que suelen ser frontera, no mismatch duro (golden set Public/Diplomatic, etc.). */
const REGISTRY_FRONTIER_PAIRS = new Set<string>([
  "public_communicator|diplomatic_social_connector",
  "diplomatic_social_connector|public_communicator",
  "creative_storyteller|artistic_creator",
  "artistic_creator|creative_storyteller",
  "empathic_guide|community_builder",
  "community_builder|empathic_guide",
]);

function isRegistryFrontierPair(
  a: string | undefined,
  b: string | undefined,
): boolean {
  if (!a || !b || a === b) return false;
  if (REGISTRY_FRONTIER_PAIRS.has(`${a}|${b}`)) return true;

  const motorDef = PROFILE_FAMILIES.find((f) => f.id === a);
  const otherDef = PROFILE_FAMILIES.find((f) => f.id === b);
  return (
    motorDef?.misreadAs?.includes(b as ProfileFamilyId) === true ||
    otherDef?.misreadAs?.includes(a as ProfileFamilyId) === true
  );
}

function calibrateVerdictWithMotorTop(
  review: NarrativeCoherenceReview,
  motorTopFamilyId: string | undefined,
): NarrativeCoherenceReview {
  if (!motorTopFamilyId) {
    return review;
  }

  if (
    (review.verdict === "narrative_mismatch" || review.verdict === "red_flag") &&
    review.family === motorTopFamilyId
  ) {
    return {
      ...review,
      verdict: "aligned",
      directionFit: "aligned",
      closureRisk: "ok",
    };
  }

  if (
    (review.verdict === "narrative_mismatch" || review.verdict === "red_flag") &&
    review.family &&
    isRegistryFrontierPair(motorTopFamilyId, review.family)
  ) {
    return {
      ...review,
      verdict: "frontier",
      directionFit: "frontier",
    };
  }

  if (
    review.verdict === "narrative_mismatch" &&
    !review.family &&
    review.confidence < 0.82
  ) {
    return {
      ...review,
      verdict: "frontier",
      directionFit: "frontier",
    };
  }

  return review;
}

function parseFamilyId(value: unknown): ProfileFamilyId | undefined {
  if (typeof value !== "string") return undefined;
  const id = value.trim();
  return VALID_FAMILY_IDS.has(id) ? (id as ProfileFamilyId) : undefined;
}

function parseDirectionFit(value: unknown): NarrativeDirectionFit | null {
  return typeof value === "string" &&
    VALID_DIRECTION_FIT.has(value as NarrativeDirectionFit)
    ? (value as NarrativeDirectionFit)
    : null;
}

function parseCompressionConcern(value: unknown): NarrativeCompressionConcern | null {
  return typeof value === "string" &&
    VALID_COMPRESSION_CONCERN.has(value as NarrativeCompressionConcern)
    ? (value as NarrativeCompressionConcern)
    : null;
}

function parseClosureRisk(value: unknown): NarrativeClosureRisk | null {
  return typeof value === "string" &&
    VALID_CLOSURE_RISK.has(value as NarrativeClosureRisk)
    ? (value as NarrativeClosureRisk)
    : null;
}

function reconcileVerdictFromAxes(params: {
  verdict: NarrativeCoherenceVerdict;
  directionFit: NarrativeDirectionFit;
  compressionConcern: NarrativeCompressionConcern;
  closureRisk: NarrativeClosureRisk;
}): NarrativeCoherenceVerdict {
  if (params.verdict === "red_flag") return "red_flag";
  if (params.directionFit === "mismatch") return "narrative_mismatch";
  if (params.directionFit === "frontier") return "frontier";
  if (
    params.directionFit === "aligned" &&
    params.closureRisk !== "ok" &&
    params.compressionConcern !== "none"
  ) {
    return "frontier";
  }
  if (params.directionFit === "aligned") return "aligned";
  return params.verdict;
}

function validateAndNormalizeReview(
  raw: unknown,
  options: { shortIntake: boolean },
): NarrativeCoherenceReview | null {
  if (!raw || typeof raw !== "object") return null;

  const p = raw as Record<string, unknown>;

  const verdictRaw = p.verdict;
  if (
    typeof verdictRaw !== "string" ||
    !VALID_VERDICTS.has(verdictRaw as NarrativeCoherenceVerdict)
  ) {
    return null;
  }

  const directionFit =
    parseDirectionFit(p.directionFit) ??
    (verdictRaw === "aligned"
      ? "aligned"
      : verdictRaw === "frontier"
        ? "frontier"
        : "mismatch");

  const compressionConcern =
    parseCompressionConcern(p.compressionConcern) ?? "none";

  const closureRisk = parseClosureRisk(p.closureRisk) ?? "ok";

  const verdict = reconcileVerdictFromAxes({
    verdict: verdictRaw as NarrativeCoherenceVerdict,
    directionFit,
    compressionConcern,
    closureRisk,
  });

  const confidence =
    typeof p.confidence === "number" ? clamp(p.confidence) : 0.5;

  const reason = typeof p.reason === "string" ? p.reason.trim() : "";
  if (reason.length < 40) return null;

  const evidence = Array.isArray(p.evidence)
    ? p.evidence
        .filter((e): e is string => typeof e === "string" && e.trim().length > 8)
        .map((e) => e.trim().slice(0, 500))
    : [];

  const needsEvidence =
    directionFit === "mismatch" ||
    verdict === "narrative_mismatch" ||
    verdict === "red_flag";

  if (needsEvidence && evidence.length < 2) {
    return null;
  }

  const narrativeSummary =
    typeof p.narrativeSummary === "string" ? p.narrativeSummary.trim() : "";
  if (narrativeSummary.length < 30) return null;

  const coreTension =
    typeof p.coreTension === "string" ? p.coreTension.trim() : "";
  if (coreTension.length < 15) return null;

  const sostenActual =
    typeof p.sostenActual === "string" ? p.sostenActual.trim() : undefined;

  let family = parseFamilyId(p.family);
  if (
    directionFit === "mismatch" &&
    !family &&
    !options.shortIntake
  ) {
    return null;
  }

  const alternativeFamilies = Array.isArray(p.alternativeFamilies)
    ? p.alternativeFamilies
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const row = item as Record<string, unknown>;
          const familyId = parseFamilyId(row.familyId);
          const altReason =
            typeof row.reason === "string" ? row.reason.trim() : "";
          if (!familyId || altReason.length < 10) return null;
          return { familyId, reason: altReason };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null)
    : [];

  const riskFlags: NarrativeRiskFlag[] = Array.isArray(p.riskFlags)
    ? p.riskFlags
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const row = item as Record<string, unknown>;
          const type = row.type;
          const severity = row.severity;
          if (
            typeof type !== "string" ||
            !VALID_RISK_TYPES.has(type as NarrativeRiskFlagType)
          ) {
            return null;
          }
          if (
            typeof severity !== "string" ||
            !VALID_SEVERITIES.has(severity as NarrativeRiskSeverity)
          ) {
            return null;
          }
          const description =
            typeof row.description === "string"
              ? row.description.trim()
              : "";
          if (description.length < 8) return null;

          let suspectedPair: [ProfileFamilyId, ProfileFamilyId] | undefined;
          if (Array.isArray(row.suspectedPair) && row.suspectedPair.length >= 2) {
            const a = parseFamilyId(row.suspectedPair[0]);
            const b = parseFamilyId(row.suspectedPair[1]);
            if (a && b) suspectedPair = [a, b];
          }

          const flag: NarrativeRiskFlag = {
            type: type as NarrativeRiskFlagType,
            description,
            severity: severity as NarrativeRiskSeverity,
          };
          if (suspectedPair) {
            flag.suspectedPair = suspectedPair;
          }
          return flag;
        })
        .filter((x): x is NarrativeRiskFlag => x !== null)
    : [];

  return {
    judgeId: "narrative_coherence_judge",
    verdict,
    confidence,
    reason,
    evidence,
    family,
    narrativeSummary,
    coreTension,
    sostenActual: sostenActual?.length ? sostenActual : undefined,
    alternativeFamilies,
    riskFlags,
    directionFit,
    compressionConcern,
    closureRisk,
  };
}

export function attachNarrativeCoherenceReview(
  reading: FinalReading,
  review: NarrativeCoherenceReview | null,
): FinalReading {
  if (!review) {
    return reading;
  }

  const existingTrace = reading.trace;
  const trace: Record<string, unknown> =
    existingTrace &&
    typeof existingTrace === "object" &&
    !Array.isArray(existingTrace)
      ? { ...(existingTrace as Record<string, unknown>) }
      : { rawTrace: existingTrace ?? null };

  trace.narrativeCoherenceReview = review;

  return {
    ...reading,
    trace,
    narrativeCoherenceReview: review,
  } as FinalReading;
}

export type NarrativeCoherenceJudgeInput = {
  intake: UserIntake;
  reading: FinalReading;
  familyScores?: ProfileFamilyScore[];
};

export async function runNarrativeCoherenceJudge(
  input: NarrativeCoherenceJudgeInput,
): Promise<NarrativeCoherenceJudgeResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const startTime = Date.now();

  if (!apiKey) {
    return {
      ok: false,
      review: null,
      latencyMs: Date.now() - startTime,
      skipped: true,
      error: "OPENAI_API_KEY not configured",
    };
  }

  const familyScores =
    input.familyScores ??
    (input.reading as FinalReading & { familyScores?: ProfileFamilyScore[] })
      .familyScores;

  const topFamilies = getTopFamilies(familyScores);
  const pipelineCtx = extractNarrativePipelineContext(
    input.reading,
    familyScores,
  );
  const failureRefCaseId = parseFailureReferenceCaseId(
    input.intake.narrative.additionalContext,
  );
  const failRefBrief = getFailRefAuditBrief(failureRefCaseId);
  const narrativeText = formatIntakeForPrompt(input.intake);
  const shortIntake =
    Boolean(failRefBrief) || isShortSyntheticIntake(narrativeText);

  const discardReview = (
    input.reading as FinalReading & {
      negativeEvidenceReview?: { eligibleFamiliesForAudit?: string[] };
      discardJudgeReview?: { eligibleFamiliesForAudit?: string[] };
    }
  ).negativeEvidenceReview ??
    (input.reading as FinalReading & {
      discardJudgeReview?: { eligibleFamiliesForAudit?: string[] };
    }).discardJudgeReview;

  const userPrompt = buildUserPrompt({
    intake: input.intake,
    reading: input.reading,
    topFamilies,
    pipelineContextBlock: formatPipelineContextForPrompt(
      pipelineCtx,
      input.reading,
    ),
    shortIntake,
    failureRefBriefBlock: failRefBrief
      ? formatFailureReferenceBriefForPrompt(failRefBrief)
      : undefined,
    eligibleFamilyIds: discardReview?.eligibleFamiliesForAudit,
  });

  try {
    const client = new OpenAI({ apiKey });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(
      raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim(),
    );

    const rawReview = validateAndNormalizeReview(parsed, { shortIntake });

    if (!rawReview) {
      return {
        ok: false,
        review: null,
        latencyMs: Date.now() - startTime,
        error: "Invalid or incomplete narrative coherence JSON",
      };
    }

    const motorTopFamilyId =
      topFamilies[0]?.id ?? getMotorTopFamilyId(familyScores);
    const { review: resolvedReview, familyResolution } = resolveNarrativeAuditFamily(
      rawReview,
      motorTopFamilyId,
    );

    let review = calibrateVerdictWithMotorTop(resolvedReview, motorTopFamilyId);

    let failureRefResolution:
      | NarrativeCoherenceReview["familyResolution"]
      | undefined;

    if (failRefBrief) {
      const calibrated = calibrateFailureReferenceReview(
        review,
        motorTopFamilyId,
        failRefBrief,
        input.intake.currentContext.currentSituation,
      );
      review = calibrated.review;
      if (calibrated.familyResolution) {
        failureRefResolution = calibrated.familyResolution;
      }
    }

    const elevatedCompression = elevateCompressionConcern(
      review.compressionConcern,
      pipelineCtx.priorCompressionDetected,
      input.reading.resultType,
    );

    if (elevatedCompression !== review.compressionConcern) {
      review = {
        ...review,
        compressionConcern: elevatedCompression,
        closureRisk:
          elevatedCompression === "high" && input.reading.resultType === "clear_direction"
            ? "compressed_ignored"
            : review.closureRisk,
        verdict: reconcileVerdictFromAxes({
          verdict: review.verdict,
          directionFit: review.directionFit,
          compressionConcern: elevatedCompression,
          closureRisk:
            elevatedCompression === "high" && input.reading.resultType === "clear_direction"
              ? "compressed_ignored"
              : review.closureRisk,
        }),
      };
    }

    const reviewWithMeta: NarrativeCoherenceReview =
      familyResolution != null || failureRefResolution != null
        ? {
            ...review,
            familyResolution: failureRefResolution ?? familyResolution,
          }
        : review;

    return {
      ok: true,
      review: reviewWithMeta,
      latencyMs: Date.now() - startTime,
    };
  } catch (error) {
    return {
      ok: false,
      review: null,
      latencyMs: Date.now() - startTime,
      error: String(error),
    };
  }
}

export {
  isNarrativeCoherenceJudgeEnabled,
  isNarrativeCoherenceLeversEnabled,
} from "./diagnosticJudgeIntegration";
