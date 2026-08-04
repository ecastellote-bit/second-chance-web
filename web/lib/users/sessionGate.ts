import { findUserProfileById } from "./userProfileStore";
import {
  isCommunityEmailReady,
  isUserProfileComplete,
  type VuUserProfileRecord,
} from "./userProfileTypes";

/**
 * Razones finas del gate (cliente + API).
 * Compat: community_profile_required cubre profile_missing + profile_incomplete en clientes viejos.
 */
export type SessionGateReason =
  | "ready"
  | "no_local_identity"
  | "profile_missing"
  | "profile_incomplete"
  | "email_missing";

export type SessionGateResult = {
  reason: SessionGateReason;
  allowed: boolean;
  /** Código legacy para APIs de acción comunitaria */
  apiError:
    | null
    | "user_id_required"
    | "community_profile_required"
    | "community_email_required";
  profile: VuUserProfileRecord | null;
};

export async function resolveSessionGate(
  userId: string | null | undefined,
): Promise<SessionGateResult> {
  const id = userId?.trim() ?? "";
  if (!id) {
    return {
      reason: "no_local_identity",
      allowed: false,
      apiError: "user_id_required",
      profile: null,
    };
  }

  const profile = await findUserProfileById(id);
  if (!profile) {
    return {
      reason: "profile_missing",
      allowed: false,
      apiError: "community_profile_required",
      profile: null,
    };
  }

  if (!isUserProfileComplete(profile)) {
    return {
      reason: "profile_incomplete",
      allowed: false,
      apiError: "community_profile_required",
      profile,
    };
  }

  if (!isCommunityEmailReady(profile)) {
    return {
      reason: "email_missing",
      allowed: false,
      apiError: "community_email_required",
      profile,
    };
  }

  return {
    reason: "ready",
    allowed: true,
    apiError: null,
    profile,
  };
}
