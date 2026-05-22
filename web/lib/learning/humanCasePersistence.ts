import { getDurableStoreStatus } from "./humanCaseDurableStore";
import type { PersistHumanCaseResult } from "./humanCaseDepot";

/** Caso listo para revisión humana: Blob verificado o espejo JSONL en entornos sin Blob obligatorio. */
export function isHumanCasePersistedAcknowledged(
  result: Pick<PersistHumanCaseResult, "durable" | "complete" | "extract">,
): boolean {
  if (result.durable.stored && result.durable.verified) return true;

  const status = getDurableStoreStatus();
  if (status.required) return false;

  return result.complete.appended === true && result.extract.appended === true;
}
