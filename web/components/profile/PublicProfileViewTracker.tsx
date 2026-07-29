"use client";

import { useEffect } from "react";
import { trackMetaEventOnce } from "@/lib/analytics/trackMetaEvent";
import { getCachedUserId } from "@/lib/users/activeUserSession";

type Props = {
  profileUserId: string;
  profileSlug: string;
  displayName: string;
};

/**
 * ViewContent al visitar un perfil público ajeno (no el propio).
 */
export function PublicProfileViewTracker({
  profileUserId,
  profileSlug,
  displayName,
}: Props) {
  useEffect(() => {
    const visitorId = getCachedUserId();
    if (visitorId && visitorId === profileUserId) return;

    const slugKey = profileSlug || profileUserId;
    trackMetaEventOnce(`vu_meta_view_content_profile_${slugKey}`, "ViewContent", {
      content_name: displayName,
      content_ids: [slugKey],
      content_type: "profile",
      content_category: "public_profile",
    });
  }, [profileUserId, profileSlug, displayName]);

  return null;
}
