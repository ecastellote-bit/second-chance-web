"use client";

import Link from "next/link";
import { VuWarmImage } from "@/components/ui/VuWarmImage";
import type { PerfilUsuario } from "@/lib/content/perfilCatalog";

const DEFAULT_COVER = "/vu/llegada-silenciosa-patio.jpeg";

const AVATAR_SIZE = "h-[88px] w-[88px] sm:h-[96px] sm:w-[96px]";

type Props = {
  profile: PerfilUsuario;
};

/** Cabecera compacta: portada contenida + identidad visible sin scroll excesivo. */
export function PerfilIdentityHeader({ profile }: Props) {
  const hasAvatar = Boolean(profile.avatarUrl);
  const coverSrc = profile.coverUrl ?? DEFAULT_COVER;

  return (
    <header className="relative z-20 shrink-0 overflow-visible bg-[#0B2E59]">
      <div className="grid min-h-0 grid-rows-[minmax(128px,42%)_auto] sm:min-h-[280px] sm:grid-rows-[minmax(140px,1.1fr)_auto]">
        <div className="relative h-[128px] overflow-hidden sm:h-auto sm:min-h-[140px]">
          <VuWarmImage
            src={coverSrc}
            alt=""
            fill
            priority
            className="object-cover object-[center_35%]"
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(11,46,89,0.12) 0%, transparent 45%, rgba(11,46,89,0.35) 100%)",
            }}
          />
        </div>

        <div className="relative overflow-visible bg-[#0B2E59] pb-4">
          <div
            className={`absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-[62%] sm:-translate-y-[65%] ${AVATAR_SIZE}`}
          >
            <span
              className="pointer-events-none absolute -inset-3 rounded-full opacity-75 blur-2xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(198,217,45,0.45) 0%, rgba(26,155,176,0.3) 55%, transparent 72%)",
              }}
              aria-hidden
            />
            {hasAvatar ? (
              <span
                className={`relative block ${AVATAR_SIZE} overflow-hidden rounded-full bg-[#1A9BB0] ring-4 ring-[#F8FAFC] shadow-[0_10px_32px_rgba(0,0,0,0.35)]`}
              >
                <VuWarmImage
                  src={profile.avatarUrl!}
                  alt={`Foto de ${profile.name}`}
                  fill
                  priority
                  className="object-cover object-[center_18%]"
                  sizes="(max-width: 420px) 120px, 160px"
                />
              </span>
            ) : (
              <span
                className={`flex ${AVATAR_SIZE} items-center justify-center rounded-full bg-[#1A9BB0] text-2xl font-extrabold text-white ring-4 ring-[#F8FAFC] shadow-[0_10px_32px_rgba(0,0,0,0.35)]`}
              >
                {profile.initials}
              </span>
            )}
          </div>

          <div className="relative z-20 mx-auto flex w-full max-w-lg flex-col px-4 pt-11 text-center sm:pt-12 lg:text-left">
            <h1 className="text-[1.45rem] font-extrabold leading-[1.15] tracking-[-0.02em] text-white sm:text-[1.75rem]">
              {profile.name?.trim() || "Tu nombre en el barrio"}
            </h1>
            {profile.headline ? (
              <p className="mx-auto mt-1.5 line-clamp-2 max-w-md text-[13px] font-medium leading-snug text-[#DFF4F7] sm:text-[14px] lg:mx-0">
                {profile.headline}
              </p>
            ) : null}
            <p className="mt-2 inline-flex rounded-full border border-[#1A9BB0]/40 bg-[#1A9BB0]/15 px-3 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#C6D92D] sm:text-[10px]">
              Identidad vocacional · no es un CV
            </p>
          </div>
        </div>
      </div>

      <div className="absolute left-0 right-0 top-0 z-40 px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex max-w-lg items-start justify-between">
          <Link
            href="/plaza"
            className="vu-focus flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-[#0B2E59]/45 text-white backdrop-blur-sm lg:hidden"
            aria-label="Volver a la plaza"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <span className="w-11 lg:hidden" aria-hidden />
        </div>
      </div>
    </header>
  );
}
