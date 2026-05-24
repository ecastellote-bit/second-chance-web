import type { ActivacionCartelId } from "@/lib/content/activacionCatalog";
import type { OfficialActivationPathId } from "@/lib/content/officialActivationPaths";
import type { TematicaCard } from "@/lib/content/tematicasCatalog";
import type { ContextualSituationReview } from "@/lib/engines/contextualSituationJudge";

export const CONTEXTUAL_BRIDGE_STORAGE_KEY = "vu_contextual_bridge";

export type ContextualReviewSnapshot = Pick<
  ContextualSituationReview,
  | "summary"
  | "situationFrame"
  | "themeHints"
  | "activationHints"
  | "cautions"
  | "shouldInfluenceGuidedSelection"
>;

export type ParsedThemeHint = {
  themeId: string;
  label: string;
  reason: string;
  fit: "high" | "medium" | "low";
  tematicaId: string | null;
};

export type ParsedActivationHint = {
  path: string;
  reason: string;
  fit: "high" | "medium" | "low";
  pathId: OfficialActivationPathId | null;
  /** @deprecated Usar pathId */
  cartelId: ActivacionCartelId | null;
  label: string;
};

export type TematicaWithContext = TematicaCard & {
  suggested?: boolean;
  hintReason?: string;
  hintFit?: "high" | "medium" | "low";
};

/** Temáticas madre del juez → tarjetas del catálogo MVP */
const GUIDED_THEME_TO_TEMATICA: Record<string, string> = {
  convertir_experiencia_en_relato: "escribir_crear",
  armar_voz_publica_propia: "creatividad_expresion",
  decir_lo_que_otros_no_dicen: "creatividad_expresion",
  construir_algo_con_otros: "construir_otros",
  acompanar_a_alguien_que_esta_perdido: "comunidad_pertenencia",
  acompanar_a_alguien_perdido: "comunidad_pertenencia",
  hacer_funcionar_algo_real: "aprender_nuevo",
  ordenar_un_sistema_desde_adentro: "reordenar_camino",
  explicar_lo_complejo_con_claridad: "aprender_nuevo",
  recuperar_parte_tuya_tapada: "afinidad_dormida",
  llevar_una_idea_propia_a_algo_real: "trabajo_emprendimiento",
  pedir_apoyo_para_una_idea_propia: "construir_otros",
  ordenar_un_quilombo_donde_nadie_se_pone_de_acuerdo: "reordenar_camino",
  sostener_comunidad_sin_secarme: "comunidad_pertenencia",
  volver_a_sentir_parte_de_algo: "comunidad_pertenencia",
};

const ACTIVATION_PATH_ALIASES: Record<string, OfficialActivationPathId> = {
  explorar_primero_la_comunidad: "explorar_primero_comunidad",
  explorar_primero_comunidad: "explorar_primero_comunidad",
  asociarme_con_otras_personas: "asociarme_con_otras_personas",
  formarme_en_algo_nuevo: "formarme_en_algo_nuevo",
  integrar_proyectos_existentes: "integrar_proyectos_existentes",
  armar_mi_propio_proyecto: "armar_mi_propio_proyecto",
};

/** @deprecated Solo compatibilidad visual heredada */
const ACTIVATION_PATH_TO_CARTEL: Record<string, ActivacionCartelId> = {
  explorar_primero_la_comunidad: "explorar_comunidad",
  explorar_primero_comunidad: "explorar_comunidad",
  asociarme_con_otras_personas: "asociarme",
  formarme_en_algo_nuevo: "oportunidades_laborales",
  integrar_proyectos_existentes: "asociarme",
  armar_mi_propio_proyecto: "presentar_proyecto",
};

export const ACTIVATION_PATH_LABELS: Record<string, string> = {
  explorar_primero_la_comunidad: "Explorar primero la comunidad",
  explorar_primero_comunidad: "Explorar primero la comunidad",
  asociarme_con_otras_personas: "Asociarme con otras personas",
  formarme_en_algo_nuevo: "Formarme en algo nuevo",
  integrar_proyectos_existentes: "Integrar proyectos existentes",
  armar_mi_propio_proyecto: "Armar mi propio proyecto",
};

function norm(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function mapGuidedThemeToTematica(themeId: string, label: string, reason: string): string | null {
  if (GUIDED_THEME_TO_TEMATICA[themeId]) {
    return GUIDED_THEME_TO_TEMATICA[themeId];
  }

  const blob = norm(`${themeId} ${label} ${reason}`);

  if (/relato|escribir|crear|narrar|expres/i.test(blob)) {
    return /creatividad|voz publica|comunicar/i.test(blob) ? "creatividad_expresion" : "escribir_crear";
  }
  if (/construir|otros|colectiv|comunidad|pertenencia|grupo/i.test(blob)) {
    return /pertenencia|comunidad|conectar/i.test(blob) ? "comunidad_pertenencia" : "construir_otros";
  }
  if (/sistema|ordenar|camino|proceso|institucional/i.test(blob)) {
    return "reordenar_camino";
  }
  if (/aprender|formar|ensenar|habilidad|tecnica/i.test(blob)) {
    return "aprender_nuevo";
  }
  if (/tapad|dormid|afinidad|recuperar/i.test(blob)) {
    return "afinidad_dormida";
  }
  if (/trabajo|emprend|proyecto propio|idea propia/i.test(blob)) {
    return "trabajo_emprendimiento";
  }
  if (/bienestar|proposito|equilibrio/i.test(blob)) {
    return "bienestar_proposito";
  }
  if (/scroll|real|accion concreta/i.test(blob)) {
    return "salir_scroll";
  }

  return null;
}

function mapActivationPathToOfficialId(path: string): OfficialActivationPathId | null {
  return ACTIVATION_PATH_ALIASES[path] ?? null;
}

function mapActivationPathToCartel(path: string): ActivacionCartelId | null {
  return ACTIVATION_PATH_TO_CARTEL[path] ?? null;
}

function asReview(raw: unknown): ContextualReviewSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const review =
    r.contextualSituationReview ??
    r.contextualSituationJudge ??
    r.contextualReview;
  if (!review || typeof review !== "object") return null;
  return review as ContextualReviewSnapshot;
}

export function extractContextualReviewFromAnalysis(analysis: unknown): ContextualReviewSnapshot | null {
  if (!analysis || typeof analysis !== "object") return null;
  const a = analysis as Record<string, unknown>;
  const reading = a.result ?? a.finalReading ?? a;
  return asReview(reading);
}

export function saveContextualBridge(review: ContextualReviewSnapshot | null): void {
  if (typeof window === "undefined" || !review) return;
  try {
    sessionStorage.setItem(CONTEXTUAL_BRIDGE_STORAGE_KEY, JSON.stringify(review));
  } catch {
    // ignore quota
  }
}

export function loadContextualBridge(): ContextualReviewSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const direct = sessionStorage.getItem(CONTEXTUAL_BRIDGE_STORAGE_KEY);
    if (direct) {
      return JSON.parse(direct) as ContextualReviewSnapshot;
    }
    const full = sessionStorage.getItem("second-chance-full-flow-v2");
    if (full) {
      const parsed = JSON.parse(full) as {
        analysis?: { result?: unknown; finalReading?: unknown };
      };
      const reading = parsed.analysis?.result ?? parsed.analysis?.finalReading;
      return extractContextualReviewFromAnalysis(reading ?? parsed.analysis);
    }
  } catch {
    return null;
  }
  return null;
}

export function parseThemeHints(review: ContextualReviewSnapshot | null): ParsedThemeHint[] {
  if (!review?.themeHints?.length) {
    const legacy = (review as { suggestedThemes?: unknown })?.suggestedThemes;
    if (!Array.isArray(legacy)) return [];
    return legacy
      .map((item) => {
        if (typeof item === "string") {
          return {
            themeId: "",
            label: item,
            reason: item,
            fit: "medium" as const,
            tematicaId: null,
          };
        }
        const o = item as Record<string, unknown>;
        const themeId = String(o.themeId ?? o.id ?? "");
        const label = String(o.label ?? o.theme ?? themeId);
        const reason = String(o.reason ?? label);
        const fit = (o.activationFit ?? o.fit ?? "medium") as ParsedThemeHint["fit"];
        return {
          themeId,
          label,
          reason,
          fit,
          tematicaId: mapGuidedThemeToTematica(themeId, label, reason),
        };
      })
      .filter((h) => h.label || h.reason);
  }

  return review.themeHints.map((hint) => ({
    themeId: hint.themeId,
    label: hint.label,
    reason: hint.reason,
    fit: hint.activationFit,
    tematicaId: mapGuidedThemeToTematica(hint.themeId, hint.label, hint.reason),
  }));
}

export function parseActivationHints(
  review: ContextualReviewSnapshot | null,
): ParsedActivationHint[] {
  if (!review?.activationHints?.length) return [];

  return review.activationHints.map((hint) => ({
    path: hint.path,
    reason: hint.reason,
    fit: hint.fit,
    pathId: mapActivationPathToOfficialId(hint.path),
    cartelId: mapActivationPathToCartel(hint.path),
    label: ACTIVATION_PATH_LABELS[hint.path] ?? hint.path.replace(/_/g, " "),
  }));
}

export function orderTematicasWithContextualHints(
  catalog: TematicaCard[],
  review: ContextualReviewSnapshot | null,
): {
  cards: TematicaWithContext[];
  themeHints: ParsedThemeHint[];
  cautions: string[];
  hasDiagnosticContext: boolean;
} {
  const themeHints = parseThemeHints(review);
  const cautions = review?.cautions ?? [];
  const hasDiagnosticContext = themeHints.length > 0 || Boolean(review?.summary);

  if (!hasDiagnosticContext) {
    return {
      cards: catalog.map((c) => ({ ...c })),
      themeHints: [],
      cautions: [],
      hasDiagnosticContext: false,
    };
  }

  const hintByTematica = new Map<string, ParsedThemeHint>();
  for (const hint of themeHints) {
    if (hint.tematicaId && !hintByTematica.has(hint.tematicaId)) {
      hintByTematica.set(hint.tematicaId, hint);
    }
  }

  const cards: TematicaWithContext[] = catalog.map((card) => {
    const match = hintByTematica.get(card.id);
    return {
      ...card,
      suggested: Boolean(match),
      hintReason: match?.reason,
      hintFit: match?.fit,
      badge: match ? "Sugerida" : card.badge,
    };
  });

  cards.sort((a, b) => {
    if (a.suggested && !b.suggested) return -1;
    if (!a.suggested && b.suggested) return 1;
    const fitOrder = { high: 0, medium: 1, low: 2 };
    const af = a.hintFit ? fitOrder[a.hintFit] : 3;
    const bf = b.hintFit ? fitOrder[b.hintFit] : 3;
    return af - bf;
  });

  return { cards, themeHints, cautions, hasDiagnosticContext: true };
}

export function getActivacionSuggestions(review: ContextualReviewSnapshot | null): {
  hints: ParsedActivationHint[];
  suggestedPathIds: OfficialActivationPathId[];
  /** @deprecated Usar suggestedPathIds */
  suggestedCartelIds: ActivacionCartelId[];
} {
  const hints = parseActivationHints(review);
  const suggestedPathIds = [
    ...new Set(
      hints
        .map((h) => h.pathId)
        .filter((id): id is OfficialActivationPathId => id != null),
    ),
  ];
  const suggestedCartelIds = [
    ...new Set(
      hints
        .map((h) => h.cartelId)
        .filter((id): id is ActivacionCartelId => id != null),
    ),
  ];
  return { hints, suggestedPathIds, suggestedCartelIds };
}
