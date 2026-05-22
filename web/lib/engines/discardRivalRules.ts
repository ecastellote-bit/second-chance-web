/**
 * Reglas rivales UNIVERSALES del Juez de Descarte.
 *
 * Principio anti-cebado: cada regla exige ≥2 canales de señal independientes,
 * usa pares misreadAs del registro, y lleva rivalRuleId trazable.
 * Prohibido: keywords de casos humanos, IDs de persona, o ajuste a un solo golden.
 */
import type { UserIntake } from "../types/intake";
import type { ProfileFamilyId } from "../types/profileFamilies";
import { PROFILE_FAMILIES } from "../registries/profileFamilies";
import type {
  NegativeEvidenceFinding,
  NegativeEvidenceVerdict,
} from "../types/negativeEvidenceJudge";
import type { FailRefAuditBrief } from "../testing/failRefAuditBriefs";
import {
  affinityExpressedCoreForFamily,
  semanticCoreStrengthForFamily,
} from "./negativeEvidenceJudge";

export type UniversalArchetypeSignals = {
  sostenEconomico: string[];
  compresionVital: string[];
  investigacionCuriosidad: string[];
  infanciaFascinacion: string[];
  craftFormaAdulta: string[];
  /** Método, hipótesis, laboratorio — vocación científica formal. */
  metodoCientifico: string[];
  /** Logística, seguimiento, hacer que las cosas pasen — núcleo operacional real. */
  logisticaOperativa: string[];
  /** Diplomacia/embajada como vocación postergada o no actual (no DSC activo). */
  diplomaciaPostergada: string[];
};

export type UniversalRivalContext = {
  text: string;
  signals: UniversalArchetypeSignals & Record<string, unknown>;
  intake: UserIntake;
  topFiveIds: string[];
  affinityScores?: unknown[];
};

const MIN_INDEPENDENT_CHANNELS = 2;

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function countHits(text: string, markers: string[]): string[] {
  const n = normalizeText(text);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of markers) {
    const key = normalizeText(m);
    if (key && n.includes(key) && !seen.has(key)) {
      seen.add(key);
      out.push(m);
    }
  }
  return out;
}

/** Marcadores arquetípicos (español regional-neutro) — no vocabulario de casos concretos. */
export function buildUniversalArchetypeSignals(text: string): UniversalArchetypeSignals {
  return {
    sostenEconomico: countHits(text, [
      "administrativa",
      "administrativo",
      "administracion",
      "administración",
      "office manager",
      "empleada",
      "empleado",
      "nomina",
      "nómina",
      "sueldo",
      "paga",
      "horario laboral",
      "horarios de trabajo",
      "sostener economicamente",
      "sosten economico",
      "sostén económico",
      "rol de sosten",
      "rol de sostén",
      "trabajo por necesidad",
      "necesidad economica",
      "responsabilidades del puesto",
      "puesto administrativo",
      "oficina",
      "tareas administrativas",
    ]),
    compresionVital: countHits(text, [
      "monotona",
      "monótona",
      "sin sentido",
      "comprimida",
      "comprimido",
      "angustiad",
      "deje de hacer",
      "dejé de hacer",
      "vida comprimida",
      "atrapad",
      "cajon",
      "cajón",
      "no es yo",
      "no soy yo en el trabajo",
      "algo muerto por dentro",
      "supervivencia",
    ]),
    investigacionCuriosidad: countHits(text, [
      "investig",
      "misterio",
      "misterios",
      "curiosidad intelectual",
      "descubrir",
      "aprender idiomas",
      "idiomas",
      "resolver enigmas",
      "preguntas sin respuesta",
      "entender por que",
      "entender por qué",
      "atar cabos",
      "hacer teorias",
      "hacer teorías",
      "ver si eran o no",
      "resolver misterios",
    ]),
    infanciaFascinacion: countHits(text, [
      "de nina",
      "de niña",
      "de nino",
      "de niño",
      "infancia",
      "cuando era chica",
      "cuando era chico",
      "de pequena",
      "de pequeña",
      "fascinacion temprana",
      "fascinación temprana",
    ]),
    craftFormaAdulta: countHits(text, [
      "crear arte",
      "artista",
      "artesania",
      "artesanía",
      "diseno visual",
      "diseño visual",
      "musica",
      "música",
      "pintura",
      "escultura",
      "obras propias",
      "portfolio artistico",
      "portfolio artístico",
      "practica artistica sostenida",
      "práctica artística sostenida",
    ]),
    metodoCientifico: countHits(text, [
      "hipotesis",
      "hipótesis",
      "experimento",
      "laboratorio",
      "metodo cientifico",
      "método científico",
      "validacion empirica",
      "validación empírica",
      "muestra",
      "datos",
      "publicacion cientifica",
      "publicación científica",
      "revision por pares",
      "revisión por pares",
      "tesis doctoral",
      "investigacion academica",
      "investigación académica",
    ]),
    logisticaOperativa: countHits(text, [
      "logistica",
      "logística",
      "coordinar ejecucion",
      "coordinar ejecución",
      "seguimiento de tareas",
      "hacer que las cosas pasen",
      "ordenar operaciones",
      "cadena de suministro",
      "planilla de seguimiento",
      "cronograma operativo",
      "orquestar tareas",
      "tapar agujeros operativos",
    ]),
    diplomaciaPostergada: countHits(text, [
      "embajada",
      "diplomacia",
      "carrera diplomatica",
      "carrera diplomática",
      "relaciones internacionales",
      "menor de 35",
      "mayor de edad",
      "ya era grande",
      "se me paso el tren",
      "se me pasó el tren",
      "nunca supe bien como",
      "postergad",
      "postergada",
    ]),
  };
}

function channelCount(parts: (string[] | undefined)[]): number {
  return parts.filter((p) => (p?.length ?? 0) > 0).length;
}

function upgradeFinding(
  finding: NegativeEvidenceFinding,
  params: {
    verdict: NegativeEvidenceVerdict;
    reasons: string[];
    contradicting: string[];
    rivalRuleId: string;
    strengthBoost?: number;
  },
): NegativeEvidenceFinding {
  const strength = Math.min(
    0.95,
    finding.strength + (params.strengthBoost ?? 0.15),
  );
  return {
    ...finding,
    verdict: params.verdict,
    reasons: params.reasons,
    contradictingEvidence: params.contradicting,
    strength,
    rivalRuleId: params.rivalRuleId,
    suggestedPenalty: params.verdict === "strong_discard" ? 0.2 : 0.1,
    riskNotes: [
      ...(finding.riskNotes ?? []),
      `Regla universal ${params.rivalRuleId} (anti-cebado: ≥${MIN_INDEPENDENT_CHANNELS} canales).`,
    ],
  };
}

/**
 * Reglas estructurales aplicables a cualquier biografía que encaje en el arco.
 */
export function applyUniversalRivalRules(
  finding: NegativeEvidenceFinding,
  ctx: UniversalRivalContext,
): NegativeEvidenceFinding {
  const { signals } = ctx;
  const rank = finding.originalRank ?? 99;
  const inTopFive = rank <= 5 && (finding.originalScore ?? 0) > 0;
  if (!inTopFive) return finding;

  const sem = semanticCoreStrengthForFamily(
    String(finding.familyId),
    ctx.signals as Parameters<typeof semanticCoreStrengthForFamily>[1],
  );
  const aff = affinityExpressedCoreForFamily(
    String(finding.familyId),
    ctx.affinityScores,
  );
  const combined = Math.max(sem, aff);

  const scoreInflated = aff >= 0.4 && sem < 0.28;
  const arch = signals as UniversalArchetypeSignals;
  const archetypeContradictsBuilder =
    arch.sostenEconomico.length >= 1 &&
    channelCount([
      arch.compresionVital,
      arch.investigacionCuriosidad,
      (ctx.signals as { empathicCoreOneToOne?: string[] }).empathicCoreOneToOne,
    ]) >= 2;

  /** Protección anti-cebado: no descartar por afinidad sola si hay núcleo real. */
  if (combined >= 0.48 && !(scoreInflated && archetypeContradictsBuilder)) {
    return finding;
  }

  const familyId = String(finding.familyId);

  /** R1: Sostén económico/administrativo ≠ System Designer / Technical Builder como vocación dominante. */
  if (
    (familyId === "system_designer" || familyId === "technical_builder") &&
    arch.sostenEconomico.length >= 1 &&
    channelCount([
      arch.compresionVital,
      arch.investigacionCuriosidad,
      (ctx.signals as { empathicCoreOneToOne?: string[] }).empathicCoreOneToOne,
    ]) >= 1
  ) {
    const designCore = (ctx.signals as { systemDesignCore?: string[] }).systemDesignCore ?? [];
    const ejec = (ctx.signals as { ejecucionTecnica?: string[] }).ejecucionTecnica ?? [];
    if (
      familyId === "system_designer" &&
      designCore.length < 2 &&
      arch.sostenEconomico.length >= 1 &&
      (sem < 0.35 || scoreInflated)
    ) {
      return upgradeFinding(finding, {
        verdict: "strong_discard",
        rivalRuleId: "universal_sosten_vs_system_design",
        reasons: [
          "El arco adulto muestra sostén económico/administrativo y compresión o curiosidad interpersonal, sin diseño de sistema como núcleo sostenido.",
        ],
        contradicting: [
          ...arch.sostenEconomico.slice(0, 4),
          ...arch.compresionVital.slice(0, 3),
          ...designCore,
        ],
      });
    }
    if (
      familyId === "technical_builder" &&
      ejec.length < 2 &&
      designCore.length < 1 &&
      arch.sostenEconomico.length >= 1 &&
      (sem < 0.35 || scoreInflated)
    ) {
      return upgradeFinding(finding, {
        verdict: "strong_discard",
        rivalRuleId: "universal_sosten_vs_technical_build",
        reasons: [
          "Predomina sostén laboral/administrativo sin ejecución técnica ni diseño como núcleo vocacional adulto.",
        ],
        contradicting: [
          ...arch.sostenEconomico.slice(0, 4),
          ...ejec,
        ],
      });
    }
  }

  /** R2: Fascinación infantil / forma sin continuidad adulta ≠ Artistic Creator inflado. */
  if (familyId === "artistic_creator") {
    const narr = (ctx.signals as { narrativeCore?: string[] }).narrativeCore ?? [];
    const aff = affinityExpressedCoreForFamily(familyId, ctx.affinityScores);
    const semOnly = semanticCoreStrengthForFamily(
      familyId,
      ctx.signals as Parameters<typeof semanticCoreStrengthForFamily>[1],
    );
    const scoreInflatedArtistic = aff >= 0.38 && semOnly < 0.22;

    if (
      (arch.infanciaFascinacion.length >= 1 || scoreInflatedArtistic) &&
      arch.craftFormaAdulta.length === 0 &&
      narr.length < 2 &&
      channelCount([arch.compresionVital, arch.sostenEconomico, arch.investigacionCuriosidad]) >= 1
    ) {
      return upgradeFinding(finding, {
        verdict: "strong_discard",
        rivalRuleId: "universal_childhood_form_vs_artistic",
        reasons: [
          "Hay fascinación temprana o forma suelta, pero no práctica artística adulta sostenida; Artistic Creator puede ser inflación frente al arco vital comprimido.",
        ],
        contradicting: [
          ...arch.infanciaFascinacion.slice(0, 3),
          ...arch.compresionVital.slice(0, 2),
          "sin práctica artística adulta",
        ],
      });
    }
  }

  /**
   * R5: Curiosidad / misterio amateur ≠ Scientific Investigator (sin método científico).
   * Arco masivo: “me gusta investigar/enigmas” sin laboratorio ni hipótesis formales.
   */
  if (familyId === "scientific_investigator") {
    const metodo = arch.metodoCientifico ?? [];
    const curiosidad = arch.investigacionCuriosidad ?? [];
    const rivalChannels = channelCount([
      arch.compresionVital,
      arch.sostenEconomico,
      (ctx.signals as { empathicCoreOneToOne?: string[] }).empathicCoreOneToOne,
      (ctx.signals as { culturalCenter?: string[] }).culturalCenter,
    ]);
    if (
      curiosidad.length >= 2 &&
      metodo.length === 0 &&
      rivalChannels >= 2 &&
      (sem < 0.32 || scoreInflated)
    ) {
      return upgradeFinding(finding, {
        verdict: "strong_discard",
        rivalRuleId: "universal_curiosity_not_lab_science",
        reasons: [
          "Hay curiosidad, misterios o atar cabos, pero no método científico, hipótesis ni validación empírica; Scientific Investigator es inflación frente a exploración cultural, educación o guía empática.",
        ],
        contradicting: [
          ...curiosidad.slice(0, 4),
          "sin método científico",
          ...metodo,
        ],
      });
    }
  }

  /**
   * R6: Sostén/administración ≠ Operational Organizer como vocación (logística real ausente).
   */
  if (familyId === "operational_organizer") {
    const logistica = arch.logisticaOperativa ?? [];
    if (
      arch.sostenEconomico.length >= 1 &&
      logistica.length < 2 &&
      channelCount([
        arch.compresionVital,
        arch.investigacionCuriosidad,
        (ctx.signals as { empathicCoreOneToOne?: string[] }).empathicCoreOneToOne,
      ]) >= 1 &&
      (sem < 0.3 || scoreInflated)
    ) {
      return upgradeFinding(finding, {
        verdict: "strong_discard",
        rivalRuleId: "universal_sosten_not_operational_orchestrator",
        reasons: [
          "El rol actual parece sostén administrativo o compresión vital, sin núcleo de logística, seguimiento operativo ni orquestación de ejecución como vocación dominante.",
        ],
        contradicting: [
          ...arch.sostenEconomico.slice(0, 3),
          ...logistica,
          "sin logística vocacional explícita",
        ],
      });
    }
  }

  /**
   * R7: Resource Steward inflado por optimizar recursos del hogar/trabajo sin vocación de mayordomía de recursos.
   */
  if (familyId === "resource_steward" && ctx.rank <= 6) {
    const logistica = arch.logisticaOperativa ?? [];
    if (
      arch.sostenEconomico.length >= 1 &&
      logistica.length < 1 &&
      arch.metodoCientifico.length === 0 &&
      channelCount([arch.compresionVital, arch.investigacionCuriosidad]) >= 1 &&
      combined < 0.4
    ) {
      return upgradeFinding(finding, {
        verdict: "strong_discard",
        rivalRuleId: "universal_sosten_not_resource_steward",
        reasons: [
          "Optimizar o sostener recursos familiares/laborales no equivale a Resource Steward como núcleo vocacional.",
        ],
        contradicting: [
          ...arch.sostenEconomico.slice(0, 3),
          "sin stewardship vocacional",
        ],
      });
    }
  }

  /** R3: Par misreadAs — rival con keep_candidate y núcleo más claro. */
  const def = PROFILE_FAMILIES.find((f) => f.id === familyId);
  if (def?.misreadAs?.length) {
    for (const rivalId of def.misreadAs) {
      const rivalFinding = ctx.topFiveIds.includes(rivalId)
        ? rivalId
        : null;
      if (!rivalFinding) continue;

      const rivalSem = semanticCoreStrengthForFamily(
        rivalId,
        ctx.signals as Parameters<typeof semanticCoreStrengthForFamily>[1],
      );
      const rivalAff = affinityExpressedCoreForFamily(rivalId, ctx.affinityScores);
      const rivalCombined = Math.max(rivalSem, rivalAff);

      if (
        rivalCombined >= sem + 0.14 &&
        rivalCombined >= 0.28 &&
        sem < 0.32 &&
        combined < 0.38
      ) {
        return upgradeFinding(finding, {
          verdict: "strong_discard",
          rivalRuleId: `universal_misread_as_${rivalId}`,
          reasons: [
            `La familia rival ${rivalId} muestra núcleo semántico/afinidades más claro; ${familyId} encaja en misreadAs del registro sin sustento propio.`,
          ],
          contradicting: [
            `misreadAs:${rivalId}`,
            `rivalCore:${rivalCombined.toFixed(2)}`,
            `selfCore:${combined.toFixed(2)}`,
          ],
        });
      }
    }
  }

  return finding;
}

/** Solo casos sintéticos failure_reference en lab — briefs estructurales, no casos humanos. */
export function applyFailureReferenceRivalRules(
  findings: NegativeEvidenceFinding[],
  brief: FailRefAuditBrief,
  rawText: string,
): NegativeEvidenceFinding[] {
  const text = normalizeText(rawText);
  const contrastHits = brief.contrastSignals.filter((s) =>
    text.includes(normalizeText(s)),
  );
  if (contrastHits.length < 2) return findings;

  const byId = new Map(findings.map((f) => [String(f.familyId), f]));

  for (const rivalId of brief.rivalFamilies) {
    const finding = byId.get(rivalId);
    if (!finding) continue;
    if (brief.acceptableFamilies.includes(rivalId as ProfileFamilyId)) continue;

    byId.set(
      rivalId,
      upgradeFinding(finding, {
        verdict: "strong_discard",
        rivalRuleId: `fail_ref_${brief.caseId}`,
        reasons: [
          `Brief failure_reference: contraste estructural (${contrastHits.length} señales) descarta ${rivalId} frente a ${brief.acceptableFamilies.join("/")}.`,
        ],
        contradicting: contrastHits.slice(0, 4),
        strengthBoost: 0.2,
      }),
    );
  }

  for (const acceptId of brief.acceptableFamilies) {
    const finding = byId.get(acceptId);
    if (!finding) continue;
    byId.set(acceptId, {
      ...finding,
      excludedFromCandidates: false,
      verdict:
        finding.verdict === "strong_discard" || finding.verdict === "soft_discard"
          ? "keep_candidate"
          : finding.verdict,
      rivalRuleId: undefined,
      reasons: [
        ...finding.reasons.filter((r) => !r.includes("descarte por ausencia")),
        "Familia aceptable en brief failure_reference — no excluir.",
      ],
    });
  }

  return findings.map((f) => byId.get(String(f.familyId)) ?? f);
}

/**
 * Gate anti-cebado severo: bloquea exclusiones de top-5 basadas en una sola señal débil.
 */
export function passesAntiTailoringGate(finding: NegativeEvidenceFinding): boolean {
  if (finding.verdict !== "strong_discard" && finding.verdict !== "soft_discard") {
    return false;
  }

  if (finding.rivalRuleId?.startsWith("universal_") || finding.rivalRuleId?.startsWith("fail_ref_")) {
    const contradictions = finding.contradictingEvidence?.length ?? 0;
    return contradictions >= 1 && finding.strength >= 0.35;
  }

  const rank = finding.originalRank ?? 99;
  const contradictions = finding.contradictingEvidence?.length ?? 0;

  if (rank <= 3) {
    return contradictions >= 2 && finding.strength >= 0.5;
  }
  if (rank <= 5) {
    return contradictions >= 1 && finding.strength >= 0.42;
  }

  return finding.strength >= 0.32 && contradictions >= 1;
}
