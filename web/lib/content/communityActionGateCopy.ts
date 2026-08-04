import type { CommunityActionDenyReason } from "@/lib/users/assertCommunityActionAllowed";
import { PROFILE_FLOW_COPY } from "@/lib/content/profileFlowCopy";

export const COMMUNITY_ACTION_GATE_COPY = {
  title: PROFILE_FLOW_COPY.gate.title,
  body: PROFILE_FLOW_COPY.emailMissing.body,
  ctaComplete: "Completar perfil",
  ctaBack: "Volver",
  checking: "Verificando tu lugar en el barrio…",
} as const;

/** Mensaje legible en toasts/clientes de API según código de denegación. */
export function communityActionClientError(code: string | undefined): string {
  if (code === "community_email_required") {
    return `${PROFILE_FLOW_COPY.emailMissing.title}. ${PROFILE_FLOW_COPY.emailMissing.body}`;
  }
  if (code === "community_profile_required") {
    return `${PROFILE_FLOW_COPY.gate.title}. ${PROFILE_FLOW_COPY.gate.body}`;
  }
  if (code === "user_id_required") {
    return `${PROFILE_FLOW_COPY.identityMissing.title}. ${PROFILE_FLOW_COPY.identityMissing.body}`;
  }
  return "";
}

export function communityGateTitleForReason(
  reason: string,
): string {
  if (reason === "email_missing") return PROFILE_FLOW_COPY.emailMissing.title;
  if (reason === "profile_incomplete") {
    return PROFILE_FLOW_COPY.profileIncomplete.title;
  }
  if (reason === "no_local_identity" || reason === "profile_missing") {
    return PROFILE_FLOW_COPY.identityMissing.title;
  }
  return PROFILE_FLOW_COPY.gate.title;
}

export function isCommunityGateDeny(
  code: string | undefined,
): code is CommunityActionDenyReason {
  return (
    code === "user_id_required" ||
    code === "community_profile_required" ||
    code === "community_email_required"
  );
}
