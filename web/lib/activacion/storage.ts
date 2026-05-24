import type { ActivacionCartelId } from "@/lib/content/activacionCatalog";
import {
  getOfficialActivationPath,
  isOfficialActivationPathId,
  type OfficialActivationPathId,
} from "@/lib/content/officialActivationPaths";

const KEY = "vu_activation_choice";

const LEGACY_CARTEL_TO_PATH: Record<ActivacionCartelId, OfficialActivationPathId> = {
  asociarme: "asociarme_con_otras_personas",
  presentar_proyecto: "armar_mi_propio_proyecto",
  oportunidades_laborales: "formarme_en_algo_nuevo",
  explorar_comunidad: "explorar_primero_comunidad",
};

function normalizeStoredChoice(raw: string | null): OfficialActivationPathId | null {
  if (!raw) return null;
  if (isOfficialActivationPathId(raw)) return raw;
  if (
    raw === "presentar_proyecto" ||
    raw === "asociarme" ||
    raw === "oportunidades_laborales" ||
    raw === "explorar_comunidad"
  ) {
    return LEGACY_CARTEL_TO_PATH[raw];
  }
  return null;
}

export function setActivationChoice(id: OfficialActivationPathId | ActivacionCartelId): void {
  if (typeof window === "undefined") return;
  const normalized = normalizeStoredChoice(id) ?? id;
  if (!isOfficialActivationPathId(normalized)) return;
  sessionStorage.setItem(KEY, normalized);
}

export function getActivationChoice(): OfficialActivationPathId | null {
  if (typeof window === "undefined") return null;
  return normalizeStoredChoice(sessionStorage.getItem(KEY));
}

/** Compatibilidad con componentes que aún nombran cartelId. */
export function getActivationChoiceAsLegacyCartel(): ActivacionCartelId | null {
  const path = getActivationChoice();
  if (!path) return null;
  switch (path) {
    case "asociarme_con_otras_personas":
      return "asociarme";
    case "formarme_en_algo_nuevo":
      return "oportunidades_laborales";
    case "integrar_proyectos_existentes":
      return "asociarme";
    case "armar_mi_propio_proyecto":
      return "presentar_proyecto";
    case "explorar_primero_comunidad":
      return "explorar_comunidad";
    default:
      return null;
  }
}

export function clearActivationChoice(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
