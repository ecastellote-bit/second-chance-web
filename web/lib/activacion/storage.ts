import type { ActivacionCartelId } from "@/lib/content/activacionCatalog";

const KEY = "vu_activation_choice";

export function setActivationChoice(id: ActivacionCartelId): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, id);
}

export function getActivationChoice(): ActivacionCartelId | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (
    raw === "presentar_proyecto" ||
    raw === "asociarme" ||
    raw === "oportunidades_laborales" ||
    raw === "explorar_comunidad"
  ) {
    return raw;
  }
  return null;
}

export function clearActivationChoice(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
