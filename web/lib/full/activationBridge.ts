import type { OfficialActivationPathId } from "@/lib/content/officialActivationPaths";

/** Puente entre activación del diagnóstico (/full/themes) y elección guardada en sesión. */
const OFFICIAL_PATHS: OfficialActivationPathId[] = [
  "asociarme_con_otras_personas",
  "formarme_en_algo_nuevo",
  "integrar_proyectos_existentes",
  "armar_mi_propio_proyecto",
  "explorar_primero_comunidad",
];

export function mapGuidedActivationToStoredPath(
  activationPathId: string | undefined,
): OfficialActivationPathId {
  if (
    activationPathId &&
    OFFICIAL_PATHS.includes(activationPathId as OfficialActivationPathId)
  ) {
    return activationPathId as OfficialActivationPathId;
  }
  return "explorar_primero_comunidad";
}

/** @deprecated Usar mapGuidedActivationToStoredPath */
export function mapGuidedActivationToCartel(
  activationPathId: string | undefined,
): OfficialActivationPathId {
  return mapGuidedActivationToStoredPath(activationPathId);
}
