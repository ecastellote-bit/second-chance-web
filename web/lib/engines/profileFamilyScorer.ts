import type {
  HumanAffinityId,
  HumanAffinityScore,
  HumanAffinityStatus,
} from "../types/humanAffinity";
import type { ProfileFamilyScore } from "../types/profileFamilies";
import { PROFILE_FAMILIES } from "../registries/profileFamilies";

type WeightedAffinity = {
  id: HumanAffinityId;
  weightedScore: number;
  raw: HumanAffinityScore;
};

type CalibrationResult = {
  score: number;
  confidence: number;
  hasEnoughCore: boolean;
  notes: string[];
};

const TECHNICAL_CONCRETE_MARKERS = [
  "technical",
  "builder",
  "build",
  "building",
  "material",
  "manual",
  "practical",
  "repair",
  "fix",
  "function",
  "functional",
  "implementation",
  "implementer",
  "execution",
  "operation",
  "operational",
  "tool",
  "mechanic",
  "mechanical",
  "electric",
  "electrical",
  "electronic",
  "craft",
  "making",
  "construction",
  "hands",
];

const ABSTRACT_SYSTEM_MARKERS = [
  "system",
  "system_ordering",
  "structural",
  "structure",
  "pattern",
  "strategy",
  "strategic",
  "architect",
  "architecture",
  "analytical",
  "model",
  "framework",
  "criteria",
  "design",
];

const EXPRESSIVE_MARKERS = [
  "narrative",
  "story",
  "storytelling",
  "aesthetic",
  "editorial",
  "expression",
  "expressive",
  "voice",
  "writing",
  "creative",
  "symbolic",
];

/**
 * Marcadores que sí justifican Community Builder.
 *
 * Importante:
 * No incluimos "leadership" o "liderazgo" como palabra suelta.
 * Liderazgo aislado puede ser herramienta, rol laboral o rasgo de carácter.
 * Para Community Builder debe haber grupo, comunidad, red, pertenencia,
 * convocatoria, coordinación colectiva o sostenimiento de espacios compartidos.
 */
const COMMUNITY_COLLECTIVE_MARKERS = [
  "community",
  "communal",
  "collective",
  "group",
  "team",
  "belonging",
  "membership",
  "network",
  "networking",
  "convocation",
  "convener",
  "gather",
  "assemble",
  "social_fabric",
  "social_coordination",
  "coordination_social",
  "collective_coordination",
  "group_coordination",
  "community_coordination",
  "community_building",
  "group_building",
  "space_sustaining",
  "shared_space",
  "moderation",
  "cohort",
  "circle",
  "ecosystem",
  "circulation",
  "participation",
  "pertenencia",
  "comunidad",
  "comunitario",
  "colectivo",
  "grupal",
  "grupo",
  "equipo",
  "red",
  "convocar",
  "convocatoria",
  "coordinar_grupo",
  "coordinacion_grupal",
  "coordinacion_colectiva",
  "sostener_espacios",
  "espacio_comun",
];

/**
 * Marcadores típicos de Empathic Guide / acompañamiento uno a uno.
 *
 * Estos pueden ser sociales y humanos, pero NO son prueba suficiente de
 * Community Builder si no aparece el objeto grupal/comunitario.
 */
const ONE_TO_ONE_HUMAN_SUPPORT_MARKERS = [
  "empathic",
  "empathy",
  "listen",
  "listening",
  "care",
  "caring",
  "support",
  "human_support",
  "contain",
  "containment",
  "accompany",
  "accompaniment",
  "guide",
  "guidance",
  "confid",
  "person",
  "individual",
  "inner",
  "psychological",
  "emotional",
  "processes",
  "human_process",
  "escucha",
  "escuchar",
  "acompanar",
  "acompañamiento",
  "acompanamiento",
  "contener",
  "contencion",
  "contención",
  "cuidado",
  "persona",
  "individual",
  "confidencia",
  "procesos_internos",
  "mundo_interno",
  "orientacion_humana",
];

const PUBLIC_COMMUNICATOR_CORE_MARKERS = ["public_expression"];

const PUBLIC_COMMUNICATOR_SUPPORT_MARKERS = [
  "audience_activation",
  "editorial_framing",
  "agenda_detection",
  "performance_presence",
  "narrative_creation",
];

const COMMUNICATION_ARCHITECTURE_MARKERS = [
  "system_ordering",
  "editorial_framing",
  "conceptual_abstraction",
];

const EDUCATOR_MARKERS = ["teaching_impulse"];
const STORYTELLER_MARKERS = ["aesthetic_sensitivity", "narrative_creation"];
const INSTITUTIONAL_MARKERS = [
  "institutional_navigation",
  "decision_ownership",
  "influence_negotiation",
];

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function statusMultiplier(status: HumanAffinityStatus): number {
  switch (status) {
    case "expressed":
      return 1.15;
    case "buried":
      return 1.05;
    case "latent":
      return 0.9;
    case "blocked":
      return 0.78;
    case "compensatory":
      return 0.45;
    default:
      return 0.75;
  }
}

function evidenceBonus(evidenceCount: number): number {
  if (evidenceCount >= 4) return 0.12;
  if (evidenceCount === 3) return 0.08;
  if (evidenceCount === 2) return 0.05;
  if (evidenceCount === 1) return 0.02;
  return 0;
}

function scoreAffinity(affinity: HumanAffinityScore): number {
  const base = affinity.score;
  const statusFactor = statusMultiplier(affinity.status);
  const confidenceFactor = 0.65 + affinity.confidence * 0.35;

  const weighted =
    base * statusFactor * confidenceFactor + evidenceBonus(affinity.evidenceCount);

  return clamp(weighted);
}

function buildAffinityMap(
  affinityScores: HumanAffinityScore[],
): Map<HumanAffinityId, HumanAffinityScore> {
  return new Map(
    affinityScores.map((affinity) => [affinity.id as HumanAffinityId, affinity]),
  );
}

function collectGlobalAffinities(
  affinityScores: HumanAffinityScore[],
  threshold: number,
): WeightedAffinity[] {
  return affinityScores
    .map((affinity) => {
      const weightedScore = scoreAffinity(affinity);
      if (weightedScore < threshold) return null;

      return {
        id: affinity.id as HumanAffinityId,
        weightedScore,
        raw: affinity,
      };
    })
    .filter((item): item is WeightedAffinity => item !== null);
}

function collectAffinities(
  ids: HumanAffinityId[],
  affinityMap: Map<HumanAffinityId, HumanAffinityScore>,
  threshold: number,
): WeightedAffinity[] {
  return ids
    .map((id) => {
      const affinity = affinityMap.get(id);
      if (!affinity) return null;

      const weightedScore = scoreAffinity(affinity);
      if (weightedScore < threshold) return null;

      return {
        id,
        weightedScore,
        raw: affinity,
      };
    })
    .filter((item): item is WeightedAffinity => item !== null);
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function sortWeightedAffinities(items: WeightedAffinity[]): WeightedAffinity[] {
  return [...items].sort((a, b) => {
    if (b.weightedScore !== a.weightedScore) {
      return b.weightedScore - a.weightedScore;
    }

    if (b.raw.confidence !== a.raw.confidence) {
      return b.raw.confidence - a.raw.confidence;
    }

    return b.raw.evidenceCount - a.raw.evidenceCount;
  });
}

function normalizeSignalText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function affinityIdIncludes(
  item: WeightedAffinity,
  markers: string[],
): boolean {
  const id = normalizeSignalText(String(item.id));

  return markers.some((marker) => {
    const normalizedMarker = normalizeSignalText(marker);
    return id.includes(normalizedMarker);
  });
}

function matchingSignalItems(
  items: WeightedAffinity[],
  markers: string[],
): WeightedAffinity[] {
  return items.filter((item) => affinityIdIncludes(item, markers));
}

function signalStrength(
  items: WeightedAffinity[],
  markers: string[],
): number {
  const matches = matchingSignalItems(items, markers);
  return average(matches.map((item) => item.weightedScore));
}

function signalCount(
  items: WeightedAffinity[],
  markers: string[],
): number {
  return matchingSignalItems(items, markers).length;
}

function applyFamilyCalibration(params: {
  familyId: string;
  core: WeightedAffinity[];
  supporting: WeightedAffinity[];
  global: WeightedAffinity[];
  baseScore: number;
  baseConfidence: number;
  hasEnoughCore: boolean;
}): CalibrationResult {
  let score = params.baseScore;
  let confidence = params.baseConfidence;
  let hasEnoughCore = params.hasEnoughCore;
  const notes: string[] = [];

  const all = [...params.core, ...params.supporting];
  const global = params.global;

  const technicalConcreteStrength = signalStrength(
    all,
    TECHNICAL_CONCRETE_MARKERS,
  );
  const technicalConcreteCount = signalCount(all, TECHNICAL_CONCRETE_MARKERS);

  const abstractSystemStrength = signalStrength(all, ABSTRACT_SYSTEM_MARKERS);
  const abstractSystemCount = signalCount(all, ABSTRACT_SYSTEM_MARKERS);

  const expressiveStrength = signalStrength(all, EXPRESSIVE_MARKERS);
  const expressiveCount = signalCount(all, EXPRESSIVE_MARKERS);

  const collectiveStrength = signalStrength(all, COMMUNITY_COLLECTIVE_MARKERS);
  const collectiveCount = signalCount(all, COMMUNITY_COLLECTIVE_MARKERS);

  const oneToOneSupportStrength = signalStrength(
    all,
    ONE_TO_ONE_HUMAN_SUPPORT_MARKERS,
  );
  const oneToOneSupportCount = signalCount(
    all,
    ONE_TO_ONE_HUMAN_SUPPORT_MARKERS,
  );

  /**
   * Regla anti-cebado:
   * Technical Builder no sube por una palabra aislada.
   * Necesita combinación: varias señales técnicas/concretas con fuerza suficiente.
   */
  if (params.familyId === "technical_builder") {
    const hasConcreteTechnicalCluster =
      technicalConcreteCount >= 2 && technicalConcreteStrength >= 0.26;

    const hasStrongConcreteTechnicalCluster =
      technicalConcreteCount >= 3 && technicalConcreteStrength >= 0.32;

    if (hasConcreteTechnicalCluster) {
      score += 0.06;
      confidence += 0.03;
      notes.push(
        "Ajuste contrastivo: aparecen varias señales de ejecución técnica/concreta; Technical Builder gana peso sin depender de una palabra aislada.",
      );
    }

    if (hasStrongConcreteTechnicalCluster) {
      score += 0.05;
      confidence += 0.04;
      hasEnoughCore = true;
      notes.push(
        "Ajuste de cobertura: el cluster técnico-concreto es suficientemente fuerte para evitar que la familia quede relegada sólo por falta de coincidencia exacta en afinidades núcleo.",
      );
    }
  }

  /**
   * Community Builder no debe absorber casos de acompañamiento uno a uno.
   *
   * Regla central:
   * - escucha, ayuda, cuidado, confidencia, orientación emocional o acompañamiento
   *   activan Empathic Guide;
   * - sólo activan fuerte Community Builder si además hay señales explícitas de
   *   grupo, comunidad, coordinación colectiva, pertenencia, convocatoria,
   *   red o sostenimiento de espacios compartidos.
   */
  if (params.familyId === "community_builder") {
    const hasExplicitCollectiveCluster =
      (collectiveCount >= 2 && collectiveStrength >= 0.24) ||
      (collectiveCount >= 1 && collectiveStrength >= 0.46);

    const looksLikeOneToOneSupport =
      oneToOneSupportCount >= 2 && oneToOneSupportStrength >= 0.24;

    const expressiveWithoutCollectiveObject =
      expressiveCount >= 1 &&
      expressiveStrength >= 0.2 &&
      !hasExplicitCollectiveCluster;

    if (hasExplicitCollectiveCluster) {
      score += 0.04;
      confidence += 0.03;
      hasEnoughCore = true;
      notes.push(
        "Ajuste de validación comunitaria: aparecen señales explícitas de grupo, comunidad, coordinación colectiva o pertenencia; Community Builder puede competir legítimamente.",
      );
    }

    if (!hasExplicitCollectiveCluster && looksLikeOneToOneSupport) {
      score = Math.min(score - 0.16, 0.54);
      confidence = Math.min(confidence - 0.08, 0.48);
      hasEnoughCore = false;
      notes.push(
        "Ajuste anti-contaminación: el caso muestra acompañamiento humano uno a uno, escucha o contención, pero no evidencia explícita de comunidad, grupo o coordinación colectiva; Community Builder queda limitado para no competir falsamente con Empathic Guide.",
      );
    }

    if (!hasExplicitCollectiveCluster && expressiveWithoutCollectiveObject) {
      score = Math.min(score - 0.08, 0.56);
      confidence = Math.min(confidence - 0.04, 0.5);
      notes.push(
        "Ajuste anti-arrastre: señales expresivas o interpretativas sin objeto comunitario no deben empujar Community Builder como frontera principal.",
      );
    }

    if (!hasExplicitCollectiveCluster && !looksLikeOneToOneSupport) {
      score = Math.min(score, 0.58);
      confidence = Math.min(confidence, 0.52);
      notes.push(
        "Ajuste de prudencia: sin señales colectivas explícitas, Community Builder puede quedar visible para auditoría, pero no debe cerrarse como dirección fuerte.",
      );
    }
  }

  /**
   * System Designer debe ganar cuando hay diseño/estructura/criterio.
   * Pero si el caso trae mucha evidencia concreta de ejecución técnica,
   * no debe absorber automáticamente el caso sólo por system_ordering.
   */
  if (params.familyId === "system_designer") {
    const concreteOutweighsAbstract =
      technicalConcreteCount >= 2 &&
      technicalConcreteStrength > abstractSystemStrength + 0.04;

    const abstractIsThin =
      abstractSystemCount <= 1 || abstractSystemStrength < 0.26;

    if (concreteOutweighsAbstract && abstractIsThin) {
      score -= 0.06;
      confidence -= 0.03;
      notes.push(
        "Ajuste contrastivo: la evidencia concreta/técnica supera a la evidencia abstracta de diseño sistémico; System Designer no debe absorber automáticamente el caso.",
      );
    }

    const publicCoreStrength = signalStrength(
      global,
      PUBLIC_COMMUNICATOR_CORE_MARKERS,
    );
    const publicCoreCount = signalCount(global, PUBLIC_COMMUNICATOR_CORE_MARKERS);

    const publicSupportStrength = signalStrength(
      global,
      PUBLIC_COMMUNICATOR_SUPPORT_MARKERS,
    );
    const publicSupportCount = signalCount(
      global,
      PUBLIC_COMMUNICATOR_SUPPORT_MARKERS,
    );

    const communicationArchitectureStrength = signalStrength(
      global,
      COMMUNICATION_ARCHITECTURE_MARKERS,
    );
    const communicationArchitectureCount = signalCount(
      global,
      COMMUNICATION_ARCHITECTURE_MARKERS,
    );

    const educatorStrength = signalStrength(global, EDUCATOR_MARKERS);
    const storytellerStrength = signalStrength(global, STORYTELLER_MARKERS);
    const institutionalStrength = signalStrength(global, INSTITUTIONAL_MARKERS);

    const hasStrongPublicCommunicatorSignature =
      publicCoreCount >= 1 &&
      publicCoreStrength >= 0.3 &&
      publicSupportCount >= 2 &&
      publicSupportStrength >= 0.22;

    const hasCommunicationArchitectureCluster =
      communicationArchitectureCount >= 2 &&
      communicationArchitectureStrength >= 0.22 &&
      abstractSystemCount >= 1 &&
      abstractSystemStrength >= 0.24;

    const teachingDominates = educatorStrength > publicCoreStrength + 0.06;
    const aestheticNarrativeDominates =
      storytellerStrength > publicSupportStrength + 0.08;
    const institutionalDominates =
      institutionalStrength > publicSupportStrength + 0.08;
    const technicalDominates =
      technicalConcreteCount >= 2 &&
      technicalConcreteStrength > abstractSystemStrength + 0.05;

    const allowCommunicationArchitectureFrontierBoost =
      hasStrongPublicCommunicatorSignature &&
      hasCommunicationArchitectureCluster &&
      !teachingDominates &&
      !aestheticNarrativeDominates &&
      !institutionalDominates &&
      !technicalDominates;

    if (allowCommunicationArchitectureFrontierBoost) {
      score += 0.20;
      confidence += 0.04;
      hasEnoughCore = true;
      notes.push(
        "Boost de frontera: Public Communicator con arquitectura comunicacional fuerte activa System Designer como familia secundaria plausible.",
      );
    }
  }

  /**
   * Control para familias expresivas:
   * si una familia creativa/comunicacional aparece con fuerza,
   * debe estar respaldada por varias señales expresivas reales,
   * no por una sola superficie narrativa.
   */
  if (
    params.familyId === "creative_storyteller" ||
    params.familyId === "public_communicator"
  ) {
    const expressiveEvidenceIsThin =
      expressiveCount <= 1 || expressiveStrength < 0.24;

    const technicalEvidenceIsStronger =
      technicalConcreteCount >= 2 &&
      technicalConcreteStrength > expressiveStrength + 0.06;

    if (expressiveEvidenceIsThin && technicalEvidenceIsStronger) {
      score -= 0.07;
      confidence -= 0.04;
      notes.push(
        "Ajuste anti-sobreactura expresiva: la evidencia narrativa/comunicacional es débil frente a señales técnicas/concretas.",
      );
    }
  }

  return {
    score: clamp(score),
    confidence: clamp(confidence),
    hasEnoughCore,
    notes,
  };
}

function buildRationale(params: {
  label: string;
  core: WeightedAffinity[];
  supporting: WeightedAffinity[];
  tensions: WeightedAffinity[];
  score: number;
  confidence: number;
  hasEnoughCore: boolean;
  calibrationNotes: string[];
}): string[] {
  const lines: string[] = [];

  if (params.core.length > 0) {
    lines.push(
      `Afinidades núcleo detectadas para ${params.label}: ${params.core
        .map((item) => `${item.id} (${item.raw.status})`)
        .join(", ")}.`,
    );
  } else {
    lines.push(`No se detectaron afinidades núcleo claras para ${params.label}.`);
  }

  if (params.supporting.length > 0) {
    lines.push(
      `Afinidades de apoyo: ${params.supporting
        .map((item) => `${item.id} (${item.raw.status})`)
        .join(", ")}.`,
    );
  }

  if (params.tensions.length > 0) {
    lines.push(
      `Tensiones de adjudicación presentes: ${params.tensions
        .map((item) => `${item.id} (${item.raw.status})`)
        .join(", ")}.`,
    );
  }

  if (params.calibrationNotes.length > 0) {
    lines.push(...params.calibrationNotes);
  }

  if (!params.hasEnoughCore) {
    lines.push(
      "Cobertura núcleo insuficiente para adjudicación fuerte; la familia queda visible principalmente para auditoría comparativa.",
    );
  }

  lines.push(
    `Puntaje familiar ${params.score.toFixed(2)} con confianza ${params.confidence.toFixed(
      2,
    )}.`,
  );

  return lines;
}

export function scoreProfileFamiliesFromAffinities(
  affinityScores: HumanAffinityScore[],
): ProfileFamilyScore[] {
  const affinityMap = buildAffinityMap(affinityScores);
  const global = collectGlobalAffinities(affinityScores, 0.14);

  const familyScores = PROFILE_FAMILIES.map((family): ProfileFamilyScore => {
    const coreAffinities = family.coreAffinities ?? [];
    const supportingAffinities = family.supportingAffinities ?? [];
    const tensionAffinities = family.tensionAffinities ?? [];

    const core = collectAffinities(coreAffinities, affinityMap, 0.18);
    const supporting = collectAffinities(
      supportingAffinities,
      affinityMap,
      0.14,
    );
    const tensions = collectAffinities(tensionAffinities, affinityMap, 0.16);

    const coreCoverage =
      coreAffinities.length > 0 ? core.length / coreAffinities.length : 0;

    const supportingCoverage =
      supportingAffinities.length > 0
        ? supporting.length / supportingAffinities.length
        : 0;

    const coreStrength = average(core.map((item) => item.weightedScore));
    const supportingStrength = average(
      supporting.map((item) => item.weightedScore),
    );
    const tensionStrength = average(tensions.map((item) => item.weightedScore));

    let hasEnoughCore =
      core.length >= 1 &&
      (coreCoverage >= 0.33 ||
        coreStrength >= 0.24 ||
        core.some((item) => item.raw.status === "expressed") ||
        core.some((item) => item.raw.status === "buried"));

    let score =
      coreStrength * 0.56 +
      coreCoverage * 0.22 +
      supportingStrength * 0.12 +
      supportingCoverage * 0.06 -
      tensionStrength * 0.12;

    if (
      core.some((item) => item.raw.status === "buried") &&
      coreStrength >= 0.28
    ) {
      score += 0.05;
    }

    if (
      core.filter(
        (item) =>
          item.raw.status === "expressed" ||
          item.raw.status === "buried" ||
          item.raw.status === "latent",
      ).length >= 2
    ) {
      score += 0.05;
    }

    score = clamp(score);

    const participatingAffinities = sortWeightedAffinities([
      ...core,
      ...supporting,
    ]);

    const meanAffinityConfidence = average(
      participatingAffinities.map((item) => item.raw.confidence),
    );
    const evidenceDensity = average(
      participatingAffinities.map((item) => clamp(item.raw.evidenceCount / 4)),
    );

    let confidence = clamp(
      meanAffinityConfidence * 0.6 +
        coreCoverage * 0.22 +
        supportingCoverage * 0.08 +
        evidenceDensity * 0.1,
    );

    const calibration = applyFamilyCalibration({
      familyId: String(family.id),
      core,
      supporting,
      global,
      baseScore: score,
      baseConfidence: confidence,
      hasEnoughCore,
    });

    score = calibration.score;
    confidence = calibration.confidence;
    hasEnoughCore = calibration.hasEnoughCore;

    /**
     * No borramos familias débiles: las dejamos visibles para ranking/auditoría.
     * Pero si no tienen cobertura suficiente, no deben ganar por accidente.
     */
    if (!hasEnoughCore) {
      score = clamp(score - 0.18);
      confidence = clamp(confidence - 0.22);
    }

    const rationale = buildRationale({
      label: family.label,
      core,
      supporting,
      tensions,
      score,
      confidence,
      hasEnoughCore,
      calibrationNotes: calibration.notes,
    });

    return {
      id: family.id,
      label: family.label,
      summary: family.summary,
      score,
      confidence,
      matchedCoreAffinities: core.map((item) => item.id),
      matchedSupportingAffinities: supporting.map((item) => item.id),
      tensionHits: tensions.map((item) => item.id),
      subtypeCandidates: family.subtypeCandidates,
      misreadAs: family.misreadAs,
      rationale,
    };
  });

  return familyScores.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    return b.matchedCoreAffinities.length - a.matchedCoreAffinities.length;
  });
}