import { getDurableStoreStatus } from "./humanCaseDurableStore";
import type { PersistHumanCaseResult } from "./humanCaseDepot";

/** Caso persistido en almacén durable: write aceptado por Blob (verified indica confirmación de lectura). */
export function isHumanCasePersistedAcknowledged(
  result: Pick<PersistHumanCaseResult, "durable" | "complete" | "extract">,
): boolean {
  if (result.durable.stored) return true;

  const status = getDurableStoreStatus();
  if (status.required) return false;

  return result.complete.appended === true && result.extract.appended === true;
}
