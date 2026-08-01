"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PerfilPreviewMode } from "@/components/perfil/PerfilPreviewMode";
import { PerfilUsuarioView } from "@/components/perfil/PerfilUsuarioView";
import { PerfilVisibilityPanel } from "@/components/perfil/PerfilVisibilityPanel";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  fetchUserProfile,
  getOrCreateUserId,
  markProfileComplete,
} from "@/lib/users/activeUserSession";
import { userProfileToPerfilView } from "@/lib/users/profileToPerfilView";
import {
  isUserProfileComplete,
  type UserProfileClientView,
} from "@/lib/users/userProfileTypes";

type ViewMode = "owner" | "preview";

export function PerfilPageLoader() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileClientView | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("owner");

  useEffect(() => {
    let cancelled = false;

    fetchUserProfile(getOrCreateUserId()).then((p) => {
      if (cancelled) return;
      if (!isUserProfileComplete(p)) {
        router.replace("/perfil/crear");
        return;
      }
      setProfile(p);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  function handleProfileUpdated(updated: UserProfileClientView) {
    markProfileComplete(updated);
    setProfile(updated);
  }

  if (loading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#F8FAFC] text-sm text-[#6B7A8C]">
        Cargando tu perfil…
      </main>
    );
  }

  if (!profile) return null;

  return (
    <>
      <div className="fixed left-0 right-0 top-[max(0.5rem,env(safe-area-inset-top))] z-50 px-4">
        <div className="mx-auto flex max-w-[800px] flex-wrap items-center justify-center gap-2">
          <div className="flex rounded-full bg-white/95 p-1 shadow-md ring-1 ring-[#E8EEF3]">
            <button
              type="button"
              onClick={() => setViewMode("owner")}
              className={`min-h-[48px] rounded-full px-5 text-sm font-bold transition ${
                viewMode === "owner"
                  ? "bg-[#0B2E59] text-white"
                  : "text-[#0B2E59] hover:bg-[#F8FAFC]"
              }`}
            >
              Mi perfil
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`min-h-[48px] rounded-full px-5 text-sm font-bold transition ${
                viewMode === "preview"
                  ? "bg-[#0B2E59] text-white"
                  : "text-[#0B2E59] hover:bg-[#F8FAFC]"
              }`}
            >
              Cómo me ven otros
            </button>
          </div>

          {viewMode === "owner" ? (
            <Link
              href="/perfil/editar"
              className="inline-flex min-h-[48px] items-center rounded-full bg-white/95 px-5 text-sm font-bold text-[#0B2E59] shadow-md ring-1 ring-[#E8EEF3]"
            >
              Editar perfil
            </Link>
          ) : null}

          <div className="rounded-full bg-white/95 shadow-md ring-1 ring-[#E8EEF3]">
            <NotificationBell />
          </div>
        </div>
      </div>

      <div className="pb-8 pt-[max(4.5rem,calc(env(safe-area-inset-top)+3.5rem))]">
        <div className="mx-auto max-w-[800px] px-4">
          <PerfilVisibilityPanel
            profile={profile}
            onProfileUpdated={handleProfileUpdated}
          />
        </div>

        {viewMode === "owner" ? (
          <div className="mt-6">
            <PerfilUsuarioView
              profile={userProfileToPerfilView(profile)}
              profileRecord={profile}
            />
          </div>
        ) : (
          <div className="mx-auto mt-6 max-w-[800px] px-4">
            <PerfilPreviewMode profile={profile} />
          </div>
        )}
      </div>
    </>
  );
}
