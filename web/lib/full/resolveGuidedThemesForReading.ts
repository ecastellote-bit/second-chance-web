import {
  selectGuidedThemes,
  type GuidedThemeSuggestion,
} from "@/lib/engines/guidedThemeSelector";
import { sanitizePublicThemeCopy } from "@/lib/content/sanitizePublicThemeCopy";
import { getGuidedThemesFromResult } from "@/lib/full/restoreArchivedCaseToSession";

export type GuidedThemeOption = {
  id: string;
  shortLabel: string;
  userFacingText: string;
  layer?: string;
  score: number;
  activationPaths: string[];
};

export type GuidedThemesResolveSource = "stored" | "regenerated" | "none";

function hasDiagnosticReading(result: Record<string, unknown> | null | undefined): boolean {
  if (!result) return false;

  const pres = result.personalizedPresentation as Record<string, unknown> | undefined;
  const lectura = pres?.lecturaCentral as Record<string, unknown> | undefined;
  if (
    typeof lectura?.sentenciaRevelacion === "string" &&
    lectura.sentenciaRevelacion.trim()
  ) {
    return true;
  }
  if (typeof lectura?.resumen === "string" && lectura.resumen.trim()) {
    return true;
  }
  if (typeof result.corePattern === "string" && result.corePattern.trim()) {
    return true;
  }
  if (
    typeof result.displayedMainDirection === "string" &&
    result.displayedMainDirection.trim()
  ) {
    return true;
  }

  return false;
}

function mapSuggestion(suggestion: GuidedThemeSuggestion): GuidedThemeOption {
  return {
    id: suggestion.theme.id,
    shortLabel: suggestion.theme.shortLabel,
    userFacingText: sanitizePublicThemeCopy(suggestion.theme.userFacingText),
    layer: suggestion.theme.themeLayer,
    score: suggestion.score,
    activationPaths: suggestion.theme.suggestedActivationPaths,
  };
}

function mapStoredTheme(raw: unknown): GuidedThemeOption | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = typeof item.id === "string" ? item.id.trim() : "";
  const shortLabel = typeof item.shortLabel === "string" ? item.shortLabel.trim() : "";
  const userFacingText =
    typeof item.userFacingText === "string" ? item.userFacingText.trim() : "";
  if (!id || !shortLabel) return null;

  return {
    id,
    shortLabel,
    userFacingText: sanitizePublicThemeCopy(userFacingText || shortLabel),
    layer: typeof item.layer === "string" ? item.layer : undefined,
    score: typeof item.score === "number" ? item.score : 0,
    activationPaths: Array.isArray(item.activationPaths)
      ? (item.activationPaths as string[])
      : [],
  };
}

/** Temáticas guardadas o regeneradas desde la lectura (sin tocar el motor diagnóstico). */
export function resolveGuidedThemesForReading(
  result: Record<string, unknown> | null | undefined,
  maxThemes = 5,
): { themes: GuidedThemeOption[]; source: GuidedThemesResolveSource } {
  const stored = getGuidedThemesFromResult(result)
    .map(mapStoredTheme)
    .filter((item): item is GuidedThemeOption => item != null);

  if (stored.length > 0) {
    return { themes: stored, source: "stored" };
  }

  if (!hasDiagnosticReading(result)) {
    return { themes: [], source: "none" };
  }

  const regenerated = selectGuidedThemes(result, maxThemes).map(mapSuggestion);
  if (regenerated.length > 0) {
    return { themes: regenerated, source: "regenerated" };
  }

  return { themes: [], source: "none" };
}
