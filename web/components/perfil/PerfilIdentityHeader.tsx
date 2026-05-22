"use client";

import Link from "next/link";
import { VuWarmImage } from "@/components/ui/VuWarmImage";
import type { PerfilUsuario } from "@/lib/content/perfilCatalog";

const DEFAULT_COVER = "/vu/llegada-silenciosa-patio.jpeg";

const AVATAR_SIZE = "h-[112px] w-[112px] sm:h-[120px] sm:w-[120px]";

type Props = {
  profile: PerfilUsuario;
};

/**
 * 70% portada · 30% navy (grid con mínimos). Avatar alto; textos sin solape del panel blanco.
 */
export function PerfilIdentityHeader({ profile }: Props) {
  const hasAvatar = Boolean(profile.avatarUrl);
  const coverSrc = profile.coverUrl ?? DEFAULT_COVER;

  return (
    <header className="relative z-20 shrink-0 overflow-visible bg-[#0B2E59]">
      <div className="grid min-h-[400px] grid-rows-[minmax(200px,7fr)_minmax(240px,3fr)] sm:min-h-[440px]">
        {/* ~70% portada */}
        <div className="relative min-h-[200px] overflow-hidden">
          <VuWarmImage
            src={coverSrc}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(11,46,89,0.05) 0%, transparent 55%, rgba(11,46,89,0.25) 85%, rgba(11,46,89,0.7) 100%)",
            }}
          />
        </div>

        {/* ~30% navy — altura garantizada para nombre + headline */}
        <div className="relative overflow-visible bg-[#0B2E59]">
          <div
            className={`absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-[76%] sm:-translate-y-[78%] ${AVATAR_SIZE}`}
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
                className={`relative block ${AVATAR_SIZE} overflow-hidden rounded-full bg-[#1A9BB0] ring-[5px] ring-[#F8FAFC] shadow-[0_14px_48px_rgba(0,0,0,0.45)]`}
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
                className={`flex ${AVATAR_SIZE} items-center justify-center rounded-full bg-[#1A9BB0] text-3xl font-extrabold text-white ring-[5px] ring-[#F8FAFC] shadow-[0_14px_48px_rgba(0,0,0,0.45)]`}
              >
                {profile.initials}
              </span>
            )}
          </div>

          <div className="relative z-20 mx-auto flex w-full max-w-lg flex-col px-4 pb-10 pt-[58px] text-center sm:pt-[62px] lg:text-left">
            <h1 className="text-[1.85rem] font-extrabold leading-[1.12] tracking-[-0.02em] text-white sm:text-[2.125rem]">
              {profile.name?.trim() || "Tu nombre en el barrio"}
            </h1>
            {profile.headline ? (
              <p className="mx-auto mt-2 max-w-md text-[14px] font-medium leading-relaxed text-[#DFF4F7] sm:text-[15px] lg:mx-0">
                {profile.headline}
              </p>
            ) : null}
            <p className="mt-3 inline-flex rounded-full border border-[#1A9BB0]/40 bg-[#1A9BB0]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#C6D92D]">
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
