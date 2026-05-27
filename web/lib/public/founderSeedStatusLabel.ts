import type { FounderProjectSeedStatus } from "@/lib/learning/founderProjectSeeds";

/** Etiquetas humanas para estado de semilla fundadora (UI pública). */
export function founderSeedStatusLabel(
  status: string | undefined | null,
): string {
  const value = status ?? "";
  if (value === "pending_review") return "En revisión fundadora";
  if (value === "published" || value === "visible") return "Visible en el barrio";
  if (value === "hidden") return "Oculto en el barrio";
  if (value === "archived") return "Archivado";
  if (value === "draft") return "Borrador";
  return "En revisión fundadora";
}

export function founderSeedStatusHint(status: string | undefined | null): string {
  const value = status ?? "";
  if (value === "pending_review") {
    return "Tu semilla está guardada. El equipo fundador la revisa antes de mostrarla en el barrio.";
  }
  if (value === "published" || value === "visible") {
    return "Este proyecto ya puede verse en el barrio. Todavía no hay contacto automático con vos.";
  }
  if (value === "hidden") {
    return "Tu proyecto está pausado y no aparece en el listado público del barrio.";
  }
  return "Tu semilla está guardada para revisión fundadora.";
}
