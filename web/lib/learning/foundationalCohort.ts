/** Identificador del batch fundacional (30–40 pioneros). */
export const DEFAULT_FOUNDATIONAL_COHORT = "foundational_wave_2026_05";

export function getFoundationalCohortBatch(): string {
  if (typeof window !== "undefined") {
    const fromPublic = process.env.NEXT_PUBLIC_FOUNDATIONAL_COHORT_BATCH?.trim();
    if (fromPublic) return fromPublic;
  }
  return (
    process.env.NEXT_PUBLIC_FOUNDATIONAL_COHORT_BATCH?.trim() ||
    process.env.FOUNDATIONAL_COHORT_BATCH?.trim() ||
    DEFAULT_FOUNDATIONAL_COHORT
  );
}

export function buildFoundationalClientMeta(
  extra?: Record<string, unknown>,
): NonNullable<import("./humanCaseDepot").HumanCasePayload["clientMeta"]> {
  return {
    cohortBatch: getFoundationalCohortBatch(),
    flow: "full_vocationup",
    ...extra,
  };
}

export function getCohortBatchFromPayload(
  payload: import("./humanCaseDepot").HumanCasePayload | undefined,
): string | null {
  const batch = payload?.clientMeta?.cohortBatch;
  return typeof batch === "string" && batch.trim() ? batch.trim() : null;
}
