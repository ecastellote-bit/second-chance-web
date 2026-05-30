export const COMMUNITY_ACTION_GATE_COPY = {
  title: "Completá tu perfil para seguir",
  body: "Necesitamos un correo para avisarte si esta acción genera un próximo paso. No se muestra públicamente ni abre contacto directo.",
  ctaComplete: "Completar perfil",
  ctaBack: "Volver",
  checking: "Verificando tu perfil…",
} as const;

export function communityActionClientError(code: string | undefined): string {
  if (code === "community_email_required" || code === "community_profile_required") {
    return `${COMMUNITY_ACTION_GATE_COPY.title}. ${COMMUNITY_ACTION_GATE_COPY.body}`;
  }
  return "";
}
