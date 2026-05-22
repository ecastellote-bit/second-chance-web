import { ACTIVACION_CARTELES, type ActivacionCartelId } from "../content/activacionCatalog";
import { PROFILE_FAMILY_MAP } from "../registries/profileFamilies";
import { HUMAN_AFFINITIES } from "../registries/humanAffinities";
import { buildEvidenceFragmentsFromIntake } from "./evidenceBuilder";
import type { ContextualSituationReview } from "./contextualSituationJudge";
import type { UserIntake } from "../types/intake";
import type { FinalReading, SummaryForUser } from "../types/result";
import type { ProfileFamilyId, ProfileFamilyScore } from "../types/profileFamilies";
import type {
  NarrativeCoherenceReview,
  NarrativeRiskFlag,
  NarrativeRiskFlagType,
} from "../types/narrativeCoherence";
import type { HumanAffinityScore } from "../types/humanAffinity";
import type { EvidenceFragment, EvidenceTemporalWeight } from "../types/evidence";
import type {
  AlertaLectura,
  CitaFundamentada,
  LecturaCentral,
  PersonalizedDiagnosticPresentation,
  ReferenciaQueResuena,
} from "../types/diagnosticPresentation";

type GuidedThemeTeaser = { shortLabel: string };

type ComposeParams = {
  reading: FinalReading;
  guidedThemes?: GuidedThemeTeaser[];
  intake?: UserIntake;
};

const ENGLISH_FAMILY_LABELS = Object.values(PROFILE_FAMILY_MAP).map((f) => f.label);

const AFFINITY_MAP = Object.fromEntries(
  HUMAN_AFFINITIES.map((a) => [a.id, a]),
) as Record<string, (typeof HUMAN_AFFINITIES)[number]>;

const TEMPORAL_MOMENT: Record<EvidenceTemporalWeight, string> = {
  childhood: "De tu origen",
  past: "De lo que fuiste dejando atrás",
  recent: "De tu trayectoria",
  current: "De lo que te pasa hoy",
};

const RISK_FLAG_COPY: Record<
  NarrativeRiskFlagType,
  (flag: NarrativeRiskFlag) => AlertaLectura
> = {
  lexical_trap: (flag) => ({
    titulo: "Cuidado con cerrar demasiado pronto",
    cuerpo:
      flag.description.trim() ||
      "Hay palabras en tu relato que pueden empujar hacia un camino que hoy no tenés espacio para transitar. La lectura abre, no encasilla.",
    severidad: flag.severity === "high" ? "alta" : "media",
  }),
  narrative_distortion: (flag) => ({
    titulo: "La historia pide otra lectura",
    cuerpo:
      flag.description.trim() ||
      "Lo que contaste no encaja del todo con un cierre automático del sistema. Conviene leer esto como frontera, no como sentencia.",
    severidad: flag.severity === "high" ? "alta" : "media",
  }),
  compressed_life_undetected: (flag) => ({
    titulo: "Compresión vital",
    cuerpo:
      flag.description.trim() ||
      "Parte de tu energía está en sostener lo inmediato. Eso no borra lo que llevás adentro, pero condiciona cómo se despliega ahora.",
    severidad: flag.severity === "high" ? "alta" : "media",
  }),
  false_rivalry: (flag) => ({
    titulo: "Dos caminos que parecen rivales",
    cuerpo:
      flag.description.trim() ||
      "Aparecen tensiones entre referencias que en tu caso conviven más que excluirse.",
    severidad: "media",
  }),
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function getExcludedFamilyIds(reading: FinalReading): Set<string> {
  const raw = reading as unknown as Record<string, unknown>;
  const discard =
    asRecord(raw.discardJudgeReview) ?? asRecord(raw.negativeEvidenceReview);
  const ids = discard?.excludedFamilyIds;
  if (!Array.isArray(ids)) return new Set();
  return new Set(
    ids.filter((id): id is string => typeof id === "string").map((id) => id.trim()),
  );
}

function stripEnglishLabels(text: string): string {
  let out = text.trim();
  if (!out) return out;
  for (const label of ENGLISH_FAMILY_LABELS) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`\\b${escaped}\\b`, "gi"), "").trim();
  }
  return out
    .replace(/\s*\/\s*/g, " — ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s—\-]+|[\s—\-]+$/g, "")
    .trim();
}

/** Voz única: vos/tu/te/tus en todo el entregable público. */
function humanizeToSecondPerson(text: string): string {
  let out = stripEnglishLabels(text.trim());
  if (!out) return out;

  out = out
    .replace(/^La historia de vida refleja\b/gi, "Tu historia refleja")
    .replace(/^La historia refleja\b/gi, "Tu historia refleja")
    .replace(
      /^La historia de (?:vida )?(?:del usuario|de la usuaria|del usuario\/a)\b/gi,
      "Tu historia",
    )
    .replace(/^La historia muestra (?:a )?una persona que\b/gi, "En tu historia aparece alguien que")
    .replace(/\bEn tu historia muestra\b/gi, "Tu historia muestra")
    .replace(/\bEl usuario\b/gi, "Vos")
    .replace(/\bLa usuaria\b/gi, "Vos")
    .replace(/\bEl\/la usuario\/a\b/gi, "Vos")
    .replace(/\bLa persona\b/gi, "Vos")
    .replace(/\bEl caso muestra\b/gi, "En tu historia se ve")
    .replace(/\bLa narrativa muestra\b/gi, "Tu relato muestra")
    .replace(/\bel sistema llega\b/gi, "llegamos en la lectura")
    .replace(/\bfamilia vocacional\b/gi, "lectura automática")
    .replace(/\bdel motor\b/gi, "")
    .replace(/\btop del motor\b/gi, "")
    .replace(/\bno le permite\b/gi, "no te deja")
    .replace(/\bno le deja\b/gi, "no te deja")
    .replace(/\bpara su familia\b/gi, "para tu familia")
    .replace(/\baunque anhela\b/gi, "aunque anhelás")
    .replace(/\blo que hace en su trabajo\b/gi, "lo que hacés en tu trabajo")
    .replace(/\blo que hace en su\b/gi, "lo que hacés en tu")
    .replace(/\bha priorizado\b/gi, "priorizaste")
    .replace(/\bha experimentado\b/gi, "experimentaste")
    .replace(/\bha renunciado\b/gi, "renunciaste")
    .replace(/\bha mostrado\b/gi, "mostraste")
    .replace(/\bha tenido\b/gi, "tuviste")
    .replace(/\btu vida, ha\b/gi, "en tu vida, vos")
    .replace(/\babandonó sus\b/gi, "abandonaste tus")
    .replace(/\babandonó su\b/gi, "abandonaste tu")
    .replace(/\babandonó\b/gi, "abandonaste")
    .replace(/\banhela\b/gi, "anhelás")
    .replace(/\bsiente que\b/gi, "sentís que")
    .replace(/\bsiente\b/gi, "sentís")
    .replace(/\bpriorizó\b/gi, "priorizaste")
    .replace(/\brenunció\b/gi, "renunciaste")
    .replace(/\bno encontrar su\b/gi, "no encontrar tu")
    .replace(/\bno encontrar sus\b/gi, "no encontrar tus")
    .replace(/\bsu rol actual\b/gi, "tu rol actual")
    .replace(/\bsu rol\b/gi, "tu rol")
    .replace(/\bsu vocación\b/gi, "tu vocación")
    .replace(/\bsu creatividad\b/gi, "tu creatividad")
    .replace(/\bsu situación\b/gi, "tu situación")
    .replace(/\bsu familia\b/gi, "tu familia")
    .replace(/\bsu vida\b/gi, "tu vida")
    .replace(/\bsu esencia\b/gi, "tu esencia")
    .replace(/\bsu camino\b/gi, "tu camino")
    .replace(/\bsu interés\b/gi, "tu interés")
    .replace(/\bsus pasiones\b/gi, "tus pasiones")
    .replace(/\bsus conexiones\b/gi, "tus conexiones")
    .replace(/\bsus intereses\b/gi, "tus intereses")
    .replace(/\bsus anhelos\b/gi, "tus anhelos")
    .replace(/\bsus sueños\b/gi, "tus sueños")
    .replace(/\bsus limitaciones\b/gi, "tus limitaciones")
    .replace(/\bsus renuncias\b/gi, "tus renuncias")
    .replace(/\bsu\b/gi, "tu")
    .replace(/\bsus\b/gi, "tus")
    .replace(/\bhay un anhelo\b/gi, "llevás un anhelo")
    .replace(/\blo que sugiere\b/gi, "lo que eso abre para vos");

  return out.replace(/\s{2,}/g, " ").replace(/\s+([,.])/g, "$1").trim();
}

function excerptAtSentence(text: string, maxLen = 300): string {
  const clean = text.trim();
  if (clean.length <= maxLen) return clean;

  const sentences = clean.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 8);
  let acc = "";
  for (const sentence of sentences) {
    const next = acc ? `${acc} ${sentence}` : sentence;
    if (next.length > maxLen) break;
    acc = next;
  }
  if (acc.length >= 40) return acc;

  const cut = clean.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return lastSpace > 60 ? `${cut.slice(0, lastSpace).trim()}…` : `${cut.trim()}…`;
}

function normalizeForDedup(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .slice(0, 120);
}

function textsOverlap(a: string, b: string): boolean {
  const na = normalizeForDedup(a);
  const nb = normalizeForDedup(b);
  if (!na || !nb) return false;
  if (na.includes(nb) || nb.includes(na)) return true;
  const wordsA = new Set(na.split(" ").filter((w) => w.length > 4));
  let shared = 0;
  for (const w of nb.split(" ")) {
    if (w.length > 4 && wordsA.has(w)) shared++;
  }
  return shared >= 4;
}

function formatTensionViva(coreTension: string): string {
  const cleaned = humanizeToSecondPerson(coreTension);
  if (!cleaned) return "";

  const parts = cleaned
    .split(/\s+(?:vs\.?|versus|frente a|contra)\s+/i)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return parts
      .map((p, i) => {
        const clause = humanizeToSecondPerson(p);
        return i === 0 ? clause : `frente a ${clause}`;
      })
      .join(" — ");
  }

  return cleaned;
}

function pickRevelationSentence(params: {
  narrative: NarrativeCoherenceReview | null;
  reading: FinalReading;
}): string {
  const { narrative, reading } = params;

  if (narrative?.reason?.trim()) {
    const reason = humanizeToSecondPerson(narrative.reason);
    const sentences = reason
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 40)
      .filter((s) => !/^la historia\b/i.test(s) && !/^en tu historia aparece\b/i.test(s))
      .filter((s) => !/\b(motor|familia vocacional|top del)\b/i.test(s))
      .filter((s) => !/\s(de|a|en|con|para)$/i.test(s.trim()))
      .filter((s) => (s.match(/,/g) ?? []).length <= 2);

    const candidate =
      sentences.find(
        (s) =>
          /\b(vos|tu|te|tus|mostraste|priorizaste|sentís)\b/i.test(s) &&
          s.length >= 50 &&
          s.length <= 240,
      ) ??
      sentences.find((s) => s.length >= 60 && s.length <= 220) ??
      sentences[sentences.length - 1] ??
      sentences[0];

    if (candidate) {
      const line = humanizeToSecondPerson(candidate.trim());
      return line.endsWith(".") ? line : `${line}.`;
    }
  }

  if (narrative?.coreTension?.trim()) {
    const tension = formatTensionViva(narrative.coreTension);
    return `Lo que tu historia sostiene en silencio hace años: ${tension}.`;
  }

  if (narrative?.narrativeSummary?.trim()) {
    return firstStrongSentence(humanizeToSecondPerson(narrative.narrativeSummary), 200);
  }

  return (
    humanizeToSecondPerson(reading.dominantTension?.trim()) ||
    "Hay una lectura posible de tu historia que todavía no pudiste decir con tus propias palabras."
  );
}

function firstStrongSentence(text: string, maxLen: number): string {
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 25);
  const pick = sentences[0] ?? text;
  const line = pick.trim();
  if (line.length <= maxLen) return line.endsWith(".") ? line : `${line}.`;
  return `${line.slice(0, maxLen - 1).trim()}…`;
}

function firstSentenceShort(text: string, maxLen = 64): string {
  const cleaned = humanizeToSecondPerson(text);
  const match = cleaned.match(/^[^.!?]+[.!?]?/);
  const sentence = (match?.[0] ?? cleaned).trim();
  if (sentence.length <= maxLen) return sentence;
  return `${sentence.slice(0, maxLen - 1).trim()}…`;
}

function getContextualReview(reading: FinalReading): ContextualSituationReview | null {
  const raw = reading as unknown as Record<string, unknown>;
  const candidate =
    raw.contextualSituationReview ??
    raw.contextualReview ??
    raw.contextualSituationJudge;
  if (!candidate || typeof candidate !== "object") return null;
  return candidate as ContextualSituationReview;
}

function getNarrativeReview(reading: FinalReading): NarrativeCoherenceReview | null {
  const review = reading.narrativeCoherenceReview;
  if (!review || typeof review !== "object") return null;
  return review;
}

function resolveEvidenceFragments(reading: FinalReading, intake?: UserIntake): EvidenceFragment[] {
  if (Array.isArray(reading.evidence) && reading.evidence.length > 0) {
    return reading.evidence;
  }
  if (intake) return buildEvidenceFragmentsFromIntake(intake);
  return [];
}

function buildLecturaCentral(params: {
  narrative: NarrativeCoherenceReview | null;
  reading: FinalReading;
  sources: string[];
}): LecturaCentral {
  const { narrative, reading, sources } = params;

  if (narrative) {
    sources.push("narrative_coherence_spine");
    return {
      sentenciaRevelacion: pickRevelationSentence({ narrative, reading }),
      resumen: humanizeToSecondPerson(
        narrative.narrativeSummary?.trim() ||
          reading.summaryForUser?.diagnostico?.trim() ||
          "",
      ),
      tensionViva: formatTensionViva(
        narrative.coreTension?.trim() || reading.dominantTension?.trim() || "",
      ),
      porQue: humanizeToSecondPerson(
        narrative.reason?.trim() ||
          "Cruzamos tu relato con varias capas para abrir una lectura honesta, no para etiquetarte.",
      ),
    };
  }

  sources.push("fallback_spine");
  return {
    sentenciaRevelacion: pickRevelationSentence({ narrative: null, reading }),
    resumen: humanizeToSecondPerson(reading.summaryForUser?.diagnostico?.trim() || ""),
    tensionViva: formatTensionViva(reading.dominantTension?.trim() || ""),
    porQue:
      humanizeToSecondPerson(reading.summaryForUser?.hilo_conductor?.trim() || "") ||
      "Aún sin auditoría narrativa completa, tu relato permite una lectura provisional.",
  };
}

function buildAlertasLectura(
  narrative: NarrativeCoherenceReview | null,
  reading: FinalReading,
  sources: string[],
): AlertaLectura[] {
  const alertas: AlertaLectura[] = [];

  for (const flag of narrative?.riskFlags ?? []) {
    const builder = RISK_FLAG_COPY[flag.type];
    if (builder) alertas.push(builder(flag));
  }
  if ((narrative?.riskFlags?.length ?? 0) > 0) sources.push("narrative_risk_flags");

  if (narrative?.compressionConcern === "high" || narrative?.compressionConcern === "moderate") {
    alertas.push({
      titulo: "Compresión vital",
      cuerpo:
        "Tu relato muestra que gran parte de lo que llevás adentro no está desplegado en el presente. La lectura no lo niega: lo nombra.",
      severidad: narrative.compressionConcern === "high" ? "alta" : "media",
    });
    sources.push("narrative_compression");
  }

  if (narrative?.closureRisk === "too_closed") {
    alertas.push({
      titulo: "No cerrar en una sola etiqueta",
      cuerpo: "El sistema detectó riesgo de cierre demasiado fuerte. Por eso esta lectura se queda en frontera abierta.",
      severidad: "media",
    });
  }

  if (reading.resultType === "compressed_life") {
    alertas.push({
      titulo: "El presente pesa",
      cuerpo:
        humanizeToSecondPerson(reading.currentCost?.trim() || "") ||
        "Hoy sostenés mucho a la vez. Eso condiciona el ritmo de cualquier movimiento.",
      severidad: "alta",
    });
  }

  return alertas.slice(0, 4);
}

function scoreEvidenceFragment(fragment: EvidenceFragment): number {
  const intensity = fragment.intensity ?? 1;
  const temporalBoost =
    fragment.temporalWeight === "current"
      ? 5
      : fragment.temporalWeight === "past"
        ? 4
        : fragment.temporalWeight === "childhood"
          ? 3
          : 1;
  return (
    intensity * 2 +
    temporalBoost +
    (fragment.sacrificedFor ? 5 : 0) +
    (fragment.externalRecognition ? 2 : 0) +
    (fragment.valence === "negative" ? 2 : 0)
  );
}

function fragmentFundamento(fragment: EvidenceFragment): string {
  if (fragment.sacrificedFor) {
    return "Fundamenta la lectura en algo que dejaste de lado y sigue reclamando lugar.";
  }
  if (fragment.externalRecognition) {
    return "Otros ya lo vieron en vos; no es un deseo aislado.";
  }
  if (fragment.temporalWeight === "current") {
    return "Ancla la lectura en lo que te pasa hoy, no solo en el pasado.";
  }
  return "Es una pieza concreta de tu relato que el sistema no inventó.";
}

function buildEnTusPalabras(params: {
  narrative: NarrativeCoherenceReview | null;
  fragments: EvidenceFragment[];
  sources: string[];
}): CitaFundamentada[] {
  const citas: CitaFundamentada[] = [];
  const used = new Set<string>();

  for (const line of params.narrative?.evidence ?? []) {
    const texto = line.trim();
    if (texto.length < 12) continue;
    const key = normalizeForDedup(texto);
    if (used.has(key)) continue;
    used.add(key);
    citas.push({
      texto: excerptAtSentence(texto, 280),
      fuente: "narrativo",
      fundamento:
        "El juez de coherencia narrativa la tomó como prueba directa de tu historia.",
    });
    if (citas.length >= 4) break;
  }
  if (citas.length > 0) params.sources.push("narrative_evidence");

  const ranked = [...params.fragments].sort(
    (a, b) => scoreEvidenceFragment(b) - scoreEvidenceFragment(a),
  );

  for (const fragment of ranked) {
    if (citas.length >= 7) break;
    const texto = fragment.text.trim().slice(0, 280);
    if (texto.length < 20) continue;
    const key = normalizeForDedup(texto);
    if (used.has(key)) continue;
    if (citas.some((c) => textsOverlap(c.texto, texto))) continue;
    used.add(key);
    citas.push({
      texto: excerptAtSentence(texto, 320),
      fuente: "intake",
      momento: TEMPORAL_MOMENT[fragment.temporalWeight ?? "recent"],
      fundamento: humanizeToSecondPerson(fragmentFundamento(fragment)),
    });
  }
  if (citas.some((c) => c.fuente === "intake")) params.sources.push("evidence_fragments");

  return citas;
}

function normalizeFamilyScores(reading: FinalReading): ProfileFamilyScore[] {
  const excluded = getExcludedFamilyIds(reading);
  const raw = reading.familyScores;
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as ProfileFamilyScore & { familyId?: string };
      const id = (row.id ?? row.familyId) as ProfileFamilyId | undefined;
      if (!id || excluded.has(id)) return null;
      const def = PROFILE_FAMILY_MAP[id];
      if (!def) return null;
      return {
        ...row,
        id,
        summary: row.summary?.trim() || def.summary,
        score: typeof row.score === "number" ? row.score : 0,
        rationale: Array.isArray(row.rationale) ? row.rationale : [],
      } satisfies ProfileFamilyScore;
    })
    .filter((row): row is ProfileFamilyScore => row !== null)
    .sort((a, b) => b.score - a.score);
}

function resonanceForScore(score: number, topScore: number): ReferenciaQueResuena["resonance"] {
  if (topScore <= 0) return "exploratoria";
  const ratio = score / topScore;
  if (ratio >= 0.85) return "alta";
  if (ratio >= 0.6) return "media";
  return "exploratoria";
}

function fragmentMatchesFamily(fragment: EvidenceFragment, familyId: ProfileFamilyId): boolean {
  const family = PROFILE_FAMILY_MAP[familyId];
  if (!family) return false;
  const text = fragment.text.toLowerCase();
  for (const affinityId of [...family.coreAffinities, ...family.supportingAffinities]) {
    const hints = AFFINITY_MAP[affinityId]?.detectionHints ?? [];
    if (hints.some((h) => text.includes(h.toLowerCase()))) return true;
  }
  return false;
}

function buildReferencias(
  families: ProfileFamilyScore[],
  fragments: EvidenceFragment[],
  citas: CitaFundamentada[],
  narrative: NarrativeCoherenceReview | null,
): ReferenciaQueResuena[] {
  if (families.length === 0) return [];

  const topScore = families[0]?.score ?? 0;
  let count = Math.min(3, families.filter((f) => f.score >= 0.05).length);
  const candidates = families.filter((f) => f.score >= 0.05);
  if (count >= 3 && candidates[2] && candidates[1]) {
    if (candidates[2].score < candidates[1].score * 0.65) count = 2;
  }

  const tensionSnippet = narrative?.coreTension
    ? firstSentenceShort(formatTensionViva(narrative.coreTension), 90)
    : "";

  return candidates.slice(0, count).map((family, index) => {
    const linked: CitaFundamentada[] = [];
    for (const c of citas) {
      if (linked.length >= 2) break;
      const frag = fragments.find(
        (f) =>
          c.fuente === "intake" &&
          (textsOverlap(f.text, c.texto) || fragmentMatchesFamily(f, family.id)),
      );
      if (c.fuente === "narrativo" || frag) linked.push(c);
    }

    const puente = linked[0]
      ? `En tu relato, esto se ve cuando decís: «${excerptAtSentence(linked[0].texto, 100)}»`
      : index === 0 && tensionSnippet
        ? `Conecta con la tensión central de tu lectura: ${tensionSnippet}`
        : `Resuena con un modo tuyo de aportar: ${firstSentenceShort(family.summary, 90)}`;

    return {
      familyId: family.id,
      referenceTitle: firstSentenceShort(family.summary, 72),
      referenceBody: family.summary,
      resonance: resonanceForScore(family.score, topScore),
      puenteNarrativo: puente,
      evidenciasVinculadas: linked.length > 0 ? linked : undefined,
    };
  });
}

function buildMomentoVital(params: {
  narrative: NarrativeCoherenceReview | null;
  contextual: ContextualSituationReview | null;
  reading: FinalReading;
  sources: string[];
}): string {
  const parts: string[] = [];

  if (params.narrative?.sostenActual?.trim()) {
    parts.push(humanizeToSecondPerson(params.narrative.sostenActual.trim()));
    params.sources.push("narrative_sosten");
  }

  for (const force of (params.contextual?.forces ?? [])
    .slice()
    .sort((a, b) => (b.strength ?? 0) - (a.strength ?? 0))
    .slice(0, 2)) {
    const line = humanizeToSecondPerson(force.interpretation?.trim() ?? "");
    if (line) parts.push(line);
  }
  if ((params.contextual?.forces?.length ?? 0) > 0) params.sources.push("contextual_forces");

  const frame = params.contextual?.situationFrame?.trim();
  if (frame) parts.push(humanizeToSecondPerson(frame));

  const caution = params.contextual?.cautions?.[0]?.trim();
  if (caution) parts.push(humanizeToSecondPerson(caution));

  if (parts.length === 0) {
    return humanizeToSecondPerson(
      params.reading.summaryForUser?.tensiones?.trim() ||
        "Tu momento actual pesa en cómo se despliega lo que llevás adentro.",
    );
  }

  return parts.slice(0, 4).join(" ");
}

function buildComoArmamosTuLectura(params: {
  narrative: NarrativeCoherenceReview | null;
  contextual: ContextualSituationReview | null;
  hasFragments: boolean;
  hasSimilar: boolean;
  sources: string[];
}): string {
  const pieces: string[] = [];

  if (params.narrative) {
    pieces.push(
      "partimos de una auditoría de coherencia narrativa — la columna que integra tu historia",
    );
    params.sources.push("layer_narrative");
  }
  if (params.hasFragments) {
    pieces.push("cruzamos fragmentos de evidencia extraídos de lo que escribiste");
    params.sources.push("layer_evidence");
  }
  if (params.contextual) {
    pieces.push("leímos tu momento vital con el juez situacional");
    params.sources.push("layer_contextual");
  }
  pieces.push("afinidades y patrones en casos parecidos");
  if (params.hasSimilar) pieces.push("memoria de casos similares");

  if (pieces.length === 0) {
    return "Armamos esta lectura cruzando tu relato con varias capas del sistema, sin una sola etiqueta como respuesta.";
  }

  const joined =
    pieces.length === 1
      ? pieces[0]
      : `${pieces.slice(0, -1).join(", ")} y ${pieces[pieces.length - 1]}`;

  return `Para revelar esta sentencia, ${joined}. Cada tramo del entregable está fundamentado en esa cadena — no en un puntaje suelto.`;
}

function buildLoQueNoCerramos(params: {
  reading: FinalReading;
  narrative: NarrativeCoherenceReview | null;
  contextual: ContextualSituationReview | null;
  referencias: ReferenciaQueResuena[];
}): string {
  if (params.reading.resultType === "insufficient_evidence") {
    return "Todavía no alcanza el material para una lectura con confianza. Con más contexto, el mapa puede afinarse.";
  }

  const parts: string[] = [];

  if (
    params.narrative?.verdict === "frontier" ||
    params.narrative?.verdict === "narrative_mismatch" ||
    params.referencias.length >= 2
  ) {
    parts.push(
      "No cerramos en un solo nombre: tu historia abre más de un camino y merece ser leída en esa franqueza.",
    );
  }

  if (params.contextual?.verdict === "context_suggests_frontier") {
    parts.push("Tu situación vital pide mantener la frontera abierta un tiempo más.");
  }

  if (params.narrative?.alternativeFamilies?.length) {
    const alt = params.narrative.alternativeFamilies[0];
    if (alt?.reason) {
      parts.push(humanizeToSecondPerson(alt.reason));
    }
  }

  if (parts.length === 0) {
    return "Esto no es un veredicto final: es una sentencia para empezar a moverte con más verdad.";
  }

  return parts.join(" ");
}

const ACTIVATION_PATH_TO_CARTEL: Record<string, ActivacionCartelId> = {
  explorar_primero_la_comunidad: "explorar_comunidad",
  armar_mi_propio_proyecto: "presentar_proyecto",
  asociarme_con_otras_personas: "asociarme",
  integrar_proyectos_existentes: "asociarme",
  formarme_en_algo_nuevo: "explorar_comunidad",
};

function buildSiguientePaso(params: {
  contextual: ContextualSituationReview | null;
  guidedThemes?: GuidedThemeTeaser[];
  lectura: LecturaCentral;
}): PersonalizedDiagnosticPresentation["siguientePaso"] {
  const themeTeaser = (params.guidedThemes ?? [])
    .map((t) => t.shortLabel?.trim())
    .filter(Boolean)
    .slice(0, 3);

  const invitation =
    themeTeaser.length > 0
      ? `Esta lectura no termina en un PDF: el siguiente paso es elegir una temática y entrar al barrio con un primer movimiento que honre lo que acaba de salir a la luz.`
      : "Cuando quieras, elegí una temática y cómo entrar al barrio.";

  const hints = params.contextual?.activationHints ?? [];
  const sorted = [...hints].sort((a, b) => {
    const s = (f: string) => (f === "high" ? 2 : f === "medium" ? 1 : 0);
    return s(b.fit) - s(a.fit);
  });

  let activacionSugerida: PersonalizedDiagnosticPresentation["siguientePaso"]["activacionSugerida"];
  for (const hint of sorted) {
    const cartelId = ACTIVATION_PATH_TO_CARTEL[hint.path];
    const cartel = ACTIVACION_CARTELES.find((c) => c.id === cartelId);
    if (cartel) {
      activacionSugerida = {
        cartelId,
        label: cartel.label,
        plazaWelcomeLine: cartel.plazaWelcome,
      };
      break;
    }
  }
  if (!activacionSugerida) {
    const explore = ACTIVACION_CARTELES.find((c) => c.id === "explorar_comunidad")!;
    activacionSugerida = {
      cartelId: "explorar_comunidad",
      label: explore.label,
      plazaWelcomeLine: explore.plazaWelcome,
    };
  }

  return { invitation, themeTeaser, activacionSugerida };
}

export function summaryForUserFromPresentation(
  presentation: PersonalizedDiagnosticPresentation,
  previous?: SummaryForUser,
): SummaryForUser {
  const { lecturaCentral, referenciasQueResuenan } = presentation;

  return {
    diagnostico: lecturaCentral.resumen,
    hilo_conductor: [lecturaCentral.sentenciaRevelacion, lecturaCentral.porQue]
      .filter(Boolean)
      .join(" ")
      .slice(0, 800),
    tensiones: lecturaCentral.tensionViva,
    direccion:
      referenciasQueResuenan.length > 0
        ? referenciasQueResuenan.map((r) => r.referenceBody).join(" ").slice(0, 600)
        : previous?.direccion ?? "",
    action: presentation.siguientePaso.invitation,
    camino_minimo:
      presentation.siguientePaso.themeTeaser.join(" · ") || previous?.camino_minimo || "",
    cierre: presentation.loQueNoCerramos,
  };
}

export function composePersonalizedDiagnosticPresentation(
  params: ComposeParams,
): PersonalizedDiagnosticPresentation {
  const { reading, guidedThemes, intake } = params;
  const sourcesUsed: string[] = [];

  const narrative = getNarrativeReview(reading);
  const contextual = getContextualReview(reading);
  const fragments = resolveEvidenceFragments(reading, intake);

  const lecturaCentral = buildLecturaCentral({ narrative, reading, sources: sourcesUsed });
  const enTusPalabras = buildEnTusPalabras({ narrative, fragments, sources: sourcesUsed });
  const alertasLectura = buildAlertasLectura(narrative, reading, sourcesUsed);
  const families = normalizeFamilyScores(reading);
  const referenciasQueResuenan = buildReferencias(
    families,
    fragments,
    enTusPalabras,
    narrative,
  );
  sourcesUsed.push("family_registry_summaries");

  const momentoVital = buildMomentoVital({ narrative, contextual, reading, sources: sourcesUsed });

  const raw = reading as unknown as Record<string, unknown>;
  const hasSimilar = Array.isArray(raw.similarCases) && raw.similarCases.length > 0;

  const comoArmamosTuLectura = buildComoArmamosTuLectura({
    narrative,
    contextual,
    hasFragments: fragments.length > 0,
    hasSimilar,
    sources: sourcesUsed,
  });

  const loQueNoCerramos = buildLoQueNoCerramos({
    reading,
    narrative,
    contextual,
    referencias: referenciasQueResuenan,
  });

  const siguientePaso = buildSiguientePaso({
    contextual,
    guidedThemes,
    lectura: lecturaCentral,
  });

  return {
    lecturaCentral,
    enTusPalabras,
    alertasLectura,
    momentoVital,
    referenciasQueResuenan,
    comoArmamosTuLectura,
    loQueNoCerramos,
    siguientePaso,
    meta: {
      composedAt: new Date().toISOString(),
      sourcesUsed: Array.from(new Set(sourcesUsed)),
      narrativeVerdict: narrative?.verdict,
      evidenceCount: fragments.length,
      citasCount: enTusPalabras.length,
    },
  };
}

export function applyPersonalizedPresentationToReading(params: {
  reading: FinalReading;
  guidedThemes?: GuidedThemeTeaser[];
  intake?: UserIntake;
}): FinalReading {
  const presentation = composePersonalizedDiagnosticPresentation(params);
  return {
    ...params.reading,
    personalizedPresentation: presentation,
    summaryForUser: summaryForUserFromPresentation(
      presentation,
      params.reading.summaryForUser,
    ),
  };
}

export function containsEnglishFamilyLabel(text: string): boolean {
  const normalized = text.toLowerCase();
  return ENGLISH_FAMILY_LABELS.some((label) =>
    normalized.includes(label.toLowerCase()),
  );
}

export function containsClinicalThirdPerson(text: string): boolean {
  const normalized = text.toLowerCase();
  return (
    normalized.includes("el usuario") ||
    normalized.includes("la usuaria") ||
    normalized.includes("la historia de vida muestra una persona") ||
    normalized.includes("el caso muestra") ||
    normalized.includes("en tu historia muestra") ||
    /\b(abandonó|anhela|priorizó)\b/.test(normalized) ||
    /\bsu vocación\b/.test(normalized) ||
    /\bha mostrado\b/.test(normalized) ||
    /\bel caso muestra\b/.test(normalized)
  );
}

export function publicPresentationText(
  presentation: PersonalizedDiagnosticPresentation,
): string {
  const lc = presentation.lecturaCentral;
  return [
    lc.sentenciaRevelacion,
    lc.resumen,
    lc.tensionViva,
    lc.porQue,
    ...presentation.enTusPalabras.map((c) => `${c.texto} ${c.fundamento}`),
    ...presentation.alertasLectura.map((a) => `${a.titulo} ${a.cuerpo}`),
    presentation.momentoVital,
    presentation.comoArmamosTuLectura,
    presentation.loQueNoCerramos,
    ...presentation.referenciasQueResuenan.map((r) => `${r.referenceTitle} ${r.puenteNarrativo}`),
    presentation.siguientePaso.invitation,
    ...presentation.siguientePaso.themeTeaser,
  ].join(" ");
}
