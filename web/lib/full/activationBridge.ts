import type { ActivacionCartelId } from "@/lib/content/activacionCatalog";

/** Puente entre activación del diagnóstico (/full/themes) y carteles de la plaza. */
export function mapGuidedActivationToCartel(
  activationPathId: string | undefined,
): ActivacionCartelId {
  switch (activationPathId) {
    case "armar_mi_propio_proyecto":
    case "integrar_proyectos_existentes":
      return "presentar_proyecto";
    case "asociarme_con_otras_personas":
      return "asociarme";
    case "formarme_en_algo_nuevo":
      return "explorar_comunidad";
    case "explorar_primero_comunidad":
    default:
      return "explorar_comunidad";
  }
}
