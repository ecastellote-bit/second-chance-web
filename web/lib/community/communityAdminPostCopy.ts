import type {
  CommunityAdminPostKind,
  CommunityAdminPostTargetType,
} from "@/lib/learning/communityAdminPosts";

export const ADMIN_POST_KIND_LABEL: Record<CommunityAdminPostKind, string> = {
  update: "Actualización",
  call_for_interest: "Convocatoria",
  question: "Pregunta guía",
  next_step: "Próximo paso",
  need: "Necesidad",
  announcement: "Anuncio",
};

export const ADMIN_POST_TARGET_LABEL: Record<CommunityAdminPostTargetType, string> = {
  founder_project: "Proyecto fundador",
  circle: "Círculo",
  general_barrio: "Barrio general",
};

export const PROJECT_CTA_OPTIONS = [
  { id: "project_interest", label: "Me interesa", anchor: "#project-signals" },
  { id: "project_follow_close", label: "Seguir de cerca", anchor: "#project-signals" },
  { id: "project_possible_contribution", label: "Tal vez podría aportar", anchor: "#project-signals" },
  { id: "guided_contribution", label: "Dejar aporte guiado", anchor: "#guided-contributions" },
] as const;

export const CIRCLE_CTA_OPTIONS = [
  { id: "circle_interest", label: "Me interesa", anchor: "#circle-signals" },
  { id: "circle_receive_updates", label: "Avisarme cuando el círculo se mueva", anchor: "#circle-signals" },
  { id: "circle_access_request", label: "Solicitar acceso", anchor: "#circle-signals" },
  { id: "circle_idea", label: "Tengo una idea", anchor: "#circle-signals" },
] as const;

export function adminPostCtaAnchor(
  targetType: CommunityAdminPostTargetType,
  ctaSignalType?: string | null,
): string | null {
  if (!ctaSignalType) return null;
  const options = targetType === "circle" ? CIRCLE_CTA_OPTIONS : PROJECT_CTA_OPTIONS;
  return options.find((o) => o.id === ctaSignalType)?.anchor ?? null;
}

export function adminPostCtaLabel(
  targetType: CommunityAdminPostTargetType,
  ctaLabel?: string | null,
  ctaSignalType?: string | null,
): string | null {
  if (ctaLabel?.trim()) return ctaLabel.trim();
  if (!ctaSignalType) return null;
  const options = targetType === "circle" ? CIRCLE_CTA_OPTIONS : PROJECT_CTA_OPTIONS;
  return options.find((o) => o.id === ctaSignalType)?.label ?? null;
}
