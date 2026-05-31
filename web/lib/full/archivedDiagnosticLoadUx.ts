export const ARCHIVED_CASE_FETCH_TIMEOUT_MS = 20_000;

export type ArchivedLoadErrorKind =
  | "not_found"
  | "presentation_missing"
  | "timeout"
  | "load_failed"
  | "unknown";

export function classifyArchivedLoadError(
  message: string,
  options?: { timedOut?: boolean },
): ArchivedLoadErrorKind {
  if (options?.timedOut) return "timeout";
  const normalized = message.trim().toLowerCase();
  if (normalized === "not_found" || normalized.includes("not found")) {
    return "not_found";
  }
  if (normalized === "presentation_missing") return "presentation_missing";
  if (normalized === "timeout" || normalized === "aborted") return "timeout";
  if (normalized === "load_failed" || normalized === "fetch_failed") {
    return "load_failed";
  }
  return "unknown";
}

export type ArchivedLoadFallbackCopy = {
  title: string;
  body: string;
  showArchiveId: boolean;
};

export function getArchivedLoadFallbackCopy(
  kind: ArchivedLoadErrorKind,
  hasArchiveReference: boolean,
): ArchivedLoadFallbackCopy {
  if (kind === "timeout" || kind === "load_failed") {
    return {
      title: hasArchiveReference
        ? "No pudimos cargar tu lectura ahora"
        : "No pudimos abrir tu lectura archivada",
      body: hasArchiveReference
        ? "Tenemos una referencia de lectura, pero no pudimos cargarla ahora. Probá nuevamente en unos minutos o volvé al perfil."
        : "La solicitud tardó demasiado. Podés volver al perfil o iniciar una nueva lectura.",
      showArchiveId: hasArchiveReference,
    };
  }

  if (kind === "presentation_missing") {
    return {
      title: "Tu lectura aún no está lista para abrirse",
      body: "Encontramos un registro asociado, pero todavía no tiene la lectura completa archivada. Podés continuar el diagnóstico o volver al perfil.",
      showArchiveId: true,
    };
  }

  if (kind === "not_found" && hasArchiveReference) {
    return {
      title: "No pudimos abrir tu lectura archivada",
      body: "Tenemos una referencia de lectura, pero no pudimos cargarla ahora. Puede que no esté disponible en este dispositivo o que todavía no haya quedado asociada a tu perfil. Podés volver al perfil o iniciar una nueva lectura.",
      showArchiveId: true,
    };
  }

  return {
    title: "No pudimos abrir tu lectura archivada",
    body: "Puede que esta lectura no esté disponible en este dispositivo o que todavía no haya quedado asociada a tu perfil. Podés volver al perfil o iniciar una nueva lectura.",
    showArchiveId: hasArchiveReference,
  };
}
