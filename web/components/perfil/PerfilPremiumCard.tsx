import Link from "next/link";
import { PerfilChips, PerfilSection } from "@/components/perfil/PerfilSection";
import { VuWarmImage } from "@/components/ui/VuWarmImage";
import type { PublicProfileView } from "@/lib/users/userProfileTypes";
import { initialsFromName } from "@/lib/users/userProfileTypes";

const DEFAULT_COVER = "/vu/llegada-silenciosa-patio.jpeg";

type Props = {
  profile: PublicProfileView;
  /** preview = el dueño ve su tarjeta antes de publicar en el directorio */
  mode?: "public" | "preview";
  previewNotice?: string | null;
};

function locationLabel(profile: PublicProfileView): string | null {
  const city = profile.city?.trim();
  const country = profile.country?.trim();
  if (city && country) return `${city}, ${country}`;
  return city || country || null;
}

export function PerfilPremiumCard({
  profile,
  mode = "public",
  previewNotice,
}: Props) {
  const coverSrc = profile.coverUrl ?? DEFAULT_COVER;
  const location = locationLabel(profile);

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] font-[family-name:var(--font-inter)] text-[#243647]">
      <div className="premium-card-enter mx-auto max-w-xl pb-10">
        {previewNotice ? (
          <div
            className="premium-banner-enter mx-4 mt-[max(0.75rem,env(safe-area-inset-top))] rounded-2xl border border-[#C6D92D]/40 bg-[#0B2E59] px-4 py-3 text-center text-[13px] leading-relaxed text-[#DFF4F7] shadow-[0_8px_24px_rgba(11,46,89,0.18)]"
            role="status"
          >
            {previewNotice}
          </div>
        ) : null}

        <article className="mt-4 overflow-hidden rounded-[28px] bg-white shadow-[0_12px_40px_rgba(11,46,89,0.12)] ring-1 ring-[#E8EEF3] sm:mx-4">
          <div className="relative h-[180px] overflow-hidden sm:h-[220px]">
            <VuWarmImage
              src={coverSrc}
              alt=""
              fill
              priority
              className="object-cover object-[center_35%] transition-transform duration-700 ease-out hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, 576px"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(11,46,89,0.08) 0%, rgba(11,46,89,0.55) 100%)",
              }}
            />
            {mode === "public" ? (
              <div className="absolute left-4 top-4">
                <Link
                  href="/community/conectar_con_otros"
                  className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#0B2E59] shadow-sm backdrop-blur-sm transition hover:bg-white"
                >
                  VocationUp Connect
                </Link>
              </div>
            ) : null}
          </div>

          <div className="relative px-5 pb-6 pt-0">
            <div className="-mt-14 flex flex-col items-center text-center sm:-mt-16">
              <div className="relative">
                <span
                  className="pointer-events-none absolute -inset-3 rounded-full opacity-80 blur-2xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(198,217,45,0.5) 0%, rgba(26,155,176,0.25) 55%, transparent 72%)",
                  }}
                  aria-hidden
                />
                <span className="relative block h-[104px] w-[104px] overflow-hidden rounded-full bg-[#1A9BB0] ring-4 ring-white shadow-[0_12px_32px_rgba(11,46,89,0.22)] sm:h-[112px] sm:w-[112px]">
                  <VuWarmImage
                    src={profile.avatarUrl}
                    alt={`Foto de ${profile.displayName}`}
                    fill
                    priority
                    className="object-cover object-[center_18%]"
                    sizes="112px"
                  />
                </span>
              </div>

              <h1 className="mt-4 text-[1.65rem] font-extrabold leading-tight tracking-[-0.02em] text-[#0B2E59] sm:text-[1.85rem]">
                {profile.displayName}
              </h1>

              {profile.headline ? (
                <p className="mt-2 max-w-md text-[15px] font-medium leading-snug text-[#6B7A8C]">
                  {profile.headline}
                </p>
              ) : null}

              {location ? (
                <p className="mt-2 text-[13px] font-semibold text-[#1A9BB0]">{location}</p>
              ) : null}

              {profile.familiaLabel ? (
                <p className="mt-3 inline-flex rounded-full border border-[#1A9BB0]/35 bg-[#1A9BB0]/10 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#0B2E59]">
                  {profile.familiaLabel}
                </p>
              ) : null}
            </div>

            {profile.bio ? (
              <div className="premium-section-enter mt-6 rounded-2xl bg-[#F8FAFC] px-4 py-4 text-[15px] leading-relaxed text-[#243647]">
                {profile.bio}
              </div>
            ) : null}

            <div className="premium-section-enter mt-5 space-y-4">
              <PerfilSection title="Mi momento actual">
                <p className="text-[15px] leading-relaxed text-[#6B7A8C]">
                  {profile.momentoActual}
                </p>
              </PerfilSection>

              <PerfilSection title="Estoy buscando" hint="Lo que quiere encontrar en el barrio">
                <PerfilChips
                  items={profile.buscando.map((label, index) => ({
                    id: `buscando-${index}`,
                    label,
                  }))}
                  variant="lime"
                />
              </PerfilSection>

              <PerfilSection title="Puedo aportar" hint="Lo que ofrece a otros">
                <PerfilChips
                  items={profile.aportar.map((label, index) => ({
                    id: `aportar-${index}`,
                    label,
                  }))}
                  variant="navy"
                />
              </PerfilSection>
            </div>

            <p className="premium-section-enter mt-6 text-center text-[11px] leading-relaxed text-[#6B7A8C]">
              Perfil vocacional en VocationUp — identidad en camino, no un CV.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}

/** Fallback cuando falta avatar en datos legacy (no debería ocurrir en vista pública válida). */
export function PerfilPremiumCardFallback({
  displayName,
}: {
  displayName: string;
}) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-[#F8FAFC] text-[#6B7A8C]">
      <span className="flex h-24 w-24 items-center justify-center rounded-full bg-[#1A9BB0] text-2xl font-bold text-white">
        {initialsFromName(displayName)}
      </span>
    </div>
  );
}
