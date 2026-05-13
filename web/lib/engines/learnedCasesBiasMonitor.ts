/**
 * Bias Monitor for Learned Cases — AUDIT-ONLY
 *
 * This module is strictly read-only. It:
 * - Does NOT modify LEARNED_DIAGNOSTIC_CASES
 * - Does NOT modify scores, rankings, resultType, or diagnosis
 * - Does NOT modify family selection or theme selection
 * - Does NOT produce side effects of any kind
 * - Only reads the cases array and returns a pure report object
 */

import { LEARNED_DIAGNOSTIC_CASES } from "../learning/learnedCases";
import type { LearnedDiagnosticCase } from "../types/learning";

// ---------------------------------------------------------------------------
// Thresholds — grouped for future calibration
// ---------------------------------------------------------------------------

export const BIAS_MONITOR_THRESHOLDS = {
  /** A family is flagged for over-representation if activeInfluence > avg * this factor */
  distributionSkewFactor: 2.5,
  /** Minimum active cases for a family to trigger distribution_skew */
  distributionSkewMinCases: 4,
  /** A family flagged as rivalry-asymmetric if it appears as rival >= this many times with 0 wins */
  rivalryAsymmetryMinRivals: 5,
  /** A single token is flagged if it dominates (single family) with >= this many occurrences */
  vocabularyConcentrationMinOccurrences: 3,
  /** Hot-family concentration alert fires if these families hold > this fraction of active influence */
  hotFamilyConcentrationMax: 0.7,
  /** Minimum token length to consider in vocabulary analysis */
  vocabularyMinTokenLength: 4,
  /** Minimum vocabulary occurrences to include in report */
  vocabularyMinTotalOccurrences: 2,
} as const;

// ---------------------------------------------------------------------------
// Hot families (secondary watchlist, not the only criterion)
// ---------------------------------------------------------------------------

const HOT_FAMILIES = [
  "community_builder",
  "empathic_guide",
  "public_communicator",
  "creative_storyteller",
];

// ---------------------------------------------------------------------------
// Contamination markers — only checked against HUMAN VOICE fields
// ---------------------------------------------------------------------------

const CONTAMINATION_MARKERS = [
  "caso semilla",
  "sistema devolvió",
  "sistema devolvio",
  "frontera con orden invertido",
  "watchlist",
  "calibración y consulta",
  "calibracion y consulta",
  "quarantine",
  "metadata contamination",
  "metadata_contamination",
  "observedTop1",
  "observedTop2",
  "influenceWeight",
  "learningTier",
  "frontier_support",
  "calibration_only",
  "do_not_use_as_validated_case",
  "quarantine_language_contaminated",
  "rejectedForInfluence",
];

/**
 * Markers in missingCuesDetected that indicate the case should NOT influence.
 * These are metadata annotations, not human-voice contamination.
 */
const EXCLUSION_METADATA_MARKERS = [
  "quarantine_language_contaminated",
  "metadata_contamination_review_required",
  "calibration_only",
  "do_not_use_as_validated_case",
  "influenceWeight: 0",
  "rejectedForInfluence",
  "nota: no promover como learned fuerte",
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FamilyDistribution = {
  familyId: string;
  asPrimary: number;
  asAcceptable: number;
  asRival: number;
  activeInfluence: number;
  quarantined: number;
};

export type VocabularyConcentration = {
  token: string;
  familiesPushed: string[];
  occurrences: number;
  isSingleFamilyDominant: boolean;
};

export type ContaminationFinding = {
  caseId: string;
  expectedPrimaryFamily: string;
  matchedMarkers: string[];
};

export type BiasAlert = {
  severity: "info" | "warning" | "critical";
  category:
    | "distribution_skew"
    | "vocabulary_concentration"
    | "rivalry_asymmetry"
    | "language_contamination"
    | "hot_family_concentration"
    | "general_influence_imbalance";
  message: string;
  affectedFamilies: string[];
};

export type BiasMonitorReport = {
  totalCases: number;
  activeCases: number;
  quarantinedCases: number;
  familyDistribution: FamilyDistribution[];
  vocabularyConcentration: VocabularyConcentration[];
  contaminationFindings: ContaminationFinding[];
  alerts: BiasAlert[];
  hotFamilyShare: number | null;
  timestamp: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeForCheck(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts ONLY human-voice text from a case for contamination checks.
 * Does NOT include technical metadata fields.
 */
function extractHumanVoiceText(c: LearnedDiagnosticCase): string {
  const parts: string[] = [c.inputText];
  if (c.keyHumanLanguage) {
    parts.push(...c.keyHumanLanguage);
  }
  return normalizeForCheck(parts.join(" "));
}

/**
 * Determines if a case is quarantined (should NOT count as actively influential).
 *
 * Criteria:
 * 1. shouldInfluenceFutureCases !== true
 * 2. verdict === "borderline"
 * 3. missingCuesDetected contains exclusion metadata markers
 */
function isQuarantined(c: LearnedDiagnosticCase): boolean {
  if (!c.shouldInfluenceFutureCases) return true;
  if (c.verdict === "borderline") return true;

  const cues = c.missingCuesDetected ?? [];
  const cuesNorm = normalizeForCheck(cues.join(" "));

  for (const marker of EXCLUSION_METADATA_MARKERS) {
    if (cuesNorm.includes(normalizeForCheck(marker))) return true;
  }

  return false;
}

/**
 * Checks human-voice fields for lab/metadata contamination.
 * Only flags cases where the actual inputText or keyHumanLanguage
 * contains language that belongs in metadata, not in simulated user voice.
 */
function detectContamination(
  cases: LearnedDiagnosticCase[],
): ContaminationFinding[] {
  const findings: ContaminationFinding[] = [];

  for (const c of cases) {
    if (!c.shouldInfluenceFutureCases) continue;

    const humanText = extractHumanVoiceText(c);
    const matched: string[] = [];

    for (const marker of CONTAMINATION_MARKERS) {
      if (humanText.includes(normalizeForCheck(marker))) {
        matched.push(marker);
      }
    }

    if (matched.length > 0) {
      findings.push({
        caseId: c.id,
        expectedPrimaryFamily: c.expectedPrimaryFamily,
        matchedMarkers: matched,
      });
    }
  }

  return findings;
}

// ---------------------------------------------------------------------------
// Distribution
// ---------------------------------------------------------------------------

function buildFamilyDistribution(
  cases: LearnedDiagnosticCase[],
): FamilyDistribution[] {
  const map = new Map<string, FamilyDistribution>();

  const ensure = (id: string) => {
    if (!map.has(id)) {
      map.set(id, {
        familyId: id,
        asPrimary: 0,
        asAcceptable: 0,
        asRival: 0,
        activeInfluence: 0,
        quarantined: 0,
      });
    }
    return map.get(id)!;
  };

  for (const c of cases) {
    const q = isQuarantined(c);
    const primary = ensure(c.expectedPrimaryFamily);
    primary.asPrimary += 1;
    if (q) primary.quarantined += 1;
    if (!q) primary.activeInfluence += 1;

    for (const f of c.acceptableFamilies) {
      ensure(f).asAcceptable += 1;
    }
    for (const f of c.rivalFamilies) {
      ensure(f).asRival += 1;
    }
  }

  return Array.from(map.values()).sort((a, b) => b.asPrimary - a.asPrimary);
}

// ---------------------------------------------------------------------------
// Vocabulary concentration
// ---------------------------------------------------------------------------

function buildVocabularyConcentration(
  cases: LearnedDiagnosticCase[],
): VocabularyConcentration[] {
  const tokenFamilyMap = new Map<string, Map<string, number>>();

  for (const c of cases) {
    if (isQuarantined(c)) continue;
    for (const token of c.keyHumanLanguage) {
      const norm = normalizeForCheck(token);
      if (norm.length < BIAS_MONITOR_THRESHOLDS.vocabularyMinTokenLength) continue;
      if (!tokenFamilyMap.has(norm)) tokenFamilyMap.set(norm, new Map());
      const familyCount = tokenFamilyMap.get(norm)!;
      const prev = familyCount.get(c.expectedPrimaryFamily) ?? 0;
      familyCount.set(c.expectedPrimaryFamily, prev + 1);
    }
  }

  const results: VocabularyConcentration[] = [];
  for (const [token, familyCounts] of tokenFamilyMap) {
    const total = Array.from(familyCounts.values()).reduce((a, b) => a + b, 0);
    if (total < BIAS_MONITOR_THRESHOLDS.vocabularyMinTotalOccurrences) continue;
    const families = Array.from(familyCounts.keys());
    const maxCount = Math.max(...familyCounts.values());
    results.push({
      token,
      familiesPushed: families,
      occurrences: total,
      isSingleFamilyDominant: families.length === 1 && maxCount >= 2,
    });
  }

  return results
    .filter(
      (r) =>
        r.isSingleFamilyDominant ||
        r.occurrences >= BIAS_MONITOR_THRESHOLDS.vocabularyConcentrationMinOccurrences,
    )
    .sort((a, b) => b.occurrences - a.occurrences);
}

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

function detectAlerts(
  distribution: FamilyDistribution[],
  vocabulary: VocabularyConcentration[],
  contamination: ContaminationFinding[],
  cases: LearnedDiagnosticCase[],
): { alerts: BiasAlert[]; hotFamilyShare: number | null } {
  const alerts: BiasAlert[] = [];
  const activeCases = cases.filter((c) => !isQuarantined(c));
  const totalActive = activeCases.length;

  if (totalActive === 0) return { alerts, hotFamilyShare: null };

  const familiesWithPrimary = distribution.filter((d) => d.asPrimary > 0).length;
  const avgPrimary = familiesWithPrimary > 0 ? totalActive / familiesWithPrimary : 0;

  // --- General distribution skew (ALL families) ---
  for (const d of distribution) {
    if (
      d.activeInfluence >
        avgPrimary * BIAS_MONITOR_THRESHOLDS.distributionSkewFactor &&
      d.activeInfluence >= BIAS_MONITOR_THRESHOLDS.distributionSkewMinCases
    ) {
      alerts.push({
        severity: "warning",
        category: "distribution_skew",
        message: `"${d.familyId}" tiene ${d.activeInfluence} casos activos influyentes (promedio: ${avgPrimary.toFixed(1)}). Posible sobre-representación.`,
        affectedFamilies: [d.familyId],
      });
    }

    if (
      d.asRival >= BIAS_MONITOR_THRESHOLDS.rivalryAsymmetryMinRivals &&
      d.asPrimary === 0
    ) {
      alerts.push({
        severity: "warning",
        category: "rivalry_asymmetry",
        message: `"${d.familyId}" aparece ${d.asRival} veces como rival pero nunca gana. Posible sesgo negativo.`,
        affectedFamilies: [d.familyId],
      });
    }

    if (d.asPrimary >= 2 && d.asRival === 0 && d.asPrimary >= avgPrimary) {
      alerts.push({
        severity: "info",
        category: "rivalry_asymmetry",
        message: `"${d.familyId}" gana ${d.asPrimary} veces pero nunca aparece como rival. No hay presión competitiva contra ella en la biblioteca.`,
        affectedFamilies: [d.familyId],
      });
    }
  }

  // --- General influence imbalance (top N families with most active cases) ---
  const sortedByInfluence = [...distribution].sort(
    (a, b) => b.activeInfluence - a.activeInfluence,
  );
  const top3Active = sortedByInfluence.slice(0, 3);
  const top3Total = top3Active.reduce((s, d) => s + d.activeInfluence, 0);
  if (
    top3Total > 0 &&
    totalActive > 6 &&
    top3Total / totalActive > BIAS_MONITOR_THRESHOLDS.hotFamilyConcentrationMax
  ) {
    alerts.push({
      severity: "warning",
      category: "general_influence_imbalance",
      message: `Las 3 familias con más influencia activa (${top3Active.map((d) => d.familyId).join(", ")}) concentran ${((top3Total / totalActive) * 100).toFixed(0)}% del total. Riesgo de sobre-calibración general.`,
      affectedFamilies: top3Active.map((d) => d.familyId),
    });
  }

  // --- Hot-family secondary check (CB, EG, PC, CS) ---
  const hotFamilyActive = distribution
    .filter((d) => HOT_FAMILIES.includes(d.familyId))
    .reduce((s, d) => s + d.activeInfluence, 0);
  const hotFamilyShare = totalActive > 0 ? hotFamilyActive / totalActive : 0;

  if (
    hotFamilyActive > 0 &&
    hotFamilyShare > BIAS_MONITOR_THRESHOLDS.hotFamilyConcentrationMax
  ) {
    alerts.push({
      severity: "info",
      category: "hot_family_concentration",
      message: `Hot families (CB, EG, PC, CS) concentran ${(hotFamilyShare * 100).toFixed(0)}% de la influencia activa. Monitorear — no es alerta fuerte por sí sola.`,
      affectedFamilies: HOT_FAMILIES,
    });
  }

  // --- Vocabulary concentration ---
  for (const v of vocabulary) {
    if (
      v.isSingleFamilyDominant &&
      v.occurrences >= BIAS_MONITOR_THRESHOLDS.vocabularyConcentrationMinOccurrences
    ) {
      alerts.push({
        severity: "info",
        category: "vocabulary_concentration",
        message: `Token "${v.token}" aparece ${v.occurrences} veces y siempre empuja a ${v.familiesPushed[0]}. Posible sesgo léxico si ese token es genérico.`,
        affectedFamilies: v.familiesPushed,
      });
    }
  }

  // --- Language contamination ---
  if (contamination.length > 0) {
    alerts.push({
      severity: "critical",
      category: "language_contamination",
      message: `${contamination.length} caso(s) marcados como influyentes contienen lenguaje de laboratorio en campos de voz humana (inputText / keyHumanLanguage). Revisar: ${contamination.map((c) => c.caseId).join(", ")}`,
      affectedFamilies: contamination.map((c) => c.expectedPrimaryFamily),
    });
  }

  return { alerts, hotFamilyShare: hotFamilyShare > 0 ? hotFamilyShare : null };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function runBiasMonitor(): BiasMonitorReport {
  const cases = LEARNED_DIAGNOSTIC_CASES;
  const distribution = buildFamilyDistribution(cases);
  const vocabulary = buildVocabularyConcentration(cases);
  const contamination = detectContamination(cases);
  const { alerts, hotFamilyShare } = detectAlerts(
    distribution,
    vocabulary,
    contamination,
    cases,
  );

  return {
    totalCases: cases.length,
    activeCases: cases.filter((c) => !isQuarantined(c)).length,
    quarantinedCases: cases.filter((c) => isQuarantined(c)).length,
    familyDistribution: distribution,
    vocabularyConcentration: vocabulary.slice(0, 20),
    contaminationFindings: contamination,
    alerts,
    hotFamilyShare,
    timestamp: new Date().toISOString(),
  };
}
