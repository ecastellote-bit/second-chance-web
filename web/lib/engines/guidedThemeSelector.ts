import type { GuidedTheme, GuidedThemeLayer } from "@/lib/types/guidedThemes";
import { guidedThemesMvpV02 } from "@/lib/registries/guidedThemesMvpV02";

type AnyRecord = Record<string, unknown>;

export type GuidedThemeSuggestion = {
  theme: GuidedTheme;
  score: number;
  reasons: string[];
  matchedFamilies: string[];
  matchedAffinities: string[];
};

function asRecord(value: unknown): AnyRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as AnyRecord;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function normalizeId(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const cleaned = value.trim();
  if (!cleaned) return null;

  return cleaned
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

/**
 * Canonical keys for matching theme linkedFamilies / affinities to diagnostic surfaces.
 * Handles English labels ("Public Communicator"), snake_case, and minor punctuation variants.
 */
function canonicalMatchKeys(value: unknown): string[] {
  const n = normalizeId(value);
  if (!n) return [];
  const keys = new Set<string>([n]);
  keys.add(n.replace(/_/g, ""));
  return Array.from(keys).filter(Boolean);
}

const NORM_LEX = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const THEMES_REQUIRING_EXPLICIT_IDEA_OR_SYSTEM = new Set<string>([
  "llevar_una_idea_propia_a_algo_real",
  "entender_sistemas_y_mejorarlos",
  "pedir_apoyo_para_una_idea_propia",
]);

const IDEA_OR_SYSTEM_LEXICAL = [
  "idea propia",
  "mi proyecto",
  "proyecto propio",
  "presentar una idea",
  "buscar colaboradores",
  "mejorar el sistema",
  "mejorar un sistema",
  "diseno de sistema",
  "diseño de sistema",
  "construir algo",
  "iniciativa propia",
  "proceso estructurado",
  "estructura del proceso",
].map(NORM_LEX);

const COLLECTIVE_THEME_LEXICAL = [
  "comunidad",
  "grupos",
  "redes",
  "convocar",
  "pertenencia",
  "espacio compartido",
  "continuidad colectiva",
  "juntar gente",
  "armar grupos",
  "sostener el hilo",
  "participacion",
  "trabajos grupales",
].map(NORM_LEX);

const STRAIN_VITAL_LEXICAL = [
  "estoy seco",
  "bastante seco",
  "no me queda resto",
  "ahogado",
  "sin fuerza",
  "aparece poco",
  "sequedad",
  "cansancio",
  "comprimido",
  "sin margen",
  "impulso comunitario",
].map(NORM_LEX);

const ONE_TO_ONE_THEME_LEXICAL = [
  "uno a uno",
  "escuchar a una persona",
  "acompañamiento uno a uno",
  "acompanamiento uno a uno",
  "contencion individual",
  "contención individual",
  "proceso personal",
  "acompañar a alguien",
  "acompanar a alguien",
].map(NORM_LEX);

const COMMUNITY_COMPRESSION_PRIORITY_IDS = new Set<string>([
  "sostener_comunidad_sin_secarme_compresion_activacion",
  "reactivar_red_comunitaria_con_limites_compresion_activacion",
]);

function countLexicalHits(blob: string, phrases: string[]): number {
  let hits = 0;
  for (const p of phrases) {
    if (p && blob.includes(p)) hits += 1;
  }
  return hits;
}

function addCanonicalKeysFromValue(value: unknown, bucket: Set<string>) {
  if (!value) return;

  if (typeof value === "string") {
    for (const key of canonicalMatchKeys(value)) {
      bucket.add(key);
    }
    for (const part of splitAndNormalize(value)) {
      bucket.add(part);
      bucket.add(part.replace(/_/g, ""));
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) addCanonicalKeysFromValue(item, bucket);
    return;
  }

  const record = asRecord(value);
  if (!record) return;

  for (const key of canonicalMatchKeys(record["label"] ?? record["id"])) {
    bucket.add(key);
  }

  for (const field of [
    "id",
    "familyId",
    "profileId",
    "label",
    "family",
    "profile",
    "key",
    "affinityId",
    "affinity",
    "name",
  ]) {
    addCanonicalKeysFromValue(record[field], bucket);
  }
}

function splitAndNormalize(value: unknown): string[] {
  if (typeof value !== "string") {
    const normalized = normalizeId(value);
    return normalized ? [normalized] : [];
  }

  return value
    .split(/[\/,|]+/)
    .map((part) => normalizeId(part))
    .filter((part): part is string => Boolean(part));
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function collectMatchKeysFromValue(value: unknown, bucket: Set<string>) {
  addCanonicalKeysFromValue(value, bucket);
}

function collectFamilyIds(context: unknown): string[] {
  const root = asRecord(context);
  if (!root) return [];

  const bucket = new Set<string>();

  const directFamilyFields = [
    "corePattern",
    "topProfileLabel",
    "secondProfileLabel",
    "topFamilyLabel",
    "secondFamilyLabel",
    "topId",
    "secondId",
  ];

  for (const field of directFamilyFields) {
    collectMatchKeysFromValue(root[field], bucket);
  }

  const nestedObjects = [
    root["finalDiagnostic"],
    root["diagnostic"],
    root["trace"],
    root["decisionTrace"],
    root["familyRace"],
    root["contextualReview"],
    root["result"],
  ];

  for (const nested of nestedObjects) {
    const record = asRecord(nested);
    if (!record) continue;

    for (const field of directFamilyFields) {
      collectMatchKeysFromValue(record[field], bucket);
    }

    collectMatchKeysFromValue(record["topFamily"], bucket);
    collectMatchKeysFromValue(record["secondFamily"], bucket);
  }

  const fd = asRecord(root["finalDiagnostic"]);
  const profileSnapshot = fd ? asRecord(fd["profileSnapshot"]) : null;
  if (profileSnapshot) {
    collectMatchKeysFromValue(profileSnapshot["id"], bucket);
    collectMatchKeysFromValue(profileSnapshot["label"], bucket);
  }

  const rankingArrays = [
    root["familyScores"],
    root["families"],
    root["profiles"],
    root["rankedFamilies"],
    root["candidates"],
    root["originalRanking"],
    root["shadowAdjustedRankingPreview"],
  ];

  for (const array of rankingArrays) {
    for (const item of asArray(array)) {
      collectMatchKeysFromValue(item, bucket);
    }
  }

  return unique(Array.from(bucket).filter(Boolean));
}

function collectAffinityIds(context: unknown): string[] {
  const root = asRecord(context);
  if (!root) return [];

  const bucket = new Set<string>();

  const affinityContainers = [
    root["affinityScores"],
    root["topAffinities"],
    root["buriedCapacities"],
    root["affinities"],
    root["humanAffinities"],
    root["humanAffinitiesBridge"],
    root["affinityBridge"],
  ];

  for (const container of affinityContainers) {
    collectMatchKeysFromValue(container, bucket);

    const record = asRecord(container);
    if (!record) continue;

    collectMatchKeysFromValue(record["affinityScores"], bucket);
    collectMatchKeysFromValue(record["topAffinities"], bucket);
    collectMatchKeysFromValue(record["buriedCapacities"], bucket);
    collectMatchKeysFromValue(record["latentAffinities"], bucket);
    collectMatchKeysFromValue(record["dominantAffinities"], bucket);
  }

  const familyScores = asArray(root["familyScores"]);
  for (const family of familyScores) {
    const record = asRecord(family);
    if (!record) continue;

    collectMatchKeysFromValue(record["matchedCoreAffinities"], bucket);
    collectMatchKeysFromValue(record["matchedSupportingAffinities"], bucket);
    collectMatchKeysFromValue(record["coreAffinities"], bucket);
    collectMatchKeysFromValue(record["supportingAffinities"], bucket);
    collectMatchKeysFromValue(record["tensionHits"], bucket);
  }

  return unique(Array.from(bucket).filter(Boolean));
}

function detectCompression(context: unknown): boolean {
  const text = JSON.stringify(context ?? {}).toLowerCase();

  return (
    text.includes("compressed_life") ||
    text.includes("hascompressionnarrative") ||
    text.includes("compression") ||
    text.includes("vida comprimida") ||
    text.includes("capacidad enterrada") ||
    text.includes("buried")
  );
}

function familyScoreValue(record: AnyRecord, key: string): number {
  const v = record[key];
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function sortedFamilyRecords(context: unknown): AnyRecord[] {
  const root = asRecord(context);
  if (!root) return [];

  const rows = asArray(root["familyScores"])
    .map((row) => asRecord(row))
    .filter((row): row is AnyRecord => !!row);

  return rows.sort(
    (a, b) => familyScoreValue(b, "score") - familyScoreValue(a, "score"),
  );
}

function topTwoFamilyIds(context: unknown): [string | null, string | null] {
  const sorted = sortedFamilyRecords(context);
  const id0 = sorted[0]
    ? normalizeId(sorted[0]["familyId"] ?? sorted[0]["id"] ?? sorted[0]["label"])
    : null;
  const id1 = sorted[1]
    ? normalizeId(sorted[1]["familyId"] ?? sorted[1]["id"] ?? sorted[1]["label"])
    : null;
  return [id0, id1];
}

function countBuriedOrLatentAffinities(context: unknown): number {
  const root = asRecord(context);
  if (!root) return 0;

  let n = 0;
  const scan = (list: unknown) => {
    for (const item of asArray(list)) {
      const rec = asRecord(item);
      const status = typeof rec?.status === "string" ? rec.status : "";
      if (status === "buried" || status === "latent") n++;
    }
  };

  scan(root["affinityScores"]);
  scan(root["topAffinities"]);
  scan(root["buriedCapacities"]);

  const bridge = asRecord(root["affinityBridge"]);
  if (bridge) {
    scan(bridge["affinityScores"]);
    scan(bridge["topAffinities"]);
    scan(bridge["buriedCapacities"]);
    scan(bridge["latentAffinities"]);
  }

  return n;
}

function countRestrictionsSignals(context: unknown): number {
  const root = asRecord(context);
  if (!root) return 0;

  const intake = asRecord(root["intake"]);
  const cc = intake ? asRecord(intake["currentContext"]) : null;
  const restrictions = cc ? asArray(cc["restrictions"]) : [];
  if (restrictions.length >= 3) return restrictions.length;

  const text = JSON.stringify(context ?? {}).toLowerCase();
  let hits = 0;
  if (text.includes("restriction")) hits++;
  if (text.includes("bloque")) hits++;
  if (text.includes("fragment")) hits++;
  return hits;
}

type SelectionContext = {
  resultType: string;
  diagnosticBlob: string;
  motherStrong: boolean;
  subfamilyRisk: boolean;
  compressionStrong: boolean;
  topFamilyConfidence: number;
  secondFamilyConfidence: number;
  topFamilyScore: number;
  secondFamilyScore: number;
  familyGap: number;
};

function analyzeSelectionContext(context: unknown): SelectionContext {
  const root = asRecord(context);
  const resultType =
    typeof root?.resultType === "string" ? root.resultType : "";

  const diagnosticBlob = JSON.stringify(context ?? {})
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const families = sortedFamilyRecords(context);
  const top = families[0] ?? null;
  const second = families[1] ?? null;

  const topFamilyScore = top ? familyScoreValue(top, "score") : 0;
  const secondFamilyScore = second ? familyScoreValue(second, "score") : 0;
  const topFamilyConfidence = top ? familyScoreValue(top, "confidence") : 0;
  const secondFamilyConfidence = second ? familyScoreValue(second, "confidence") : 0;
  const familyGap = topFamilyScore - secondFamilyScore;

  const secondClose =
    topFamilyScore > 0 &&
    secondFamilyScore >= 0.32 &&
    familyGap >= 0 &&
    familyGap < 0.14;

  const motherStrong =
    (resultType === "clear_direction" ||
      (topFamilyConfidence >= 0.55 && familyGap >= 0.08) ||
      (topFamilyScore >= 0.5 && familyGap >= 0.1)) &&
    !secondClose;

  const subfamilyRisk =
    resultType === "insufficient_evidence" ||
    diagnosticBlob.includes("second_profile_too_close") ||
    secondClose ||
    diagnosticBlob.includes("open_frontier_or_review") ||
    diagnosticBlob.includes("defensible_frontier") ||
    diagnosticBlob.includes("wouldopenfrontier") ||
    (topFamilyConfidence > 0 &&
      topFamilyConfidence < 0.55 &&
      !!second &&
      secondFamilyConfidence >= 0.42);

  const buriedLatent = countBuriedOrLatentAffinities(context);
  const restrictionsHeavy = countRestrictionsSignals(context) >= 2;

  const compressionStrong =
    resultType === "compressed_life" ||
    detectCompression(context) ||
    buriedLatent > 0 ||
    restrictionsHeavy;

  return {
    resultType,
    diagnosticBlob,
    motherStrong,
    subfamilyRisk,
    compressionStrong,
    topFamilyConfidence,
    secondFamilyConfidence,
    topFamilyScore,
    secondFamilyScore,
    familyGap,
  };
}

function ruleToComparableText(rule: unknown): string | null {
  if (typeof rule === "string") {
    const t = rule.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return t.length >= 8 ? t : null;
  }
  if (rule && typeof rule === "object") {
    const r = rule as AnyRecord;
    const s = r["text"] ?? r["signal"] ?? r["pattern"];
    if (typeof s === "string") {
      const t = s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return t.length >= 8 ? t : null;
    }
  }
  return null;
}

/**
 * Superficie reducida para avoidIfSignals: evita falsos positivos al no mezclar
 * narrativa completa, evidencias ni rationale con tokens de descarte.
 */
function buildAvoidCheckBlob(context: unknown): string {
  const root = asRecord(context);
  if (!root) return "";

  const parts: string[] = [];
  const push = (v: unknown) => {
    if (typeof v === "string" && v.trim()) parts.push(v.trim());
  };

  push(root["resultType"]);
  push(root["corePattern"]);
  push(root["dominantTension"]);

  const sfu = asRecord(root["summaryForUser"]);
  if (sfu) {
    for (const v of Object.values(sfu)) {
      push(v);
    }
  }

  const fd = asRecord(root["finalDiagnostic"]);
  const profileSnapshot = fd ? asRecord(fd["profileSnapshot"]) : null;
  if (profileSnapshot) {
    push(profileSnapshot["id"]);
    push(profileSnapshot["label"]);
    push(profileSnapshot["summary"]);
  }

  for (const f of sortedFamilyRecords(context).slice(0, 3)) {
    push(f["id"]);
    push(f["label"]);
  }

  for (const list of [root["affinityScores"], root["topAffinities"], root["buriedCapacities"]]) {
    for (const item of asArray(list)) {
      const r = asRecord(item);
      if (!r) continue;
      push(r["id"]);
      push(r["status"]);
    }
  }

  return parts
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Solo conflictos claros: la frase completa del rule aparece en la superficie de descarte.
 * (Sin heurística por tokens sobre JSON masivo — eso filtraba todas las temáticas.)
 */
function avoidSignalsConflict(theme: GuidedTheme, avoidBlob: string): boolean {
  const rules = theme.avoidIfSignals ?? [];
  if (!avoidBlob || rules.length === 0) return false;

  for (const rule of rules) {
    const phrase = ruleToComparableText(rule);
    if (!phrase || phrase.length < 16) continue;
    if (avoidBlob.includes(phrase)) return true;
  }

  return false;
}

function collectCorePatternFamilyKeys(context: unknown): Set<string> {
  const root = asRecord(context);
  const cp = root?.corePattern;
  if (typeof cp !== "string" || !cp.trim()) return new Set();

  const bucket = new Set<string>();
  addCanonicalKeysFromValue(cp, bucket);
  return bucket;
}

function layerOf(theme: GuidedTheme): GuidedThemeLayer {
  return theme.themeLayer ?? "mother";
}

type Scored = GuidedThemeSuggestion & { _finalScore: number };

function pickDiverseSuggestions(
  ranked: Scored[],
  maxThemes: number,
  ctx: SelectionContext,
): GuidedThemeSuggestion[] {
  const maxPerLayer = 2;
  const count: Record<GuidedThemeLayer, number> = {
    mother: 0,
    subfamily: 0,
    compression_activation: 0,
  };

  const picked: Scored[] = [];
  const used = new Set<string>();

  const layerPriority: GuidedThemeLayer[] = (() => {
    const scored: { layer: GuidedThemeLayer; w: number }[] = [
      { layer: "mother", w: ctx.motherStrong ? 3 : 1 },
      { layer: "subfamily", w: ctx.subfamilyRisk ? 3 : 1 },
      { layer: "compression_activation", w: ctx.compressionStrong ? 3 : 1 },
    ];
    scored.sort((a, b) => b.w - a.w);
    const ordered: GuidedThemeLayer[] = [];
    for (const s of scored) {
      if (!ordered.includes(s.layer)) ordered.push(s.layer);
    }
    for (const l of ["mother", "subfamily", "compression_activation"] as const) {
      if (!ordered.includes(l)) ordered.push(l);
    }
    return ordered;
  })();

  const tryTake = (layer: GuidedThemeLayer): boolean => {
    const next = ranked.find(
      (s) => !used.has(s.theme.id) && layerOf(s.theme) === layer,
    );
    if (!next) return false;
    if (count[layer] >= maxPerLayer) return false;
    picked.push(next);
    used.add(next.theme.id);
    count[layer]++;
    return true;
  };

  let progressed = true;
  while (picked.length < maxThemes && progressed) {
    progressed = false;
    for (const layer of layerPriority) {
      if (picked.length >= maxThemes) break;
      if (tryTake(layer)) progressed = true;
    }
    if (!progressed) {
      for (const layer of [
        "mother",
        "subfamily",
        "compression_activation",
      ] as const) {
        if (tryTake(layer)) {
          progressed = true;
          break;
        }
      }
    }
  }

  for (const s of ranked) {
    if (picked.length >= maxThemes) break;
    if (used.has(s.theme.id)) continue;
    const lyr = layerOf(s.theme);
    if (count[lyr] < maxPerLayer) {
      picked.push(s);
      used.add(s.theme.id);
      count[lyr]++;
    }
  }

  for (const s of ranked) {
    if (picked.length >= maxThemes) break;
    if (used.has(s.theme.id)) continue;
    picked.push(s);
    used.add(s.theme.id);
  }

  picked.sort((a, b) => b._finalScore - a._finalScore);

  return picked.map(({ _finalScore, ...rest }) => ({
    ...rest,
    score: Number(rest.score.toFixed(3)),
  }));
}

export function selectGuidedThemes(
  context: unknown,
  maxThemes = 5,
): GuidedThemeSuggestion[] {
  const familyKeys = new Set(collectFamilyIds(context));
  const affinityKeys = new Set(collectAffinityIds(context));
  const corePatternFamilyKeys = collectCorePatternFamilyKeys(context);
  const avoidBlob = buildAvoidCheckBlob(context);
  const hasCompression = detectCompression(context);
  const ctx = analyzeSelectionContext(context);
  const [topFamId, secondFamId] = topTwoFamilyIds(context);
  const lexicalBlob = ctx.diagnosticBlob;
  const ideaLexHits = countLexicalHits(lexicalBlob, IDEA_OR_SYSTEM_LEXICAL);
  const collectiveLexHits = countLexicalHits(lexicalBlob, COLLECTIVE_THEME_LEXICAL);
  const strainVitalHits = countLexicalHits(lexicalBlob, STRAIN_VITAL_LEXICAL);
  const oneToOneLexHits = countLexicalHits(lexicalBlob, ONE_TO_ONE_THEME_LEXICAL);

  const scored: Scored[] = [];

  for (const theme of guidedThemesMvpV02) {
    if (avoidSignalsConflict(theme, avoidBlob)) {
      continue;
    }

    const coreAffinities = theme.coreAffinities ?? [];
    const supportingAffinities = theme.supportingAffinities ?? [];

    const matchedFamilies = theme.linkedFamilies.filter((familyId) =>
      canonicalMatchKeys(familyId).some((k) => familyKeys.has(k)),
    );

    const matchedCoreAffinities = coreAffinities.filter((affinityId) =>
      canonicalMatchKeys(affinityId).some((k) => affinityKeys.has(k)),
    );

    const matchedSupportingAffinities = supportingAffinities.filter((affinityId) =>
      canonicalMatchKeys(affinityId).some((k) => affinityKeys.has(k)),
    );

    const matchedAffinities = unique([
      ...matchedCoreAffinities,
      ...matchedSupportingAffinities,
    ]);

    let score = 0;
    const reasons: string[] = [];

    if (matchedFamilies.length > 0) {
      score += matchedFamilies.length * 4;
      reasons.push(`Familia vinculada: ${matchedFamilies.join(", ")}`);
    }

    if (matchedCoreAffinities.length > 0) {
      score += matchedCoreAffinities.length * 2.5;
      reasons.push(`Afinidad núcleo: ${matchedCoreAffinities.join(", ")}`);
    }

    if (matchedSupportingAffinities.length > 0) {
      score += matchedSupportingAffinities.length * 1.25;
      reasons.push(`Afinidad de apoyo: ${matchedSupportingAffinities.join(", ")}`);
    }

    if (hasCompression && theme.compressionSensitive) {
      score += 1;
      reasons.push("Compatible con vida comprimida / capacidad enterrada");
    }

    const layer = layerOf(theme);

    if (layer === "mother") {
      if (ctx.motherStrong) {
        score += 2.5;
        reasons.push("Contexto alineado con temática madre (diagnóstico relativamente claro)");
      }
      if (
        corePatternFamilyKeys.size > 0 &&
        theme.linkedFamilies.some((f) =>
          canonicalMatchKeys(f).some((k) => corePatternFamilyKeys.has(k)),
        )
      ) {
        score += 3;
        reasons.push("Familia vinculada coincide con corePattern");
      }
      if (matchedCoreAffinities.length > 0 && ctx.topFamilyConfidence >= 0.5) {
        score += 1;
        reasons.push("Afinidades núcleo visibles en superficie dominante");
      }
    }

    if (layer === "subfamily") {
      if (ctx.subfamilyRisk) {
        score += 3;
        reasons.push(
          "Contexto alineado con subfamilia (segundo perfil cercano, frontera o confianza fina)",
        );
      }
      if (
        topFamId &&
        secondFamId &&
        theme.linkedFamilies.some((f) =>
          canonicalMatchKeys(f).some((k) => k === topFamId),
        ) &&
        theme.linkedFamilies.some((f) =>
          canonicalMatchKeys(f).some((k) => k === secondFamId),
        )
      ) {
        score += 3.5;
        reasons.push("Tema enlaza primera y segunda familia del ranking (traducción fina)");
      }
    }

    if (layer === "compression_activation") {
      if (ctx.resultType === "compressed_life") {
        score += 3.5;
        reasons.push("resultType compressed_life: prioridad compresión/activación");
      } else if (ctx.compressionStrong) {
        score += 2.5;
        reasons.push(
          "Señales de compresión, enterrado/latente o restricciones: prioridad activación",
        );
      }
      if (theme.compressionSensitive && (hasCompression || ctx.compressionStrong)) {
        score += 1.25;
        reasons.push("Tema sensible a compresión con señales presentes");
      }
    }

    if (THEMES_REQUIRING_EXPLICIT_IDEA_OR_SYSTEM.has(theme.id) && ideaLexHits < 2) {
      score *= 0.72;
      reasons.push(
        "Penalización conservadora: la temática apunta a idea o sistema propio, pero el relato no muestra ese foco con suficiente fuerza.",
      );
    }

    if (
      topFamId === "community_builder" &&
      collectiveLexHits >= 6 &&
      matchedFamilies.includes("community_builder") &&
      (layer === "compression_activation" ||
        (theme.compressionSensitive && (hasCompression || ctx.compressionStrong)))
    ) {
      score += 2.35;
      reasons.push(
        "Patrón comunitario repetido en el relato: priorizar sostenibilidad de red y límites frente a temas genéricos de idea propia.",
      );
    }

    if (
      topFamId === "community_builder" &&
      strainVitalHits >= 2 &&
      collectiveLexHits >= 5 &&
      COMMUNITY_COMPRESSION_PRIORITY_IDS.has(theme.id)
    ) {
      score += 2.8;
      reasons.push(
        "Comunidad al frente con cansancio, sequedad o falta de resto: priorizar temas de red con límites y recuperación del impulso colectivo.",
      );
    }

    if (
      topFamId === "community_builder" &&
      strainVitalHits >= 2 &&
      collectiveLexHits >= 5 &&
      theme.linkedFamilies.includes("empathic_guide") &&
      !theme.linkedFamilies.includes("community_builder") &&
      layer !== "compression_activation" &&
      oneToOneLexHits < 2
    ) {
      score *= 0.9;
      reasons.push(
        "Ajuste leve: foco comunitario comprimido sin señales claras uno a uno; evitar que temas de acompañamiento individual encabecen sobre tejido grupal.",
      );
    }

    const priorityWeight =
      typeof theme.priorityWeight === "number" && theme.priorityWeight > 0
        ? theme.priorityWeight
        : 1;
    const finalScore = score * priorityWeight;

    if (finalScore <= 0) continue;

    scored.push({
      theme,
      score: Number(score.toFixed(3)),
      reasons,
      matchedFamilies,
      matchedAffinities,
      _finalScore: finalScore,
    });
  }

  scored.sort((a, b) => b._finalScore - a._finalScore);

  return pickDiverseSuggestions(scored, maxThemes, ctx);
}
