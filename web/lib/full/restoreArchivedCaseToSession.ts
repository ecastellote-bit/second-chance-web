import type { FinalReading } from "@/lib/types/result";

export function archivedCurrentResultToFinalReading(
  currentResult: Record<string, unknown>,
): FinalReading {
  return currentResult as unknown as FinalReading;
}

export function getGuidedThemesFromResult(
  result: Record<string, unknown> | null | undefined,
): unknown[] {
  if (!result) return [];
  const raw = result._guidedThemes;
  return Array.isArray(raw) ? raw : [];
}
