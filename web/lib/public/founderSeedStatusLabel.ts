/** Etiquetas humanas para estado de semilla fundadora (UI pública). */
export function founderSeedStatusLabel(
  status: string | undefined | null,
): string {
  switch (status) {
    case "pending_review":
      return "En revisión fundadora";
    case "published":
    case "visible":
      return "Visible como semilla";
    case "archived":
      return "Archivado";
    case "draft":
      return "Borrador";
    default:
      return "En revisión fundadora";
  }
}
