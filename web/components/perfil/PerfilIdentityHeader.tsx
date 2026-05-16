"use client";

import Link from "next/link";
import { VuWarmImage } from "@/components/ui/VuWarmImage";
import type { PerfilUsuario } from "@/lib/content/perfilCatalog";

type Props = {
  profile: PerfilUsuario;
};

/**
 * Portada + avatar superpuesto: identidad vecinal (no CV).
 * La portada ubica a la persona en el barrio; el círculo muestra el rostro.
 */
export function PerfilIdentityHeader({ profile }: Props) {
  const hasAvatar = Boolean(profile.avatarUrl);
  const hasCover = Boolean(profile.coverUrl);

  return (
    <header className="relative shrink-0 bg-[#0B2E59]">
      <div className="relative h-[min(28vw,132px)] min-h-[112px] w-full overflow-hidden sm:min-h-[128px] sm:max-h-[148px]">
        {hasCover ? (
          <VuWarmImage
            src={profile.coverUrl!}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #0B2E59 0%, #1A9BB0 45%, #0B2E59 100%)",
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,46,89,0.25) 0%, rgba(11,46,89,0.55) 55%, rgba(11,46,89,0.92) 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 100% 0%, rgba(26,155,176,0.45) 0%, transparent 55%)",
          }}
        />
      </div>

      <div className="absolute left-0 right-0 top-0 z-20 px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex max-w-lg items-start justify-between">
          <Link
            href="/plaza"
            className="vu-focus flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-[#0B2E59]/35 text-white backdrop-blur-sm lg:hidden"
            aria-label="Volver a la plaza"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <span className="w-11 lg:hidden" aria-hidden />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-lg px-4 pb-6 pt-0">
        <div className="-mt-12 flex flex-col items-center text-center sm:-mt-14 lg:items-start lg:text-left">
          <div className="relative h-[88px] w-[88px] shrink-0 sm:h-[96px] sm:w-[96px]">
            {hasAvatar ? (
              <span className="relative block h-full w-full overflow-hidden rounded-full bg-[#1A9BB0] ring-4 ring-[#F8FAFC] shadow-[0_8px_28px_rgba(11,46,89,0.35)]">
                <VuWarmImage
                  src={profile.avatarUrl!}
                  alt={`Foto de ${profile.name}`}
                  fill
                  priority
                  className="object-cover object-[center_18%]"
                  sizes="96px"
                />
              </span>
            ) : (
              <span className="flex h-full w-full items-center justify-center rounded-full bg-[#1A9BB0] text-2xl font-bold text-white ring-4 ring-[#F8FAFC] shadow-[0_8px_28px_rgba(11,46,89,0.35)]">
                {profile.initials}
              </span>
            )}
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">{profile.name}</h1>
          <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-[#CBD5E1]">{profile.headline}</p>
          <p className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#C6D92D] backdrop-blur-sm">
            Identidad vocacional · no es un CV
          </p>
        </div>
      </div>
    </header>
  );
}
